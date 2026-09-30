/* Shared integration for researched prefectures. Stable place IDs preserve saved plans. */
const regionalPlaces=regionalCatalog.flatMap(r=>r.places);
const regionalByPref=new Map(regionalCatalog.map(r=>[r.pref,r]));
for(const r of regionalCatalog){
 if(!completePrefs.includes(r.pref))completePrefs.push(r.pref);
 Object.assign(tokyoPhotos,r.photos);
 if(r.hero)designPhotos[r.pref]=r.hero;
 Object.assign(tokyoVisitGuides,r.guides);
 Object.assign(areaIntros,r.intros);
 for(const [area,id] of Object.entries(r.heroes)){if(r.photos[id])designPhotos[area]=r.photos[id]}
 for(const area of Object.keys(r.intros||{})){
  if(area===r.pref||designPhotos[area])continue;
  const p=r.places.find(x=>x.area===area&&r.photos[x.id]);
  if(p)designPhotos[area]=r.photos[p.id];
 }
 for(const p of r.places){if(Number.isFinite(p.lat)&&Number.isFinite(p.lon))pointLocations[p.id]={lat:p.lat,lon:p.lon,note:p.note,source:p.coordinateSource||p.source};}
}
const previousRegionalEvents=eventsForPref;eventsForPref=p=>regionalByPref.get(p)?.events||previousRegionalEvents(p);
const previousRegionalFoods=foodsForPref;foodsForPref=p=>regionalByPref.get(p)?.foods||previousRegionalFoods(p);
const previousRegionalAllEvents=allEvents;allEvents=()=>[...previousRegionalAllEvents(),...regionalCatalog.flatMap(r=>r.events)];
