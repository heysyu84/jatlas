(()=>{
  const root=document.querySelector('#photoCreditList');
  if(!root)return;

  const INITIAL=80,STEP=100;
  let visibleLimit=INITIAL,formatting=false;
  const labels={
    ko:{source:'출처',author:'촬영/제공',license:'이용조건',more:'출처 더 보기',left:'개 남음'},
    ja:{source:'出典',author:'撮影・提供',license:'利用条件',more:'出典をさらに表示',left:'件'}
  };
  const technical=/^(?:webp\s*\/\s*resized|resized|webp|사진 크기 조정.*|이미지 크기 조정.*|画像サイズ調整.*)$/i;
  const providerMap=new Map([
    ['commons.wikimedia.org','Wikimedia Commons'],['flickr.com','Flickr'],['www.flickr.com','Flickr'],
    ['gotokyo.org','GO TOKYO'],['www.gotokyo.org','GO TOKYO']
  ]);
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

  function readRow(row){
    if(row.dataset.creditSourceUrl)return {
      label:row.dataset.creditLabel||'',sourceUrl:row.dataset.creditSourceUrl||'',provider:row.dataset.creditProvider||'',
      author:row.dataset.creditAuthor||'',license:row.dataset.creditLicense||'',licenseUrl:row.dataset.creditLicenseUrl||''
    };
    const links=[...row.querySelectorAll('a')],first=links[0];
    if(!first)return null;
    const original=clean(first.textContent),parts=original.split(/\s*·\s*/).map(clean).filter(Boolean);
    let hint='',label=original;
    if(parts.length>1&&looksLikeProvider(parts[0])){hint=parts[0];label=parts.slice(1).join(' · ')}
    const sourceUrl=first.getAttribute('href')||'',provider=sourceProvider(sourceUrl,hint);
    let author='',license='',licenseUrl='';
    const titleParts=clean(first.getAttribute('title')).split(/\s*·\s*/).map(clean).filter(Boolean).filter(t=>!technical.test(t));
    if(titleParts.length===1)author=titleParts[0];
    if(titleParts.length>1){author=titleParts.slice(0,-1).join(' · ');license=titleParts.at(-1)}
    const tokens=Array.from(row.childNodes).filter(n=>n.nodeType===Node.TEXT_NODE)
      .flatMap(n=>n.textContent.split(/\s*·\s*/)).map(clean).filter(Boolean).filter(t=>!technical.test(t));
    if(!author&&tokens[0])author=tokens[0];
    if(!license&&tokens[1])license=tokens[1];
    if(links[1]){licenseUrl=links[1].getAttribute('href')||'';if(!license)license=clean(links[1].textContent)}
    if(author===license)author='';
    return {label,sourceUrl,provider,author,license,licenseUrl};
  }

  function writeRow(row,data,force=false){
    const lang=document.documentElement.lang==='ja'?'ja':'ko';
    if(!force&&row.dataset.creditFormatted===lang)return;
    const t=labels[lang];
    Object.assign(row.dataset,{
      creditLabel:data.label||'',creditSourceUrl:data.sourceUrl||'',creditProvider:data.provider||'',
      creditAuthor:data.author||'',creditLicense:data.license||'',creditLicenseUrl:data.licenseUrl||'',creditFormatted:lang
    });
    row.classList.add('photoAttribution','creditRow');
    row.removeAttribute('translate');
    row.replaceChildren();

    const source=document.createElement('a');
    source.href=data.sourceUrl||'#';source.target='_blank';source.rel='noopener';
    source.className='creditSubject';source.textContent=data.label||data.provider||t.source;
    row.append(source);

    const meta=[];
    if(data.provider)meta.push(`${t.source}: ${data.provider}`);
    if(data.author)meta.push(`${t.author}: ${data.author}`);
    if(meta.length)row.append(document.createTextNode(' · '+meta.join(' · ')));
    if(data.license){
      row.append(document.createTextNode(` · ${t.license}: `));
      if(data.licenseUrl){
        const a=document.createElement('a');a.href=data.licenseUrl;a.target='_blank';a.rel='noopener';
        a.className='creditLicense';a.textContent=data.license;row.append(a);
      }else row.append(document.createTextNode(data.license));
    }
  }

  const rows=()=>[...root.querySelectorAll('p')].filter(row=>row.classList.contains('creditRow'));
  function pager(){
    let box=document.querySelector('#photoCreditPager');
    if(!box){
      box=document.createElement('div');box.id='photoCreditPager';box.className='photoCreditPager';
      const btn=document.createElement('button');btn.type='button';btn.className='photoCreditMore';
      btn.onclick=()=>{visibleLimit+=STEP;applyPaging();};
      box.append(btn);root.append(box);
    }
    return box;
  }
  function applyPaging(){
    const list=rows(),lang=document.documentElement.lang==='ja'?'ja':'ko',t=labels[lang];
    list.forEach((row,i)=>{row.hidden=i>=visibleLimit});
    const left=Math.max(0,list.length-visibleLimit),box=pager(),btn=box.querySelector('button');
    box.hidden=left===0;
    if(btn)btn.textContent=lang==='ja'?`${t.more}（残り ${left}${t.left}）`:`${t.more} (나머지 ${left}${t.left})`;
  }

  function processRows(force=false){
    if(formatting)return;
    formatting=true;
    try{
      const seen=new Set();
      for(const row of [...root.querySelectorAll('p')]){
        if(!row.querySelector('a')){
          if(technical.test(clean(row.textContent)))row.hidden=true;
          continue;
        }
        const data=readRow(row);if(!data)continue;
        const key=[data.label,data.sourceUrl,data.author,data.license].map(clean).join('|');
        if(seen.has(key)){row.remove();continue}
        seen.add(key);writeRow(row,data,force);
      }
      applyPaging();
    }finally{formatting=false}
  }

  processRows();
  if(typeof MutationObserver!=='undefined'){
    let scheduled=false;
    new MutationObserver(mutations=>{
      if(formatting)return;
      if(!mutations.some(m=>[...m.addedNodes].some(n=>n.nodeType===1&&n.tagName==='P')))return;
      if(scheduled)return;scheduled=true;
      requestAnimationFrame(()=>{scheduled=false;processRows(false)});
    }).observe(root,{childList:true,subtree:false});
    new MutationObserver(()=>{processRows(true)}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  }
})();
