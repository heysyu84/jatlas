import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source=await readFile(new URL("../components/weather-pill.tsx",import.meta.url),"utf8");
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
const MINUTE=60000;

// Run the actual component with controlled hooks, time, events and HTTP responses.
function setup({respectAbort=true}={}){
 let now=Date.UTC(2026,0,1),nextTimer=1,mounted=false,cursor=0,hooks=[],effects=[],props;
 const timers=new Map(),requests=[],documentEvents=new Map(),windowEvents=new Map();
 const eventTarget=listeners=>({
  addEventListener(name,fn){if(!listeners.has(name))listeners.set(name,new Set());listeners.get(name).add(fn);},
  removeEventListener(name,fn){listeners.get(name)?.delete(fn);}
 });
 const document={hidden:false,...eventTarget(documentEvents)};
 const window={...eventTarget(windowEvents),
  setTimeout(fn,delay){const id=nextTimer++;timers.set(id,{fn,at:now+delay,interval:0});return id;},
  clearTimeout(id){timers.delete(id);},
  setInterval(fn,delay){const id=nextTimer++;timers.set(id,{fn,at:now+delay,interval:delay});return id;},
  clearInterval(id){timers.delete(id);}
 };
 const react={
  useState(initial){
   const index=cursor++;hooks[index]??={value:initial};
   return [hooks[index].value,value=>{if(mounted)hooks[index].value=value;}];
  },
  useEffect(effect,deps){
   const index=cursor++,previous=hooks[index];
   if(!previous||deps.some((value,i)=>!Object.is(value,previous.deps[i]))){
    effects.push(()=>{previous?.cleanup?.();hooks[index]={deps,cleanup:effect()};});
   }
  }
 };
 const jsx=(type,props)=>({type,props});
 const icons=Object.fromEntries(["Cloud","Sun","CloudSun","CloudFog","CloudDrizzle","CloudRain","CloudLightning","Snowflake"].map(name=>[name,name]));
 const exported={};
 vm.runInNewContext(compiled,{
  exports:exported,
  require(name){if(name==="react")return react;if(name==="react/jsx-runtime")return {jsx,jsxs:jsx};if(name==="lucide-react")return icons;throw Error(name);},
  Date:class extends Date{static now(){return now;}},URLSearchParams,AbortController,document,window,
  fetch(url,options){
   let resolve,reject;
   const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});
   if(respectAbort)options.signal.addEventListener("abort",()=>reject(Error("aborted")),{once:true});
   requests.push({url,options,
    respond(current,status=200){resolve({ok:status>=200&&status<300,json:async()=>({current})});},
    fail(){reject(Error("network failure"));}
   });
   return promise;
  }
 });
 const render=()=>{
  cursor=0;effects=[];
  const node=exported.default(props);
  for(const effect of effects)effect();
  return node;
 };
 return {
  requests,document,timers,documentEvents,windowEvents,
  mount(overrides={}){assert.equal(mounted,false);mounted=true;hooks=[];props={lat:35.68,lon:139.76,label:"도쿄",lang:"ko",...overrides};return render();},
  update(overrides){props={...props,...overrides};return render();},
  unmount(){for(const hook of hooks)hook?.cleanup?.();mounted=false;hooks=[];},
  async flush(){for(let i=0;i<6;i++)await Promise.resolve();return mounted?render():null;},
  advance(duration){
   const target=now+duration;
   while(true){
    const due=[...timers].filter(([,timer])=>timer.at<=target).sort((a,b)=>a[1].at-b[1].at)[0];
    if(!due)break;
    const [id,timer]=due;now=timer.at;
    if(timer.interval)timer.at+=timer.interval;else timers.delete(id);
    timer.fn();
   }
   now=target;
  },
  emit(target,name){for(const fn of (target==="document"?documentEvents:windowEvents).get(name)??[])fn();}
 };
}
const weather=(code=0,temp=12.4)=>({weather_code:code,temperature_2m:temp,time:"2026-01-01T09:00"});
const description=node=>node.props.children.at(-1).props.children;
const icon=node=>node.props.children[0].type;
const temperature=node=>node.props.children[2].props.children[0];

test("fog, snow showers and thunderstorms have distinct labels and icons in both languages",async()=>{
 for(const [codes,expectedIcon,ko,ja] of [
  [[45,48],"CloudFog","안개","霧"],
  [[85,86],"Snowflake","소낙눈","にわか雪"],
  [[95,97],"CloudLightning","뇌우","雷雨"],
  [[96,99],"CloudLightning","뇌우·우박","雷雨・ひょう"]
 ])for(const code of codes){
  const app=setup();app.mount();app.requests[0].respond(weather(code));
  const korean=await app.flush();assert.equal(description(korean),ko);assert.equal(icon(korean),expectedIcon);
  const japanese=app.update({lang:"ja"});assert.equal(description(japanese),ja);assert.equal(icon(japanese),expectedIcon);
  assert.equal(app.requests.length,1);app.unmount();
 }
});

test("ordinary rain and snow stay accurate, and an unknown code is not labelled as rain",async()=>{
 for(const [code,text,expectedIcon] of [[0,"맑음","Sun"],[3,"흐림","Cloud"],[61,"비","CloudRain"],[73,"눈","Snowflake"],[123,"날씨","Cloud"]]){
  const app=setup();app.mount();app.requests[0].respond(weather(code));const node=await app.flush();
  assert.equal(description(node),text);assert.equal(icon(node),expectedIcon);app.unmount();
 }
});

test("an open page reuses fresh weather and fetches again after 15 minutes",async()=>{
 const app=setup();app.mount();app.requests[0].respond(weather());await app.flush();
 app.advance(14*MINUTE);await app.flush();assert.equal(app.requests.length,1);
 app.advance(MINUTE);assert.equal(app.requests.length,2);
 assert.equal(app.requests[1].options.cache,"no-store");
 app.requests[1].respond(weather(61,20.6));const node=await app.flush();
 assert.equal(temperature(node),21);assert.equal(description(node),"비");app.unmount();
});

test("remounts use the cache only while it is fresh",async()=>{
 const app=setup();app.mount();app.requests[0].respond(weather());await app.flush();app.unmount();
 app.advance(5*MINUTE);app.mount();assert.equal(temperature(await app.flush()),12);assert.equal(app.requests.length,1);app.unmount();
 app.advance(10*MINUTE);app.mount();assert.equal(app.requests.length,2);assert.equal(await app.flush(),null);
 app.requests[1].respond(weather(45,9));assert.equal(temperature(await app.flush()),9);app.unmount();
});

test("a hidden tab waits until it is visible and does not overlap requests",async()=>{
 const app=setup();app.mount();app.requests[0].respond(weather());await app.flush();
 app.document.hidden=true;app.advance(16*MINUTE);await app.flush();assert.equal(app.requests.length,1);
 app.document.hidden=false;app.emit("document","visibilitychange");app.emit("window","focus");
 assert.equal(app.requests.length,2);app.requests[1].respond(weather(85,2));
 assert.equal(description(await app.flush()),"소낙눈");app.unmount();
});

test("place changes abort the previous request and ignore its late response",async()=>{
 const app=setup({respectAbort:false});app.mount();
 app.update({lat:43.06,lon:141.35,label:"삿포로"});assert.equal(app.requests[0].options.signal.aborted,true);assert.equal(app.requests.length,2);
 app.requests[1].respond(weather(73,-4));assert.equal(temperature(await app.flush()),-4);
 app.requests[0].respond(weather(0,20));const node=await app.flush();assert.equal(temperature(node),-4);assert.equal(description(node),"눈");app.unmount();
});

test("failed refreshes hide stale weather and retry on the next check",async()=>{
 const app=setup();app.mount();app.requests[0].respond(weather());await app.flush();
 app.advance(15*MINUTE);app.requests[1].fail();assert.equal(await app.flush(),null);
 app.advance(MINUTE);assert.equal(app.requests.length,3);app.requests[2].respond(weather(45,8));
 assert.equal(description(await app.flush()),"안개");app.unmount();
});

test("timeouts and invalid responses do not leave the widget stuck",async()=>{
 const app=setup();app.mount();app.advance(10000);
 assert.equal(app.requests[0].options.signal.aborted,true);assert.equal(await app.flush(),null);
 app.advance(50000);app.requests[1].respond({...weather(),weather_code:"45"});assert.equal(await app.flush(),null);
 app.advance(MINUTE);app.requests[2].respond(weather());assert.equal(temperature(await app.flush()),12);app.unmount();
});

test("unmounting removes timers and resume listeners and aborts pending HTTP",async()=>{
 const app=setup();app.mount();app.unmount();await app.flush();
 assert.equal(app.requests[0].options.signal.aborted,true);assert.equal(app.timers.size,0);
 assert.equal([...app.documentEvents.values()].reduce((n,list)=>n+list.size,0),0);
 assert.equal([...app.windowEvents.values()].reduce((n,list)=>n+list.size,0),0);
 app.advance(20*MINUTE);app.emit("window","focus");assert.equal(app.requests.length,1);
});
