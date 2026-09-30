#!/usr/bin/env python3
from __future__ import annotations
import hashlib, io, json, re, sys, time
from pathlib import Path
from urllib.parse import quote, unquote
import requests
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
OUT = DIST / "images" / "localized"
REPORT = DIST / "data" / "image-localization-report.json"
MAX_EDGE = 1400
QUALITY = 82
UA = "Jatlas image localizer/1.0 (GitHub Actions; source attribution retained)"

session = requests.Session()
session.headers.update({"User-Agent": UA})

def safe_stem(s: str) -> str:
    s = re.sub(r"[^A-Za-z0-9._-]+", "-", s).strip("-").lower()
    return s[:64] or "image"

def commons_title_from_page(url: str) -> str | None:
    m = re.search(r"commons\.wikimedia\.org/wiki/File:(.+)$", url)
    return unquote(m.group(1)).replace("_", " ") if m else None

def commons_download_url(title: str) -> str:
    return "https://commons.wikimedia.org/wiki/Special:Redirect/file/" + quote(title, safe="")

def fetch_and_convert(url: str, dest: Path) -> tuple[bool, str]:
    try:
        r = session.get(url, timeout=45, allow_redirects=True)
        r.raise_for_status()
        if not r.headers.get("content-type", "").startswith("image/"):
            return False, f"not-image:{r.headers.get('content-type')}"
        im = Image.open(io.BytesIO(r.content))
        if getattr(im, "is_animated", False):
            im.seek(0)
        im = ImageOps.exif_transpose(im).convert("RGB")
        im.thumbnail((MAX_EDGE, MAX_EDGE), Image.Resampling.LANCZOS)
        dest.parent.mkdir(parents=True, exist_ok=True)
        im.save(dest, "WEBP", quality=QUALITY, method=6)
        return True, f"{len(r.content)}->{dest.stat().st_size}"
    except Exception as e:
        return False, f"{type(e).__name__}:{e}"

def local_path(js_path: Path, title: str) -> Path:
    bucket = safe_stem(js_path.stem)
    h = hashlib.sha1(title.encode("utf-8")).hexdigest()[:12]
    return OUT / bucket / f"{h}.webp"

def rel_for_js(dest: Path) -> str:
    return dest.relative_to(DIST).as_posix()

def parse_literal_map(src: str, var: str) -> dict[str, str]:
    m = re.search(rf"const\s+{re.escape(var)}\s*=\s*(\{{.*?\}});", src, re.S)
    if not m:
        return {}
    body = m.group(1)
    pairs = {}
    for k, v in re.findall(r"['\"]([^'\"]+)['\"]\s*:\s*['\"]((?:\\.|[^'\"])*)['\"]", body):
        pairs[k] = v.replace("\\'", "'").replace('\\"', '"')
    return pairs

def patch_cf_map(src: str, localized: dict[str, str]) -> str:
    if not localized:
        return src
    # Replace any prior generated block so re-runs are idempotent.
    src = re.sub(r"/\* LOCALIZED_COMMONS_MAP_START \*/.*?/\* LOCALIZED_COMMONS_MAP_END \*/", "", src, flags=re.S)
    cf_pat = r"const cf=f=>'https://commons\.wikimedia\.org/wiki/Special:FilePath/'\+encodeURIComponent\(f\)\+'\?width=960';"
    m = re.search(cf_pat, src)
    if not m:
        return src
    data = json.dumps(localized, ensure_ascii=False, separators=(",", ":"))
    block = (
        f"/* LOCALIZED_COMMONS_MAP_START */const localizedCommons={data};"
        "/* LOCALIZED_COMMONS_MAP_END */"
        "const cf=f=>localizedCommons[f]||'https://commons.wikimedia.org/wiki/Special:FilePath/'+encodeURIComponent(f)+'?width=960';"
    )
    return src[:m.start()] + block + src[m.end():]

def patch_direct_commons(src: str, js_path: Path, report: list[dict]) -> tuple[str, int]:
    count = 0
    # Handles JSON-ish or JS object entries with src before source.
    pat = re.compile(
        r"(?P<prefix>(?:src|\"src\")\s*:\s*)(?P<q1>['\"])(?P<src>https?://[^'\"]+)(?P=q1)"
        r"(?P<middle>[^{}]{0,700}?)"
        r"(?P<sprefix>(?:source|\"source\")\s*:\s*)(?P<q2>['\"])(?P<source>https://commons\.wikimedia\.org/wiki/File:[^'\"]+)(?P=q2)",
        re.S,
    )
    pos = 0
    out = []
    for m in pat.finditer(src):
        out.append(src[pos:m.start()])
        title = commons_title_from_page(m.group("source"))
        if not title:
            out.append(m.group(0)); pos=m.end(); continue
        dest = local_path(js_path, title)
        rel = rel_for_js(dest)
        if not dest.exists():
            ok, detail = fetch_and_convert(commons_download_url(title), dest)
        else:
            ok, detail = True, "already-local"
        if ok:
            replacement = (
                m.group("prefix") + m.group("q1") + rel + m.group("q1") +
                m.group("middle") + m.group("sprefix") + m.group("q2") + m.group("source") + m.group("q2")
            )
            out.append(replacement)
            count += 1
            report.append({"file":js_path.relative_to(ROOT).as_posix(),"title":title,"local":rel,"status":"localized","detail":detail})
        else:
            out.append(m.group(0))
            report.append({"file":js_path.relative_to(ROOT).as_posix(),"title":title,"status":"failed","detail":detail})
        pos = m.end()
    out.append(src[pos:])
    return "".join(out), count

def process_js(js_path: Path, report: list[dict]) -> dict:
    src = js_path.read_text("utf-8")
    changed = False
    localized_by_title: dict[str, str] = {}

    # Expansion files: photoFiles / foodPhotoFiles are filename maps consumed by cf().
    for var in ("photoFiles", "foodPhotoFiles"):
        for _, title in parse_literal_map(src, var).items():
            dest = local_path(js_path, title)
            rel = rel_for_js(dest)
            if not dest.exists():
                ok, detail = fetch_and_convert(commons_download_url(title), dest)
            else:
                ok, detail = True, "already-local"
            if ok:
                localized_by_title[title] = rel
                report.append({"file":js_path.relative_to(ROOT).as_posix(),"title":title,"local":rel,"status":"localized","detail":detail})
            else:
                report.append({"file":js_path.relative_to(ROOT).as_posix(),"title":title,"status":"failed","detail":detail})

    patched = patch_cf_map(src, localized_by_title)
    if patched != src:
        src = patched
        changed = True

    # Direct Commons objects (Tokyo/Yamanashi/etc.).
    src2, n = patch_direct_commons(src, js_path, report)
    if n:
        src = src2
        changed = True

    if changed:
        js_path.write_text(src, "utf-8")
    return {"file":js_path.relative_to(ROOT).as_posix(),"changed":changed,"localized_map":len(localized_by_title),"direct":n}

def content_audit() -> dict:
    # Heuristic only: highlights obvious empty axes for human review; it never auto-adds filler.
    prefs = ["도쿄","야마나시","오사카","가나가와","시즈오카","교토","나라","시가","효고","와카야마",
             "돗토리","시마네","오카야마","히로시마","야마구치","도쿠시마","가가와","에히메","고치",
             "후쿠오카","사가","나가사키"]
    corpus = "\n".join(p.read_text("utf-8", errors="ignore") for p in DIST.glob("*.js"))
    axes = ["쇼핑","시장","온천","박물관","미술관","신사","사찰","성","전망","공원","축제"]
    result = {}
    for pref in prefs:
        # We cannot reliably isolate every combined file by prefecture, so report global keyword presence near the name.
        hits = {}
        for axis in axes:
            pattern = re.compile(re.escape(pref)+r".{0,12000}?"+re.escape(axis), re.S)
            hits[axis] = bool(pattern.search(corpus))
        result[pref] = hits
    return result

def main():
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    report: list[dict] = []
    summaries = []
    candidates = []
    for p in DIST.glob("*.js"):
        text = p.read_text("utf-8", errors="ignore")
        if "commons.wikimedia.org" in text or "photoFiles" in text:
            candidates.append(p)
    for p in sorted(candidates):
        summaries.append(process_js(p, report))
        time.sleep(0.05)

    payload = {
        "generated_at_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "settings":{"max_edge":MAX_EDGE,"quality":QUALITY},
        "summary":summaries,
        "localized":sum(1 for x in report if x["status"]=="localized"),
        "failed":sum(1 for x in report if x["status"]=="failed"),
        "failures":[x for x in report if x["status"]=="failed"],
        "content_audit":content_audit(),
    }
    REPORT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), "utf-8")
    print(json.dumps({"localized":payload["localized"],"failed":payload["failed"],"files":len(summaries)}, ensure_ascii=False))

if __name__ == "__main__":
    main()
