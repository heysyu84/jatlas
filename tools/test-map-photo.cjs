/* Deterministic data/URL regression tests; not a visual-browser substitute. */
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const {ctx,result}=require('./audit-content.cjs');
let checks=0;
const check=(value,message)=>{assert.ok(value,message);checks++};
for(const p of result.places){
 const embed=new URL(p.mapEmbed),external=new URL(p.mapExternal);
 const canonical=vm.runInContext(`globalThis.JATLAS_MAP_CANONICAL?.[${p.id}]||null`,ctx);
 if(canonical){
  check(embed.searchParams.get('q')===`${canonical.lat},${canonical.lon}`,`canonical embed coordinates: ${p.id}`);
  if(canonical.placeId)check(external.searchParams.get('query_place_id')===canonical.placeId,`canonical external place id: ${p.id}`);
  else if(canonical.cid)check(external.searchParams.get('cid')===String(canonical.cid),`canonical external cid: ${p.id}`);
  else check(external.searchParams.get('q')===canonical.externalQuery,`canonical external query: ${p.id}`);
 }else{
  check(embed.searchParams.get('q')===p.mapQuery,`mapQuery priority: ${p.id}`);
  check(external.searchParams.get('q')===p.mapQuery,`external parity: ${p.id}`);
 }
 check(embed.searchParams.get('output')==='embed'&&!external.searchParams.has('output'),`embed mode: ${p.id}`);
 check(vm.runInContext(`mobileDetailMapURL(samples.find(p=>p.id===${p.id}))`,ctx)===p.mapEmbed,`mobile parity: ${p.id}`);
 const html=vm.runInContext(`tokyoDetailExtras(samples.find(p=>p.id===${p.id}))`,ctx);
 check(html.includes('visitFacts'),`visit facts retained: ${p.id}`);
 check(html.includes(p.photo?'detailPhoto':'photoPending'),`photo state: ${p.id}`);
 if(p.photo&&!p.photo.src.startsWith('http'))check(fs.existsSync(path.join(__dirname,'../dist',p.photo.src.split('?')[0])),`local file: ${p.id}`);
}
const hokkaidoCanonical=vm.runInContext('Object.entries(globalThis.JATLAS_MAP_CANONICAL||{}).filter(([id])=>Number(id)>=4000&&Number(id)<=4041)',ctx);
check(hokkaidoCanonical.length===42,'all 42 Hokkaido places have canonical map targets');
check(hokkaidoCanonical.every(([,x])=>Number.isFinite(x.lat)&&Number.isFinite(x.lon)),'all Hokkaido canonical targets have coordinates');
check(new URL(vm.runInContext('googlePlaceMapURL(samples.find(p=>p.id===4019),false)',ctx)).searchParams.get('query_place_id')==='ChIJT_xUJ6rznl8RXrmIZ5nBJjY','Hachimanzaka opens exact Google place, not Western Hakodate');
check(new URL(vm.runInContext('googlePlaceMapURL(samples.find(p=>p.id===4003),true)',ctx)).searchParams.get('q')==='43.05505,141.307587','Hokkaido Shrine embed uses shrine coordinates');
check(new URL(vm.runInContext('googlePlaceMapURL(samples.find(p=>p.id===4012),false)',ctx)).searchParams.get('query_place_id')==='ChIJNcpkm69XdV8RUa3bjqCTwSE','Lake Toya opens lake, not Toyako town');
check(vm.runInContext(`googlePlaceMapURL({id:-1,mapQuery:'綾の照葉大吊橋',mapUrl:'https://www.google.com/maps?cid=1'},false).includes(encodeURIComponent('綾の照葉大吊橋'))`,ctx),'name before stale CID');
check(vm.runInContext(`googleDetailContext={center:{lat:32,lng:131},zoom:12};new URL(googleDetailURL(null)).searchParams.get('q')==='32,131'`,ctx),'overview has q, not ll-only world map');
vm.runInContext(`localStorage.setItem('japlan-language','ja')`,ctx);
check(vm.runInContext(`new URL(googlePlaceMapURL(samples[0])).searchParams.get('hl')==='ja'`,ctx),'Japanese map language');
check(vm.runInContext(`translateText('사진 준비 중',true)==='写真準備中'`,ctx),'placeholder translation');
const report={method:'VM data and generated HTML/URL assertions; no browser layout verification',checks,places:result.places.length,errors:[]};
fs.writeFileSync(path.join(__dirname,'../audits/regression-tests.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
