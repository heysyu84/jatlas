'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist'),prefix='globalThis.JATLAS_PHOTO_REGISTRY_DATA=';
const raw=fs.readFileSync(path.join(dist,'photo-registry-data.js'),'utf8').trim();
if(!raw.startsWith(prefix))throw Error('Bad photo registry format');
const registry=JSON.parse(raw.slice(prefix.length).replace(/;\s*$/,''));
const prefs=new Set(['후쿠오카','사가','나가사키','구마모토','오이타','미야자키','가고시마']);
const places=Object.values(registry.places||{}).filter(r=>prefs.has(r.pref));
const foods=Object.values(registry.foods||{}).filter(r=>prefs.has(r.pref));
if(places.length!==184)throw Error('Kyushu place count mismatch: '+places.length);
if(foods.length!==60)throw Error('Kyushu food count mismatch: '+foods.length);
for(const r of [...places,...foods]){
 const file=path.join(dist,r.image);if(!fs.existsSync(file))throw Error('Missing canonical '+r.canonicalId+' '+r.image);
 const sha=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');if(sha!==r.sha256)throw Error('Canonical hash mismatch '+r.canonicalId);
 if(!/^(40|41|42|43|44|45|46)-[PF][0-9]{4}$/.test(r.canonicalId))throw Error('Bad Kyushu canonical ID '+r.canonicalId);
 if(!path.basename(r.image,'.webp').startsWith(r.canonicalId+'-'))throw Error('Bad canonical filename '+r.image);
 if(!/^\d{2}-[PF]\d{4}-[a-z0-9]+(?:-[a-z0-9]+)*\.webp$/.test(path.basename(r.image)))throw Error('Non-ASCII or malformed canonical filename '+r.image);
 const sig=fs.readFileSync(file).subarray(0,12);if(sig.subarray(0,4).toString()!=='RIFF'||sig.subarray(8,12).toString()!=='WEBP')throw Error('Not WebP '+r.image);
}
const tmp=path.join(require('node:os').tmpdir(),'jatlas-kyushu-canonical-'+process.pid+'.json');process.argv[2]=tmp;
const {result}=require('./audit-content.cjs');try{fs.unlinkSync(tmp)}catch{}
const clean=s=>String(s||'').replace(/^\.\//,'').split(/[?#]/)[0],byLegacy=new Map(places.map(r=>[Number(r.legacyId),r]));
const runtime=result.places.filter(p=>prefs.has(p.pref));
if(runtime.length!==184)throw Error('Runtime Kyushu count mismatch: '+runtime.length);
for(const p of runtime){const r=byLegacy.get(Number(p.id));if(!r)throw Error('Missing registry '+p.id);if(clean(p.photo?.src)!==r.image)throw Error('Noncanonical runtime place '+p.id+' '+clean(p.photo?.src));}
for(const pref of result.prefectures.filter(x=>prefs.has(x.pref))){
 for(const f of pref.foods){const r=foods.find(x=>x.pref===pref.pref&&x.name===f.name);if(!r)throw Error('Missing food registry '+pref.pref+' '+f.name);if(clean(f.photo?.src)!==r.image)throw Error('Noncanonical runtime food '+pref.pref+' '+f.name);}
}
console.log(JSON.stringify({ok:true,places:places.length,foods:foods.length,canonicalFiles:places.length+foods.length},null,2));
