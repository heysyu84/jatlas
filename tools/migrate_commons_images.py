# Migration revision: 2026-10-01 content-audit batch v2
#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import re
import time
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.parse import unquote, quote

import requests
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
OUT = DIST / "images" / "commons"
MANIFEST = DIST / "commons-local-images.js"
REPORT = DIST / "image-migration-report.json"
INDEX = DIST / "index.html"

API = "https://commons.wikimedia.org/w/api.php"
HEADERS = {
    "User-Agent": "Jatlas-image-migrator/1.0 (https://github.com/heysyu84/jatlas)"
}
EXT_RE = re.compile(r"\.(?:jpe?g|png|webp)$", re.I)

def normal_file_name(name: str) -> str:
    name = unquote(name).strip()
    if name.lower().startswith("file:"):
        name = name[5:]
    return name.replace("_", " ") if "/" not in name else name

def collect_filenames(text: str) -> set[str]:
    out: set[str] = set()

    # Commons file-page references are authoritative.
    for m in re.finditer(r"https://commons\.wikimedia\.org/wiki/File:([^'\"<>\s]+)", text):
        out.add(normal_file_name(m.group(1)))

    # Explicit Special:FilePath URLs.
    for m in re.finditer(r"https://commons\.wikimedia\.org/wiki/Special:FilePath/([^?'\"<>\s]+)", text):
        out.add(normal_file_name(m.group(1)))

    # Static filename maps used by expansion files. Do not scan arbitrary local .webp names.
    for var in ("photoFiles", "foodPhotoFiles"):
        for m in re.finditer(rf"const\s+{var}\s*=\s*(\{{.*?\}});", text, re.S):
            body = m.group(1)
            for q in re.finditer(r"['\"]([^'\"\n]+?\.(?:jpe?g|png))['\"]", body, re.I):
                value = q.group(1).strip().replace("\\'", "'")
                if value.startswith(("http://", "https://", "images/")):
                    continue
                out.add(normal_file_name(value))

    return {x for x in out if EXT_RE.search(x)}

_rate_lock = threading.Lock()
_last_request = 0.0
_MIN_INTERVAL = 1.10

def _throttle() -> None:
    global _last_request
    with _rate_lock:
        now = time.monotonic()
        wait = _MIN_INTERVAL - (now - _last_request)
        if wait > 0:
            time.sleep(wait)
        _last_request = time.monotonic()

def save_commons_webp(filename: str, path: Path) -> tuple[bool, str | None]:
    tmp = path.with_suffix(".download")
    url = "https://commons.wikimedia.org/wiki/Special:FilePath/" + quote(filename, safe="") + "?width=1200"
    session = requests.Session()
    for attempt in range(7):
        try:
            _throttle()
            r = session.get(url, headers=HEADERS, timeout=60, allow_redirects=True)
            if r.status_code in (429, 502, 503, 504):
                retry = r.headers.get("Retry-After")
                delay = float(retry) if retry and retry.isdigit() else min(30.0, 1.5 * (2 ** attempt))
                time.sleep(delay)
                continue
            r.raise_for_status()
            ctype = (r.headers.get("Content-Type") or "").lower()
            if "image/" not in ctype:
                return False, f"not an image ({r.status_code}, {ctype or 'unknown content-type'})"
            tmp.write_bytes(r.content)
            with Image.open(tmp) as im:
                im = ImageOps.exif_transpose(im)
                if getattr(im, "is_animated", False):
                    im.seek(0)
                if im.mode not in ("RGB", "RGBA"):
                    im = im.convert("RGBA" if "A" in im.getbands() else "RGB")
                im.thumbnail((1400, 1400), Image.Resampling.LANCZOS)
                path.parent.mkdir(parents=True, exist_ok=True)
                im.save(path, "WEBP", quality=82, method=6)
            tmp.unlink(missing_ok=True)
            return True, None
        except Exception as e:
            if attempt == 6:
                tmp.unlink(missing_ok=True)
                return False, str(e)
            time.sleep(min(30.0, 1.5 * (2 ** attempt)))
    tmp.unlink(missing_ok=True)
    return False, "retry limit reached"

def local_name(filename: str) -> str:
    digest = hashlib.sha1(filename.encode("utf-8")).hexdigest()[:16]
    return f"images/commons/{digest}.webp"

def replace_special_urls(text: str, mapping: dict[str, str]) -> str:
    pat = re.compile(r"https://commons\.wikimedia\.org/wiki/Special:FilePath/([^?'\"<>\s]+)(?:\?width=\d+)?")
    def repl(m):
        fn = normal_file_name(m.group(1))
        return mapping.get(fn, m.group(0))
    return pat.sub(repl, text)

def rewrite_cf(text: str) -> str:
    # Keep an online fallback only for files which could not be localized.
    pat = re.compile(
        r"const cf=f=>'https://commons\.wikimedia\.org/wiki/Special:FilePath/'\+encodeURIComponent\(f\)\+'\?width=(\d+)';"
    )
    def repl(m):
        width = m.group(1)
        return (
            "const cf=f=>(globalThis.JATLAS_COMMONS_LOCAL&&globalThis.JATLAS_COMMONS_LOCAL[f])||"
            f"('https://commons.wikimedia.org/wiki/Special:FilePath/'+encodeURIComponent(f)+'?width={width}');"
        )
    return pat.sub(repl, text)

def rewrite_upload_overrides(text: str) -> str:
    # These overrides were added as emergency hotlinks. Once cf() is local-first,
    # keeping them would defeat the migration.
    return re.sub(
        r"\n?photos\[['\"][^'\"]+['\"]\]\.src=['\"]https://upload\.wikimedia\.org/[^'\"]+['\"]\s*;",
        "",
        text,
    )

def rewrite_explicit_src_from_source(text: str, mapping: dict[str, str]) -> str:
    # JSON-ish objects where src is remote and source points to a Commons file page.
    pat = re.compile(
        r"(?P<srcprefix>(?:[\"']?src[\"']?\s*:\s*)[\"'])"
        r"(?P<src>https?://[^\"']+)"
        r"(?P<srcend>[\"'])"
        r"(?P<middle>.{0,900}?)"
        r"(?P<sourceprefix>(?:[\"']?source[\"']?\s*:\s*)[\"']https://commons\.wikimedia\.org/wiki/File:)"
        r"(?P<file>[^\"']+)"
        r"(?P<sourceend>[\"'])",
        re.S,
    )
    def repl(m):
        fn = normal_file_name(m.group("file"))
        local = mapping.get(fn)
        if not local:
            return m.group(0)
        return (
            m.group("srcprefix") + local + m.group("srcend") +
            m.group("middle") + m.group("sourceprefix") + m.group("file") + m.group("sourceend")
        )
    return pat.sub(repl, text)

def external_srcs(text: str) -> list[str]:
    urls = []
    for m in re.finditer(r"(?:[\"']?src[\"']?\s*:\s*)[\"'](https?://[^\"']+)[\"']", text):
        urls.append(m.group(1))
    return urls

def main() -> None:
    js_files = sorted(DIST.glob("*.js"))
    file_to_filenames: dict[Path, set[str]] = {}
    all_files: set[str] = set()

    for path in js_files:
        text = path.read_text(encoding="utf-8")
        names = collect_filenames(text)
        if names:
            file_to_filenames[path] = names
            all_files.update(names)

    mapping: dict[str, str] = {}
    failed: list[dict] = []
    downloaded = 0
    reused = 0

    OUT.mkdir(parents=True, exist_ok=True)

    def process_one(filename: str):
        rel = local_name(filename)
        dest = DIST / rel
        if dest.exists() and dest.stat().st_size > 100:
            return ("reused", filename, rel, None)
        ok, err = save_commons_webp(filename, dest)
        if ok:
            return ("downloaded", filename, rel, None)
        return ("failed", filename, None, err or "download/convert failed")

    names = sorted(all_files)
    with ThreadPoolExecutor(max_workers=1) as pool:
        futures = [pool.submit(process_one, filename) for filename in names]
        for idx, future in enumerate(as_completed(futures), 1):
            status, filename, rel, err = future.result()
            if status == "reused":
                mapping[filename] = rel
                reused += 1
            elif status == "downloaded":
                mapping[filename] = rel
                downloaded += 1
            else:
                failed.append({"file": filename, "reason": err})
            if idx % 50 == 0 or idx == len(names):
                print(f"processed {idx}/{len(names)}; localized={len(mapping)} failed={len(failed)}", flush=True)

    # Also allow underscore spellings to resolve to the same local file.
    manifest_map: dict[str, str] = {}
    for filename, rel in mapping.items():
        manifest_map[filename] = rel
        manifest_map[filename.replace(" ", "_")] = rel

    MANIFEST.write_text(
        "globalThis.JATLAS_COMMONS_LOCAL=Object.assign(globalThis.JATLAS_COMMONS_LOCAL||{},"
        + json.dumps(manifest_map, ensure_ascii=False, separators=(",", ":"))
        + ");\n",
        encoding="utf-8",
    )

    changed_files = []
    unresolved_external: dict[str, list[str]] = {}

    for path in js_files:
        text = path.read_text(encoding="utf-8")
        original = text
        text = rewrite_cf(text)
        text = rewrite_upload_overrides(text)
        text = replace_special_urls(text, mapping)
        text = rewrite_explicit_src_from_source(text, mapping)
        if text != original:
            path.write_text(text, encoding="utf-8")
            changed_files.append(path.name)
        remain = external_srcs(text)
        if remain:
            unresolved_external[path.name] = sorted(set(remain))

    # Make sure the manifest is available before any prefecture data scripts run.
    index_text = INDEX.read_text(encoding="utf-8")
    tag = '<script defer src="commons-local-images.js"></script>'
    if tag not in index_text:
        anchor = '<script defer src="map.js"></script>'
        if anchor in index_text:
            index_text = index_text.replace(anchor, anchor + tag)
        else:
            index_text = index_text.replace("</head>", tag + "</head>")
        INDEX.write_text(index_text, encoding="utf-8")
        changed_files.append("index.html")

    report = {
        "commons_candidates": len(all_files),
        "localized": len(mapping),
        "downloaded_now": downloaded,
        "reused_existing": reused,
        "failed_count": len(failed),
        "failed": failed,
        "changed_js_files": sorted(changed_files),
        "remaining_external_src_count": sum(len(v) for v in unresolved_external.values()),
        "remaining_external_srcs": unresolved_external,
        "policy_note": "Only reusable Wikimedia Commons sources are copied locally. Existing local files are ignored; other external images require separate license review or a Commons replacement.",
    }
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print(json.dumps({
        "localized": len(mapping),
        "failed": len(failed),
        "remaining_external_src": report["remaining_external_src_count"],
        "changed_files": len(changed_files),
    }, ensure_ascii=False))

if __name__ == "__main__":
    main()
