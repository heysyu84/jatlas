/* Final user-approved representative photo overrides.
   Loaded after QA/repair scripts so these choices cannot be overwritten by older photo maps. */
(()=>{
  const replacements={
    "726":{
      src:"images/licensed/kanagawa-pola-02-726.webp",
      alt:"폴라 미술관",
      source:"https://commons.wikimedia.org/wiki/File:191103_Pola_Museum_of_Art_Hakone_Japan02s3.jpg"
    },
    "3201":{
      src:"images/licensed/kumamoto-josaien-03-3201.webp",
      alt:"사쿠라노바바 조사이엔",
      source:"https://commons.wikimedia.org/wiki/File:Johsaien_57T3202small.jpg"
    }
  };
  for(const [id,pic] of Object.entries(replacements)){
    tokyoPhotos[id]={...pic};
    for(const r of regionalCatalog){
      if(r.photos?.[id])r.photos[id]={...pic};
    }
  }
  if(typeof render==="function")render();
})();
