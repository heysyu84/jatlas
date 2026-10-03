/* Personal plans remain on this device; export/import transfers editable data. */
const routeTemplates=[
 {id:'shinjuku-garden',pref:'도쿄',areas:['신주쿠'],title:'정원에서 전망으로',duration:'반나절',image:'images/gyoen.webp',intro:'신주쿠교엔에서 걷고 도청 전망실에서 도시를 내려다보는 간결한 동선.',note:'교엔 입장 방법·휴원일과 도청 전망실 운영을 먼저 확인하세요. 두 장소 사이는 별도 이동이 필요합니다.',days:[{label:'신주쿠',places:[107,108]}]},
 {id:'sumida-day',pref:'도쿄',areas:['아사쿠사·스미다'],title:'옛 거리와 강 너머의 전망',duration:'1일',image:'images/sensoji.webp',intro:'센소지와 주변 골목을 둘러본 뒤 스카이트리로 이어지는 하루.',note:'참배와 골목 산책에 여유를 두세요. 스카이트리는 예약 시간에 맞춰 이동하고, 날씨에 따라 전망 방문을 선택하세요.',days:[{label:'아사쿠사·스미다',places:[100,101]}]},
 {id:'tokyo-two-days',pref:'도쿄',areas:['우에노·야나카','아사쿠사·스미다','신주쿠','시부야·하라주쿠'],title:'동쪽의 전통, 서쪽의 일상',duration:'2일',image:'images/skyline.webp',intro:'동쪽과 서쪽을 날짜별로 나눠, 멀리 떨어진 장소 사이의 왕복을 줄인 예시.',note:'박물관 관람이 길어지면 첫날의 다른 장소를 줄여보세요. 철도 이동과 식사·휴식 시간을 포함해 직접 조정하는 일정입니다.',days:[{label:'우에노 → 아사쿠사',places:[102,103,100]},{label:'신주쿠 → 하라주쿠 → 시부야',places:[107,110,109]}]}
,{"id": "shibuya-forest-sky", "pref": "도쿄", "areas": ["시부야·하라주쿠"], "title": "숲길에서 시부야의 하늘로", "duration": "1일", "image": "images/tokyo-109.webp", "intro": "메이지 신궁의 숲길, 시부야 교차로, 스카이 전망을 한 권역 안에서 연결합니다.", "note": "하라주쿠와 시부야 사이 이동·식사 시간을 따로 두세요. 시부야 스카이는 예약 시간과 옥외 운영 여부에 맞춰 순서를 조정하세요.", "days": [{"label": "하라주쿠 → 시부야", "places": [110, 109, 111]}]}, {"id": "ueno-art-nezu", "pref": "도쿄", "areas": ["우에노·야나카"], "title": "우에노의 예술과 네즈의 골목", "duration": "1일", "image": "images/tokyo-103.webp", "intro": "우에노 공원과 국립박물관을 먼저 보고 네즈 신사에서 차분하게 마무리합니다.", "note": "박물관 관람에 시간을 충분히 두세요. 특별전이나 휴관일에 따라 네즈 방문을 다른 날로 나눠도 좋습니다.", "days": [{"label": "우에노 → 네즈", "places": [102, 103, 104]}]}, {"id": "moat-and-garden", "pref": "도쿄", "areas": ["고쿄·분쿄"], "title": "해자와 일본 정원 산책", "duration": "반나절", "image": "images/tokyo-106.webp", "intro": "지도리가후치 수변과 고이시카와 고라쿠엔을 묶어 천천히 걷는 일정입니다.", "note": "두 장소 사이의 이동은 별도로 계획하세요. 정원 입장 마감 시간을 먼저 확인하고 벚꽃철에는 혼잡을 고려하세요.", "days": [{"label": "지도리가후치 → 고라쿠엔", "places": [105, 106]}]}];
routeTemplates.push(
 {id:'tokyo-station-edo-core',pref:'도쿄',areas:['도쿄역·긴자·쓰키지'],title:'도쿄역과 에도 도심 산책',duration:'1일',image:tokyoPhotos[219]?.src||'',intro:'도쿄역에서 고쿄 동쪽 정원과 니혼바시까지 이어지는 도심 역사 산책입니다.',note:'고쿄 히가시교엔의 휴원일과 입장 마감을 먼저 확인하세요. 각 장소의 관람시간에 따라 니혼바시는 선택 일정으로 조정해도 좋습니다.',days:[{label:'도쿄역 → 고쿄 → 니혼바시',places:[219,220,233]}]},
 {id:'tsukiji-hamarikyu-ginza',pref:'도쿄',areas:['도쿄역·긴자·쓰키지'],title:'쓰키지에서 긴자까지 하루',duration:'1일',image:tokyoPhotos[222]?.src||'',intro:'오전 시장에서 시작해 에도 정원과 긴자 거리를 이어보는 일정입니다.',note:'쓰키지 장외시장은 오전이 가장 활기찹니다. 하마리큐 입장 마감과 긴자 보행자 천국 운영 여부는 방문일에 맞춰 확인하세요.',days:[{label:'쓰키지 → 하마리큐 → 긴자',places:[222,223,221]}]},
 {id:'ryogoku-edo-hokusai',pref:'도쿄',areas:['료고쿠·스미다'],title:'료고쿠의 에도와 호쿠사이',duration:'반나절',image:tokyoPhotos[227]?.src||'',intro:'에도 도쿄 박물관과 호쿠사이 미술관을 함께 둘러보는 역사·미술 반나절 일정입니다.',note:'두 박물관의 휴관일과 기획전 시간을 확인하세요. 에도 도쿄 박물관을 자세히 보면 하루 일정으로 늘려도 좋습니다.',days:[{label:'에도 도쿄 → 호쿠사이',places:[227,226]}]},
 {id:'toyosu-market-art',pref:'도쿄',areas:['도요스·쓰키시마'],title:'도요스 시장과 디지털아트',duration:'1일',image:tokyoPhotos[231]?.src||'',intro:'이른 시장 방문 뒤 팀랩 플래닛으로 이동하는 도요스 하루 일정입니다.',note:'참치 경매를 보려면 이른 출발과 예약 조건을 확인하세요. 팀랩 플래닛은 예약한 입장 시간을 기준으로 순서를 조정하세요.',days:[{label:'도요스 시장 → 팀랩 플래닛',places:[231,228]}]},
 {id:'azabudai-roppongi-art',pref:'도쿄',areas:['아자부다이·롯폰기'],title:'아자부다이와 롯폰기 미술 하루',duration:'1일',image:tokyoPhotos[229]?.src||'',intro:'팀랩 보더리스와 모리 미술관을 중심으로 현대미술을 즐기는 일정입니다.',note:'두 시설 모두 전시·예약 상황에 따라 체류시간이 달라집니다. 전시 내용을 확인하고 한 곳을 길게 보는 일정으로 바꿔도 좋습니다.',days:[{label:'아자부다이 → 롯폰기',places:[229,232]}]},
 {id:'akihabara-kanda',pref:'도쿄',areas:['간다·아키하바라'],title:'아키하바라와 간다 반나절',duration:'반나절',image:tokyoPhotos[230]?.src||'',intro:'아키하바라 전기 상점가와 간다묘진을 함께 둘러보는 도심 반나절 일정입니다.',note:'쇼핑 시간이 길어질 수 있으므로 관심 분야를 먼저 정하세요. 일요일 보행자 천국은 날씨와 운영 공지를 확인하세요.',days:[{label:'아키하바라 → 간다묘진',places:[230,215]}]},
 {id:'yanaka-nezu-walk',pref:'도쿄',areas:['우에노·야나카'],title:'야나카와 네즈 골목 산책',duration:'반나절',image:tokyoPhotos[225]?.src||'',intro:'야나카 긴자와 네즈 신사를 이어 걷는 옛 동네 반나절 일정입니다.',note:'상점가의 개별 영업시간은 서로 다릅니다. 우에노 박물관 일정과 같은 날에 넣을 경우 체류시간을 줄여보세요.',days:[{label:'야나카 → 네즈',places:[225,104]}]},
 {id:'bunkyo-two-gardens',pref:'도쿄',areas:['고쿄·분쿄'],title:'분쿄의 두 정원',duration:'1일',image:tokyoPhotos[224]?.src||'',intro:'리쿠기엔과 고이시카와 고라쿠엔을 나누어 둘러보는 정원 중심 하루 일정입니다.',note:'두 정원 사이에는 철도 이동이 필요합니다. 봄·가을 특별 관람과 입장 마감 시간을 먼저 확인하세요.',days:[{label:'리쿠기엔 → 고이시카와 고라쿠엔',places:[224,106]}]}

,
 {id:'odaiba-science-bay',pref:'도쿄',areas:['오다이바'],title:'오다이바 과학과 바다 하루',duration:'1일',image:tokyoPhotos[200]?.src||'',intro:'일본과학미래관에서 시작해 다이버시티를 거쳐 오다이바 해변공원에서 마무리하는 하루 일정입니다.',note:'과학관 관람 시간이 길어질 수 있습니다. 다이버시티 쇼핑을 줄이면 조이폴리스 같은 실내 시설을 선택 일정으로 넣을 수 있습니다.',days:[{label:'미래관 → 다이버시티 → 해변공원',places:[200,202,113]}]},
 {id:'shiba-temple-tower',pref:'도쿄',areas:['도쿄타워·시바'],title:'조조지와 도쿄타워 반나절',duration:'반나절',image:tokyoPhotos[209]?.src||'',intro:'조조지 경내와 시바공원을 걷고 도쿄타워 전망으로 이어지는 가까운 동선입니다.',note:'전망대는 날씨와 예약 상황을 확인하세요. 야경을 원하면 오후 늦게 시작해도 좋습니다.',days:[{label:'조조지 → 도쿄타워',places:[209,112]}]},
 {id:'kichijoji-ghibli',pref:'도쿄',areas:['기치조지·고엔지'],title:'이노카시라 공원과 지브리',duration:'반나절~1일',image:tokyoPhotos[210]?.src||'',intro:'기치조지의 이노카시라 공원을 산책하고 예약한 시간에 지브리 미술관을 방문하는 일정입니다.',note:'지브리 미술관은 사전 예약이 필요합니다. 예약이 없으면 공원과 기치조지 상점가 중심으로 바꾸세요.',days:[{label:'이노카시라 공원 → 지브리 미술관',places:[114,210]}]},
 {id:'takao-temple-hike',pref:'도쿄',areas:['다카오'],title:'다카오산 산행과 야쿠오인',duration:'1일',image:tokyoPhotos[214]?.src||'',intro:'다카오산 등산로와 야쿠오인을 한 번의 산행 안에서 둘러보는 자연·역사 일정입니다.',note:'등산로 난이도와 케이블카·리프트 운영을 확인하세요. 정상까지 걷는 시간을 포함해 귀환 시간을 여유 있게 잡으세요.',days:[{label:'야쿠오인 → 다카오산',places:[214,116]}]},
 {id:'izu-oshima-volcano-port',pref:'도쿄',areas:['이즈 제도'],title:'이즈 오시마 화산과 항구',duration:'1일',image:tokyoPhotos[118]?.src||'',intro:'미하라산 화산 지형과 하부항의 옛 항구 풍경을 하루에 나누어 보는 이즈 오시마 일정입니다.',note:'도쿄 본토에서 섬까지의 배·항공편과 섬 내 버스 또는 차량 이동은 별도로 계획하세요. 날씨에 따라 산행을 우선 조정하세요.',days:[{label:'미하라산 → 하부항',places:[118,212]}]},
 {id:'ogasawara-chichijima',pref:'도쿄',areas:['오가사와라'],title:'지치지마 전망과 해변',duration:'1일',image:tokyoPhotos[119]?.src||'',intro:'오가미야마 공원의 전망과 고미나토 해변을 묶어 지치지마의 산과 바다를 보는 일정입니다.',note:'오가사와라는 본토에서 장거리 선박 이동이 필요한 별도 여행입니다. 현지 교통과 해변 이용 조건을 숙박 일정에 맞춰 확인하세요.',days:[{label:'오가미야마 공원 → 고미나토 해변',places:[119,213]}]}
);
let plans=[],activePlanId='',selectedRoute='',hubPref='전체',pendingPlace=null,lastDeleted=null;
const uid=()=>globalThis.crypto?.randomUUID?.()||'p'+Date.now().toString(36)+Math.random().toString(36).slice(2);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s+'T00:00:00Z'))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;
const validTime=s=>typeof s==='string'&&/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(s);
function cleanPlan(p,renew=false){
 if(!p||typeof p!=='object'||typeof p.name!=='string'||!Array.isArray(p.days)||!p.days.length||p.days.length>30)throw Error('invalid plan');
 return {id:renew?uid():String(p.id||uid()).slice(0,90),name:p.name.slice(0,120),start:validDate(p.start)?p.start:'',notes:String(p.notes||'').slice(0,5000),days:p.days.map(d=>{
  if(!d||!Array.isArray(d.items)||d.items.length>60)throw Error('invalid day');
  return {label:String(d.label||'').slice(0,100),items:d.items.map(i=>{if(!i||typeof i.name!=='string')throw Error('invalid item');return {id:uid(),name:i.name.slice(0,180),placeId:Number.isInteger(i.placeId)&&samples.some(p=>p.id===i.placeId)?i.placeId:null,time:validTime(i.time)?i.time:'',note:String(i.note||'').slice(0,3000)}})};}),updated:new Date().toISOString()};
}
try{const raw=JSON.parse(localStorage.getItem('japlan-plans-v1')||'[]');if(Array.isArray(raw))plans=raw.slice(0,30).flatMap(p=>{try{return [cleanPlan(p)]}catch{return []}})}catch{}
function savePlans(){try{localStorage.setItem('japlan-plans-v1',JSON.stringify(plans));return true}catch{toast('저장 공간을 사용할 수 없습니다. 파일로 내보내 주세요.');return false}}
function toast(message,undo=false){const box=$('#appToast');box.hidden=false;box.replaceChildren(document.createTextNode(message));if(undo)box.append(button('되돌리기',()=>{if(lastDeleted){plans.push(lastDeleted);activePlanId=lastDeleted.id;lastDeleted=null;savePlans();renderPlans();box.hidden=true}}));clearTimeout(toast.timer);toast.timer=setTimeout(()=>box.hidden=true,6000);if(typeof localize==='function')localize()}
function toggleMenu(force){const menu=$('#siteMenu'),open=force??!menu.open;if(open){menu.showModal();$('#menuToggle').setAttribute('aria-expanded','true')}else{menu.close();$('#menuToggle').setAttribute('aria-expanded','false')}}
$('#siteMenu').addEventListener('close',()=>{$('#menuToggle').setAttribute('aria-expanded','false');$('#menuToggle').focus()});
$('#siteMenu').addEventListener('click',e=>{if(e.target===$('#siteMenu'))toggleMenu(false)});
$('#menuRegions').replaceChildren(...regions.map(r=>button(r[0],()=>{toggleMenu(false);selectRegion(r[0])})));
function showRegions(){state.view='regions';close();render();window.scrollTo?.({top:0,behavior:'smooth'})}
function renderRegions(){const host=$('#regionHub');host.innerHTML='<p class="eyebrow">REGIONS</p><h1>지역별 탐색</h1><p>지방별 목록에서 도도부현으로 바로 이동하세요.</p>';const grid=document.createElement('div');grid.className='regionDirectory';for(const [name,prefs] of regions){const section=document.createElement('section');section.append(button(name,()=>selectRegion(name),'regionHeading'));const list=document.createElement('div');list.className='chiprow';for(const pref of prefs.split(' '))list.append(button(pref,()=>{contentTab='places';go(pref)}));section.append(list);grid.append(section)}host.append(grid)}
function showEvents(){hubPref='전체';eventMonth=0;state.view='events';close();render();window.scrollTo?.({top:0,behavior:'smooth'})}
function showRoutes(){selectedRoute='';hubPref='전체';routeLength='전체';state.view='routes';close();render();window.scrollTo?.({top:0,behavior:'smooth'})}
function showPlans(){targetPlanId='';targetDay=0;state.view='plans';close();render();window.scrollTo?.({top:0,behavior:'smooth'})}
function scopeSelect(value,onchange){const select=document.createElement('select');select.setAttribute('aria-label','지역 선택');for(const pref of ['전체',...allPrefs])select.append(new Option(pref,pref));select.value=value;select.onchange=e=>onchange(e.target.value);return select}
function eventHubImage(pref,event){
 const area=event?.area&&!event.area.endsWith('전역')?event.area:pref;
 const byArea=typeof photoForArea==='function'?photoForArea(area):null;
 if(byArea)return byArea;
 const place=samples.find(p=>p.pref===pref&&(area===pref||p.area===area)&&photoForPlace(p));
 return place?photoForPlace(place):(designPhotos[pref]||null);
}
function renderEventNationwide(host){
 host.innerHTML='<p class="eyebrow">SEASONS & EVENTS</p><h1>일본의 계절·행사</h1><p class="sectionIntro">일본은 남북으로 길어 같은 계절에도 꽃·단풍·설경과 행사의 시기가 지역마다 크게 다릅니다. 지역을 선택하면 그 지역의 사계절과 행사 일정을 볼 수 있습니다.</p>';
 const seasons=document.createElement('div');seasons.className='nationalSeasonGrid';
 for(const [title,text] of [['봄','벚꽃과 신록이 이어지는 계절'],['여름','마쓰리와 불꽃놀이가 많은 계절'],['가을','단풍과 지역 축제를 즐기기 좋은 계절'],['겨울','설경과 전통 행사·일루미네이션의 계절']]){
  const card=document.createElement('article');card.innerHTML='<strong>'+title+'</strong><span>'+text+'</span>';seasons.append(card);
 }
 host.append(seasons);
 const heading=document.createElement('h2');heading.className='eventRegionTitle';heading.textContent='지역을 선택하세요';host.append(heading);
 const directory=document.createElement('div');directory.className='regionDirectory eventRegionDirectory';
 for(const [name,prefs] of regions){
  const section=document.createElement('section');const h=document.createElement('h3');h.textContent=name;section.append(h);
  const list=document.createElement('div');list.className='chiprow';
  for(const pref of prefs.split(' '))list.append(button(pref,()=>{hubPref=pref;eventMonth=0;renderEventHub();window.scrollTo?.({top:0,behavior:'smooth'})}));
  section.append(list);directory.append(section);
 }
 host.append(directory);
}
function renderEventHub(){
 const host=$('#eventHub');
 if(hubPref==='전체'){renderEventNationwide(host);if(typeof localize==='function')localize();return}
 host.innerHTML='<p class="eyebrow">SEASONS & EVENTS</p><h1>'+hubPref+'의 계절·행사</h1><p class="sectionIntro">사계절의 대표 풍경과 행사 예시를 보고, 월별 행사 일정을 확인하세요. 개최일과 운영 여부는 방문 연도의 공식 안내를 확인해야 합니다.</p><div class="hubControls"></div><section class="eventSchedule"><h2>'+hubPref+' 행사 일정</h2><div class="eventCards"></div></section>';
 renderSeasonReferences(host,hubPref);
 const controls=host.querySelector('.hubControls');
 controls.append(button('← 전국 계절·행사',()=>{hubPref='전체';eventMonth=0;renderEventHub()}));
 controls.append(scopeSelect(hubPref,p=>{hubPref=p;eventMonth=0;renderEventHub()}));
 const months=document.createElement('div');months.className='chiprow';
 months.append(...Array.from({length:13},(_,m)=>button(m?m+'월':'모든 달',()=>{eventMonth=m;renderEventHub()},eventMonth===m?'active':'')));
 controls.append(months);
 const entries=allEvents().filter(e=>e.pref===hubPref).filter(e=>!eventMonth||e.months.includes(eventMonth)),grid=host.querySelector('.eventCards');
 for(const e of entries){
  const card=document.createElement('article');card.className='eventCard';
  card.innerHTML=`<div class="eventTags"><span>${e.type}</span><span>${e.scheduleType}</span></div><small>${e.pref} · ${e.area}</small><h3>${e.name}</h3><strong>${e.timing}</strong><p>${e.description}</p><a href="${e.source}" target="_blank" rel="noopener">공식 일정·안내 확인 ↗</a>`;
  card.append(button('지역에서 보기',()=>{contentTab='events';go(e.pref,e.area.endsWith('전역')?'전체':e.area)}));grid.append(card);
 }
 if(!entries.length)grid.innerHTML='<div class="empty">선택한 월의 행사 정보는 아직 준비 중입니다. 다른 달을 선택해보세요.</div>';
 if(typeof localize==='function')localize();
}
function renderSeasonReferences(host,pref){
 const section=document.createElement('section');section.className='seasonReferences';
 section.innerHTML='<h2>'+pref+'의 사계절</h2><p>현재 등록된 대표 행사를 계절별로 보여줍니다. 행사 시기는 해마다 달라질 수 있습니다.</p>';
 const grid=document.createElement('div');grid.className='seasonGrid';
 const prefEvents=allEvents().filter(e=>e.pref===pref);
 const defs=[['봄',[3,4,5],4],['여름',[6,7,8],7],['가을',[9,10,11],10],['겨울',[12,1,2],12]];
 for(const [title,months,fallbackMonth] of defs){
  const event=prefEvents.find(e=>(e.months||[]).some(m=>months.includes(m))),pic=eventHubImage(pref,event);
  if(event){
   const month=(event.months||[]).find(m=>months.includes(m))||fallbackMonth;
   const card=button('',()=>{eventMonth=month;renderEventHub();document.querySelector('.eventSchedule')?.scrollIntoView?.({block:'start',behavior:'smooth'})},'seasonCard');
   card.innerHTML=`${pic?`<img src="${pic.src}" alt="${pic.alt||pref+' 대표 장소'}" width="320" height="180" loading="lazy">`:''}<strong>${title}</strong><span>${event.name} · ${event.timing}</span><small>대표 행사 · 날짜는 공식 안내 확인</small>`;grid.append(card);
  }else{
   const card=document.createElement('article');card.className='seasonCard seasonCardEmpty';
   card.innerHTML=`${pic?`<img src="${pic.src}" alt="${pic.alt||pref+' 대표 장소'}" width="320" height="180" loading="lazy">`:''}<strong>${title}</strong><span>이 계절의 대표 행사 정보는 준비 중입니다.</span><small>${pref} 계절 정보</small>`;grid.append(card);
  }
 }
 section.append(grid);host.querySelector('.hubControls').before(section);
}
function routeDirections(a,b){const query=p=>p.mapMode==='coordinates'&&Number.isFinite(p.lat)&&Number.isFinite(p.lon)?p.lat+','+p.lon:(p.mapQuery||p.name+' '+p.pref);return 'https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(query(a))+'&destination='+encodeURIComponent(query(b))+'&travelmode='+(a.pref==='야마나시'?'driving':'transit')}
function routeCard(route){const card=document.createElement('article');card.className='routeCard';card.innerHTML=`${route.image?`<img src="${route.image}" alt="${route.imageAlt||route.areas[0]}" width="350" height="220" loading="lazy">`:""}<div><small>${route.pref} · ${route.duration}</small><h3>${route.title}</h3><p>${route.intro}</p></div>`;card.append(button('일정 보기',()=>{selectedRoute=route.id;renderJourneys();document.querySelector('.routeDetail')?.scrollIntoView({block:'nearest',behavior:'smooth'})}));card.append(button('＋ 내 계획에 담기',()=>newPlan(route),'primary'));return card}
let routeLength='전체';
function renderRoutes(host,pref='전체',area='전체'){
 host.innerHTML='<p class="eyebrow">CURATED ROUTES</p><h2>추천 일정</h2><p class="sectionIntro">기간을 고르고 방문 순서를 확인하세요. 내 계획으로 복사하면 날짜·시간·순서를 자유롭게 수정할 수 있습니다.</p>';
 const help=document.createElement('div');help.className='routeHelp';help.innerHTML='<h3>이렇게 사용하세요</h3><ol><li>원하는 코스의 일정 보기를 눌러 동선을 확인하세요.</li><li>내 계획에 담기를 누르면 방문 장소가 날짜별로 복사됩니다.</li><li>내 계획에서 날짜·시간·방문 순서와 메모를 수정하세요.</li></ol>';help.append(button('＋ 빈 계획 직접 만들기',()=>newPlan()));host.append(help);
 if(host.id==='routeHub')host.append(scopeSelect(hubPref,p=>{hubPref=p;selectedRoute='';renderJourneys()}));
 const controls=document.createElement('div');controls.className='chiprow';for(const duration of ['전체','반나절','1일','2일'])controls.append(button(duration,()=>{routeLength=duration;selectedRoute='';renderJourneys()},routeLength===duration?'active':''));host.append(controls);
 const entries=routeTemplates.filter(r=>(pref==='전체'||r.pref===pref)&&(area==='전체'||r.areas.includes(area))&&(routeLength==='전체'||r.duration===routeLength));const list=document.createElement('div');list.className='routeList';list.append(...entries.map(routeCard));host.append(list);
 if(!entries.length){list.innerHTML='<div class="empty">이 지역의 추천 일정은 준비 중입니다.</div>';host.append(button('내 계획 직접 만들기',()=>{pendingPlace=null;newPlan()}))}
 const route=entries.find(r=>r.id===selectedRoute);if(route){const detail=document.createElement('section');detail.className='routeDetail';detail.innerHTML=`<p class="eyebrow">${route.duration}</p><h3>${route.title}</h3><p>${route.note}</p><p class="muted">체류시간은 관람 참고치이며 이동·식사·대기시간은 별도입니다. 길찾기에서 출발 날짜와 시간을 설정하세요.</p>`;
  if(typeof renderRoutePlanning==='function')renderRoutePlanning(route,detail);
  for(const [n,day]of route.days.entries()){const group=document.createElement('div');group.className='routeDay';group.innerHTML=`<h4>DAY ${n+1} · ${day.label}</h4>`;day.places.forEach((id,i)=>{const p=samples.find(p=>p.id===id),guide=tokyoVisitGuides[id];const stop=document.createElement('article');stop.className='routeStopCard';stop.innerHTML=`${photoForPlace(p)?`<img src="${photoForPlace(p).src}" alt="${p.name}" width="120" height="90" loading="lazy"${photoFrameAttributes(photoForPlace(p))}>`:''}<div><h4>${i+1}. ${p.name}</h4><p>${p.activity}</p><small>체류시간 참고 · ${guide?.duration||'자유롭게 조정'}</small><div class="routeLinks"><a href="${p.source}" target="_blank" rel="noopener">공식 안내 ↗</a></div></div>`;stop.querySelector('.routeLinks').append(button('장소 정보',()=>openDetail(p)));group.append(stop);const next=samples.find(q=>q.id===day.places[i+1]);if(next){const link=document.createElement('a');link.className='routeLeg';link.href=routeDirections(p,next);link.target='_blank';link.rel='noopener';link.textContent=p.name+' → '+next.name+' · 구간 길찾기 ↗';group.append(link)}});detail.append(group)}
  detail.append(button('＋ 내 계획으로 복사',()=>newPlan(route),'primary'));host.append(detail)}
}
function activePlan(){return plans.find(p=>p.id===activePlanId)}
function newPlan(route=null,stay=false){if(plans.length>=30){toast('계획은 최대 30개까지 저장할 수 있습니다.');return}
 const plan={id:uid(),name:route?(typeof translateText==='function'?translateText(route.title):route.title):'',start:'',notes:route?(typeof translateText==='function'?translateText(route.note):route.note):'',days:route?route.days.map(day=>({label:typeof translateText==='function'?translateText(day.label):day.label,items:planItemsForDay(day)})):[{label:'',items:[]}],updated:new Date().toISOString()};
 plans.push(plan);activePlanId=plan.id;savePlans();if(!stay)showPlans();if(route)toast('내 계획으로 복사했습니다. 날짜와 순서를 바꿔보세요.');return plan.id;
}
function editPlan(key,value){const p=activePlan();if(!p)return;p[key]=value;p.updated=new Date().toISOString();savePlans();if(key==='start')renderPlans();if(key==='name'){const b=[...document.querySelectorAll('#planTabs button')].find(b=>b.dataset.planId===p.id);if(b){b.dataset.userContent='';b.textContent=value||'이름 없는 계획'}}}
function dateFor(start,index){if(!start)return '';const date=new Date(start+'T12:00:00');date.setDate(date.getDate()+index);return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0')}
function renderPlans(){const host=$('#plansView');host.innerHTML='<div class="plannerHead"><div><p class="eyebrow">YOUR JOURNEY</p><h1>내 계획</h1></div><button id="newPlanButton">＋ 새 계획</button></div><p class="sectionIntro">이 브라우저에 자동 저장됩니다. 다른 기기에서는 내보낸 파일을 가져와 이어서 편집하세요.</p><div class="planTools"><button onclick="exportPlans()">파일 내보내기</button><button onclick="document.querySelector(\'#planImport\').click()">파일 가져오기</button></div><div id="planTabs" class="chiprow"></div><div id="planEditor"></div>';
 $('#newPlanButton').onclick=()=>newPlan();const tabs=$('#planTabs');for(const p of plans){const b=button(p.name||'이름 없는 계획',()=>{activePlanId=p.id;renderPlans()},p.id===activePlanId?'active':'');b.dataset.planId=p.id;if(p.name)b.dataset.userContent='';tabs.append(b)}
 if(!activePlanId&&plans.length)activePlanId=plans[0].id;const p=activePlan();const editor=$('#planEditor');if(!p){editor.innerHTML='<div class="empty"><h2>첫 계획을 만들어보세요</h2><p>빈 계획을 만들거나 추천 일정을 복사할 수 있습니다.</p><button onclick="state.view=\'routes\';render()">추천 일정 보기</button></div>';return}
 editor.innerHTML=`<div class="planFields"><label>계획 이름<input id="planName" maxlength="120" placeholder="예: 가을 도쿄" value="${esc(p.name)}" oninput="editPlan('name',this.value)"></label><label>시작 날짜<input type="date" id="planStart" value="${esc(p.start)}" onchange="editPlan('start',this.value)"></label><label class="wide">전체 메모<textarea maxlength="5000" placeholder="예약, 숙소, 준비할 것" oninput="editPlan('notes',this.value)">${esc(p.notes)}</textarea></label></div><div class="planDays"></div><div class="planTools"><button onclick="addDay()">＋ 하루 추가</button><button class="danger" onclick="deletePlan()">이 계획 삭제</button></div>`;
 const days=editor.querySelector('.planDays');p.days.forEach((day,di)=>{const section=document.createElement('section');section.className='planDay';section.innerHTML=`<div class="dayHead"><h2>DAY ${di+1} <small>${dateFor(p.start,di)}</small></h2><div class="orderButtons"><button ${di===0?'disabled':''} onclick="moveDay(${di},-1)" aria-label="날짜 앞으로">↑</button><button ${di===p.days.length-1?'disabled':''} onclick="moveDay(${di},1)" aria-label="날짜 뒤로">↓</button></div></div><label>이날의 제목<input maxlength="100" value="${esc(day.label)}" placeholder="예: 신주쿠 산책" oninput="editDay(${di},this.value)"></label><div class="dayItems"></div><form class="addItem" onsubmit="event.preventDefault();addCustomItem(${di},this)"><input name="place" required maxlength="180" placeholder="장소·숙소·이동 직접 입력" aria-label="새 장소"><button type="submit">추가</button></form><button class="browsePlace" onclick="browseForDay(${di})">지도에서 장소 고르기</button>`;
 day.items.forEach((item,ii)=>{const row=document.createElement('div');row.className='planItem';row.innerHTML=`<div class="itemTop"><span class="stepNumber">${ii+1}</span><input data-user-content maxlength="180" value="${esc(item.name)}" aria-label="장소 이름" oninput="editItem(${di},${ii},'name',this.value)"><input type="time" value="${esc(item.time)}" aria-label="시간" onchange="editItem(${di},${ii},'time',this.value)"></div><textarea maxlength="3000" placeholder="주소, 예약 정보, 메모" oninput="editItem(${di},${ii},'note',this.value)">${esc(item.note)}</textarea><div class="itemActions"><button ${ii===0?'disabled':''} onclick="moveItem(${di},${ii},-1)">↑</button><button ${ii===day.items.length-1?'disabled':''} onclick="moveItem(${di},${ii},1)">↓</button><label>이동할 날짜<select aria-label="이동할 날짜" onchange="transferItem(${di},${ii},Number(this.value))">${p.days.map((_,j)=>`<option value="${j}" ${j===di?'selected':''}>DAY ${j+1}</option>`).join('')}</select></label>${item.placeId!==null?`<button onclick="openDetail(samples.find(p=>p.id===${item.placeId}))">장소 정보</button>`:''}<button class="removeItem" onclick="removeItem(${di},${ii})">삭제</button></div>`;section.querySelector('.dayItems').append(row)});
 if(!day.items.length)section.querySelector('.dayItems').innerHTML='<p class="muted">아직 장소가 없습니다. 숙소와 이동도 자유롭게 적어보세요.</p>';
 if(p.days.length>1&&day.items.length===0)section.append(button('빈 날짜 삭제',()=>{p.days.splice(di,1);savePlans();renderPlans()}));days.append(section)});
 if(typeof localize==='function')localize();
}
function editDay(di,value){activePlan().days[di].label=value;savePlans()}
function editItem(di,ii,key,value){activePlan().days[di].items[ii][key]=value;savePlans()}
function addDay(){const p=activePlan();if(p.days.length>=30){toast('한 계획에는 최대 30일까지 추가할 수 있습니다.');return}p.days.push({label:'',items:[]});savePlans();renderPlans()}
function moveDay(di,delta){const p=activePlan(),next=di+delta;if(next<0||next>=p.days.length)return;[p.days[di],p.days[next]]=[p.days[next],p.days[di]];savePlans();renderPlans()}
function addCustomItem(di,form){const value=form.elements.place.value.trim(),p=activePlan();if(!value)return;if(p.days[di].items.length>=60){toast('하루에 최대 60개까지 추가할 수 있습니다.');return}p.days[di].items.push({id:uid(),name:value,placeId:null,time:'',note:''});savePlans();renderPlans()}
function moveItem(di,ii,delta){const a=activePlan().days[di].items,n=ii+delta;if(n<0||n>=a.length)return;[a[ii],a[n]]=[a[n],a[ii]];savePlans();renderPlans()}
function removeItem(di,ii){activePlan().days[di].items.splice(ii,1);savePlans();renderPlans()}
function transferItem(di,ii,target){const p=activePlan();if(di===target||!p.days[target]||p.days[target].items.length>=60)return;const [item]=p.days[di].items.splice(ii,1);p.days[target].items.push(item);savePlans();renderPlans()}
function deletePlan(){lastDeleted=activePlan();plans=plans.filter(p=>p.id!==activePlanId);activePlanId=plans[0]?.id||'';savePlans();renderPlans();toast('계획을 삭제했습니다.',true)}
let targetDay=0, targetPlanId='';
function browseForDay(di){targetDay=di;targetPlanId=activePlanId;contentTab='places';const first=activePlan()?.days.flatMap(d=>d.items).find(i=>i.placeId!=null);const pref=samples.find(p=>p.id===first?.placeId)?.pref||state.pref;go(completePrefs.includes(pref)?pref:'도쿄');toast('장소 상세에서 내 계획에 추가를 누르세요.')}
function choosePlanForPlace(placeId){if(!samples.some(p=>p.id===placeId))return;pendingPlace=placeId;if(targetPlanId&&plans.some(p=>p.id===targetPlanId)){addPlaceToDay(targetPlanId,targetDay,placeId);return}if(!plans.length){const id=newPlan(null,true);if(id)addPlaceToDay(id,0,placeId);return}
 let dialog=$('#planPicker');if(!dialog){dialog=document.createElement('dialog');dialog.id='planPicker';dialog.className='planPicker';document.body.append(dialog)}
 dialog.innerHTML='<div class="menuHead"><h2>어느 계획에 추가할까요?</h2><button onclick="document.querySelector(\'#planPicker\').close()" aria-label="닫기">✕</button></div><div class="planChoices"></div><button id="pickerNew">＋ 새 계획에 추가</button>';
 for(const p of plans){const group=document.createElement('section');const title=document.createElement('h3');title.textContent=p.name||'이름 없는 계획';if(p.name)title.dataset.userContent='';group.append(title);p.days.forEach((day,di)=>group.append(button('DAY '+(di+1),()=>{if(addPlaceToDay(p.id,di,placeId))dialog.close()})));dialog.querySelector('.planChoices').append(group)}
 dialog.querySelector('#pickerNew').onclick=()=>{const id=newPlan(null,true);if(id){if(addPlaceToDay(id,0,placeId))dialog.close()}};dialog.showModal();if(typeof localize==='function')localize();
}
function addPlaceToDay(planId,di,placeId=pendingPlace){
 const plan=plans.find(p=>p.id===planId),place=samples.find(p=>p.id===placeId),day=plan?.days[di];
 if(!day||!place){toast('추가할 장소와 날짜를 다시 선택하세요.');return false}
 if(day.items.length>=60){toast('하루에 최대 60개까지 추가할 수 있습니다.');return false}
 const duplicate=day.items.some(i=>i.placeId===placeId);
 if(!duplicate)day.items.push({id:uid(),placeId:place.id,name:translateText(place.name),time:'',note:''});
 activePlanId=plan.id;plan.updated=new Date().toISOString();pendingPlace=null;targetPlanId='';
 const persisted=savePlans();if(state.view==='plans')renderPlans();
 if(persisted)showPlanAdded(planId,di,duplicate);return true;
}
function exportPlans(){if(!plans.length){toast('내보낼 계획이 없습니다.');return}const data={format:'japlan-plans',version:1,plans},url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='jatlas-plans.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
async function importPlans(file){if(!file)return;try{if(file.size>1000000)throw Error('size');const data=JSON.parse(await file.text());if(data.format!=='japlan-plans'||data.version!==1||!Array.isArray(data.plans)||!data.plans.length||plans.length+data.plans.length>30)throw Error('format');const imported=data.plans.map(p=>cleanPlan(p,true));plans.push(...imported);activePlanId=imported[0].id;savePlans();showPlans();toast('계획을 가져왔습니다. 기존 계획은 그대로 유지됩니다.')}catch{toast('가져올 수 없는 파일입니다. Jatlas에서 내보낸 계획 파일을 선택하세요.')}}
const previousRender=render;render=function(){previousRender();renderJourneys()};
function renderJourneys(){
 $('#regionHub').hidden=state.view!=='regions';if(state.view==='regions')renderRegions();
 $('#eventHub').hidden=state.view!=='events';$('#routeHub').hidden=state.view!=='routes';$('#plansView').hidden=state.view!=='plans';$('#routePanel').hidden=state.view!=='explore'||contentTab!=='routes';
 $('#routesTab').classList.toggle('active',contentTab==='routes');$('#routesTab').setAttribute('aria-pressed',String(contentTab==='routes'));
 if(state.view==='events')renderEventHub();if(state.view==='routes')renderRoutes($('#routeHub'),hubPref);
 if(state.view==='explore'&&contentTab==='routes')renderRoutes($('#routePanel'),state.pref,state.area);
 if(state.view==='plans')renderPlans();
 renderNavigation();
 const navIndex=state.view==='events'?2:state.view==='plans'?3:state.view==='home'&&!nationalRegion?0:state.view==='regions'||state.view==='explore'||state.view==='home'?1:4;document.querySelectorAll('.bottomnav button').forEach((b,i)=>{b.classList.toggle('active',i===navIndex);if(i===navIndex)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
 if(typeof localize==='function')localize();
}
renderJourneys();
