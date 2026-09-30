#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import re
import time
from pathlib import Path
from urllib.parse import unquote

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

    # Commons file-page references are the most authoritative source.
    for m in re.finditer(r"https://commons\.wikimedia\.org/wiki/File:([^'\"<>\s]+)", text):
        out.add(normal_file_name(m.group(1)))

    # Explicit Special:FilePath image URLs.
    for m in re.finditer(r"https://commons\.wikimedia\.org/wiki/Special:FilePath/([^?'\"<>\s]+)", text):
        out.add(normal_file_name(m.group(1)))

    # Static image filenames used by cf()/photoFiles/pf maps.
    if "commons.wikimedia.org" in text or "Special:FilePath" in text or "const cf=" in text:
        for m in re.finditer(r"(['\"])([^'\"\n]+?\.(?:jpe?g|png|webp))\1", text, re.I):
            value = m.group(2).strip()
            if value.startswith(("http://", "https://", "images/")):
                continue
            if "/" in value and not value.startswith("./"):
                continue
            out.add(normal_file_name(value))

    return {x for x in out if EXT_RE.search(x)}

def commons_info(session: requests.Session, filename: str) -> dict | None:
    params = {
        "action": "query",
        "format": "json",
        "prop": "imageinfo",
        "iiprop": "url|mime|size",
        "iiurlwidth": "1400",
        "titles": "File:" + filename,
        "formatversion": "2",
    }
    try:
        r = session.get(API, params=params, headers=HEADERS, timeout=25)
        r.raise_for_status()
        data = r.json()
        pages = data.get("query", {}).get("pages", [])
        if not pages or pages[0].get("missing"):
            return None
        ii = (pages[0].get("imageinfo") or [None])[0]
        if not ii:
            return None
        return ii
    except Exception:
        return None

def save_webp(session: requests.Session, url: str, path: Path) -> tuple[bool, str | None]:
    tmp = path.with_suffix(".download")
    try:
        r = session.get(url, headers=HEADERS, timeout=60)
        r.raise_for_status()
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
        tmp.unlink(missing_ok=True)
        return False, str(e)

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

    session = requests.Session()
    mapping: dict[str, str] = {}
    failed: list[dict] = []
    downloaded = 0
    reused = 0

    OUT.mkdir(parents=True, exist_ok=True)

    for idx, filename in enumerate(sorted(all_files)):
        rel = local_name(filename)
        dest = DIST / rel
        if dest.exists() and dest.stat().st_size > 100:
            mapping[filename] = rel
            reused += 1
            continue

        info = commons_info(session, filename)
        if not info:
            failed.append({"file": filename, "reason": "Commons file not found"})
            continue

        url = info.get("thumburl") or info.get("url")
        if not url:
            failed.append({"file": filename, "reason": "No downloadable URL"})
            continue

        ok, err = save_webp(session, url, dest)
        if ok:
            mapping[filename] = rel
            downloaded += 1
        else:
            failed.append({"file": filename, "reason": err or "download/convert failed"})

        if idx % 20 == 0:
            time.sleep(0.15)

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
        "policy_note": "Only reusable Commons images are automatically copied. Other external images require separate license review or a Commons replacement.",
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
