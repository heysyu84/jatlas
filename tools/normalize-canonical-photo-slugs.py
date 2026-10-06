#!/usr/bin/env python3
import hashlib,json,re
from pathlib import Path
from unidecode import unidecode

ROOT=Path(__file__).resolve().parents[1]
DIST=ROOT/'dist'
PREFS={'사이타마','지바','도쿄','가나가와','도야마','이시카와','후쿠이','시가','교토','오사카','효고','나라','와카야마'}

def slug(name):
    s=unidecode(str(name or '')).lower()
    s=re.sub(r'[^0-9a-z]+','-',s)
    return re.sub(r'-+','-',s).strip('-') or 'item'

path=DIST/'photo-registry-data.js'
prefix='globalThis.JATLAS_PHOTO_REGISTRY_DATA='
raw=path.read_text().strip()
if not raw.startswith(prefix):
    raise SystemExit('bad registry format')
reg=json.loads(raw[len(prefix):].rstrip(';'))
changes=[]
for group in ('places','foods'):
    for cid,r in reg.get(group,{}).items():
        if r.get('pref') not in PREFS:
            continue
        old=r.get('image','')
        if not old:
            raise SystemExit(f'missing image path {cid}')
        oldp=DIST/old
        if not oldp.is_file():
            raise SystemExit(f'missing canonical file {old}')
        newp=oldp.with_name(f"{cid}-{slug(r.get('name'))}.webp")
        new=str(newp.relative_to(DIST)).replace('\\','/')
        if old!=new:
            if newp.exists() and newp.read_bytes()!=oldp.read_bytes():
                raise SystemExit(f'collision {new}')
            if not newp.exists():
                oldp.rename(newp)
            elif oldp.exists():
                oldp.unlink()
            changes.append({'id':cid,'from':old,'to':new})
            r['image']=new
        r['sha256']=hashlib.sha256((DIST/r['image']).read_bytes()).hexdigest()

bad=[r['image'] for g in ('places','foods') for r in reg.get(g,{}).values() if any(ord(ch)>127 for ch in r.get('image',''))]
if bad:
    raise SystemExit('non-ASCII canonical paths remain: '+json.dumps(bad[:20],ensure_ascii=False))

path.write_text(prefix+json.dumps(reg,ensure_ascii=False,indent=2)+';\n')
index=(DIST/'index.html').read_text()
index=re.sub(r'photo-registry-data\.js\?v=[^"]+','photo-registry-data.js?v=20261007-ascii-slugs1',index)
index=re.sub(r'photo-registry\.js\?v=[^"]+','photo-registry.js?v=20261007-ascii-slugs1',index)
(DIST/'index.html').write_text(index)

audit={'schemaVersion':1,'status':'ASCII_CANONICAL_SLUGS','changed':len(changes),'changes':changes,
       'policy':'Canonical photo filenames are canonical ID + ASCII English/romanized slug only.'}
(ROOT/'audits/canonical-ascii-slug-review.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'changed':len(changes),'remainingNonAscii':0},ensure_ascii=False))
