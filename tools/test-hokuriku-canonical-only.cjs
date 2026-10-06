'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist');
const text=fs.readFileSync(path.join(dist,'photo-registry-data.js'),'utf8').trim(),prefix='globalThis.JATLAS_PHOTO_REGISTRY_DATA=';
if(!text.startsWith(prefix))throw Error('Bad photo registry format');
const registry=JSON.parse(text.slice(prefix.length).replace(/;\s*$/,''));
const prefs=new Set(['도야마','이시카와','후쿠이']);
const places=Object.values(registry.places||{}).filter(r=>prefs.has(r.pref));
const foods=Object.values(registry.foods||{}).filter(r=>prefs.has(r.pref));
if(places.length!==71)throw Error('Hokuriku place count mismatch: '+places.length);
if(foods.length!==24)throw Error('Hokuriku food count mismatch: '+foods.length);
for(const r of [...places,...foods]){
 const file=path.join(dist,r.image);if(!fs.existsSync(file))throw Error('Missing canonical '+r.canonicalId+' '+r.image);
 const sha=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');if(sha!==r.sha256)throw Error('Canonical hash mismatch '+r.canonicalId);
 if(!/^(16|17|18)-[PF]\d{4}$/.test(r.canonicalId))throw Error('Bad Hokuriku canonical ID '+r.canonicalId);
 const base=path.basename(r.image,'.webp');
 if(!base.startsWith(r.canonicalId+'-'))throw Error('Canonical filename missing ID/name '+r.image);
 const sig=fs.readFileSync(file).subarray(0,12).toString('hex');if(!sig.startsWith('52494646')||!sig.endsWith('57454250'))throw Error('Not WebP '+r.image);
}
const legacy=[...new Set([...places,...foods].map(r=>r.legacyImage).filter(Boolean))];
let deleted=0;
for(const src of legacy){if(src.startsWith('http')||src.startsWith('images/regions/hokuriku/'))continue;const f=path.join(dist,src);if(fs.existsSync(f)){fs.rmSync(f,{force:true});deleted++;}}
const tmp=path.join(require('node:os').tmpdir(),'jatlas-hokuriku-canonical-'+process.pid+'.json');process.argv[2]=tmp;
const {result}=require('./audit-content.cjs');try{fs.unlinkSync(tmp)}catch{}
const clean=s=>String(s||'').replace(/^\.\//,'').split(/[?#]/)[0],byLegacy=new Map(places.map(r=>[Number(r.legacyId),r]));
const runtime=result.places.filter(p=>prefs.has(p.pref));
if(runtime.length!==71)throw Error('Runtime Hokuriku count mismatch: '+runtime.length);
for(const p of runtime){const r=byLegacy.get(Number(p.id));if(!r)throw Error('Missing registry place '+p.id);if(clean(p.photo?.src)!==r.image)throw Error('Noncanonical runtime photo '+p.id+' '+clean(p.photo?.src));}
console.log(JSON.stringify({ok:true,places:places.length,foods:foods.length,canonicalFiles:places.length+foods.length,legacyFilesRemovedInSandbox:deleted},null,2));
