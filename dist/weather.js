/* Compact current weather + 5-day forecast for regional travel planning. */
const weatherCache=new Map();
const WEATHER_TTL=30*60*1000;
const weatherCodes={
 0:['☀️','맑음'],1:['🌤️','대체로 맑음'],2:['⛅','구름 조금'],3:['☁️','흐림'],
 45:['🌫️','안개'],48:['🌫️','이슬 안개'],
 51:['🌦️','이슬비'],53:['🌦️','이슬비'],55:['🌧️','이슬비'],56:['🌧️','어는 이슬비'],57:['🌧️','어는 이슬비'],
 61:['🌦️','비'],63:['🌧️','비'],65:['🌧️','비'],66:['🌧️','어는 비'],67:['🌧️','어는 비'],
 71:['🌨️','눈'],73:['🌨️','눈'],75:['❄️','눈'],77:['❄️','눈알갱이'],
 80:['🌦️','소나기'],81:['🌧️','소나기'],82:['⛈️','소나기'],85:['🌨️','눈 소나기'],86:['❄️','눈 소나기'],
 95:['⛈️','뇌우'],96:['⛈️','우박 동반 뇌우'],99:['⛈️','우박 동반 뇌우']
};
function weatherText(text){return typeof translateText==='function'?translateText(text):text}
function weatherLang(){try{return localStorage.getItem('japlan-language')==='ja'?'ja':'ko'}catch{return 'ko'}}
function weatherPoint(){
 if(state.view!=='explore')return null;
 const candidates=samples.filter(p=>p.pref===state.pref&&(state.area==='전체'||p.area===state.area)&&(state.town==='전체'||p.town===state.town));
 for(const p of candidates){const loc=pointLocations[p.id]||(Number.isFinite(p.lat)&&Number.isFinite(p.lon)?{lat:p.lat,lon:p.lon}:null);if(loc)return{lat:loc.lat,lon:loc.lon,name:p.name}}
 return null;
}
function weatherCondition(code){return weatherCodes[Number(code)]||['🌡️','현재 날씨']}
function weatherDateLabel(date,index){
 if(index===0)return weatherText('오늘');
 if(index===1)return weatherText('내일');
 if(index===2)return weatherText('모레');
 const locale=weatherLang()==='ja'?'ja-JP':'ko-KR';
 try{return new Intl.DateTimeFormat(locale,{month:'numeric',day:'numeric',weekday:'short'}).format(new Date(date+'T12:00:00'))}catch{return date}
}
function weatherRound(v,digits=0){const n=Number(v);return Number.isFinite(n)?n.toFixed(digits):'–'}
function renderWeatherData(host,data,point){
 const c=data.current||{},d=data.daily||{},current=weatherCondition(c.weather_code),scope=state.area==='전체'?state.pref:state.area;
 host.innerHTML='';
 const head=document.createElement('div');head.className='weatherHead';
 const title=document.createElement('div');title.innerHTML='<h2>'+weatherText('현재 날씨')+'</h2><p>'+scope+' · '+weatherText('대표 지점')+' '+point.name+'</p>';
 const now=document.createElement('div');now.className='weatherNow';
 now.innerHTML='<span class="weatherNowIcon">'+current[0]+'</span><div><div class="weatherNowTemp">'+weatherRound(c.temperature_2m,1)+'°</div><div class="weatherNowText">'+weatherText(current[1])+' · '+weatherText('체감')+' '+weatherRound(c.apparent_temperature,1)+'°</div></div>';
 head.append(title,now);host.append(head);
 const days=document.createElement('div');days.className='weatherDays';
 const times=d.time||[];
 for(let i=0;i<Math.min(5,times.length);i++){
  const cond=weatherCondition(d.weather_code?.[i]),card=document.createElement('article');card.className='weatherDay';
  const rain=Number(d.precipitation_probability_max?.[i]);
  card.innerHTML='<strong>'+weatherDateLabel(times[i],i)+'</strong><span class="weatherIcon">'+cond[0]+'</span><span>'+weatherText(cond[1])+'</span><span>'+weatherRound(d.temperature_2m_max?.[i])+'° / '+weatherRound(d.temperature_2m_min?.[i])+'°</span><small>'+weatherText('강수확률')+' '+(Number.isFinite(rain)?Math.round(rain)+'%':'–')+'</small>';
  days.append(card);
 }
 host.append(days);
 const credit=document.createElement('p');credit.className='weatherCredit';credit.append(weatherText('예보는 여행 참고용입니다.')+' · ');
 const link=document.createElement('a');link.href='https://open-meteo.com/';link.target='_blank';link.rel='noopener';link.textContent=weatherText('데이터: Open-Meteo');credit.append(link);host.append(credit);
 host.hidden=false;
}
function renderWeatherError(host,key){
 if(host.dataset.weatherKey!==key)return;
 host.innerHTML='<div class="weatherError">'+weatherText('날씨 정보를 불러오지 못했습니다.')+'</div>';
 const retry=button(weatherText('다시 시도'),()=>{weatherCache.delete(key);renderWeatherPanel(true)});
 host.querySelector('.weatherError').append(retry);host.hidden=false;
}
async function renderWeatherPanel(force=false){
 const host=$('#weatherPanel');if(!host)return;
 if(state.view!=='explore'){host.hidden=true;host.dataset.weatherKey='';return}
 const point=weatherPoint();if(!point){host.hidden=true;return}
 const key=point.lat.toFixed(3)+','+point.lon.toFixed(3),cached=weatherCache.get(key);
 host.dataset.weatherKey=key;
 if(!force&&cached&&Date.now()-cached.time<WEATHER_TTL){renderWeatherData(host,cached.data,point);return}
 host.hidden=false;host.innerHTML='<div class="weatherError">'+weatherText('날씨 정보를 불러오는 중입니다.')+'</div>';
 const params=new URLSearchParams({
  latitude:String(point.lat),longitude:String(point.lon),
  current:'temperature_2m,apparent_temperature,weather_code',
  daily:'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
  timezone:'auto',forecast_days:'5'
 });
 try{
  const response=await fetch('https://api.open-meteo.com/v1/forecast?'+params.toString(),{headers:{Accept:'application/json'}});
  if(!response.ok)throw new Error('weather '+response.status);
  const data=await response.json();weatherCache.set(key,{time:Date.now(),data});
  if(host.dataset.weatherKey===key&&state.view==='explore')renderWeatherData(host,data,point);
 }catch{renderWeatherError(host,key)}
}
const weatherPreviousRender=render;
render=function(){weatherPreviousRender();renderWeatherPanel()};
document.addEventListener('click',e=>{if(e.target.closest?.('#langKo,#langJa,.language button'))queueMicrotask(()=>renderWeatherPanel())});
renderWeatherPanel();
