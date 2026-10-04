/* Keep area-menu order, then alphabetize Korean place names within each area. */
const placeNameCollator=new Intl.Collator('ko',{numeric:true,sensitivity:'base'});
function orderedPlaces(places,pref=state.pref){
 const areas=[...new Set(samples.filter(p=>p.pref===pref).map(p=>p.area))];
 const ranks=new Map(areas.map((area,i)=>[area,i]));
 const seenIds=new Set(),seenNames=new Set(),unique=[];
 for(const p of places){
  const id=String(p.id??''),nameKey=(String(p.pref||pref)+'|'+String(p.name||'')).normalize('NFKC').toLowerCase().replace(/\s+/gu,'');
  if((id&&seenIds.has(id))||(nameKey&&seenNames.has(nameKey)))continue;
  if(id)seenIds.add(id);if(nameKey)seenNames.add(nameKey);unique.push(p);
 }
 return unique.sort((a,b)=>(ranks.get(a.area)??areas.length)-(ranks.get(b.area)??areas.length)||placeNameCollator.compare(a.name,b.name));
}

Object.assign(featureJapanese,{
 '전국으로':'全国へ','상위 지역으로 이동':'上位の地域へ移動','맨 위로':'ページ上部へ','화면 이동':'画面移動',
 '홋카이도로':'北海道へ','도호쿠로':'東北へ','북간토로':'北関東へ','수도권으로':'首都圏へ',
 '고신에쓰로':'甲信越へ','도카이로':'東海へ','호쿠리쿠로':'北陸へ','긴키로':'近畿へ',
 '산인·산요로':'山陰・山陽へ','시코쿠로':'四国へ','규슈로':'九州へ','오키나와로':'沖縄へ'
});

function returnToRegion(){
 const region=regionFor(state.pref);if(!region)return;
 nationalRegion=region;state={view:'home',pref:'',area:'전체',town:'전체'};
 contentTab='places';placeTheme='전체';clearSearch();close();render();
 window.scrollTo?.({top:0,behavior:'smooth'});
}
function updateFloatingNavigation(){
 const controls=$('#floatingNavigation'),up=$('#floatingParent');
 if(!controls||!up)return;
 const menu=$('#siteMenu'),detail=$('#detail');
 const parent=menu?.open?menu:detail?.open?detail:document.body;
 if(controls.parentElement!==parent)parent.append(controls);
 const region=state.view==='explore'?regionFor(state.pref):'';
 const available=!!region||state.view!=='home'||!!nationalRegion;
 up.hidden=!available;
 up.textContent=region?region+(region==='수도권'?'으로':'로'):'전국으로';
 if(typeof localize==='function')localize();
}
function floatingParent(){
 if($('#siteMenu')?.open)toggleMenu(false);
 if(state.view==='explore'&&regionFor(state.pref))returnToRegion();
 else home();
}
function scrollToPageTop(){
 const menu=$('#siteMenu'),detail=$('#detail');
 const target=menu?.open?menu:detail?.open&&window.matchMedia('(max-width:760px)').matches?detail:window;
 target.scrollTo?.({top:0,behavior:'smooth'});
}
$('#floatingParent').onclick=floatingParent;
$('#floatingTop').onclick=scrollToPageTop;
const navigationBaseRender=renderNavigation;
renderNavigation=function(){navigationBaseRender();updateFloatingNavigation();queueMicrotask(updateFloatingNavigation)};
const navigationBaseMenu=toggleMenu;
toggleMenu=function(...args){navigationBaseMenu(...args);updateFloatingNavigation()};
renderNavigation();
