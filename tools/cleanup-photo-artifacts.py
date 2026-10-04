"""Remove photo artifacts that are not used by the effective Jatlas runtime.

The runtime inventory is produced by tools/audit-content.cjs after all photo overrides.\nCleanup diagnostic revision: 3 (official assets count as active but are never deleted).
Only photo-cache roots are touched; general site images are never deleted.
"""
import json, re, sys
from pathlib import Path
from urllib.parse import urlsplit, unquote

ROOT=Path(__file__).resolve().parents[1]
DIST=ROOT/'dist'
AUDIT=ROOT/'audits'
RUNTIME=Path(sys.argv[1]) if len(sys.argv)>1 else AUDIT/'runtime-inventory.json'
PHOTO_ROOTS=('images/commons/','images/qa/','images/licensed/','images/official/')
DELETE_ROOTS=('images/commons/','images/qa/','images/licensed/')

def clean_path(value):
    if not isinstance(value,str): return None
    value=unquote(urlsplit(value).path.lstrip('/'))
    return value if value.startswith(PHOTO_ROOTS) else None

def collect(value,out):
    if isinstance(value,dict):
        for v in value.values(): collect(v,out)
    elif isinstance(value,list):
        for v in value: collect(v,out)
    else:
        p=clean_path(value)
        if p: out.add(p)

runtime=json.loads(RUNTIME.read_text(encoding='utf-8'))
active=set();collect(runtime,active)

# Prune Commons filename -> local WebP aliases to paths that the effective runtime uses.
mapping_file=DIST/'commons-local-images.js'
text=mapping_file.read_text(encoding='utf-8')
prefix='globalThis.JATLAS_COMMONS_LOCAL=Object.assign(globalThis.JATLAS_COMMONS_LOCAL||{},'
suffix=');'
if not text.startswith(prefix) or not text.rstrip().endswith(suffix):
    raise RuntimeError('Unexpected commons-local-images.js format')
payload=text[len(prefix):text.rfind(suffix)]
mapping=json.loads(payload)
before_mapping=len(mapping)
mapping={k:v for k,v in mapping.items() if clean_path(v) in active}
mapping_file.write_text(prefix+json.dumps(mapping,ensure_ascii=False,separators=(',',':'))+suffix+'\n',encoding='utf-8')

# Prune exact-localization metadata.
localized_file=AUDIT/'localized-photos.json'
localized=json.loads(localized_file.read_text(encoding='utf-8')) if localized_file.exists() else {}
before_localized=len(localized)
localized={k:v for k,v in localized.items() if isinstance(v,dict) and clean_path(v.get('src')) in active}
localized_file.write_text(json.dumps(localized,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

# Prune reviewed runtime override maps while keeping their executable logic.
qa_file=DIST/'photo-qa-review.js'
qa=qa_file.read_text(encoding='utf-8')
def replace_json_var(source,name,filter_fn):
    marker='const '+name+'='
    start=source.find(marker)
    if start<0: return source,0,0
    brace=source.find('{',start+len(marker))
    if brace<0: raise RuntimeError('Missing object for '+name)
    depth=0;ins=False;esc=False;end=None
    for i in range(brace,len(source)):
        ch=source[i]
        if ins:
            if esc: esc=False
            elif ch=='\\': esc=True
            elif ch=='"': ins=False
            continue
        if ch=='"': ins=True
        elif ch=='{': depth+=1
        elif ch=='}':
            depth-=1
            if depth==0:
                end=i+1;break
    if end is None: raise RuntimeError('Unclosed object for '+name)
    obj=json.loads(source[brace:end]);before=0;after=0
    obj,before,after=filter_fn(obj)
    encoded=json.dumps(obj,ensure_ascii=False,separators=(',',':'))
    return source[:brace]+encoded+source[end:],before,after

def filter_flat(obj):
    before=len(obj)
    kept={k:v for k,v in obj.items() if isinstance(v,dict) and clean_path(v.get('src')) in active}
    return kept,before,len(kept)

def filter_cont(obj):
    before=sum(len(obj.get(k,{})) for k in ('places','foods'))
    kept=dict(obj)
    for k in ('places','foods'):
        kept[k]={i:v for i,v in obj.get(k,{}).items() if isinstance(v,dict) and clean_path(v.get('src')) in active}
    after=sum(len(kept.get(k,{})) for k in ('places','foods'))
    return kept,before,after

qa,n_before,n_after=replace_json_var(qa,'nagoyaPhotoQa',filter_flat)
qa,c_before,c_after=replace_json_var(qa,'continuationPhotoQa',filter_cont)
qa_file.write_text(qa,encoding='utf-8')

# Keep only build-manifest entries whose outputs are still selected by the runtime.
manifest_file=ROOT/'tools/official-photo-assets.json'
manifest=json.loads(manifest_file.read_text(encoding='utf-8'))
before_manifest=len(manifest.get('photos',[]))
kept=[]
for item in manifest.get('photos',[]):
    item=dict(item);item.pop('legacyOutputs',None)
    if clean_path(item.get('output')) in active:
        kept.append(item)
manifest['photos']=kept
manifest_file.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

# Delete committed/local cache files that no current runtime photo uses.
removed=[]
freed=0
for root_name in DELETE_ROOTS:
    root=DIST/root_name.rstrip('/')
    if not root.exists(): continue
    for path in root.rglob('*'):
        if not path.is_file(): continue
        rel=path.relative_to(DIST).as_posix()
        if rel in active: continue
        freed+=path.stat().st_size
        path.unlink()
        removed.append(rel)

report={
  'activePhotoFiles':len(active),
  'commonsAliasesBefore':before_mapping,'commonsAliasesAfter':len(mapping),
  'localizedMetadataBefore':before_localized,'localizedMetadataAfter':len(localized),
  'nagoyaOverridesBefore':n_before,'nagoyaOverridesAfter':n_after,
  'continuationOverridesBefore':c_before,'continuationOverridesAfter':c_after,
  'manifestEntriesBefore':before_manifest,'manifestEntriesAfter':len(kept),
  'removedFileCount':len(removed),'removedBytes':freed,
  'removedFiles':sorted(removed),
}
(AUDIT/'photo-cleanup-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k!='removedFiles'},ensure_ascii=False))
