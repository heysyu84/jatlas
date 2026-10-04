(()=>{
  const overrides={
    3:{
      src:'images/commons/5f25d070115d8e02.webp',
      alt:'다카야마 옛 거리',
      source:'https://commons.wikimedia.org/wiki/File:Shops_in_one_of_the_three_main_streets_in_Sanmachi-Suji_(6156040666).jpg'
    },
    909:{
      src:'images/commons/8f65722fc95cc182.webp',
      alt:'신호타카 로프웨이',
      source:'https://commons.wikimedia.org/wiki/File:Kiso_Mountains_and_Shinhotaka_Ropeway.jpg'
    }
  };
  const gifu=globalThis.regionalCatalog?.find?.(x=>x.pref==='기후');
  if(gifu?.photos){
    for(const [id,pic] of Object.entries(overrides))gifu.photos[id]={...(gifu.photos[id]||{}),...pic};
  }
  if(globalThis.tokyoPhotos){
    for(const [id,pic] of Object.entries(overrides))globalThis.tokyoPhotos[id]={...(globalThis.tokyoPhotos[id]||{}),...pic};
  }
  if(globalThis.designPhotos){
    for(const [key,pic] of Object.entries(globalThis.designPhotos)){
      if(pic?.alt==='다카야마 옛 거리')globalThis.designPhotos[key]={...pic,...overrides[3]};
      if(pic?.alt==='신호타카 로프웨이')globalThis.designPhotos[key]={...pic,...overrides[909]};
    }
  }
  if(typeof globalThis.render==='function')globalThis.render();
})();
