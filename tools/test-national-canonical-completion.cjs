'use strict';
// national-canonical-recheck-20261007-r2
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),os=require('node:os');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist');
const idmap=JSON.parse(fs.readFileSync(path.join(root,'audits/id-migration-map.json'),'utf8'));
const prefix='globalThis.JATLAS_PHOTO_REGISTRY_DATA=';
const raw=fs.readFileSync(path.join(dist,'photo-registry-data.js'),'utf8').trim();
if(!raw.startsWith(prefix))throw Error('Bad photo registry format');
const registry=JSON.parse(raw.slice(prefix.length).replace(/;\s*$/,''));
const placeRows=idmap.places||[],foodRows=idmap.foods||[];
if(placeRows.length!==1138)throw Error('National place ID count mismatch: '+placeRows.length);
if(foodRows.length!==346)throw Error('National food ID count mismatch: '+foodRows.length);
const regPlaces=registry.places||{},regFoods=registry.foods||{};
if(Object.keys(regPlaces).length!==1138)throw Error('Registry place count mismatch');
if(Object.keys(regFoods).length!==346)throw Error('Registry food count mismatch');

const ascii=/^[\x00-\x7F]+$/;
const filename=/^\d{2}-[PF]\d{4}-[a-z0-9]+(?:-[a-z0-9]+)*\.webp$/;
for(const row of placeRows){
  const r=regPlaces[row.newId]; if(!r)throw Error('Missing registry place '+row.newId+' '+row.name);
  if(r.pref!==row.pref||r.name!==row.name)throw Error('Place identity mismatch '+row.newId);
  if(!ascii.test(r.image)||!filename.test(path.basename(r.image)))throw Error('Bad canonical place filename '+r.image);
  if(!path.basename(r.image).startsWith(row.newId+'-'))throw Error('Place filename ID mismatch '+r.image);
  if(/^https?:/i.test(r.image)||/[?#]/.test(r.image))throw Error('Non-local canonical place image '+r.image);
  if(!fs.existsSync(path.join(dist,r.image)))throw Error('Missing canonical place file '+r.image);
}
for(const row of foodRows){
  const r=regFoods[row.newId]; if(!r)throw Error('Missing registry food '+row.newId+' '+row.name);
  if(r.pref!==row.pref||r.name!==row.name)throw Error('Food identity mismatch '+row.newId);
  if(!ascii.test(r.image)||!filename.test(path.basename(r.image)))throw Error('Bad canonical food filename '+r.image);
  if(!path.basename(r.image).startsWith(row.newId+'-'))throw Error('Food filename ID mismatch '+r.image);
  if(/^https?:/i.test(r.image)||/[?#]/.test(r.image))throw Error('Non-local canonical food image '+r.image);
  if(!fs.existsSync(path.join(dist,r.image)))throw Error('Missing canonical food file '+r.image);
}

const tmp=path.join(os.tmpdir(),'jatlas-national-canonical-'+process.pid+'.json');
process.argv[2]=tmp; const {result}=require('./audit-content.cjs'); try{fs.unlinkSync(tmp)}catch{}
if(result.places.length!==1138)throw Error('Runtime place count mismatch '+result.places.length);
const runtimeFoods=result.prefectures.reduce((a,p)=>a.concat((p.foods||[]).map(f=>({pref:p.pref,...f}))),[]);
if(runtimeFoods.length!==346)throw Error('Runtime food count mismatch '+runtimeFoods.length);
const clean=s=>String(s||'').replace(/^\.\//,'').split(/[?#]/)[0];
const byLegacy=new Map(placeRows.map(x=>[Number(x.legacyId),x.newId]));
for(const p of result.places){
  const cid=byLegacy.get(Number(p.id)); if(!cid)throw Error('Missing canonical ID mapping for runtime place '+p.id);
  const r=regPlaces[cid]; if(clean(p.photo?.src)!==r.image)throw Error('Runtime place not canonical '+p.id+' '+p.name+' '+clean(p.photo?.src));
}
const foodKey=new Map(foodRows.map(x=>[x.pref+'|'+x.name,x.newId]));
for(const f of runtimeFoods){
  const cid=foodKey.get(f.pref+'|'+f.name); if(!cid)throw Error('Missing canonical ID mapping for runtime food '+f.pref+' '+f.name);
  const r=regFoods[cid]; if(clean(f.photo?.src||f.image)!==r.image)throw Error('Runtime food not canonical '+f.pref+' '+f.name);
}

const mapCode=fs.readFileSync(path.join(dist,'map-canonical-data.js'),'utf8');
const ctx=vm.createContext({globalThis:{}}); vm.runInContext(mapCode,ctx);
const canonical=ctx.globalThis.JATLAS_MAP_CANONICAL||{};
if(Object.keys(canonical).length!==1138)throw Error('Canonical map count mismatch '+Object.keys(canonical).length);
for(const row of placeRows){
  const c=canonical[row.legacyId]; if(!c)throw Error('Missing canonical map '+row.legacyId+' '+row.name);
  if(!Number.isFinite(c.lat)||!Number.isFinite(c.lon))throw Error('Invalid canonical map coordinate '+row.legacyId);
  if(Object.prototype.hasOwnProperty.call(c,'note'))throw Error('Public QA note leaked into map '+row.legacyId);
}
const reviews={
 'tokai':'도카이','tohoku':'도호쿠','hokkaido':'홋카이도','north-kanto':'북간토',
 'koshinetsu':'고신에쓰','hokuriku':'호쿠리쿠','greater-tokyo':'수도권','kinki':'긴키',
 'sanin-sanyo':'산인·산요','shikoku':'시코쿠','kyushu':'규슈','okinawa':'오키나와'
};
for(const [slug,name] of Object.entries(reviews)){
  const p=path.join(root,'audits',slug+'-map-canonical-review.json');
  if(!fs.existsSync(p))throw Error('Missing map review '+name);
  const a=JSON.parse(fs.readFileSync(p,'utf8'));
  if(a.status!=='CANONICAL_MAP_TARGETS_COMPLETE')throw Error('Incomplete map review '+name);
  if((a.riskFlags||[]).length)throw Error('Unresolved map risks '+name+': '+JSON.stringify(a.riskFlags));
}
const scopes=new Set(registry.scope?.prefectures||[]);
if(scopes.size!==47)throw Error('Registry scope prefecture count mismatch '+scopes.size);
console.log(JSON.stringify({ok:true,prefectures:47,places:1138,foods:346,canonicalFiles:1484,canonicalMaps:1138,mapRiskFlags:0,regions:12},null,2));

// national-canonical-rerun-20261007-r2
