#!/usr/bin/env python3
# hokuriku-canonical-migration-20261007-rerun2
import hashlib, importlib.util, io, json, re, shutil, subprocess, unicodedata, urllib.parse, urllib.request
from pathlib import Path
from PIL import Image, ImageOps
from unidecode import unidecode

ROOT=Path(__file__).resolve().parents[1]
DIST=ROOT/'dist'
PREFS=[
 ('도야마','16','toyama','toyama-expansion.js'),
 ('이시카와','17','ishikawa','ishikawa-expansion.js'),
 ('후쿠이','18','fukui','fukui-expansion.js'),
]
PREFSET={x[0] for x in PREFS}

def extract_object(text, marker, start=0):
    i=text.find(marker,start)
    if i<0:return None
    j=text.find('{',i+len(marker))
    if j<0:return None
    depth=0;quote=None;esc=False
    for k in range(j,len(text)):
        ch=text[k]
        if quote:
            if esc:esc=False
            elif ch=='\\':esc=True
            elif ch==quote:quote=None
            continue
        if ch in ("'",'"'):quote=ch
        elif ch=='{':depth+=1
        elif ch=='}':
            depth-=1
            if depth==0:return text[j:k+1]
    return None

def parse_fields(obj):
    if not obj:return {}
    try:return json.loads(obj)
    except Exception:pass
    out={}
    for key in ('src','source','author','licenseUrl','terms','filename','alt'):
        m=re.search(r"""(?:["']?"""+re.escape(key)+r"""["']?)\s*:\s*(["'])(.*?)\1""",obj,re.S)
        if m:out[key]=m.group(2)
    return out

def record_for_key(text,key):
    needle='"'+str(key)+'":';pos=0;last={}
    while True:
        i=text.find(needle,pos)
        if i<0:break
        obj=extract_object(text[i:],needle)
        if obj:
            f=parse_fields(obj)
            if f:last=f
        pos=i+len(needle)
    return last

def explicit_place_record(text, ident):
    last={}
    for needle in (f'data.photos["{ident}"]=',f"data.photos['{ident}']=",f'data.photos[{ident}]='):
        pos=0
        while True:
            i=text.find(needle,pos)
            if i<0:break
            f=parse_fields(extract_object(text[i:],needle))
            if f.get('src'):last=f
            pos=i+len(needle)
    return last

def commons_source(filename):
    return 'https://commons.wikimedia.org/wiki/File:'+urllib.parse.quote(filename.replace(' ','_'),safe='()_,-.')

def clean_src(src):
    s=str(src or '')
    if s.startswith(('http://','https://')):return s
    return s.split('?',1)[0].split('#',1)[0].removeprefix('./')

def slug_name(name):
    s=unidecode(unicodedata.normalize('NFKC',str(name or '')).strip()).lower()
    s=re.sub(r'[^0-9a-z]+','-',s)
    return re.sub(r'-+','-',s).strip('-') or 'item'

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
    if len(raw)>20*1024*1024:raise ValueError('Photo exceeds size limit: '+photo['output'])
    expected=photo.get('sha256')
    if expected and hashlib.sha256(raw).hexdigest()!=expected:raise ValueError('Source changed; review required: '+photo.get('source',''))
    if not expected and not photo.get('allowUnpinned'):raise ValueError('Unpinned source requires review: '+photo.get('source',''))
    with Image.open(io.BytesIO(raw)) as original:
        image=ImageOps.exif_transpose(original).convert('RGB')
        if photo.get('cropRatio'):image=PREP.crop_to_ratio(image,photo['cropRatio'],photo.get('cropX',.5),photo.get('cropY',.5))
        upscale=int(photo.get('upscaleWidth',0) or 0)
        if upscale and image.width<upscale:image=image.resize((upscale,max(1,round(image.height*upscale/image.width))),Image.Resampling.LANCZOS)
        mw=int(photo.get('minWidth',0) or 0);mh=int(photo.get('minHeight',0) or 0)
        if image.width<mw or image.height<mh:raise ValueError(f'Photo too small {image.width}x{image.height}: '+photo.get('source',''))
        image.thumbnail((1280,960),Image.Resampling.LANCZOS)
        output.parent.mkdir(parents=True,exist_ok=True)
        temp=output.with_suffix('.tmp');image.save(temp,format='WEBP',quality=84);temp.replace(output)

def write_canonical(legacy,dest):
    dest.parent.mkdir(parents=True,exist_ok=True)
    if legacy.suffix.lower()=='.webp':shutil.copyfile(legacy,dest)
    else:
        with Image.open(legacy) as original:
            image=ImageOps.exif_transpose(original).convert('RGB');image.thumbnail((1280,960),Image.Resampling.LANCZOS);image.save(dest,format='WEBP',quality=88)

def main():
    commons=json.loads(extract_object((DIST/'commons-local-images.js').read_text(),'Object.assign(globalThis.JATLAS_COMMONS_LOCAL||{},'))
    qa_text=(DIST/'photo-qa-review.js').read_text()
    final_text=(DIST/'photo-final-overrides.js').read_text()
    source_registry=json.loads((DIST/'photo-source-registry.js').read_text().strip().removeprefix('globalThis.JATLAS_PHOTO_SOURCE_REGISTRY=').rstrip(';'))
    manifest=json.loads((ROOT/'tools/official-photo-assets.json').read_text())
    manifest_by_output={x.get('output'):x for x in manifest.get('photos',[]) if x.get('output')}
    manifest_by_place={int(x['placeId']):x for x in manifest.get('photos',[]) if x.get('placeId') is not None}
    idmap=json.loads((ROOT/'audits/id-migration-map.json').read_text())
    baseline=json.loads((ROOT/'audits/structure-migration-baseline.json').read_text())
    baseline_places={int(x['legacyId']):x for x in baseline['places']}
    food_ids={(x['pref'],x['name']):x['newId'] for x in idmap['foods'] if x.get('pref') in PREFSET}

    reg_path=DIST/'photo-registry-data.js';prefix='globalThis.JATLAS_PHOTO_REGISTRY_DATA='
    reg_text=reg_path.read_text().strip()
    if not reg_text.startswith(prefix):raise ValueError('Bad photo registry')
    registry=json.loads(reg_text[len(prefix):].rstrip(';'))
    registry['places']={k:v for k,v in registry.get('places',{}).items() if v.get('pref') not in PREFSET}
    registry['foods']={k:v for k,v in registry.get('foods',{}).items() if v.get('pref') not in PREFSET}

    recovered=[];converted=[];per_pref={}
    for pref,code,prefslug,expansion_file in PREFS:
        text=(DIST/expansion_file).read_text()
        data=json.loads(extract_object(text,'const data='))
        pfiles=json.loads(extract_object(text,'const photoFiles=') or '{}')
        ffiles=json.loads(extract_object(text,'const foodPhotoFiles=') or '{}')
        expansion_places={int(x['id']):x for x in data.get('places',[])}
        rows=[x for x in idmap['places'] if x.get('pref')==pref]
        pc=fc=0
        for maprow in rows:
            ident=int(maprow['legacyId']);cid=maprow['newId'];base=baseline_places.get(ident)
            if not base:raise ValueError(f'Missing baseline place {pref} {ident}')
            pic=dict(base.get('activePhoto') or {})
            filename=pfiles.get(str(ident))
            if filename:pic={'src':commons.get(filename) or ('https://commons.wikimedia.org/wiki/Special:FilePath/'+urllib.parse.quote(filename)+'?width=960'),'source':commons_source(filename),'filename':filename}
            explicit=explicit_place_record(text,ident)
            if explicit.get('src'):pic.update(explicit)
            qa=record_for_key(qa_text,ident)
            if qa.get('src'):pic.update(qa)
            fin=record_for_key(final_text,ident)
            if fin.get('src'):pic.update(fin)
            raw=clean_src(pic.get('src'));asset=None
            if raw.startswith(('http://','https://')):
                asset=manifest_by_place.get(ident)
                if not asset:raise FileNotFoundError(f'External active photo lacks recovery manifest: {pref} {ident} {maprow["name"]}')
                raw=asset['output']
            legacy=DIST/raw
            if not legacy.exists():
                asset=manifest_by_output.get(raw) or manifest_by_place.get(ident)
                if not asset:raise FileNotFoundError(f'Missing approved legacy photo without manifest recovery: {pref} {ident} {raw}')
                materialize_manifest_asset(asset);recovered.append(raw)
            meta={}
            if raw in source_registry:meta.update(source_registry[raw])
            if asset is None:asset=manifest_by_output.get(raw)
            if asset:meta.update({k:asset.get(k,'') for k in ('source','terms','author')})
            meta.update({k:v for k,v in pic.items() if k in ('source','author','terms','licenseUrl') and v})
            canonical=f'images/regions/hokuriku/{prefslug}/places/{cid}-{slug_name(maprow["name"])}.webp'
            dest=DIST/canonical;was_nonwebp=legacy.suffix.lower()!='.webp';write_canonical(legacy,dest)
            if was_nonwebp:converted.append(raw)
            registry['places'][cid]={
              'canonicalId':cid,'legacyId':ident,'pref':pref,'area':base.get('area',''),'town':base.get('town',''),'name':maprow['name'],
              'image':canonical,'legacyImage':raw,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),
              'source':meta.get('source') or pic.get('source') or (base.get('activePhoto') or {}).get('source',''),
              'terms':meta.get('terms') or meta.get('licenseUrl') or (base.get('activePhoto') or {}).get('terms',''),
              'author':meta.get('author') or (base.get('activePhoto') or {}).get('author',''),
              'userPhoto':bool((base.get('activePhoto') or {}).get('userPhoto',False)),'heroEligible':True,'revision':1
            };pc+=1

        for f in data.get('foods',[]):
            name=f['name'];cid=food_ids.get((pref,name))
            if not cid:continue
            filename=ffiles.get(name);pic={}
            if filename:pic={'src':commons.get(filename) or ('https://commons.wikimedia.org/wiki/Special:FilePath/'+urllib.parse.quote(filename)+'?width=960'),'source':commons_source(filename),'filename':filename}
            qa=record_for_key(qa_text,name)
            if qa.get('src'):pic.update(qa)
            raw=clean_src(pic.get('src'))
            if not raw or raw.startswith(('http://','https://')):raise ValueError(f'No local food photo for {pref} {name}: {raw}')
            legacy=DIST/raw
            if not legacy.exists():raise FileNotFoundError(f'Missing food photo: {pref} {name} {raw}')
            meta={}
            if raw in source_registry:meta.update(source_registry[raw])
            if raw in manifest_by_output:
                m=manifest_by_output[raw];meta.update({k:m.get(k,'') for k in ('source','terms','author')})
            meta.update({k:v for k,v in pic.items() if k in ('source','author','terms','licenseUrl') and v})
            canonical=f'images/regions/hokuriku/{prefslug}/foods/{cid}-{slug_name(name)}.webp'
            dest=DIST/canonical;write_canonical(legacy,dest)
            registry['foods'][cid]={
              'canonicalId':cid,'legacyId':None,'pref':pref,'name':name,'image':canonical,'legacyImage':raw,
              'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'source':meta.get('source') or pic.get('source') or '',
              'terms':meta.get('terms') or meta.get('licenseUrl') or pic.get('licenseUrl') or '','author':meta.get('author') or '',
              'userPhoto':False,'revision':1
            };fc+=1
        per_pref[pref]={'places':pc,'foods':fc,'canonicalFiles':pc+fc}

    existing=[p for p in registry.get('scope',{}).get('prefectures',[]) if p not in PREFSET]
    existing_regions=[r for r in registry.get('scope',{}).get('regions',[]) if r!='호쿠리쿠']
    registry['scope']={'region':'호쿠리쿠 포함 마이그레이션 완료 권역','regions':['호쿠리쿠']+existing_regions,'prefectures':[x[0] for x in PREFS]+existing}
    registry['generatedFrom']=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
    reg_path.write_text(prefix+json.dumps(registry,ensure_ascii=False,indent=2)+';\n')

    html=(DIST/'index.html').read_text()
    html=re.sub(r'photo-registry-data\.js\?v=[^"]+','photo-registry-data.js?v=20261007-hokuriku1',html)
    html=re.sub(r'photo-registry\.js\?v=[^"]+','photo-registry.js?v=20261007-hokuriku1',html)
    html=re.sub(r'map-canonical-data\.js\?v=[^"]+','map-canonical-data.js?v=20261007-hokuriku1',html)
    html=re.sub(r'map\.js\?v=[^"]+','map.js?v=20261007-hokuriku1',html)
    (DIST/'index.html').write_text(html)

    tp=sum(x['places'] for x in per_pref.values());tf=sum(x['foods'] for x in per_pref.values())
    audit={'schemaVersion':1,'region':'호쿠리쿠','status':'COMPLETE_CANONICAL','sourceCommit':registry['generatedFrom'],'prefectures':per_pref,
      'totals':{'places':tp,'foods':tf,'canonicalRecords':tp+tf,'canonicalFiles':tp+tf,'missingCanonicalFiles':0},
      'recoveredLegacyAssets':sorted(set(recovered)),'recoveredLegacyAssetCount':len(set(recovered)),
      'convertedLegacyAssets':sorted(set(converted)),'convertedLegacyAssetCount':len(set(converted)),
      'guarantees':['Canonical IDs and paths are authoritative for Hokuriku.','Current approved QA/final photo overrides take precedence over older mappings.','Canonical filenames contain only the fixed ID and normalized place/food name.','Legacy numeric place IDs remain compatibility keys until nationwide ID cutover.','No legacy image deletion is performed by this migration.']}
    (ROOT/'audits/hokuriku-migration-completion.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(audit,ensure_ascii=False))

if __name__=='__main__':main()
