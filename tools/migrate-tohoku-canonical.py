#!/usr/bin/env python3
# rerun-marker-20261006-1
import hashlib, importlib.util, io, json, re, shutil, subprocess, unicodedata, urllib.parse, urllib.request
from pathlib import Path
from PIL import Image, ImageOps

ROOT=Path(__file__).resolve().parents[1]
DIST=ROOT/'dist'
PREFS=[
 ('아오모리','02','aomori','aomori-expansion.js'),
 ('이와테','03','iwate','iwate-expansion.js'),
 ('미야기','04','miyagi','miyagi-expansion.js'),
 ('아키타','05','akita','akita-expansion.js'),
 ('야마가타','06','yamagata','yamagata-expansion.js'),
 ('후쿠시마','07','fukushima','fukushima-expansion.js'),
]
PREFSET={x[0] for x in PREFS}

def extract_object(text, marker, start=0):
    i=text.find(marker,start)
    if i<0:return None
    j=text.find('{',i+len(marker))
    if j<0:return None
    depth=0; quote=None; esc=False
    for k in range(j,len(text)):
        ch=text[k]
        if quote:
            if esc: esc=False
            elif ch=='\\': esc=True
            elif ch==quote: quote=None
            continue
        if ch in ("'",'"'): quote=ch
        elif ch=='{': depth+=1
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
        m=re.search(r"(?:[\\\"']?"+re.escape(key)+r"[\\\"']?)\\s*:\\s*([\\\"'])(.*?)\\1",obj,re.S)
        if m:out[key]=m.group(2)
    return out

def record_for_key(text,key):
    needle='"'+str(key)+'":'
    pos=0; last={}
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
    for needle in (
        f"data.photos['{ident}']=",
        f'data.photos["{ident}"]=',
        f"data.photos[{ident}]=",
    ):
        i=text.find(needle)
        if i<0:
            continue
        body_start=text.find('{',i+len(needle))
        body_end=text.find('};',body_start)
        if body_start>=0 and body_end>=0:
            return parse_fields(text[body_start:body_end+1])
    return {}
def commons_source(filename):
    return 'https://commons.wikimedia.org/wiki/File:'+urllib.parse.quote(filename.replace(' ','_'),safe='()_,-.')

def slugify(filename,kind,serial):
    stem=Path(filename or '').stem
    s=unicodedata.normalize('NFKD',stem).encode('ascii','ignore').decode().lower()
    s=re.sub(r'[^a-z0-9]+','-',s).strip('-')
    s=re.sub(r'-(?:jpg|jpeg|png|webp)$','',s)
    if len(re.sub(r'[^a-z]','',s))<3:s=f'{kind}-{serial:04d}'
    return s[:72].strip('-') or f'{kind}-{serial:04d}'

def load_prepare_module():
    p=ROOT/'tools/prepare-official-photos.py'
    spec=importlib.util.spec_from_file_location('jatlas_prepare_official',p)
    mod=importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
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
    commons_text=(DIST/'commons-local-images.js').read_text()
    commons=json.loads(extract_object(commons_text,'Object.assign(globalThis.JATLAS_COMMONS_LOCAL||{},'))
    qa_text=(DIST/'photo-qa-review.js').read_text()
    final_text=(DIST/'photo-final-overrides.js').read_text()
    sr_text=(DIST/'photo-source-registry.js').read_text().strip()
    source_registry=json.loads(sr_text.removeprefix('globalThis.JATLAS_PHOTO_SOURCE_REGISTRY=').rstrip(';'))
    manifest=json.loads((ROOT/'tools/official-photo-assets.json').read_text())
    manifest_by_output={x.get('output'):x for x in manifest.get('photos',[]) if x.get('output')}

    reg_path=DIST/'photo-registry-data.js'
    prefix='globalThis.JATLAS_PHOTO_REGISTRY_DATA='
    reg_text=reg_path.read_text().strip()
    if not reg_text.startswith(prefix):raise ValueError('Bad photo registry')
    registry=json.loads(reg_text[len(prefix):].rstrip(';'))
    registry['places']={k:v for k,v in registry.get('places',{}).items() if v.get('pref') not in PREFSET}
    registry['foods']={k:v for k,v in registry.get('foods',{}).items() if v.get('pref') not in PREFSET}

    recovered=[]; per_pref={}
    for pref,code,prefslug,expansion_file in PREFS:
        text=(DIST/expansion_file).read_text()
        data=json.loads(extract_object(text,'const data='))
        pfiles=json.loads(extract_object(text,'const photoFiles=') or '{}')
        ffiles=json.loads(extract_object(text,'const foodPhotoFiles=') or '{}')
        pc=fc=0

        for idx,p in enumerate(data['places'],1):
            ident=str(p['id']); filename=pfiles.get(ident)
            pic={}
            if filename:
                pic={'src':commons.get(filename),'source':commons_source(filename),'filename':filename}
            explicit=explicit_place_record(text,ident)
            if explicit.get('src'):pic.update(explicit)
            qa=record_for_key(qa_text,ident)
            if qa.get('src'):pic.update(qa)
            fin=record_for_key(final_text,ident)
            if fin.get('src'):pic.update(fin)
            src=pic.get('src')
            if not src:raise ValueError(f'No active photo path for {pref} {ident} {p["name"]}')
            meta={}
            if src in source_registry:meta.update(source_registry[src])
            if src in manifest_by_output:
                m=manifest_by_output[src]
                meta.update({k:m.get(k,'') for k in ('source','terms','author')})
            meta.update({k:v for k,v in pic.items() if k in ('source','author','terms','licenseUrl') and v})
            legacy=DIST/src
            if not legacy.exists():
                asset=manifest_by_output.get(src)
                if not asset:raise FileNotFoundError(f'Missing approved legacy photo without manifest recovery: {src}')
                materialize_manifest_asset(asset); recovered.append(src)
            canonical=f'images/regions/tohoku/{prefslug}/places/{code}-P{idx:04d}-{slugify(filename or pic.get("filename"),"place",idx)}.webp'
            dest=DIST/canonical; dest.parent.mkdir(parents=True,exist_ok=True); shutil.copyfile(legacy,dest)
            cid=f'{code}-P{idx:04d}'
            registry['places'][cid]={
                'canonicalId':cid,'legacyId':p['id'],'pref':pref,'area':p.get('area',''),'town':p.get('town',''),
                'name':p['name'],'image':canonical,'legacyImage':src,
                'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),
                'source':meta.get('source') or pic.get('source') or '',
                'terms':meta.get('terms') or meta.get('licenseUrl') or pic.get('licenseUrl') or '',
                'author':meta.get('author') or '',
                'userPhoto':False,'heroEligible':True,'revision':1
            }; pc+=1

        for idx,f in enumerate(data['foods'],1):
            filename=ffiles.get(f['name']); pic={}
            if filename:pic={'src':commons.get(filename),'source':commons_source(filename),'filename':filename}
            qa=record_for_key(qa_text,f['name'])
            if qa.get('src'):pic.update(qa)
            src=pic.get('src')
            if not src:raise ValueError(f'No active food photo path for {pref} {f["name"]}')
            meta={}
            if src in source_registry:meta.update(source_registry[src])
            if src in manifest_by_output:
                m=manifest_by_output[src];meta.update({k:m.get(k,'') for k in ('source','terms','author')})
            meta.update({k:v for k,v in pic.items() if k in ('source','author','terms','licenseUrl') and v})
            legacy=DIST/src
            if not legacy.exists():
                asset=manifest_by_output.get(src)
                if not asset:raise FileNotFoundError(f'Missing approved food photo without manifest recovery: {src}')
                materialize_manifest_asset(asset); recovered.append(src)
            cid=f'{code}-F{idx:04d}'
            canonical=f'images/regions/tohoku/{prefslug}/foods/{cid}-{slugify(filename or pic.get("filename"),"food",idx)}.webp'
            dest=DIST/canonical; dest.parent.mkdir(parents=True,exist_ok=True); shutil.copyfile(legacy,dest)
            registry['foods'][cid]={
                'canonicalId':cid,'legacyId':None,'pref':pref,'name':f['name'],'image':canonical,'legacyImage':src,
                'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),
                'source':meta.get('source') or pic.get('source') or '',
                'terms':meta.get('terms') or meta.get('licenseUrl') or pic.get('licenseUrl') or '',
                'author':meta.get('author') or '',
                'userPhoto':False,'revision':1
            }; fc+=1
        per_pref[pref]={'places':pc,'foods':fc,'canonicalFiles':pc+fc}

    existing=[p for p in registry.get('scope',{}).get('prefectures',[]) if p not in PREFSET]
    registry['scope']={'region':'도카이·도호쿠','regions':['도호쿠','도카이'],'prefectures':[x[0] for x in PREFS]+existing}
    registry['generatedFrom']=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
    reg_path.write_text(prefix+json.dumps(registry,ensure_ascii=False,indent=2)+';\n')

    html=(DIST/'index.html').read_text()
    html=re.sub(r'photo-registry-data\.js\?v=[^"]+','photo-registry-data.js?v=20261006-tohoku1',html)
    html=re.sub(r'photo-registry\.js\?v=[^"]+','photo-registry.js?v=20261006-tohoku1',html)
    (DIST/'index.html').write_text(html)

    readme=(ROOT/'README.md').read_text()
    old='2026-10-06 기준으로 **도카이(기후·시즈오카·아이치·미에)**의 관광지·음식 사진은 canonical 구조로 이전했습니다. 다른 권역은 기존 구조를 유지하며, 전국 이전이 끝날 때까지 구형 이미지 폴더와 override 계층은 호환용으로 보존합니다.'
    new='2026-10-06 기준으로 **도카이(기후·시즈오카·아이치·미에)**와 **도호쿠(아오모리·이와테·미야기·아키타·야마가타·후쿠시마)**의 관광지·음식 사진은 canonical 구조로 이전했습니다. 아직 이전하지 않은 권역은 기존 구조를 유지하며, 전국 이전이 끝날 때까지 구형 이미지 폴더와 override 계층은 호환용으로 보존합니다.'
    if old in readme:readme=readme.replace(old,new)
    readme=readme.replace('dist/images/regions/: 새 이미지 구조. 권역/도도부현/places|foods 순서','dist/images/regions/: 새 이미지 구조. 권역/도도부현/places|foods 순서 (현재 도카이·도호쿠 canonical)')
    (ROOT/'README.md').write_text(readme)

    total_places=sum(x['places'] for x in per_pref.values()); total_foods=sum(x['foods'] for x in per_pref.values())
    audit={
      'schemaVersion':1,'region':'도호쿠','status':'COMPLETE_CANONICAL','sourceCommit':registry['generatedFrom'],
      'prefectures':per_pref,
      'totals':{'places':total_places,'foods':total_foods,'canonicalRecords':total_places+total_foods,'canonicalFiles':total_places+total_foods,'missingCanonicalFiles':0},
      'recoveredLegacyAssets':sorted(set(recovered)),
      'recoveredLegacyAssetCount':len(set(recovered)),
      'guarantees':[
        'Canonical IDs and paths are authoritative for Tohoku.',
        'Previously approved missing assets are recovered from their pinned source manifest before canonical copy.',
        'Legacy numeric place IDs remain compatibility keys until nationwide ID cutover.',
        'No legacy image file is deleted during regional migration.'
      ]
    }
    (ROOT/'audits/tohoku-migration-completion.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'ok':True,'places':total_places,'foods':total_foods,'recovered':len(set(recovered))},ensure_ascii=False))

if __name__=='__main__':main()
