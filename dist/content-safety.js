/* Runtime safety net.
   Keep this loaded after all data/photo override scripts. It protects every host,
   including mirrors that do not run GitHub Actions. */
(()=>{
  if(typeof samples==='undefined')return;
  const tombstoneIds=new Set([4722]);
  const norm=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[\s·・･\-–—_\/().（）【】「」『』［］\[\],，、:：'"]/g,'');
  const tombstoneNames=new Set(['도야마|'+norm('나메리카와 해변공원'),'도야마|'+norm('滑川海浜公園')]);

  const removeIds=new Set();
  for(const p of samples){
    if(tombstoneIds.has(Number(p.id))||tombstoneNames.has(String(p.pref||'')+'|'+norm(p.name)))removeIds.add(Number(p.id));
  }

  const canonicalByName=new Map();
  for(const p of samples){
    if(removeIds.has(Number(p.id)))continue;
    const key=String(p.pref||'')+'|'+norm(p.name);
    if(!norm(p.name))continue;
    if(!canonicalByName.has(key)){canonicalByName.set(key,p);continue}
    const keep=canonicalByName.get(key);
    const preferred=Number(keep.id)<=Number(p.id)?keep:p;
    const drop=preferred===keep?p:keep;
    canonicalByName.set(key,preferred);
    removeIds.add(Number(drop.id));
  }

  if(removeIds.size){
    for(let i=samples.length-1;i>=0;i--)if(removeIds.has(Number(samples[i].id)))samples.splice(i,1);
    if(typeof regionalCatalog!=='undefined'){
      for(const r of regionalCatalog){
        if(Array.isArray(r.places))r.places=r.places.filter(p=>!removeIds.has(Number(p.id)));
        if(r.photos)for(const id of removeIds)delete r.photos[id];
        if(r.guides)for(const id of removeIds)delete r.guides[id];
      }
    }
    if(typeof tokyoPhotos!=='undefined')for(const id of removeIds)delete tokyoPhotos[id];
    if(typeof tokyoVisitGuides!=='undefined')for(const id of removeIds)delete tokyoVisitGuides[id];
    if(typeof routeTemplates!=='undefined'){
      for(const route of routeTemplates){
        for(const day of route.days||[]){
          const replacements=new Map();
          for(const removed of removeIds){
            const old=samples.find(p=>Number(p.id)===removed);
            if(old){
              const replacement=samples.find(p=>p.pref===old.pref&&norm(p.name)===norm(old.name));
              if(replacement)replacements.set(removed,Number(replacement.id));
            }
          }
          if(Array.isArray(day.places))day.places=day.places.map(id=>replacements.get(Number(id))??id).filter(id=>!removeIds.has(Number(id)));
          if(Array.isArray(day.schedule))day.schedule=day.schedule.map(row=>replacements.has(Number(row[0]))?[replacements.get(Number(row[0])),...row.slice(1)]:row).filter(row=>!removeIds.has(Number(row[0])));
        }
      }
    }
  }
  globalThis.JATLAS_REMOVED_PLACE_IDS=removeIds;
  if(typeof render==='function')render();
})();
