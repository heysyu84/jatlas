"""Reconcile existing QA findings with current runtime and explicit review records.
No network, no full image audit. Input: node tools/audit-content.cjs output.
"""
import collections
import hashlib
import json
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
audit = root / 'audits'
runtime = json.loads(Path(sys.argv[1]).read_text())
visual = json.loads((audit / 'visual-review.json').read_text())
old = json.loads((audit / 'photo-audit.json').read_text())
current = {}
for p in runtime['places']:
    current['place:' + str(p['id'])] = dict(name=p['name'], pref=p['pref'], src=(p.get('photo') or {}).get('src'))
for p in runtime['prefectures']:
    for f in p['foods']:
        current['food:' + f['name']] = dict(name=f['name'], pref=p['pref'], src=(f.get('photo') or {}).get('src') or f.get('image'))
reviewed = {}
for file in audit.glob('*photo-review.json'):
    data = json.loads(file.read_text())
    if file.name == 'nagoya-photo-review.json':
        data = {'places': data}
    for kind, field in [('place', 'places'), ('food', 'foods')]:
        for key, value in data.get(field, {}).items():
            target = kind + ':' + str(key)
            if value.get('src') and value['src'] == current.get(target, {}).get('src'):
                reviewed[target] = file.name
reasons = collections.defaultdict(set)
for key, reason in visual['places'].items():
    reasons['place:' + key].add('visual: ' + reason)
for key, reason in visual['foods'].items():
    reasons['food:' + key].add('visual: ' + reason)
# Include manually held targets even when absent from the original audit.
for file in audit.glob('*photo-review.json'):
    data = json.loads(file.read_text())
    for key, reason in data.get('pending', {}).items():
        target = key if ':' in key else 'place:' + key
        reasons[target].add('held: ' + str(reason))
for item in old['entries']:
    key = 'place:' + str(item['id']) if item['kind'] == 'place' else 'food:' + item['name']
    for flag in item['flags']:
        reasons[key].add('missing-photo' if flag == 'missing-photo' else 'previous-audit: ' + flag)
for key, item in current.items():
    if not item['src']:
        reasons[key].add('missing-photo')
# Recheck only historical duplicate-group members, not all 1,506 images.
duplicates = []
for group in old['duplicates']:
    hashes = collections.defaultdict(list)
    for item in group:
        key = 'place:' + str(item['id']) if item['kind'] == 'place' else 'food:' + item['name']
        src = current.get(key, {}).get('src')
        file = root / 'dist' / src if src else None
        if file and file.is_file():
            hashes[hashlib.sha256(file.read_bytes()).hexdigest()].append(key)
    for members in hashes.values():
        if len(members) > 1:
            duplicates.append(members)
            for key in members:
                reasons[key].add('duplicate-group: ' + str(len(duplicates)))
rows = []
for key, flags in reasons.items():
    item = current.get(key)
    if not item:
        continue
    remaining = sorted(f for f in flags if key not in reviewed or f.startswith('duplicate-group:'))
    status = 'resolved-by-reviewed-current-photo' if not remaining else 'needs-review'
    if item['pref'] == '후쿠시마':
        status = 'outside-user-scope'
    rows.append(dict(key=key, **item, status=status, reasons=remaining, review=reviewed.get(key)))
rows.sort(key=lambda r: (r['status'] != 'needs-review', 'missing-photo' not in r['reasons'], r['pref'], r['key']))
active = [r for r in rows if r['status'] == 'needs-review']
summary = dict(trackedUniqueCandidates=len(rows), remainingCandidates=len(active), remainingPlaces=sum(r['key'].startswith('place:') for r in active), remainingFoods=sum(r['key'].startswith('food:') for r in active), missingPhotos=sum('missing-photo' in r['reasons'] for r in active), resolvedTrackedCandidates=sum(r['status'] == 'resolved-by-reviewed-current-photo' for r in rows), outsideScope=sum(r['status'] == 'outside-user-scope' for r in rows), currentReviewedItems=len(reviewed), historicalDuplicateGroupsStillMatching=len(duplicates))
result = dict(updatedAt='2026-10-03', method='Union of historical visual/quality candidates plus current missing photos and still-matching historical duplicate groups, minus explicitly reviewed current photo mappings. Fukushima excluded. This is a tracked review backlog, not confirmed defects or a fresh nationwide audit.', summary=summary, duplicateGroups=duplicates, items=rows)
(audit / 'photo-queue.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(summary, ensure_ascii=False))
