"use client";
import {useLayoutEffect,useRef} from "react";
import {featureTitleLines} from "@/lib/feature-title";

export default function FeatureTitle({title}:{title:string}){
 const ref=useRef<HTMLSpanElement>(null);
 const lines=featureTitleLines(title);
 useLayoutEffect(()=>{
  const element=ref.current;
  if(!element)return;
  let active=true;
  const fit=()=>{
   if(!active)return;
   const width=element.clientWidth;
   const naturalWidth=Math.max(...Array.from(element.children,child=>child.getBoundingClientRect().width));
   if(!width||!naturalWidth)return;
   const currentSize=parseFloat(getComputedStyle(element).fontSize);
   // Keep both ends inside the photo; only the lower edge is cropped.
   element.style.fontSize=`${currentSize*width*.99/naturalWidth}px`;
  };
  fit();
  const observer=new ResizeObserver(fit);
  if(element.parentElement)observer.observe(element.parentElement);
  void document.fonts.ready.then(fit);
  return()=>{active=false;observer.disconnect();};
 },[title]);
 return <span ref={ref} className="feature-title" aria-hidden="true">{lines.map(line=><span key={line} className="feature-title-line">{line}</span>)}</span>;
}
