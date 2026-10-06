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
const tokaiPlaces=result.places.filter(p=>prefs.has(p.pref));
if(tokaiPlaces.length!==83)throw Error('Runtime Tokai place count mismatch: '+tokaiPlaces.length);
for(const p of tokaiPlaces){
  const r=byLegacy.get(Number(p.id)); if(!r)throw Error('Missing registry place '+p.id+' '+p.name);
  if(clean(p.photo?.src)!==r.image)throw Error('Legacy/noncanonical runtime place photo '+p.id+' '+p.name+' :: '+clean(p.photo?.src));
  if(!fs.existsSync(path.join(dist,r.image)))throw Error('Runtime canonical place file missing '+r.image);
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
const areaChecks=[];
for(const pref of prefs){
  const ps=tokaiPlaces.filter(p=>p.pref===pref);
  for(const area of new Set(ps.map(p=>p.area))){
    const code=`state={view:'explore',pref:${JSON.stringify(pref)},area:${JSON.stringify(area)},town:'전체'};globalThis.JATLAS_TOKAI_CANONICAL.heroCache.clear();currentScopeHeroPlace()`;
    const h=vm.runInContext(code,ctx);
    if(!h)continue;
    if(h.pref!==pref||h.area!==area)throw Error('Hero scope leak '+pref+' / '+area+' -> '+h.pref+' / '+h.area);
    const r=byLegacy.get(Number(h.id));
    if(!r||clean(h.photo?.src||'')&&clean(h.photo?.src)!==r.image)throw Error('Hero registry mismatch '+h.id);
    areaChecks.push(pref+'|'+area);
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
console.log(JSON.stringify({ok:true,places:tokaiPlaces.length,foods:runtimeFoods,canonicalFiles:records.length,legacyFilesRemovedInSandbox:deleted,areaHeroScopesChecked:areaChecks.length,preRegistryRenderCalls:renderBefore},null,2));
