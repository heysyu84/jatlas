#!/usr/bin/env python3
import json,re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DIST=ROOT/'dist'
PREFS={'홋카이도','아오모리','이와테','미야기','아키타','야마가타','후쿠시마'}
REG= DIST/'photo-registry-data.js'
PREFIX='globalThis.JATLAS_PHOTO_REGISTRY_DATA='

def main():
    idmap=json.loads((ROOT/'audits/id-migration-map.json').read_text())
    raw=REG.read_text().strip()
    if not raw.startswith(PREFIX): raise ValueError('Bad photo registry')
    reg=json.loads(raw[len(PREFIX):].rstrip(';'))
    current={ (r.get('pref'),r.get('name')):(k,r) for k,r in reg.get('foods',{}).items() if r.get('pref') in PREFS }
    corrected={}
    moves=[]
    for row in [x for x in idmap['foods'] if x.get('pref') in PREFS]:
        key=(row['pref'],row['name'])
        if key not in current: raise KeyError('Missing food registry record: '+repr(key))
        old_id,r=current[key]
        expected=row['newId']
        old=r['image']
        new=re.sub(r'/\d{2}-F\d{4}-',f'/{expected}-',old)
        if old!=new:
            src=DIST/old; dst=DIST/new
            if not src.is_file(): raise FileNotFoundError(old)
            if dst.exists(): raise FileExistsError('Destination already exists: '+new)
            dst.parent.mkdir(parents=True,exist_ok=True)
            src.rename(dst)
            moves.append({'pref':row['pref'],'name':row['name'],'fromId':old_id,'toId':expected,'oldPath':old,'newPath':new})
        nr=dict(r); nr['canonicalId']=expected; nr['image']=new
        corrected[expected]=nr
    untouched={k:v for k,v in reg.get('foods',{}).items() if v.get('pref') not in PREFS}
    reg['foods']={**untouched,**corrected}
    if len(reg['foods'])!=346: raise ValueError('Food registry count changed: '+str(len(reg['foods'])))
    for row in idmap['foods']:
        r=reg['foods'].get(row['newId'])
        if not r or r.get('pref')!=row['pref'] or r.get('name')!=row['name']:
            raise ValueError('Food ID mismatch remains: '+row['newId'])
        if not (DIST/r['image']).is_file():
            raise FileNotFoundError('Missing canonical food file: '+r['image'])
    REG.write_text(PREFIX+json.dumps(reg,ensure_ascii=False,indent=2)+';\n')
    audit={'schemaVersion':1,'status':'CORRECTED','correctedFoods':len(moves),'scope':['홋카이도','도호쿠'],
           'guarantees':['Canonical food IDs match audits/id-migration-map.json by prefecture and food name.',
                         'Existing image files are renamed without decoding or re-encoding; image bytes are unchanged.'],
           'moves':moves}
    (ROOT/'audits/food-id-realignment.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'ok':True,'correctedFoods':len(moves),'totalFoods':len(reg['foods'])},ensure_ascii=False))
if __name__=='__main__': main()
