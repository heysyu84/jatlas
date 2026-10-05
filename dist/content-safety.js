/* Runtime safety net.
   Keep this loaded after all data/photo override scripts. It protects every host,
   including mirrors that do not run GitHub Actions. */
(()=>{
  if(typeof samples==='undefined')return;
  const tombstoneIds=new Set([4722]);
  const norm=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[\s·・･\-–—_\/().（）【】「」『』［］\[\],，、:：'"]/g,'');
  const tombstoneNames=new Set(['도야마|'+norm('나메리카와 해변공원'),'도야마|'+norm('滑川海浜公園')]);
  const tombstones=[],duplicates=[],duplicateReplacement=new Map(),removeIds=new Set();

  for(const p of samples){
    if(tombstoneIds.has(Number(p.id))||tombstoneNames.has(String(p.pref||'')+'|'+norm(p.name))){
      removeIds.add(Number(p.id));
      tombstones.push({id:Number(p.id),pref:p.pref,name:p.name});
    }
  }

  const canonicalByName=new Map();
  for(const p of samples){
    if(removeIds.has(Number(p.id)))continue;
    const key=String(p.pref||'')+'|'+norm(p.name);
    if(!norm(p.name))continue;
    if(!canonicalByName.has(key)){canonicalByName.set(key,p);continue}
    const current=canonicalByName.get(key);
    const keep=Number(current.id)<=Number(p.id)?current:p;
    const drop=keep===current?p:current;
    canonicalByName.set(key,keep);
    removeIds.add(Number(drop.id));
    duplicateReplacement.set(Number(drop.id),Number(keep.id));
    duplicates.push({dropId:Number(drop.id),keepId:Number(keep.id),pref:p.pref,name:p.name});
  }

  if(removeIds.size){
    if(typeof routeTemplates!=='undefined'){
      for(const route of routeTemplates){
        for(const day of route.days||[]){
          if(Array.isArray(day.places))day.places=day.places
            .map(id=>duplicateReplacement.get(Number(id))??id)
            .filter(id=>!tombstoneIds.has(Number(id)));
          if(Array.isArray(day.schedule))day.schedule=day.schedule
            .map(row=>duplicateReplacement.has(Number(row[0]))?[duplicateReplacement.get(Number(row[0])),...row.slice(1)]:row)
            .filter(row=>!tombstoneIds.has(Number(row[0])));
        }
      }
    }
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
  }

  globalThis.JATLAS_CONTENT_SAFETY={tombstones,duplicates,removedIds:[...removeIds]};
  if(typeof render==='function')render();
})();
