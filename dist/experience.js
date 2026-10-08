
(function(){
  const body=document.body;
  const intro=document.getElementById('jatlasIntro');
  const magazine=document.getElementById('magazineExplore');
  const app=document.querySelector('.app');
  let introClosed=false;

  const core={
    home:typeof home==='function'?home:null,
    go:typeof go==='function'?go:null,
    showRegions:typeof showRegions==='function'?showRegions:null,
    showEvents:typeof showEvents==='function'?showEvents:null,
    showRoutes:typeof showRoutes==='function'?showRoutes:null,
    showPlans:typeof showPlans==='function'?showPlans:null,
    showNationalCatalog:typeof showNationalCatalog==='function'?showNationalCatalog:null
  };

  function setMode(mode,{scroll=true}={}){
    body.dataset.jatlasView=mode;
    const explore=mode==='explore';
    if(magazine)magazine.hidden=!explore;
    if(app)app.hidden=explore;
    document.querySelectorAll('[data-jx-mode]').forEach(b=>{
      const active=b.dataset.jxMode===(mode==='map'?'map':'explore');
      b.classList.toggle('active',active);
      b.setAttribute('aria-pressed',String(active));
    });
    document.querySelectorAll('.bottomnav [data-jx-bottom]').forEach(b=>{
      b.classList.toggle('active',b.dataset.jxBottom===(mode==='map'?'map':mode==='explore'?'explore':''));
    });
    if(!explore&&typeof renderMaps==='function'){
      requestAnimationFrame(()=>requestAnimationFrame(()=>renderMaps(true)));
    }
    if(explore)refreshExploreContext();
    if(scroll)window.scrollTo({top:0,behavior:'instant'});
  }

  function showExplore(options){setMode('explore',options||{})}
  function showMap(options){
    setMode('map',options||{});
    if(typeof state!=='undefined'&&state.view==='saved'&&core.home)core.home();
  }
  function showAppDetail(options){setMode('detail',options||{})}

  function enterSite(){
    if(introClosed)return;
    introClosed=true;
    if(intro)intro.classList.add('leaving');
    window.setTimeout(()=>{
      if(intro)intro.hidden=true;
      body.classList.remove('jatlasIntroActive');
      showExplore();
    },430);
  }

  function openPref(pref,area,town){
    showAppDetail();
    if(core.go){
      if(area)core.go(pref,area,town||'전체');
      else core.go(pref);
    }
  }
  function openCatalog(kind){
    showAppDetail();
    if(core.showNationalCatalog)core.showNationalCatalog(kind);
  }
  function openRegions(){
    showAppDetail();
    if(core.showRegions)core.showRegions();
  }
  function openEvents(){
    showAppDetail();
    if(core.showEvents)core.showEvents();
  }
  function openRoutes(){
    showAppDetail();
    if(core.showRoutes)core.showRoutes();
  }
  function openPlans(){
    showAppDetail();
    if(core.showPlans)core.showPlans();
  }
  function showSaved(){
    showAppDetail();
    if(typeof state!=='undefined'){
      state.view='saved';
      if(typeof close==='function')close();
      if(typeof render==='function')render();
    }
  }

  function refreshExploreContext(){
    const resume=document.getElementById('jxResumeJourney');
    if(!resume||typeof state==='undefined')return;
    if(state.pref){
      resume.hidden=false;
      const title=resume.querySelector('[data-jx-resume-title]');
      const sub=resume.querySelector('[data-jx-resume-sub]');
      const button=resume.querySelector('button');
      if(title)title.textContent=state.pref+' 계속 둘러보기';
      if(sub)sub.textContent=[state.area!=='전체'?state.area:'',state.town!=='전체'?state.town:''].filter(Boolean).join(' · ')||'마지막으로 보던 지역에서 이어갑니다.';
      if(button)button.onclick=()=>{
        showAppDetail();
        if(core.go)core.go(state.pref,state.area,state.town);
      };
    }else resume.hidden=true;
  }

  function hydrateCounts(){
    const places=document.getElementById('jxPlaceCount');
    const foods=document.getElementById('jxFoodCount');
    if(places&&typeof samples!=='undefined')places.textContent=samples.length.toLocaleString();
    if(foods&&typeof foodsForPref==='function'&&typeof allPrefs!=='undefined'){
      let count=0;
      for(const pref of allPrefs)count+=(foodsForPref(pref)||[]).length;
      foods.textContent=count.toLocaleString();
    }
  }

  function bindMagazine(){
    if(!magazine)return;
    magazine.addEventListener('click',e=>{
      const target=e.target.closest('[data-jx-action],[data-jx-pref]');
      if(!target)return;
      if(target.dataset.jxPref){openPref(target.dataset.jxPref,target.dataset.jxArea,target.dataset.jxTown);return}
      switch(target.dataset.jxAction){
        case 'map':showMap();break;
        case 'places':openCatalog('places');break;
        case 'foods':openCatalog('foods');break;
        case 'regions':openRegions();break;
        case 'events':openEvents();break;
        case 'routes':openRoutes();break;
        case 'saved':showSaved();break;
      }
    });
  }

  if(core.home){
    home=function(){
      setMode('map',{scroll:false});
      return core.home.apply(this,arguments);
    };
  }
  if(core.go){
    go=function(){
      if(body.dataset.jatlasView!=='map')setMode('detail',{scroll:false});
      return core.go.apply(this,arguments);
    };
  }
  if(core.showRegions){
    showRegions=function(){showAppDetail({scroll:false});return core.showRegions.apply(this,arguments)};
  }
  if(core.showEvents){
    showEvents=function(){showAppDetail({scroll:false});return core.showEvents.apply(this,arguments)};
  }
  if(core.showRoutes){
    showRoutes=function(){showAppDetail({scroll:false});return core.showRoutes.apply(this,arguments)};
  }
  if(core.showPlans){
    showPlans=function(){showAppDetail({scroll:false});return core.showPlans.apply(this,arguments)};
  }
  if(core.showNationalCatalog){
    showNationalCatalog=function(){showAppDetail({scroll:false});return core.showNationalCatalog.apply(this,arguments)};
  }

  const brand=document.getElementById('brand');
  if(brand)brand.onclick=e=>{e.preventDefault();showExplore()};

  document.querySelectorAll('[data-jx-enter]').forEach(b=>b.addEventListener('click',enterSite));
  document.querySelectorAll('[data-jx-enter-onsen]').forEach(b=>b.addEventListener('click',()=>{
    enterSite();
    window.setTimeout(()=>document.getElementById('jxOnsenFeature')?.scrollIntoView({behavior:'smooth',block:'start'}),500);
  }));
  // The intro is a fixed, independently scrolling container.
  if(intro){
    let frame=0;
    intro.addEventListener('scroll',()=>{
      if(introClosed||frame)return;
      frame=requestAnimationFrame(()=>{
        frame=0;
        const max=intro.scrollHeight-intro.clientHeight;
        if(max>200&&intro.scrollTop>=max-3)enterSite();
      });
    },{passive:true});
  }
  bindMagazine();
  hydrateCounts();
  refreshExploreContext();

  window.JatlasExperience={
    enterSite,showExplore,showMap,showAppDetail,openPref,openCatalog,openRegions,openEvents,openRoutes,openPlans,showSaved,
    displayPolicy:Object.freeze({disputedTerritories:'omit'})
  };

  const requested=new URLSearchParams(location.search).get('view');
  if(requested==='map'){
    if(intro)intro.hidden=true;
    introClosed=true;
    body.classList.remove('jatlasIntroActive');
    showMap();
  }else if(requested==='explore'){
    if(intro)intro.hidden=true;
    introClosed=true;
    body.classList.remove('jatlasIntroActive');
    showExplore();
  }else{
    body.dataset.jatlasView='explore';
  }
})();
