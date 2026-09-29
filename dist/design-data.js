const designPhotos={"도쿄": {"src": "images/skyline.webp", "alt": "도쿄 신주쿠 풍경"}, "신주쿠": {"src": "images/skyline.webp", "alt": "도쿄 신주쿠 풍경"}, "도쿄 타워": {"src": "images/tower.webp", "alt": "도쿄 타워 풍경"}, "도쿄타워·시바": {"src": "images/tower.webp", "alt": "도쿄 타워 풍경"}, "신주쿠교엔": {"src": "images/gyoen.webp", "alt": "신주쿠교엔의 정원"}, "센소지": {"src": "images/sensoji.webp", "alt": "센소지의 풍경"}, "아사쿠사·스미다": {"src": "images/sensoji.webp", "alt": "센소지의 풍경"}, "도쿄도청 전망실": {"src": "images/gov.webp", "alt": "도쿄도청의 풍경"}};
const areaIntros={
'도쿄':['TOKYO','전통과 현대가 만나는 도시입니다. 골목과 정원, 새로운 풍경을 천천히 만나보세요.'],
'신주쿠':['SHINJUKU','빌딩 사이의 정원과 탁 트인 전망을 함께 즐길 수 있는 도쿄의 중심 지역입니다.'],
'아사쿠사·스미다':['ASAKUSA · SUMIDA','오래된 거리와 강변 산책, 높은 전망을 함께 즐길 수 있는 지역입니다.'],
'우에노·야나카':['UENO · YANAKA','박물관과 공원, 오래된 골목을 천천히 둘러보기 좋은 지역입니다.'],
'시부야·하라주쿠':['SHIBUYA · HARAJUKU','활기찬 교차로와 고요한 숲길을 함께 만날 수 있는 지역입니다.'],
'고쿄·분쿄':['IMPERIAL PALACE · BUNKYO','물가와 정원을 따라 도심 속 여유를 즐길 수 있는 지역입니다.'],
'도쿄타워·시바':['TOKYO TOWER · SHIBA','도쿄의 상징을 가까이에서 보고 공원 산책과 전망을 함께 즐길 수 있는 지역입니다.'],
'오다이바':['ODAIBA','바다와 도시가 만나는 도쿄만의 풍경을 걸어서 즐길 수 있는 지역입니다.'],
'기치조지·고엔지':['KICHIJOJI · KOENJI','연못 산책과 동네 구경을 함께 즐기며 계절마다 다른 거리의 분위기를 만날 수 있는 지역입니다.'],
'다치카와':['TACHIKAWA','넓은 공원에서 계절의 꽃과 은행나무길을 즐길 수 있는 지역입니다.'],
'다카오':['TAKAO','도심을 벗어나 숲길과 산 위의 풍경을 즐길 수 있는 지역입니다.'],
'오쿠타마':['OKUTAMA','깊은 산과 호수를 중심으로 자연을 여유롭게 즐기기 좋은 지역입니다.'],
'이즈 제도':['IZU ISLANDS','바다를 건너 화산과 섬의 풍경을 만날 수 있는 여행 지역입니다.'],
'오가사와라':['OGASAWARA','긴 항해 끝에 만나는 섬 지역입니다. 교통과 숙박부터 먼저 계획해보세요.'],
'간다·아키하바라':['KANDA · AKIHABARA','도심에서 전통 신앙과 축제 문화를 함께 만날 수 있는 지역입니다.'],
'아카사카':['AKASAKA','도시 한가운데에서 신사의 전통을 만날 수 있는 지역입니다.'],
'에도가와':['EDOGAWA','강변 산책과 한여름의 불꽃놀이를 함께 즐길 수 있는 지역입니다.']};
const regionEnglish=['HOKKAIDO','TOHOKU','NORTH KANTO','GREATER TOKYO','KOSHINETSU','TOKAI','HOKURIKU','KINKI','SANIN · SANYO','SHIKOKU','KYUSHU','OKINAWA'];
function photoForPlace(p){return tokyoPhotos[p.id]||designPhotos[p.name]||null}
function photoForArea(a){return designPhotos[a]||tokyoPhotos[tokyoPlaces.find(p=>p.area===a)?.id]||null}
function showTheme(pref,theme){if(theme==='벚꽃'){eventMonth=3;contentTab='events';go(pref)}else{contentTab='places';go(pref);placeTheme=theme;render()}}
function placeMatches(p){if(placeTheme==='전체')return true;const patterns={'산책':/공원|정원|산책|옛|거리|숲/,'역사':/사찰|신사|역사/,'전망':/전망|랜드마크/,'자연':/자연|등산|화산|섬|호수/,'전시·체험':/박물관|미술관|과학|전시|테마파크/,'쇼핑':/쇼핑|먹거리/};return (patterns[placeTheme]||/.*/).test(p.tag)}
function renderDesign(){
 const area=state.area==='전체'?state.pref:state.area;
 document.body.dataset.view=state.view;
 $('#overviewTitle').textContent=nationalRegion||'일본';$('#overviewEnglish').textContent=nationalRegion?regionEnglish[regions.findIndex(r=>r[0]===nationalRegion)]:'DISCOVER JAPAN';
 $('#overviewSummary').textContent=nationalRegion?'도도부현을 선택하세요.':'지역을 선택하세요.';
 if(state.view==='explore'){
 $('#title').textContent=area;$('#placeEnglish').textContent=areaIntros[area]?.[0]||'';$('#summary').textContent=areaIntros[area]?.[1]||'지역과 가까운 장소를 함께 살펴보세요.';
 const pic=photoForArea(area);$('#areaHero').parentElement.hidden=!pic;if(pic){$('#areaHero').src=pic.src;$('#areaHero').alt=pic.alt;$('#heroCaption').textContent=pic.alt}
 $('#themeFilters').replaceChildren(...['전체','산책','역사','전망','자연','전시·체험','쇼핑'].map((t,i)=>button(['✧','♧','⛩','◉','△','▣','◇'][i]+' '+t,()=>{placeTheme=t;contentTab='places';close();render()},placeTheme===t?'active':'')));
 $('#themeFilters').hidden=!completePrefs.includes(state.pref)||contentTab!=='places';
 }
 if(typeof localize==='function')localize();
}

for(const p of tokyoPlaces){const photo=tokyoPhotos[p.id];if(!photo)continue;const row=document.createElement('p'),a=document.createElement('a');a.href=photo.source;a.target='_blank';a.rel='noopener';a.textContent='GO TOKYO · '+p.name;row.append(a);document.querySelector('#photoCreditList').append(row)}
