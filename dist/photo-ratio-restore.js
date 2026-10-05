/* Restore the pre-QA user-approved photo state for the ratio-regression set.
   Loaded last so stale QA/override layers cannot replace these selections. */
(()=>{
  const snap=globalThis.JATLAS_RATIO_RECHECK_BASELINE;
  if(!snap)return;
  const clone=x=>x?{...x}:x;
  for(const id of snap.ids){
    const base=snap.photoById[id];
    if(base&&typeof tokyoPhotos!=='undefined'){
      const clean=clone(base);delete clean.fit;
      tokyoPhotos[id]=clean;
    }
    for(const saved of (snap.regionalById[id]||[])){
      const r=(typeof regionalCatalog!=='undefined'?regionalCatalog:[]).find(x=>x.pref===saved.pref);
      if(r?.photos){
        const clean=clone(saved.photo);delete clean.fit;
        r.photos[id]=clean;
      }
    }
  }
  if(typeof designPhotos!=='undefined'){
    for(const [key,pic] of Object.entries(snap.design)){
      const clean=clone(pic);delete clean.fit;
      designPhotos[key]=clean;
    }
  }

  /* Re-sync explicit regional hero mappings from the restored place photos. */
  for(const r of (typeof regionalCatalog!=='undefined'?regionalCatalog:[])){
    for(const [area,id] of Object.entries(r.heroes||{})){
      if(!snap.ids.includes(String(id))||!r.photos?.[id])continue;
      const clean=clone(r.photos[id]);delete clean.fit;
      if(typeof designPhotos!=='undefined')designPhotos[area]=clean;
    }
  }

  /* Shinhotaka: keep the selected source, but crop from the top so both the
     mountain ridge and ropeway remain inside wide cards/detail frames. */
  if(typeof document!=='undefined'&&document.head?.append&&document.createElement){
    const style=document.createElement('style');
    style.id='ratio-recheck-final-crops';
    style.textContent='img[src*="8f65722fc95cc182.webp"]{object-fit:cover!important;object-position:center top!important}';
    document.head.append(style);
  }

  if(typeof render==='function')render();
})();