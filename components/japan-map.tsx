"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import {Compass,Plus,Minus,RotateCcw,MapPin,X,ArrowUpRight} from "lucide-react";
import type {Catalog,Geography,Place} from "@/lib/jatlas";
import {mercator} from "@/lib/jatlas";

type Box={x:number;y:number;w:number;h:number};
const centers:Record<string,[number,number]>={"홋카이도":[142.4,43.45],"도호쿠":[140.55,39.4],"북간토":[139.9,36.6],"수도권":[140.0,35.4],"고신에쓰":[138.35,37.2],"도카이":[137.35,34.7],"호쿠리쿠":[136.45,36.75],"긴키":[135.45,34.5],"산인·산요":[132.5,34.9],"시코쿠":[133.25,33.3],"규슈":[130.5,32.4]};
const labelOffsets:Record<string,[number,number]>={"홋카이도":[0,0],"도호쿠":[25,0],"북간토":[55,-14],"수도권":[36,17],"고신에쓰":[-10,-30],"도카이":[32,30],"호쿠리쿠":[-58,-8],"긴키":[-12,31],"산인·산요":[-42,-20],"시코쿠":[-12,46],"규슈":[-26,12]};
function bounds(points:[number,number][],ratio=1.28):Box {
 const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
 let w=Math.max(2,Math.max(...xs)-Math.min(...xs))*1.22,h=Math.max(2,Math.max(...ys)-Math.min(...ys))*1.22;
 const cx=(Math.min(...xs)+Math.max(...xs))/2,cy=(Math.min(...ys)+Math.max(...ys))/2;
 if(w/h<ratio)w=h*ratio;else h=w/ratio;
 return {x:cx-w/2,y:cy-h/2,w,h};
}
function pathFor(f:Geography){return f.rings.map(r=>r.map((p,i)=>(i?"L":"M")+mercator(p).map(n=>n.toFixed(3)).join(",")).join("")+"Z").join("");}
function centerFor(f:Geography):[number,number]{const ring=[...f.rings].sort((a,b)=>b.length-a.length)[0]||[];const b=bounds(ring.map(p=>mercator(p)));return[b.x+b.w/2,b.y+b.h/2];}
export default function JapanMap({catalog,places,region,pref,lang,selected,onPref,onRegion,onPlace,onClearPlace}:{catalog:Catalog;places:Place[];region:string;pref:string;lang:string;selected?:string;onPref:(s:string)=>void;onRegion:(s:string)=>void;onPlace:(p:Place)=>void;onClearPlace:()=>void}){
 const [geo,setGeo]=useState<Geography[]>([]),[failed,setFailed]=useState(false),[box,setBox]=useState<Box>({x:1525,y:-630,w:245,h:191});
 const [ratio,setRatio]=useState(1.28);const host=useRef<HTMLDivElement>(null),svg=useRef<SVGSVGElement>(null);
 const [clusterIds,setClusterIds]=useState<string[]>([]);
 const pointer=useRef<{x:number;y:number;box:Box;dragged:boolean}|null>(null);
 const fingers=useRef(new Map<number,[number,number]>()),pinch=useRef<{distance:number;box:Box}|null>(null);
 const ko=lang==="ko";
 useEffect(()=>{let active=true;fetch("./data/geography.json").then(r=>{if(!r.ok)throw Error();return r.json();}).then(g=>active&&setGeo(g as Geography[])).catch(()=>active&&setFailed(true));return()=>{active=false;};},[]);
 useEffect(()=>{if(!host.current)return;const o=new ResizeObserver(entries=>{const r=entries[0]?.contentRect;if(r?.width&&r?.height)setRatio(r.width/r.height);});o.observe(host.current);return()=>o.disconnect();},[]);
 const shapes=useMemo(()=>geo.map(f=>({...f,path:pathFor(f)})),[geo]);
 const mainland=useMemo(()=>geo.filter(f=>f.id!==47).map(f=>({...f,rings:f.rings.filter(r=>r.some(p=>p[1]>=(f.id===13?35:30.8)))})),[geo]);
 const fit=useMemo(()=>{
  let use=(pref==="오키나와"||region==="오키나와")?geo.filter(f=>f.id===47):mainland;
  if(pref)use=use.filter(f=>f.name===pref);else if(region){const r=catalog.regions.find(r=>r.name===region);use=use.filter(f=>r?.prefs.includes(f.name));}
  const points=use.flatMap(f=>f.rings.flat().map(p=>mercator(p)));
  return points.length?bounds(points,ratio):{x:1525,y:-630,w:245,h:191};
 },[mainland,geo,catalog.regions,region,pref,ratio]);
 // Only geography changes the frame. Selecting a marker never changes the view.
 useEffect(()=>{setBox(fit);setClusterIds([]);},[fit]);
 useEffect(()=>{if(selected)setClusterIds([]);},[selected]);
 const coords=useMemo(()=>places.filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lon)).map(p=>({p,pos:mercator([p.lon,p.lat])})),[places]);
 const groups=useMemo(()=>{
  if(!pref&&!region&&places.length===catalog.places.length)return [];
  const cell=box.w/(host.current?.clientWidth||750)*30;const grid=new Map<string,{pos:[number,number];items:Place[]}>();
  for(const {p,pos} of coords){if(pos[0]<box.x||pos[0]>box.x+box.w||pos[1]<box.y||pos[1]>box.y+box.h)continue;const key=Math.floor(pos[0]/cell)+":"+Math.floor(pos[1]/cell);const g=grid.get(key);if(g)g.items.push(p);else grid.set(key,{pos,items:[p]});}
  return [...grid.values()].map(g=>({...g,pos:[g.items.reduce((s,p)=>s+mercator([p.lon,p.lat])[0],0)/g.items.length,g.items.reduce((s,p)=>s+mercator([p.lon,p.lat])[1],0)/g.items.length] as [number,number]}));
 },[coords,box,pref,region,places.length,catalog.places.length]);
 function zoom(factor:number,cx=box.x+box.w/2,cy=box.y+box.h/2){setBox(b=>{const w=Math.min(fit.w*1.5,Math.max(fit.w/2.5,b.w*factor)),h=w/ratio;return {x:cx-(cx-b.x)*(w/b.w),y:cy-(cy-b.y)*(h/b.h),w,h};});}
 const unit=box.w/(host.current?.clientWidth||750);
 const oki=shapes.find(f=>f.id===47);
 const okiBox=useMemo(()=>oki?bounds(oki.rings.flat().map(p=>mercator(p)),1.55):fit,[oki,fit]);
 const longLabel=(name:string)=>catalog.regions.find(r=>r.name===name)?.ja||catalog.prefs.find(p=>p.name===name)?.ja||catalog.dict[name]||name;
 const label=(s:string)=>ko?s:longLabel(s);
 const inScope=(f:Geography)=>pref?f.name===pref:region?catalog.regions.find(r=>r.name===region)?.prefs.includes(f.name):true;
 const cluster=useMemo(()=>places.filter(p=>clusterIds.includes(p.id)),[places,clusterIds]);
 const chooseGroup=(items:Place[])=>{if(items.length===1){setClusterIds([]);onPlace(items[0]);}else{onClearPlace();setClusterIds(items.map(p=>p.id));}};
 const townLabels=useMemo(()=>{if(!pref)return[];const towns=new Map<string,{lon:number;lat:number;count:number}>();for(const p of catalog.places.filter(p=>p.pref===pref)){const t=towns.get(p.town)||{lon:0,lat:0,count:0};t.lon+=p.lon;t.lat+=p.lat;t.count++;towns.set(p.town,t);}return[...towns].sort((a,b)=>b[1].count-a[1].count).slice(0,6).map(([town,t])=>({town,pos:mercator([t.lon/t.count,t.lat/t.count])}));},[pref,catalog.places]);
 const overviewShapes=useMemo(()=>[...mainland,...geo.filter(f=>f.id===47)].map(f=>({...f,path:pathFor(f)})),[mainland,geo]);
 const overviewBox=useMemo(()=>overviewShapes.length?bounds(overviewShapes.flatMap(f=>f.rings.flat().map(p=>mercator(p))),.88):fit,[overviewShapes,fit]);
 return <div ref={host} className="map-canvas">
  {failed?<div className="map-failure"><MapPin/><p>{ko?"지도를 불러오지 못했습니다.":"地図を読み込めませんでした。"}</p><button onClick={()=>window.location.reload()}>{ko?"다시 불러오기":"再読み込み"}</button></div>:null}
  <div className="map-direction"><Compass size={20}/><span>N</span></div>
  <svg ref={svg} className="japan-svg" viewBox={[box.x,box.y,box.w,box.h].join(" ")} aria-label={ko?"일본 지역 지도":"日本の地域地図"} role="group" tabIndex={0}
   onKeyDown={e=>{if(e.key==="+"){e.preventDefault();zoom(.75);}if(e.key==="-"){e.preventDefault();zoom(1.3);}if(e.key==="Home"){e.preventDefault();setBox(fit);}}}
   onPointerDown={e=>{
    fingers.current.set(e.pointerId,[e.clientX,e.clientY]);
    if(fingers.current.size===2){const ps=[...fingers.current.values()];pinch.current={distance:Math.hypot(ps[0][0]-ps[1][0],ps[0][1]-ps[1][1]),box};pointer.current=null;}
    else pointer.current={x:e.clientX,y:e.clientY,box,dragged:false};
   }}
   onPointerMove={e=>{
    if(!fingers.current.has(e.pointerId))return;fingers.current.set(e.pointerId,[e.clientX,e.clientY]);
    if(pinch.current&&fingers.current.size===2){const ps=[...fingers.current.values()],d=Math.hypot(ps[0][0]-ps[1][0],ps[0][1]-ps[1][1]);const start=pinch.current,w=Math.min(fit.w*1.5,Math.max(fit.w/2.5,start.box.w*start.distance/Math.max(1,d))),h=w/ratio;setBox({x:start.box.x+(start.box.w-w)/2,y:start.box.y+(start.box.h-h)/2,w,h});return;}
    const p=pointer.current,r=svg.current?.getBoundingClientRect();if(!p||!r)return;
    if(Math.hypot(e.clientX-p.x,e.clientY-p.y)>5)p.dragged=true;
    if(p.dragged){e.currentTarget.setPointerCapture(e.pointerId);setBox({...p.box,x:p.box.x-(e.clientX-p.x)*p.box.w/r.width,y:p.box.y-(e.clientY-p.y)*p.box.h/r.height});}
   }}
   onPointerUp={e=>{fingers.current.delete(e.pointerId);pinch.current=null;if(pointer.current?.dragged){setTimeout(()=>{pointer.current=null;},0);}else pointer.current=null;}}
   onPointerCancel={()=>{fingers.current.clear();pointer.current=null;pinch.current=null;}}
  >
   <g>
   {shapes.filter(f=>f.id!==47||region==="오키나와"||pref==="오키나와").map(f=>{
     const inScope=pref?f.name===pref:region?catalog.regions.find(r=>r.name===region)?.prefs.includes(f.name):true;
     return <path key={f.id} d={f.path} className={"prefecture-shape"+(inScope?" in-scope":"")+(f.name===pref?" selected":"")}
      strokeWidth={unit*.8} role="button" tabIndex={0} aria-label={ko?f.name:longLabel(f.name)}
      onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();onPref(f.name);}}}
      onClick={e=>{e.stopPropagation();if(pointer.current?.dragged)return;if(!region&&!pref){onRegion(catalog.prefs.find(p=>p.name===f.name)?.region||"");}else onPref(f.name);}}>
       <title>{ko?f.name:longLabel(f.name)}</title>
     </path>;
   })}
   </g>
   {!region&&!pref&&!groups.length?Object.entries(centers).map(([name,coord])=>{
    const origin=mercator(coord),text=ko?name:longLabel(name),w=(text.length*12+24)*unit;
    const [dx,dy]=labelOffsets[name],pos:[number,number]=[Math.max(box.x+w/2+8*unit,Math.min(box.x+box.w-w/2-8*unit,origin[0]+dx*unit)),Math.max(box.y+22*unit,Math.min(box.y+box.h-34*unit,origin[1]+dy*unit))];
    return <g key={name} className="region-map-label" transform={"translate("+pos.join(",")+")"} role="button" tabIndex={0} aria-label={text}
     onClick={e=>{e.stopPropagation();if(!pointer.current?.dragged)onRegion(name);}} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();onRegion(name);}}}>
      {dx||dy?<line x1={origin[0]-pos[0]} y1={origin[1]-pos[1]} x2={0} y2={0} stroke="var(--land-line)" strokeWidth={unit} opacity=".7"/>:null}
      <rect x={-w/2} y={-14*unit} width={w} height={28*unit} rx={14*unit}/>
      <text fontSize={12*unit} textAnchor="middle" dominantBaseline="central">{text}</text>
    </g>;
   }):null}
   {region&&!pref?mainland.filter(inScope).map(f=><text key={f.id} className="pref-map-label" x={centerFor(f)[0]} y={centerFor(f)[1]} fontSize={13*unit} strokeWidth={4*unit} textAnchor="middle">{label(f.name)}</text>):null}
   {townLabels.map(t=><text key={t.town} className="town-map-label" x={t.pos[0]} y={t.pos[1]-18*unit} fontSize={11*unit} strokeWidth={3*unit} textAnchor="middle">{label(t.town)}</text>)}
   {groups.map(g=>{const active=(g.items.length===1&&g.items[0].id===selected)||g.items.some(p=>clusterIds.includes(p.id));return <g key={g.items.map(p=>p.id).join(",")} className={"map-dot"+(active?" active":"")} transform={"translate("+g.pos.join(",")+")"} role="button" tabIndex={0}
    aria-label={g.items.length===1?(ko?g.items[0].name:g.items[0].ja.name):g.items.length+(ko?"곳의 주변 장소":"か所の周辺の場所")} aria-pressed={active}
    onClick={e=>{e.stopPropagation();if(!pointer.current?.dragged)chooseGroup(g.items);}}
    onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();chooseGroup(g.items);}}}>
     <circle r={(g.items.length>1?13:8)*unit} strokeWidth={2*unit}/>
     {g.items.length>1?<text fontSize={12*unit} textAnchor="middle" dominantBaseline="central">{g.items.length}</text>:<circle r={2.5*unit} className="dot-center"/>}
     {g.items.length===1?<text className="map-marker-name" y={-17*unit} fontSize={12*unit} strokeWidth={4*unit} textAnchor="middle">{ko?g.items[0].name:g.items[0].ja.name}</text>:null}
     <title>{g.items.map(p=>ko?p.name:p.ja.name).join(" · ")}</title>
    </g>;})}
   {selected&&groups.some(g=>g.items.length>1&&g.items.some(p=>p.id===selected))?coords.filter(c=>c.p.id===selected).map(c=><g key={c.p.id} className="map-selected-point" transform={"translate("+c.pos.join(",")+")"} aria-hidden="true"><circle r={8*unit} strokeWidth={2*unit}/><text y={-18*unit} fontSize={12*unit} strokeWidth={4*unit} textAnchor="middle">{ko?c.p.name:c.p.ja.name}</text></g>):null}
  </svg>
  {!region&&!pref&&oki?<button className="okinawa-inset" onClick={()=>onRegion("오키나와")} aria-label={ko?"오키나와 선택":"沖縄を選ぶ"}>
   <span>{ko?"오키나와":"沖縄"}</span>
   <svg viewBox={[okiBox.x,okiBox.y,okiBox.w,okiBox.h].join(" ")} aria-hidden="true"><path d={oki.path} fill="currentColor"/></svg>
  </button>:null}
  {region||pref?<button className="map-overview" onClick={()=>onRegion("")} aria-label={ko?"일본 전국 지도로 돌아가기":"日本全国の地図に戻る"}><span>{ko?"일본에서의 위치":"日本の中での位置"}</span><svg viewBox={[overviewBox.x,overviewBox.y,overviewBox.w,overviewBox.h].join(" ")} aria-hidden="true">{overviewShapes.map(f=><path key={f.id} d={f.path} className={inScope(f)?"overview-selected":""}/>)}<circle cx={fit.x+fit.w/2} cy={fit.y+fit.h/2} r={overviewBox.w/35} fill="#dd513f" stroke="var(--card)" strokeWidth={overviewBox.w/100}/></svg><small>{ko?"전국 보기":"全国を表示"}<ArrowUpRight size={12}/></small></button>:null}
  {cluster.length>1?<aside className="map-cluster" aria-label={ko?"이 주변의 장소":"この周辺の場所"}><header><div><span>{ko?"이 주변에서":"この周辺で"}</span><h2>{cluster.length}{ko?"곳의 발견":"か所の出会い"}</h2></div><button onClick={()=>setClusterIds([])} aria-label={ko?"주변 장소 목록 닫기":"周辺の場所一覧を閉じる"}><X size={17}/></button></header><div className="map-cluster-list">{cluster.map(p=><button key={p.id} onClick={()=>{setClusterIds([]);onPlace(p);}}><strong>{ko?p.name:p.ja.name}</strong><small>{label(p.pref)} · {label(p.town)}</small><ArrowUpRight size={15}/></button>)}</div></aside>:null}
  <div className="map-legend"><i/>{ko?"장소":"場所"}<span className="map-legend-cluster">3</span>{ko?"주변 장소 모음":"周辺の場所"}</div>
  <div className="map-controls">
   <button onClick={()=>zoom(.8)} aria-label={ko?"지도 확대":"拡大"} disabled={box.w<=fit.w/2.5+.001}><Plus size={18}/></button>
   <button onClick={()=>zoom(1.25)} aria-label={ko?"지도 축소":"縮小"} disabled={box.w>=fit.w*1.5-.001}><Minus size={18}/></button>
   <button onClick={()=>setBox(fit)} aria-label={ko?"현재 지역 지도 맞추기":"現在のエリアを表示"}><RotateCcw size={16}/></button>
  </div>
  <a className="map-credit" href="https://github.com/dataofjapan/land" target="_blank" rel="noreferrer">dataofjapan · {ko?"지구지도 일본":"地球地図日本"}</a>
 </div>;
}
