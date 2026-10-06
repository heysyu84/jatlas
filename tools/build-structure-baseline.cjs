'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const cp = require('node:child_process');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const audits = path.join(root, 'audits');
fs.mkdirSync(audits, { recursive: true });

const PREFS = [
  ['01','홋카이도','hokkaido','홋카이도','hokkaido'],
  ['02','아오모리','aomori','도호쿠','tohoku'],
  ['03','이와테','iwate','도호쿠','tohoku'],
  ['04','미야기','miyagi','도호쿠','tohoku'],
  ['05','아키타','akita','도호쿠','tohoku'],
  ['06','야마가타','yamagata','도호쿠','tohoku'],
  ['07','후쿠시마','fukushima','도호쿠','tohoku'],
  ['08','이바라키','ibaraki','북간토','north-kanto'],
  ['09','도치기','tochigi','북간토','north-kanto'],
  ['10','군마','gunma','북간토','north-kanto'],
  ['11','사이타마','saitama','수도권','greater-tokyo'],
  ['12','지바','chiba','수도권','greater-tokyo'],
  ['13','도쿄','tokyo','수도권','greater-tokyo'],
  ['14','가나가와','kanagawa','수도권','greater-tokyo'],
  ['15','니가타','niigata','고신에쓰','koshinetsu'],
  ['16','도야마','toyama','호쿠리쿠','hokuriku'],
  ['17','이시카와','ishikawa','호쿠리쿠','hokuriku'],
  ['18','후쿠이','fukui','호쿠리쿠','hokuriku'],
  ['19','야마나시','yamanashi','고신에쓰','koshinetsu'],
  ['20','나가노','nagano','고신에쓰','koshinetsu'],
  ['21','기후','gifu','도카이','tokai'],
  ['22','시즈오카','shizuoka','도카이','tokai'],
  ['23','아이치','aichi','도카이','tokai'],
  ['24','미에','mie','도카이','tokai'],
  ['25','시가','shiga','긴키','kinki'],
  ['26','교토','kyoto','긴키','kinki'],
  ['27','오사카','osaka','긴키','kinki'],
  ['28','효고','hyogo','긴키','kinki'],
  ['29','나라','nara','긴키','kinki'],
  ['30','와카야마','wakayama','긴키','kinki'],
  ['31','돗토리','tottori','산인·산요','sanin-sanyo'],
  ['32','시마네','shimane','산인·산요','sanin-sanyo'],
  ['33','오카야마','okayama','산인·산요','sanin-sanyo'],
  ['34','히로시마','hiroshima','산인·산요','sanin-sanyo'],
  ['35','야마구치','yamaguchi','산인·산요','sanin-sanyo'],
  ['36','도쿠시마','tokushima','시코쿠','shikoku'],
  ['37','가가와','kagawa','시코쿠','shikoku'],
  ['38','에히메','ehime','시코쿠','shikoku'],
  ['39','고치','kochi','시코쿠','shikoku'],
  ['40','후쿠오카','fukuoka','규슈','kyushu'],
  ['41','사가','saga','규슈','kyushu'],
  ['42','나가사키','nagasaki','규슈','kyushu'],
  ['43','구마모토','kumamoto','규슈','kyushu'],
  ['44','오이타','oita','규슈','kyushu'],
  ['45','미야자키','miyazaki','규슈','kyushu'],
  ['46','가고시마','kagoshima','규슈','kyushu'],
  ['47','오키나와','okinawa','오키나와','okinawa']
].map(([code,name,slug,region,regionSlug])=>({code,name,slug,region,regionSlug}));
const PREF_BY_NAME = new Map(PREFS.map(x=>[x.name,x]));

function sh(args, opts={}) {
  return cp.execFileSync(args[0], args.slice(1), { cwd: root, encoding: 'utf8', stdio: ['ignore','pipe','pipe'], ...opts }).trim();
}
function cleanSrc(value) {
  return String(value || '').replace(/^\.\//,'').split(/[?#]/)[0];
}
function hashFile(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}
function normText(value) {
  return String(value || '').normalize('NFKC').trim();
}
function sameSource(a,b) {
  return normText(a) === normText(b);
}
function readSourceRegistry() {
  const file = path.join(dist,'photo-source-registry.js');
  const text = fs.readFileSync(file,'utf8').trim();
  const prefix = 'globalThis.JATLAS_PHOTO_SOURCE_REGISTRY=';
  if (!text.startsWith(prefix)) throw new Error('Unexpected photo-source-registry.js format');
  const registry = JSON.parse(text.slice(prefix.length).replace(/;\s*$/,''));
  const canonicalFile = path.join(dist,'photo-registry-data.js');
  if (fs.existsSync(canonicalFile)) {
    const canonicalText = fs.readFileSync(canonicalFile,'utf8').trim();
    const canonicalPrefix = 'globalThis.JATLAS_PHOTO_REGISTRY_DATA=';
    if (canonicalText.startsWith(canonicalPrefix)) {
      const canonical = JSON.parse(canonicalText.slice(canonicalPrefix.length).replace(/;\s*$/,''));
      for (const r of [...Object.values(canonical.places||{}),...Object.values(canonical.foods||{})]) {
        if (!r.image) continue;
        registry[cleanSrc(r.image)] = {source:r.source||'',terms:r.terms||'',author:r.author||'',placeId:r.legacyId??null,foodName:r.name||'',canonicalId:r.canonicalId||'',userPhoto:!!r.userPhoto};
      }
    }
  }
  return registry;
}
function walk(dir, out=[]) {
  for (const e of fs.readdirSync(dir,{withFileTypes:true})) {
    if (e.name === '.git') continue;
    const full = path.join(dir,e.name);
    if (e.isDirectory()) walk(full,out); else out.push(full);
  }
  return out;
}
function repoRel(file) { return path.relative(root,file).split(path.sep).join('/'); }
function imageRelFromDist(file) { return path.relative(dist,file).split(path.sep).join('/'); }
function refCategory(file) {
  const p=repoRel(file);
  if (p === 'dist/photo-source-registry.js') return 'registry';
  if (p.startsWith('dist/')) return 'runtime';
  if (p.startsWith('tools/')) return 'tools';
  if (p.startsWith('.github/workflows/')) return 'workflow';
  if (p.startsWith('sources/')) return 'sources';
  if (p.startsWith('audits/')) return 'audits';
  if (p.startsWith('docs/')) return 'docs';
  return 'other';
}
function isTextCandidate(file) {
  const rel=repoRel(file);
  if (rel.startsWith('dist/images/')) return false;
  const ext=path.extname(file).toLowerCase();
  return ['.js','.cjs','.mjs','.json','.html','.css','.md','.py','.yml','.yaml','.txt','.toml'].includes(ext) || path.basename(file)==='_redirects';
}
function extractImageRefs(text) {
  const set=new Set();
  const re=/images\/[A-Za-z0-9_./%+@()'&=,\-]+?\.(?:webp|jpe?g|png|svg)(?:\?[^\s"'`<>)]+)?/gi;
  for (const m of text.matchAll(re)) set.add(cleanSrc(m[0]));
  return [...set];
}
function addMapSet(map,key,value){if(!key)return;if(!map.has(key))map.set(key,new Set());map.get(key).add(value)}

const head = sh(['git','rev-parse','HEAD']);
const tempRuntime = path.join(os.tmpdir(),`jatlas-runtime-${process.pid}.json`);
cp.execFileSync(process.execPath,[path.join(root,'tools/audit-content.cjs'),tempRuntime],{cwd:root,stdio:['ignore','pipe','pipe']});
const runtime = JSON.parse(fs.readFileSync(tempRuntime,'utf8'));
try{fs.unlinkSync(tempRuntime)}catch{}

const sourceRegistry = readSourceRegistry();
const officialManifest = JSON.parse(fs.readFileSync(path.join(root,'tools/official-photo-assets.json'),'utf8'));
const manifestByOutput = new Map((officialManifest.photos||[]).filter(x=>x.output).map(x=>[cleanSrc(x.output),x]));

const effectivePlaceRefs=new Map(),effectiveFoodRefs=new Map(),effectiveHeroRefs=new Map();
for(const p of runtime.places||[]) addMapSet(effectivePlaceRefs,cleanSrc(p.photo?.src),Number(p.id));
for(const pref of runtime.prefectures||[]) for(const f of pref.foods||[]) addMapSet(effectiveFoodRefs,cleanSrc(f.image || f.photo?.src),`${pref.pref}|${f.name}`);
for(const [key,photo] of Object.entries(runtime.heroes||{})) addMapSet(effectiveHeroRefs,cleanSrc(photo?.src),key);

const allFiles=walk(root);
const textRefs=new Map();
for(const file of allFiles.filter(isTextCandidate)){
  let text=''; try{text=fs.readFileSync(file,'utf8')}catch{continue}
  for(const img of extractImageRefs(text)){
    if(!textRefs.has(img))textRefs.set(img,[]);
    textRefs.get(img).push({file:repoRel(file),category:refCategory(file)});
  }
}

const imageFiles=allFiles.filter(file=>{
  const rel=repoRel(file);
  return rel.startsWith('dist/images/') && /\.(?:webp|jpe?g|png|svg)$/i.test(file);
});
const imageSet=new Set(imageFiles.map(imageRelFromDist));
const duplicateSha=new Map();
const imageEntries=[];
for(const file of imageFiles){
  const image=imageRelFromDist(file);
  const sha256=hashFile(file);
  addMapSet(duplicateSha,sha256,image);
  const refs=textRefs.get(image)||[];
  const placeIds=[...(effectivePlaceRefs.get(image)||[])].sort((a,b)=>a-b);
  const foodKeys=[...(effectiveFoodRefs.get(image)||[])].sort();
  const heroKeys=[...(effectiveHeroRefs.get(image)||[])].sort((a,b)=>a.localeCompare(b,'ko'));
  const registry=sourceRegistry[image]||null;
  const manifest=manifestByOutput.get(image)||null;
  const strongRefs=refs.filter(r=>!['audits','docs'].includes(r.category));
  const effective=placeIds.length+foodKeys.length+heroKeys.length;
  let status='OBSOLETE_CANDIDATE';
  if(effective>0)status='ACTIVE';
  else if(strongRefs.length || registry || manifest)status='HOLD';
  imageEntries.push({image,sha256,size:fs.statSync(file).size,status,effective:{placeIds,foodKeys,heroKeys},registry:registry?{placeId:registry.placeId??null,foodName:registry.foodName||'',source:registry.source||'',terms:registry.terms||'',author:registry.author||''}:null,manifest:manifest?{placeId:manifest.placeId??null,foodName:manifest.foodName||'',source:manifest.source||'',output:manifest.output||''}:null,references:refs});
}
imageEntries.sort((a,b)=>a.image.localeCompare(b.image));

const duplicateImages=[...duplicateSha.entries()].filter(([,s])=>s.size>1).map(([sha256,s])=>({sha256,images:[...s].sort()}));

const legacyIdSeen=new Map();
for(const p of runtime.places||[]) addMapSet(legacyIdSeen,String(Number(p.id)),`${p.pref}|${p.name}`);
const duplicateLegacyIds=[...legacyIdSeen.entries()].filter(([,s])=>s.size>1).map(([legacyId,s])=>({legacyId:Number(legacyId),places:[...s].sort()}));

const placeRows=[];
const idMapPlaces=[];
for(const pref of PREFS){
  const places=(runtime.places||[]).filter(p=>p.pref===pref.name).slice().sort((a,b)=>Number(a.id)-Number(b.id));
  places.forEach((p,index)=>{
    const legacyId=Number(p.id), newId=`${pref.code}-P${String(index+1).padStart(4,'0')}`;
    const src=cleanSrc(p.photo?.src), local=src && !/^https?:/i.test(src), imageFile=local?path.join(dist,src):null;
    const exists=Boolean(local && imageFile && fs.existsSync(imageFile));
    const registry=src?sourceRegistry[src]||null:null;
    const runtimeSource=normText(p.photo?.source);
    const registrySource=normText(registry?.source);
    const flags=[];
    if(!src)flags.push('missing-photo');
    else if(!local)flags.push('remote-photo');
    else if(!exists)flags.push('missing-local-file');
    if(registry?.placeId!=null && Number(registry.placeId)!==legacyId)flags.push('registry-place-id-mismatch');
    if(runtimeSource && registrySource && !sameSource(runtimeSource,registrySource))flags.push('runtime-registry-source-mismatch');
    const source=flags.includes('runtime-registry-source-mismatch')?'':(registrySource||runtimeSource);
    if(src && !source)flags.push('missing-source');
    const shared=[...(effectivePlaceRefs.get(src)||[])];
    if(src && shared.length>1)flags.push('shared-active-place-image');
    const status=flags.length?'HOLD':'ACTIVE';
    const proposedDir=`images/regions/${pref.regionSlug}/${pref.slug}/places`;
    placeRows.push({legacyId,newId,prefectureCode:pref.code,region:pref.region,regionSlug:pref.regionSlug,pref:p.pref,area:p.area||'',town:p.town||'',name:p.name||'',mapQuery:p.mapQuery||'',status,flags,activePhoto:src?{src,sha256:exists?hashFile(imageFile):'',source,author:registry?.author||'',terms:registry?.terms||'',userPhoto:Boolean(registry?.author==='사용자 직접 촬영'||src.startsWith('images/user/'))}:null,proposed:{directory:proposedDir,filename:`${newId}-<place-slug>.webp`,heroScope:'same current region/area only'}});
    idMapPlaces.push({legacyId,newId,pref:p.pref,name:p.name||'',region:pref.region,proposedDirectory:proposedDir});
  });
}

const idMapFoods=[];
for(const pref of PREFS){
  const row=(runtime.prefectures||[]).find(x=>x.pref===pref.name);
  const foods=(row?.foods||[]).slice().sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'ko'));
  foods.forEach((f,index)=>{
    idMapFoods.push({legacyKey:`${pref.name}|${f.name}`,newId:`${pref.code}-F${String(index+1).padStart(4,'0')}`,pref:pref.name,name:f.name||'',region:pref.region,proposedDirectory:`images/regions/${pref.regionSlug}/${pref.slug}/foods`});
  });
}

const holdPlaces=placeRows.filter(x=>x.status==='HOLD');
const counts={
  places:placeRows.length,
  foods:idMapFoods.length,
  placePhotosActive:placeRows.filter(x=>x.status==='ACTIVE'&&x.activePhoto).length,
  placePhotosHold:holdPlaces.length,
  imagesTotal:imageEntries.length,
  imagesActive:imageEntries.filter(x=>x.status==='ACTIVE').length,
  imagesHold:imageEntries.filter(x=>x.status==='HOLD').length,
  imagesObsoleteCandidates:imageEntries.filter(x=>x.status==='OBSOLETE_CANDIDATE').length,
  duplicateImageGroups:duplicateImages.length,
  duplicateLegacyIdGroups:duplicateLegacyIds.length
};

const baseline={
  schemaVersion:1,
  sourceCommit:head,
  generatedAt:new Date().toISOString(),
  purpose:'Freeze the effective current runtime before Jatlas image/data folder migration. No file in OBSOLETE_CANDIDATE is safe to delete until a later post-migration zero-reference verification.',
  rules:{
    active:'Effective runtime uses this photo and no source/path conflict was detected for the place.',
    hold:'Do not migrate/delete automatically. A missing file/source, remote URL, ID mismatch, source mismatch, or shared active image needs review.',
    obsoleteCandidate:'Not used by effective places/foods/heroes and no strong code/tool/workflow/registry/manifest reference was found. Candidate only; deletion is a later phase.',
    id:'New place IDs use official prefecture code + P + permanent serial. Serial is assigned by legacy numeric ID for this one-time migration and is never reused later.',
    hero:'No separate hero image copy. Future hero selection must draw only from eligible places inside the current displayed scope; one-place scopes always show that one place.'
  },
  counts,
  issues:{duplicateLegacyIds,holdPlaces:holdPlaces.map(x=>({legacyId:x.legacyId,newId:x.newId,pref:x.pref,name:x.name,flags:x.flags,src:x.activePhoto?.src||''}))},
  places:placeRows
};
const idMap={schemaVersion:1,sourceCommit:head,generatedAt:baseline.generatedAt,strategy:'official prefecture code + permanent type serial; no reuse after deletion',places:idMapPlaces,foods:idMapFoods};
const imageAudit={schemaVersion:1,sourceCommit:head,generatedAt:baseline.generatedAt,counts,duplicateImages,images:imageEntries};

fs.writeFileSync(path.join(audits,'structure-migration-baseline.json'),JSON.stringify(baseline,null,2)+'\n');
fs.writeFileSync(path.join(audits,'id-migration-map.json'),JSON.stringify(idMap,null,2)+'\n');
fs.writeFileSync(path.join(audits,'image-reference-audit.json'),JSON.stringify(imageAudit,null,2)+'\n');
console.log(JSON.stringify({ok:true,sourceCommit:head,counts,holdExamples:holdPlaces.slice(0,20).map(x=>({id:x.legacyId,name:x.name,flags:x.flags}))},null,2));
