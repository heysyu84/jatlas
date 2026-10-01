import json,urllib.parse,urllib.request,os,io
from PIL import Image
Q={"2000":"Odori Park Sapporo","2001":"Sapporo TV Tower","2002":"Mount Moiwa Sapporo","2003":"Hokkaido Shrine","2004":"Sapporo Beer Museum","2005":"Shiroi Koibito Park","2006":"Jozankei Onsen","2007":"Otaru Canal","2008":"Otaru Music Box Museum","2009":"Otaru Sankaku Market","2010":"Cape Kamui Hokkaido","2011":"Mount Yotei","2012":"Lake Toya","2013":"Mount Usu ropeway","2014":"Noboribetsu Jigokudani","2015":"Upopoy Shiraoi","2016":"Mount Hakodate night view","2017":"Goryokaku","2018":"Hakodate Morning Market","2019":"Hachimanzaka Hakodate","2020":"Onuma Quasi National Park Hokkaido","2021":"Matsumae Castle","2022":"Asahiyama Zoo","2023":"Mount Asahidake Hokkaido","2024":"Sounkyo Kurodake","2025":"Farm Tomita Furano lavender","2026":"Ningle Terrace Furano","2027":"Shirogane Blue Pond Biei","2028":"Shirahige Falls Biei","2029":"Patchwork Road Biei","2030":"Cape Soya","2031":"Rebun Island","2032":"Rishiri Island Mount Rishiri","2033":"Abashiri drift ice Aurora","2034":"Abashiri Prison Museum","2035":"Shiretoko Five Lakes","2036":"Oshinkoshin Falls","2037":"Kushiro Shitsugen","2038":"Lake Akan","2039":"Lake Mashu","2040":"Lake Kussharo","2041":"Banei horse racing Obihiro","food-miso-ramen":"Sapporo miso ramen","food-jingisukan":"Jingisukan Hokkaido","food-kaisendon":"Kaisendon Hokkaido","food-soup-curry":"Sapporo soup curry","food-butadon":"Obihiro butadon","food-zangi":"Zangi Hokkaido","food-ikasomen":"Hakodate squid sashimi","food-softcream":"Hokkaido soft serve ice cream","food-doto-seafood":"Hokkaido crab salmon seafood","food-otaru-dessert":"Hokkaido cheesecake"}
api='https://commons.wikimedia.org/w/api.php'
os.makedirs('dist/images/hokkaido',exist_ok=True)
report={}
used=set()
for key,q in Q.items():
 p={'action':'query','generator':'search','gsrsearch':q,'gsrnamespace':'6','gsrlimit':'5','prop':'imageinfo','iiprop':'url|mime','iiurlwidth':'1280','format':'json','origin':'*'}
 req=urllib.request.Request(api+'?'+urllib.parse.urlencode(p),headers={'User-Agent':'JatlasImageCollector/1.0'})
 data=json.load(urllib.request.urlopen(req,timeout=30)); pages=list(data.get('query',{}).get('pages',{}).values())
 chosen=None
 for x in pages:
  ii=(x.get('imageinfo') or [{}])[0]
  if ii.get('mime','').startswith('image/') and ii.get('thumburl') and x.get('title') not in used:
   chosen=(x,ii);break
 if not chosen: print('MISS',key,q);continue
 x,ii=chosen
 used.add(x['title'])
 req=urllib.request.Request(ii['thumburl'],headers={'User-Agent':'JatlasImageCollector/1.0'})
 raw=urllib.request.urlopen(req,timeout=45).read(); im=Image.open(io.BytesIO(raw)).convert('RGB'); im.thumbnail((1280,960)); path=f'dist/images/hokkaido/{key}.webp'; im.save(path,'WEBP',quality=82,method=6)
 report[str(key)]={'title':x['title'].replace('File:',''),'source':'https://commons.wikimedia.org/wiki/'+urllib.parse.quote(x['title'].replace(' ','_'),safe=':_()')}
 print('OK',key,x['title'])
if len(report) != len(Q): raise RuntimeError(f'Only {len(report)}/{len(Q)} images collected')
if len({v['title'] for v in report.values()}) != len(report): raise RuntimeError('Duplicate Commons files detected')
json.dump(report,open('dist/images/hokkaido/credits.json','w'),ensure_ascii=False,indent=2)

# trigger image collection
