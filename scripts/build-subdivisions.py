"""Build lazy local map layers from japan-map-selector 0.2.5 (MLIT N03 2021).
Usage: python scripts/build-subdivisions.py <municipalities-medium.geojson>
"""
import sys,json,pathlib,collections
source=json.load(open(sys.argv[1]));root=pathlib.Path(__file__).resolve().parents[1]/'dist';groups=collections.defaultdict(list);index={}
for f in source['features']:
 p=f['properties'];code=p.get('N03_007')
 if not code or code in {'01695','01696','01697','01698','01699','01700'}:continue
 pref=int(code[:2]);name=(p.get('N03_003') or '') if (p.get('N03_003') or '').endswith('市') else '';name+=p['N03_004']
 polys=f['geometry']['coordinates'];polys=[polys] if f['geometry']['type']=='Polygon' else polys
 # Keep the previous exclusion of Dokdo when importing a new boundary source.
 polys=[r for r in polys if not all(131.7<x<132.1 and 37.0<y<37.5 for x,y,*_ in r[0])]
 if code=='01223':polys=[r for r in polys if max(p[0] for p in r[0])<=145.85]
 if not polys:continue
 polys=[[[[round(x,5),round(y,5)] for x,y,*_ in ring] for ring in poly] for poly in polys]
 pts=[p for poly in polys for ring in poly for p in ring];xs=[p[0] for p in pts];ys=[p[1] for p in pts]
 bounds=[[min(ys),min(xs)],[max(ys),max(xs)]]
 groups[pref].append({'type':'Feature','properties':{'id':code,'name':name},'geometry':{'type':'MultiPolygon','coordinates':polys}})
 index.setdefault(str(pref),[]).append({'id':code,'name':name,'bounds':bounds})
assert len(groups)==47
for pref,features in groups.items():
 (root/'boundaries'/f'{pref}.js').write_text('municipalGeometry['+str(pref)+']='+json.dumps(features,ensure_ascii=False,separators=(',',':'))+';')
(root/'municipal-index.js').write_text('const municipalGeometry=Object.create(null);\nconst municipalIndex='+json.dumps(index,ensure_ascii=False,separators=(',',':'))+';\n')
print('Prefectures:',len(groups),'subdivisions:',sum(map(len,groups.values())))
