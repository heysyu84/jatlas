/* Final user-approved representative photo overrides.
   Loaded after QA/repair scripts so these choices cannot be overwritten by older photo maps. */
(()=>{
  const replacements={
  "4113": {
    "src": "images/official/aomori-hirosaki-apple-4113.webp",
    "alt": "히로사키시 사과공원",
    "source": "https://aomori-tourism.com/photos/detail_7268.html"
  },
  "4224": {
    "src": "images/licensed/iwate-ryusendo-lake-4224.webp",
    "alt": "류센도",
    "source": "https://commons.wikimedia.org/wiki/File:Ryusendo_Cave_Underground_Lake_Cap_20201115.jpg"
  },
  "4103": {
    "src": "images/official/aomori-sannai-4103.webp",
    "alt": "산나이마루야마 유적",
    "source": "https://www.tohokukanko.jp/photos/detail_2208.html"
  },
    "726":{
      src:"images/licensed/kanagawa-pola-02-726.webp",
      alt:"폴라 미술관",
      source:"https://commons.wikimedia.org/wiki/File:191103_Pola_Museum_of_Art_Hakone_Japan02s3.jpg"
    },
    "3201":{
      src:"images/official/kumamoto-josaien-selected-03-3201.webp",
      alt:"사쿠라노바바 조사이엔",
      source:"https://kumamoto.guide/photogallery/"
    }
  };
  for(const [id,pic] of Object.entries(replacements)){
    tokyoPhotos[id]={...pic};
    for(const r of regionalCatalog){
      if(r.photos?.[id])r.photos[id]={...pic};
    }
  }

  const approvedCredits={"4113": {"src": "images/official/aomori-hirosaki-apple-4113.webp", "alt": "히로사키시 사과공원", "source": "https://aomori-tourism.com/photos/detail_7268.html", "filename": "히로사키시 사과공원", "author": "青森県・青森県観光国際交流機構", "license": "관광 홍보용 웹 이용 허가", "licenseUrl": "https://aomori-tourism.com/photos/detail_7268.html"}, "4224": {"src": "images/licensed/iwate-ryusendo-lake-4224.webp", "alt": "류센도", "source": "https://commons.wikimedia.org/wiki/File:Ryusendo_Cave_Underground_Lake_Cap_20201115.jpg", "filename": "류센도", "author": "あおもりくま", "license": "Public domain", "licenseUrl": "https://commons.wikimedia.org/wiki/File:Ryusendo_Cave_Underground_Lake_Cap_20201115.jpg"}, "4103": {"src": "images/official/aomori-sannai-4103.webp", "alt": "산나이마루야마 유적", "source": "https://www.tohokukanko.jp/photos/detail_2208.html", "filename": "산나이마루야마 유적", "author": "東北観光推進機構・写真提供者", "license": "관광 홍보용 이용 허가", "licenseUrl": "https://www.tohokukanko.jp/photos/detail_2208.html"}};
  const host=document.querySelector('#photoCreditList');
  for(const [id,pic] of Object.entries(approvedCredits)){
    photoQaPendingPlaces.delete(Number(id));
    const row=document.createElement('p'),a=document.createElement('a');
    row.className='photoAttribution';row.setAttribute('translate','no');
    a.href=pic.source;a.target='_blank';a.rel='noopener';a.textContent=pic.filename;
    row.append(a,document.createTextNode(' · '+pic.author+' · '+pic.license+' · WebP / resized'));
    const l=document.createElement('a');l.href=pic.licenseUrl;l.target='_blank';l.rel='noopener';l.textContent=' '+pic.license;row.append(l);host.append(row);
  }
  for(const r of routeTemplates){
    const p=r.days.flatMap(d=>d.places).map(id=>samples.find(p=>p.id===id)).find(p=>photoForPlace(p));
    const pic=photoForPlace(p);r.image=pic?.src||'';r.imageAlt=pic?.alt||'';
  }
  if(typeof render==="function")render();
})();
