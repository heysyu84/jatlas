/* Register routes, food photographs, and editorial planning aids after the shared UI loads. */
for(const r of regionalCatalog){
 Object.assign(spotFacts,r.facts);
 Object.assign(foodDetails,r.foodDetails);
 for(const detail of Object.values(r.foodDetails||{})){
  if(detail?.how&&/시장·전문점·지역 식당에서 현지 방식으로 맛보세요\.?$/.test(detail.how))detail.how='';
 }
 Object.assign(addedFoodPhotos,r.foodPhotos);
 for(const [name,pic] of Object.entries(r.foodPhotos||{})){foodDetails[name]??={kind:"",taste:"",how:""};foodDetails[name].image=pic.src;}
 Object.assign(routePlanning,r.routePlanning);
 for(const route of r.routes){const photo=photoForPlace(r.places.find(p=>p.id===route.days[0].places[0]));route.image=photo?.src||'';route.imageAlt=photo?.alt||'';routeTemplates.push(route)}
}
{
 const host=document.querySelector('#photoCreditList');
 const title=document.createElement('h3');title.textContent='지역 사진 출처';host.append(title);
 const sourceName=url=>{
  if(url?.includes('commons.wikimedia.org'))return 'Wikimedia Commons';
  try{return new URL(url).hostname.replace(/^www\./,'')}catch{return '사진 출처'}
 };
 for(const pic of regionalCatalog.flatMap(r=>r.credits)){
  const row=document.createElement('p');row.className='photoAttribution';
  const source=document.createElement('a');source.href=pic.source;source.target='_blank';source.rel='noopener';
  source.textContent=sourceName(pic.source)+' · '+pic.label;
  if(pic.author||pic.license)source.title=[pic.author,pic.license].filter(Boolean).join(' · ');
  row.append(source);host.append(row);
 }
}
render();
