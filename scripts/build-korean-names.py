"""Build Korean labels by JIS code from Japan Post kana (jp-zipcode-lookup 0.3.5).
Requires hangulize==0.0.9. Usage: python scripts/build-korean-names.py city.json
"""
import json,re,sys,unicodedata,pathlib
from hangulize import hangulize
root=pathlib.Path(__file__).resolve().parents[1]
index=json.loads((root/'dist/municipal-index.js').read_text().split('const municipalIndex=')[1].strip().rstrip(';'))
postal=json.load(open(sys.argv[1]))['city']
legacy=json.loads(re.search(r'const municipalKorean=(\{.*?\});',(root/'dist/municipal-maps.js').read_text()).group(1).replace("'",'"'))
missing={'01700':'シベトロムラ','01695':'シコタンムラ','01696':'トマリムラ','01697':'ルヤベツムラ','01698':'ルベツムラ','01699':'シャナムラ'}
parents={'札幌':'サッポロ','仙台':'センダイ','さいたま':'サイタマ','千葉':'チバ','横浜':'ヨコハマ','川崎':'カワサキ','相模原':'サガミハラ','新潟':'ニイガタ','静岡':'シズオカ','浜松':'ハママツ','名古屋':'ナゴヤ','京都':'キョウト','大阪':'オオサカ','堺':'サカイ','神戸':'コウベ','岡山':'オカヤマ','広島':'ヒロシマ','北九州':'キタキュウシュウ','福岡':'フクオカ','熊本':'クマモト'}
for i,k in enumerate(['ナカ','ヒガシ','ニシ','ミナミ','キタ','ハマキタ','テンリュウ'],22131):missing[str(i)]='ハママツシ'+k+'ク'
rows={};audit=[]
for ms in index.values():
 for m in ms:
  code=m['id'];name=m['name'];kana=unicodedata.normalize('NFKC',postal.get(code,['',missing.get(code,'')])[1]);assert kana,(code,name)
  if postal.get(code,[''])[0]!=name and '郡' in postal.get(code,[''])[0]:kana=kana.split('グン',1)[1]
  base=name;prefix=''
  if '市' in name[:-1] and name.endswith('区'):
   parent,base=name.split('市',1);pk=parents[parent]+'シ';assert kana.startswith(pk),(name,kana);kana=kana[len(pk):];prefix=hangulize(parents[parent],'jpn')+'시 '
  suffix={'市':[('シ','시')],'区':[('ク','구')],'町':[('チョウ','초'),('マチ','마치')],'村':[('ムラ','무라'),('ソン','손')]}[base[-1]]
  for ka,ko in suffix:
   if kana.endswith(ka):kana=kana[:-len(ka)];suffixko=ko;break
  else:raise ValueError((name,kana))
  ko=prefix+hangulize(kana,'jpn')+suffixko
  if name in legacy:ko=legacy[name]
  assert re.fullmatch('[가-힣 ]+',ko),(code,name,kana,ko)
  ko={'01361':'에사시초 · 히야마','01514':'에사시초 · 소야','01403':'도마리무라 · 시리베시','01696':'도마리무라 · 구나시리'}.get(code,ko)
  rows[code]={'ko':ko,'ja':name};audit.append([code,name,kana,ko])
assert len(rows)==1896
(root/'dist/municipal-names.js').write_text('const municipalNames='+json.dumps(rows,ensure_ascii=False,separators=(',',':'))+';\n')
(root/'scripts/municipal-name-audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=1))
print('Korean labels:',len(rows));print(audit[:4])
