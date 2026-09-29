import json,math,pathlib,urllib.request,concurrent.futures
base=pathlib.Path(__file__).resolve().parents[1]
with urllib.request.urlopen('https://raw.githubusercontent.com/dataofjapan/land/master/japan.geojson',timeout=45) as r:
 d=json.load(r)
# Exclude Dokdo components from Japanese prefecture geometry before simplification.
# A narrow coordinate envelope preserves Shimane mainland and the Oki Islands.
def is_dokdo_ring(ring):
 return bool(ring) and all(131.85<=p[0]<=131.88 and 37.23<=p[1]<=37.26 for p in ring)

result=[]
for f in d['features']:
 polys=f['geometry']['coordinates'] if f['geometry']['type']=='MultiPolygon' else [f['geometry']['coordinates']]
 rings=[]
 for poly in polys:
  for ring in poly:
   if is_dokdo_ring(ring):continue
   out=[]
   for p in ring:
    q=[round(p[0],4),round(p[1],4)]
    if not out or math.dist(q,out[-1])>.007:out.append(q)
   if len(out)<3:out=[[round(p[0],4),round(p[1],4)] for p in ring[:3]]
   if len(out)>=3:rings.append(out)
 result.append({'id':int(f['properties']['id']),'rings':rings})
assert len(result)==47
assert not any(is_dokdo_ring(r) for f in result for r in f["rings"])
(base/'dist/geography.js').write_text('const geography='+json.dumps(result,separators=(',',':'))+';')
folder=base/'dist/tiles';folder.mkdir(exist_ok=True)
def fetch(t):
 x,y=t;p=folder/f'9-{x}-{y}.png'
 if not p.exists():
  with urllib.request.urlopen(f'https://cyberjapandata.gsi.go.jp/xyz/pale/9/{x}/{y}.png',timeout=30) as r:p.write_bytes(r.read())
 return p.name
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex:print(list(ex.map(fetch,[(x,y) for x in range(450,453) for y in range(199,202)])))
(base/'sources/map-sources.json').write_text(json.dumps({'boundaries':'https://github.com/dataofjapan/land','boundary_original':'地球地図日本（国土地理院）','tiles':'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png','notes':'Simplified prefecture outlines; Dokdo components excluded from Japanese prefecture geometry (131.85–131.88 E, 37.23–37.26 N). Hida sample markers represent approximate town centers, not verified attraction entrances.'},ensure_ascii=False,indent=2))
print('47 prefectures', (base/'dist/geography.js').stat().st_size)
