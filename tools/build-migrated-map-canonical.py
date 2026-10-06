#!/usr/bin/env python3
import json,re,math
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1];AUD=ROOT/'audits';DIST=ROOT/'dist'
REGIONS={
 '도카이':['기후','시즈오카','아이치','미에'],
 '도호쿠':['아오모리','이와테','미야기','아키타','야마가타','후쿠시마'],
 '홋카이도':['홋카이도'],
 '북간토':['이바라키','도치기','군마'],
 '고신에쓰':['니가타','야마나시','나가노'],
 '호쿠리쿠':['도야마','이시카와','후쿠이'],
 '긴키':['시가','교토','오사카','효고','나라','와카야마'],
 '수도권':['사이타마','지바','도쿄','가나가와'],
}
EXPECTED={'도카이':83,'도호쿠':160,'홋카이도':42,'북간토':51,'고신에쓰':79,'호쿠리쿠':71,'긴키':134,'수도권':132}
FORCE_COORDINATE={910}
BROAD_ENTITY_NAMES={'Western Hakodate','구조시','일본','Japan'}

runtime=json.loads((AUD/'runtime-inventory.json').read_text())
audit=json.loads((AUD/'map-audit.json').read_text())
identity=json.loads((AUD/'map-identity-review.json').read_text())
existing={}
canon_path=DIST/'map-canonical-data.js'
if canon_path.exists():
 for line in canon_path.read_text().splitlines():
  m=re.match(r'\s*(\d+):(\{.*\}),?\s*$',line)
  if m:existing[int(m.group(1))]=json.loads(m.group(2))

migrated=[]
for region,prefs in REGIONS.items():
 rows=[p for p in runtime['places'] if p.get('pref') in prefs]
 if len(rows)!=EXPECTED[region]:raise SystemExit(f'{region} place count mismatch: {len(rows)} != {EXPECTED[region]}')
 migrated.extend(rows)

def num(v):return isinstance(v,(int,float)) and not isinstance(v,bool)
def km(a,b,c,d):
 a,b,c,d=map(math.radians,[a,b,c,d])
 return 6371*2*math.asin(min(1,math.sqrt(math.sin((c-a)/2)**2+math.cos(a)*math.cos(c)*math.sin((d-b)/2)**2)))

out={};region_reports={}
for region,prefs in REGIONS.items():
 rows=[p for p in migrated if p.get('pref') in prefs]
 report={'schemaVersion':2,'region':region,'status':'CANONICAL_MAP_TARGETS_COMPLETE','places':len(rows),'cidTargets':0,'coordinateOnlyTargets':0,'preservedManualTargets':0,'identityReviewTargets':0,'sourceCoordinateTargets':0,'auditEntityTargets':0,'auditCameraTargets':0,'riskFlags':[]}
 for p in rows:
  pid=int(p['id']);a=audit.get(str(pid),{});review=identity.get(str(pid),{})
  query=p.get('mapQuery') or (p.get('ja') or {}).get('name') or p.get('name')
  if region=='홋카이도' and pid in existing:
   kept=dict(existing[pid]);kept.pop('note',None)
   out[pid]=kept;report['preservedManualTargets']+=1
   if kept.get('coordinateOnly'):report['coordinateOnlyTargets']+=1
   elif kept.get('cid') or kept.get('placeId'):report['cidTargets']+=1
   continue

  plat,plon=p.get('lat'),p.get('lon');source_ok=num(plat) and num(plon) and abs(plat)<=90 and abs(plon)<=180
  reviewed=('reviewed' in str(review.get('status',''))) and num(review.get('lat')) and num(review.get('lon'))
  audit_entity=a.get('status')=='entity-result' and num(a.get('lat')) and num(a.get('lon'))
  broad=(pid in FORCE_COORDINATE) or str(a.get('resolvedName') or '') in BROAD_ENTITY_NAMES
  e={'externalQuery':query}

  if reviewed:
   e['lat']=float(review['lat']);e['lon']=float(review['lon']);report['identityReviewTargets']+=1
   if str(review.get('cid') or '').isdigit():e['cid']=str(review['cid']);report['cidTargets']+=1
   elif review.get('placeId'):e['placeId']=review['placeId'];report['cidTargets']+=1
   else:e['coordinateOnly']=True;report['coordinateOnlyTargets']+=1
   if review.get('resolvedName'):e['resolvedName']=review['resolvedName']
  elif audit_entity and not broad:
   e['lat']=float(a['lat']);e['lon']=float(a['lon']);report['auditEntityTargets']+=1
   if str(a.get('cid') or '').isdigit():e['cid']=str(a['cid']);report['cidTargets']+=1
   else:e['coordinateOnly']=True;report['coordinateOnlyTargets']+=1
   if a.get('resolvedName'):e['resolvedName']=a['resolvedName']
   if source_ok:
    d=km(float(plat),float(plon),e['lat'],e['lon'])
    if d>1.5:report['riskFlags'].append({'id':pid,'name':p.get('name'),'reason':'stored-vs-query-entity-distance','km':round(d,3),'resolvedName':a.get('resolvedName'),'chosen':'query-entity'})
  elif source_ok:
   e.update(lat=float(plat),lon=float(plon),coordinateOnly=True);report['sourceCoordinateTargets']+=1;report['coordinateOnlyTargets']+=1
   if audit_entity:
    d=km(float(plat),float(plon),float(a['lat']),float(a['lon']))
    if d>1.5:report['riskFlags'].append({'id':pid,'name':p.get('name'),'reason':'forced/broad-query-entity-conflict','km':round(d,3),'resolvedName':a.get('resolvedName'),'chosen':'stored-coordinate'})
  elif audit_entity:
   e.update(lat=float(a['lat']),lon=float(a['lon']),coordinateOnly=True);report['auditEntityTargets']+=1;report['coordinateOnlyTargets']+=1
   report['riskFlags'].append({'id':pid,'name':p.get('name'),'reason':'broad-query-entity-no-source-coordinate','resolvedName':a.get('resolvedName'),'chosen':'query-coordinate'})
  elif num((a.get('camera') or {}).get('lat')) and num((a.get('camera') or {}).get('lon')):
   e.update(lat=float(a['camera']['lat']),lon=float(a['camera']['lon']),coordinateOnly=True);report['auditCameraTargets']+=1;report['coordinateOnlyTargets']+=1
  else:raise SystemExit(f'No canonical coordinates for {pid} {p.get("pref")} {p.get("name")}')
  out[pid]=e
 region_reports[region]=report

if len(out)!=sum(EXPECTED.values()):raise SystemExit(f'canonical target count mismatch: {len(out)}')
lines=['/* Canonical map targets for migrated regions. Internal embeds always use fixed coordinates. */','globalThis.JATLAS_MAP_CANONICAL=Object.freeze({']
ids=sorted(out)
for i,pid in enumerate(ids):lines.append(f'  {pid}:'+json.dumps(out[pid],ensure_ascii=False,separators=(',',':'))+(',' if i<len(ids)-1 else ''))
lines.append('});');canon_path.write_text('\n'.join(lines)+'\n')
slugs={'도카이':'tokai','도호쿠':'tohoku','홋카이도':'hokkaido','북간토':'north-kanto','고신에쓰':'koshinetsu','호쿠리쿠':'hokuriku','긴키':'kinki','수도권':'greater-tokyo'}
for region,report in region_reports.items():(AUD/f'{slugs[region]}-map-canonical-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'canonicalTargets':len(out),'regions':region_reports},ensure_ascii=False))
