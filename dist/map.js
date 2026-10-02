// Boundary geometry is sourced, never hand drawn. Coordinates use Web Mercator.
const prefNames=['','홋카이도','아오모리','이와테','미야기','아키타','야마가타','후쿠시마','이바라키','도치기','군마','사이타마','지바','도쿄','가나가와','니가타','도야마','이시카와','후쿠이','야마나시','나가노','기후','시즈오카','아이치','미에','시가','교토','오사카','효고','나라','와카야마','돗토리','시마네','오카야마','히로시마','야마구치','도쿠시마','가가와','에히메','고치','후쿠오카','사가','나가사키','구마모토','오이타','미야자키','가고시마','오키나와'];
const pointLocations={3:{lon:137.257,lat:36.142,note:'다카야마 중심부 기준. 관광지 입구와는 다를 수 있습니다.'},4:{lon:137.1863664,lat:36.23568975,note:'히다시 공식 관광 안내 지점.',source:'https://www.hida-kankou.jp/spot/278'},5:{lon:136.7813,lat:35.4339,note:'기후성 일대의 대표 위치. 등산·로프웨이 출발지는 별도로 확인하세요.'}};
const mapInstances=new Map(),markerInstances=new Map();let mapKey='',nationalRegion='';
const prefectureFeatures=geography.map(f=>({type:'Feature',properties:{name:prefNames[f.id],id:f.id},geometry:{type:'MultiPolygon',coordinates:f.rings.map(r=>[[...r,r[0]]])}}));
const areaBoxes={'기후|히다':[[36.00,136.96],[36.40,137.52]],'기후|기후·나가라가와':[[35.39,136.72],[35.47,136.82]]};
const regionCenters={"홋카이도":[43.4,142.3],"도호쿠":[39.4,140.6],"북간토":[36.6,139.8],"수도권":[35.55,139.95],"고신에쓰":[36.85,138.15],"도카이":[34.85,137.45],"호쿠리쿠":[36.65,136.15],"긴키":[34.65,135.2],"산인·산요":[34.55,132.75],"시코쿠":[33.65,133.65],"규슈":[32.55,130.55]};
// Fixed screen offsets from each region's geographic center.
// They never change in response to collisions, so labels stay predictable while
// the crowded central regions remain visually separated at every desktop aspect ratio.
const regionLabelOffsets={"홋카이도":[0,0],"도호쿠":[0,0],"고신에쓰":[6,-30],"호쿠리쿠":[-24,-6],"북간토":[58,-8],"수도권":[62,34],"도카이":[22,38],"긴키":[-18,46],"산인·산요":[-34,8],"시코쿠":[-12,54],"규슈":[-18,18]};
function isMobile(){return window.matchMedia('(max-width: 760px)').matches}
function regionFor(pref){return regions.find(r=>r[1].split(' ').includes(pref))?.[0]||''}
function geographicBounds(names,mainland=true){if(mainland&&names.length===1&&names[0]==='오키나와'){const rings=geography.find(f=>f.id===47).rings;const area=r=>(Math.max(...r.map(p=>p[0]))-Math.min(...r.map(p=>p[0])))*(Math.max(...r.map(p=>p[1]))-Math.min(...r.map(p=>p[1])));const main=rings.reduce((a,b)=>area(a)>area(b)?a:b);return L.latLngBounds(main.map(p=>[p[1],p[0]])).pad(.06)}if(mainland&&names.length===1&&names[0]==='가고시마'){const pts=geography.find(f=>f.id===46).rings.flat().filter(p=>p[1]>=30.15);return L.latLngBounds(pts.map(p=>[p[1],p[0]])).pad(.04)}const pts=geography.filter(f=>names.includes(prefNames[f.id])).flatMap(f=>f.rings.flat().filter(p=>!mainland||f.id!==13||p[1]>35));return L.latLngBounds(pts.map(p=>[p[1],p[0]]))}
function disposeMap(id){const old=mapInstances.get(id);if(old){old.remove();mapInstances.delete(id)}}
const pastelRegions={'홋카이도':'#a9cdef','도호쿠':'#b9e4d3','북간토':'#c8d9a0','수도권':'#f3b4c7','고신에쓰':'#d9c9ee','도카이':'#f4dda0','호쿠리쿠':'#aee0df','긴키':'#f6c4a9','산인·산요':'#efd4a5','시코쿠':'#bfc9eb','규슈':'#edb9dd','오키나와':'#e59448'};
const cutoutColors=['#b7d8ef','#d5c5ec','#bce0d0','#f2dca7','#f1b7cc','#f6ccab','#bee6e7'];
function mapStyle(f,detailed){const chosen=state.view==='explore'&&f.properties.name===state.pref;return{color:chosen?'#e6557b':'#ffffff',weight:chosen?2.4:1.2,fillColor:chosen?'#f292b0':(state.view==='home'&&nationalRegion?cutoutColors[f.properties.id%cutoutColors.length]:(state.view==='explore'?'#dbe4ed':pastelRegions[regionFor(f.properties.name)]||'#dbe5ef')),fillOpacity:detailed?(chosen?.04:0):1}}
function createMap(id,bounds,{detailed=false,mode='pref',only=null,features=null}={}){
 disposeMap(id);const host=document.getElementById(id);host.replaceChildren();host.classList.remove('googleDetail');host.classList.toggle('boundary-view',!detailed);host.classList.toggle('detail-view',detailed);
 const map=L.map(host,{attributionControl:true,zoomControl:false,scrollWheelZoom:false,touchZoom:true,dragging:true,doubleClickZoom:true,boxZoom:false,minZoom:3,maxZoom:18,zoomSnap:.1,zoomDelta:1,keyboard:true});mapInstances.set(id,map);map.attributionControl.setPrefix(false);
 const fitOptions={paddingTopLeft:[8,8],paddingBottomRight:[8,mode==='national'?26:12],animate:false,maxZoom:detailed?14:9};
 let adjusting=false,userAdjusted=false;
 const fitScope=()=>{adjusting=true;map.invalidateSize({pan:false});map.fitBounds(bounds,fitOptions);adjusting=false;userAdjusted=false};
 fitScope();
 map.on('dragstart zoomstart',()=>{if(!adjusting)userAdjusted=true});
 // Refit an untouched map after layout changes; preserve deliberate pan/zoom.
 if(typeof ResizeObserver!=='undefined'){
  let pending=0;
  const observer=new ResizeObserver(()=>{cancelAnimationFrame(pending);pending=requestAnimationFrame(()=>{if(!mapInstances.has(id))return;if(userAdjusted)map.invalidateSize({pan:false});else fitScope()})});
  observer.observe(host);map.on('unload',()=>{observer.disconnect();cancelAnimationFrame(pending)});
 }

 const source=features||(only?prefectureFeatures.filter(f=>only.includes(f.properties.id)):prefectureFeatures);
 const borders=L.geoJSON(source,{style:f=>mapStyle(f,detailed),interactive:!detailed,onEachFeature:(f,layer)=>{if(detailed)return;if(state.view==='explore'&&f.properties.name===state.pref){layer.options.interactive=false;layer.setStyle({fillOpacity:0,weight:0});return}layer.on('click',()=>{if(mode==='national'&&isMobile()){selectRegion(regionFor(f.properties.name))}else go(f.properties.name)});layer.bindTooltip(f.properties.name,{sticky:true});layer.on('mouseover',()=>{layer.bringToFront();layer.setStyle({weight:2.5,color:'#1f60ba',lineJoin:'round',lineCap:'round'})});layer.on('mouseout',()=>layer.setStyle(mapStyle(f,detailed)))}}).addTo(map);
 if(!detailed)map.attributionControl.addAttribution('<a href="https://github.com/dataofjapan/land" target="_blank" rel="noopener">지구지도 일본 · dataofjapan</a>');
 L.control.zoom({position:'bottomleft',zoomInTitle:'지도 확대',zoomOutTitle:'지도 축소'}).addTo(map);
 const reset=L.control({position:'topright'});reset.onAdd=()=>{const div=L.DomUtil.create('div','mapReset');const b=button('전체 보기',fitScope);div.append(b);L.DomEvent.disableClickPropagation(div);return div};reset.addTo(map);
 const north=L.control({position:'topleft'});north.onAdd=()=>{const d=L.DomUtil.create('div','north');d.textContent='↑ N';return d};north.addTo(map);
 if(mode==='national'&&!nationalRegion){const labels=L.layerGroup().addTo(map);const redraw=()=>drawRegionLabels(map,labels);map.on('moveend',redraw);redraw()}
 else if(!detailed){const labels=L.layerGroup().addTo(map);const redraw=()=>{labels.clearLayers();const view=map.getBounds();for(const f of source){if(state.view==='explore'&&f.properties.name===state.pref)continue;const anchor=labelAnchor(f,view);if(!anchor)continue;L.marker(anchor,{icon:L.divIcon({className:'prefMapLabel'+(f.properties.name===state.pref?' picked':''),html:`<span>${f.properties.name}</span>`,iconSize:[80,34],iconAnchor:[40,17]}),keyboard:true,title:f.properties.name}).addTo(labels).on('click',()=>go(f.properties.name))}};map.on('moveend',()=>{redraw();if(typeof localize==='function')localize()});redraw()}
 map.on('dragstart',()=>host.classList.add('dragging'));map.on('dragend',()=>host.classList.remove('dragging'));
 return map;
}
// Nationwide labels keep one deterministic offset from each geographic center.
// No collision solver is used: resizing cannot send a label to a different side of Japan.
function regionLabelWidth(name){return Math.min(86,Math.max(58,38+[...name].length*10))}
function drawRegionLabels(map,layer){
 layer.clearLayers();
 const size=map.getSize();
 const spacingScale=Math.max(.76,Math.min(1,size.x/760,size.y/500));
 for(const [name,center] of Object.entries(regionCenters)){
  const origin=map.latLngToContainerPoint(center);
  const [baseDx,baseDy]=regionLabelOffsets[name]||[0,0];
  const dx=baseDx*spacingScale,dy=baseDy*spacingScale;
  const w=regionLabelWidth(name),h=30;
  const x=Math.max(5+w/2,Math.min(size.x-5-w/2,origin.x+dx));
  const y=Math.max(5+h/2,Math.min(size.y-24-h/2,origin.y+dy));
  const anchor=map.containerPointToLatLng([x,y]);
  if(Math.hypot(dx,dy)>18*spacingScale)L.polyline([center,anchor],{color:'#8ba3b7',weight:1,opacity:.62,interactive:false}).addTo(layer);
  L.marker(anchor,{icon:L.divIcon({className:'regionMapLabel',html:`<span>${name}</span>`,iconSize:[w,h],iconAnchor:[w/2,h/2]}),keyboard:true,title:name}).addTo(layer).on('click',()=>selectRegion(name));
 }
 if(typeof localize==='function')localize();
}
function insidePolygon(x,y,ring){let on=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])on=!on}return on}
function labelAnchor(f,view){let best=null;for(const [ring]of f.geometry.coordinates){const xs=ring.map(p=>p[0]),ys=ring.map(p=>p[1]),l=Math.max(Math.min(...xs),view.getWest()),r=Math.min(Math.max(...xs),view.getEast()),b=Math.max(Math.min(...ys),view.getSouth()),t=Math.min(Math.max(...ys),view.getNorth());if(l>=r||b>=t)continue;const area=(r-l)*(t-b);if(best&&area<best.area)continue;for(let j=0;j<7;j++)for(let i=0;i<7;i++){const x=l+(r-l)*(i+.5)/7,y=b+(t-b)*(j+.5)/7;if(!insidePolygon(x,y,ring))continue;const score=Math.hypot((x-(l+r)/2)/(r-l),(y-(b+t)/2)/(t-b));if(!best||area>best.area||area===best.area&&score<best.score)best={area,score,lat:y,lon:x}}}return best?[best.lat,best.lon]:null}
function selectRegion(name){if(name==='오키나와'){go('오키나와');return}nationalRegion=name;state.view='home';close();render()}
// A cartographic cutaway on the same sea surface; source coordinates stay intact.
function drawOkinawaCutaway(map){
 const original=prefectureFeatures.find(f=>f.properties.id===47);
 const display={...original,geometry:{type:'MultiPolygon',coordinates:original.geometry.coordinates.map(poly=>poly.map(ring=>ring.map(([x,y])=>[129+(x-122.8)*.78,40.0+(y-24)*.78])))}};
 L.geoJSON(display,{style:{color:'#ab5d26',weight:1.2,fillColor:pastelRegions['오키나와'],fillOpacity:1},onEachFeature:(f,layer)=>layer.on('click',()=>go('오키나와'))}).addTo(map);
 L.polyline([[42.9,136.2],[40.7,136.2],[38.55,134.0],[38.55,128.7]],{className:'islandSeparator',color:'#8aacc2',weight:1.4,opacity:.85,interactive:false}).addTo(map);
 L.marker([43.1,132.0],{icon:L.divIcon({className:'regionMapLabel okinawaCutawayLabel',html:'<span>오키나와</span>',iconSize:[86,30],iconAnchor:[43,15]}),keyboard:true,title:'오키나와'}).addTo(map).on('click',()=>go('오키나와'));
}
function renderMaps(force=false){const key=[state.view,state.pref,state.area,state.town,nationalRegion,placeTheme,contentTab].join('|');if(key===mapKey&&!force){syncMapSelection();return}mapKey=key;markerInstances.clear();
 if(state.view==='home'){
  const selectedRegion=regions.find(r=>r[0]===nationalRegion),prefs=selectedRegion?selectedRegion[1].split(' '):[];
  const mainFeatures=prefectureFeatures.filter(f=>f.properties.id!==47).map(f=>({...f,geometry:{...f.geometry,coordinates:f.geometry.coordinates.filter(r=>r[0].some(p=>p[1]>=(f.properties.id===13?35:30.8)))}})).filter(f=>f.geometry.coordinates.length);
  const regionFeatures=selectedRegion?mainFeatures.filter(f=>prefs.includes(f.properties.name)):mainFeatures;
  const bounds=L.geoJSON(regionFeatures).getBounds();
  const nationalMap=createMap('nationalMap',bounds,{mode:nationalRegion?'region':'national',features:regionFeatures});
  if(!selectedRegion)drawOkinawaCutaway(nationalMap);
  $('#nationalMap').classList.toggle('cutoutMap',!!selectedRegion);
  $('#nationalScope').textContent=nationalRegion?nationalRegion+' 한눈에 보기':'일본 전국';
  $('#nationalRegions').replaceChildren(button('전국',()=>{nationalRegion='';home()},!nationalRegion?'active':''),...regions.map(r=>button(r[0],()=>selectRegion(r[0]),nationalRegion===r[0]?'active':'')));
  $('#nationalPrefButtons').replaceChildren(...prefs.map(p=>button(p,()=>go(p))));$('#nationalPrefButtons').hidden=!prefs.length;


 }else if(state.view==='explore'&&contentTab==='places'){
  const detailed=state.area!=='전체';const pts=samples.filter(p=>p.pref===state.pref&&placeInScope(p)&&(state.town==='전체'||p.town===state.town)&&placeMatches(p));
  let bounds=geographicBounds([state.pref]);
  if(detailed){const locs=pts.map(p=>pointLocations[p.id]).filter(Boolean);const box=areaBoxes[state.pref+'|'+state.area];const municipality=selectedMunicipality();if(municipality)bounds=L.latLngBounds(municipality.bounds);else if(box)bounds=L.latLngBounds(box);else if(locs.length)bounds=L.latLngBounds(locs.map(p=>[p.lat,p.lon])).pad(.4)}
  if(detailed){renderGoogleDetail(pts,bounds);return}
  for(const id of ['googleMapPlaces','googleMapExternal']){const el=$('#'+id);if(el)el.hidden=true}
  const map=createMap('regionalMap',bounds,{detailed,only:state.pref==='오키나와'?[47]:null});$('#regionalMap').classList.toggle('cutoutMap',!detailed);
  if(detailed){pts.forEach((p,i)=>{const loc=pointLocations[p.id];if(!loc)return;const marker=L.marker([loc.lat,loc.lon],{icon:L.divIcon({className:'placeMarker',html:`<span data-place="${p.id}"><b>${i+1}</b></span>`,iconSize:[40,40],iconAnchor:[20,20]}),title:p.name,keyboard:true}).addTo(map).bindTooltip(p.name,{direction:'top'}).on('click',()=>openDetail(p));markerInstances.set(p.id,marker)})}
  $('#mapTitle').textContent=state.pref+(state.area==='전체'?' · 시구정촌 경계':' · '+state.area);
  $('#mapNote').textContent=detailed?'한 손가락으로 이동 · 두 손가락으로 확대 · 핀을 누르면 장소 설명':'실제 경계의 지역 조각지도 · 권역을 선택하면 도로 지도';
  $('#tokyoIslands').hidden=state.pref!=='도쿄'||detailed;
  attachMunicipalities(map,state.pref);
  syncMapSelection();
 }
}
function syncMapSelection(){syncGoogleDetail();document.querySelectorAll('.placeMarker span').forEach(el=>el.classList.toggle('chosen',Number(el.dataset.place)===selected?.id))}
window.addEventListener('resize',()=>{for(const map of mapInstances.values())map.invalidateSize({pan:false})});

// Basic Google Maps iframe: no Maps JavaScript API or billable service is loaded.
let googleDetailContext=null;
function googleMapLanguage(){return localStorage.getItem('japlan-language')==='ja'?'ja':'ko'}
// Use one destination resolver for desktop, mobile and external links.
function googlePlaceMapURL(place,embed=true){
 const params=new URLSearchParams({hl:googleMapLanguage(),gl:'kr'});
 if(embed)params.set('output','embed');
 let cid='',urlQuery='';
 try{const u=new URL(place.mapUrl||'',location.href);cid=u.searchParams.get('cid')||'';urlQuery=u.searchParams.get('query')||u.searchParams.get('q')||''}catch{}
 const loc=pointLocations[place.id];
 if(place.mapMode==='coordinates'&&Number.isFinite(loc?.lat)&&Number.isFinite(loc?.lon)&&Math.abs(loc.lat)<=90&&Math.abs(loc.lon)<=180)params.set('q',`${loc.lat},${loc.lon}`);
 else if(place.mapQuery?.trim())params.set('q',place.mapQuery.trim());
 else if(/^\d+$/.test(cid))params.set('cid',cid);
 else if(urlQuery)params.set('q',urlQuery);
 else params.set('q',typeof translateText==='function'?translateText(place.pref+' '+place.name,true):place.pref+' '+place.name);
 params.set('z','16');
 return 'https://www.google.com/maps?'+params.toString();
}
function googleDetailURL(place,embed=true){
 if(place)return googlePlaceMapURL(place,embed);
 const ctx=googleDetailContext;if(!ctx)return '';
 const params=new URLSearchParams({hl:googleMapLanguage(),gl:'kr',q:`${ctx.center.lat},${ctx.center.lng}`,z:String(ctx.zoom)});
 if(embed)params.set('output','embed');
 return 'https://www.google.com/maps?'+params.toString();
}

function renderGoogleDetail(pts,bounds){
 disposeMap('regionalMap');const host=$('#regionalMap');host.replaceChildren();host.classList.remove('boundary-view','cutoutMap');host.classList.add('detail-view','googleDetail');
 const center=bounds.getCenter();const span=Math.max(bounds.getNorth()-bounds.getSouth(),(bounds.getEast()-bounds.getWest())*.8);
 googleDetailContext={pts,center,zoom:Math.max(5,Math.min(14,Math.floor(Math.log2(280/Math.max(span,.02))))),scope:[state.pref,state.area,state.town].join('|')};
 const frame=document.createElement('iframe');frame.id='googleDetailFrame';frame.title='Google Maps';frame.setAttribute('allowfullscreen','');frame.setAttribute('referrerpolicy','no-referrer-when-downgrade');host.append(frame);
 let controls=$('#googleMapPlaces');if(!controls){controls=document.createElement('div');controls.id='googleMapPlaces';controls.className='chiprow googleMapPlaces';host.after(controls)}
 controls.replaceChildren(button('권역 전체',()=>{selected=null;syncGoogleDetail()}),...pts.filter(p=>pointLocations[p.id]||p.mapUrl||p.mapQuery).map(p=>{const b=button(p.name,()=>openDetail(p));b.dataset.googlePlace=p.id;return b}));controls.hidden=false;
 let link=$('#googleMapExternal');if(!link){link=document.createElement('a');link.id='googleMapExternal';link.target='_blank';link.rel='noopener';link.className='googleMapExternal';controls.after(link)}link.hidden=false;link.textContent='Google Maps에서 크게 보기 ↗';
 $('#mapTitle').textContent=state.pref+' · '+state.area;
 $('#mapNote').textContent='장소 버튼을 누르면 해당 위치를 보여줍니다. 지도 안에서 확대·축소할 수 있습니다.';
 $('#tokyoIslands').hidden=true;syncGoogleDetail();
}
function syncGoogleDetail(){
 const active=state.view==='explore'&&contentTab==='places'&&state.area!=='전체';
 for(const id of ['googleMapPlaces','googleMapExternal']){const el=$('#'+id);if(el)el.hidden=!active}
 const frame=$('#googleDetailFrame');if(!active||!frame||!googleDetailContext)return;
 if(googleDetailContext.scope!==[state.pref,state.area,state.town].join('|'))return;
 const place=googleDetailContext.pts.find(p=>p.id===selected?.id&&(pointLocations[p.id]||p.mapUrl||p.mapQuery));
 const displayed=place||(!googleDetailContext.pts.some(p=>pointLocations[p.id])?googleDetailContext.pts.find(p=>p.mapUrl):null);const url=googleDetailURL(displayed);if(frame.getAttribute('src')!==url)frame.setAttribute('src',url);
 $('#googleMapExternal').href=googleDetailURL(displayed,false);
 document.querySelectorAll('#googleMapPlaces button').forEach((b,i)=>{const active=place?Number(b.dataset.googlePlace)===place.id:i===0;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
}
