"""Research candidates only; never changes the site's selected photographs."""
import concurrent.futures,html,json,re,time,urllib.request,urllib.parse
from pathlib import Path
root=Path(__file__).resolve().parents[1];out=root/'audits';runtime=json.loads((out/'runtime-inventory.json').read_text())
targets=[p for p in runtime['places'] if p.get('photo') and p['photo']['src'].startswith('http')]
file=out/'photo-candidates.json';results=json.loads(file.read_text()) if file.exists() else {}
def fetch(p):
 key=str(p['id'])
 if key in results and results[key].get('candidates'):return key,results[key]
 query=p['ja']['name'];params={'action':'query','format':'json','generator':'search','gsrsearch':query+' filetype:bitmap','gsrnamespace':6,'gsrlimit':6,'prop':'imageinfo','iiprop':'url|extmetadata','iiurlwidth':500}
 try:
  req=urllib.request.Request('https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode(params),headers={'User-Agent':'Jatlas/1.0 (photo QA; https://github.com/heysyu84/jatlas)'})
  with urllib.request.urlopen(req,timeout=35) as response:data=json.load(response)
  pages=sorted(data.get('query',{}).get('pages',{}).values(),key=lambda p:p.get('index',100))
  rows=[]
  for page in pages:
   if not page.get('imageinfo'):continue
   info=page['imageinfo'][0];meta=info.get('extmetadata',{});plain=lambda k:html.unescape(re.sub('<[^>]+>','',meta.get(k,{}).get('value','')))
   rows.append({'filename':page['title'][5:],'source':info['descriptionurl'],'url':info.get('thumburl',info['url']),'description':plain('ImageDescription'),'author':plain('Artist'),'license':plain('LicenseShortName'),'licenseUrl':plain('LicenseUrl')})
  return key,{'name':p['name'],'query':query,'candidates':rows,'selection':'pending'}
 except Exception as ex:return key,{'name':p['name'],'query':query,'error':str(ex)}
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
 for key,value in pool.map(fetch,targets):
  results[key]=value;temp=file.with_suffix('.tmp');temp.write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n');temp.replace(file);print(key,value['name'],len(value.get('candidates',[])),flush=True)
