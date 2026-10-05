/* Preserve the user-approved photo state before legacy QA/repair layers run.
   Loaded immediately before photo-qa-review.js. */
(()=>{
  const targetNames=[
    '류즈 폭포','시마 온천','다카사키 백의대관음','요코하마 마린타워','엔가쿠지',
    '쇼묘 폭포','구로베댐','오바마 어항','구조하치만성','신호타카 로프웨이',
    '세키가하라 고전장','세키가하라 고전장 결전지','이가류 닌자박물관','오카게요코초','나가시마 스파랜드',
    '아라시야마 대나무숲','긴카쿠지','킨카쿠지','구로몬 시장','오사카성 공원·천수각','시텐노지','유니버설 스튜디오 재팬',
    '기노사키 온천','아와지 하나사지키','아카시성','고베 포트타워','요시노산','아스카데라','단잔 신사',
    '오유노하라','나치 폭포','가이케 온천','아다치 미술관','류겐지 마부','히로시마성','가라토 시장',
    '야시마·야시마루','쇼도시마 올리브공원','다카마쓰 마루가메마치 상점가','반스이소','가류산소','고치성',
    '고쿠라성','캐널시티 하카타','니지노마쓰바라','히젠 나고야성터·사가현립 나고야성박물관',
    '사가현립 규슈도자문화관','오카와치야마','오우라 천주당','일본26성인 순교지·니시자카',
    '히라도 자비에르기념교회·사원과 교회가 보이는 풍경','후쿠에성터·이시다성',
    '유노쓰보거리','나가유온천·라무네온천관','오카성터','우사신궁','다카치호 협곡','우마가세',
    '다카치호가와라','시라타니운스이쿄','조몬스기','오코노타키','세이화우타키','오키나와월드·교쿠센도',
    '헤도곶','유글레나몰·이시가키시 공설시장'
  ];
  const norm=s=>String(s||'')
    .normalize('NFKC')
    .replace(/[（(][^）)]*[）)]/g,'')
    .replace(/사용자지적/g,'')
    .replace(/[·・\s/／,，.․:：\-–—]/g,'')
    .replace(/은각사|금각사/g,'');
  const wanted=targetNames.map(norm);
  const isTarget=p=>{
    const n=norm(p?.name);
    return wanted.some(t=>n===t||n.includes(t)||t.includes(n));
  };
  const clone=x=>x?{...x}:x;
  const targets=(typeof samples!=='undefined'?samples:[]).filter(isTarget);
  const ids=new Set(targets.map(p=>String(p.id)));
  const photoById={};
  const regionalById={};
  for(const p of targets){
    const id=String(p.id);
    if(typeof tokyoPhotos!=='undefined'&&tokyoPhotos[id])photoById[id]=clone(tokyoPhotos[id]);
    for(const r of (typeof regionalCatalog!=='undefined'?regionalCatalog:[])){
      if(r.photos?.[id]){
        regionalById[id]??=[];
        regionalById[id].push({pref:r.pref,photo:clone(r.photos[id])});
      }
    }
  }
  const design={};
  if(typeof designPhotos!=='undefined'){
    for(const [key,pic] of Object.entries(designPhotos)){
      const matchesTarget=targets.some(p=>{
        const base=photoById[String(p.id)];
        return key===p.name||key===p.area||key===p.pref||(base?.src&&pic?.src===base.src);
      });
      if(matchesTarget)design[key]=clone(pic);
    }
  }
  globalThis.JATLAS_RATIO_RECHECK_BASELINE={ids:[...ids],targets:targets.map(p=>({id:p.id,name:p.name,pref:p.pref,area:p.area})),photoById,regionalById,design};
})();