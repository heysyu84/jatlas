#!/usr/bin/env python3
# koshinetsu-canonical-migration-20261007
import hashlib, importlib.util, io, json, re, shutil, subprocess, urllib.parse, urllib.request
from pathlib import Path
from PIL import Image, ImageOps

ROOT=Path(__file__).resolve().parents[1]
DIST=ROOT/'dist'
PREFS=[
 ('니가타','15','niigata','niigata-expansion.js'),
 ('야마나시','19','yamanashi','yamanashi-expansion.js'),
 ('나가노','20','nagano','nagano-expansion.js'),
]
PREFSET={x[0] for x in PREFS}
CANONICAL_SLUGS={
  "15-P0001": "bandai-bridge",
  "15-P0002": "niigata-city-history-museum-minatopia",
  "15-P0003": "toki-messe-observation-room",
  "15-P0004": "pia-bandai",
  "15-P0005": "yamamoto-isoroku-memorial-museum",
  "15-P0006": "echigo-hillside-park",
  "15-P0007": "kiyotsu-gorge-tunnel",
  "15-P0008": "hoshitoge-rice-terraces",
  "15-P0009": "echigo-yuzawa-onsen",
  "15-P0010": "yuzawa-kogen-ropeway",
  "15-P0011": "untoan-temple",
  "15-P0012": "hakkaisan-ropeway",
  "15-P0013": "sado-gold-mine",
  "15-P0014": "kitazawa-flotation-plant",
  "15-P0015": "shukunegi",
  "15-P0016": "senkaku-bay-ageshima",
  "15-P0017": "toki-no-mori-park",
  "15-P0018": "myoko-kogen-imori-pond",
  "15-P0019": "akakura-onsen",
  "15-P0020": "takada-castle-site-park",
  "15-P0021": "kasugayama-castle-ruins",
  "15-P0022": "fossa-magna-museum",
  "15-P0023": "kotakigawa-jade-gorge",
  "15-P0024": "oyashirazu",
  "15-F0001": "nodoguro",
  "15-F0002": "noppe",
  "15-F0003": "niigata-tare-katsudon",
  "15-F0004": "tochio-aburaage",
  "15-F0005": "murakami-salmon",
  "15-F0006": "sado-wild-yellowtail",
  "15-F0007": "sasa-dango",
  "15-F0008": "hegi-soba",
  "19-P0001": "kai-zenkoji",
  "19-P0002": "senga-falls",
  "19-P0003": "ojiragawa-gorge",
  "19-P0004": "saruhashi",
  "19-P0005": "mt-fuji-panoramic-ropeway",
  "19-P0006": "fuji-q-highland",
  "19-P0007": "fujisan-world-heritage-center",
  "19-P0008": "takeda-shrine",
  "19-P0009": "maizuru-castle-park",
  "19-P0010": "koshu-yume-koji",
  "19-P0011": "isawa-onsen",
  "19-P0012": "lake-kawaguchi",
  "19-P0013": "oishi-park",
  "19-P0014": "kawaguchi-asama-shrine",
  "19-P0015": "saiko-iyashi-no-sato-nenba",
  "19-P0016": "kitaguchi-hongu-fuji-sengen-shrine",
  "19-P0017": "arakurayama-sengen-park",
  "19-P0018": "oshino-hakkai",
  "19-P0019": "lake-yamanaka",
  "19-P0020": "shosenkyo",
  "19-P0021": "shosenkyo-ropeway",
  "19-P0022": "seisenryo",
  "19-P0023": "kiyosato-highland",
  "19-P0024": "katsunuma-grape-town",
  "19-P0025": "chateau-mercian-katsunuma-winery",
  "19-P0026": "erinji",
  "19-P0027": "fuefukigawa-fruit-park",
  "19-P0028": "minobusan-kuonji",
  "19-P0029": "minobusan-ropeway",
  "19-P0030": "narada-onsen",
  "19-P0031": "lake-motosu",
  "19-F0001": "koshu-wine",
  "19-F0002": "torimotsuni",
  "19-F0003": "peach",
  "19-F0004": "shingen-mochi",
  "19-F0005": "awabi-no-nigai",
  "19-F0006": "yoshida-udon",
  "19-F0007": "grapes",
  "19-F0008": "hoto",
  "20-P0001": "zenkoji",
  "20-P0002": "togakushi-shrine-okusha",
  "20-P0003": "togakushi-folk-ninja-museum",
  "20-P0004": "jigokudani-monkey-park",
  "20-P0005": "shibu-onsen",
  "20-P0006": "matsumoto-castle",
  "20-P0007": "nawate-street",
  "20-P0008": "kamikochi",
  "20-P0009": "daio-wasabi-farm",
  "20-P0010": "hotaka-shrine",
  "20-P0011": "old-karuizawa-ginza",
  "20-P0012": "shiraito-falls",
  "20-P0013": "karuizawa-taliesin",
  "20-P0014": "komoro-castle-kaikoen",
  "20-P0015": "suwa-taisha-kamisha-honmiya",
  "20-P0016": "lake-suwa",
  "20-P0017": "kirigamine-highland",
  "20-P0018": "tateshina-highland-mishaka-pond",
  "20-P0019": "hakuba-happo-pond",
  "20-P0020": "tateyama-kurobe-ogizawa",
  "20-P0021": "lake-kizaki",
  "20-P0022": "tsumago-juku",
  "20-P0023": "narai-juku",
  "20-P0024": "mount-ontake-otaki-trailhead",
  "20-F0001": "koi-koku",
  "20-F0002": "gohei-mochi",
  "20-F0003": "nozawana-zuke",
  "20-F0004": "sanzoku-yaki",
  "20-F0005": "shinshu-apples",
  "20-F0006": "shinshu-soba",
  "20-F0007": "shinshu-salmon",
  "20-F0008": "oyaki"
}

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
        m=re.search(r"""(?:["']?"""+re.escape(key)+r"""["']?)\s*:\s*(["'])(.*?)\1""",obj,re.S)
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
    last={}
    for needle in (f'data.photos["{ident}"]=',f"data.photos['{ident}']=",f'data.photos[{ident}]='):
        pos=0
        while True:
            i=text.find(needle,pos)
            if i<0:break
            obj=extract_object(text[i:],needle)
            f=parse_fields(obj)
            if f.get('src'):last=f
            pos=i+len(needle)
    return last

def commons_source(filename):
    return 'https://commons.wikimedia.org/wiki/File:'+urllib.parse.quote(filename.replace(' ','_'),safe='()_,-.')

def clean_src(src):
    s=str(src or '')
    if s.startswith('http://') or s.startswith('https://'):return s
    return s.split('?',1)[0].split('#',1)[0].removeprefix('./')

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
        mw=int(photo.get('minWidth',0) or 0);mh=int(photo.get('minHeight',0) or 0)
        if image.width<mw or image.height<mh:
            raise ValueError(f'Photo too small {image.width}x{image.height}: '+photo.get('source',''))
        image.thumbnail((1280,960),Image.Resampling.LANCZOS)
        output.parent.mkdir(parents=True,exist_ok=True)
        temp=output.with_suffix('.tmp')
        image.save(temp,format='WEBP',quality=84)
        temp.replace(output)
    print('Recovered',photo['output'])

def write_canonical(legacy,dest):
    dest.parent.mkdir(parents=True,exist_ok=True)
    if legacy.suffix.lower()=='.webp':
        shutil.copyfile(legacy,dest)
    else:
        with Image.open(legacy) as original:
            image=ImageOps.exif_transpose(original).convert('RGB')
            image.thumbnail((1280,960),Image.Resampling.LANCZOS)
            image.save(dest,format='WEBP',quality=88)
        print('Converted legacy image',legacy.relative_to(DIST),'->',dest.relative_to(DIST))

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
    place_ids={int(x['legacyId']):x['newId'] for x in idmap['places'] if x.get('pref') in PREFSET}
    food_ids={(x['pref'],x['name']):x['newId'] for x in idmap['foods'] if x.get('pref') in PREFSET}

    reg_path=DIST/'photo-registry-data.js'
    prefix='globalThis.JATLAS_PHOTO_REGISTRY_DATA='
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
        pc=fc=0

        for maprow in [x for x in idmap['places'] if x.get('pref')==pref]:
            ident=int(maprow['legacyId']);cid=maprow['newId']
            base=baseline_places.get(ident)
            if not base:raise ValueError(f'Missing baseline place {pref} {ident}')
            p=expansion_places.get(ident)
            pic=dict(base.get('activePhoto') or {})
            if p:
                filename=pfiles.get(str(ident))
                if filename:
                    pic={'src':commons.get(filename) or ('https://commons.wikimedia.org/wiki/Special:FilePath/'+urllib.parse.quote(filename)+'?width=960'),'source':commons_source(filename),'filename':filename}
                explicit=explicit_place_record(text,ident)
                if explicit.get('src'):pic.update(explicit)
            qa=record_for_key(qa_text,ident)
            if qa.get('src'):pic.update(qa)
            fin=record_for_key(final_text,ident)
            if fin.get('src'):pic.update(fin)
            raw=clean_src(pic.get('src'))
            asset=None
            if raw.startswith('http://') or raw.startswith('https://'):
                asset=manifest_by_place.get(ident)
                if not asset:raise FileNotFoundError(f'External active photo lacks recovery manifest: {pref} {ident} {maprow["name"]}')
                raw=asset['output']
            legacy=DIST/raw
            if not legacy.exists():
                asset=manifest_by_output.get(raw) or manifest_by_place.get(ident)
                if not asset:raise FileNotFoundError(f'Missing approved legacy photo without manifest recovery: {raw}')
                materialize_manifest_asset(asset);recovered.append(raw)
            meta={}
            if raw in source_registry:meta.update(source_registry[raw])
            if asset is None:asset=manifest_by_output.get(raw)
            if asset:meta.update({k:asset.get(k,'') for k in ('source','terms','author')})
            meta.update({k:v for k,v in pic.items() if k in ('source','author','terms','licenseUrl') and v})
            slug=CANONICAL_SLUGS[cid]
            canonical=f'images/regions/koshinetsu/{prefslug}/places/{cid}-{slug}.webp'
            dest=DIST/canonical
            was_nonwebp=legacy.suffix.lower()!='.webp'
            write_canonical(legacy,dest)
            if was_nonwebp:converted.append(raw)
            registry['places'][cid]={
              'canonicalId':cid,'legacyId':ident,'pref':pref,'area':base.get('area',''),'town':base.get('town',''),
              'name':maprow['name'],'image':canonical,'legacyImage':raw,
              'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),
              'source':meta.get('source') or pic.get('source') or (base.get('activePhoto') or {}).get('source',''),
              'terms':meta.get('terms') or meta.get('licenseUrl') or (base.get('activePhoto') or {}).get('terms',''),
              'author':meta.get('author') or (base.get('activePhoto') or {}).get('author',''),
              'userPhoto':bool((base.get('activePhoto') or {}).get('userPhoto',False)),
              'heroEligible':True,'revision':1
            };pc+=1

        for f in data.get('foods',[]):
            name=f['name'];cid=food_ids.get((pref,name))
            if not cid:continue
            filename=ffiles.get(name);pic={}
            if filename:
                pic={'src':commons.get(filename) or ('https://commons.wikimedia.org/wiki/Special:FilePath/'+urllib.parse.quote(filename)+'?width=960'),'source':commons_source(filename),'filename':filename}
            qa=record_for_key(qa_text,name)
            if qa.get('src'):pic.update(qa)
            raw=clean_src(pic.get('src'))
            if not raw or raw.startswith('http://') or raw.startswith('https://'):
                raise ValueError(f'No local food photo for {pref} {name}: {raw}')
            legacy=DIST/raw
            if not legacy.exists():raise FileNotFoundError(f'Missing food photo: {raw}')
            meta={}
            if raw in source_registry:meta.update(source_registry[raw])
            if raw in manifest_by_output:
                m=manifest_by_output[raw];meta.update({k:m.get(k,'') for k in ('source','terms','author')})
            meta.update({k:v for k,v in pic.items() if k in ('source','author','terms','licenseUrl') and v})
            slug=CANONICAL_SLUGS[cid]
            canonical=f'images/regions/koshinetsu/{prefslug}/foods/{cid}-{slug}.webp'
            dest=DIST/canonical
            write_canonical(legacy,dest)
            registry['foods'][cid]={
              'canonicalId':cid,'legacyId':None,'pref':pref,'name':name,'image':canonical,'legacyImage':raw,
              'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),
              'source':meta.get('source') or pic.get('source') or '',
              'terms':meta.get('terms') or meta.get('licenseUrl') or pic.get('licenseUrl') or '',
              'author':meta.get('author') or '',
              'userPhoto':False,'revision':1
            };fc+=1
        per_pref[pref]={'places':pc,'foods':fc,'canonicalFiles':pc+fc}

    existing=[p for p in registry.get('scope',{}).get('prefectures',[]) if p not in PREFSET]
    existing_regions=[r for r in registry.get('scope',{}).get('regions',[]) if r!='고신에쓰']
    registry['scope']={'region':'고신에쓰·북간토·홋카이도·도호쿠·도카이','regions':['고신에쓰']+existing_regions,'prefectures':[x[0] for x in PREFS]+existing}
    registry['generatedFrom']=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
    reg_path.write_text(prefix+json.dumps(registry,ensure_ascii=False,indent=2)+';\n')

    html=(DIST/'index.html').read_text()
    html=re.sub(r'photo-registry-data\.js\?v=[^"]+','photo-registry-data.js?v=20261007-koshinetsu1',html)
    html=re.sub(r'photo-registry\.js\?v=[^"]+','photo-registry.js?v=20261007-koshinetsu1',html)
    (DIST/'index.html').write_text(html)

    readme=(ROOT/'README.md').read_text()
    readme=re.sub(
      r'2026-10-07 기준으로 \*\*홋카이도\*\*, \*\*도호쿠\(아오모리·이와테·미야기·아키타·야마가타·후쿠시마\)\*\*, \*\*북간토\(이바라키·도치기·군마\)\*\*, \*\*도카이\(기후·시즈오카·아이치·미에\)\*\*의 관광지·음식 사진은 canonical 구조로 이전했습니다\.',
      '2026-10-07 기준으로 **홋카이도**, **도호쿠(아오모리·이와테·미야기·아키타·야마가타·후쿠시마)**, **북간토(이바라키·도치기·군마)**, **고신에쓰(니가타·야마나시·나가노)**, **도카이(기후·시즈오카·아이치·미에)**의 관광지·음식 사진은 canonical 구조로 이전했습니다.',
      readme)
    (ROOT/'README.md').write_text(readme)

    total_places=sum(x['places'] for x in per_pref.values());total_foods=sum(x['foods'] for x in per_pref.values())
    audit={
      'schemaVersion':1,'region':'고신에쓰','status':'COMPLETE_CANONICAL','sourceCommit':registry['generatedFrom'],
      'prefectures':per_pref,
      'totals':{'places':total_places,'foods':total_foods,'canonicalRecords':total_places+total_foods,'canonicalFiles':total_places+total_foods,'missingCanonicalFiles':0},
      'recoveredLegacyAssets':sorted(set(recovered)),'recoveredLegacyAssetCount':len(set(recovered)),
      'convertedLegacyAssets':sorted(set(converted)),'convertedLegacyAssetCount':len(set(converted)),
      'guarantees':[
        'Canonical IDs and paths are authoritative for Koshinetsu.',
        'Reserved IDs from audits/id-migration-map.json are preserved exactly, including deduplicated Yamanashi place selection.',
        'User-approved QA/final photo overrides take precedence over older baseline mappings.',
        'Previously approved missing assets are recovered from their source manifest before canonical copy.',
        'Non-WebP accepted legacy images are converted to WebP during canonicalization.',
        'Legacy numeric place IDs remain compatibility keys until nationwide ID cutover.',
        'No legacy image file is deleted during regional migration.'
      ]
    }
    (ROOT/'audits/koshinetsu-migration-completion.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'ok':True,'places':total_places,'foods':total_foods,'recovered':len(set(recovered)),'converted':len(set(converted))},ensure_ascii=False))

if __name__=='__main__':main()
