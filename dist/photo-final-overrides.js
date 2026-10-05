/* Final user-approved representative photo overrides.
   Loaded after QA/repair scripts so these choices cannot be overwritten by older photo maps. */
(()=>{
  const replacements={
    "1314":{
      src:"images/licensed/tochigi-ryuzu-1314.webp",
      alt:"류즈 폭포",
      source:"https://commons.wikimedia.org/wiki/File:Ryuzu_Falls_01.JPG"
    },
    "1408":{
      src:"images/licensed/gunma-shima-onsen-1408.webp",
      alt:"시마 온천",
      source:"https://commons.wikimedia.org/wiki/File:%E5%9B%9B%E4%B8%87%E6%B8%A9%E6%B3%89_%E4%B8%AD%E4%B9%8B%E6%9D%A1_2013_(9993444756).jpg"
    },
    "1409":{
      src:"images/licensed/gunma-takasaki-kannon-1409.webp",
      alt:"다카사키 백의대관음",
      source:"https://commons.wikimedia.org/wiki/File:Takasaki_Kannon_7.jpg"
    },
    "717":{
      src:"images/licensed/kanagawa-marine-tower-717.webp",
      alt:"요코하마 마린타워",
      source:"https://commons.wikimedia.org/wiki/File:Hikawamaru_from_Osanbashi_Pier.JPG"
    },
    "720":{
      src:"images/licensed/kanagawa-engakuji-720.webp",
      alt:"엔가쿠지",
      source:"https://commons.wikimedia.org/wiki/File:Engaku-ji_(36530160165).jpg"
    },
    "911":{
      src:"images/licensed/gifu-sekigahara-overview-911.webp",
      alt:"세키가하라 고전장",
      source:"https://commons.wikimedia.org/wiki/File:View_of_Sekigahara_from_Sasaoyama,_site_of_Ishida_Mitsunari%27s_headquarters.jpg"
    },
    "923":{
      src:"images/licensed/gifu-sekigahara-decisive-923.webp",
      alt:"세키가하라 고전장 결전지",
      source:"https://commons.wikimedia.org/wiki/File:The-Battlefield-of-Sekigahara-1.jpg"
    },
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
  if(typeof designPhotos!=="undefined"){
    designPhotos["시마 온천"]={...replacements["1408"]};
    designPhotos["세키가하라·요로"]={...replacements["911"]};
    designPhotos["세키가하라"]={...replacements["923"]};
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
