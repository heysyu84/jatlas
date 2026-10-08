"use client";
import {useCallback,useEffect,useMemo,useRef,useState,type CSSProperties} from "react";
import {Bookmark,Search,Sun,Moon,Map,BookOpen,MapPin,Clock,X,Plus,Check,Leaf,Building2,Landmark,Waves,Sparkles,ShoppingBag,Utensils,CalendarDays,Route as RouteIcon,Loader2,ChevronDown,Trash2,Download,ExternalLink} from "lucide-react";
import {Tabs,TabsList,TabsTrigger,TabsContent} from "@/components/ui/tabs";
import {Sheet,SheetContent,SheetTitle,SheetDescription} from "@/components/ui/sheet";
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from "@/components/ui/select";
import {RadioGroup,RadioGroupItem} from "@/components/ui/radio-group";
import JapanMap from "@/components/japan-map";
import WeatherPill from "@/components/weather-pill";
import IntroJourney from "@/components/intro-journey";
import ScopeNavigation from "@/components/scope-navigation";
import FeatureTitle from "@/components/feature-title";
import OnsenDetails from "@/components/onsen-guide";
import {discoveryDestinations,orderDiscoveries} from "@/lib/discovery";
import {featureTitle} from "@/lib/feature-title";
import introJSON from "@/lib/intro.json";
import type {Catalog,ContentKind,Food,Item,OnsenData,Photo,Place,Route,TravelEvent} from "@/lib/jatlas";
import {categoryMatch,isFood,isPlace,isRoute,itemPhoto,localized,photoURL,sceneImages} from "@/lib/jatlas";

const intro=introJSON as Place[];
const categories=[
 {id:"all",ko:"전체",ja:"すべて",Icon:Sparkles},
 {id:"nature",ko:"자연",ja:"自然",Icon:Leaf},
 {id:"town",ko:"마을과 산책",ja:"街歩き",Icon:Building2},
 {id:"culture",ko:"문화와 역사",ja:"文化・歴史",Icon:Landmark},
 {id:"onsen",ko:"온천",ja:"温泉",Icon:Waves},
 {id:"night",ko:"야경",ja:"夜景",Icon:Moon},
 {id:"shopping",ko:"쇼핑",ja:"買い物",Icon:ShoppingBag}
];
const kindLabels={places:{ko:"풍경과 장소",ja:"風景と場所",Icon:MapPin},foods:{ko:"지역의 맛",ja:"土地の味",Icon:Utensils},routes:{ko:"여행 코스",ja:"旅のコース",Icon:RouteIcon},events:{ko:"계절과 축제",ja:"季節と祭り",Icon:CalendarDays}};
const regionEnglish:Record<string,string>={"홋카이도":"HOKKAIDO","도호쿠":"TOHOKU","북간토":"NORTH KANTO","수도권":"GREATER TOKYO","고신에쓰":"KOSHINETSU","도카이":"TOKAI","호쿠리쿠":"HOKURIKU","긴키":"KINKI","산인·산요":"SANIN & SANYO","시코쿠":"SHIKOKU","규슈":"KYUSHU","오키나와":"OKINAWA"};
const regionPicks:Record<string,string>={"홋카이도":"가무이곶","도호쿠":"긴잔 온천","북간토":"게곤 폭포","수도권":"센소지","고신에쓰":"가미코치","도카이":"다카야마 옛 거리","호쿠리쿠":"겐로쿠엔","긴키":"기요미즈데라","산인·산요":"쓰노시마 대교","시코쿠":"이야 가즈라바시","규슈":"다카치호 협곡","오키나와":"잔파곶"};
const initial:Catalog={version:"",places:intro,foods:[],routes:[],events:[],prefs:[],regions:[],dict:{}};
type Day={id:string;date:string;stops:{id:string;time:string}[]};
const dayId=()=>globalThis.crypto?.randomUUID?.()||"day-"+Math.random().toString(36).slice(2);
const normalized=(s:string)=>s.toLocaleLowerCase().replace(/\s+/g,"");
const itemName=(i:Item,lang:string)=>localized(i,isRoute(i)?"title":"name",lang);
const matches=(i:Item,q:string)=>!q||normalized([itemName(i,"ko"),itemName(i,"ja"),isPlace(i)?featureTitle(i):"",i.pref,localized(i,"pref","ja"),"area" in i?i.area:"",localized(i,"area","ja"),"town" in i?i.town:"",localized(i,"town","ja"),localized(i,"description","ko"),localized(i,"description","ja"),isPlace(i)&&i.onsen?[i.onsen.springType,i.onsen.water,i.onsen.atmosphere,i.onsen.dayVisit,i.onsen.stay,i.onsen.ja.springType,i.onsen.ja.water,i.onsen.ja.atmosphere,i.onsen.ja.dayVisit,i.onsen.ja.stay].join(" "):"",isRoute(i)?[i.intro,i.ja.intro,...i.areas].join(" "):""].join(" ")).includes(normalized(q));
const searchRank=(i:Item,q:string)=>{
 const names=[itemName(i,"ko"),itemName(i,"ja"),isPlace(i)?featureTitle(i):""].map(normalized),term=normalized(q);
 return names.some(n=>n===term)?0:names.some(n=>n.startsWith(term))?1:names.some(n=>n.includes(term))?2:3;
};
const distanceKm=(a:Place,b:Place)=>{
 const radians=(n:number)=>n*Math.PI/180;
 const h=Math.sin(radians(b.lat-a.lat)/2)**2+Math.cos(radians(a.lat))*Math.cos(radians(b.lat))*Math.sin(radians(b.lon-a.lon)/2)**2;
 return 6371*2*Math.asin(Math.sqrt(Math.min(1,h)));
};
function Picture({photo,id,alt,className="",eager=false,textOnly=false}:{photo?:Photo;id?:string;alt:string;className?:string;eager?:boolean;textOnly?:boolean}){
 const [failed,setFailed]=useState(0);const src=photoURL(photo?.src,id);
 useEffect(()=>setFailed(0),[src]);
 if(textOnly&&!src)return <div className={"onsen-symbol "+className} aria-hidden="true"><Waves size={22}/></div>;
 if(!src||failed>=2)return <div className={"photo-unavailable "+className}><MapPin size={22}/><span>{alt}</span></div>;
 return <img src={src} alt={alt} className={className} loading={eager?"eager":"lazy"} decoding="async" onError={()=>setFailed(2)}/>;
}
function Picker({value,onChange,options,label}:{value:string;onChange:(s:string)=>void;options:{value:string;label:string}[];label:string}){
 return <Select value={value||"__all"} onValueChange={s=>onChange(s==="__all"?"":s)}>
  <SelectTrigger className="scope-picker" aria-label={label}><SelectValue placeholder={label}/></SelectTrigger>
  <SelectContent position="popper">{options.map(o=><SelectItem key={o.value||"__all"} value={o.value||"__all"}>{o.label}</SelectItem>)}</SelectContent>
 </Select>;
}
function Credit({photo,lang}:{photo?:Photo;lang:string}){
 if(!photo?.src)return null;const ko=lang==="ko";
 return <div className="photo-credit">
  {photo.userPhoto?<span>{ko?"직접 촬영 · Jatlas":"Jatlas 撮影"}</span>:<>{photo.author?<span>{photo.author}</span>:null}{photo.source?<a href={photo.source} target="_blank" rel="noreferrer">{ko?"사진 출처":"写真の出典"}</a>:null}{photo.licenseUrl&&photo.licenseUrl!==photo.source?<a href={photo.licenseUrl} target="_blank" rel="noreferrer">{photo.license||(ko?"이용 조건":"利用条件")}</a>:null}{photo.modifications?<span>{ko?"크기 조정 · WebP 변환":"リサイズ・WebP変換"}</span>:null}</>}
 </div>;
}

export default function Home(){
 const [catalog,setCatalog]=useState<Catalog>(initial),[ready,setReady]=useState(false),[dataError,setDataError]=useState(false);
 const [view,setView]=useState("intro"),[lang,setLang]=useState("ko"),[theme,setTheme]=useState("light"),[booted,setBooted]=useState(false);
 const [scene,setScene]=useState(0),[region,setRegion]=useState(""),[pref,setPref]=useState(""),[area,setArea]=useState(""),[town,setTown]=useState("");
 const [kind,setKind]=useState<ContentKind>("places"),[category,setCategory]=useState("all"),[query,setQuery]=useState(""),[searchDraft,setSearchDraft]=useState("");
 const [searchOpen,setSearchOpen]=useState(false),[searchLimit,setSearchLimit]=useState(30),[detail,setDetail]=useState<Item|null>(null),[saved,setSaved]=useState<string[]>([]),[saveOpen,setSaveOpen]=useState(false);
 const [searchViewport,setSearchViewport]=useState<{top:number;height:number}|null>(null);
 const [mapFocus,setMapFocus]=useState<Place|null>(null);
 const [noteTab,setNoteTab]=useState("saved"),[days,setDays]=useState<Day[]>([]),[month,setMonth]=useState(""),[limit,setLimit]=useState(24),[showPrefectures,setShowPrefectures]=useState(false);
 const [feedback,setFeedback]=useState("");const feedbackTimer=useRef<ReturnType<typeof setTimeout>|null>(null),searchRef=useRef<HTMLInputElement>(null),mainSearchRef=useRef<HTMLInputElement>(null),mainSearchResultsRef=useRef<HTMLDivElement>(null);
 const ko=lang==="ko",t=(k:string,j:string)=>ko?k:j;
 const name=(s:string)=>ko?s:catalog.prefs.find(p=>p.name===s)?.ja||catalog.regions.find(r=>r.name===s)?.ja||catalog.dict[s]||s;
 const notify=useCallback((s:string)=>{setFeedback(s);if(feedbackTimer.current)clearTimeout(feedbackTimer.current);feedbackTimer.current=setTimeout(()=>setFeedback(""),2600);},[]);
 const load=useCallback(()=>{setDataError(false);fetch("./data/catalog.json").then(r=>{if(!r.ok)throw Error();return r.json();}).then(c=>{setCatalog(c as Catalog);setReady(true);}).catch(()=>setDataError(true));},[]);
 useEffect(()=>{load();try{const p=JSON.parse(localStorage.getItem("jatlas-atelier-preferences")||"{}");if(p.lang==="ja")setLang("ja");if(p.theme==="dark")setTheme("dark");if(Array.isArray(p.saved))setSaved(p.saved.filter((s:unknown)=>typeof s==="string"));if(Array.isArray(p.days))setDays(p.days.filter((d:Day)=>d?.id&&Array.isArray(d.stops)));}catch{}
  const restore=()=>{const q=new URLSearchParams(window.location.hash.slice(1));const v=q.get("view");setView(v==="map"||v==="explore"?v:"intro");setRegion(q.get("region")||"");setPref(q.get("pref")||"");setArea(q.get("area")||"");setTown(q.get("town")||"");};
  restore();window.addEventListener("popstate",restore);setBooted(true);return()=>window.removeEventListener("popstate",restore);
 },[load]);
 useEffect(()=>{document.documentElement.classList.toggle("dark",theme==="dark");document.documentElement.lang=lang;if(!booted)return;try{localStorage.setItem("jatlas-atelier-preferences",JSON.stringify({lang,theme,saved,days}));}catch{}},[theme,lang,saved,days,booted]);
 useEffect(()=>{if(!booted)return;const q=new URLSearchParams();if(view!=="intro")q.set("view",view);if(region)q.set("region",region);if(pref)q.set("pref",pref);if(area)q.set("area",area);if(town)q.set("town",town);history.replaceState(null,"",window.location.pathname+window.location.search+(q.size?"#"+q:""));},[view,region,pref,area,town,booted]);
 useEffect(()=>{if(view!=="intro"||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;const id=setInterval(()=>setScene(s=>(s+1)%intro.length),11000);return()=>clearInterval(id);},[view]);
 useEffect(()=>setLimit(24),[region,pref,area,town,query,kind,category,month]);
 useEffect(()=>setSearchLimit(30),[searchDraft]);
 useEffect(()=>{
  if(!searchOpen)return;
  const viewport=window.visualViewport;
  const update=()=>setSearchViewport({top:(viewport?.offsetTop||0)+16,height:Math.max(160,(viewport?.height||window.innerHeight)-32)});
  update();viewport?.addEventListener("resize",update);viewport?.addEventListener("scroll",update);window.addEventListener("resize",update);
  return()=>{viewport?.removeEventListener("resize",update);viewport?.removeEventListener("scroll",update);window.removeEventListener("resize",update);};
 },[searchOpen]);
 useEffect(()=>{if(!ready)return;if(region&&!catalog.regions.some(r=>r.name===region))setRegion("");if(pref&&!catalog.prefs.some(p=>p.name===pref))setPref("");},[ready,catalog,region,pref]);
 const navigate=(v:string)=>{setView(v);setDetail(null);window.scrollTo({top:0,behavior:"instant"});};
 const chooseRegion=(s:string)=>{setRegion(s);setPref("");setArea("");setTown("");setDetail(null);setMapFocus(null);};
 const choosePref=(s:string)=>{setPref(s);setArea("");setTown("");if(s)setRegion(catalog.prefs.find(p=>p.name===s)?.region||"");setDetail(null);setMapFocus(null);};
 const resetScope=()=>{chooseRegion("");setCategory("all");setQuery("");setMonth("");};
 const startExplore=()=>{resetScope();setSearchDraft("");setKind("places");navigate("explore");};
 const allPlaces=useMemo(()=>catalog.places.filter(p=>(!region||catalog.regions.find(r=>r.name===region)?.prefs.includes(p.pref))&&(!pref||p.pref===pref)&&(!area||p.area===area)&&(!town||p.town===town)),[catalog,region,pref,area,town]);
 const mapPlaces=useMemo(()=>allPlaces.filter(p=>categoryMatch(p,category)&&matches(p,query)),[allPlaces,category,query]);
 useEffect(()=>{if(mapFocus&&!mapPlaces.some(p=>p.id===mapFocus.id))setMapFocus(null);},[mapPlaces,mapFocus]);
 const nearby=useMemo(()=>mapFocus?catalog.places.filter(p=>p.id!==mapFocus.id).map(p=>({place:p,distance:distanceKm(mapFocus,p)})).filter(p=>p.distance<=25).sort((a,b)=>a.distance-b.distance).slice(0,3):[],[catalog,mapFocus]);
 const scopeNav=(className="")=><ScopeNavigation region={region} pref={pref} area={area} town={town} lang={lang} name={name} onClear={resetScope} onRegion={chooseRegion} onPref={choosePref} onArea={s=>{setArea(s);setTown("");setMapFocus(null);}} onTown={s=>{setTown(s);setMapFocus(null);}} className={className}/>;
 const results=useMemo(()=>{
  let source:Item[]=kind==="places"?catalog.places:kind==="foods"?catalog.foods:kind==="events"?catalog.events:catalog.routes;
  source=source.filter(i=>(!region||catalog.regions.find(r=>r.name===region)?.prefs.includes(i.pref))&&(!pref||i.pref===pref)&&(!area||("area" in i?i.area===area:(i as Route).areas?.includes(area)))&&(!town||!isPlace(i)||i.town===town)&&matches(i,query));
  if(kind==="places")source=source.filter(i=>categoryMatch(i as Place,category));
  if(kind==="events"&&month)source=source.filter(i=>(i as TravelEvent).months?.includes(Number(month)));
  if(!region&&!pref&&!query&&!area&&!town)source=orderDiscoveries(source);
  if(kind==="places"&&category==="onsen")source.sort((a,b)=>Number(!isPlace(a)||!a.onsen)-Number(!isPlace(b)||!b.onsen));
  return source;
 },[catalog,kind,region,pref,area,town,query,category,month]);
 const hero=useMemo(()=>{if(!region&&!pref&&!area&&!town&&!query&&category==="all")return intro[scene];const eligible=mapPlaces.length===1?mapPlaces:mapPlaces.filter(p=>p.heroEligible!==false);return eligible.find(p=>Object.values(regionPicks).includes(p.name))||eligible[0];},[region,pref,area,town,query,category,mapPlaces,scene]);
 const searched=useMemo(()=>searchDraft.trim()?[...catalog.places,...catalog.foods,...catalog.routes,...catalog.events].filter(i=>matches(i,searchDraft)).sort((a,b)=>searchRank(a,searchDraft)-searchRank(b,searchDraft)):[],[catalog,searchDraft]);
 const searchRegions=searchDraft.trim()?catalog.regions.filter(r=>normalized(r.name+" "+r.ja+" "+regionEnglish[r.name]).includes(normalized(searchDraft))):[];
 const searchPrefs=searchDraft.trim()?catalog.prefs.filter(p=>normalized(p.name+" "+p.ja).includes(normalized(searchDraft))):[];
 const searchCount=searched.length+searchRegions.length+searchPrefs.length;
 const leaveSearch=()=>{mainSearchRef.current?.blur();searchRef.current?.blur();setSearchOpen(false);};
 const searchResults=(inline=false)=><div className={"search-result-scroll"+(inline?" inline-search-results":"")} ref={inline?mainSearchResultsRef:undefined} id={inline?"inline-search-results":undefined} role="region" aria-label={t("검색 결과","検索結果")} aria-busy={!ready&&!dataError}>
  <p className="search-section-label" role="status">{dataError?t("여행 정보를 불러오지 못했습니다.","旅の情報を読み込めませんでした。"):ready?`${t("검색 결과","検索結果")} · ${searchCount.toLocaleString()}${t("개","件")}`:t("여행 정보를 불러오는 중입니다.","旅の情報を読み込んでいます。")}</p>
  {searchRegions.map(r=><button className="search-pref-row" key={r.name} onClick={()=>{leaveSearch();resetScope();setKind("places");chooseRegion(r.name);setSearchDraft("");navigate("explore");}}><MapPin size={18}/><span>{ko?r.name:r.ja}</span><small>{t("지방","地方")}</small></button>)}
  {searchPrefs.map(p=><button className="search-pref-row" key={p.name} onClick={()=>{leaveSearch();resetScope();setKind("places");choosePref(p.name);setSearchDraft("");navigate("explore");}}><MapPin size={18}/><span>{ko?p.name:p.ja}</span><small>{t("도도부현","都道府県")}</small></button>)}
  {searched.slice(0,searchLimit).map(i=><button key={i.id} className="search-result-row" onClick={()=>{leaveSearch();setDetail(i);}}><Picture photo={itemPhoto(i,catalog)} id={isPlace(i)?i.id:undefined} alt="" textOnly={isPlace(i)&&!!i.onsen&&!i.photo.src}/><span><strong>{itemName(i,lang)}</strong><small>{name(i.pref)} · {isPlace(i)?localized(i,"tag",lang):isFood(i)?t("지역 음식","土地の味"):isRoute(i)?t("여행 코스","旅のコース"):t("계절·행사","季節・イベント")}</small></span></button>)}
  {searched.length>searchLimit?<button className="load-more search-more" onClick={()=>setSearchLimit(n=>n+30)}>{t("검색 결과 더 보기","検索結果をもっと見る")}</button>:null}
  {!searchCount&&ready?<p className="search-empty">{t("검색 결과가 없습니다. 다른 이름으로 찾아보세요.","見つかりませんでした。別の名前で検索してください。")}</p>:null}
  {dataError?<button className="text-button" onClick={load}>{t("다시 불러오기","再読み込み")}</button>:null}
 </div>;
 const areas=[...new Set(catalog.places.filter(p=>p.pref===pref).map(p=>p.area))],towns=[...new Set(catalog.places.filter(p=>p.pref===pref&&(!area||p.area===area)).map(p=>p.town))];
 const toggleSave=(i:Item)=>setSaved(s=>s.includes(i.id)?s.filter(id=>id!==i.id):[...s,i.id]);
 const allItems=useMemo(()=>[...catalog.places,...catalog.foods,...catalog.routes,...catalog.events],[catalog]);
 const savedItems=saved.map(id=>allItems.find(i=>i.id===id)).filter(Boolean) as Item[];
 const addToNote=(p:Place)=>{setDays(ds=>{if(!ds.length)return [{id:dayId(),date:"",stops:[{id:p.id,time:""}]}];const last=ds[ds.length-1];if(last.stops.some(s=>s.id===p.id))return ds;return ds.map((d,i)=>i===ds.length-1?{...d,stops:[...d.stops,{id:p.id,time:""}]}:d);});notify(t("여행 노트에 담았습니다.","旅のノートに追加しました。"));};
 const addRoute=(r:Route)=>{const next=r.days.map(d=>({id:dayId(),date:"",stops:d.places.map(legacyId=>{const p=catalog.places.find(p=>p.legacyId===legacyId);return p?{id:p.id,time:d.schedule?.find(s=>s[0]===legacyId)?.[1]||""}:null;}).filter(Boolean) as Day["stops"]}));setDays(d=>[...d,...next]);notify(t("코스를 여행 노트에 담았습니다.","コースを旅のノートに追加しました。"));};
 const card=(item:Item,compact=false)=>{
  const photo=itemPhoto(item,catalog);const routePlace=isRoute(item)?catalog.places.find(p=>p.legacyId===item.days[0]?.places[0]):undefined;
  const onsen=isPlace(item)?item.onsen:undefined,onsenText=onsen?(ko?onsen:onsen.ja):undefined,textOnly=!!onsen&&!photo?.src;
  return <article key={item.id} className={"place-card"+(compact?" compact":"")+(textOnly?" text-place-card":"")}>
   <button className="card-main" onClick={()=>setDetail(item)}>
    {textOnly?<div className="onsen-card-mark"><Waves size={23}/><span>{t("온천지","温泉地")}</span></div>:<div className="card-photo"><Picture photo={photo} id={isPlace(item)?item.id:routePlace?.id} alt={itemName(item,lang)}/>
     {isRoute(item)?<span className="card-badge">{ko?item.duration:item.ja.duration}</span>:isPlace(item)&&item.guide?.duration?<span className="card-badge">{ko?item.guide.duration:item.ja.duration}</span>:null}
    </div>}
    <div className="card-copy"><span className="card-location">{name(item.pref)}{("area" in item&&item.area)?" · "+name(item.area):""}</span>
     <h3>{itemName(item,lang)}</h3><p>{onsenText?onsenText.atmosphere:isRoute(item)?localized(item,"intro",lang):localized(item,"description",lang)}</p>
     <span className={"card-tag"+(onsen?" onsen-card-type":"")}>{onsenText?onsenText.springType:isPlace(item)?localized(item,"tag",lang):isFood(item)?localized(item,"kind",lang):isRoute(item)?t("추천 코스","おすすめコース"):(item as TravelEvent).months?.map(m=>m+t("월","月")).join(" · ")}</span>
    </div>
   </button>
   <button className={"card-save"+(saved.includes(item.id)?" saved":"")} onClick={()=>toggleSave(item)} aria-pressed={saved.includes(item.id)} aria-label={itemName(item,lang)+t(" 저장","を保存")}><Bookmark size={18} fill={saved.includes(item.id)?"currentColor":"none"}/></button>
  </article>;
 };
 const filterBar=<div className="filter-bar">
  <div className="scope-fields">
   <Picker value={region} onChange={chooseRegion} label={t("지방","地方")} options={[{value:"",label:t("일본 전역","日本全国")},...catalog.regions.map(r=>({value:r.name,label:ko?r.name:r.ja}))]}/>
   <Picker value={pref} onChange={choosePref} label={t("도도부현","都道府県")} options={[{value:"",label:t("모든 도도부현","すべての都道府県")},...catalog.prefs.filter(p=>!region||p.region===region).map(p=>({value:p.name,label:ko?p.name:p.ja}))]}/>
   {(pref&&view!=="map")?<Picker value={area} onChange={s=>{setArea(s);setTown("");}} label={t("여행 권역","エリア")} options={[{value:"",label:t("모든 권역","すべてのエリア")},...areas.map(a=>({value:a,label:name(a)}))]}/>:null}
   {kind==="events"?<Picker value={month} onChange={setMonth} label={t("여행 월","旅行の月")} options={[{value:"",label:t("모든 계절","すべての季節")},...Array.from({length:12},(_,i)=>({value:String(i+1),label:(i+1)+t("월","月")}))]}/>:null}
  </div>
  <form className="filter-search" onSubmit={e=>{e.preventDefault();}}><Search size={17}/><input aria-label={t("장소와 음식 검색","場所や食べ物を検索")} placeholder={t("어디가 궁금하세요?","どこが気になりますか？")} value={query} onChange={e=>setQuery(e.target.value)}/>{query?<button type="button" onClick={()=>setQuery("")} aria-label={t("검색 지우기","検索を消す")}><X size={16}/></button>:null}</form>
 </div>;
 const categoryBar=<RadioGroup value={category} onValueChange={setCategory} className="category-nav" aria-label={t("여행 테마","旅のテーマ")}>
  {categories.map(({id,ko:k,ja:j,Icon})=><label key={id} className={category===id?"category-label selected":"category-label"}><RadioGroupItem value={id} className="sr-only"/><Icon size={17}/><span>{ko?k:j}</span></label>)}
 </RadioGroup>;
 const destinationCards=<section className="region-section">
  <div className="section-heading"><div><span className="eyebrow">CHOOSE YOUR CHAPTER</span><h2>{t("다음 여행은, 이곳에서.","次の旅は、ここから。")}</h2></div><button className="text-button" aria-expanded={showPrefectures} aria-controls="all-prefectures" onClick={()=>setShowPrefectures(s=>!s)}>{showPrefectures?t("접어 보기","閉じる"):t("47개 도도부현 모두 보기","47都道府県をすべて見る")}</button></div>
  <div className="region-grid">{discoveryDestinations.map(destination=>{const p=catalog.places.find(p=>p.id===destination.places[0])||catalog.places.find(p=>p.pref===destination.pref);return <button key={destination.pref} className="region-card" onClick={()=>{choosePref(destination.pref);navigate("explore");}}>
   <div className="region-image"><Picture photo={p?.photo} id={p?.id} alt={p?itemName(p,lang):name(destination.pref)}/></div>
   <div className="region-card-label"><h3>{name(destination.pref)}</h3><span>{destination.english}</span></div></button>;})}</div>
  {showPrefectures?<div className="all-prefectures" id="all-prefectures">{catalog.regions.map(r=><div className="prefecture-group" key={r.name}>
   <button className="prefecture-group-name" onClick={()=>{chooseRegion(r.name);navigate("explore");}}>{name(r.name)}</button>
   <div>{catalog.prefs.filter(p=>p.region===r.name).map(p=><button key={p.name} onClick={()=>{choosePref(p.name);navigate("explore");}}>{name(p.name)}</button>)}</div>
  </div>)}</div>:null}
 </section>;

 useEffect(()=>{
  const context=(document as Document&{modelContext?:{registerTool:(t:unknown,o:{signal:AbortSignal})=>void}}).modelContext;if(!context?.registerTool||!ready)return;
  const controller=new AbortController();const register=(tool:unknown)=>{try{context.registerTool(tool,{signal:controller.signal});}catch{}};
  register({name:"search_jatlas",title:"Search Jatlas",description:"Search the current Jatlas travel catalog. Does not change saved places or travel notes.",inputSchema:{type:"object",properties:{query:{type:"string"},limit:{type:"integer",minimum:1,maximum:30}},required:["query"],additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:true},execute:(input:unknown)=>{const d=input as {query?:unknown;limit?:unknown};if(typeof d?.query!=="string"||(d.limit!==undefined&&(!Number.isInteger(d.limit)||Number(d.limit)<1||Number(d.limit)>30)))throw Error("Invalid search input");return allItems.filter(i=>matches(i,d.query as string)).slice(0,Number(d.limit)||10).map(i=>({id:i.id,name:itemName(i,lang),pref:i.pref}));}});
  register({name:"open_jatlas_place",title:"Open a place",description:"Open an existing place's detail panel in Jatlas. Does not save or add it to a travel note.",inputSchema:{type:"object",properties:{place_id:{type:"string"}},required:["place_id"],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:async(input:unknown)=>{const d=input as {place_id?:unknown};if(typeof d?.place_id!=="string")throw Error("A canonical place_id is required");const p=catalog.places.find(p=>p.id===d.place_id);if(!p)throw Error("Unknown place");setView("explore");setDetail(p);await new Promise<void>(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r())));return {id:p.id,name:itemName(p,lang),opened:true};}});
  return()=>controller.abort();
 },[catalog,ready,allItems,lang]);

 return <Tabs value={view} onValueChange={navigate} className={"jatlas-app "+(view==="intro"?"intro-mode":"")+" "+(view==="map"?"map-mode":"")}>
  <a className="skip-link" href="#main-content">{t("본문으로 이동","本文へ移動")}</a>
  <header className="site-header">
   <button className="brand" onClick={()=>navigate("intro")} aria-label={t("Jatlas 첫 화면","Jatlas ホーム")}><img src="./images/jatlas-logo.webp" alt="Jatlas" width="600" height="188"/></button>
   {view!=="intro"?<TabsList className="mode-switch"><TabsTrigger value="explore"><BookOpen size={16}/>{t("탐색","見つける")}</TabsTrigger><TabsTrigger value="map"><Map size={16}/>{t("지도","地図")}</TabsTrigger></TabsList>:<span className="header-journal">JAPAN TRAVEL JOURNAL</span>}
   <div className="header-actions">
    <button className="icon-button search-top" onClick={()=>{setSearchDraft("");setSearchOpen(true);}} aria-label={t("검색 열기","検索を開く")}><Search size={20}/></button>
    <button className="icon-button theme-toggle" onClick={()=>setTheme(theme==="light"?"dark":"light")} aria-label={theme==="light"?t("다크 모드로","ダークモードに"):t("라이트 모드로","ライトモードに")} title={theme==="light"?t("다크 모드","ダークモード"):t("라이트 모드","ライトモード")}>{theme==="light"?<Moon size={19}/>:<Sun size={19}/>}</button>
    <button className="language-button" onClick={()=>setLang(ko?"ja":"ko")} aria-label={ko?"日本語に切り替える":"한국어로 전환"}>{ko?"日本語":"한국어"}</button>
    <button className="saved-button" onClick={()=>setSaveOpen(true)} aria-label={t("저장과 여행 노트","保存と旅のノート")}><Bookmark size={18}/><span>{t("저장","保存")}</span><span className="saved-count">{saved.length}</span></button>
   </div>
  </header>

  {view==="intro"?<main id="main-content" className="intro-page">
   <IntroJourney onComplete={startExplore} canComplete={!searchOpen&&!detail&&!saveOpen}>
   <div className="intro-scroll-track">
   <section className="intro-hero" aria-label={t("Jatlas 인트로","Jatlas イントロ")}>
    <div className="intro-visual" aria-hidden="true">
     {intro.map((p,i)=><img key={p.id} src={sceneImages[p.id]} alt="" className={scene===i?"intro-photo active":"intro-photo"} loading={i===0?"eager":"lazy"}/>)}
     <div className="intro-shade"/>
    </div>
    <div className="intro-content"><span className="intro-kicker">A JOURNAL OF PLACES & POSSIBILITIES</span><h1>Japan,<br/><em>at your pace.</em></h1><p>{t("익숙한 일본을, 새로운 시선으로.","いつもの日本を、新しいまなざしで。")}</p><button className="intro-enter" onClick={startExplore}>{t("일본 탐색 시작","日本を見つける")}</button></div>
    <div className="intro-bottom"><div className="scene-caption"><span className="scene-line"/><div><span className="scene-region">{name(intro[scene].pref)}</span><button onClick={()=>{navigate("explore");setDetail(intro[scene]);}}>{itemName(intro[scene],lang)}</button></div></div>
     <div className="scene-controls" aria-label={t("인트로 풍경 선택","風景を選ぶ")}>{intro.map((p,i)=><button key={p.id} onClick={()=>setScene(i)} aria-label={itemName(p,lang)} aria-pressed={scene===i}><span>{String(i+1).padStart(2,"0")}</span><i className={scene===i?"active":""}/></button>)}</div>
     <span className="intro-coordinate">{intro[scene].lat.toFixed(2)}° N &nbsp; {intro[scene].lon.toFixed(2)}° E</span>
    </div>
    <div className="intro-scroll-cue" aria-hidden="true"><span>SCROLL TO DISCOVER</span><ChevronDown size={17}/></div>
   </section>
   </div>
   <section className="intro-stories">
    <div className="section-heading" data-reveal><div><span className="eyebrow">A GLIMPSE OF JAPAN</span><h2>{t("다음 여행의 첫 장면.","次の旅の、最初の風景。")}</h2></div><span className="section-note">{t("바다. 산. 그리고 오래된 골목.","海。山。そして、古い路地。")}</span></div>
    <div className="story-grid">{intro.map(p=><button key={p.id} className="story-card" data-reveal aria-label={`${name(p.pref)} · ${itemName(p,lang)} ${t("살펴보기","を見る")}`} onClick={()=>{navigate("explore");choosePref(p.pref);setDetail(p);}}>
     <div className="story-image"><Picture photo={p.photo} id={p.id} alt=""/><span className="feature-region">{name(p.pref)} · {name(p.area)}</span><FeatureTitle title={featureTitle(p)}/></div>
     <div className="story-copy"><h3>{itemName(p,lang)}</h3><p>{ko?p.description:p.ja.description}</p></div>
    </button>)}</div>
   </section>
   <section className="intro-signoff" data-reveal aria-label={t("여행의 시작","旅の始まり")}><span className="eyebrow">YOUR JOURNEY STARTS HERE</span><h2>Find your<br/><em>Japan.</em></h2><p>{t("어디로 가든, 당신의 속도로.","どこへ行っても、あなたのペースで。")}</p><button className="intro-finish" onClick={startExplore}>{t("일본 탐색 시작","日本を見つける")}<span aria-hidden="true">↗</span></button><span className="intro-end-cue">{t("스크롤을 내리면 여행이 시작됩니다.","スクロールして、旅の続きを。")}<ChevronDown size={16}/></span></section>
   </IntroJourney>
  </main>:<TabsContent value={view} className="main-tab-content">
   <main id="main-content">
   {!ready?<div className="data-status" role="status">{dataError?<><span>{t("여행 정보를 불러오지 못했습니다.","旅の情報を読み込めませんでした。")}</span><button onClick={load}>{t("다시 불러오기","再読み込み")}</button></>:<><Loader2 className="spin" size={17}/>{t("여행 정보를 불러오는 중입니다.","旅の情報を読み込んでいます。")}</>}</div>:null}
   {view==="explore"?<>
    {scopeNav("explore-scope")}
    <section className="discovery-hero">
     <div className="discovery-copy"><span className="eyebrow">{region?regionEnglish[region]:"THE JATLAS EDIT"}</span>
      <h1>{pref?name(pref):region?name(region):<>{t("마음이 머무는","心が留まる")}<br/>{t("곳으로.","場所へ。")}</>}</h1>
      <p>{pref||region?(catalog.overviews?.[area||pref||region]?.[ko?"ko":"ja"]||t("풍경을 고르고, 당신만의 여행을 이어보세요.","風景を選び、あなただけの旅をつないでください。")):<><span className="discovery-line">{t("먼저 풍경을 만나세요.","まずは、風景に出会う。")}</span><span className="discovery-line">{t("여행의 시작은 그다음입니다.","旅の始まりは、そのあと。")}</span></>}</p>
      <form className="discovery-search" role="search" onSubmit={e=>{e.preventDefault();mainSearchRef.current?.blur();mainSearchResultsRef.current?.scrollIntoView({block:"nearest",behavior:"smooth"});}}><Search size={20}/><input ref={mainSearchRef} type="search" value={searchDraft} onFocus={e=>{if(window.matchMedia("(max-width:600px)").matches)e.currentTarget.closest("form")?.scrollIntoView({block:"start",behavior:"instant"});}} onChange={e=>setSearchDraft(e.target.value)} onKeyDown={e=>{if(e.key==="Escape")setSearchDraft("");}} placeholder={t("다음 여행은 어디로?","次の旅は、どこへ？")} aria-label={t("일본 여행 검색어","日本の旅の検索語")} aria-controls={searchDraft.trim()?"inline-search-results":undefined} enterKeyHint="search" autoComplete="off"/>{searchDraft?<button type="button" className="search-clear" onClick={()=>{setSearchDraft("");mainSearchRef.current?.focus({preventScroll:true});}} aria-label={t("검색어 지우기","検索語を消す")}><X size={18}/></button>:null}</form>
      {searchDraft.trim()&&!searchOpen?searchResults(true):null}
      <div className="quick-places"><span>{t("지금 떠올리는 곳","気になる場所")}</span>{discoveryDestinations.slice(0,3).map(d=><button key={d.pref} onClick={()=>choosePref(d.pref)}>{name(d.pref)}</button>)}</div>
     </div>
     {hero?.onsen&&!hero.photo.src?<div className="discovery-feature onsen-feature"><Waves size={28}/><span className="eyebrow">THE ONSEN</span><h2>{itemName(hero,lang)}</h2><p>{ko?hero.onsen.atmosphere:hero.onsen.ja.atmosphere}</p><button className="outline-button" onClick={()=>setDetail(hero)}>{t("온천 살펴보기","温泉を見る")}</button></div>:hero?<div className="discovery-feature">
      <button className="feature-photo" onClick={()=>setDetail(hero)} aria-label={`${name(hero.pref)} · ${name(hero.area)} · ${itemName(hero,lang)} ${t("살펴보기","を見る")}`}>
       <Picture photo={hero.photo} id={hero.id} alt="" eager/>
       <span className="feature-region" aria-hidden="true">{name(hero.pref)} · {name(hero.area)}</span>
       <FeatureTitle title={featureTitle(hero)}/>
      </button>
     </div>:null}
    </section>
    {!region&&!pref&&!query&&ready?destinationCards:null}
    <section className="catalog-section" id="places">
     <div className="section-heading"><div><span className="eyebrow">FIND YOUR NEXT PLACE</span><h2>{query?t("검색한 풍경","検索した風景"):pref?name(pref)+t("에서 만나는 것들","で出会うもの"):region?name(region)+t("를 걷는 방법","を歩く"):t("당신을 기다리는 일본.","あなたを待つ、日本。")}</h2></div><button className="text-button" onClick={()=>navigate("map")}><Map size={16}/>{t("지도에서 보기","地図で見る")}</button></div>
     <Tabs value={kind} onValueChange={s=>{setKind(s as ContentKind);setTown("");setQuery("");}}>
      <TabsList className="content-switch" variant="line">{(Object.keys(kindLabels) as ContentKind[]).map(k=>{const K=kindLabels[k];return <TabsTrigger key={k} value={k}><K.Icon size={17}/>{ko?K.ko:K.ja}</TabsTrigger>;})}</TabsList>
      {filterBar}
      {kind==="places"?categoryBar:null}
      {pref&&kind==="places"?<details className="town-filter"><summary>{t("시·마을로 좁혀 보기","市・町で絞り込む")}<ChevronDown size={15}/>{town?<b>{name(town)}</b>:null}</summary><div className="town-options"><button className={!town?"active":""} onClick={()=>setTown("")}>{t("전체","すべて")}</button>{towns.map(s=><button key={s} className={town===s?"active":""} onClick={()=>setTown(s)}>{name(s)}</button>)}</div></details>:null}
      <TabsContent value={kind} className="catalog-results">
       <div className="results-meta"><span>{results.length.toLocaleString()} {t("개의 발견","の出会い")}</span>{(region||pref||query||area||town||category!=="all"||month)?<button onClick={()=>{chooseRegion("");setQuery("");setCategory("all");setMonth("");}}>{t("필터 초기화","条件をリセット")}</button>:<span>{t("일본 전역에서","日本全国から")}</span>}</div>
       {results.length?<div className="place-grid">{results.slice(0,limit).map(i=>card(i))}</div>:ready?<div className="empty-state"><Search size={28}/><h3>{t("잠시, 다른 방향으로.","少し、別の方向へ。")}</h3><p>{t("선택한 조건에 맞는 장소가 없습니다. 지역이나 검색어를 바꿔보세요.","条件に合う場所がありません。エリアや検索語を変えてみてください。")}</p></div>:null}
       {results.length>limit?<button className="load-more" onClick={()=>setLimit(n=>n+24)}>{t("더 많은 발견","もっと見つける")} <span>+{Math.min(24,results.length-limit)}</span></button>:null}
      </TabsContent>
     </Tabs>
    </section>
   </>:<section className="map-workspace">
    <aside className="map-sidebar">
     <div className="map-sidebar-heading"><span className="eyebrow">YOUR JAPAN, ON THE MAP</span><h1>{pref?name(pref):region?name(region):t("일본을 펼치다.","日本をひらく。")}</h1><p>{region||pref?t("점을 눌러 이 주변의 장소를 만나세요.","ポイントから、この周辺の場所へ。"):t("지방을 고르면 그 안의 장소가 펼쳐집니다.","地方を選ぶと、その土地の場所が広がります。")}</p></div>
     {filterBar}
     {pref?<Picker value={area} onChange={s=>{setArea(s);setTown("");}} label={t("여행 권역","エリア")} options={[{value:"",label:t("모든 권역","すべてのエリア")},...areas.map(a=>({value:a,label:name(a)}))]}/>:null}
     {pref?<details className="town-filter"><summary>{t("시·마을 선택","市・町を選ぶ")}<ChevronDown size={15}/></summary><div className="town-options"><button className={!town?"active":""} onClick={()=>setTown("")}>{t("전체","すべて")}</button>{towns.map(s=><button key={s} className={town===s?"active":""} onClick={()=>setTown(s)}>{name(s)}</button>)}</div></details>:null}
     {categoryBar}
     <div className="map-list-heading"><span>{region||pref||query?mapPlaces.length+t("곳의 장소","か所の場所"):t("어느 지방으로 떠날까요?","どの地方へ出かけますか？")}</span>{region||pref||query?<button onClick={resetScope}>{t("일본 전국","日本全国")}</button>:null}</div>
     <div className="map-results">
     {!region&&!pref&&!query?catalog.regions.map(r=><button className="map-region-row" key={r.name} onClick={()=>chooseRegion(r.name)}><span>{ko?r.name:r.ja}</span><small>{r.prefs.length}{t("개 도도부현","都道府県")}</small></button>):mapPlaces.slice(0,limit).map(p=><div className={"map-place-row"+(mapFocus?.id===p.id?" selected":"")} key={p.id}><button onClick={()=>{setMapFocus(p);if(window.matchMedia("(max-width: 600px)").matches)window.scrollTo({top:0,behavior:"smooth"});}}><Picture photo={p.photo} id={p.id} alt={itemName(p,lang)} textOnly={!!p.onsen&&!p.photo.src}/><span><small>{name(p.pref)} · {name(p.town)}</small><strong>{itemName(p,lang)}</strong><em>{localized(p,"tag",lang)}</em></span></button><button className="map-row-save" onClick={()=>toggleSave(p)} aria-pressed={saved.includes(p.id)} aria-label={itemName(p,lang)+t(" 저장","を保存")}><Bookmark size={16} fill={saved.includes(p.id)?"currentColor":"none"}/></button></div>)}
     {(region||pref||query)&&mapPlaces.length>limit?<button className="load-more" onClick={()=>setLimit(n=>n+24)}>{t("장소 더 보기","場所をもっと見る")}</button>:null}
     {(region||pref||query)&&!mapPlaces.length&&ready?<div className="empty-state"><p>{t("조건에 맞는 장소가 없습니다.","条件に合う場所がありません。")}</p></div>:null}
     </div>
    </aside>
    <div className="map-surface">
     {ready?<JapanMap catalog={catalog} places={mapPlaces} region={region} pref={pref} lang={lang} selected={mapFocus?.id} onPref={choosePref} onRegion={s=>s?chooseRegion(s):resetScope()} onPlace={setMapFocus} onClearPlace={()=>setMapFocus(null)}/>:<div className="map-loading"><Loader2 className="spin"/><span>{t("지도를 준비하고 있습니다.","地図を準備しています。")}</span></div>}
     {scopeNav("map-scope")}
     {mapFocus?<aside className="map-place-preview" aria-label={t("선택한 장소","選んだ場所")}>
      <button className="map-preview-close" onClick={()=>setMapFocus(null)} aria-label={t("장소 선택 닫기","場所の選択を閉じる")}><X size={17}/></button>
      <div className="map-preview-lead"><Picture photo={mapFocus.photo} id={mapFocus.id} alt={itemName(mapFocus,lang)} textOnly={!!mapFocus.onsen&&!mapFocus.photo.src}/><div><span>{name(mapFocus.pref)} · {name(mapFocus.town)}</span><h2>{itemName(mapFocus,lang)}</h2><small>{name(mapFocus.area)}</small></div></div>
      <div className="map-preview-actions"><button onClick={()=>setDetail(mapFocus)}>{t("장소 자세히 보기","場所を詳しく見る")}</button><a href={mapFocus.mapExternal} target="_blank" rel="noreferrer">{t("실제 지도","実際の地図")}<ExternalLink size={13}/></a></div>
      {nearby.length?<div className="map-nearby"><span>{t("주변 장소 · 직선 거리","周辺の場所 · 直線距離")}</span>{nearby.map(n=><button key={n.place.id} onClick={()=>{const p=n.place;if(!mapPlaces.some(item=>item.id===p.id)){choosePref(p.pref);setCategory("all");setQuery("");}setMapFocus(p);}}><span>{itemName(n.place,lang)}</span><small>{n.distance<1?Math.round(n.distance*1000)+" m":n.distance.toFixed(1)+" km"}</small></button>)}</div>:null}
     </aside>:null}
    </div>
   </section>}
   </main>
  </TabsContent>}

  {view==="explore"?<footer className="site-footer"><button className="footer-brand" onClick={()=>navigate("intro")}>Jatlas.</button><span>JAPAN, AT YOUR PACE.</span><div><button onClick={()=>navigate("explore")}>{t("탐색","見つける")}</button><button onClick={()=>navigate("map")}>{t("지도","地図")}</button><button onClick={()=>setSaveOpen(true)}>{t("나의 여행","わたしの旅")}</button></div></footer>:null}

  <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
   <SheetContent side="top" className="global-search-sheet" showCloseButton={false} style={searchViewport?{"--search-top":`${searchViewport.top}px`,"--search-height":`${searchViewport.height}px`} as CSSProperties:undefined} onOpenAutoFocus={e=>{e.preventDefault();searchRef.current?.focus({preventScroll:true});}} onCloseAutoFocus={e=>{if(detail)e.preventDefault();}}>
    <div className="search-heading"><SheetTitle>{t("일본 여행 검색","日本の旅を検索")}</SheetTitle><button className="icon-button" onClick={()=>setSearchOpen(false)} aria-label={t("검색 닫기","検索を閉じる")}><X size={20}/></button></div>
    <SheetDescription className="search-description">{t("관광지, 음식, 여행 코스와 지역을 검색하세요.","観光地、食べ物、旅のコースや地域を検索。")}</SheetDescription>
    <form className="search-field" role="search" onSubmit={e=>{e.preventDefault();searchRef.current?.blur();}}><Search size={22}/><input ref={searchRef} type="search" value={searchDraft} onChange={e=>setSearchDraft(e.target.value)} placeholder={t("장소·음식·지역 이름","場所・食べ物・地域の名前")} aria-label={t("검색어","検索語")} enterKeyHint="search" autoComplete="off"/></form>
    {searchDraft.trim()?searchResults():null}
   </SheetContent>
  </Sheet>

  <Sheet open={!!detail} onOpenChange={o=>{if(!o)setDetail(null);}}>
   <SheetContent className="detail-sheet" side="right" showCloseButton={false}
    onClick={e=>{if(window.innerWidth>640||!detail||!isPlace(detail))return;const target=e.target as HTMLElement;if(!target.closest("a,button,input,select,textarea,iframe,[role=tab]"))setDetail(null);}}>
    {detail?<>{isPlace(detail)&&detail.onsen&&!detail.photo.src?<div className="detail-text-top"><Waves size={24}/><span>{t("온천지","温泉地")}</span><button className="detail-close" onClick={()=>setDetail(null)} aria-label={t("상세 닫기","詳細を閉じる")}><X size={21}/></button></div>:<div className="detail-photo"><Picture photo={itemPhoto(detail,catalog)} id={isPlace(detail)?detail.id:isRoute(detail)?catalog.places.find(p=>p.legacyId===detail.days[0]?.places[0])?.id:undefined} alt={itemName(detail,lang)} eager/>
     <button className="detail-close" onClick={()=>setDetail(null)} aria-label={t("상세 닫기","詳細を閉じる")}><X size={21}/></button>
     <span className="detail-photo-label">{isPlace(detail)||isFood(detail)?t("사진으로 만나는 여행","写真で出会う旅"):t("지역 풍경","地域の風景")}</span>
    </div>}
    <div className="detail-body">
     <div className="detail-breadcrumb"><button onClick={()=>{chooseRegion("");navigate("explore");}}>{t("일본","日本")}</button>{catalog.prefs.find(p=>p.name===detail.pref)?.region!==detail.pref?<><span>/</span><button onClick={()=>{chooseRegion(catalog.prefs.find(p=>p.name===detail.pref)?.region||"");navigate("explore");}}>{name(catalog.prefs.find(p=>p.name===detail.pref)?.region||"")}</button></>:null}<span>/</span><button onClick={()=>{choosePref(detail.pref);navigate("explore");}}>{name(detail.pref)}</button>{"area" in detail&&detail.area?<><span>/</span><span>{name(detail.area)}</span></>:null}</div>
     <div className="detail-title-row"><SheetTitle className="detail-title">{itemName(detail,lang)}</SheetTitle><button className={"detail-save"+(saved.includes(detail.id)?" saved":"")} onClick={()=>toggleSave(detail)} aria-pressed={saved.includes(detail.id)} aria-label={t("저장","保存")}><Bookmark size={23} fill={saved.includes(detail.id)?"currentColor":"none"}/></button></div>
     <SheetDescription className="detail-description">{isRoute(detail)?localized(detail,"intro",lang):localized(detail,"description",lang)}</SheetDescription>
     <Credit photo={itemPhoto(detail,catalog)} lang={lang}/>
     {isPlace(detail)?<>
      <div className="detail-facts">{detail.guide?.duration?<span><Clock size={16}/>{ko?detail.guide.duration:detail.ja.duration}</span>:null}<span><MapPin size={16}/>{ko?detail.town:detail.ja.town}</span><span>{localized(detail,"tag",lang)}</span></div>
      <WeatherPill lat={detail.lat} lon={detail.lon} label={ko?detail.town:detail.ja.town} lang={lang}/>
      {detail.onsen?<OnsenDetails guide={detail.onsen} lang={lang} hideAtmosphere={detail.description===detail.onsen.atmosphere}/>:null}
      {!detail.onsen||detail.activity!==detail.onsen.stay?<section className="detail-section"><span className="eyebrow">THE EXPERIENCE</span><h3>{t("이곳에서의 시간","ここで過ごす時間")}</h3><p>{localized(detail,"activity",lang)}</p></section>:null}
      {detail.guide?.access?<section className="detail-section"><span className="eyebrow">GETTING THERE</span><h3>{t("가는 길","アクセス")}</h3><p>{ko?detail.guide.access:detail.ja.access}</p></section>:null}
      <div className="detail-actions"><a className="solid-button" href={detail.mapExternal.replace(/hl=ko/,"hl="+lang)} target="_blank" rel="noreferrer"><Map size={17}/>{t("Google 지도","Google マップ")}</a><button className="outline-button" onClick={()=>addToNote(detail)}><Plus size={17}/>{t("여행 노트에 담기","旅のノートへ")}</button></div>
      {detail.source?<a className="official-link" href={detail.source} target="_blank" rel="noreferrer">{t("공식 방문 안내","公式の訪問案内")}</a>:null}
      <div className="detail-mini-map"><span>{detail.lat.toFixed(5)}° N · {detail.lon.toFixed(5)}° E</span><button onClick={()=>{choosePref(detail.pref);setArea(detail.area);navigate("map");}}>{t("Jatlas 지도에서 보기","Jatlas の地図で見る")}</button></div>
     </>:isRoute(detail)?<>
      <div className="detail-facts"><span><Clock size={16}/>{localized(detail,"duration",lang)}</span><span>{name(detail.pref)}</span></div>
      <div className="route-itinerary">{detail.days.map((day,index)=><section key={index}><span className="eyebrow">DAY {String(index+1).padStart(2,"0")}</span><h3>{ko?day.label:detail.ja.days?.[index]?.label||day.label}</h3><ol>{day.places.map((id,n)=>{const p=catalog.places.find(p=>p.legacyId===id);const row=(ko?day.schedule:detail.ja.days?.[index]?.schedule)?.find(s=>s[0]===id);return p?<li key={id}><span>{String(n+1).padStart(2,"0")}</span><div><button onClick={()=>setDetail(p)}>{itemName(p,lang)}</button>{row?.[1]?<small>{row[1]}</small>:null}{row?.[2]?<p>{row[2]}</p>:null}</div></li>:null;})}</ol></section>)}</div>
      <p className="route-note">{localized(detail,"note",lang)}</p><button className="solid-button" onClick={()=>addRoute(detail)}><Plus size={17}/>{t("이 코스를 여행 노트에","このコースを旅のノートに")}</button>
     </>:isFood(detail)?<>{detail.source?<a className="solid-button" href={detail.source} target="_blank" rel="noreferrer">{t("음식 이야기 더 보기","食の話をもっと読む")}</a>:null}</>:<>
      <div className="event-months">{(detail as TravelEvent).months?.map(m=><span key={m}>{m}{t("월","月")}</span>)}</div><p className="event-note">{t("해마다 일정이 달라질 수 있습니다. 방문 날짜는 공식 안내에서 확인하세요.","開催日は年によって変わることがあります。訪問日は公式案内で確認してください。")}</p>
      {(detail as TravelEvent).source?<a className="solid-button" href={(detail as TravelEvent).source} target="_blank" rel="noreferrer">{t("공식 행사 안내","公式イベント情報")}</a>:null}
     </>}
    </div></>:<SheetTitle className="sr-only">{t("장소 상세","場所の詳細")}</SheetTitle>}
   </SheetContent>
  </Sheet>

  <Sheet open={saveOpen} onOpenChange={setSaveOpen}>
   <SheetContent className="saved-sheet" showCloseButton={false}>
    <div className="saved-header"><span className="eyebrow">YOUR PERSONAL ATLAS</span><button className="icon-button" onClick={()=>setSaveOpen(false)} aria-label={t("나의 여행 닫기","わたしの旅を閉じる")}><X size={20}/></button><SheetTitle>{t("나의 여행.","わたしの旅。")}</SheetTitle><SheetDescription>{t("다음 여행에 남겨두고 싶은 것들.","次の旅に、残しておきたいもの。")}</SheetDescription></div>
    <Tabs value={noteTab} onValueChange={setNoteTab}>
     <TabsList className="note-tabs" variant="line"><TabsTrigger value="saved">{t("저장한 발견","保存した出会い")} <span>{saved.length}</span></TabsTrigger><TabsTrigger value="note">{t("여행 노트","旅のノート")}</TabsTrigger></TabsList>
     <TabsContent value="saved" className="saved-list">{savedItems.length?savedItems.map(i=><div className="saved-item" key={i.id}><button onClick={()=>{setSaveOpen(false);setDetail(i);}}><Picture photo={itemPhoto(i,catalog)} id={isPlace(i)?i.id:undefined} alt={itemName(i,lang)} textOnly={isPlace(i)&&!!i.onsen&&!i.photo.src}/><span><small>{name(i.pref)}</small><strong>{itemName(i,lang)}</strong></span></button><button className="icon-button" onClick={()=>toggleSave(i)} aria-label={itemName(i,lang)+t(" 저장 해제","の保存を解除")}><X size={16}/></button>{isPlace(i)?<button className="add-note" onClick={()=>addToNote(i)} aria-label={t("여행 노트에 추가","旅のノートに追加")}><Plus size={16}/></button>:null}</div>):<div className="empty-state"><Bookmark size={30}/><h3>{t("마음에 드는 풍경을 남겨보세요.","心に残る風景を保存。")}</h3><p>{t("장소의 책갈피를 누르면 여기에 모입니다.","場所のブックマークを押すと、ここに集まります。")}</p><button className="outline-button" onClick={()=>{setSaveOpen(false);navigate("explore");}}>{t("풍경 만나러 가기","風景に出会う")}</button></div>}</TabsContent>
     <TabsContent value="note" className="travel-note">
      {!days.length?<div className="empty-state"><RouteIcon size={30}/><h3>{t("당신의 동선을 그려보세요.","あなたの旅を描く。")}</h3><p>{t("장소 상세나 추천 코스에서 여행 노트에 담을 수 있습니다.","場所の詳細やおすすめコースから、旅のノートに追加できます。")}</p></div>:null}
      {days.map((day,di)=><section className="note-day" key={day.id}><div className="note-day-header"><h3>DAY {String(di+1).padStart(2,"0")}</h3><input type="date" aria-label={t("방문 날짜","訪問日")} value={day.date} onChange={e=>setDays(ds=>ds.map(d=>d.id===day.id?{...d,date:e.target.value}:d))}/><button className="icon-button" onClick={()=>setDays(ds=>ds.filter(d=>d.id!==day.id))} aria-label={t("하루 삭제","この日を削除")}><Trash2 size={16}/></button></div>
       {day.stops.map((stop,si)=>{const p=catalog.places.find(p=>p.id===stop.id);if(!p)return null;return <div className="note-stop" key={stop.id}><span className="stop-index">{si+1}</span><div><button onClick={()=>{setSaveOpen(false);setDetail(p);}}>{itemName(p,lang)}</button><small>{name(p.area)}</small></div><input type="time" value={stop.time} aria-label={itemName(p,lang)+t(" 방문 시간","訪問時間")} onChange={e=>setDays(ds=>ds.map(d=>d.id===day.id?{...d,stops:d.stops.map((s,i)=>i===si?{...s,time:e.target.value}:s)}:d))}/><button className="icon-button" onClick={()=>setDays(ds=>ds.map(d=>d.id===day.id?{...d,stops:d.stops.filter((_,i)=>i!==si)}:d))} aria-label={itemName(p,lang)+t(" 삭제","を削除")}><X size={15}/></button></div>;})}
       {!day.stops.length?<p className="empty-day">{t("장소 상세에서 이 날의 장소를 담아보세요.","場所の詳細から、この日の場所を追加してください。")}</p>:null}
      </section>)}
      <button className="outline-button" onClick={()=>setDays(ds=>[...ds,{id:dayId(),date:"",stops:[]}])}><Plus size={17}/>{t("하루 추가","1日を追加")}</button>
      {days.length?<button className="text-button note-export" onClick={()=>{const blob=new Blob([JSON.stringify({title:"Jatlas travel note",days:days.map(d=>({...d,stops:d.stops.map(s=>({...s,name:catalog.places.find(p=>p.id===s.id)?.name}))}))},null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="Jatlas-travel-note.json";a.click();URL.revokeObjectURL(url);}}><Download size={16}/>{t("여행 노트 다운로드","旅のノートをダウンロード")}</button>:null}
     </TabsContent>
    </Tabs><p className="device-note">{t("저장한 발견과 여행 노트는 이 기기에 보관됩니다.","保存した出会いと旅のノートは、この端末に保存されます。")}</p>
   </SheetContent>
  </Sheet>
  {feedback?<div className="app-feedback" role="status"><Check size={16}/>{feedback}</div>:null}
 </Tabs>;
}
