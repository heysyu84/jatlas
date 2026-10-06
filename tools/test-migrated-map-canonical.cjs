/* Map-only regression test for migrated regions. Deliberately excludes photo/file QA. */
const assert=require('node:assert/strict'),vm=require('node:vm');
const {ctx,result}=require('./audit-content.cjs');
const migratedPrefs=['기후','시즈오카','아이치','미에','아오모리','이와테','미야기','아키타','야마가타','후쿠시마','홋카이도','이바라키','도치기','군마','니가타','야마나시','나가노','도야마','이시카와','후쿠이','사이타마','지바','도쿄','가나가와'];
const expected={'기후':22,'시즈오카':20,'아이치':20,'미에':21,'아오모리':31,'이와테':33,'미야기':24,'아키타':24,'야마가타':24,'후쿠시마':24,'홋카이도':42,'이바라키':16,'도치기':19,'군마':16,'니가타':24,'야마나시':31,'나가노':24,'도야마':23,'이시카와':24,'후쿠이':24,'사이타마':23,'지바':27,'도쿄':54,'가나가와':28};
const canonical=vm.runInContext('globalThis.JATLAS_MAP_CANONICAL||{}',ctx);
const migrated=result.places.filter(p=>migratedPrefs.includes(p.pref));
assert.equal(migrated.length,618,'migrated place count');
for(const [pref,count] of Object.entries(expected))assert.equal(migrated.filter(p=>p.pref===pref).length,count,pref+' place count');
for(const p of migrated){
 const c=canonical[p.id];
 assert.ok(c,'missing canonical target '+p.id+' '+p.name);
 assert.ok(Number.isFinite(c.lat)&&Number.isFinite(c.lon),'invalid coordinates '+p.id);
 const embed=new URL(p.mapEmbed), external=new URL(p.mapExternal);
 assert.equal(embed.searchParams.get('q'),`${c.lat},${c.lon}`,'embed coordinate '+p.id);
 assert.equal(embed.searchParams.get('output'),'embed','embed mode '+p.id);
 if(c.coordinateOnly)assert.equal(external.searchParams.get('q'),`${c.lat},${c.lon}`,'external coordinate '+p.id);
 else if(c.placeId)assert.equal(external.searchParams.get('query_place_id'),c.placeId,'external place id '+p.id);
 else if(c.cid)assert.equal(external.searchParams.get('cid'),String(c.cid),'external cid '+p.id);
 else assert.fail('canonical target has no external identity strategy '+p.id);
}
assert.equal(canonical[910].coordinateOnly,true,'Gujo Hachiman town must not resolve to Gujo City entity');
assert.equal(canonical[910].lat,35.7499145,'Gujo Hachiman old town representative latitude');
assert.equal(canonical[910].lon,136.9592947,'Gujo Hachiman old town representative longitude');
assert.equal(canonical[318].lat,35.61578856734431,'Saruhashi must keep verified bridge latitude');
assert.equal(canonical[318].lon,138.98026392791476,'Saruhashi must keep verified bridge longitude');
assert.equal(canonical[602].lat,35.7243611,'National Museum of Japanese History latitude');
assert.equal(canonical[602].lon,140.2191306,'National Museum of Japanese History longitude');
assert.equal(String(canonical[602].cid),'1807054994798992362','National Museum of Japanese History exact Google CID');
assert.ok(!Object.values(canonical).some(x=>Object.prototype.hasOwnProperty.call(x,'note')),'canonical map QA notes must not leak into public data');
assert.equal(canonical[4018].coordinateOnly,true,'Hakodate Morning Market fallback must use fixed coordinates');
assert.equal(new URL(vm.runInContext('googlePlaceMapURL(samples.find(p=>p.id===4019),false)',ctx)).searchParams.get('query_place_id'),'ChIJT_xUJ6rznl8RXrmIZ5nBJjY','Hachimanzaka exact place identity');
console.log(JSON.stringify({places:migrated.length,canonical:Object.keys(canonical).length,status:'ok'}));
