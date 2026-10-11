"use client";
import {useEffect,useState} from "react";
import {Cloud,Sun,CloudSun,CloudFog,CloudDrizzle,CloudRain,CloudLightning,Snowflake} from "lucide-react";
type Weather={temp:number;code:number;time:string};
const CACHE_TTL=15*60*1000;
const cache=new Map<string,{value:Weather;fetchedAt:number}>();
function condition(code:number){
 if(code===0||code===1)return {Icon:Sun,ko:"맑음",ja:"晴れ"};
 if(code===2)return {Icon:CloudSun,ko:"구름 조금",ja:"晴れ時々曇り"};
 if(code===3)return {Icon:Cloud,ko:"흐림",ja:"曇り"};
 if(code===45||code===48)return {Icon:CloudFog,ko:"안개",ja:"霧"};
 if([51,53,55].includes(code))return {Icon:CloudDrizzle,ko:"이슬비",ja:"霧雨"};
 if(code===56||code===57)return {Icon:CloudDrizzle,ko:"어는 이슬비",ja:"着氷性の霧雨"};
 if([61,63,65].includes(code))return {Icon:CloudRain,ko:"비",ja:"雨"};
 if(code===66||code===67)return {Icon:CloudRain,ko:"어는 비",ja:"着氷性の雨"};
 if([71,73,75,77].includes(code))return {Icon:Snowflake,ko:"눈",ja:"雪"};
 if([80,81,82].includes(code))return {Icon:CloudRain,ko:"소나기",ja:"にわか雨"};
 if(code===85||code===86)return {Icon:Snowflake,ko:"소낙눈",ja:"にわか雪"};
 if(code===95||code===97)return {Icon:CloudLightning,ko:"뇌우",ja:"雷雨"};
 if(code===96||code===99)return {Icon:CloudLightning,ko:"뇌우·우박",ja:"雷雨・ひょう"};
 return {Icon:Cloud,ko:"날씨",ja:"天気"};
}
export default function WeatherPill({lat,lon,label,lang}:{lat:number;lon:number;label:string;lang:string}){
 const [value,setValue]=useState<Weather|null>(null);
 useEffect(()=>{
  setValue(null);if(!Number.isFinite(lat)||!Number.isFinite(lon))return;
  const key=lat.toFixed(2)+":"+lon.toFixed(2);
  const q=new URLSearchParams({latitude:String(lat),longitude:String(lon),current:"temperature_2m,weather_code",timezone:"Asia/Tokyo"});
  let active=true,pending:AbortController|null=null;
  const refresh=async()=>{
   if(!active||document.hidden)return;
   const cached=cache.get(key),age=cached?Date.now()-cached.fetchedAt:Infinity;
   if(cached&&age>=0&&age<CACHE_TTL){setValue(cached.value);return;}
   if(pending)return;
   const abort=new AbortController();pending=abort;
   const timeout=window.setTimeout(()=>abort.abort(),10000);
   try{
    const r=await fetch("https://api.open-meteo.com/v1/forecast?"+q,{signal:abort.signal,cache:"no-store"});
    if(!r.ok)throw Error();
    const raw=await r.json() as {current?:{temperature_2m:number;weather_code:number;time:string}},d=raw.current;
    if(!d||!Number.isFinite(d.temperature_2m)||!Number.isInteger(d.weather_code)||typeof d.time!=="string")throw Error();
    if(!active)return;
    const v={temp:Math.round(d.temperature_2m),code:d.weather_code,time:d.time};
    cache.set(key,{value:v,fetchedAt:Date.now()});setValue(v);
   }catch{if(active)setValue(null);}
   finally{window.clearTimeout(timeout);if(pending===abort)pending=null;}
  };
  void refresh();
  const timer=window.setInterval(()=>void refresh(),60000);
  const resume=()=>{if(!document.hidden)void refresh();};
  document.addEventListener("visibilitychange",resume);window.addEventListener("focus",resume);
  return()=>{active=false;window.clearInterval(timer);pending?.abort();document.removeEventListener("visibilitychange",resume);window.removeEventListener("focus",resume);};
 },[lat,lon]);
 if(!value)return null;
 const weather=condition(value.code),Icon=weather.Icon,desc=lang==="ko"?weather.ko:weather.ja;
 return <a className="weather-pill" href="https://open-meteo.com/" target="_blank" rel="noreferrer" aria-label={label+" "+value.temp+"°C "+desc+" · "+value.time.slice(11,16)+" JST · Open-Meteo"}>
  <Icon size={17}/><span>{label}</span><strong>{value.temp}°</strong><span>{desc}</span>
 </a>;
}
