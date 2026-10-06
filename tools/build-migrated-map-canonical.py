#!/usr/bin/env python3
import json,re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
AUD=ROOT/'audits'
DIST=ROOT/'dist'
REGIONS={
 '도카이':['기후','시즈오카','아이치','미에'],
 '도호쿠':['아오모리','이와테','미야기','아키타','야마가타','후쿠시마'],
 '홋카이도':['홋카이도'],
 '북간토':['이바라키','도치기','군마'],
 '고신에쓰':['니가타','야마나시','나가노'],
 '호쿠리쿠':['도야마','이시카와','후쿠이'],
 '수도권':['사이타마','지바','도쿄','가나가와'],
}
EXPECTED={'도카이':83,'도호쿠':160,'홋카이도':42,'북간토':51,'고신에쓰':79,'호쿠리쿠':71,'수도권':132}
FORCE_COORDINATE={910}

runtime=json.loads((AUD/'runtime-inventory.json').read_text())
audit=json.loads((AUD/'map-audit.json').read_text())
existing={}
canon_path=DIST/'map-canonical-data.js'
if canon_path.exists():
 for line in canon_path.read_text().splitlines():
  m=re.match(r'\s*(\d+):(\{.*\}),?\s*$',line)
  if m:
   existing[int(m.group(1))]=json.loads(m.group(2))

places={int(p['id']):p for p in runtime['places']}
migrated=[]
for region,prefs in REGIONS.items():
 rows=[p for p in runtime['places'] if p.get('pref') in prefs]
 if len(rows)!=EXPECTED[region]:
  raise SystemExit(f'{region} place count mismatch: {len(rows)} != {EXPECTED[region]}')
 migrated.extend(rows)

def num(v):
 return isinstance(v,(int,float)) and not isinstance(v,bool)

out={}
region_reports={}
for region,prefs in REGIONS.items():
 rows=[p for p in migrated if p.get('pref') in prefs]
 report={'schemaVersion':1,'region':region,'status':'CANONICAL_MAP_TARGETS_COMPLETE','places':len(rows),'cidTargets':0,'coordinateOnlyTargets':0,'preservedManualTargets':0,'sourceCoordinateTargets':0,'auditEntityTargets':0,'auditCameraTargets':0,'riskFlags':[]}
 for p in rows:
  pid=int(p['id'])
  if region=='홋카이도' and pid in existing:
   kept=dict(existing[pid])
   if not kept.get('coordinateOnly') and not kept.get('cid') and not kept.get('placeId'):
    kept['coordinateOnly']=True
   out[pid]=kept
   report['preservedManualTargets']+=1
   if kept.get('coordinateOnly'): report['coordinateOnlyTargets']+=1
   elif kept.get('cid') or kept.get('placeId'): report['cidTargets']+=1
   continue
  a=audit.get(str(pid),{})
  plat,plon=p.get('lat'),p.get('lon')
  use_source=num(plat) and num(plon) and abs(plat)<=90 and abs(plon)<=180
  if use_source:
   lat,lon=float(plat),float(plon); report['sourceCoordinateTargets']+=1
  elif a.get('status')=='entity-result' and num(a.get('lat')) and num(a.get('lon')):
   lat,lon=float(a['lat']),float(a['lon']); report['auditEntityTargets']+=1
  elif num((a.get('camera') or {}).get('lat')) and num((a.get('camera') or {}).get('lon')):
   lat,lon=float(a['camera']['lat']),float(a['camera']['lon']); report['auditCameraTargets']+=1
  else:
   raise SystemExit(f'No canonical coordinates for {pid} {p.get("pref")} {p.get("name")}')
  e={'lat':lat,'lon':lon,'externalQuery':p.get('mapQuery') or (p.get('ja') or {}).get('name') or p.get('name'),'note':'지도 기준 위치 고정'}
  coordinate_only=(a.get('status')!='entity-result') or pid in FORCE_COORDINATE
  if use_source and a.get('status')=='entity-result' and num(a.get('lat')) and num(a.get('lon')):
   from math import radians,sin,cos,asin,sqrt
   la1,lo1,la2,lo2=map(radians,[lat,lon,float(a['lat']),float(a['lon'])])
   d=6371*2*asin(min(1,sqrt(sin((la2-la1)/2)**2+cos(la1)*cos(la2)*sin((lo2-lo1)/2)**2)))
   if d>1.5:
    coordinate_only=True
    report['riskFlags'].append({'id':pid,'name':p.get('name'),'reason':'stored-vs-google-distance','km':round(d,3),'resolvedName':a.get('resolvedName')})
  resolved=str(a.get('resolvedName') or '')
  if resolved in {'Western Hakodate','구조시'}:
   coordinate_only=True
   report['riskFlags'].append({'id':pid,'name':p.get('name'),'reason':'broad-google-entity','resolvedName':resolved})
  if coordinate_only:
   e['coordinateOnly']=True; report['coordinateOnlyTargets']+=1
  elif str(a.get('cid') or '').isdigit():
   e['cid']=str(a['cid']); report['cidTargets']+=1
  else:
   e['coordinateOnly']=True; report['coordinateOnlyTargets']+=1
  if a.get('resolvedName'): e['resolvedName']=a['resolvedName']
  out[pid]=e
 region_reports[region]=report

if len(out)!=sum(EXPECTED.values()):
 raise SystemExit(f'canonical target count mismatch: {len(out)}')
lines=['/* Canonical map targets for migrated regions. Internal embeds always use fixed coordinates. */','globalThis.JATLAS_MAP_CANONICAL=Object.freeze({']
ids=sorted(out)
for i,pid in enumerate(ids):
 lines.append(f'  {pid}:'+json.dumps(out[pid],ensure_ascii=False,separators=(',',':'))+(',' if i<len(ids)-1 else ''))
lines.append('});')
canon_path.write_text('\n'.join(lines)+'\n')
for region,report in region_reports.items():
 slug={'도카이':'tokai','도호쿠':'tohoku','홋카이도':'hokkaido','북간토':'north-kanto','고신에쓰':'koshinetsu','호쿠리쿠':'hokuriku','수도권':'greater-tokyo'}[region]
 (AUD/f'{slug}-map-canonical-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'canonicalTargets':len(out),'regions':region_reports},ensure_ascii=False))
