"""Inspect public Google embed responses. A resolved result is NOT a visual identity pass."""
import concurrent.futures,json,math,urllib.request,urllib.parse
from pathlib import Path
root=Path(__file__).resolve().parents[1];folder=root/'audits';places=json.loads((folder/'runtime-inventory.json').read_text())['places'];output=folder/'map-audit.json';results=json.loads(output.read_text()) if output.exists() else {}
def scan(p):
 key=str(p['id']);url=p['mapEmbed']
 if key in results and results[key].get('url')==url and results[key].get('status') not in ['error']:return key,results[key]
 r={'id':p['id'],'pref':p['pref'],'name':p['name'],'query':p.get('mapQuery'),'url':url,'identityReview':'pending'}
 try:
  with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=35) as response:s=response.read().decode()
  data=json.JSONDecoder().raw_decode(s.split('initEmbed(',1)[1])[0];view=data[21]
  r['camera']={'lat':view[0][0][2],'lon':view[0][0][1]}
  if len(view)>3 and view[3] and isinstance(view[3],list):
   entity=view[3];r.update(status='entity-result',resolvedName=entity[1],address=entity[0][1],lat=entity[0][2][0],lon=entity[0][2][1],cid=entity[0][3] if len(entity[0])>3 else str(int(entity[0][0].split(':')[-1],16)))
  else:r.update(status='search-or-area-result')
  old=p.get('coordinates') or {}
  if 'lat' in r and isinstance(old.get('lat'),(float,int)) and isinstance(old.get('lon'),(float,int)):
   a,b,c,d=map(math.radians,[old['lat'],old['lon'],r['lat'],r['lon']]);r['distanceFromStoredKm']=round(6371*2*math.asin(min(1,math.sqrt(math.sin((c-a)/2)**2+math.cos(a)*math.cos(c)*math.sin((d-b)/2)**2))),3)
 except Exception as e:r.update(status='error',error=str(e))
 return key,r
with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
 for i,(k,v) in enumerate(pool.map(scan,places),1):
  results[k]=v
  if i%20==0:temp=output.with_suffix('.tmp');temp.write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n');temp.replace(output);print(f'{i}/{len(places)} maps checked',flush=True)
temp=output.with_suffix('.tmp');temp.write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n');temp.replace(output);print({s:sum(v['status']==s for v in results.values()) for s in {v['status'] for v in results.values()}})
