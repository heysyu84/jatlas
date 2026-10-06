(()=>{
const data=globalThis.JATLAS_PHOTO_REGISTRY_DATA;if(!data)return;globalThis.JATLAS_PHOTO_REGISTRY=data;
const registryState=globalThis.JATLAS_PHOTO_REGISTRY_STATE||(globalThis.JATLAS_PHOTO_REGISTRY_STATE={});
const sr=globalThis.JATLAS_PHOTO_SOURCE_REGISTRY||(globalThis.JATLAS_PHOTO_SOURCE_REGISTRY={});
const pb=registryState.placeByLegacy||(registryState.placeByLegacy=new Map(Object.values(data.places||{}).map(r=>[Number(r.legacyId),r]))),old=new Map(),canonical=new Map();
const pic=r=>({src:r.image,alt:r.name,source:r.source||'',author:r.author||'',licenseUrl:r.terms||'',canonicalId:r.canonicalId,revision:r.revision,userPhoto:!!r.userPhoto});
for(const r of Object.values(data.places||{})){const q=pic(r);old.set(r.legacyImage,q);canonical.set(r.image,q);sr[r.image]={source:r.source||'',terms:r.terms||'',author:r.author||'',placeId:r.legacyId,foodName:'',canonicalId:r.canonicalId,userPhoto:!!r.userPhoto};if(typeof tokyoPhotos!=='undefined')tokyoPhotos[r.legacyId]={...q};if(typeof regionalCatalog!=='undefined')for(const c of regionalCatalog){if(c.pref!==r.pref)continue;const prev=c.photos?.[r.legacyId],heroSrc=String(c.hero?.src||'').split(/[?#]/)[0],prevSrc=String(prev?.src||'').split(/[?#]/)[0];if(prev)c.photos[r.legacyId]={...q};const p=c.places?.find(x=>Number(x.id)===Number(r.legacyId));if(p)p.canonicalId=r.canonicalId;if(c.hero?.src===r.legacyImage||(heroSrc&&prevSrc&&heroSrc===prevSrc))c.hero={...q}}if(typeof samples!=='undefined'){const p=samples.find(x=>Number(x.id)===Number(r.legacyId));if(p)p.canonicalId=r.canonicalId}}
const fb=registryState.foodByPrefName||(registryState.foodByPrefName=new Map());
for(const r of Object.values(data.foods||{})){const q=pic(r),key=r.pref+'|'+r.name;fb.set(key,{...q,pref:r.pref,name:r.name});old.set(r.legacyImage,q);sr[r.image]={source:r.source||'',terms:r.terms||'',author:r.author||'',placeId:null,foodName:r.name,pref:r.pref,canonicalId:r.canonicalId,userPhoto:false};if(typeof regionalCatalog!=='undefined')for(const c of regionalCatalog){if(c.pref!==r.pref)continue;c.foodPhotos??={};c.foodPhotos[r.name]={...q};const f=c.foods?.find(x=>x.name===r.name);if(f)f.canonicalId=r.canonicalId;if(c.foodDetails?.[r.name])c.foodDetails[r.name].image=r.image}}
const canonicalFoodPhoto=(pref,name)=>fb.get(String(pref||'')+'|'+String(name||''))||null;
const syncFoodScope=pref=>{if(!pref)return;const catalog=typeof regionalCatalog!=='undefined'?regionalCatalog.find(x=>x.pref===pref):null;for(const [key,q] of fb){if(!key.startsWith(pref+'|'))continue;const name=q.name;if(typeof addedFoodPhotos!=='undefined')addedFoodPhotos[name]={src:q.src,alt:q.alt,source:q.source,author:q.author,licenseUrl:q.licenseUrl,canonicalId:q.canonicalId,revision:q.revision,userPhoto:q.userPhoto};if(typeof foodDetails!=='undefined'){const detail=catalog?.foodDetails?.[name]?{...catalog.foodDetails[name]}:{...(foodDetails[name]||{kind:'',taste:'',how:''})};detail.image=typeof photoDisplaySrc==='function'?photoDisplaySrc(q):q.src;foodDetails[name]=detail}}};
globalThis.JATLAS_CANONICAL_FOOD_PHOTO=canonicalFoodPhoto;
globalThis.JATLAS_SYNC_CANONICAL_FOOD_SCOPE=syncFoodScope;
if(!registryState.foodRenderWrapped&&typeof renderFoods==='function'){const originalRenderFoods=renderFoods;renderFoods=function(){if(typeof state!=='undefined')syncFoodScope(state.pref);return originalRenderFoods.apply(this,arguments)};registryState.foodRenderWrapped=true}
if(typeof state!=='undefined')syncFoodScope(state.pref);
if(typeof syncRegionalDesignPhotos==='function')syncRegionalDesignPhotos();
// Aichi legacy area heroes historically used Inuyama Castle and Korankei.
if(typeof designPhotos!=='undefined'){for(const [area,id] of Object.entries({'오와리':1003,'미카와':1006})){const rec=pb.get(id);if(rec)designPhotos[area]=pic(rec)}}
if(typeof designPhotos!=='undefined')for(const [k,v] of Object.entries(designPhotos)){const q=old.get(String(v?.src||'').split(/[?#]/)[0]);if(q)designPhotos[k]={...q}}
if(typeof routeTemplates!=='undefined')for(const r of routeTemplates){const raw=String(r.image||'').split(/[?#]/)[0],q=old.get(raw)||canonical.get(raw);if(q){r.image=typeof photoDisplaySrc==='function'?photoDisplaySrc(q):q.src;r.imageAlt=q.alt}}
const P=registryState.prefectures||(registryState.prefectures=new Set(data.scope.prefectures)),cache=registryState.heroCache||(registryState.heroCache=new Map());
if(!registryState.heroWrapped&&typeof currentScopeHeroPlace==='function'&&typeof photoForArea==='function'){
 const eligible=()=>{if(typeof state==='undefined'||typeof samples==='undefined'||!P.has(state.pref))return null;let a=samples.filter(p=>p.pref===state.pref&&pb.get(Number(p.id))?.heroEligible&&photoForPlace(p));if(state.area&&state.area!=='전체')a=a.filter(p=>p.area===state.area);if(state.town&&state.town!=='전체')a=a.filter(p=>p.town===state.town);else{const m=typeof selectedMunicipality==='function'?selectedMunicipality(state.pref,state.area):null;if(m&&typeof placeInScope==='function')a=a.filter(p=>placeInScope(p))}return a};
 const orig=currentScopeHeroPlace;currentScopeHeroPlace=function(){if(typeof state==='undefined'||!P.has(state.pref))return orig?orig():null;const a=eligible()||[];if(!a.length)return null;if(a.length===1)return a[0];const k=[state.pref,state.area||'전체',state.town||'전체'].join('|'),id=cache.get(k),hit=a.find(p=>Number(p.id)===id);if(hit)return hit;const q=a[Math.floor(Math.random()*a.length)];cache.set(k,Number(q.id));return q};
 const opa=photoForArea;photoForArea=function(a){if(typeof state!=='undefined'&&P.has(state.pref)){const p=currentScopeHeroPlace();return p?photoForPlace(p):null}return opa?opa(a):null};
 registryState.heroWrapped=true;
}
globalThis.JATLAS_TOKAI_CANONICAL={placeByLegacy:pb,foodByPrefName:fb,heroCache:cache};if(typeof render==='function')render();
})();
