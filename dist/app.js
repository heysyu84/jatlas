const regions=[["홋카이도","홋카이도"],["도호쿠","아오모리 이와테 미야기 아키타 야마가타 후쿠시마"],["북간토","도치기 군마 이바라키"],["수도권","사이타마 지바 도쿄 가나가와"],["고신에쓰","야마나시 나가노 니가타"],["도카이","시즈오카 기후 아이치 미에"],["호쿠리쿠","도야마 이시카와 후쿠이"],["긴키","시가 교토 오사카 효고 나라 와카야마"],["산인·산요","돗토리 시마네 오카야마 히로시마 야마구치"],["시코쿠","도쿠시마 가가와 에히메 고치"],["규슈","후쿠오카 사가 나가사키 구마모토 오이타 미야자키 가고시마"],["오키나와","오키나와"]];
// UI evaluation examples only. No travel times, precise coordinates or live information.
const samples=[['홋카이도','삿포로·오타루','삿포로','오도리 공원','도시 산책'],['홋카이도','삿포로·오타루','오타루','오타루 운하','거리 풍경'],['홋카이도','후라노·비에이','비에이','시로가네 푸른 연못','자연'],['기후','히다','다카야마','산마치 옛 거리','옛 마을'],['기후','히다','히다후루카와','세토가와와 시라카베 도조가이','마을 산책'],['기후','기후·나가라가와','기후시','기후성','역사'],['교토','교토 시내','교토시','기요미즈데라','사찰'],['교토','교토 시내','교토시','아라시야마','자연·산책'],['교토','우지','우지시','뵤도인','사찰'],['나가노','마쓰모토·아즈미노','마쓰모토시','마쓰모토성','역사'],['나가노','기소','시오지리시','나라이주쿠','옛 마을'],['후쿠오카','후쿠오카·다자이후','후쿠오카시','오호리 공원','도시 산책'],['후쿠오카','후쿠오카·다자이후','다자이후시','다자이후 텐만구','신사'],['후쿠오카','기타큐슈','기타큐슈시','모지코 레트로','거리 풍경']].map((a,i)=>({id:i,pref:a[0],area:a[1],town:a[2],name:a[3],tag:a[4]})).filter(p=>!completePrefs.includes(p.pref));
samples.push(...tokyoPlaces,...yamanashiPlaces,...osakaPlaces);
for(const p of regionalPlaces){const i=samples.findIndex(q=>q.id===p.id);if(i>=0)samples[i]=p;else samples.push(p)}
let placeTheme='전체';
let contentTab='places',eventMonth=0,eventAllAreas=false;
const $=s=>document.querySelector(s),allPrefs=regions.flatMap(r=>r[1].split(' '));let state={view:'home',pref:'',area:'전체',town:'전체'},selected=null,saved=[];try{saved=JSON.parse(localStorage.getItem('atlas-saved')||'[]').filter(id=>samples.some(p=>p.id===id))}catch{};
function button(text,fn,cls=''){const b=document.createElement('button');b.textContent=text;b.className=cls;b.dataset.pref=text;b.onclick=fn;return b}
function go(pref,area='전체',town='전체'){const enteringPref=state.view!=='explore'||state.pref!==pref;if(contentTab==='foods'&&!completePrefs.includes(pref))contentTab='places';if(pref!==state.pref)placeTheme='전체';eventAllAreas=false;state={view:'explore',pref,area,town};close();render();if(enteringPref&&!(typeof detailOpening!=='undefined'&&detailOpening))window.scrollTo?.({top:0,behavior:'instant'})}
function close(){document.querySelectorAll('[data-place]').forEach(e=>{e.classList.remove('chosen');e.setAttribute('aria-pressed','false')});$('#detail').hidden=true;selected=null;syncMapSelection();renderNavigation()}
function scopeHasContent(pref,area='전체',town='전체',tab=contentTab){
 if(typeof completePrefs==='undefined'||!completePrefs.includes(pref))return true;
 const inScope=x=>(area==='전체'||x.area===area)&&(town==='전체'||x.town===town);
 if(tab==='places')return samples.some(p=>p.pref===pref&&inScope(p));
 if(tab==='events')return typeof eventsForPref==='function'&&(eventsForPref(pref)||[]).some(e=>(area==='전체'||e.area===area||String(e.area||'').endsWith('전역'))&&(town==='전체'||e.town===town));
 if(tab==='foods')return typeof foodsForPref==='function'&&(foodsForPref(pref)||[]).some(x=>(area==='전체'||x.area===area)&&(town==='전체'||x.town===town||String(x.where||'').includes(town)));
 if(tab==='routes'&&typeof routesForPref==='function')return (routesForPref(pref)||[]).some(r=>(area==='전체'||r.area===area)&&(town==='전체'||r.town===town));
 return true;
}
function markScopeAvailability(){
 if(state.view!=='explore')return;
 for(const b of document.querySelectorAll('#areas button')){
  const empty=b.textContent!=='전체'&&!scopeHasContent(state.pref,b.textContent,'전체',contentTab);
  b.classList.toggle('noContent',empty);
  if(empty)b.setAttribute('aria-description','현재 메뉴에 등록된 내용 없음');else b.removeAttribute('aria-description');
 }
 for(const b of document.querySelectorAll('#towns button')){
  const empty=b.textContent!=='전체'&&!scopeHasContent(state.pref,state.area,b.textContent,contentTab);
  b.classList.toggle('noContent',empty);
  if(empty)b.setAttribute('aria-description','현재 메뉴에 등록된 내용 없음');else b.removeAttribute('aria-description');
 }
}

function render(){for(const id of ['title','mapTitle']){delete $('#'+id).dataset.municipalityId;delete $('#'+id).dataset.municipalityPrefix}for(const id of ['overview','explore','saved'])$('#'+id).hidden=id!==({home:'overview',explore:'explore',saved:'saved'}[state.view]);$('#count').textContent=saved.length;if(state.view==='explore'){$('#title').textContent=state.pref;const regionKey=regions.find(r=>r[1].split(' ').includes(state.pref))?.[0]||'';$('#regionLabel').textContent=({"홋카이도":"HOKKAIDO","도호쿠":"TOHOKU","북간토":"NORTH KANTO","수도권":"GREATER TOKYO","고신에쓰":"KOSHINETSU","도카이":"TOKAI","호쿠리쿠":"HOKURIKU","긴키":"KINKI","산인·산요":"SAN'IN · SAN'YO","시코쿠":"SHIKOKU","규슈":"KYUSHU","오키나와":"OKINAWA"}[regionKey]||regionKey)+' / JAPAN';$('#summary').textContent=state.pref==='도쿄'?'도심 산책부터 산과 섬까지, 함께 둘러볼 권역별로 찾아보세요.':'권역과 마을을 바꾸면서 한 화면에서 둘러보세요.';$('#prefSwitch').value=state.pref;$('#mobilePrefSwitch').value=state.pref;const data=samples.filter(p=>p.pref===state.pref),areas=['전체',...new Set([...data.map(p=>p.area),...(state.pref==='도쿄'?tokyoEvents.filter(e=>!e.area.endsWith('전역')).map(e=>e.area):[])])];$('#areas').replaceChildren(...areas.map(a=>button(a,()=>go(state.pref,a),a===state.area?'active':'')));const scoped=data.filter(p=>placeInScope(p)),towns=['전체',...new Set(scoped.map(p=>p.town))];$('#towns').replaceChildren(...towns.map(t=>button(t,()=>go(state.pref,state.area,t),t===state.town?'active':'')));const visible=orderedPlaces(scoped.filter(p=>(state.town==='전체'||p.town===state.town)&&placeMatches(p)));$('#resultTitle').textContent=`둘러볼 장소 · ${visible.length}개${completePrefs.includes(state.pref)?'':' 예시'}`;$('#cards').replaceChildren(...visible.map(card));if(!visible.length)$('#cards').innerHTML=selectedMunicipality()?'<div class="empty"><p>이 지역의 관광 정보는 아직 준비 중입니다.</p></div>':completePrefs.includes(state.pref)?'<div class="empty"><h2>조건에 맞는 장소가 없습니다</h2><p>다른 테마를 선택하거나 계절·행사 탭을 살펴보세요.</p></div>':'<div class="empty"><h2>이 지역의 틀을 준비했습니다</h2><p>이 지역의 관광 정보는 아직 준비 중입니다.</p><p class="muted">지도에서 지역을 선택하세요.</p></div>'}document.querySelectorAll('nav button').forEach(b=>{b.classList.toggle('active',b.dataset.pref===state.pref&&state.view==='explore');b.setAttribute('aria-pressed',b.classList.contains('active'))});if(state.view==='saved')renderSaved();renderContent();renderDesign();renderMaps();renderNavigation();markScopeAvailability();if(typeof renderMunicipalPicker==='function')renderMunicipalPicker();if(typeof localize==='function')localize()}
function home(){nationalRegion='';state={view:'home',pref:'',area:'전체',town:'전체'};contentTab='places';placeTheme='전체';clearSearch();close();render();window.scrollTo?.({top:0,behavior:'smooth'})}
function card(p){const b=button('',()=>openDetail(p),'card');b.dataset.place=p.id;b.setAttribute('aria-pressed','false');const photo=photoForPlace(p);b.innerHTML=`${photo?`<img class="placePhoto" src="${photo.src}"${photoFrameAttributes(photo)} alt="${photo.alt}" width="320" height="210" loading="lazy">`:''}<small>${p.area} · ${p.town}</small><strong>${p.name}</strong><span>${p.tag}</span><em>장소 살펴보기 ↗</em>`;return b}
function openDetail(p){if(!placeMatches(p))placeTheme='전체';if(state.view!=='explore'||state.pref!==p.pref||state.area==='전체'||state.area!==p.area||state.town!=='전체'&&state.town!==p.town)go(p.pref,p.area);contentTab='places';renderContent();renderDesign();renderMaps();if(typeof renderJourneys==='function')renderJourneys();selected=p;syncMapSelection();$('#detail').hidden=false;$('#detailDock').append($('#detail'));document.querySelectorAll('[data-place]').forEach(e=>{e.classList.toggle('chosen',e.dataset.place===String(p.id));e.setAttribute('aria-pressed',String(e.dataset.place===String(p.id)))});$('#detailBody').innerHTML=`<button class="detailParent" onclick="navigateUp()">← 지역으로 돌아가기</button><p class="eyebrow">${p.pref} / ${p.town}</p><h2>${p.name}</h2>${tokyoDetailExtras(p)}<p class="locationstatus">${pointLocations[p.id]?pointLocations[p.id].note:(p.note||"이 장소의 상세 위치는 아직 확인 전입니다.")}</p><h3>어떤 곳인가요?</h3><p>${p.description||p.tag+' · 설명이 들어갈 자리입니다.'}</p><h3>어떻게 즐길까요?</h3><p>${p.activity||'상세 정보는 조사 전입니다.'}</p>${p.source?`<div class="officialLinks"><a href="${p.source}" target="_blank" rel="noopener">공식 관광 안내 ↗</a>${(p.mapQuery||p.mapUrl||pointLocations[p.id])?`<a href="${googlePlaceMapURL(p,false)}" target="_blank" rel="noopener">지도에서 장소 검색 ↗</a>`:''}</div><p class="mapcredit">공식 자료 확인: ${p.checked||'2026.09.20'}</p>`:''}<button class="save" id="savePlace"></button><button class="addToPlan" onclick="choosePlanForPlace(${p.id})">＋ 내 계획에 추가</button><h3>같은 권역의 다른 장소</h3><div id="nearby"></div>`;updateSave();$('#savePlace').onclick=()=>{saved=saved.includes(p.id)?saved.filter(id=>id!==p.id):[...saved,p.id];try{localStorage.setItem('atlas-saved',JSON.stringify(saved))}catch{}$('#count').textContent=saved.length;updateSave();if(state.view==='saved')renderSaved()};const near=orderedPlaces(samples.filter(q=>q.area===p.area&&q.pref===p.pref&&q.id!==p.id),p.pref);$('#nearby').replaceChildren(...near.map(q=>button(q.name,()=>openDetail(q),'searchhit')));if(!near.length){if(completePrefs.includes(p.pref))$('#nearby').append(button(p.pref+' · 전체',()=>go(p.pref)));else $('#nearby').textContent='추가 예시가 아직 없습니다.';}if(completePrefs.includes(p.pref))$('#detailBody').append(button('이 권역의 계절·행사',()=>{contentTab='events';close();render()},'detailEvents'));if(p.eventSource){const link=document.createElement('a');link.href=p.eventSource;link.target='_blank';link.rel='noopener';link.textContent='코미케 공식 일정·참가 안내 ↗';$('#detailBody').append(link)}if(completePrefs.includes(p.pref))$('#detailBody').append(button('이 권역의 추천 음식',()=>{contentTab='foods';close();render()},'detailEvents'));renderNavigation();if(typeof localize==='function')localize();$('#detail').scrollIntoView?.({block:'nearest',behavior:'smooth'})}
function updateSave(){$('#savePlace').textContent=saved.includes(selected.id)?'✓ 관심 장소에 저장됨 · 해제':'♡ 관심 장소에 저장'}
function renderSaved(){const list=$('#savedList');list.replaceChildren();const points=samples.filter(p=>saved.includes(p.id));if(!points.length){list.innerHTML='<div class="empty">아직 저장한 장소가 없습니다. 지역에서 장소를 열어 저장해보세요.</div>';return}for(const key of [...new Set(points.map(p=>p.pref+' · '+p.area))]){const group=document.createElement('div');group.className='savedgroup';const h=document.createElement('h2');h.textContent=key;const grid=document.createElement('div');grid.className='cards';grid.append(...points.filter(p=>p.pref+' · '+p.area===key).map(card));group.append(h,grid);list.append(group)}}
for(const [name,prefs] of regions){const d=document.createElement('details');d.open=true;const s=document.createElement('summary');s.textContent=name;const box=document.createElement('div');box.className='pref';box.append(...prefs.split(' ').map(p=>button(p,()=>go(p))));d.append(s,box);$('#nav').append(d);}
$('#prefSwitch').append(...allPrefs.map(p=>new Option(p,p)));$('#mobilePrefSwitch').append(...allPrefs.map(p=>new Option(p,p)));$('#prefSwitch').onchange=e=>go(e.target.value);$('#mobilePrefSwitch').onchange=e=>go(e.target.value);$('#home').onclick=home;$('#brand').onclick=e=>{e.preventDefault();home()};$('#savedToggle').onclick=()=>{state.view=state.view==='saved'?'home':'saved';close();render()};$('#closeDetail').onclick=close;document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(typeof dismissDetail==='function')dismissDetail();else close()}});const normalizeSearchText=value=>String(value??'').normalize('NFKC').toLowerCase().replace(/\\s+/gu,'');
$('#search').oninput=e=>{
 const q=normalizeSearchText(e.target.value),r=$('#searchResults');r.replaceChildren();if(!q)return;
 const hits=allPrefs.filter(p=>normalizeSearchText(p+' '+translateText(p)).includes(q)).map(p=>button(p,()=>{go(p);clearSearch()},'searchhit'));
 for(const p of samples.filter(p=>normalizeSearchText(p.name+' '+p.town+' '+p.area+' '+translateText(p.name+' '+p.town+' '+p.area,true)).includes(q))){
  const b=button('',()=>{go(p.pref,p.area,p.town);openDetail(p);clearSearch()},'searchhit');b.textContent=p.name;
  const small=document.createElement('small');small.textContent=p.pref+' · '+p.town;b.append(small);hits.push(b);
 }
 if(typeof foodsForPref==='function'){
  for(const pref of allPrefs){
   for(const food of foodsForPref(pref)||[]){
    const foodSearch=normalizeSearchText(String(food.name||'')+' '+String(food.kind||'')+' '+translateText(String(food.name||'')+' '+String(food.kind||''),true));
    if(!foodSearch.includes(q))continue;
    const b=button('',()=>{contentTab='foods';go(pref,food.area||'전체');clearSearch()},'searchhit');b.textContent=food.name;
    const small=document.createElement('small');
    small.textContent=(language==='ja'?'グルメ':'음식')+' · '+translateText(pref)+(food.area?' · '+translateText(food.area):'');
    b.append(small);hits.push(b);
   }
  }
 }
 for(const [prefId,ms] of Object.entries(municipalIndex)){for(const m of ms){
  if(!normalizeSearchText(municipalName(m)+' '+m.name).includes(q))continue;
  const pref=prefNames[Number(prefId)],b=button('',()=>{contentTab='places';go(pref,municipalName(m));clearSearch()},'searchhit');
  const n=document.createElement('span');n.dataset.municipalityId=m.id;n.textContent=municipalName(m);
  const small=document.createElement('small');small.textContent=pref;b.append(n,small);
  if(typeof markMunicipalityContent==='function')markMunicipalityContent(b,pref,m);hits.push(b)
 }}
 r.append(...hits.slice(0,12));localize();
 if(!hits.length)r.innerHTML='<p class="searchEmpty">등록된 예시가 없습니다. 현 이름으로 찾아보세요.</p>'
};$('#resetMap').onclick=()=>{selected=null;renderMaps(true)};$('#placesTab').onclick=()=>{contentTab='places';render()};$('#eventsTab').onclick=()=>{contentTab='events';render()};
function clearSearch(){$('#search').value='';$('#searchResults').replaceChildren()}render();

function renderContent(){
 const tokyo=state.view==='explore'&&state.pref==='도쿄';
 $('#tokyoIntro').hidden=!tokyo;$('#contentTabs').hidden=state.view!=='explore';
 const events=state.view==='explore'&&contentTab==='events';$('#placePanel').hidden=contentTab!=='places';renderFoods();$('#eventPanel').hidden=!events;
 $('#placesTab').classList.toggle('active',contentTab==='places');$('#eventsTab').classList.toggle('active',events);
 $('#placesTab').setAttribute('aria-pressed',String(contentTab==='places'));$('#eventsTab').setAttribute('aria-pressed',String(events));
 $('#eventPanel .eventHead h2').textContent=state.pref+' · 계절·행사';if(!events)return;
 $('#monthFilters').replaceChildren(...Array.from({length:13},(_,m)=>button(m?m+'월':'모든 달',()=>{eventMonth=m;renderContent()},eventMonth===m?'active':'')));
 $('#eventScope').replaceChildren(button(state.pref+' 전체 행사',()=>{eventAllAreas=true;renderContent()},eventAllAreas||state.area==='전체'?'active':''));
 if(state.area!=='전체')$('#eventScope').append(button(state.area+' 중심',()=>{eventAllAreas=false;renderContent()},!eventAllAreas?'active':''));
 const eventsShown=eventsForPref(state.pref).filter(e=>(!eventMonth||e.months.includes(eventMonth))&&(eventAllAreas||state.area==='전체'||e.area===state.area||e.area.endsWith('전역')));
 $('#eventCards').replaceChildren(...eventsShown.map(e=>{const el=document.createElement('article');el.className='eventCard';el.innerHTML=`<div class="eventTags"><span>${e.type}</span><span class="${e.scheduleType==='고정 날짜'?'fixed':''}">${e.scheduleType}</span></div><small>${e.area}</small><h3>${e.name}</h3><strong>${e.timing}</strong><p>${e.description}</p><a href="${e.source}" target="_blank" rel="noopener">공식 일정·안내 확인 ↗</a>`;if(!e.area.endsWith('전역'))el.append(button('이 권역의 지도·장소',()=>{contentTab='places';go(state.pref,e.area)},'eventArea'));return el}));
 if(!eventsShown.length)$('#eventCards').innerHTML='<div class="empty">선택한 범위의 행사 정보는 준비 중입니다. 지역이나 월을 바꿔보세요.</div>';
}

// Hierarchical navigation is independent of browser history and the last map viewport.
function hierarchySteps(){
 const steps=[{label:'전국',action:home}];
 if(state.view==='home'){if(nationalRegion)steps.push({label:nationalRegion,action:()=>selectRegion(nationalRegion)});return steps}
 if(state.view!=='explore'){steps.push({label:({regions:'지역별 탐색',events:'계절·행사',routes:'추천 일정',plans:'내 계획',saved:'저장한 장소'})[state.view]||'전국',action:()=>{}});return steps}
 const pref=state.pref,area=state.area,town=state.town,region=regionFor(pref);
 if(region)steps.push({label:region,action:()=>{contentTab='places';selectRegion(region)}});
 steps.push({label:pref,action:()=>{contentTab='places';go(pref)}});
 if(area!=='전체')steps.push({label:area,action:()=>{contentTab='places';go(pref,area)}});
 if(town!=='전체'&&town!==area)steps.push({label:town,action:()=>{contentTab='places';go(pref,area,town)}});
 if(selected&&contentTab==='places')steps.push({label:selected.name,action:()=>{}});
 return steps;
}
function navigateUp(){const steps=hierarchySteps();if(steps.length>1){steps[steps.length-2].action();window.scrollTo?.({top:0,behavior:'smooth'})}}
function renderNavigation(){
 const host=$('#crumb');if(!host)return;syncPrefPicker();
 const steps=hierarchySteps();const list=document.createElement('ol');
 steps.forEach((step,i)=>{const li=document.createElement('li');if(i===steps.length-1){const text=document.createElement('span');text.textContent=step.label;text.setAttribute('aria-current','page');li.append(text)}else{li.append(button(step.label,()=>{step.action();window.scrollTo?.({top:0,behavior:'smooth'})}))}list.append(li)});
 host.replaceChildren(list);
 stampMunicipalHeadings();
 if(typeof localize==='function')localize();
}

function syncPrefPicker(){
 const picker=$('#prefSwitch'),target=$('#prefSwitchDesktop');
 if(picker&&target&&picker.parentElement!==target)target.append(picker);
 if(picker)picker.hidden=state.view!=='explore';
 const mobile=$('#mobilePrefSwitch');if(mobile){mobile.hidden=state.view!=='explore';if(state.view==='explore')mobile.value=state.pref}
}
window.addEventListener('resize',syncPrefPicker);
