'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist');
const text=fs.readFileSync(path.join(dist,'photo-registry-data.js'),'utf8').trim(),prefix='globalThis.JATLAS_PHOTO_REGISTRY_DATA=';
if(!text.startsWith(prefix))throw Error('Bad photo registry format');
const registry=JSON.parse(text.slice(prefix.length).replace(/;\s*$/,''));
const prefs=new Set(['니가타','야마나시','나가노']);
const places=Object.values(registry.places||{}).filter(r=>prefs.has(r.pref));
const foods=Object.values(registry.foods||{}).filter(r=>prefs.has(r.pref));
if(places.length!==79)throw Error('Koshinetsu place count mismatch: '+places.length);
if(foods.length!==24)throw Error('Koshinetsu food count mismatch: '+foods.length);
for(const r of [...places,...foods]){
 const file=path.join(dist,r.image);if(!fs.existsSync(file))throw Error('Missing canonical '+r.canonicalId+' '+r.image);
 const sha=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
 if(sha!==r.sha256)throw Error('Canonical hash mismatch '+r.canonicalId);
 if(!/^(15|19|20)-[PF]\d{4}$/.test(r.canonicalId))throw Error('Bad Koshinetsu canonical ID '+r.canonicalId);
 const base=path.basename(r.image);
 if(/(?:19|20)\d{4,6}|panoramio|place-\d|food-\d|selected|final|new|v2/i.test(base))throw Error('Source residue in canonical filename '+base);
 const sig=fs.readFileSync(file).subarray(0,12).toString('hex');
 if(!sig.startsWith('52494646')||!sig.endsWith('57454250'))throw Error('Canonical file is not WebP '+r.image);
}
const legacy=[...new Set([...places,...foods].map(r=>r.legacyImage).filter(Boolean))];
let deleted=0;
for(const src of legacy){
 if(src.startsWith('http://')||src.startsWith('https://')||src.startsWith('images/regions/koshinetsu/'))continue;
 const f=path.join(dist,src);if(fs.existsSync(f)){fs.rmSync(f,{force:true});deleted++;}
}
const tmp=path.join(require('node:os').tmpdir(),'jatlas-koshinetsu-canonical-'+process.pid+'.json');
process.argv[2]=tmp;const {ctx,result}=require('./audit-content.cjs');try{fs.unlinkSync(tmp)}catch{}
const clean=s=>String(s||'').replace(/^\.\//,'').split(/[?#]/)[0];
const byLegacy=new Map(places.map(r=>[Number(r.legacyId),r]));
const runtimePlaces=result.places.filter(p=>prefs.has(p.pref)&&byLegacy.has(Number(p.id)));
for(const p of runtimePlaces){
 const r=byLegacy.get(Number(p.id));if(clean(p.photo?.src)!==r.image)throw Error('Legacy/noncanonical place photo '+p.id+' '+p.name+' :: '+clean(p.photo?.src));
}
const missingRuntime=[...byLegacy.keys()].filter(id=>!runtimePlaces.some(p=>Number(p.id)===id));
if(missingRuntime.length)throw Error('Canonical place IDs missing from runtime: '+missingRuntime.join(','));
let runtimeFoods=0;const foodByKey=new Map(foods.map(r=>[r.pref+'|'+r.name,r]));
for(const row of result.prefectures.filter(x=>prefs.has(x.pref)))for(const f of row.foods){
 const r=foodByKey.get(row.pref+'|'+f.name);if(!r)continue;
 runtimeFoods++;if(clean(f.photo?.src||f.image)!==r.image)throw Error('Legacy/noncanonical food '+row.pref+' '+f.name);
}
if(runtimeFoods!==24)throw Error('Runtime Koshinetsu food count mismatch: '+runtimeFoods);
const heroFor=(pref,area,town)=>vm.runInContext(`state={view:'explore',pref:${JSON.stringify(pref)},area:${JSON.stringify(area)},town:${JSON.stringify(town)}};globalThis.JATLAS_TOKAI_CANONICAL.heroCache.clear();(()=>{const p=currentScopeHeroPlace();return p?{id:p.id,pref:p.pref,area:p.area,town:p.town,src:photoForPlace(p)?.src||''}:null})()`,ctx);
let areaChecks=0,townChecks=0;
for(const pref of prefs){
 const ps=runtimePlaces.filter(p=>p.pref===pref);
 for(const area of new Set(ps.map(p=>p.area))){
  const h=heroFor(pref,area,'전체');if(!h||h.pref!==pref||h.area!==area)throw Error('Hero scope leak '+pref+' / '+area);areaChecks++;
  for(const town of new Set(ps.filter(p=>p.area===area).map(p=>p.town))){
   const t=heroFor(pref,area,town);if(!t||t.pref!==pref||t.area!==area||t.town!==town)throw Error('Town hero scope leak '+pref+' / '+area+' / '+town);townChecks++;
  }
 }
}
console.log(JSON.stringify({ok:true,places:places.length,foods:foods.length,legacyFilesRemovedInSandbox:deleted,areaHeroScopesChecked:areaChecks,townHeroScopesChecked:townChecks},null,2));
