(()=>{
  const root=document.querySelector('#photoCreditList');
  const details=document.querySelector('#photoCredits');
  if(!root||!details)return;
  const registry=globalThis.JATLAS_PHOTO_SOURCE_REGISTRY||{};
  const INITIAL=80,STEP=100;
  const labels={
    ko:{places:'관광지 사진 출처',other:'음식·대표 이미지 출처',source:'출처',author:'촬영/제공',license:'이용조건',more:'출처 더 보기',left:'개 남음',terms:'원본 페이지 이용조건'},
    ja:{places:'観光地写真の出典',other:'料理・代表画像の出典',source:'出典',author:'撮影・提供',license:'利用条件',more:'出典をさらに表示',left:'件',terms:'元ページの利用条件'}
  };
  const providerMap=new Map([
    ['commons.wikimedia.org','Wikimedia Commons'],['flickr.com','Flickr'],['www.flickr.com','Flickr'],
    ['gotokyo.org','GO TOKYO'],['www.gotokyo.org','GO TOKYO']
  ]);
  const clean=s=>(s||'').replace(/\s+/g,' ').trim();
  const normSrc=s=>String(s||'').replace(/^\.\//,'').split(/[?#]/)[0];
  const provider=href=>{
    try{
      const u=new URL(href,location.href);
      if(u.origin===location.origin&&/\/images\/user\//.test(u.pathname))return '사용자 제공';
      const host=u.hostname.replace(/^www\./,'');
      return providerMap.get(host)||host||'사진 출처';
    }catch{return '사진 출처'}
  };
  const licenseLabel=url=>{
    const s=String(url||'').toLowerCase();
    const m=s.match(/creativecommons\.org\/licenses\/(by(?:-sa|-nc|-nc-sa|-nd|-nc-nd)?)\/(\d\.\d)/);
    if(m)return 'CC '+m[1].toUpperCase()+' '+m[2];
    if(s.includes('creativecommons.org/publicdomain/zero/1.0'))return 'CC0 1.0';
    if(s.includes('creativecommons.org/publicdomain/mark'))return 'Public Domain';
    return '';
  };

  const legacyMeta=new Map();
  for(const row of root.querySelectorAll('p')){
    const links=[...row.querySelectorAll('a')],first=links[0];
    if(!first)continue;
    const source=first.getAttribute('href')||'';if(!source)continue;
    const title=clean(first.getAttribute('title')).split(/\s*·\s*/).filter(Boolean);
    const text=clean(row.textContent).split(/\s*·\s*/).filter(Boolean);
    let author='',license='',licenseUrl=links[1]?.getAttribute('href')||'';
    if(title.length>1){author=title.slice(0,-1).join(' · ');license=title.at(-1)}
    else if(title.length===1)author=title[0];
    if(!author&&text.length>1)author=text[text.length-2]||'';
    if(!license&&text.length>2)license=text.at(-1)||'';
    legacyMeta.set(source,{author,license,licenseUrl});
  }

  function syncPic(pic){
    if(!pic?.src)return pic;
    const rec=registry[normSrc(pic.src)];
    if(rec?.source){
      pic.source=rec.source;
      if(rec.author&&!pic.author)pic.author=rec.author;
      if(rec.terms&&!pic.licenseUrl)pic.licenseUrl=rec.terms;
    }
    return pic;
  }
  const syncValues=obj=>{if(obj)for(const pic of Object.values(obj))syncPic(pic)};
  if(typeof tokyoPhotos!=='undefined')syncValues(tokyoPhotos);
  if(typeof designPhotos!=='undefined')syncValues(designPhotos);
  if(typeof addedFoodPhotos!=='undefined')syncValues(addedFoodPhotos);
  if(typeof regionalCatalog!=='undefined')for(const r of regionalCatalog){syncValues(r.photos);syncValues(r.foodPhotos);syncPic(r.hero)}

  let placeRecords=null,otherRecords=null,visible=INITIAL,built=false;
  function makeRecord(label,pic,kind){
    pic=syncPic(pic);if(!pic?.src||!pic?.source)return null;
    const rec=registry[normSrc(pic.src)]||{},old=legacyMeta.get(pic.source)||{};
    const terms=rec.terms||pic.licenseUrl||old.licenseUrl||'',inferred=licenseLabel(terms);
    return {kind,label,src:normSrc(pic.src),source:pic.source,provider:provider(pic.source),
      author:rec.author||pic.author||old.author||'',license:pic.license||old.license||inferred||(terms&&terms!==pic.source?'이용조건 확인':''),
      licenseUrl:terms};
  }
  function collect(){
    const places=[],other=[],seen=new Set();
    if(typeof samples!=='undefined'&&typeof photoForPlace==='function')for(const p of samples){
      const x=makeRecord(p.name,photoForPlace(p),'place');if(!x)continue;
      const key=x.src+'|'+x.source;if(seen.has(key))continue;seen.add(key);places.push(x);
    }
    if(typeof addedFoodPhotos!=='undefined')for(const [name,pic] of Object.entries(addedFoodPhotos)){
      const x=makeRecord(name,pic,'other');if(!x)continue;
      const key=x.src+'|'+x.source;if(seen.has(key))continue;seen.add(key);other.push(x);
    }
    if(typeof designPhotos!=='undefined')for(const [name,pic] of Object.entries(designPhotos)){
      const x=makeRecord(name+' · 대표 이미지',pic,'other');if(!x)continue;
      const key=x.src+'|'+x.source;if(seen.has(key))continue;seen.add(key);other.push(x);
    }
    places.sort((a,b)=>a.label.localeCompare(b.label,'ko'));other.sort((a,b)=>a.label.localeCompare(b.label,'ko'));
    placeRecords=places;otherRecords=other;
  }
  function row(data){
    const lang=document.documentElement.lang==='ja'?'ja':'ko',t=labels[lang],p=document.createElement('p');
    p.className='photoAttribution creditRow';
    const a=document.createElement('a');a.href=data.source;a.target='_blank';a.rel='noopener';a.className='creditSubject';a.textContent=data.label;p.append(a);
    p.append(document.createTextNode(' · '+t.source+': '+data.provider));
    if(data.author)p.append(document.createTextNode(' · '+t.author+': '+data.author));
    if(data.license){
      p.append(document.createTextNode(' · '+t.license+': '));
      if(data.licenseUrl){const l=document.createElement('a');l.href=data.licenseUrl;l.target='_blank';l.rel='noopener';l.className='creditLicense';l.textContent=data.license;p.append(l)}
      else p.append(document.createTextNode(data.license));
    }else if(data.licenseUrl){
      p.append(document.createTextNode(' · '+t.license+': '));
      const l=document.createElement('a');l.href=data.licenseUrl;l.target='_blank';l.rel='noopener';l.className='creditLicense';l.textContent=t.terms;p.append(l);
    }
    return p;
  }
  function renderList(reset=false){
    if(!placeRecords)collect();if(reset)visible=INITIAL;root.replaceChildren();
    const lang=document.documentElement.lang==='ja'?'ja':'ko',t=labels[lang],all=[...placeRecords,...otherRecords],shown=all.slice(0,visible);
    let placeShown=shown.filter(x=>x.kind==='place'),otherShown=shown.filter(x=>x.kind==='other');
    if(placeShown.length){const h=document.createElement('h3');h.textContent=t.places;root.append(h);for(const x of placeShown)root.append(row(x))}
    if(otherShown.length){const h=document.createElement('h3');h.textContent=t.other;root.append(h);for(const x of otherShown)root.append(row(x))}
    const left=Math.max(0,all.length-visible);
    if(left){const box=document.createElement('div');box.className='photoCreditPager';const btn=document.createElement('button');btn.type='button';btn.className='photoCreditMore';
      btn.textContent=lang==='ja'?t.more+'（残り '+left+t.left+'）':t.more+' (나머지 '+left+t.left+')';btn.onclick=()=>{visible+=STEP;renderList(false)};box.append(btn);root.append(box)}
    built=true;
  }

  root.replaceChildren();
  details.addEventListener('toggle',()=>{if(details.open&&!built)renderList(true)});
  if(details.open)renderList(true);
  if(typeof MutationObserver!=='undefined')new MutationObserver(()=>{if(built)renderList(true)}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();
