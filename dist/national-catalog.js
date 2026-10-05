/* Continuous nationwide catalogs, ordered like the existing prefecture/area menus. */
const nationalCatalogViews={nationalPlaces:'전국 관광지',nationalFoods:'전국 음식'};
Object.assign(featureJapanese,{
 '전국 관광지':'全国の観光スポット','전국 음식':'全国のグルメ','전국 목록':'全国の一覧',
 '도도부현 → 지역 → 가나다 순':'都道府県 → エリア → 韓国語の名前順',
 '전국의 관광지를 한 목록에서 둘러보세요.':'全国の観光スポットを一つの一覧でご覧ください。',
 '전국의 음식을 한 목록에서 둘러보세요.':'全国のグルメを一つの一覧でご覧ください。'
});
function nationalCatalogEntries(kind){
 const prefs=regions.flatMap(r=>r[1].split(' '));
 if(kind==='places')return prefs.flatMap(pref=>orderedPlaces(samples.filter(p=>p.pref===pref),pref));
 return prefs.flatMap(pref=>{
  const foods=foodsForPref(pref)||[];
  const areas=[...new Set([...samples.filter(p=>p.pref===pref).map(p=>p.area),...foods.map(f=>f.area)])];
  const ranks=new Map(areas.map((area,i)=>[area,i])),seen=new Set();
  return foods.map(f=>({...f,pref})).filter(f=>{
   const key=[pref,f.area,f.name].join('|').normalize('NFKC');
   if(seen.has(key))return false;seen.add(key);return true;
  }).sort((a,b)=>(ranks.get(a.area)??areas.length)-(ranks.get(b.area)??areas.length)||placeNameCollator.compare(a.name,b.name));
 });
}
function showNationalCatalog(kind){
 toggleMenu(false);close();clearSearch();
 state={view:kind==='foods'?'nationalFoods':'nationalPlaces',pref:'',area:'전체',town:'전체'};
 contentTab=kind==='foods'?'foods':'places';placeTheme='전체';
 render();window.scrollTo?.({top:0,behavior:'smooth'});
}
function nationalFoodCard(food){
 const root=document.createElement('article');root.className='foodCard';
 Object.assign(root.dataset,{foodName:food.name,foodArea:food.area,foodKind:food.kind,foodPref:food.pref});
 const regional=regionalByPref.get(food.pref);
 const pic=regional?.foodPhotos?.[food.name]||addedFoodPhotos[food.name];
 const info=regional?.foodDetails?.[food.name]||foodDetails[food.name];
 if(pic?.src||info?.image){
  const img=document.createElement('img');img.className='foodPhoto';img.src=pic?.src||info.image;
  img.alt=food.name;img.width=480;img.height=300;img.loading='lazy';img.decoding='async';root.append(img);
  if(pic?.source){
   const credit=document.createElement('p');credit.className='photoAttribution';
   credit.append(document.createTextNode('음식 참고 사진 · 특정 식당의 제공 메뉴 아님 · '));
   const link=document.createElement('a');link.href=pic.source;link.target='_blank';link.rel='noopener';link.textContent='사진 출처';credit.append(link);root.append(credit);
  }
 }
 const location=document.createElement('small');location.textContent=[food.pref,food.area,food.kind].filter(Boolean).join(' · ');root.append(location);
 const title=document.createElement('h3');title.textContent=food.name;root.append(title);
 for(const [text,className] of [[food.where,'foodLocation'],[food.description,'']]){
  if(!text)continue;const p=document.createElement('p');p.className=className;p.textContent=text;root.append(p);
 }
 if(info){
  const extra=document.createElement('div');extra.className='foodExtra';
  if(info.kind||info.taste){const p=document.createElement('p');const b=document.createElement('b');b.textContent=info.kind||'';p.append(b,document.createTextNode((info.kind&&info.taste?' · ':'')+(info.taste||'')));extra.append(p)}
  if(info.how){const p=document.createElement('p');p.textContent=info.how;extra.append(p)}
  if(info.shop&&info.url){const a=document.createElement('a');a.href=info.url;a.target='_blank';a.rel='noopener';a.textContent=info.shop+' · 공식 안내 ↗';extra.append(a)}
  root.append(extra);
 }
 if(food.source){const a=document.createElement('a');a.href=food.source;a.target='_blank';a.rel='noopener';a.textContent='음식·지역 안내 ↗';root.append(a)}
 return root;
}
const nationalCatalogCache=new Map();
function renderNationalCatalog(){
 const view=state.view,active=Object.hasOwn(nationalCatalogViews,view),host=$('#nationalCatalog');host.hidden=!active;
 for(const [key,label] of Object.entries(nationalCatalogViews)){
  const menu=$('#'+key+'Menu');menu?.setAttribute('aria-current',view===key?'page':'false');
 }
 if(!active)return;
 let cached=nationalCatalogCache.get(view);
 if(!cached){
  const foods=view==='nationalFoods',items=nationalCatalogEntries(foods?'foods':'places');
  const grid=document.createElement('div');grid.className=foods?'foodGrid':'cards';
  for(const item of items){
   const el=foods?nationalFoodCard(item):card(item);
   if(!foods){const small=el.querySelector('.cardMain small');if(small)small.textContent=[item.pref,item.area,item.town].filter(Boolean).join(' · ')}
   grid.append(el);
  }
  cached={grid,count:items.length};nationalCatalogCache.set(view,cached);
 }
 const title=document.createElement('h1');title.textContent=nationalCatalogViews[view];
 const intro=document.createElement('p');intro.textContent=view==='nationalFoods'?'전국의 음식을 한 목록에서 둘러보세요.':'전국의 관광지를 한 목록에서 둘러보세요.';
 const order=document.createElement('p');order.className='muted';order.textContent='도도부현 → 지역 → 가나다 순';
 const count=document.createElement('p');count.className='muted';count.textContent=document.documentElement.lang==='ja'?`全 ${cached.count}件`:`총 ${cached.count}개`;
 host.replaceChildren(title,intro,order,count,cached.grid);
 document.querySelectorAll('.bottomnav button').forEach(b=>{b.classList.remove('active');b.removeAttribute('aria-current')});
 if(typeof localize==='function')localize();
}
const nationalCatalogBaseHierarchy=hierarchySteps;
hierarchySteps=function(){return Object.hasOwn(nationalCatalogViews,state.view)?[{label:'전국',action:home},{label:nationalCatalogViews[state.view],action:()=>{}}]:nationalCatalogBaseHierarchy()};
const nationalCatalogBaseRender=render;
render=function(){nationalCatalogBaseRender();renderNationalCatalog()};
