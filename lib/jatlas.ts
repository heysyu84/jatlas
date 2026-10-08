export type Photo = { src: string; alt?: string; source?: string; author?: string; licenseUrl?: string; license?:string; modifications?:string; userPhoto?: boolean; canonicalId?: string };
export type OnsenText = { springType: string; water: string; atmosphere: string; dayVisit: string; stay: string; tip: string };
export type OnsenGuide = OnsenText & { ja: OnsenText; checkedAt: string; sources: {name: string;ja?: string;url: string}[] };
export type Place = { id: string; legacyId: number; name: string; pref: string; area: string; town: string; tag: string; description: string; activity: string; photo: Photo; guide: {access?: string; duration?: string}; lat: number; lon: number; source?: string; mapExternal: string; ja: Record<string,string>; onsen?: OnsenGuide; heroEligible?: boolean };
export type OnsenData = { version: string; additions: Place[]; guides: Record<string, OnsenGuide> };
export type Food = { id: string; name: string; pref: string; area: string; kind: string; description: string; source?: string; photo: Photo; ja: Record<string,string>; type: 'food' };
export type TravelEvent = { id: string; name: string; pref: string; area: string; description: string; source: string; months?: number[]; timing?: string; scheduleType?: string; type?: string; ja: Record<string,string> };
export type Route = { id: string; pref: string; areas: string[]; title: string; intro: string; duration: string; note: string; image?: string; days: {label:string;places:number[];schedule:[number,string,string][]}[]; ja: {title:string;intro:string;duration:string;note:string;days:Route['days']} };
export type Catalog = { version:string; places:Place[]; foods:Food[]; events:TravelEvent[]; routes:Route[]; prefs:{name:string;ja:string;region:string;count:number}[]; regions:{name:string;ja:string;prefs:string[]}[]; dict:Record<string,string>; overviews?:Record<string,{ko:string;ja:string}> };
export type Geography = {id:number;name:string;rings:[number,number][][]};
export type Item = Place | Food | TravelEvent | Route;
export type ContentKind = 'places' | 'foods' | 'routes' | 'events';
import introCatalog from './intro.json';
export const photoURL = (src?:string,_id?:string) => src ? /^https?:/.test(src) ? src : './' + src.replace(/^\.?\//,'') : '';
export const sceneImages:Record<string,string> = Object.fromEntries(introCatalog.map(p=>[p.id,photoURL(p.photo.src)]));
export const categoryMatch = (p: Place, category:string) => category==='all'||category==='onsen'&&!!p.onsen||({nature:/자연|전망|산악|계곡|고원|트레킹|산책|폭포|협곡|해안|섬|호수|공원|꽃/,town:/거리|마을|시장|상점|항구|산책/,culture:/신사|사찰|역사|성|유적|미술|박물관|정원/,onsen:/온천/,night:/야경|전망|타워/,shopping:/쇼핑|상점|시장|공예/} as Record<string,RegExp>)[category]?.test(p.tag+' '+p.name);
export function mergeOnsenCatalog(catalog: Catalog, data: OnsenData): Catalog {
 const existing = new Set(catalog.places.map(p=>p.id));
 const places = [...catalog.places, ...data.additions.filter(p=>!existing.has(p.id))].map(p=>data.guides[p.id]?{...p,onsen:data.guides[p.id]}:p);
 return {...catalog,places,prefs:catalog.prefs.map(p=>({...p,count:places.filter(place=>place.pref===p.name).length}))};
}
export function localized(item:Item,key:string,lang:string):string {
  const a=item as unknown as Record<string,unknown>;
  if(lang==='ja'&&a.ja && (a.ja as Record<string,string>)[key])return (a.ja as Record<string,string>)[key];
  return typeof a[key]==='string'?a[key] as string:'';
}
export function isPlace(i:Item):i is Place{return 'legacyId' in i;}
export function isRoute(i:Item):i is Route{return 'days' in i;}
export function isFood(i:Item):i is Food{return 'kind' in i && !isPlace(i);}
export function itemPhoto(i:Item,c?:Catalog):Photo|undefined {
  if(isRoute(i)){const p=c?.places.find(p=>p.legacyId===i.days?.[0]?.places?.[0]);return p?.photo;}
  if('photo' in i)return i.photo;
  return c?.places.find(p=>p.pref===i.pref&&p.area===i.area)?.photo;
}
export function mercator([lon,lat]:[number,number]):[number,number]{return [lon*12,-Math.log(Math.tan(Math.PI/4+lat*Math.PI/360))*180/Math.PI*12];}
