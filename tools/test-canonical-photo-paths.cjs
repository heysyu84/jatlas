'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist'),prefix='globalThis.JATLAS_PHOTO_REGISTRY_DATA=';
const raw=fs.readFileSync(path.join(dist,'photo-registry-data.js'),'utf8').trim();
if(!raw.startsWith(prefix))throw Error('Bad registry format');
const reg=JSON.parse(raw.slice(prefix.length).replace(/;\s*$/,''));
let count=0;
for(const group of ['places','foods'])for(const r of Object.values(reg[group]||{})){
 count++;
 if(/[^\x00-\x7F]/.test(r.image))throw Error('Non-ASCII canonical path: '+r.image);
 if(!fs.existsSync(path.join(dist,r.image)))throw Error('Missing canonical file: '+r.image);
}
console.log(JSON.stringify({ok:true,records:count}));
