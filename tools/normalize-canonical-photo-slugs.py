#!/usr/bin/env python3
import hashlib,json,re
from pathlib import Path
from pykakasi import kakasi

ROOT=Path(__file__).resolve().parents[1]
DIST=ROOT/'dist'
PREFS={'사이타마','지바','도쿄','가나가와','도야마','이시카와','후쿠이','시가','교토','오사카','효고','나라','와카야마'}
KAKASI=kakasi()

FOOD_SLUGS={
'11-F0001':'buta-miso-don','11-F0002':'musashino-udon','11-F0003':'miso-potato','11-F0004':'waraji-katsudon','11-F0005':'imokoi','11-F0006':'jelly-fry',
'12-F0001':'katsuura-tantanmen','12-F0002':'narita-unagi','12-F0003':'namero','12-F0004':'peanut-monaka','12-F0005':'boiled-peanuts','12-F0006':'futomaki-matsuri-zushi',
'13-F0001':'kanda-soba','13-F0002':'tempura-soba','13-F0003':'tororo-soba','13-F0004':'tokyo-sayama-tea-dessert','13-F0005':'tonkatsu-tempura-ramen','13-F0006':'ramen-donburi','13-F0007':'menchi-katsu','13-F0008':'monjayaki','13-F0009':'soba','13-F0010':'soba-tempura','13-F0011':'soba-tempura','13-F0012':'sushi-tempura','13-F0013':'sushi-soba','13-F0014':'tsukiji-seafood-sushi','13-F0015':'yakitori','13-F0016':'tropical-fruit-dessert','13-F0017':'oshima-milk-ashitaba-snack','13-F0018':'wasabi-soba','13-F0019':'chankonabe','13-F0020':'harajuku-crepe',
'14-F0001':'misaki-tuna','14-F0002':'shonan-shirasu-don','14-F0003':'odawara-kamaboko','14-F0004':'yokosuka-navy-curry','14-F0005':'yokohama-shumai','14-F0006':'yokohama-ie-kei-ramen','14-F0007':'hakone-black-eggs',
'16-F0001':'gokayama-tofu','16-F0002':'kombujime','16-F0003':'takaoka-croquette','16-F0004':'toyama-black-ramen','16-F0005':'masuzushi','16-F0006':'shiroebi','16-F0007':'hotaruika','16-F0008':'himi-buri',
'17-F0001':'kanazawa-oden','17-F0002':'kanazawa-curry','17-F0003':'kaisendon','17-F0004':'gold-leaf-soft-serve','17-F0005':'nodoguro','17-F0006':'wajima-fugu','17-F0007':'jibuni','17-F0008':'hanton-rice',
'18-F0001':'mizu-yokan','18-F0002':'saba-heshiko','18-F0003':'seiko-gani','18-F0004':'sauce-katsudon','18-F0005':'yaki-saba-zushi','18-F0006':'echizen-oroshi-soba','18-F0007':'echizen-gani','18-F0008':'wakasa-beef',
'25-F0001':'biwamasu','25-F0002':'saba-somen','25-F0003':'aka-konnyaku','25-F0004':'omi-champon','25-F0005':'omi-beef','25-F0006':'funazushi',
'26-F0001':'kyo-tsukemono','26-F0002':'nishin-soba','26-F0003':'yatsuhashi','26-F0004':'obanzai','26-F0005':'uji-matcha-dessert','26-F0006':'yudofu',
'27-F0001':'kitsune-udon','27-F0002':'takoyaki','27-F0003':'doteyaki','27-F0004':'butaman','27-F0005':'okonomiyaki','27-F0006':'ikayaki','27-F0007':'kushikatsu',
'28-F0001':'kobe-beef','28-F0002':'banshu-ramen','28-F0003':'awajishima-onion','28-F0004':'akashiyaki','28-F0005':'izushi-sara-soba','28-F0006':'himeji-oden',
'29-F0001':'kakinoha-zushi','29-F0002':'nara-chameshi','29-F0003':'narazuke','29-F0004':'miwa-somen','29-F0005':'yomogi-mochi',
'30-F0001':'katsuura-fresh-tuna','30-F0002':'koyasan-shojin-ryori','30-F0003':'nanko-ume-umeboshi','30-F0004':'mehari-zushi','30-F0005':'arida-mikan','30-F0006':'wakayama-ramen'
}

PLACE_OVERRIDES={
'12-P0003':'national-museum-of-japanese-history',
'25-P0016':'miho-museum'
}

def ascii_slug(text):
    s=str(text or '').lower()
    s=re.sub(r'[^0-9a-z]+','-',s)
    return re.sub(r'-+','-',s).strip('-')

def japanese_slug(query):
    q=str(query or '').strip()
    if not q:
        return ''
    tokens=[t for t in re.split(r'\s+',q) if t]
    term=tokens[-1] if tokens else q
    generic={'公園','城跡','温泉','神社','美術館','博物館','市場','庭園','寺'}
    if term in generic and len(tokens)>=2:
        term=tokens[-2]+term
    parts=[]
    for item in KAKASI.convert(term):
        h=item.get('hepburn') or item.get('orig') or ''
        if h:
            parts.append(h)
    return ascii_slug('-'.join(parts))

reg_path=DIST/'photo-registry-data.js'
prefix='globalThis.JATLAS_PHOTO_REGISTRY_DATA='
raw=reg_path.read_text().strip()
if not raw.startswith(prefix):
    raise SystemExit('bad registry format')
reg=json.loads(raw[len(prefix):].rstrip(';'))
map_audit=json.loads((ROOT/'audits/map-audit.json').read_text())

changes=[];slugs={}
for group in ('places','foods'):
    for cid,r in reg.get(group,{}).items():
        if r.get('pref') not in PREFS:
            continue
        if group=='foods':
            new_slug=FOOD_SLUGS.get(cid)
            if not new_slug:
                raise SystemExit(f'missing explicit food slug {cid} {r.get("name")}')
        else:
            new_slug=PLACE_OVERRIDES.get(cid)
            if not new_slug:
                legacy=str(r.get('legacyId'))
                audit=map_audit.get(legacy) or {}
                new_slug=japanese_slug(audit.get('query'))
            if not new_slug:
                raise SystemExit(f'missing Japanese/official place slug {cid} {r.get("name")}')
        if not re.fullmatch(r'[0-9a-z]+(?:-[0-9a-z]+)*',new_slug):
            raise SystemExit(f'bad slug {cid}: {new_slug}')
        slugs[cid]=new_slug
        old=r.get('image','')
        oldp=DIST/old
        if not oldp.is_file():
            raise SystemExit(f'missing canonical file {old}')
        newp=oldp.with_name(f'{cid}-{new_slug}.webp')
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

reg_path.write_text(prefix+json.dumps(reg,ensure_ascii=False,indent=2)+';\n')
(ROOT/'audits/canonical-photo-slugs.json').write_text(json.dumps(slugs,ensure_ascii=False,indent=2)+'\n')

index=(DIST/'index.html').read_text()
index=re.sub(r'photo-registry-data\.js\?v=[^"]+','photo-registry-data.js?v=20261007-proper-slugs1',index)
index=re.sub(r'photo-registry\.js\?v=[^"]+','photo-registry.js?v=20261007-proper-slugs1',index)
(DIST/'index.html').write_text(index)

audit={
 'schemaVersion':2,
 'status':'PROPER_CANONICAL_SLUGS',
 'changed':len(changes),
 'policy':'Place slugs come from official Japanese map names romanized in Hepburn, with explicit official-English overrides where appropriate. Food slugs are explicit curated canonical names. Korean-name transliteration is prohibited.',
 'changes':changes
}
(ROOT/'audits/canonical-ascii-slug-review.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'changed':len(changes),'placeSlugs':len([x for x in slugs if '-P' in x]),'foodSlugs':len([x for x in slugs if '-F' in x])},ensure_ascii=False))
