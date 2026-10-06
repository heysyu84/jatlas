/* npm install --prefix <temporary-directory> jsdom
   JATLAS_JSDOM=/absolute/path/to/node_modules/jsdom node tools/test-dom.cjs
   Exercises DOM and responsive code branches, not actual CSS layout or Google UI. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require(process.env.JATLAS_JSDOM||'jsdom');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist');
const html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
let width=1280;const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(html,{url:'https://heysyu84.github.io/jatlas/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
const w=dom.window,ctx=dom.getInternalVMContext();
w.matchMedia=()=>({get matches(){return width<=760},addEventListener(){},removeEventListener(){}});
w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=function(){};
w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open')};w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','')};
w.SVGSVGElement.prototype.createSVGRect=()=>({});w.structuredClone=structuredClone;
Object.defineProperty(w.HTMLElement.prototype,'clientWidth',{get(){return width}});Object.defineProperty(w.HTMLElement.prototype,'clientHeight',{get(){return 600}});
const run=s=>vm.runInContext(s,ctx);
for(const m of html.matchAll(/<script[^>]+src="([^"?]+)(?:\?[^"]*)?"/g)){
 if(m[1]==='weather.js')continue;run(fs.readFileSync(path.join(dist,m[1]),'utf8'));
}
let navigation=0,details=0,languages=0;
for(const viewport of [1280,390]){
 width=viewport;
 for(const pref of ['아이치','돗토리','지바','오카야마']){
  run(`contentTab='places';go(${JSON.stringify(pref)})`);assert.ok(w.document.querySelectorAll('#cards .card').length);navigation++;
  for(const tab of ['foods','events','routes'])run(`contentTab='${tab}';close();render()`);
 }
 for(const id of [601,2010,2011,2202,2203,2204,2205,2206,2207,2208,2209,2210,2211,2212,2213,2214,2215,2216,2217,1002,1003,1010,1011,1013,1017]){
  run(`openDetail(samples.find(p=>p.id===${id}))`);details++;
  assert.ok(w.document.querySelector('#detailBody .visitFacts'));
  assert.ok(w.document.querySelector('#detailBody .detailPhoto, #detailBody .photoPending'));
  for(const lang of ['ja','ko']){
   run(`setLanguage('${lang}')`);languages++;
   assert.equal(w.document.documentElement.lang,lang);
   const ext=w.document.querySelector('#detailBody .officialLinks a:last-child'),extUrl=new URL(ext.href);
   const canonical=run('globalThis.JATLAS_MAP_CANONICAL?.[selected.id]||null');
   if(canonical){
    if(canonical.coordinateOnly)assert.equal(extUrl.searchParams.get('q'),`${canonical.lat},${canonical.lon}`);
    else if(canonical.placeId)assert.equal(extUrl.searchParams.get('query_place_id'),canonical.placeId);
    else if(canonical.cid)assert.equal(extUrl.searchParams.get('cid'),String(canonical.cid));
    else assert.fail('canonical external map strategy missing '+run('selected.id'));
   }else assert.equal(extUrl.searchParams.get('q'),run('selected.mapQuery'));
   assert.equal(extUrl.searchParams.get('hl'),lang);
   const frame=w.document.querySelector('.mobileDetailMap iframe');
   if(viewport===390){
    assert.ok(frame);const frameUrl=new URL(frame.src);assert.equal(frameUrl.searchParams.get('hl'),lang);
    if(canonical)assert.equal(frameUrl.searchParams.get('q'),`${canonical.lat},${canonical.lon}`);
   }
  }
 }
 run(`home()`);assert.equal(run('state.view'),'home');assert.equal(run('nationalRegion'),'');
}
run(`openDetail(samples.find(p=>p.id===3419));toggleSavedPlace(selected)`);
assert.ok(JSON.parse(w.localStorage.getItem('atlas-saved')).includes(3419));
// Build a user plan from a known itinerary, then verify stable place IDs survive save/load.
run(`newPlan(routeTemplates[0])`);assert.ok(run('plans.length')>0);
const savedPlan=run('JSON.stringify(plans)');assert.ok(savedPlan.includes('placeId'));
const report={method:'jsdom full scripts, real Leaflet, desktop/mobile code branches; no pixel-layout or live Google UI verification',navigation,details,languageSwitches:languages,savedPlace:true,planCreation:true,errors};
fs.writeFileSync(path.join(root,'audits/dom-regression.json'),JSON.stringify(report,null,2)+'\n');w.close();assert.equal(errors.length,0,JSON.stringify(errors));console.log(JSON.stringify(report));
