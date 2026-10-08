'use strict';
const fs=require('node:fs'),path=require('node:path');

function auditCatalog(root){
  const dist=path.join(root,'dist');
  const catalog=JSON.parse(fs.readFileSync(path.join(dist,'data/catalog.json'),'utf8'));
  const html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  const bundles=[...html.matchAll(/<script[^>]+src="([^"?]+)(?:\?[^"]*)?"/g)].map(m=>m[1]);
  const bundleDirs=[...new Set(bundles.map(src=>path.dirname(path.join(dist,src))))];
  const readsCatalog=bundleDirs.some(dir=>fs.readdirSync(dir).filter(f=>f.endsWith('.js')).some(f=>fs.readFileSync(path.join(dir,f),'utf8').includes('data/catalog.json')));
  if(!bundles.length||!readsCatalog)throw Error('The deployed homepage is not connected to the catalog');
  for(const src of bundles){
    if(/^https?:|^\//.test(src)||!fs.existsSync(path.join(dist,src)))throw Error('Missing or non-local homepage script '+src);
  }
  for(const key of ['places','foods','events','routes','prefs','regions'])if(!Array.isArray(catalog[key]))throw Error('Missing catalog collection '+key);
  const ids=new Set(),legacy=new Set();
  for(const p of catalog.places){
    if(!/^\d{2}-P\d{4}$/.test(p.id)||ids.has(p.id))throw Error('Invalid or duplicate place ID '+p.id);
    if(!Number.isInteger(p.legacyId)||legacy.has(p.legacyId))throw Error('Invalid or duplicate legacy ID '+p.legacyId);
    ids.add(p.id);legacy.add(p.legacyId);
    if(!Number.isFinite(p.lat)||!Number.isFinite(p.lon))throw Error('Missing map coordinates '+p.id);
  }
  for(const f of catalog.foods){
    if(!/^\d{2}-F\d{4}$/.test(f.id)||ids.has(f.id))throw Error('Invalid or duplicate food ID '+f.id);
    ids.add(f.id);
  }
  const prefNames=new Set(catalog.prefs.map(p=>p.name));
  if(prefNames.size!==47||catalog.regions.length!==12)throw Error('Incomplete national coverage');
  for(const p of catalog.places)if(!prefNames.has(p.pref))throw Error('Unknown prefecture '+p.id);
  for(const route of catalog.routes)for(const day of route.days||[])for(const id of day.places||[])if(!legacy.has(id))throw Error('Broken route '+route.id+' -> '+id);
  return {
    places:catalog.places.map(p=>({...p,id:p.legacyId,canonicalId:p.id,coordinates:{lat:p.lat,lon:p.lon}})),
    prefectures:catalog.prefs.map(p=>({pref:p.name,places:catalog.places.filter(x=>x.pref===p.name).length,foods:catalog.foods.filter(x=>x.pref===p.name),events:catalog.events.filter(x=>x.pref===p.name),routes:catalog.routes.filter(x=>x.pref===p.name)})),
    heroes:catalog.heroes||{},
    safety:catalog.safety||{tombstones:[],duplicates:[],removedIds:[]}
  };
}
module.exports={auditCatalog};
