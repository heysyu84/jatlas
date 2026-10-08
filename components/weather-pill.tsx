"use client";
import {useEffect,useState} from "react";
import {Cloud,Sun,CloudRain,Snowflake} from "lucide-react";
const cache=new Map<string,{temp:number;code:number;time:string}>();
export default function WeatherPill({lat,lon,label,lang}:{lat:number;lon:number;label:string;lang:string}){
 const [value,setValue]=useState<{temp:number;code:number;time:string}|null>(null);
 useEffect(()=>{setValue(null);if(!Number.isFinite(lat)||!Number.isFinite(lon))return;const key=lat.toFixed(2)+":"+lon.toFixed(2);if(cache.has(key)){setValue(cache.get(key)!);return;}
  const abort=new AbortController();const q=new URLSearchParams({latitude:String(lat),longitude:String(lon),current:"temperature_2m,weather_code",timezone:"Asia/Tokyo"});
  fetch("https://api.open-meteo.com/v1/forecast?"+q,{signal:abort.signal}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(raw=>{const d=raw as {current?:{temperature_2m:number;weather_code:number;time:string}};if(!d.current||!Number.isFinite(d.current.temperature_2m))return;const v={temp:Math.round(d.current.temperature_2m),code:d.current.weather_code,time:d.current.time};cache.set(key,v);setValue(v);}).catch(()=>{});
  return()=>abort.abort();
 },[lat,lon]);
 if(!value)return null;
 const Icon=value.code<2?Sun:value.code<4?Cloud:value.code>=71&&value.code<=77?Snowflake:CloudRain;
 const desc=value.code<2?(lang==="ko"?"맑음":"晴れ"):value.code<4?(lang==="ko"?"구름":"曇り"):value.code>=71&&value.code<=77?(lang==="ko"?"눈":"雪"):(lang==="ko"?"비":"雨");
 return <a className="weather-pill" href="https://open-meteo.com/" target="_blank" rel="noreferrer" aria-label={label+" "+value.temp+"°C "+desc+" · "+value.time.slice(11,16)+" JST · Open-Meteo"}>
  <Icon size={17}/><span>{label}</span><strong>{value.temp}°</strong><span>{desc}</span>
 </a>;
}
