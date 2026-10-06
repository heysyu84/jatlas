/* Continuous nationwide catalogs, ordered like the existing prefecture/area menus. */
const nationalCatalogViews={nationalPlaces:'전국 관광지',nationalFoods:'전국 음식'};
Object.assign(featureJapanese,{
 '상세정보':'詳細情報','클릭하거나 터치하면 닫힙니다.':'クリックまたはタップすると閉じます。',
 '전국 관광지':'全国の観光スポット','전국 음식':'全国のグルメ','전국 목록':'全国の一覧',
 '관광지 카테고리':'観光スポットのカテゴリー','음식 카테고리':'グルメのカテゴリー',
 '밥·덮밥':'ご飯・丼物','국·전골':'汁物・鍋料理','간식·디저트':'おやつ・デザート','과일·특산물':'果物・特産品','기타 향토요리':'その他の郷土料理',
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
const nationalCatalogCategories={nationalPlaces:'전체',nationalFoods:'전체'};
const nationalPlaceCategories=['전체','산책','역사','전망','자연','전시·체험','쇼핑'];
const nationalFoodPatterns={
 '면요리':/면|라멘|우동|소바|소멘|국수|짬뽕|당면/,
 '밥·덮밥':/밥|덮밥|동$|초밥|스시|주먹밥|라이스|카레|타이메시|게이한/,
 '육류':/육류|고기|소고기|와규|브랜드육|브랜드소|토종닭|닭|돼지|곱창|내장|돈가스|돈카|돈코츠|징기스칸|스테이크|버거|바사시/,
 '해산물':/해산물|생선|참치|장어|복어|오징어|명란|멘타이코|굴·|게·|고등어|도미|활어|가다랑어|가쓰오|은어|멸치|연어|어묵|오뎅|바다포도|해조류|회·|초밥|스시/,
 '국·전골':/국물|향토국|전골|생선탕|나베|지루|수제비|오뎅|히야지루|미즈타키/,
 '간식·디저트':/간식|디저트|과자|화과자|빵|떡|빙수|아이스|소프트|푸딩|설탕|도넛|만주|단고|야세우마|유제품/,
 '과일·특산물':/과일|감귤|귤|망고|휴가나쓰|스다치|풋콩|절임|채소|녹차|차·|야메차|우레시노차|지란차|와인|특산품|전통식품/
};
function nationalFoodCategories(food){
 const hay=[food.name,food.kind].filter(Boolean).join(' ');
 const categories=Object.entries(nationalFoodPatterns).filter(([,pattern])=>pattern.test(hay)).map(([name])=>name);
 return categories.length?categories:['기타 향토요리'];
}
function nationalCatalogMatches(item,view,category){
 if(category==='전체')return true;
 if(view==='nationalFoods')return nationalFoodCategories(item).includes(category);
 const previous=placeTheme;placeTheme=category;
 try{return placeMatches(item)}finally{placeTheme=previous}
}
function selectNationalCategory(category){
 nationalCatalogCategories[state.view]=category;renderNationalCatalog();
}

let nationalDetailDialog;
function closeNationalDetail(){
 if(nationalDetailDialog?.open)nationalDetailDialog.close();
}
function openNationalDetail(item,kind){
 if(!Object.hasOwn(nationalCatalogViews,state.view))return;
 if(!nationalDetailDialog){
  nationalDetailDialog=document.createElement('dialog');
  nationalDetailDialog.id='nationalDetailDialog';
  nationalDetailDialog.setAttribute('aria-labelledby','nationalDetailTitle');
  nationalDetailDialog.addEventListener('click',event=>{
   if(event.target.closest?.('a,button'))return;
   closeNationalDetail();
  });
  nationalDetailDialog.addEventListener('close',()=>document.body.classList.remove('nationalDetailOpen'));
  document.body.append(nationalDetailDialog);
 }
 const panel=document.createElement('div');panel.className='nationalDetailPanel';
 const hint=document.createElement('p');hint.className='muted';hint.textContent='클릭하거나 터치하면 닫힙니다.';
 const title=document.createElement('h2');title.id='nationalDetailTitle';title.textContent=item.name;
 const location=document.createElement('p');location.className='eyebrow';location.textContent=[item.pref,item.area,item.town].filter(Boolean).join(' · ');
 panel.append(hint,location,title);
 if(kind==='foods'){
  const details=nationalFoodCard(item);
  details.querySelector('h3')?.remove();
  panel.append(details);
 }else{
  const visual=document.createElement('div');visual.innerHTML=tokyoDetailExtras(item);panel.append(visual);
  for(const [heading,text] of [['어떤 곳인가요?',item.description],['어떻게 즐길까요?',item.activity]]){
   if(!text)continue;
   const h=document.createElement('h3');h.textContent=heading;
   const p=document.createElement('p');p.textContent=text;panel.append(h,p);
  }
  const links=document.createElement('div');links.className='officialLinks';
  const urls=[['공식 관광 안내 ↗',item.source],['지도에서 장소 검색 ↗',googlePlaceMapURL(item,false)]];
  for(const [label,url] of urls){
   if(!url)continue;const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener';a.textContent=label;links.append(a);
  }
  panel.append(links);
 }
 nationalDetailDialog.replaceChildren(panel);
 if(typeof localize==='function')localize();
 if(!nationalDetailDialog.open)nationalDetailDialog.showModal();
 document.body.classList.add('nationalDetailOpen');
 nationalDetailDialog.scrollTop=0;
}
function wireNationalDetail(el,item,foods){
 if(!foods){
  const main=el.querySelector('.cardMain')||el;
  main.onclick=()=>openNationalDetail(item,'places');
 }else{
  el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label',item.name+' · 상세정보');
  el.addEventListener('click',event=>{
   if(event.target.closest?.('a,button'))return;
   openNationalDetail(item,'foods');
  });
  el.addEventListener('keydown',event=>{
   if(event.target!==el||!['Enter',' '].includes(event.key))return;
   event.preventDefault();openNationalDetail(item,'foods');
  });
 }
}
function renderNationalCatalog(){
 const view=state.view,active=Object.hasOwn(nationalCatalogViews,view),host=$('#nationalCatalog');host.hidden=!active;
 for(const [key,label] of Object.entries(nationalCatalogViews)){
  const menu=$('#'+key+'Menu');menu?.setAttribute('aria-current',view===key?'page':'false');
 }
 if(!active){closeNationalDetail();return;}
 let cached=nationalCatalogCache.get(view);
 if(!cached){
  const foods=view==='nationalFoods',items=nationalCatalogEntries(foods?'foods':'places');
  const grid=document.createElement('div');grid.className=foods?'foodGrid':'cards';
  for(const item of items){
   const el=foods?nationalFoodCard(item):card(item);
   if(!foods){const small=el.querySelector('.cardMain small');if(small)small.textContent=[item.pref,item.area,item.town].filter(Boolean).join(' · ')}
   wireNationalDetail(el,item,foods);
   grid.append(el);
  }
  cached={grid,items,cards:[...grid.children]};nationalCatalogCache.set(view,cached);
 }
 const title=document.createElement('h1');title.textContent=nationalCatalogViews[view];
 const intro=document.createElement('p');intro.textContent=view==='nationalFoods'?'전국의 음식을 한 목록에서 둘러보세요.':'전국의 관광지를 한 목록에서 둘러보세요.';
 const category=nationalCatalogCategories[view];
 const filters=document.createElement('div');filters.className='nationalCategoryFilters';filters.setAttribute('role','group');filters.setAttribute('aria-label',view==='nationalFoods'?'음식 카테고리':'관광지 카테고리');
 const categories=view==='nationalFoods'?['전체',...Object.keys(nationalFoodPatterns),'기타 향토요리']:nationalPlaceCategories;
 for(const name of categories){
  const control=button(name,()=>selectNationalCategory(name),category===name?'active':'');
  control.setAttribute('aria-pressed',String(category===name));filters.append(control);
 }
 let visibleCount=0;
 cached.cards.forEach((el,i)=>{el.hidden=!nationalCatalogMatches(cached.items[i],view,category);if(!el.hidden)visibleCount++});
 const count=document.createElement('p');count.className='muted';count.textContent=document.documentElement.lang==='ja'?`全 ${visibleCount}件`:`총 ${visibleCount}개`;
 host.replaceChildren(title,intro,filters,count,cached.grid);
 document.querySelectorAll('.bottomnav button').forEach(b=>{b.classList.remove('active');b.removeAttribute('aria-current')});
 if(typeof localize==='function')localize();
}
const nationalCatalogBaseHierarchy=hierarchySteps;
hierarchySteps=function(){return Object.hasOwn(nationalCatalogViews,state.view)?[{label:'전국',action:home},{label:nationalCatalogViews[state.view],action:()=>{}}]:nationalCatalogBaseHierarchy()};
const nationalCatalogBaseRender=render;
render=function(){nationalCatalogBaseRender();renderNationalCatalog()};
