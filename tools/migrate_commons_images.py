# Migration revision: 2026-10-01 verified source cleanup v7
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
    name = name.replace("\\'", "'").replace('\\"', '"').replace("\\\\", "\\")
    if name.lower().startswith("file:"):
        name = name[5:]
    return name.replace("_", " ") if "/" not in name else name

def _quoted_values(text: str):
    # JS single/double quoted strings, preserving one-character escape sequences.
    pat = re.compile(r"'((?:\\.|[^'\\])*)'|\"((?:\\.|[^\"\\])*)\"", re.S)
    for m in pat.finditer(text):
        value = m.group(1) if m.group(1) is not None else m.group(2)
        yield normal_file_name(value)

def collect_filenames(text: str) -> set[str]:
    out: set[str] = set()

    # Parse quoted JS strings so escaped apostrophes such as Kan\'onji are preserved.
    for value in _quoted_values(text):
        if value.startswith("https://commons.wikimedia.org/wiki/File:"):
            out.add(normal_file_name(value.split("File:", 1)[1].split("?", 1)[0]))
        elif value.startswith("https://commons.wikimedia.org/wiki/Special:FilePath/"):
            out.add(normal_file_name(value.split("Special:FilePath/", 1)[1].split("?", 1)[0]))

    # Static filename maps used by expansion files. Do not scan arbitrary local .webp names.
    for var in ("photoFiles", "foodPhotoFiles"):
        for m in re.finditer(rf"const\s+{var}\s*=\s*(\{{.*?\}});", text, re.S):
            for value in _quoted_values(m.group(1)):
                if value.startswith(("http://", "https://", "images/")):
                    continue
                if EXT_RE.search(value):
                    out.add(normal_file_name(value))

    return {x for x in out if EXT_RE.search(x)}

_rate_lock = threading.Lock()
_last_request = 0.0
_MIN_INTERVAL = 0.45

def _throttle() -> None:
    global _last_request
    with _rate_lock:
        now = time.monotonic()
        wait = _MIN_INTERVAL - (now - _last_request)
        if wait > 0:
            time.sleep(wait)
        _last_request = time.monotonic()

def resolve_commons_urls(filenames: list[str]) -> tuple[dict[str, str], list[dict]]:
    """Resolve Commons filenames to 1200px thumbnail URLs in small API batches."""
    resolved: dict[str, str] = {}
    failed: list[dict] = []
    api = requests.Session()
    batch_size = 40
    for offset in range(0, len(filenames), batch_size):
        batch = filenames[offset:offset + batch_size]
        params = {
            "action": "query",
            "format": "json",
            "formatversion": "2",
            "redirects": "1",
            "prop": "imageinfo",
            "iiprop": "url",
            "iiurlwidth": "1200",
            "titles": "|".join("File:" + name for name in batch),
        }
        data = None
        for attempt in range(6):
            try:
                _throttle()
                r = api.get(API, params=params, headers=HEADERS, timeout=60)
                if r.status_code in (429, 502, 503, 504):
                    retry = r.headers.get("Retry-After")
                    delay = float(retry) if retry and retry.isdigit() else min(20.0, 1.2 * (2 ** attempt))
                    time.sleep(delay)
                    continue
                r.raise_for_status()
                data = r.json()
                break
            except Exception:
                if attempt == 5:
                    data = None
                    break
                time.sleep(min(20.0, 1.2 * (2 ** attempt)))

        if not data:
            failed.extend({"file": name, "reason": "Commons API lookup failed"} for name in batch)
            continue

        aliases = {}
        for row in data.get("query", {}).get("normalized", []):
            aliases[normal_file_name(row.get("to", ""))] = normal_file_name(row.get("from", ""))
        for row in data.get("query", {}).get("redirects", []):
            aliases[normal_file_name(row.get("to", ""))] = normal_file_name(row.get("from", ""))

        pages = data.get("query", {}).get("pages", [])
        seen = set()
        for page in pages:
            title = normal_file_name(page.get("title", ""))
            info = (page.get("imageinfo") or [{}])[0]
            url = info.get("thumburl") or info.get("url")
            requested = aliases.get(title, title)
            if url:
                resolved[requested] = url
                resolved[title] = url
                seen.add(requested)
                seen.add(title)

        for name in batch:
            if name in resolved:
                continue
            # API title normalization can change underscores/spaces/case; compare case-insensitively.
            hit = next((url for key, url in resolved.items() if key.casefold() == name.casefold()), None)
            if hit:
                resolved[name] = hit
            else:
                failed.append({"file": name, "reason": "Commons file not found"})
        print(f"resolved {min(offset + batch_size, len(filenames))}/{len(filenames)} filenames", flush=True)
        time.sleep(0.35)
    return resolved, failed

_SEARCH_STOP = {"file","image","photo","japan","japanese","pref","prefecture","city","the","of","in","at","and","various","jpg","jpeg","png"}

def _name_tokens(name: str) -> list[str]:
    stem = re.sub(r"\.(?:jpe?g|png)$", "", name, flags=re.I)
    tokens = [x.lower() for x in re.findall(r"[A-Za-z]{3,}|[ぁ-んァ-ヶ一-龯]{2,}", stem)]
    return [x for x in tokens if x not in _SEARCH_STOP]

def _fallback_score(original: str, candidate: str) -> float:
    q = set(_name_tokens(original))
    c = set(_name_tokens(candidate))
    if not q or not c:
        return 0.0
    overlap = len(q & c)
    ratio = overlap / len(q)
    qcompact = "".join(sorted(q))
    ccompact = "".join(sorted(c))
    compact_hit = any(tok in re.sub(r"[^a-z0-9ぁ-んァ-ヶ一-龯]", "", candidate.lower()) for tok in q if len(tok) >= 5)
    if len(q) == 1:
        return 1.0 if overlap == 1 or compact_hit else 0.0
    if overlap >= 2 and ratio >= 0.5:
        return ratio + overlap * 0.05
    if compact_hit and overlap >= 1 and ratio >= 0.34:
        return ratio
    return 0.0

def search_commons_fallbacks(missing: list[str]) -> tuple[dict[str, str], list[dict]]:
    aliases: dict[str, str] = {}
    unresolved: list[dict] = []
    api = requests.Session()
    for idx, original in enumerate(missing, 1):
        query = re.sub(r"\.(?:jpe?g|png)$", "", original, flags=re.I)
        params = {
            "action": "query",
            "format": "json",
            "formatversion": "2",
            "list": "search",
            "srnamespace": "6",
            "srlimit": "8",
            "srsearch": query,
        }
        data = None
        for attempt in range(5):
            try:
                _throttle()
                r = api.get(API, params=params, headers=HEADERS, timeout=45)
                if r.status_code in (429, 502, 503, 504):
                    time.sleep(min(12.0, 1.0 * (2 ** attempt)))
                    continue
                r.raise_for_status()
                data = r.json()
                break
            except Exception:
                if attempt == 4:
                    data = None
                    break
                time.sleep(min(12.0, 1.0 * (2 ** attempt)))
        if not data:
            unresolved.append({"file": original, "reason": "Commons fallback search failed"})
            continue
        scored = []
        for row in data.get("query", {}).get("search", []):
            title = normal_file_name(row.get("title", ""))
            if not EXT_RE.search(title):
                continue
            score = _fallback_score(original, title)
            if score > 0:
                scored.append((score, title))
        scored.sort(key=lambda x: (-x[0], len(x[1])))
        if scored:
            aliases[original] = scored[0][1]
        else:
            unresolved.append({"file": original, "reason": "Commons file not found"})
        if idx % 10 == 0 or idx == len(missing):
            print(f"fallback searched {idx}/{len(missing)}; matched={len(aliases)}", flush=True)
    return aliases, unresolved

def save_commons_webp(url: str, path: Path) -> tuple[bool, str | None]:
    tmp = path.with_suffix(".download")
    session = requests.Session()
    for attempt in range(5):
        try:
            _throttle()
            r = session.get(url, headers=HEADERS, timeout=60, allow_redirects=True)
            if r.status_code in (429, 502, 503, 504):
                retry = r.headers.get("Retry-After")
                delay = float(retry) if retry and retry.isdigit() else min(20.0, 1.2 * (2 ** attempt))
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
            if attempt == 4:
                tmp.unlink(missing_ok=True)
                return False, str(e)
            time.sleep(min(20.0, 1.2 * (2 ** attempt)))
    tmp.unlink(missing_ok=True)
    return False, "retry limit reached"

def local_name(filename: str) -> str:
    digest = hashlib.sha1(filename.encode("utf-8")).hexdigest()[:16]
    return f"images/commons/{digest}.webp"

def replace_special_urls(text: str, mapping: dict[str, str]) -> str:
    pat = re.compile(r"https://commons\.wikimedia\.org/wiki/Special:FilePath/((?:\\\\.|[^?'\"<>\\s])+)(?:\\?width=\\d+)?")
    def sub(m):
        fn = normal_file_name(m.group(1))
        return mapping.get(fn, m.group(0))
    return pat.sub(sub, text)

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
    pat = re.compile(r"""(?:["']?src["']?\s*:\s*)(["'])((?:\\.|(?!\1).)*)\1""", re.S)
    for m in pat.finditer(text):
        value = normal_file_name(m.group(2))
        if value.startswith(("http://", "https://")):
            urls.append(value)
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
        ok, err = save_commons_webp(resolved_urls[filename], dest)
        if ok:
            return ("downloaded", filename, rel, None)
        return ("failed", filename, None, err or "download/convert failed")

    names = sorted(all_files)
    resolved_urls, lookup_failed = resolve_commons_urls(names)
    exact_missing = [x["file"] for x in lookup_failed if x.get("reason") == "Commons file not found"]
    failed.extend(x for x in lookup_failed if x.get("reason") != "Commons file not found")

    fallback_aliases, fallback_unresolved = search_commons_fallbacks(exact_missing)
    failed.extend(fallback_unresolved)
    if fallback_aliases:
        fallback_targets = sorted(set(fallback_aliases.values()))
        fallback_urls, fallback_lookup_failed = resolve_commons_urls(fallback_targets)
        failed.extend(fallback_lookup_failed)
        for original, target in fallback_aliases.items():
            url = fallback_urls.get(target)
            if url:
                resolved_urls[original] = url
            else:
                failed.append({"file": original, "reason": "Fallback image URL could not be resolved"})

    names = [name for name in names if name in resolved_urls]
    with ThreadPoolExecutor(max_workers=3) as pool:
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
        "fallback_aliases": fallback_aliases,
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
