"use client";

import {useEffect,useRef,type ReactNode} from "react";

/** Native scrolling drives the cover; the catalogue does not rerender per frame. */
export default function IntroJourney({children,onComplete,canComplete=true}:{children:ReactNode;onComplete:()=>void;canComplete?:boolean}){
 const rootRef=useRef<HTMLDivElement>(null);
 const completionRef=useRef({onComplete,canComplete});
 useEffect(()=>{completionRef.current={onComplete,canComplete};},[onComplete,canComplete]);

 useEffect(()=>{
  const root=rootRef.current;
  if(!root)return;
  const track=root.querySelector<HTMLElement>(".intro-scroll-track");
  const cover=root.querySelector<HTMLElement>(".intro-hero");
  if(!track||!cover)return;
  const preference=window.matchMedia("(prefers-reduced-motion: reduce)");
  const content=root.querySelectorAll<HTMLElement>(".intro-content,.intro-bottom");
  const reveals=root.querySelectorAll<HTMLElement>("[data-reveal]");
  let frame=0;
  let completionTimer=0;
  let lastScroll=Math.max(0,window.scrollY);
  let hasScrolled=false;
  let observer:IntersectionObserver|undefined;
  let sizeObserver:ResizeObserver|undefined;

  const atEnd=()=>{
   const bottom=(document.scrollingElement?.scrollHeight||document.documentElement.scrollHeight)-window.innerHeight;
   return bottom>48&&window.scrollY>=bottom-4;
  };
  const cancelCompletion=()=>{
   clearTimeout(completionTimer);
   completionTimer=0;
   root.classList.remove("is-completing");
  };
  const completeIfReady=()=>{
   if(!hasScrolled||!atEnd()||!completionRef.current.canComplete||completionTimer)return;
   root.classList.add("is-completing");
   completionTimer=window.setTimeout(()=>{
    completionTimer=0;
    if(atEnd()&&completionRef.current.canComplete)completionRef.current.onComplete();
    else root.classList.remove("is-completing");
   },preference.matches?0:320);
  };
  const onScroll=()=>{
   schedule();
   const current=Math.max(0,window.scrollY);
   const movingDown=current>lastScroll+.5;
   if(movingDown)hasScrolled=true;
   if(current<lastScroll-.5||!atEnd())cancelCompletion();
   lastScroll=current;
   // Entry is driven by a downward scroll, never by mounting or resizing.
   if(movingDown)completeIfReady();
  };
  const onWheel=(event:WheelEvent)=>{
   if(event.deltaY<0){cancelCompletion();hasScrolled=false;}
   else if(event.deltaY>0){hasScrolled=true;completeIfReady();}
  };

  const paint=()=>{
   frame=0;
   // Fonts and lazy images can change the final scroll height after input.
   completeIfReady();
   if(preference.matches)return;
   const rect=track.getBoundingClientRect();
   const stickyTop=parseFloat(getComputedStyle(cover).top)||0;
   const gutter=parseFloat(getComputedStyle(cover).marginTop)||0;
   const travel=Math.max(1,track.offsetHeight-cover.offsetHeight-gutter);
   const progress=Math.min(1,Math.max(0,(stickyTop-gutter-rect.top)/travel));
   root.style.setProperty("--intro-progress",progress.toFixed(4));
   content.forEach(block=>{
    // A focused control stays available; scrolling back restores every control.
    const fadedAt=block.classList.contains("intro-content")?.9:.84;
    block.inert=progress>fadedAt&&!block.contains(document.activeElement);
   });
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(paint);};
  const configure=()=>{
   observer?.disconnect();
   if(preference.matches){
    delete root.dataset.motion;
    root.style.removeProperty("--intro-progress");
    content.forEach(block=>{block.inert=false;});
    return;
   }
   root.dataset.motion="ready";
   if("IntersectionObserver" in window){
    observer=new IntersectionObserver(entries=>{
     entries.forEach(entry=>{
      if(entry.isIntersecting){
       entry.target.classList.add("is-visible");
       observer?.unobserve(entry.target);
      }
     });
    },{threshold:.12,rootMargin:"0px 0px -5% 0px"});
    reveals.forEach(element=>observer?.observe(element));
   }else reveals.forEach(element=>element.classList.add("is-visible"));
   schedule();
  };
  configure();
  if("ResizeObserver" in window){sizeObserver=new ResizeObserver(schedule);sizeObserver.observe(root);}
  window.addEventListener("scroll",onScroll,{passive:true});
  window.addEventListener("wheel",onWheel,{passive:true});
  window.addEventListener("resize",schedule);
  root.addEventListener("focusin",schedule);
  preference.addEventListener("change",configure);
  return()=>{
   cancelAnimationFrame(frame);
   cancelCompletion();
   observer?.disconnect();
   sizeObserver?.disconnect();
   window.removeEventListener("scroll",onScroll);
   window.removeEventListener("wheel",onWheel);
   window.removeEventListener("resize",schedule);
   root.removeEventListener("focusin",schedule);
   preference.removeEventListener("change",configure);
  };
 },[]);

 return <div ref={rootRef} className="intro-journey">{children}</div>;
}
