'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist');
const registryText=fs.readFileSync(path.join(dist,'photo-registry-data.js'),'utf8').trim();
const prefix='globalThis.JATLAS_PHOTO_REGISTRY_DATA=';
if(!registryText.startsWith(prefix))throw Error('Bad photo registry format');
const registry=JSON.parse(registryText.slice(prefix.length).replace(/;\s*$/,''));
const prefs=new Set(['기후','시즈오카','아이치','미에']);
const places=Object.values(registry.places||{}).filter(r=>prefs.has(r.pref));
const foods=Object.values(registry.foods||{}).filter(r=>prefs.has(r.pref));
if(places.length!==83)throw Error('Tokai place count mismatch: '+places.length);
if(foods.length!==26)throw Error('Tokai food count mismatch: '+foods.length);
const records=[...places,...foods],legacy=[...new Set(records.map(r=>r.legacyImage).filter(Boolean))];
for(const r of records){
  const file=path.join(dist,r.image);
  if(!fs.existsSync(file))throw Error('Missing canonical file '+r.canonicalId+' '+r.image);
  const sha=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  if(sha!==r.sha256)throw Error('Canonical hash mismatch '+r.canonicalId);
}
let deleted=0;
for(const src of legacy){
  if(src.startsWith('images/regions/tokai/'))continue;
  const file=path.join(dist,src);
  if(fs.existsSync(file)){fs.rmSync(file,{force:true});deleted++;}
}
const tmp=path.join(require('node:os').tmpdir(),'jatlas-tokai-canonical-'+process.pid+'.json');
process.argv[2]=tmp;
const {ctx,result}=require('./audit-content.cjs');
try{fs.unlinkSync(tmp)}catch{}
const clean=s=>String(s||'').replace(/^\.\//,'').split(/[?#]/)[0];
const byLegacy=new Map(places.map(r=>[Number(r.legacyId),r]));
const canonicalMap=vm.runInContext('globalThis.JATLAS_MAP_CANONICAL||{}',ctx);
const tokaiPlaces=result.places.filter(p=>prefs.has(p.pref));
if(tokaiPlaces.length!==83)throw Error('Runtime Tokai place count mismatch: '+tokaiPlaces.length);
let mapChecks=0;
for(const p of tokaiPlaces){
  const r=byLegacy.get(Number(p.id)); if(!r)throw Error('Missing registry place '+p.id+' '+p.name);
  if(clean(p.photo?.src)!==r.image)throw Error('Legacy/noncanonical runtime place photo '+p.id+' '+p.name+' :: '+clean(p.photo?.src));
  if(!fs.existsSync(path.join(dist,r.image)))throw Error('Runtime canonical place file missing '+r.image);
  const embed=new URL(p.mapEmbed),external=new URL(p.mapExternal),c=canonicalMap[p.id];
  if(!c)throw Error('Missing Tokai canonical map target '+p.id);
  if(embed.searchParams.get('q')!==`${c.lat},${c.lon}`)throw Error('Tokai canonical map coordinate mismatch '+p.id);
  if(c.coordinateOnly){
    if(external.searchParams.get('q')!==`${c.lat},${c.lon}`)throw Error('Tokai external coordinate mismatch '+p.id);
  }else if(c.placeId){
    if(external.searchParams.get('query_place_id')!==c.placeId)throw Error('Tokai external place id mismatch '+p.id);
  }else if(c.cid){
    if(external.searchParams.get('cid')!==String(c.cid))throw Error('Tokai external cid mismatch '+p.id);
  }else throw Error('Tokai canonical external strategy missing '+p.id);
  if(embed.searchParams.get('output')!=='embed'||external.searchParams.has('output'))throw Error('Tokai map mode mismatch '+p.id);
  mapChecks++;
}
let runtimeFoods=0;
const foodByKey=new Map(foods.map(r=>[r.pref+'|'+r.name,r]));
for(const prefRow of result.prefectures.filter(x=>prefs.has(x.pref))){
  for(const f of prefRow.foods){
    runtimeFoods++;
    const r=foodByKey.get(prefRow.pref+'|'+f.name); if(!r)throw Error('Missing registry food '+prefRow.pref+' '+f.name);
    const actual=clean(f.photo?.src||f.image);
    if(actual!==r.image)throw Error('Legacy/noncanonical runtime food photo '+prefRow.pref+' '+f.name+' :: '+actual);
    if(!fs.existsSync(path.join(dist,r.image)))throw Error('Runtime canonical food file missing '+r.image);
  }
}
if(runtimeFoods!==26)throw Error('Runtime Tokai food count mismatch: '+runtimeFoods);
const areaChecks=[],townChecks=[];
const heroFor=(pref,area,town)=>vm.runInContext(`state={view:'explore',pref:${JSON.stringify(pref)},area:${JSON.stringify(area)},town:${JSON.stringify(town)}};globalThis.JATLAS_TOKAI_CANONICAL.heroCache.clear();(()=>{const p=currentScopeHeroPlace();return p?{id:p.id,pref:p.pref,area:p.area,town:p.town,src:photoForPlace(p)?.src||''}:null})()`,ctx);
for(const pref of prefs){
  const ps=tokaiPlaces.filter(p=>p.pref===pref);
  for(const area of new Set(ps.map(p=>p.area))){
    const h=heroFor(pref,area,'전체');
    if(!h)throw Error('Missing hero candidate '+pref+' / '+area);
    if(h.pref!==pref||h.area!==area)throw Error('Hero scope leak '+pref+' / '+area+' -> '+h.pref+' / '+h.area);
    const r=byLegacy.get(Number(h.id)); if(!r||clean(h.src)!==r.image)throw Error('Hero registry mismatch '+h.id);
    areaChecks.push(pref+'|'+area);
    for(const town of new Set(ps.filter(p=>p.area===area).map(p=>p.town))){
      const t=heroFor(pref,area,town);
      if(!t)throw Error('Missing town hero candidate '+pref+' / '+area+' / '+town);
      if(t.pref!==pref||t.area!==area||t.town!==town)throw Error('Town hero scope leak '+pref+' / '+area+' / '+town+' -> '+t.pref+' / '+t.area+' / '+t.town);
      const tr=byLegacy.get(Number(t.id)); if(!tr||clean(t.src)!==tr.image)throw Error('Town hero registry mismatch '+t.id);
      townChecks.push(pref+'|'+area+'|'+town);
    }
  }
}
const html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script[^>]+src="([^"?]+)(?:\?[^"]*)?"/g)].map(m=>m[1]);
const registryIndex=scripts.indexOf('photo-registry.js');
const renderBefore=[];
for(let i=0;i<registryIndex;i++){
  const file=scripts[i]; if(file.startsWith('vendor/')||!fs.existsSync(path.join(dist,file)))continue;
  const src=fs.readFileSync(path.join(dist,file),'utf8');
  if(/(^|\n)\s*render\(\);?\s*(?:$|\n)/m.test(src))renderBefore.push(file);
}
if(renderBefore.length)throw Error('Pre-registry top-level render calls may request legacy images: '+renderBefore.join(', '));
console.log(JSON.stringify({ok:true,places:tokaiPlaces.length,foods:runtimeFoods,canonicalFiles:records.length,legacyFilesRemovedInSandbox:deleted,mapChecks,areaHeroScopesChecked:areaChecks.length,townHeroScopesChecked:townChecks.length,preRegistryRenderCalls:renderBefore},null,2));
