import fs from 'node:fs';
import path from 'node:path';
const output=path.resolve(process.argv[2]||'dist/client');
if(!fs.existsSync(path.join(output,'index.html')))throw Error('Missing static export');
// Source assets remain in dist; public contains symlinks to those originals.
for(const name of ['_next','.vite'])fs.rmSync(path.resolve('dist',name),{recursive:true,force:true});
for(const entry of fs.readdirSync(output,{withFileTypes:true})){
  if(['images','data','fonts'].includes(entry.name))continue;
  fs.cpSync(path.join(output,entry.name),path.resolve('dist',entry.name),{recursive:true});
}
console.log('Updated the committed static homepage; shared assets remain in place.');
