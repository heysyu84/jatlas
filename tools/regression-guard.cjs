'use strict';

const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const cp=require('node:child_process');

const root=path.resolve(__dirname,'..');
const policy=JSON.parse(fs.readFileSync(path.join(root,'tools/content-guard-policy.json'),'utf8'));
const intent=JSON.parse(fs.readFileSync(path.join(root,'tools/content-change-intent.json'),'utf8'));

const sh=(cmd,opts={})=>cp.execFileSync(cmd[0],cmd.slice(1),{encoding:'utf8',stdio:['ignore','pipe','pipe'],...opts}).trim();
const norm=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[\s·・･\-–—_\/().（）【】「」『』［］\[\],，、:：'"]/g,'');
const stable=x=>JSON.stringify(x,Object.keys(x||{}).sort());
const photoSig=p=>p?{src:p.src||'',source:p.source||'',alt:p.alt||'',fit:p.fit||''}:null;
const heroSig=p=>p?{src:p.src||'',source:p.source||'',alt:p.alt||'',fit:p.fit||''}:null;
const placeSig=p=>({
  pref:p.pref||'',area:p.area||'',town:p.town||'',name:p.name||'',tag:p.tag||'',
  description:p.description||'',activity:p.activity||'',duration:p.duration||'',
  source:p.source||'',checked:p.checked||'',mapQuery:p.mapQuery||'',mapUrl:p.mapUrl||''
});

function runAudit(repo,out){
  cp.execFileSync(process.execPath,[path.join(repo,'tools/audit-content.cjs'),out],{cwd:repo,stdio:['ignore','pipe','pipe']});
  return JSON.parse(fs.readFileSync(out,'utf8'));
}

const head=sh(['git','rev-parse','HEAD'],{cwd:root});
let parent='';
try{parent=sh(['git','rev-parse','HEAD^'],{cwd:root})}catch{}
const current=runAudit(root,path.join(os.tmpdir(),'jatlas-current-runtime.json'));

const errors=[];
const notes=[];
const fail=m=>errors.push(m);

for(const x of current.safety?.tombstones||[])fail('RUNTIME SAFETY removed tombstoned place from source: '+x.id+' '+x.pref+' '+x.name);
for(const x of current.safety?.duplicates||[])fail('RUNTIME SAFETY removed duplicate place from source: '+x.dropId+' duplicates '+x.keepId+' / '+x.pref+' / '+x.name);

for(const t of policy.tombstones||[]){
  const bad=current.places.filter(p=>Number(p.id)===Number(t.id)||(p.pref===t.pref&&[t.name,...(t.aliases||[])].some(n=>norm(p.name)===norm(n))));
  if(bad.length)fail('TOMBSTONE resurrected: '+t.id+' '+t.pref+' '+t.name);
}

const byName=new Map(),byMap=new Map();
for(const p of current.places){
  const nk=p.pref+'|'+norm(p.name);
  if(norm(p.name)){if(!byName.has(nk))byName.set(nk,[]);byName.get(nk).push(p)}
  const mq=norm(p.mapQuery||'');
  if(mq){const mk=p.pref+'|'+mq;if(!byMap.has(mk))byMap.set(mk,[]);byMap.get(mk).push(p)}
}
for(const arr of byName.values()){
  const ids=[...new Set(arr.map(p=>Number(p.id)))];
  if(ids.length>1)fail('DUPLICATE exact name: '+arr[0].pref+' / '+arr[0].name+' / ids='+ids.join(','));
}
for(const arr of byMap.values()){
  const ids=[...new Set(arr.map(p=>Number(p.id)))];
  if(ids.length>1)fail('DUPLICATE mapQuery: '+arr[0].pref+' / '+(arr[0].mapQuery||'')+' / ids='+ids.join(','));
}

if(parent){
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'jatlas-parent-'));
  try{
    cp.execFileSync('git',['worktree','add','--detach',temp,parent],{cwd:root,stdio:['ignore','pipe','pipe']});
    const previous=runAudit(temp,path.join(os.tmpdir(),'jatlas-parent-runtime.json'));
    const prevMap=new Map(previous.places.map(p=>[Number(p.id),p]));
    const curMap=new Map(current.places.map(p=>[Number(p.id),p]));

    const adds=[...curMap.keys()].filter(id=>!prevMap.has(id));
    const removals=[...prevMap.keys()].filter(id=>!curMap.has(id));
    const edits=[],photoChanges=[];
    for(const [id,p] of curMap){
      const q=prevMap.get(id); if(!q)continue;
      if(stable(placeSig(p))!==stable(placeSig(q)))edits.push(id);
      if(stable(photoSig(p.photo))!==stable(photoSig(q.photo)))photoChanges.push({id,from:photoSig(q.photo),to:photoSig(p.photo)});
    }
    const heroKeys=new Set([...Object.keys(previous.heroes||{}),...Object.keys(current.heroes||{})]);
    const heroChanges=[];
    for(const key of heroKeys){
      const from=heroSig((previous.heroes||{})[key]),to=heroSig((current.heroes||{})[key]);
      if(stable(from)!==stable(to))heroChanges.push({key,from,to});
    }

    const structural=adds.length||removals.length||edits.length||photoChanges.length||heroChanges.length;
    if(structural){
      if(intent.baseCommit!==parent)fail('CHANGE INTENT baseCommit must equal immediate parent '+parent+' (currently '+String(intent.baseCommit||'<empty>')+')');
      const allow=intent.allow||{};
      const addAllowed=new Map((allow.placeAdds||[]).map(x=>[Number(x.id),x]));
      const removeAllowed=new Map((allow.placeRemovals||[]).map(x=>[Number(x.id),x]));
      const editAllowed=new Set((allow.placeEdits||[]).map(Number));
      const photoAllowed=new Map((allow.photoChanges||[]).map(x=>[Number(x.id),x]));
      const heroAllowed=new Map((allow.heroChanges||[]).map(x=>[String(x.key),x]));

      for(const id of adds){
        const p=curMap.get(id),a=addAllowed.get(id);
        if(!a||norm(a.name)!==norm(p.name))fail('UNAPPROVED place add: '+id+' '+p.pref+' '+p.name);
      }
      for(const id of removals){
        const p=prevMap.get(id),a=removeAllowed.get(id);
        if(!a||norm(a.name)!==norm(p.name))fail('UNAPPROVED place removal: '+id+' '+p.pref+' '+p.name);
      }
      for(const id of edits)if(!editAllowed.has(id))fail('UNAPPROVED place edit: '+id+' '+curMap.get(id).name);
      for(const ch of photoChanges){
        const a=photoAllowed.get(ch.id);
        const from=ch.from?.src||'',to=ch.to?.src||'';
        if(!a||String(a.fromSrc||'')!==from||String(a.toSrc||'')!==to)
          fail('UNAPPROVED photo change: '+ch.id+' '+curMap.get(ch.id).name+' :: '+from+' -> '+to);
      }
      for(const ch of heroChanges){
        const a=heroAllowed.get(ch.key);
        const from=ch.from?.src||'',to=ch.to?.src||'';
        if(!a||String(a.fromSrc||'')!==from||String(a.toSrc||'')!==to)
          fail('UNAPPROVED hero change: '+ch.key+' :: '+from+' -> '+to);
      }

      notes.push('Compared against parent '+parent);
      notes.push('adds='+adds.length+', removals='+removals.length+', edits='+edits.length+', photoChanges='+photoChanges.length+', heroChanges='+heroChanges.length);
    }
  } finally {
    try{cp.execFileSync('git',['worktree','remove','--force',temp],{cwd:root,stdio:'ignore'})}catch{}
  }
}

if(errors.length){
  console.error('\nJATLAS REGRESSION GUARD FAILED');
  for(const e of errors)console.error('- '+e);
  console.error('\nFor an intentional change, update tools/content-change-intent.json in the SAME commit with the exact parent SHA and exact IDs/fromSrc/toSrc. Never disable this guard.');
  process.exit(1);
}
console.log(JSON.stringify({ok:true,head,parent,places:current.places.length,notes},null,2));
