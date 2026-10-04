'use strict';

const targets=[
  ['800','白糸の滝'],['801','富士山本宮浅間大社'],['802','三保松原'],['803','日本平夢テラス'],
  ['804','天窓洞'],['805','浜松城'],['806','掛川城'],['807','かんざんじロープウェイ'],
  ['808','修善寺'],['809','駿府城公園'],['810','久能山東照宮'],['811','城ケ崎海岸'],
  ['812','ペリーロード'],['813','はままつフラワーパーク'],['816','浄蓮の滝'],['817','MOA美術館'],
  ['819','御殿場プレミアム・アウトレット'],['820','河津七滝'],['821','韮山反射炉'],['822','三島スカイウォーク']
];

const strip=s=>String(s||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&[^;]+;/g,' ').replace(/\s+/g,' ').trim();
const norm=s=>strip(s).normalize('NFKC').replace(/[\s・･·\-–—_（）()【】「」『』]/g,'').toLowerCase();

async function get(url){
 const r=await fetch(url,{headers:{'user-agent':'Mozilla/5.0 (compatible; Jatlas photo QA/1.0)','accept-language':'ja'}});
 if(!r.ok)throw new Error(url+' '+r.status);
 return await r.text();
}

(async()=>{
 const detail802=await get('https://hellonavi.jp/photo/802');
 for(const needle of ['<form','cart','カート','利用目的','メール','氏名','会社','団体','download']){
   const i=detail802.toLowerCase().indexOf(needle.toLowerCase());
   if(i>=0) console.log('DETAIL802_FORM_SNIP',needle,JSON.stringify(detail802.slice(Math.max(0,i-1000),i+3000)));
 }
 const cart=await get('https://hellonavi.jp/photo/cart');
 for(const needle of ['<form','利用目的','メール','氏名','会社','団体','規約','申請']){
   const i=cart.toLowerCase().indexOf(needle.toLowerCase());
   if(i>=0) console.log('CART_FORM_SNIP',needle,JSON.stringify(cart.slice(Math.max(0,i-1000),i+4000)));
 }
 const first=await get('https://hellonavi.jp/photo');
 const pageLinks=[...first.matchAll(/href=["']([^"']*\/photo\?[^"']+)["']/g)].map(m=>new URL(m[1],'https://hellonavi.jp').href);
 const queryLinks=[...new Set(pageLinks)].filter(u=>/page|p=|offset|limit/i.test(u));
 console.log('PAGINATION_LINKS',JSON.stringify(queryLinks.slice(0,50)));
 const detailIds=[...new Set([...first.matchAll(/href=["'][^"']*\/photo\/(\d+)["']/g)].map(m=>m[1]))];
 console.log('FIRST_PAGE_DETAIL_IDS',detailIds.length,detailIds.slice(0,100).join(','));
 const detail=[];
 for(const id of detailIds){
   try{
     const html=await get('https://hellonavi.jp/photo/'+id);
     const h=(html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)||html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)||[])[1]||'';
     const title=strip(h);
     detail.push({id,title});
   }catch(e){console.error('DETAIL_FAIL',id,String(e))}
 }
 const matches={};
 for(const [placeId,name] of targets){
   const n=norm(name);
   matches[placeId]=detail.filter(x=>{const t=norm(x.title);return t&&(t.includes(n)||n.includes(t));});
 }
 console.log('HELLONAVI_TARGET_MATCHES_BEGIN');
 console.log(JSON.stringify({targets,matches,detail},null,2));
 console.log('HELLONAVI_TARGET_MATCHES_END');
})().catch(e=>{console.error(e);process.exit(1)});
