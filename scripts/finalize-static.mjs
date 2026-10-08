import fs from 'node:fs';
import path from 'node:path';
const output=path.resolve('dist/client');
if(!fs.existsSync(path.join(output,'index.html')))throw Error('Static export did not produce index.html');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
for(const file of walk(output)){
 if(!/\.(html|css|js|rsc|json)$/.test(file)||/\/data\//.test(file))continue;
 const before=fs.readFileSync(file,'utf8');
 let after=before.replace(/(["'`])\/(assets|_assets|_next)\//g,'$1./$2/');
 if(file.endsWith('.css')){
  const fonts=path.relative(path.dirname(file),path.join(output,'fonts')).split(path.sep).join('/');
  after=after.replace(/url\((['"]?)(?:\/|\.\.\/)fonts\//g,`url($1${fonts}/`);
 }
 if(after!==before)fs.writeFileSync(file,after);
}
fs.writeFileSync(path.join(output,'.nojekyll'),'');
console.log('Static homepage prepared for root and repository subpath hosting.');
