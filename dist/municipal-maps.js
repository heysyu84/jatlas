// Administrative subdivisions, separate from editorial travel areas.
const municipalLoads=new Map();
const municipalKorean={'甲府市':'고후시','富士吉田市':'후지요시다시','都留市':'쓰루시','山梨市':'야마나시시','大月市':'오쓰키시','韮崎市':'니라사키시','南アルプス市':'미나미알프스시','北杜市':'호쿠토시','甲斐市':'가이시','笛吹市':'후에후키시','上野原市':'우에노하라시','甲州市':'고슈시','中央市':'주오시','市川三郷町':'이치카와미사토초','早川町':'하야카와초','身延町':'미노부초','南部町':'난부초','富士川町':'후지카와초','昭和町':'쇼와초','道志村':'도시무라','西桂町':'니시카쓰라초','忍野村':'오시노무라','山中湖村':'야마나카코무라','鳴沢村':'나루사와무라','富士河口湖町':'후지카와구치코마치','小菅村':'고스게무라','丹波山村':'다바야마무라','千代田区':'지요다구','中央区':'주오구','港区':'미나토구','新宿区':'신주쿠구','文京区':'분쿄구','台東区':'다이토구','墨田区':'스미다구','江東区':'고토구','品川区':'시나가와구','目黒区':'메구로구','大田区':'오타구','世田谷区':'세타가야구','渋谷区':'시부야구','中野区':'나카노구','杉並区':'스기나미구','豊島区':'도시마구','北区':'기타구','荒川区':'아라카와구','板橋区':'이타바시구','練馬区':'네리마구','足立区':'아다치구','葛飾区':'가쓰시카구','江戸川区':'에도가와구','八王子市':'하치오지시','立川市':'다치카와시','武蔵野市':'무사시노시','三鷹市':'미타카시','青梅市':'오메시','府中市':'후추시','調布市':'조후시','町田市':'마치다시','小笠原村':'오가사와라무라','大島町':'오시마마치','高山市':'다카야마시','飛騨市':'히다시','岐阜市':'기후시','宇治市':'우지시','松本市':'마쓰모토시','塩尻市':'시오지리시','小樽市':'오타루시','美瑛町':'비에이초','太宰府市':'다자이후시'};
const municipalJapanese=Object.fromEntries(Object.entries(municipalKorean).map(([ja,ko])=>[ko,ja]));
Object.assign(municipalJapanese,{'시구정촌으로 선택':'市区町村から選ぶ','시구정촌 이름 검색':'市区町村名を検索','선택할 수 있는 지역':'選択できる地域','일치하는 지명이 없습니다':'一致する地名がありません','시구정촌 경계를 불러오는 중입니다':'市区町村の境界を読み込み中です','지도를 불러오지 못했습니다':'地図を読み込めませんでした','다시 불러오기':'再読み込み','시구정촌 경계':'市区町村の境界','확대하면 작은 지역의 이름이 표시됩니다.':'拡大すると小さな地域の名前が表示されます。','행정구역 경계 · 2021년 자료를 단순화':'行政区域界・2021年のデータを簡略化','이 지역의 관광 정보는 아직 준비 중입니다.':'この地域の観光情報は準備中です。','지도에서 지역을 선택하세요.':'地図から地域を選んでください。','지도 분할은 행정구역 기준이며 여행권역과 다를 수 있습니다.':'地図の区分は行政区域に基づき、旅行エリアとは異なる場合があります。'});
function municipalities(pref){return municipalIndex[prefNames.indexOf(pref)]||[]}
function municipalName(m){return municipalNames[m.id].ko}
function selectedMunicipality(pref=state.pref,area=state.area){return municipalities(pref).find(m=>municipalName(m)===area)}
function placeInScope(p){if(state.area==='전체'||p.area===state.area)return true;const m=selectedMunicipality();if(!m)return false;const loc=pointLocations[p.id]||p;const geo=municipalGeometry[prefNames.indexOf(state.pref)]?.find(f=>f.properties.id===m.id);if(geo&&Number.isFinite(loc.lon)&&Number.isFinite(loc.lat))return geo.geometry.coordinates.some(poly=>insidePolygon(loc.lon,loc.lat,poly[0])&&!poly.slice(1).some(r=>insidePolygon(loc.lon,loc.lat,r)));return p.town===municipalName(m)||p.town===m.name}
function loadMunicipalities(id){if(municipalGeometry[id])return Promise.resolve();if(municipalLoads.has(id))return municipalLoads.get(id);const promise=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='boundaries/'+id+'.js';script.onload=()=>municipalGeometry[id]?resolve():reject(Error('Empty geometry'));script.onerror=()=>{script.remove();municipalLoads.delete(id);reject(Error('Boundary load failed'))};document.head.append(script)});municipalLoads.set(id,promise);return promise}
function municipalityHasAnyTravelContent(pref,m){
 if(typeof completePrefs==='undefined'||!completePrefs.includes(pref))return true;
 const name=municipalName(m),ja=String(m?.name||''),stem=String(name||'').replace(/(시|구|정|촌)$/,'');
 const textMatch=v=>{const t=String(v||'').replace(/\s+/g,'');return t===name||t===ja||(stem.length>=2&&t.includes(stem))};
 const pointMatch=p=>{
  if(!p||p.pref!==pref)return false;
  if(textMatch(p.town)||textMatch(p.area))return true;
  const loc=(typeof pointLocations!=='undefined'&&pointLocations[p.id])||p;
  if(!Number.isFinite(loc?.lat)||!Number.isFinite(loc?.lon))return false;
  const geo=typeof municipalGeometry!=='undefined'?municipalGeometry[prefNames.indexOf(pref)]?.find(f=>f.properties.id===m.id):null;
  if(geo&&typeof insidePolygon==='function'){
   return geo.geometry.coordinates.some(poly=>insidePolygon(loc.lon,loc.lat,poly[0])&&!poly.slice(1).some(r=>insidePolygon(loc.lon,loc.lat,r)));
  }
  const b=m?.bounds;
  return Array.isArray(b)&&b.length>=2&&loc.lat>=Number(b[0]?.[0])&&loc.lat<=Number(b[1]?.[0])&&loc.lon>=Number(b[0]?.[1])&&loc.lon<=Number(b[1]?.[1]);
 };
 if(typeof samples!=='undefined'&&samples.some(pointMatch))return true;
 if(typeof eventsForPref==='function'&&(eventsForPref(pref)||[]).some(e=>textMatch(e.area)||textMatch(e.town)||textMatch(e.where)))return true;
 if(typeof foodsForPref==='function'&&(foodsForPref(pref)||[]).some(x=>textMatch(x.area)||textMatch(x.town)||textMatch(x.where)))return true;
 return false;
}
function applyMunicipalityAvailability(pref=typeof state!=='undefined'?state.pref:''){
 if(!pref||typeof municipalities!=='function')return;
 const complete=typeof completePrefs!=='undefined'&&completePrefs.includes(pref);
 for(const el of document.querySelectorAll('[data-municipality-id]')){
  const m=municipalities(pref).find(x=>String(x.id)===String(el.dataset.municipalityId));
  if(!m)continue;
  const empty=complete&&!municipalityHasAnyTravelContent(pref,m);
  el.classList.toggle('noContent',empty);
  if(empty){el.dataset.contentEmpty='true';el.setAttribute('aria-description','등록된 관광·음식·계절행사 정보 없음')}
  else{delete el.dataset.contentEmpty;el.removeAttribute('aria-description')}
 }
}
function renderMunicipalPicker(){
 let box=document.getElementById('municipalPicker');if(!box){box=document.createElement('details');box.id='municipalPicker';box.className='municipalPicker';box.innerHTML='<summary>시구정촌으로 선택</summary><label for="municipalSearch">시구정촌 이름 검색</label><input id="municipalSearch" type="search" placeholder="시구정촌 이름 검색"><div id="municipalChoices" role="group" aria-label="선택할 수 있는 지역"></div>';document.querySelector('#towns').parentElement.after(box)}
 box.hidden=state.view!=='explore'||contentTab!=='places';const input=box.querySelector('input');if(box.dataset.pref!==state.pref){input.value='';box.dataset.pref=state.pref;box.open=false}
 const fill=()=>{const q=input.value.trim().toLowerCase();const items=municipalities(state.pref).filter(m=>(m.name+' '+municipalName(m)).toLowerCase().includes(q));const list=box.querySelector('#municipalChoices');list.replaceChildren(...items.map(m=>{const b=button(municipalName(m),()=>{contentTab='places';go(state.pref,municipalName(m));setMobileMapView?.('map')},state.area===municipalName(m)?'active':'');b.title=municipalName(m);b.dataset.municipalityId=m.id;return b}));if(!items.length)list.textContent='일치하는 지명이 없습니다';if(typeof localize==='function')localize();applyMunicipalityAvailability(state.pref)};input.oninput=fill;fill();stampMunicipalHeadings();applyMunicipalityAvailability(state.pref);
 document.querySelector('#areas').parentElement.hidden=document.querySelector('#areas').children.length<=1;document.querySelector('#towns').parentElement.hidden=document.querySelector('#towns').children.length<=1;
}
function drawMunicipalities(map,pref){
 const id=prefNames.indexOf(pref);const geometry=municipalGeometry[id];if(!geometry)return;
 const style=f=>({color:'#fff',weight:1.5,fillColor:cutoutColors[Number(f.properties.id)%cutoutColors.length],fillOpacity:1,lineJoin:'round'});
 const layer=L.geoJSON(geometry,{style,onEachFeature:(f,l)=>{const m=municipalities(pref).find(m=>m.id===f.properties.id);const name=municipalName(m);const enter=()=>{contentTab='places';go(pref,name)};l.bindTooltip('<span data-municipality-id="'+m.id+'">'+name+'</span>',{sticky:true});l.on('tooltipopen',()=>{if(typeof localize==='function')localize()});l.on('click',enter);l.on('mouseover',()=>{l.bringToFront();l.setStyle({color:'#315987',weight:2.5})});l.on('mouseout',()=>l.setStyle(style(f)));l.on('add',()=>{const path=l.getElement();if(path){path.setAttribute('tabindex','0');path.setAttribute('role','button');path.setAttribute('aria-label',name);path.dataset.municipalityAria=m.id;path.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();enter()}})}})}}).addTo(map);
 const labels=L.layerGroup().addTo(map);const redraw=()=>{labels.clearLayers();const occupied=[];const view=map.getBounds();for(const f of geometry){const anchor=labelAnchor(f,view);if(!anchor)continue;const m=municipalities(pref).find(m=>m.id===f.properties.id);const point=map.latLngToContainerPoint(anchor),name=municipalName(m);const width=Math.min(160,Math.max(64,name.length*12));const rect=[point.x-width/2,point.y-15,point.x+width/2,point.y+15];if(occupied.some(r=>rect[0]<r[2]&&rect[2]>r[0]&&rect[1]<r[3]&&rect[3]>r[1]))continue;occupied.push(rect);L.marker(anchor,{icon:L.divIcon({className:'municipalLabel',html:'<span data-municipality-id="'+m.id+'">'+name+'</span>',iconSize:[width,30],iconAnchor:[width/2,15]}),title:name,keyboard:true}).on('add',function(){this.getElement().dataset.municipalityAria=m.id}).addTo(labels).on('click',()=>go(pref,name))}if(typeof localize==='function')localize();applyMunicipalityAvailability(pref)};map.on('moveend',redraw);redraw();
 map.attributionControl.addAttribution('<a href="https://nlftp.mlit.go.jp/ksj/index.html" target="_blank" rel="noopener">국토수치정보 · MLIT 2021</a>');
 $('#mapNote').textContent='행정구역 경계 · 2021년 자료를 단순화 · 확대하면 작은 지역의 이름이 표시됩니다.';
}
function attachMunicipalities(map,pref){const id=prefNames.indexOf(pref);if(municipalGeometry[id]){drawMunicipalities(map,pref);return}$('#mapNote').textContent='시구정촌 경계를 불러오는 중입니다';loadMunicipalities(id).then(()=>{if(mapInstances.get('regionalMap')===map&&state.pref===pref&&state.area==='전체')drawMunicipalities(map,pref);if(state.pref===pref&&selectedMunicipality()){mapKey='';render()}}).catch(()=>{if(mapInstances.get('regionalMap')!==map)return;$('#mapNote').replaceChildren(document.createTextNode('지도를 불러오지 못했습니다 '),button('다시 불러오기',()=>attachMunicipalities(map,pref)));if(typeof localize==='function')localize()})}
function stampMunicipalHeadings(){
 const m=state.view==='explore'?selectedMunicipality():null;
 for(const id of ['title','mapTitle']){const el=document.getElementById(id);delete el.dataset.municipalityId;delete el.dataset.municipalityPrefix;if(m){el.dataset.municipalityId=m.id;if(id==='mapTitle')el.dataset.municipalityPrefix=state.pref+' · '}}
 for(const el of document.querySelectorAll('#crumb button,#crumb [aria-current]'))if(m&&el.textContent===municipalName(m))el.dataset.municipalityId=m.id;
}
function localizeMunicipalLabels(){
 const lang=language==='ja'?'ja':'ko';
 for(const el of document.querySelectorAll('[data-municipality-id]')){const n=municipalNames[el.dataset.municipalityId];if(!n)continue;el.textContent=translateText(el.dataset.municipalityPrefix||'')+n[lang];if(el.hasAttribute('title'))el.title=n[lang]}
 for(const el of document.querySelectorAll('[data-municipality-aria]')){const n=municipalNames[el.dataset.municipalityAria];if(n){el.setAttribute('aria-label',n[lang]);if(el.hasAttribute('title'))el.title=n[lang]}}
}
