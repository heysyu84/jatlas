#!/usr/bin/env python3
# north-kanto-canonical-migration-20261007-r2
import hashlib, importlib.util, io, json, re, shutil, subprocess, urllib.request
from pathlib import Path
from PIL import Image, ImageOps

ROOT=Path(__file__).resolve().parents[1]
DIST=ROOT/'dist'
PREFS=[
 ('이바라키','08','ibaraki','ibaraki-expansion.js'),
 ('도치기','09','tochigi','tochigi-expansion.js'),
 ('군마','10','gunma','gunma-expansion.js'),
]
PREFSET={x[0] for x in PREFS}
CANONICAL_SLUGS={
  "08-P0001": "kairakuen",
  "08-P0002": "kodokan",
  "08-P0003": "hitachi-seaside-park",
  "08-P0004": "oarai-isosaki-shrine",
  "08-P0005": "mount-tsukuba",
  "08-P0006": "tsukubasan-shrine",
  "08-P0007": "fukuroda-falls",
  "08-P0008": "kasama-inari-shrine",
  "08-P0009": "ushiku-daibutsu",
  "08-P0010": "ryujin-suspension-bridge",
  "08-P0011": "aquaworld-oarai-aquarium",
  "08-P0012": "nakaminato-fish-market",
  "08-P0013": "jaxa-tsukuba-space-center",
  "08-P0014": "kashima-jingu",
  "08-P0015": "ibaraki-flower-park",
  "08-P0016": "hananuki-gorge",
  "08-F0001": "mito-natto",
  "08-F0002": "anko-nabe",
  "08-F0003": "ibaraki-melon",
  "08-F0004": "hitachi-beef",
  "09-P0001": "nikko-toshogu",
  "09-P0002": "kegon-falls",
  "09-P0003": "lake-chuzenji",
  "09-P0004": "kinugawa-onsen",
  "09-P0005": "edo-wonderland-nikko-edomura",
  "09-P0006": "oya-history-museum",
  "09-P0007": "ashikaga-flower-park",
  "09-P0008": "ashikaga-school",
  "09-P0009": "mount-nasu-nasu-ropeway",
  "09-P0010": "oyaji-oya-kannon",
  "09-P0011": "nikko-futarasan-shrine",
  "09-P0012": "shinkyo-bridge",
  "09-P0013": "rinnoji",
  "09-P0014": "senjogahara",
  "09-P0015": "ryuzu-falls",
  "09-P0016": "mashiko-jonaisaka-pottery-street",
  "09-P0017": "nikko-tamozawa-imperial-villa",
  "09-P0018": "lake-yunoko",
  "09-P0019": "nasu-onsen",
  "09-F0001": "nikko-yuba",
  "09-F0002": "tochigi-strawberries",
  "09-F0003": "sano-ramen",
  "09-F0004": "utsunomiya-gyoza",
  "10-P0001": "kusatsu-onsen-yubatake",
  "10-P0002": "ikaho-onsen-stone-steps",
  "10-P0003": "tomioka-silk-mill",
  "10-P0004": "fukiware-falls",
  "10-P0005": "oze-national-park",
  "10-P0006": "mount-tanigawa",
  "10-P0007": "haruna-shrine",
  "10-P0008": "lake-haruna",
  "10-P0009": "shima-onsen",
  "10-P0010": "takasaki-byakui-kannon",
  "10-P0011": "sainokawara-park",
  "10-P0012": "mount-akagi-lake-onuma",
  "10-P0013": "shorinzan-daruma-ji",
  "10-P0014": "okushima-lake-shima-blue",
  "10-P0015": "netsunoyu-yumomi-show",
  "10-P0016": "kajika-bridge",
  "10-F0001": "konnyaku-cuisine",
  "10-F0002": "mizusawa-udon",
  "10-F0003": "yaki-manju",
  "10-F0004": "okkirikomi"
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
        m=re.search(r"""(?:["']?"""+re.escape(key)+r"""["']?)\\s*:\\s*(["'])(.*?)\\1""",obj,re.S)
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
    qa_text=(DIST/'photo-qa-review.js').read_text()
    final_text=(DIST/'photo-final-overrides.js').read_text()
    sr_text=(DIST/'photo-source-registry.js').read_text().strip()
    source_registry=json.loads(sr_text.removeprefix('globalThis.JATLAS_PHOTO_SOURCE_REGISTRY=').rstrip(';'))
    manifest=json.loads((ROOT/'tools/official-photo-assets.json').read_text())
    manifest_by_output={x.get('output'):x for x in manifest.get('photos',[]) if x.get('output')}
    manifest_by_place={int(x['placeId']):x for x in manifest.get('photos',[]) if x.get('placeId') is not None}
    idmap=json.loads((ROOT/'audits/id-migration-map.json').read_text())
    place_ids={int(x['legacyId']):x['newId'] for x in idmap['places'] if x.get('pref') in PREFSET}
    food_ids={(x['pref'],x['name']):x['newId'] for x in idmap['foods'] if x.get('pref') in PREFSET}

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
        pc=fc=0

        for p in data['places']:
            ident=int(p['id'])
            pic=dict((data.get('photos') or {}).get(str(ident)) or {})
            qa=record_for_key(qa_text,ident)
            if qa.get('src'):pic.update(qa)
            fin=record_for_key(final_text,ident)
            if fin.get('src'):pic.update(fin)
            src=clean_src(pic.get('src'))
            asset=None
            if src.startswith('http://') or src.startswith('https://'):
                asset=manifest_by_place.get(ident)
                if not asset:raise FileNotFoundError(f'External photo lacks recovery manifest: {pref} {ident} {p["name"]}')
                src=asset['output']
            legacy=DIST/src
            if not legacy.exists():
                asset=manifest_by_output.get(src) or manifest_by_place.get(ident)
                if not asset:raise FileNotFoundError(f'Missing approved legacy photo without manifest recovery: {src}')
                materialize_manifest_asset(asset); recovered.append(src)
            meta={}
            if src in source_registry:meta.update(source_registry[src])
            if asset is None: asset=manifest_by_output.get(src)
            if asset:meta.update({k:asset.get(k,'') for k in ('source','terms','author')})
            meta.update({k:v for k,v in pic.items() if k in ('source','author','terms','licenseUrl') and v})
            cid=place_ids.get(ident)
            if not cid:raise ValueError(f'Missing reserved canonical ID for {pref} {ident}')
            slug=CANONICAL_SLUGS[cid]
            canonical=f'images/regions/north-kanto/{prefslug}/places/{cid}-{slug}.webp'
            dest=DIST/canonical; dest.parent.mkdir(parents=True,exist_ok=True); shutil.copyfile(legacy,dest)
            registry['places'][cid]={
                'canonicalId':cid,'legacyId':ident,'pref':pref,'area':p.get('area',''),'town':p.get('town',''),
                'name':p['name'],'image':canonical,'legacyImage':src,
                'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),
                'source':meta.get('source') or pic.get('source') or '',
                'terms':meta.get('terms') or meta.get('licenseUrl') or pic.get('licenseUrl') or '',
                'author':meta.get('author') or '',
                'userPhoto':False,'heroEligible':True,'revision':1
            }; pc+=1

        for f in data.get('foods',[]):
            pic=dict((data.get('foodPhotos') or {}).get(f['name']) or {})
            qa=record_for_key(qa_text,f['name'])
            if qa.get('src'):pic.update(qa)
            src=clean_src(pic.get('src'))
            if not src or src.startswith('http://') or src.startswith('https://'):
                raise ValueError(f'No local food photo for {pref} {f["name"]}: {src}')
            legacy=DIST/src
            if not legacy.exists():raise FileNotFoundError(f'Missing food photo: {src}')
            meta={}
            if src in source_registry:meta.update(source_registry[src])
            if src in manifest_by_output:
                m=manifest_by_output[src]; meta.update({k:m.get(k,'') for k in ('source','terms','author')})
            meta.update({k:v for k,v in pic.items() if k in ('source','author','terms','licenseUrl') and v})
            cid=food_ids.get((pref,f['name']))
            if not cid:raise ValueError(f'Missing reserved food ID for {pref} {f["name"]}')
            slug=CANONICAL_SLUGS[cid]
            canonical=f'images/regions/north-kanto/{prefslug}/foods/{cid}-{slug}.webp'
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
    existing_regions=[r for r in registry.get('scope',{}).get('regions',[]) if r!='북간토']
    registry['scope']={'region':'북간토·홋카이도·도호쿠·도카이','regions':['북간토']+existing_regions,'prefectures':[x[0] for x in PREFS]+existing}
    registry['generatedFrom']=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
    reg_path.write_text(prefix+json.dumps(registry,ensure_ascii=False,indent=2)+';\n')

    html=(DIST/'index.html').read_text()
    html=re.sub(r'photo-registry-data\.js\?v=[^"]+','photo-registry-data.js?v=20261007-north-kanto1',html)
    html=re.sub(r'photo-registry\.js\?v=[^"]+','photo-registry.js?v=20261007-north-kanto1',html)
    (DIST/'index.html').write_text(html)

    readme=(ROOT/'README.md').read_text()
    readme=re.sub(
      r'2026-10-0[67] 기준으로 \*\*홋카이도\*\*, \*\*도호쿠\(아오모리·이와테·미야기·아키타·야마가타·후쿠시마\)\*\*, \*\*도카이\(기후·시즈오카·아이치·미에\)\*\*의 관광지·음식 사진은 canonical 구조로 이전했습니다\.',
      '2026-10-07 기준으로 **홋카이도**, **도호쿠(아오모리·이와테·미야기·아키타·야마가타·후쿠시마)**, **북간토(이바라키·도치기·군마)**, **도카이(기후·시즈오카·아이치·미에)**의 관광지·음식 사진은 canonical 구조로 이전했습니다.',
      readme)
    (ROOT/'README.md').write_text(readme)

    total_places=sum(x['places'] for x in per_pref.values()); total_foods=sum(x['foods'] for x in per_pref.values())
    audit={
      'schemaVersion':1,'region':'북간토','status':'COMPLETE_CANONICAL','sourceCommit':registry['generatedFrom'],
      'prefectures':per_pref,
      'totals':{'places':total_places,'foods':total_foods,'canonicalRecords':total_places+total_foods,'canonicalFiles':total_places+total_foods,'missingCanonicalFiles':0},
      'recoveredLegacyAssets':sorted(set(recovered)),
      'recoveredLegacyAssetCount':len(set(recovered)),
      'guarantees':[
        'Canonical IDs and paths are authoritative for North Kanto.',
        'Previously approved missing assets are recovered from their pinned source manifest before canonical copy.',
        'Reserved IDs from audits/id-migration-map.json are preserved exactly.',
        'Legacy numeric place IDs remain compatibility keys until nationwide ID cutover.',
        'No legacy image file is deleted during regional migration.'
      ]
    }
    (ROOT/'audits/north-kanto-migration-completion.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'ok':True,'places':total_places,'foods':total_foods,'recovered':len(set(recovered))},ensure_ascii=False))

if __name__=='__main__':main()
