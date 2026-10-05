(()=>{
  const root=document.querySelector('#photoCreditList');
  if(!root)return;

  const labels={
    ko:{source:'출처',author:'촬영/제공',license:'이용조건'},
    ja:{source:'出典',author:'撮影・提供',license:'利用条件'}
  };
  const technical=/^(?:webp\s*\/\s*resized|resized|webp|사진 크기 조정.*|이미지 크기 조정.*|画像サイズ調整.*)$/i;
  const providerMap=new Map([
    ['commons.wikimedia.org','Wikimedia Commons'],
    ['flickr.com','Flickr'],
    ['www.flickr.com','Flickr'],
    ['gotokyo.org','GO TOKYO'],
    ['www.gotokyo.org','GO TOKYO']
  ]);
  let formatting=false;

  const clean=s=>(s||'').replace(/\s+/g,' ').replace(/^\s*[·|]\s*|\s*[·|]\s*$/g,'').trim();
  const sourceProvider=(href,hint='')=>{
    const h=clean(hint);
    if(h&&h!=='사진 출처'&&!/\.[a-z]{2,}(?:\b|\/)/i.test(h))return h;
    try{
      const u=new URL(href,location.href);
      if(u.origin===location.origin&&/\/images\/user\//.test(u.pathname))return '사용자 제공';
      const host=u.hostname.replace(/^www\./,'');
      return providerMap.get(host)||host||'사진 출처';
    }catch{return h||'사진 출처'}
  };
  const looksLikeProvider=s=>/^(?:Wikimedia Commons|Flickr|GO TOKYO|[^\s]+\.[a-z]{2,})$/i.test(clean(s));
  const directTokens=row=>Array.from(row.childNodes)
    .filter(n=>n.nodeType===Node.TEXT_NODE)
    .flatMap(n=>n.textContent.split(/\s*·\s*/))
    .map(clean).filter(Boolean).filter(t=>!technical.test(t));

  function readRow(row){
    if(row.dataset.creditSourceUrl){
      return {
        label:row.dataset.creditLabel||'',sourceUrl:row.dataset.creditSourceUrl||'',provider:row.dataset.creditProvider||'',
        author:row.dataset.creditAuthor||'',license:row.dataset.creditLicense||'',licenseUrl:row.dataset.creditLicenseUrl||''
      };
    }
    const links=[...row.querySelectorAll('a')];
    const first=links[0];
    if(!first)return null;
    const original=clean(first.textContent);
    const parts=original.split(/\s*·\s*/).map(clean).filter(Boolean);
    let hint='',label=original;
    if(parts.length>1&&looksLikeProvider(parts[0])){hint=parts[0];label=parts.slice(1).join(' · ')}
    const sourceUrl=first.getAttribute('href')||'';
    const provider=sourceProvider(sourceUrl,hint);
    let author='',license='',licenseUrl='';
    const titleParts=clean(first.getAttribute('title')).split(/\s*·\s*/).map(clean).filter(Boolean).filter(t=>!technical.test(t));
    if(titleParts.length===1)author=titleParts[0];
    if(titleParts.length>1){author=titleParts.slice(0,-1).join(' · ');license=titleParts.at(-1)}
    const tokens=directTokens(row);
    if(!author&&tokens[0])author=tokens[0];
    if(!license&&tokens[1])license=tokens[1];
    if(links[1]){
      licenseUrl=links[1].getAttribute('href')||'';
      if(!license)license=clean(links[1].textContent);
    }
    if(author===license)author='';
    return {label,sourceUrl,provider,author,license,licenseUrl};
  }

  function writeRow(row,data){
    const lang=document.documentElement.lang==='ja'?'ja':'ko';
    const t=labels[lang];
    row.dataset.creditLabel=data.label||'';
    row.dataset.creditSourceUrl=data.sourceUrl||'';
    row.dataset.creditProvider=data.provider||'';
    row.dataset.creditAuthor=data.author||'';
    row.dataset.creditLicense=data.license||'';
    row.dataset.creditLicenseUrl=data.licenseUrl||'';
    row.classList.add('photoAttribution','creditRow');
    row.removeAttribute('translate');
    row.replaceChildren();

    const source=document.createElement('a');
    source.href=data.sourceUrl||'#';source.target='_blank';source.rel='noopener';
    source.className='creditSubject';source.textContent=data.label||data.provider||t.source;
    row.append(source);

    if(data.provider){
      const span=document.createElement('span');span.className='creditMeta';
      span.append(document.createTextNode(` · ${t.source}: `));
      const provider=document.createElement('span');provider.className='creditProvider';provider.textContent=data.provider;span.append(provider);row.append(span);
    }
    if(data.author){
      const span=document.createElement('span');span.className='creditMeta';span.textContent=` · ${t.author}: ${data.author}`;row.append(span);
    }
    if(data.license){
      const span=document.createElement('span');span.className='creditMeta';span.append(document.createTextNode(` · ${t.license}: `));
      if(data.licenseUrl){const a=document.createElement('a');a.href=data.licenseUrl;a.target='_blank';a.rel='noopener';a.className='creditLicense';a.textContent=data.license;span.append(a)}
      else {const value=document.createElement('span');value.className='creditLicense';value.textContent=data.license;span.append(value)}
      row.append(span);
    }
  }

  function formatAll(){
    if(formatting)return;
    formatting=true;
    try{
      for(const row of root.querySelectorAll('p')){
        if(!row.querySelector('a')){
          if(technical.test(clean(row.textContent)))row.hidden=true;
          continue;
        }
        const data=readRow(row);if(data)writeRow(row,data);
      }
    }finally{formatting=false}
  }

  formatAll();
  new MutationObserver(()=>formatAll()).observe(root,{childList:true,subtree:false});
  new MutationObserver(()=>formatAll()).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();
