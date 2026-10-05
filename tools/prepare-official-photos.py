"""Build website-only licensed derivatives; never commit downloaded image files.

Run before serving dist or deploying. A changed/unavailable pinned source fails the
build so Pages retains its previously successful deployment instead of a broken image.
"""
import hashlib
import io
import json
import re
import time
import html as html_module
from html.parser import HTMLParser
import urllib.parse
import urllib.error
import urllib.request
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
USER_AGENT = 'Jatlas tourism website photo build/1.0'


def download_bytes(request):
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request, timeout=45) as response:
                return response.read(20 * 1024 * 1024 + 1)
        except urllib.error.HTTPError as error:
            if error.code not in (429, 500, 502, 503, 504) or attempt == 2:
                raise
            delay = (10, 30)[attempt]
            try:
                delay = min(60, max(delay, int(error.headers.get('Retry-After', '0'))))
            except (ValueError, TypeError):
                pass
            print(f'Photo source returned HTTP {error.code}; retrying in {delay}s', flush=True)
            time.sleep(delay)


def fetch_json(url):
    request = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
    with urllib.request.urlopen(request, timeout=45) as response:
        return json.loads(response.read(1024 * 1024).decode('utf-8'))


def fetch_text(url):
    request = urllib.request.Request(
        url,
        headers={
            'User-Agent': 'Mozilla/5.0 (compatible; Jatlas tourism website photo build/1.0)',
            'Accept-Language': 'ja,en;q=0.8',
        },
    )
    with urllib.request.urlopen(request, timeout=45) as response:
        return response.read(5 * 1024 * 1024).decode(response.headers.get_content_charset() or 'utf-8', errors='replace')


class ImagePageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.images = []

    def handle_starttag(self, tag, attrs):
        if tag.lower() == 'img':
            self.images.append(dict(attrs))


def image_from_page(photo):
    page = photo['imagePage']
    parser = ImagePageParser()
    parser.feed(fetch_text(page))
    needle = str(photo.get('imageAltContains', '')).casefold()
    src_needle = str(photo.get('imageSrcContains', '')).casefold()
    candidates = []
    for attrs in parser.images:
        alt = str(attrs.get('alt', '')).casefold()
        if needle and needle not in alt:
            continue
        source = attrs.get('data-src') or attrs.get('data-original') or attrs.get('src')
        srcset = attrs.get('data-srcset') or attrs.get('srcset')
        if srcset:
            entries = [part.strip().split() for part in srcset.split(',') if part.strip()]
            if entries:
                def srcset_rank(entry):
                    if len(entry) > 1 and entry[1].endswith('w'):
                        try:
                            return float(entry[1][:-1])
                        except ValueError:
                            pass
                    if len(entry) > 1 and entry[1].endswith('x'):
                        try:
                            return float(entry[1][:-1]) * 10000
                        except ValueError:
                            pass
                    return 0
                source = max(entries, key=srcset_rank)[0]
        if source and not str(source).startswith('data:'):
            resolved = urllib.parse.urljoin(page, html_module.unescape(str(source)))
            if src_needle and src_needle not in resolved.casefold():
                continue
            candidates.append(resolved)
    if not candidates:
        raise ValueError(f"No matching image found on source page: {page}")

    chosen = candidates[0]
    parsed = urllib.parse.urlsplit(chosen)

    # Kanko Mie pages expose resized Active Storage representations in <img>.
    # Convert that URL to the original blob so the website derivative is built
    # from the full-resolution photograph selected by the user.
    if parsed.netloc.endswith('kankomie.or.jp') and '/rails/active_storage/representations/proxy/' in parsed.path:
        tail = parsed.path.split('/rails/active_storage/representations/proxy/', 1)[1]
        parts = tail.split('/')
        if len(parts) >= 3:
            blob_id = parts[0]
            filename = parts[-1]
            return urllib.parse.urlunsplit((
                parsed.scheme,
                parsed.netloc,
                f'/rails/active_storage/blobs/redirect/{blob_id}/{filename}',
                '',
                '',
            ))

    return chosen


def crop_to_ratio(image, ratio, anchor_x=0.5, anchor_y=0.5):
    ratio = float(ratio)
    anchor_x = min(1.0, max(0.0, float(anchor_x)))
    anchor_y = min(1.0, max(0.0, float(anchor_y)))
    current = image.width / image.height
    if abs(current - ratio) < 0.001:
        return image
    if current > ratio:
        new_width = max(1, int(round(image.height * ratio)))
        left = int(round((image.width - new_width) * anchor_x))
        return image.crop((left, 0, left + new_width, image.height))
    new_height = max(1, int(round(image.width / ratio)))
    top = int(round((image.height - new_height) * anchor_y))
    return image.crop((0, top, image.width, top + new_height))


def resolve_download(photo):
    if photo.get('commonsFilename'):
        filename = urllib.parse.quote(photo['commonsFilename'], safe='')
        return f'https://commons.wikimedia.org/wiki/Special:Redirect/file/{filename}?width=1600'
    if photo.get('imagePage'):
        return image_from_page(photo)

    photo_id = photo.get('flickrPhotoId')
    if not photo_id:
        return photo['download']

    endpoint = 'https://www.flickr.com/services/oembed/?' + urllib.parse.urlencode({
        'format': 'json',
        'url': photo['source'],
        'maxwidth': 1280,
        'maxheight': 960,
    })
    metadata = fetch_json(endpoint)
    web_page = str(metadata.get('web_page', ''))
    if str(photo_id) not in web_page:
        raise ValueError(f"Flickr photo identity changed: {photo['source']}")
    author_slug = photo.get('flickrAuthorSlug')
    author_url = str(metadata.get('author_url', ''))
    if author_slug and f'/photos/{author_slug}' not in author_url:
        raise ValueError(f"Flickr author account changed: {photo['source']}")
    expected_license = photo.get('expectedLicenseId')
    actual_license = metadata.get('license_id')
    if expected_license is not None and actual_license is not None and int(actual_license) != int(expected_license):
        raise ValueError(f"Flickr license changed: {photo['source']}")
    image_url = metadata.get('url') or metadata.get('thumbnail_url')
    if not image_url:
        raise ValueError(f"Flickr oEmbed returned no image URL: {photo['source']}")
    parsed = urllib.parse.urlsplit(image_url)
    stem, dot, extension = parsed.path.rpartition('.')
    size_codes = {'s', 'q', 't', 'm', 'n', 'w', 'z', 'c', 'b', 'h', 'k'}
    head, separator, tail = stem.rpartition('_')
    large_stem = head + '_b' if separator and tail in size_codes else stem + '_b'
    large_path = large_stem + (dot + extension if dot else '')
    return urllib.parse.urlunsplit((parsed.scheme, parsed.netloc, large_path, parsed.query, parsed.fragment))


def prepare():
    manifest = json.loads((ROOT / 'tools/official-photo-assets.json').read_text())
    allowed_roots = [
        (ROOT / 'dist/images/official').resolve(),
        (ROOT / 'dist/images/licensed').resolve(),
    ]
    for photo in manifest['photos']:
        download = resolve_download(photo)
        request = urllib.request.Request(download, headers={'User-Agent': USER_AGENT})
        raw = download_bytes(request)
        if len(raw) > 20 * 1024 * 1024:
            raise ValueError('Licensed photo exceeds download size limit')

        expected_sha = photo.get('sha256')
        if expected_sha:
            if hashlib.sha256(raw).hexdigest() != expected_sha:
                raise ValueError(f"Source changed; review required: {photo['source']}")
        elif not photo.get('allowUnpinned'):
            raise ValueError(f"Unpinned source requires explicit review flag: {photo['source']}")

        with Image.open(io.BytesIO(raw)) as original:
            image = ImageOps.exif_transpose(original).convert('RGB')
            if photo.get('cropRatio'):
                image = crop_to_ratio(
                    image,
                    photo['cropRatio'],
                    photo.get('cropX', 0.5),
                    photo.get('cropY', 0.5),
                )
            if not (1.25 <= image.width / image.height <= 1.85):
                raise ValueError(f"Licensed photo must be a moderate landscape: {photo['source']}")
            min_width = int(photo.get('minWidth', 900))
            min_height = int(photo.get('minHeight', 600))
            if image.width < min_width or image.height < min_height:
                raise ValueError(
                    f"Licensed photo source resolution too low ({image.width}x{image.height}; "
                    f"need {min_width}x{min_height}): {photo['source']}"
                )
            image.thumbnail((1280, 960), Image.Resampling.LANCZOS)
            output = (ROOT / 'dist' / photo['output']).resolve()
            if not any(output.is_relative_to(root) for root in allowed_roots):
                raise ValueError('Output must remain in an ignored licensed photo folder')
            output.parent.mkdir(parents=True, exist_ok=True)
            temporary = output.with_suffix('.tmp')
            image.save(temporary, format='WEBP', quality=84)
            temporary.replace(output)

            print(f"Prepared {photo.get('placeId', photo.get('foodName'))}: {image.width}x{image.height}")


if __name__ == '__main__':
    prepare()
