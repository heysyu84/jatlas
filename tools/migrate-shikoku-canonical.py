#!/usr/bin/env python3
# shikoku-canonical-migration-20261007-r1
import hashlib,importlib.util,io,json,re,subprocess,unicodedata,urllib.parse,urllib.request
from pathlib import Path
from PIL import Image,ImageOps
from canonical_slug_policy import place_slug,food_slug

ROOT=Path(__file__).resolve().parents[1]
DIST=ROOT/'dist'
RUNTIME=Path('/tmp/shikoku-before.json')
PREFS=[
 ('도쿠시마','36','tokushima'),('가가와','37','kagawa'),('에히메','38','ehime'),('고치','39','kochi'),
]
PREFSET={x[0] for x in PREFS}
EXPECTED={'도쿠시마':(18,6),'가가와':(20,7),'에히메':(19,6),'고치':(19,7)}
USER_AGENT='Mozilla/5.0 Jatlas canonical migration'

def load_prepare_module():
    p=ROOT/'tools/prepare-official-photos.py'
    spec=importlib.util.spec_from_file_location('jatlas_prepare_official',p)
    mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
    return mod
PREP=load_prepare_module()

def materialize_manifest_asset(photo):
    output=(DIST/photo['output']).resolve()
    if output.exists():return
    download=PREP.resolve_download(photo)
    req=urllib.request.Request(download,headers={'User-Agent':PREP.USER_AGENT})
    raw=PREP.download_bytes(req)
    if len(raw)>25*1024*1024:raise ValueError('Photo exceeds size limit: '+photo['output'])
    expected=photo.get('sha256')
    if expected and hashlib.sha256(raw).hexdigest()!=expected:
        raise ValueError('Source changed; review required: '+photo.get('source',''))
    if not expected and not photo.get('allowUnpinned'):
        raise ValueError('Unpinned source requires review: '+photo.get('source',''))
    with Image.open(io.BytesIO(raw)) as original:
        image=ImageOps.exif_transpose(original).convert('RGB')
        if photo.get('cropRatio'):
            image=PREP.crop_to_ratio(image,photo['cropRatio'],photo.get('cropX',.5),photo.get('cropY',.5))
        upscale=int(photo.get('upscaleWidth',0) or 0)
        if upscale and image.width<upscale:
            image=image.resize((upscale,max(1,round(image.height*upscale/image.width))),Image.Resampling.LANCZOS)
        image.thumbnail((1280,960),Image.Resampling.LANCZOS)
        output.parent.mkdir(parents=True,exist_ok=True)
        image.save(output,format='WEBP',quality=88)



def clean_local(src):
    s=str(src or '').split('?',1)[0].split('#',1)[0]
    return s.removeprefix('./').removeprefix('/').removeprefix('dist/')

def read_source(src):
    src=str(src or '')
    if src.startswith(('http://','https://')):
        req=urllib.request.Request(src,headers={'User-Agent':USER_AGENT})
        with urllib.request.urlopen(req,timeout=45) as r:
            raw=r.read(25*1024*1024+1)
        if len(raw)>25*1024*1024:raise ValueError('Image too large: '+src)
        return raw,src
    rel=clean_local(src);p=DIST/rel
    if not p.is_file():raise FileNotFoundError('Missing active image: '+rel)
    return p.read_bytes(),rel

def write_webp(src,dest):
    raw,legacy=read_source(src)
    with Image.open(io.BytesIO(raw)) as original:
        image=ImageOps.exif_transpose(original).convert('RGB')
        image.thumbnail((1280,960),Image.Resampling.LANCZOS)
        dest.parent.mkdir(parents=True,exist_ok=True)
        image.save(dest,format='WEBP',quality=88)
    return legacy

def main():
    if not RUNTIME.is_file():raise SystemExit('Run tools/audit-content.cjs /tmp/shikoku-before.json first')
    runtime=json.loads(RUNTIME.read_text())
    idmap=json.loads((ROOT/'audits/id-migration-map.json').read_text())
    map_audit=json.loads((ROOT/'audits/map-audit.json').read_text())
    manifest=json.loads((ROOT/'tools/official-photo-assets.json').read_text())
    manifest_by_output={x.get('output'):x for x in manifest.get('photos',[]) if x.get('output')}
    manifest_by_place={int(x['placeId']):x for x in manifest.get('photos',[]) if x.get('placeId') is not None}
    manifest_by_food={x.get('foodName'):x for x in manifest.get('photos',[]) if x.get('foodName')}
    place_map={int(x['legacyId']):x for x in idmap['places'] if x.get('pref') in PREFSET}
    food_map={(x['pref'],x['name']):x for x in idmap['foods'] if x.get('pref') in PREFSET}
    places={int(x['id']):x for x in runtime['places'] if x.get('pref') in PREFSET}
    foods={}
    for prefrow in runtime['prefectures']:
        if prefrow.get('pref') not in PREFSET:continue
        for f in prefrow.get('foods',[]):foods[(prefrow['pref'],f['name'])]=f

    reg_path=DIST/'photo-registry-data.js';prefix='globalThis.JATLAS_PHOTO_REGISTRY_DATA='
    reg_text=reg_path.read_text().strip()
    if not reg_text.startswith(prefix):raise ValueError('Bad photo registry')
    registry=json.loads(reg_text[len(prefix):].rstrip(';'))
    registry['places']={k:v for k,v in registry.get('places',{}).items() if v.get('pref') not in PREFSET}
    registry['foods']={k:v for k,v in registry.get('foods',{}).items() if v.get('pref') not in PREFSET}

    per_pref={};external=[];missing=[]
    slugs={x[0]:x[2] for x in PREFS}
    for pref,code,prefslug in PREFS:
        p_rows=[x for x in idmap['places'] if x.get('pref')==pref]
        f_rows=[x for x in idmap['foods'] if x.get('pref')==pref]
        if (len(p_rows),len(f_rows))!=EXPECTED[pref]:
            raise ValueError(f'{pref} ID count mismatch: {(len(p_rows),len(f_rows))} != {EXPECTED[pref]}')
        pc=fc=0
        for row in p_rows:
            ident=int(row['legacyId']);p=places.get(ident)
            if not p:raise ValueError(f'Missing runtime place {pref} {ident}')
            photo=p.get('photo') or {};src=photo.get('src') or ''
            if not src:raise ValueError(f'Missing active place photo {pref} {ident} {row["name"]}')
            cid=row['newId']
            if not str(src).startswith(('http://','https://')) and not (DIST/clean_local(src)).is_file():
                asset=manifest_by_output.get(clean_local(src)) or manifest_by_place.get(ident)
                if not asset:raise FileNotFoundError(f'Missing approved place photo without recovery manifest: {pref} {ident} {src}')
                materialize_manifest_asset(asset)
            canonical=f'images/regions/shikoku/{prefslug}/places/{cid}-{place_slug(cid,(map_audit.get(str(ident)) or {}).get('query') or p.get('mapQuery') or '')}.webp'
            dest=DIST/canonical;legacy=write_webp(src,dest)
            if str(src).startswith(('http://','https://')):external.append({'id':ident,'src':src})
            registry['places'][cid]={
              'canonicalId':cid,'legacyId':ident,'pref':pref,'area':p.get('area',''),'town':p.get('town',''),'name':row['name'],
              'image':canonical,'legacyImage':legacy,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),
              'source':photo.get('source') or '','terms':photo.get('terms') or photo.get('licenseUrl') or '',
              'author':photo.get('author') or '','userPhoto':bool(photo.get('userPhoto',False)),
              'heroEligible':True,'revision':1
            };pc+=1
        for row in f_rows:
            name=row['name'];f=foods.get((pref,name))
            if not f:raise ValueError(f'Missing runtime food {pref} {name}')
            photo=f.get('photo') or {};src=photo.get('src') or f.get('image') or ''
            if not src:raise ValueError(f'Missing active food photo {pref} {name}')
            cid=row['newId']
            if not str(src).startswith(('http://','https://')) and not (DIST/clean_local(src)).is_file():
                asset=manifest_by_output.get(clean_local(src)) or manifest_by_food.get(name)
                if not asset:raise FileNotFoundError(f'Missing approved food photo without recovery manifest: {pref} {name} {src}')
                materialize_manifest_asset(asset)
            canonical=f'images/regions/shikoku/{prefslug}/foods/{cid}-{food_slug(cid)}.webp'
            dest=DIST/canonical;legacy=write_webp(src,dest)
            if str(src).startswith(('http://','https://')):external.append({'food':pref+'|'+name,'src':src})
            registry['foods'][cid]={
              'canonicalId':cid,'legacyId':None,'pref':pref,'name':name,'image':canonical,'legacyImage':legacy,
              'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),
              'source':photo.get('source') or '','terms':photo.get('terms') or photo.get('licenseUrl') or '',
              'author':photo.get('author') or '','userPhoto':False,'revision':1
            };fc+=1
        per_pref[pref]={'places':pc,'foods':fc,'canonicalFiles':pc+fc}

    old_regions=[r for r in registry.get('scope',{}).get('regions',[]) if r!='시코쿠']
    old_prefs=[p for p in registry.get('scope',{}).get('prefectures',[]) if p not in PREFSET]
    registry['scope']={'region':'시코쿠 포함 마이그레이션 완료 권역','regions':['시코쿠']+old_regions,'prefectures':[x[0] for x in PREFS]+old_prefs}
    registry['generatedFrom']=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
    reg_path.write_text(prefix+json.dumps(registry,ensure_ascii=False,indent=2)+';\n')

    html=(DIST/'index.html').read_text()
    for name in ('photo-registry-data','photo-registry','map-canonical-data','map'):
        html=re.sub(name+r'\.js\?v=[^"]+',name+'.js?v=20261007-shikoku1',html)
    (DIST/'index.html').write_text(html)

    tp=sum(v['places'] for v in per_pref.values());tf=sum(v['foods'] for v in per_pref.values())
    audit={'schemaVersion':1,'region':'시코쿠','status':'COMPLETE_CANONICAL','sourceCommit':registry['generatedFrom'],'prefectures':per_pref,
      'totals':{'places':tp,'foods':tf,'canonicalRecords':tp+tf,'canonicalFiles':tp+tf,'missingCanonicalFiles':0},
      'externalActiveAssets':external,'externalActiveAssetCount':len(external),
      'guarantees':['Runtime-visible approved photos are the migration source of truth.','Canonical IDs follow Japanese prefecture codes 36-39.','Canonical filenames contain only the fixed ID and normalized place/food name.','Legacy files are not deleted by this migration.']}
    (ROOT/'audits/shikoku-migration-completion.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(audit,ensure_ascii=False))

if __name__=='__main__':main()
