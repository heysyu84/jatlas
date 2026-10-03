"""Build website-only licensed derivatives; never commit downloaded image files.

Run before serving dist or deploying. A changed/unavailable source fails the build
so Pages retains its previously successful deployment instead of a broken image.
"""
import hashlib
import io
import json
import urllib.request
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]


def prepare():
    manifest = json.loads((ROOT / 'tools/official-photo-assets.json').read_text())
    for photo in manifest['photos']:
        request = urllib.request.Request(
            photo['download'],
            headers={'User-Agent': 'Jatlas tourism website photo build/1.0'},
        )
        with urllib.request.urlopen(request, timeout=45) as response:
            raw = response.read(20 * 1024 * 1024 + 1)
        if len(raw) > 20 * 1024 * 1024:
            raise ValueError('Official photo exceeds download size limit')
        if hashlib.sha256(raw).hexdigest() != photo['sha256']:
            raise ValueError(f"Source changed; review required: {photo['source']}")
        with Image.open(io.BytesIO(raw)) as original:
            image = ImageOps.exif_transpose(original).convert('RGB')
            if not (1.25 <= image.width / image.height <= 1.85):
                raise ValueError('Official photo must be a moderate landscape')
            if image.width < 900 or image.height < 600:
                raise ValueError('Official photo source resolution too low')
            image.thumbnail((1280, 960), Image.Resampling.LANCZOS)
            output = (ROOT / 'dist' / photo['output']).resolve()
            if not output.is_relative_to((ROOT / 'dist/images/official').resolve()):
                raise ValueError('Output must remain in ignored official asset folder')
            output.parent.mkdir(parents=True, exist_ok=True)
            temporary = output.with_suffix('.tmp')
            image.save(temporary, format='WEBP', quality=84)
            temporary.replace(output)
            print(f"Prepared {photo.get('placeId', photo.get('foodName'))}: {image.width}x{image.height}")


if __name__ == '__main__':
    prepare()
