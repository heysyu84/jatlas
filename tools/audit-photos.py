"""Decode every active place/food image, detect SHA duplicates and create optional contact sheets.
Flags require human review: darkness and aspect ratio alone do not establish a bad photo.
Run after: node tools/audit-content.cjs
"""
import argparse,hashlib,json,math
from pathlib import Path
from urllib.parse import urlsplit,unquote
from PIL import Image,ImageDraw,ImageFont,ImageStat,ImageOps
root=Path(__file__).resolve().parents[1];dist=root/'dist';out=root/'audits'
r=json.loads((out/'runtime-inventory.json').read_text());entries=[];groups={};cache={}
for p in r['places']: entries.append(dict(kind='place',id=p['id'],pref=p['pref'],name=p['name'],**{'photo':p.get('photo')}))
for pref in r['prefectures']:
 for i,f in enumerate(pref['foods']):entries.append(dict(kind='food',id=f['name'],pref=pref['pref'],name=f['name'],photo={**(f.get('photo') or {}),'src':f.get('image') or (f.get('photo') or {}).get('src','')}))
for e in entries:
 src=(e['photo'] or {}).get('src','');flags=[];e['flags']=flags
 if not src:flags.append('missing-photo');continue
 if src.startswith(('http:','https:','//')):flags.append('external-image');continue
 f=dist/unquote(urlsplit(src).path)
 if not f.is_file():flags.append('missing-file');continue
 if src not in cache:
  try:
   with Image.open(f) as im:
    im.load();w,h=im.size;lum=ImageStat.Stat(im.convert('L').resize((64,64))).mean[0];sha=hashlib.sha256(f.read_bytes()).hexdigest()
    cache[src]={'width':w,'height':h,'luminance':round(lum,1),'sha256':sha}
  except Exception as ex:cache[src]={'error':str(ex)}
 e.update(cache[src]);
 if 'error' in e:flags.append('decode-error');continue
 if min(w:=e['width'],h:=e['height'])<400 or max(w,h)<640:flags.append('low-resolution')
 if w/h>2.7 or w/h<0.65:flags.append('extreme-ratio')
 if e['luminance']<45:flags.append('dark')
 groups.setdefault(e['sha256'],[]).append({'kind':e['kind'],'id':e['id'],'pref':e['pref'],'name':e['name'],'src':src})
duplicates=[g for g in groups.values() if len(g)>1];summary={'entries':len(entries),'uniqueLocalImages':len(cache),'flags':{f:sum(f in e['flags'] for e in entries) for f in sorted({f for e in entries for f in e['flags']})},'duplicateGroups':len(duplicates)}
(out/'photo-audit.json').write_text(json.dumps({'summary':summary,'entries':entries,'duplicates':duplicates},ensure_ascii=False,indent=2)+'\n');print(json.dumps(summary,ensure_ascii=False))
if '--sheets' in __import__('sys').argv:
 folder=out/'contact-sheets';folder.mkdir(exist_ok=True)
 font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',14)
 for pi,pref in enumerate(r['prefectures']):
  es=[e for e in entries if e['pref']==pref['pref']]
  for chunk in range(0,len(es),30):
   batch=es[chunk:chunk+30];sheet=Image.new('RGB',(1500,math.ceil(len(batch)/5)*175),'white');draw=ImageDraw.Draw(sheet)
   for i,e in enumerate(batch):
    x=(i%5)*300;y=(i//5)*175;src=(e['photo'] or {}).get('src','')
    if src and not src.startswith('http'):
     try:
      with Image.open(dist/urlsplit(src).path) as im:im.thumbnail((294,142));sheet.paste(im.convert('RGB'),(x+(294-im.width)//2,y))
     except Exception:pass
    draw.text((x+3,y+143),f"{e['kind']} {e['id'] if e['kind']=='place' else es.index(e)} "+','.join(e['flags']),font=font,fill='black')
   sheet.save(folder/f'{pi+1:02d}-{chunk//30+1}.jpg',quality=85)
