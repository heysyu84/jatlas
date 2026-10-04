/* Non-photo data and desktop/mobile DOM regression checks. Not pixel layout or live provider verification. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require(process.env.JATLAS_JSDOM||'jsdom');
const dist=path.resolve(__dirname,'../dist'),html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
let width=1280;const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(html,{url:'https://heysyu84.github.io/jatlas/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc}),w=dom.window,ctx=dom.getInternalVMContext();
w.matchMedia=()=>({get matches(){return width<=760},addEventListener(){},removeEventListener(){}});w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=function(){};
w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open')};w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','')};w.SVGSVGElement.prototype.createSVGRect=()=>({});w.structuredClone=structuredClone;
Object.defineProperty(w.HTMLElement.prototype,'clientWidth',{get(){return width}});Object.defineProperty(w.HTMLElement.prototype,'clientHeight',{get(){return 600}});
w.fetch=async()=>({ok:true,json:async()=>({current:{temperature_2m:21,weather_code:0},daily:{time:['2026-10-04'],temperature_2m_max:[24],temperature_2m_min:[18],weather_code:[0],precipitation_probability_max:[null]}})});
const run=s=>vm.runInContext(s,ctx);
for(const m of html.matchAll(/<script[^>]+src="([^"?]+)(?:\?[^"]*)?"/g))run(fs.readFileSync(path.join(dist,m[1]),'utf8'));
(async()=>{
const counts=run(`(()=>{const ps=samples.filter(p=>p.pref!=='후쿠시마');const data=regionalCatalog.filter(d=>d.pref!=='후쿠시마');const strings=ps.flatMap(p=>[p.name,p.description,p.activity,p.note,pointLocations[p.id]?.note,'공식 자료 확인: '+p.checked,...Object.values(tokyoVisitGuides[p.id]||{})]).concat(data.flatMap(d=>d.foods.flatMap(f=>[f.name,f.text,f.description,...Object.values(foodDetails[f.name]||{})])),data.flatMap(d=>d.events.flatMap(e=>Object.values(e))),data.flatMap(d=>Object.values(d.intros||{})),Object.values(routePlanning).flatMap(r=>[r.start,r.end,r.move,r.meal,r.rain,r.skip,r.warning,...(r.schedule||[]).map(s=>s[2])]),routeTemplates.filter(r=>r.pref!=='후쿠시마').flatMap(r=>[r.title,r.intro,r.note,...r.days.map(d=>d.label)]));return {places:ps.length,prefectures:allPrefs.filter(p=>p!=='후쿠시마').length,routes:routeTemplates.filter(r=>r.pref!=='후쿠시마').length,untranslated:strings.filter(s=>typeof s==='string'&&/[가-힣]/.test(translateText(s,true))).length,weakAccess:ps.filter(p=>/동선을 방문일 기준으로 확인|출발지 기준으로 교통편을 확인|지역별 교통수단을 이용|각 섬 항구에서 렌터카/.test(tokyoVisitGuides[p.id]?.access||'')).length,genericActivity:ps.filter(p=>p.activity==='현지 운영시간과 계절 교통을 확인한 뒤 주변 명소와 함께 둘러보세요.').length,missingText:ps.filter(p=>!p.description||!p.activity||!tokyoVisitGuides[p.id]?.access||!tokyoVisitGuides[p.id]?.duration).length,missingRoutePlaces:routeTemplates.flatMap(r=>r.days.flatMap(d=>(d.places||[]).filter(id=>!samples.some(p=>p.id===id)))).length}})()`);
assert.equal(counts.untranslated,0);assert.equal(counts.missingText,0);assert.equal(counts.weakAccess,0);assert.equal(counts.genericActivity,0);assert.equal(counts.missingRoutePlaces,0);
// Data translations are exhaustively checked above; avoid repeatedly translating the full page during navigation checks.
run('const qaLocalize=localize;localize=()=>{};');let navigation=0,details=0;
for(const viewport of [1280,390]){width=viewport;
 for(const pref of run("allPrefs.filter(p=>p!=='후쿠시마')")){
  run(`contentTab='places';go(${JSON.stringify(pref)})`);assert.ok(w.document.querySelectorAll('#cards .card').length,pref);navigation++;
  for(const tab of ['foods','events','routes'])run(`contentTab='${tab}';close();render()`);
  run(`openDetail(samples.find(p=>p.pref===${JSON.stringify(pref)}))`);details++;
  assert.ok(w.document.querySelector('#detailBody .visitFacts'));assert.ok(w.document.querySelector('#savePlace'));assert.ok(w.document.querySelector('#detailBody .addToPlan'));
  const link=w.document.querySelector('#detailBody .officialLinks a:last-child');assert.ok(new URL(link.href).searchParams.get('q'));
  if(viewport===390)assert.ok(w.document.querySelector('.mobileDetailMap iframe'));
  const weather=run('weatherPoint()');assert.ok(Number.isFinite(weather.lat)&&Number.isFinite(weather.lon),pref);
 }
 for(const expr of ['showRegions()','showEvents()','showRoutes()','showPlans()','home()'])run(expr);
 assert.equal(run('state.view'),'home');assert.equal(run('nationalRegion'),'');
}
run('localize=qaLocalize;openDetail(samples.find(p=>p.id===4902));setLanguage("ja")');assert.equal(w.document.documentElement.lang,'ja');assert.ok(!/[가-힣]/.test(w.document.querySelector('#detailBody').textContent));
run('setLanguage("ko")');assert.ok(w.document.querySelector('#detailBody').textContent.includes('도겐'));
run('newPlan(null,true);addPlaceToDay(activePlanId,0,4902);addPlaceToDay(activePlanId,0,4902)');assert.equal(run('activePlan().days[0].items.length'),1);
assert.ok(w.localStorage.getItem('japlan-plans-v1').includes('4902'));
assert.equal(run('weatherRound(null)'), '–');assert.equal(run('weatherRound(0)'), '0');assert.equal(run('weatherCondition(null)[0]'),'🌡️');
run('renderWeatherData(document.querySelector("#weatherPanel"),{current:{temperature_2m:null},daily:{time:["2026-10-04"],precipitation_probability_max:[null]}},{})');assert.ok(!w.document.querySelector('#weatherPanel').textContent.includes('0%'));
let requests=0;w.fetch=async()=>{requests++;return {ok:true,json:async()=>({current:{temperature_2m:22}})}};
await Promise.all([run('fetchWeather("qa-dedup",new URLSearchParams())'),run('fetchWeather("qa-dedup",new URLSearchParams())')]);assert.equal(requests,1);
assert.equal(errors.length,0,JSON.stringify(errors));
const report={...counts,navigation,details,languages:true,plans:true,weather:true,errors,method:'Full script DOM tests at 1280/390 branches; live desktop UI separately checked. No mobile pixel-layout or full historical fact verification.'};
if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));w.close();
})().catch(e=>{w.close();console.error(e);process.exitCode=1});
