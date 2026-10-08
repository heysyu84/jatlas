import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=process.cwd();
const stage=fs.mkdtempSync(path.join(os.tmpdir(),'jatlas-build-'));
const run=(args,cwd)=>{
  const result=spawnSync(process.execPath,args,{cwd,stdio:'inherit'});
  if(result.status!==0)throw Error('Static build failed');
};
try{
  for(const name of ['app','components','lib','vendor','package.json','next.config.ts','tsconfig.json','postcss.config.mjs','vite.config.ts']){
    fs.cpSync(path.join(root,name),path.join(stage,name),{recursive:true});
  }
  fs.symlinkSync(path.join(root,'node_modules'),path.join(stage,'node_modules'),'dir');
  fs.mkdirSync(path.join(stage,'public'));
  for(const name of fs.readdirSync(path.join(root,'public'))){
    const asset=fs.realpathSync(path.join(root,'public',name));
    fs.symlinkSync(asset,path.join(stage,'public',name),fs.statSync(asset).isDirectory()?'dir':'file');
  }
  // Vinext clears its output directory. Build outside the repository so the
  // authoritative photos and catalog in dist can never be removed by it.
  run([path.join(root,'node_modules/vinext/dist/cli.js'),'build'],stage);
  run([path.join(root,'scripts/finalize-static.mjs')],stage);
  run([path.join(root,'scripts/sync-static-release.mjs'),path.join(stage,'dist/client')],root);
}finally{
  fs.rmSync(stage,{recursive:true,force:true});
}
