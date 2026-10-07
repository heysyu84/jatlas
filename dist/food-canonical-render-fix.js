(()=>{
  const getCanonical=(pref,name)=>typeof globalThis.JATLAS_CANONICAL_FOOD_PHOTO==='function'
    ? globalThis.JATLAS_CANONICAL_FOOD_PHOTO(pref,name)
    : null;
  const displaySrc=rec=>{
    if(!rec?.src)return '';
    const src=typeof photoDisplaySrc==='function'?photoDisplaySrc(rec):rec.src;
    if(!rec.revision||/[?&]v=/.test(src))return src;
    return src+(src.includes('?')?'&':'?')+'v='+encodeURIComponent(rec.revision);
  };
  const ensureCanonicalFoodPhotos=()=>{
    if(typeof state==='undefined'||state.view!=='explore'||typeof contentTab==='undefined'||contentTab!=='foods')return;
    for(const card of document.querySelectorAll('.foodCard')){
      const name=card.dataset.foodName||'';
      const rec=getCanonical(state.pref,name);
      if(!rec?.src)continue;
      let img=card.querySelector('.foodPhoto');
      if(!img){
        img=document.createElement('img');
        img.className='foodPhoto';
        img.width=480;
        img.height=300;
        img.loading='lazy';
        card.prepend(img);
      }
      img.src=displaySrc(rec);
      img.alt=rec.alt||name;
      if(rec.fit)img.dataset.photoFit=rec.fit;
      else delete img.dataset.photoFit;
      const pending=card.querySelector('.photoPending');
      if(pending)pending.remove();
    }
  };
  if(typeof renderFoods==='function'){
    const previous=renderFoods;
    renderFoods=function(){
      const result=previous.apply(this,arguments);
      ensureCanonicalFoodPhotos();
      return result;
    };
  }
  globalThis.JATLAS_ENSURE_CANONICAL_FOOD_PHOTOS=ensureCanonicalFoodPhotos;
  ensureCanonicalFoodPhotos();
})();
