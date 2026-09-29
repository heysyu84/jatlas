/* Register routes, food photographs, and editorial planning aids after the shared UI loads. */
for(const r of regionalCatalog){
 Object.assign(spotFacts,r.facts);
 Object.assign(foodDetails,r.foodDetails);
 Object.assign(addedFoodPhotos,r.foodPhotos);
 for(const [name,pic] of Object.entries(r.foodPhotos||{})){foodDetails[name]??={kind:"",taste:"",how:""};foodDetails[name].image=pic.src;}
 Object.assign(routePlanning,r.routePlanning);
 for(const route of r.routes){const photo=photoForPlace(r.places.find(p=>p.id===route.days[0].places[0]));route.image=photo?.src||'';route.imageAlt=photo?.alt||'';routeTemplates.push(route)}
}
{
 const host=document.querySelector('#photoCreditList');
 const title=document.createElement('h3');title.textContent='지역 사진 출처';host.append(title);
 for(const pic of regionalCatalog.flatMap(r=>r.credits)){
  const row=document.createElement('p');row.className='photoAttribution';
  const source=document.createElement('a');source.href=pic.source;source.target='_blank';source.rel='noopener';source.textContent=pic.label;
  row.append(source,' — '+pic.author+' · ');
  const license=document.createElement('a');license.href=pic.licenseUrl||pic.source;license.target='_blank';license.rel='noopener';license.textContent=pic.license;row.append(license);host.append(row);
 }
}
render();
