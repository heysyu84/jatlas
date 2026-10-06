#!/usr/bin/env python3
# greater-tokyo-canonical-migration-20261007-r4
import hashlib, importlib.util, io, json, re, shutil, subprocess, unicodedata, urllib.request
from pathlib import Path
from PIL import Image, ImageOps
from canonical_slug_policy import place_slug,food_slug

ROOT=Path(__file__).resolve().parents[1]
DIST=ROOT/'dist'
PREFS=[('사이타마','11','saitama'),('지바','12','chiba'),('도쿄','13','tokyo'),('가나가와','14','kanagawa')]
PREFSET={x[0] for x in PREFS}
PREFSLUG={x[0]:x[2] for x in PREFS}

def clean_src(src):
    s=str(src or '')
    if s.startswith('http://') or s.startswith('https://'): return s
    return s.split('?',1)[0].split('#',1)[0].removeprefix('./')


def load_prepare_module():
    p=ROOT/'tools/prepare-official-photos.py'
    spec=importlib.util.spec_from_file_location('jatlas_prepare_official',p)
    mod=importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
    return mod
PREP=load_prepare_module()

def materialize_manifest_asset(photo):
    output=(DIST/photo['output']).resolve()
    if output.exists(): return
    download=PREP.resolve_download(photo)
    req=urllib.request.Request(download,headers={'User-Agent':PREP.USER_AGENT})
    raw=PREP.download_bytes(req)
    if len(raw)>20*1024*1024: raise ValueError('Photo exceeds size limit: '+photo['output'])
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
        if not photo.get('allowAnyRatio') and not (1.25<=image.width/image.height<=1.85):
            raise ValueError('Photo ratio out of policy: '+photo.get('source',''))
        mw=int(photo.get('minWidth',900)); mh=int(photo.get('minHeight',600))
        if image.width<mw or image.height<mh:
            raise ValueError(f'Photo too small {image.width}x{image.height}: '+photo.get('source',''))
        image.thumbnail((1280,960),Image.Resampling.LANCZOS)
        output.parent.mkdir(parents=True,exist_ok=True)
        temp=output.with_suffix('.tmp')
        image.save(temp,format='WEBP',quality=84)
        temp.replace(output)
    print('Recovered',photo['output'])

def main():
    before_path=Path('/tmp/greater-tokyo-before.json')
    if not before_path.exists():
        subprocess.run(['node','tools/audit-content.cjs',str(before_path)],cwd=ROOT,check=True)
    runtime=json.loads(before_path.read_text())
    idmap=json.loads((ROOT/'audits/id-migration-map.json').read_text())
    map_audit=json.loads((ROOT/'audits/map-audit.json').read_text())
    place_ids={int(x['legacyId']):x['newId'] for x in idmap['places'] if x.get('pref') in PREFSET}
    food_ids={}
    for x in idmap['foods']:
        if x.get('pref') in PREFSET:
            food_ids.setdefault((x['pref'],x['name']),[]).append(x['newId'])
    food_seen={}

    manifest=json.loads((ROOT/'tools/official-photo-assets.json').read_text())
    manifest_by_output={x.get('output'):x for x in manifest.get('photos',[]) if x.get('output')}
    manifest_by_place={int(x['placeId']):x for x in manifest.get('photos',[]) if x.get('placeId') is not None}
    manifest_by_food={(x.get('foodName') or ''):x for x in manifest.get('photos',[]) if x.get('foodName')}

    sr_text=(DIST/'photo-source-registry.js').read_text().strip()
    source_registry=json.loads(sr_text.removeprefix('globalThis.JATLAS_PHOTO_SOURCE_REGISTRY=').rstrip(';'))

    reg_path=DIST/'photo-registry-data.js'
    prefix='globalThis.JATLAS_PHOTO_REGISTRY_DATA='
    reg_text=reg_path.read_text().strip()
    if not reg_text.startswith(prefix): raise ValueError('Bad photo registry')
    registry=json.loads(reg_text[len(prefix):].rstrip(';'))
    registry['places']={k:v for k,v in registry.get('places',{}).items() if v.get('pref') not in PREFSET}
    registry['foods']={k:v for k,v in registry.get('foods',{}).items() if v.get('pref') not in PREFSET}

    recovered=[]; per_pref={p:{'places':0,'foods':0,'canonicalFiles':0} for p,_,_ in PREFS}

    for p in runtime['places']:
        pref=p.get('pref')
        if pref not in PREFSET: continue
        ident=int(p['id']); pic=p.get('photo') or {}
        src=clean_src(pic.get('src'))
        asset=None
        if src.startswith('http://') or src.startswith('https://'):
            asset=manifest_by_place.get(ident)
            if not asset: raise FileNotFoundError(f'External photo lacks manifest: {pref} {ident} {p["name"]}')
            src=asset['output']
        legacy=DIST/src
        if not legacy.exists():
            asset=manifest_by_output.get(src) or manifest_by_place.get(ident)
            if not asset: raise FileNotFoundError(f'Missing approved photo without recovery manifest: {src}')
            materialize_manifest_asset(asset); recovered.append(src)
        meta={}
        if src in source_registry: meta.update(source_registry[src])
        if asset is None: asset=manifest_by_output.get(src)
        if asset: meta.update({k:asset.get(k,'') for k in ('source','terms','author')})
        meta.update({k:v for k,v in pic.items() if k in ('source','author','terms','licenseUrl') and v})
        cid=place_ids.get(ident)
        if not cid: raise ValueError(f'Missing reserved place ID {pref} {ident} {p["name"]}')
        canonical=f'images/regions/greater-tokyo/{PREFSLUG[pref]}/places/{cid}-{place_slug(cid,(map_audit.get(str(ident)) or {}).get('query') or p.get('mapQuery') or '')}.webp'
        dest=DIST/canonical; dest.parent.mkdir(parents=True,exist_ok=True); shutil.copyfile(legacy,dest)
        registry['places'][cid]={
            'canonicalId':cid,'legacyId':ident,'pref':pref,'area':p.get('area',''),'town':p.get('town',''),
            'name':p['name'],'image':canonical,'legacyImage':src,
            'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),
            'source':meta.get('source') or pic.get('source') or '',
            'terms':meta.get('terms') or meta.get('licenseUrl') or pic.get('licenseUrl') or '',
            'author':meta.get('author') or '',
            'userPhoto':False,'heroEligible':True,'revision':1
        }
        per_pref[pref]['places']+=1; per_pref[pref]['canonicalFiles']+=1

    for row in runtime.get('prefectures',[]):
        pref=row.get('pref')
        if pref not in PREFSET: continue
        for f in row.get('foods',[]):
            name=f.get('name',''); pic=f.get('photo') or {}
            src=clean_src(pic.get('src') or f.get('image'))
            asset=None
            if src.startswith('http://') or src.startswith('https://'):
                asset=manifest_by_food.get(name)
                if not asset: raise FileNotFoundError(f'External food photo lacks manifest: {pref} {name}')
                src=asset['output']
            legacy=DIST/src
            if not legacy.exists():
                asset=manifest_by_output.get(src) or manifest_by_food.get(name)
                if not asset: raise FileNotFoundError(f'Missing food photo without recovery manifest: {pref} {name} {src}')
                materialize_manifest_asset(asset); recovered.append(src)
            meta={}
            if src in source_registry: meta.update(source_registry[src])
            if asset is None: asset=manifest_by_output.get(src)
            if asset: meta.update({k:asset.get(k,'') for k in ('source','terms','author')})
            meta.update({k:v for k,v in pic.items() if k in ('source','author','terms','licenseUrl') and v})
            key=(pref,name); ids=food_ids.get(key) or []
            ordinal=food_seen.get(key,0)
            if ordinal>=len(ids): raise ValueError(f'Missing reserved food ID {pref} {name} occurrence {ordinal+1}')
            cid=ids[ordinal]; food_seen[key]=ordinal+1
            canonical=f'images/regions/greater-tokyo/{PREFSLUG[pref]}/foods/{cid}-{food_slug(cid)}.webp'
            dest=DIST/canonical; dest.parent.mkdir(parents=True,exist_ok=True); shutil.copyfile(legacy,dest)
            registry['foods'][cid]={
                'canonicalId':cid,'legacyId':None,'pref':pref,'name':name,'image':canonical,'legacyImage':src,
                'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),
                'source':meta.get('source') or pic.get('source') or '',
                'terms':meta.get('terms') or meta.get('licenseUrl') or pic.get('licenseUrl') or '',
                'author':meta.get('author') or '',
                'userPhoto':False,'revision':1
            }
            per_pref[pref]['foods']+=1; per_pref[pref]['canonicalFiles']+=1

    expected={'사이타마':(23,6),'지바':(27,6),'도쿄':(54,20),'가나가와':(28,7)}
    for pref,(pc,fc) in expected.items():
        if per_pref[pref]['places']!=pc or per_pref[pref]['foods']!=fc:
            raise ValueError(f'Count mismatch {pref}: {per_pref[pref]}')

    existing=[p for p in registry.get('scope',{}).get('prefectures',[]) if p not in PREFSET]
    existing_regions=[r for r in registry.get('scope',{}).get('regions',[]) if r!='수도권']
    registry['scope']={'region':'수도권·'+('·'.join(existing_regions) if existing_regions else ''),'regions':['수도권']+existing_regions,'prefectures':[x[0] for x in PREFS]+existing}
    registry['generatedFrom']=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
    reg_path.write_text(prefix+json.dumps(registry,ensure_ascii=False,indent=2)+';\n')

    html=(DIST/'index.html').read_text()
    html=re.sub(r'photo-registry-data\.js\?v=[^"]+','photo-registry-data.js?v=20261007-greater-tokyo1',html)
    html=re.sub(r'photo-registry\.js\?v=[^"]+','photo-registry.js?v=20261007-greater-tokyo1',html)
    (DIST/'index.html').write_text(html)

    readme=(ROOT/'README.md').read_text()
    marker='의 관광지·음식 사진은 canonical 구조로 이전했습니다.'
    line=next((x for x in readme.splitlines() if 'canonical 구조로 이전했습니다.' in x and x.startswith('2026-10-')),None)
    if line and '**수도권(' not in line:
        new=line.replace('의 관광지·음식 사진은 canonical 구조로 이전했습니다.','와 **수도권(사이타마·지바·도쿄·가나가와)**의 관광지·음식 사진은 canonical 구조로 이전했습니다.')
        readme=readme.replace(line,new)
    (ROOT/'README.md').write_text(readme)

    total_places=sum(x['places'] for x in per_pref.values()); total_foods=sum(x['foods'] for x in per_pref.values())
    audit={
      'schemaVersion':1,'region':'수도권','status':'COMPLETE_CANONICAL','sourceCommit':registry['generatedFrom'],
      'prefectures':per_pref,
      'totals':{'places':total_places,'foods':total_foods,'canonicalRecords':total_places+total_foods,'canonicalFiles':total_places+total_foods,'missingCanonicalFiles':0},
      'recoveredLegacyAssets':sorted(set(recovered)),
      'recoveredLegacyAssetCount':len(set(recovered)),
      'guarantees':[
        'Canonical IDs and paths are authoritative for Greater Tokyo.',
        'Current runtime photo selections are preserved before canonical copy.',
        'Missing approved assets are recovered from their existing source manifest.',
        'Reserved IDs from audits/id-migration-map.json are preserved exactly.',
        'Canonical filenames contain only canonical ID plus normalized place/food name.',
        'No legacy image file is deleted during regional migration.'
      ]
    }
    (ROOT/'audits/greater-tokyo-migration-completion.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'ok':True,'places':total_places,'foods':total_foods,'recovered':len(set(recovered))},ensure_ascii=False))

if __name__=='__main__': main()
