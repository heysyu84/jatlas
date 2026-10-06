#!/usr/bin/env python3
import hashlib,json,re,sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DIST=ROOT/'dist'
sys.path.insert(0,str(ROOT/'tools'))
from canonical_slug_policy import place_slug,food_slug

PREFS={'사이타마','지바','도쿄','가나가와','도야마','이시카와','후쿠이','시가','교토','오사카','효고','나라','와카야마'}
reg_path=DIST/'photo-registry-data.js'
prefix='globalThis.JATLAS_PHOTO_REGISTRY_DATA='
raw=reg_path.read_text().strip()
if not raw.startswith(prefix): raise SystemExit('bad registry format')
reg=json.loads(raw[len(prefix):].rstrip(';'))
map_audit=json.loads((ROOT/'audits/map-audit.json').read_text())

changes=[];slugs={}
for group in ('places','foods'):
    for cid,r in reg.get(group,{}).items():
        if r.get('pref') not in PREFS: continue
        if group=='foods':
            slug=food_slug(cid)
        else:
            legacy=str(r.get('legacyId'))
            query=(map_audit.get(legacy) or {}).get('query') or ''
            slug=place_slug(cid,query)
        if not re.fullmatch(r'[0-9a-z]+(?:-[0-9a-z]+)*',slug):
            raise SystemExit(f'bad slug {cid}: {slug}')
        slugs[cid]=slug
        old=r.get('image','');oldp=DIST/old
        if not oldp.is_file():raise SystemExit(f'missing canonical file {old}')
        newp=oldp.with_name(f'{cid}-{slug}.webp')
        new=str(newp.relative_to(DIST)).replace('\\','/')
        if old!=new:
            if newp.exists() and newp.read_bytes()!=oldp.read_bytes():raise SystemExit(f'collision {new}')
            if not newp.exists():oldp.rename(newp)
            elif oldp.exists():oldp.unlink()
            changes.append({'id':cid,'from':old,'to':new})
            r['image']=new
        r['sha256']=hashlib.sha256((DIST/r['image']).read_bytes()).hexdigest()

bad=[r['image'] for g in ('places','foods') for r in reg.get(g,{}).values() if any(ord(ch)>127 for ch in r.get('image',''))]
if bad:raise SystemExit('non-ASCII canonical paths remain: '+json.dumps(bad[:20],ensure_ascii=False))

reg_path.write_text(prefix+json.dumps(reg,ensure_ascii=False,indent=2)+';\n')
index=(DIST/'index.html').read_text()
index=re.sub(r'photo-registry-data\.js\?v=[^"]+','photo-registry-data.js?v=20261007-canonical-slugs2',index)
index=re.sub(r'photo-registry\.js\?v=[^"]+','photo-registry.js?v=20261007-canonical-slugs2',index)
(DIST/'index.html').write_text(index)
audit={'schemaVersion':3,'status':'CANONICAL_SLUG_POLICY_APPLIED','changed':len(changes),
 'policy':'Official/common English override first; otherwise Japanese name in conventional macron-less Hepburn. Korean UI-name transliteration is prohibited.',
 'slugs':slugs,'changes':changes}
(ROOT/'audits/canonical-ascii-slug-review.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'changed':len(changes),'records':len(slugs)},ensure_ascii=False))
