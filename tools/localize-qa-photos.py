"""Localize exact Commons sources only. No search or substitute fallback is permitted."""
import concurrent.futures,hashlib,html,io,json,re,time
from pathlib import Path
from urllib.parse import unquote,urlsplit
import urllib.request,urllib.parse
class Response:
 def __init__(self,content):self.content=content
 def raise_for_status(self):pass
 def json(self):return json.loads(self.content)
class requests:
 @staticmethod
 def get(url,params=None,headers=None,timeout=60):
  if params:url+='?'+urllib.parse.urlencode(params)
  with urllib.request.urlopen(urllib.request.Request(url,headers=headers or {}),timeout=timeout) as response:return Response(response.read())
from PIL import Image,ImageOps
root=Path(__file__).resolve().parents[1];dist=root/'dist';out=root/'audits';r=json.loads((out/'runtime-inventory.json').read_text());aliases=json.loads((dist/'image-migration-report.json').read_text())['fallback_aliases']
def name(p):
 s=p.get('source','')
 if '/wiki/File:' in s:return unquote(s.split('/wiki/File:')[1]).replace('_',' ')
 s=p.get('src','')
 if '/Special:FilePath/' in s:return unquote(s.split('/Special:FilePath/')[1].split('?')[0]).replace('_',' ')
 return None
targets={}
audit_file=out/'photo-audit.json'
broken_sources={e['photo']['src'] for e in json.loads(audit_file.read_text())['entries'] if e.get('photo') and 'decode-error' in e.get('flags',[])} if audit_file.exists() else set()
def collect(p):
 if not isinstance(p,dict):return
 src=p.get('src','');n=name(p)
 if n and (src in broken_sources or src.startswith('http') or (src and not (dist/urlsplit(src).path).is_file())):targets[n]=aliases.get(n,n)
for p in r['places']:collect(p['photo'])
for pref in r['prefectures']:
 for f in pref['foods']:collect({**(f['photo'] or {}),'src':f['image'] or (f['photo'] or {}).get('src','')})
for p in r['heroes'].values():collect(p)
manifest=out/'localized-photos.json';results=json.loads(manifest.read_text()) if manifest.exists() and manifest.stat().st_size else {}
headers={'User-Agent':'Jatlas/1.0 (photo attribution and local asset maintenance)'}
def fetch(pair):
 original,canonical=pair
 if original in results and not results[original].get('error') and (dist/results[original]['src']).is_file():
  try:
   with Image.open(dist/results[original]['src']) as cached:cached.load()
   return original,results[original]
  except (OSError,ValueError):pass
 try:
  info=metadata[canonical];meta=info.get('extmetadata',{});plain=lambda k:html.unescape(re.sub('<[^>]+>','',meta.get(k,{}).get('value','')))
  if not plain('LicenseShortName'):raise ValueError('No license metadata')
  url=info.get('thumburl') or info['url'];res=requests.get(url,headers=headers,timeout=60);res.raise_for_status()
  image=ImageOps.exif_transpose(Image.open(io.BytesIO(res.content))).convert('RGB');image.thumbnail((1400,1400));src='images/qa/'+hashlib.sha256(canonical.encode()).hexdigest()[:20]+'.webp';(dist/'images/qa').mkdir(exist_ok=True)
  temporary=(dist/src).with_suffix('.tmp');image.save(temporary,'WEBP',quality=86);temporary.replace(dist/src)
  return original,{'filename':canonical,'src':src,'source':info['descriptionurl'],'author':plain('Artist'),'license':plain('LicenseShortName'),'licenseUrl':plain('LicenseUrl'),'description':plain('ImageDescription'),'width':image.width,'height':image.height}
 except Exception as e:return original,{'filename':canonical,'error':str(e)}
metadata_file=out/'commons-exact-metadata.json'
metadata=json.loads(metadata_file.read_text()) if metadata_file.exists() else {}
pending=list(dict.fromkeys(v for v in targets.values() if v not in metadata))
for start in range(0,len(pending),30):
 batch=pending[start:start+30]
 try:
  data=requests.get('https://commons.wikimedia.org/w/api.php',params={'action':'query','format':'json','titles':'|'.join('File:'+n for n in batch),'prop':'imageinfo','iiprop':'url|extmetadata','iiurlwidth':'1280','redirects':'1'},headers=headers,timeout=45).json()
  redirects={p['from'][5:]:p['to'][5:] for p in data.get('query',{}).get('redirects',[])}
  normalized={p['from'][5:]:p['to'][5:] for p in data.get('query',{}).get('normalized',[])}
  pages={p['title'][5:]:p['imageinfo'][0] for p in data['query']['pages'].values() if p.get('imageinfo')}
  for n in batch:
   canonical=normalized.get(n,n);canonical=redirects.get(canonical,canonical)
   if canonical in pages:metadata[n]=pages[canonical]
  temp=metadata_file.with_suffix('.tmp');temp.write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+'\n');temp.replace(metadata_file)
  print('Metadata',min(start+30,len(pending)),'/',len(pending),flush=True)
  time.sleep(2)
 except Exception as e:
  print('Metadata blocked:',e,flush=True);break
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
 for i,(key,value) in enumerate(pool.map(fetch,targets.items()),1):
  results[key]=value;temp=manifest.with_suffix('.tmp');temp.write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n');temp.replace(manifest)
  if i%10==0:print(f'{i}/{len(targets)} localized; failures={sum("error" in v for v in results.values())}',flush=True)
print(json.dumps({'targets':len(targets),'success':sum('error' not in v for v in results.values()),'failures':sum('error' in v for v in results.values())}),flush=True)
