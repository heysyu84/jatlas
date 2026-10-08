"use client";

import {ArrowLeft,ChevronRight,Globe2} from "lucide-react";

type Props={region:string;pref:string;area:string;town:string;lang:string;name:(s:string)=>string;onClear:()=>void;onRegion:(s:string)=>void;onPref:(s:string)=>void;onArea:(s:string)=>void;onTown:(s:string)=>void;className?:string};

export default function ScopeNavigation({region,pref,area,town,lang,name,onClear,onRegion,onPref,onArea,onTown,className=""}:Props){
 const ko=lang==="ko";
 const steps=[
  {label:ko?"일본 전국":"日本全国",action:onClear,active:!region&&!pref},
  ...(region?[{label:name(region),action:()=>onRegion(region),active:!pref}]:[]),
  ...(pref?[{label:name(pref),action:()=>onPref(pref),active:!area&&!town}]:[]),
  ...(area?[{label:name(area),action:()=>{onArea(area);onTown("");},active:!town}]:[]),
  ...(town?[{label:name(town),action:()=>onTown(town),active:true}]:[])
 ];
 const back=()=>{if(town)onTown("");else if(area)onArea("");else if(pref)onRegion(region);else onClear();};
 return <nav className={"scope-navigation "+className} aria-label={ko?"여행 지역 이동":"旅のエリアを移動"}>
  <div className="scope-trail">{steps.map((step,i)=><span key={i}>
   {i?<ChevronRight size={13} aria-hidden="true"/>:<Globe2 size={14} aria-hidden="true"/>}
   <button onClick={step.action} aria-current={step.active?"location":undefined}>{step.label}</button>
  </span>)}</div>
  {region||pref||area||town?<button className="scope-back" onClick={back} aria-label={ko?"이전 단계":"前のエリア"}><ArrowLeft size={14}/><span>{ko?"이전 단계":"前のエリア"}</span></button>:null}
 </nav>;
}
