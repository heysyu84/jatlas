"""Build website-only licensed derivatives; never commit downloaded image files.

Run before serving dist or deploying. A changed/unavailable pinned source fails the
build so Pages retains its previously successful deployment instead of a broken image.
"""
import hashlib
import io
import json
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
USER_AGENT = 'Jatlas tourism website photo build/1.0'


def fetch_json(url):
    request = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
    with urllib.request.urlopen(request, timeout=45) as response:
        return json.loads(response.read(1024 * 1024).decode('utf-8'))


def resolve_download(photo):
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
    return image_url


def prepare():
    manifest = json.loads((ROOT / 'tools/official-photo-assets.json').read_text())
    allowed_roots = [
        (ROOT / 'dist/images/official').resolve(),
        (ROOT / 'dist/images/licensed').resolve(),
    ]
    for photo in manifest['photos']:
        download = resolve_download(photo)
        request = urllib.request.Request(download, headers={'User-Agent': USER_AGENT})
        with urllib.request.urlopen(request, timeout=45) as response:
            raw = response.read(20 * 1024 * 1024 + 1)
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
            if not (1.25 <= image.width / image.height <= 1.85):
                raise ValueError(f"Licensed photo must be a moderate landscape: {photo['source']}")
            if image.width < 900 or image.height < 600:
                raise ValueError(f"Licensed photo source resolution too low: {photo['source']}")
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
