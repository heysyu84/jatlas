'use strict';

process.argv[2]='/tmp/jatlas-runtime.json';
const {result}=require('./audit-content.cjs');

const norm=s=>String(s||'')
  .normalize('NFKC')
  .toLowerCase()
  .replace(/[\s·・･\-–—_\/().（）【】「」『』［］\[\],，、:：'"]/g,'');

const bigrams=s=>{
  const n=norm(s), out=new Set();
  for(let i=0;i<n.length-1;i++) out.add(n.slice(i,i+2));
  return out;
};
const similarity=(a,b)=>{
  const A=bigrams(a),B=bigrams(b);
  if(!A.size||!B.size)return 0;
  let inter=0; for(const x of A)if(B.has(x))inter++;
  return (2*inter)/(A.size+B.size);
};
const distMeters=(a,b)=>{
  if(!Number.isFinite(a?.lat)||!Number.isFinite(a?.lon)||!Number.isFinite(b?.lat)||!Number.isFinite(b?.lon))return Infinity;
  const R=6371000, toRad=x=>x*Math.PI/180;
  const p1=toRad(a.lat),p2=toRad(b.lat),dp=toRad(b.lat-a.lat),dl=toRad(b.lon-a.lon);
  const h=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;
  return 2*R*Math.asin(Math.min(1,Math.sqrt(h)));
};

const places=result.places||[];
const exactNameMap=new Map(), mapQueryMap=new Map();
for(const p of places){
  const nk=p.pref+'|'+norm(p.name);
  if(norm(p.name)){
    if(!exactNameMap.has(nk)) exactNameMap.set(nk,[]);
    exactNameMap.get(nk).push(p);
  }
  const mq=norm(p.mapQuery||p.mapUrl||'');
  if(mq){
    const mk=p.pref+'|'+mq;
    if(!mapQueryMap.has(mk)) mapQueryMap.set(mk,[]);
    mapQueryMap.get(mk).push(p);
  }
}
const pack=arr=>arr.map(p=>({id:p.id,pref:p.pref,area:p.area,town:p.town,name:p.name,mapQuery:p.mapQuery||'',lat:p.lat??null,lon:p.lon??null}));
const exactName=[...exactNameMap.values()].filter(a=>new Set(a.map(x=>x.id)).size>1).map(pack);
const exactMap=[...mapQueryMap.values()].filter(a=>new Set(a.map(x=>x.id)).size>1).map(pack);

const near=[];
const byPref=new Map();
for(const p of places){if(!byPref.has(p.pref))byPref.set(p.pref,[]);byPref.get(p.pref).push(p)}
for(const [pref,arr] of byPref){
  for(let i=0;i<arr.length;i++)for(let j=i+1;j<arr.length;j++){
    const a=arr[i],b=arr[j];
    if(a.id===b.id)continue;
    const d=distMeters(a,b);
    if(d>180)continue;
    const na=norm(a.name),nb=norm(b.name);
    const sim=similarity(a.name,b.name);
    const contained=na&&nb&&(na.includes(nb)||nb.includes(na));
    if(sim>=0.42||contained){
      near.push({distanceM:Math.round(d),similarity:Number(sim.toFixed(2)),a:pack([a])[0],b:pack([b])[0]});
    }
  }
}
const sig=x=>x.map(p=>p.id).sort((a,b)=>a-b).join(',');
const exactNameSigs=new Set(exactName.map(sig));
const filteredExactMap=exactMap.filter(g=>!exactNameSigs.has(sig(g)));
const exactMapSigs=new Set(filteredExactMap.map(sig));
const filteredNear=near.filter(x=>{
  const s=[x.a.id,x.b.id].sort((a,b)=>a-b).join(',');
  return !exactNameSigs.has(s)&&!exactMapSigs.has(s);
});
const fuzzyNameCandidates=[];
for(const [pref,arr] of byPref){
  for(let i=0;i<arr.length;i++)for(let j=i+1;j<arr.length;j++){
    const a=arr[i],b=arr[j];
    if(a.id===b.id)continue;
    const na=norm(a.name),nb=norm(b.name);
    if(Math.min(na.length,nb.length)<4)continue;
    const sim=similarity(a.name,b.name);
    const contained=na.includes(nb)||nb.includes(na);
    if(sim>=0.72||contained){
      const pair=[a.id,b.id].sort((x,y)=>x-y).join(',');
      if(exactNameSigs.has(pair)||exactMapSigs.has(pair))continue;
      fuzzyNameCandidates.push({similarity:Number(sim.toFixed(2)),contained,a:pack([a])[0],b:pack([b])[0]});
    }
  }
}
const report={
  generatedAt:new Date().toISOString(),
  placeCount:places.length,
  exactNameGroups:exactName,
  exactMapQueryGroups:filteredExactMap,
  nearCoordinateCandidates:filteredNear,
  fuzzyNameCandidates,
  shizuokaPlaces:pack(places.filter(p=>p.pref==='시즈오카'))
};
require('node:fs').writeFileSync('/tmp/duplicate-place-report.json',JSON.stringify(report,null,2)+'\n');
console.log('DUPLICATE_PLACE_REPORT_BEGIN');
console.log(JSON.stringify(report));
console.log('DUPLICATE_PLACE_REPORT_END');
