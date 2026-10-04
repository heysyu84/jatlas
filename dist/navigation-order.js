/* Keep area-menu order, then alphabetize Korean place names within each area. */
const placeNameCollator=new Intl.Collator('ko',{numeric:true,sensitivity:'base'});
function orderedPlaces(places,pref=state.pref){
 const areas=[...new Set(samples.filter(p=>p.pref===pref).map(p=>p.area))];
 const ranks=new Map(areas.map((area,i)=>[area,i]));
 return [...places].sort((a,b)=>(ranks.get(a.area)??areas.length)-(ranks.get(b.area)??areas.length)||placeNameCollator.compare(a.name,b.name));
}

Object.assign(featureJapanese,{
 '전국으로':'全国へ','상위 지역으로 이동':'上位の地域へ移動','뒤로 가기':'戻る',
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
function renderScopeNavigation(){
 const host=$('#scopeNavigation');if(!host)return;
 host.hidden=state.view!=='explore';
 const region=regionFor(state.pref),back=$('#scopeRegion');
 back.hidden=!region;back.textContent=region+(region==='수도권'?'으로':'로');
}

/* In-site back history stores final rendered views, not intermediate go/close calls. */
const navigationTrail=[];
let navigationCurrent=null,navigationQueued=false,navigationRestoring=false;
function navigationSnapshot(){
 return {state:{...state},region:nationalRegion,tab:contentTab,theme:placeTheme,
  month:eventMonth,allAreas:eventAllAreas,place:selected?.id??null,
  mapView:mobileMapView,hubPref,selectedRoute,routeLength,activePlanId,
  y:window.scrollY||0,detailY:$('#detail').scrollTop||0};
}
function navigationKey(snapshot){const {y,detailY,...view}=snapshot;return JSON.stringify(view)}
function updateFloatingBack(){
 const back=$('#floatingBack');if(!back)return;
 const menu=$('#siteMenu'),detail=$('#detail');
 const parent=menu?.open?menu:detail?.open?detail:document.body;
 if(back.parentElement!==parent)parent.append(back);
 const available=!!navigationTrail.length||hierarchySteps().length>1||!!menu?.open;
 back.hidden=!available;back.disabled=!available;
}
function recordNavigation(){
 if(navigationQueued)return;navigationQueued=true;
 queueMicrotask(()=>{
  navigationQueued=false;const next=navigationSnapshot();
  if(navigationRestoring){navigationRestoring=false;navigationCurrent=next}
  else if(!navigationCurrent||navigationKey(next)!==navigationKey(navigationCurrent)){
   if(navigationCurrent){navigationTrail.push(navigationCurrent);if(navigationTrail.length>100)navigationTrail.shift()}
   navigationCurrent=next;
  }
  updateFloatingBack();
 });
}
function navigateBack(){
 if($('#siteMenu')?.open){toggleMenu(false);return}
 const previous=navigationTrail.pop();
 if(!previous){navigateUp();return}
 navigationRestoring=true;detailOrigin=null;
 state={...previous.state};nationalRegion=previous.region;contentTab=previous.tab;
 placeTheme=previous.theme;eventMonth=previous.month;eventAllAreas=previous.allAreas;
 mobileMapView=previous.mapView;hubPref=previous.hubPref;
 selectedRoute=previous.selectedRoute;routeLength=previous.routeLength;activePlanId=previous.activePlanId;
 close();render();
 if(previous.place!==null){const place=samples.find(p=>p.id===previous.place);if(place)openDetail(place)}
 $('#detail').scrollTop=previous.detailY;window.scrollTo?.({top:previous.y,behavior:'instant'});
}

$('#scopeNational').onclick=home;$('#scopeRegion').onclick=returnToRegion;
$('#floatingBack').onclick=navigateBack;
const navigationBaseRender=renderNavigation;
renderNavigation=function(){renderScopeNavigation();navigationBaseRender();recordNavigation();updateFloatingBack()};
const navigationBaseMenu=toggleMenu;
toggleMenu=function(...args){navigationBaseMenu(...args);updateFloatingBack()};
window.addEventListener('scroll',()=>{if(navigationCurrent)navigationCurrent.y=window.scrollY||0},{passive:true});
$('#detail').addEventListener('scroll',()=>{if(navigationCurrent)navigationCurrent.detailY=$('#detail').scrollTop||0},{passive:true});
renderNavigation();
