/* Jatlas onsen journal. Entries link to existing canonical tourist destinations. */
(()=>{
 const entries=[{"id":"01-P0043","name":"노보리베쓰 온천","ja":"登別温泉","pref":"홋카이도","area":"도야·노보리베쓰","town":"노보리베쓰시","image":"images/regions/hokkaido/hokkaido/places/01-P0043-noboribetsu-onsen.webp","source":"https://commons.wikimedia.org/wiki/File:131102_Noboribetsu_Onsen_Hokkaido_Japan04s3.jpg","rev":1,"desc":"지옥계곡과 화산 지열의 풍경"},{"id":"01-P0044","name":"도야코 온천","ja":"洞爺湖温泉","pref":"홋카이도","area":"도야·노보리베쓰","town":"도야코정","image":"images/regions/hokkaido/hokkaido/places/01-P0044-toyako-onsen.webp","source":"https://commons.wikimedia.org/wiki/File:Toyako_Manseikaku.jpg","rev":1,"desc":"도야호와 함께 즐기는 호반 온천"},{"id":"01-P0045","name":"소운쿄 온천","ja":"層雲峡温泉","pref":"홋카이도","area":"소운쿄","town":"가미카와정","image":"images/regions/hokkaido/hokkaido/places/01-P0045-sounkyo-onsen.webp","source":"https://commons.wikimedia.org/wiki/File:Sounkaku_Grand_Hotel_roten.JPG","rev":1,"desc":"대설산 협곡과 설경 속 온천"},{"id":"01-P0046","name":"가와유 온천","ja":"川湯温泉","pref":"홋카이도","area":"아칸·마슈","town":"데시카가정","image":"images/regions/hokkaido/hokkaido/places/01-P0046-kawayu-onsen.webp","source":"https://commons.wikimedia.org/wiki/File:Kawayu_hot_spring_river2.jpg","rev":1,"desc":"데시카가의 지열과 화산 풍경"},{"id":"04-P0025","name":"아키우 온천","ja":"秋保温泉","pref":"미야기","area":"센다이","town":"센다이시","image":"images/regions/tohoku/miyagi/places/04-P0025-akiu-onsen.webp","source":"https://commons.wikimedia.org/wiki/File:211029_Akiu_Onsen_Sendai_Miyagi_pref_Japan01s3.jpg","rev":1,"desc":"센다이 근교 계곡의 온천 마을"},{"id":"10-P0017","name":"미나카미 온천","ja":"水上温泉","pref":"군마","area":"미나카미·오제","town":"미나카미정","image":"images/regions/north-kanto/gunma/places/10-P0017-minakami-onsen.webp","source":"https://commons.wikimedia.org/wiki/File:Minakami_Onsen_01.jpg","rev":1,"desc":"강과 산이 함께하는 온천가"},{"id":"14-P0029","name":"하코네 온천향","ja":"箱根温泉郷","pref":"가나가와","area":"하코네·오다와라","town":"하코네마치","image":"images/regions/greater-tokyo/kanagawa/places/14-P0029-hakone-onsenkyo.webp","source":"https://commons.wikimedia.org/wiki/File:Hakone_yumoto_onsen_2.jpg","rev":1,"desc":"유모토와 고라 등 여러 온천 마을"},{"id":"19-P0032","name":"후지카와구치코 온천향","ja":"富士河口湖温泉郷","pref":"야마나시","area":"가와구치코·후지북부","town":"후지카와구치코정","image":"images/regions/koshinetsu/yamanashi/places/19-P0032-fuji-kawaguchiko-onsenkyo.webp","source":"https://commons.wikimedia.org/wiki/File:Kozantei_Ubuya.JPG","rev":1,"desc":"후지산과 가와구치호를 바라보는 여행"},{"id":"22-P0021","name":"아타미 온천","ja":"熱海温泉","pref":"시즈오카","area":"이즈","town":"아타미시","image":"images/regions/tokai/shizuoka/places/22-P0021-atami-onsen.webp","source":"https://commons.wikimedia.org/wiki/File:181122_Atami_Onsen_Shizuoka_pref_Japan02s.jpg","rev":1,"desc":"바다와 야경이 있는 온천 도시"},{"id":"21-P0023","name":"오쿠히다 온천향","ja":"奥飛騨温泉郷","pref":"기후","area":"히다·다카야마","town":"다카야마시","image":"images/regions/tokai/gifu/places/21-P0023-okuhida-onsenkyo.webp","source":"https://commons.wikimedia.org/wiki/File:Gifu_snowy_onsen_(53618685704).jpg","rev":1,"desc":"북알프스 자락의 산악 노천탕"},{"id":"17-P0025","name":"가타야마즈 온천","ja":"片山津温泉","pref":"이시카와","area":"가가온천","town":"가가시","image":"images/regions/hokuriku/ishikawa/places/17-P0025-katayamazu-onsen.webp","source":"https://commons.wikimedia.org/wiki/File:260718_Katayamazu_Onsen_Soyu_Kaga_Ishikawa_pref_Japan03s3.jpg","rev":1,"desc":"시바야마가타 호반과 공동욕장"},{"id":"30-P0018","name":"시라하마 온천","ja":"白浜温泉","pref":"와카야마","area":"시라하마","town":"시라하마정","image":"images/regions/kinki/wakayama/places/30-P0018-shirahama-onsen.webp","source":"https://commons.wikimedia.org/wiki/File:131221_Shirahama_Onsen_Shirahama_Wakayama_pref_Japan04s3.jpg","rev":1,"desc":"해변 산책과 온천 목욕"},{"id":"30-P0019","name":"류진 온천","ja":"龍神温泉","pref":"와카야마","area":"","town":"","image":"images/regions/kinki/wakayama/places/30-P0019-ryujin-onsen.webp","source":"https://commons.wikimedia.org/wiki/File:%E9%BE%8D%E7%A5%9E%E6%B8%A9%E6%B3%89%E5%85%83%E6%B9%AF%EF%BC%88Ryujin_Onsen)_-_panoramio.jpg","rev":1,"desc":"기이 산지 속 고요한 온천 마을"},{"id":"44-P0028","name":"벳푸 온천향","ja":"別府温泉郷","pref":"오이타","area":"벳푸·오이타시","town":"벳푸시","image":"images/regions/kyushu/oita/places/44-P0028-beppu-onsenkyo.webp","source":"https://commons.wikimedia.org/wiki/File:Beppu_Kan-nawa-hotspring01.jpg","rev":1,"desc":"간나와의 온천 증기와 온천 거리"},{"id":"42-P0031","name":"운젠 온천","ja":"雲仙温泉","pref":"나가사키","area":"운젠·오바마","town":"운젠시","image":"images/regions/kyushu/nagasaki/places/42-P0031-unzen-onsen.webp","source":"https://commons.wikimedia.org/wiki/File:140322_Unzen_Onsen_Jigoku_Unzen_Nagasaki_pref_Japan24s3.jpg","rev":1,"desc":"지열 증기가 솟는 운젠 지옥"},{"id":"46-P0032","name":"이부스키 온천","ja":"指宿温泉","pref":"가고시마","area":"이부스키","town":"이부스키시","image":"images/regions/kyushu/kagoshima/places/46-P0032-ibusuki-onsen.webp","source":"https://commons.wikimedia.org/wiki/File:Ibusuki-sand-bath_Saraku.jpg","rev":1,"desc":"해안의 모래찜질 온천 체험"},{"id":"47-P0039","name":"세나가지마 온천·류진노유","ja":"瀬長島温泉・龍神の湯","pref":"오키나와","area":"나하·남부","town":"도미구스쿠시","image":"images/regions/okinawa/okinawa/places/47-P0039-senagajima-ryujin-no-yu.webp","source":"https://commons.wikimedia.org/wiki/File:Ryukyu_Onsen_Senagajima_Hotel_02.JPG","rev":1,"desc":"오키나와 남부의 바다 전망 온천"}];
 const root=document.getElementById("jxOnsenGrid");
 const filters=document.getElementById("jxOnsenFilters");
 const summary=document.getElementById("jxOnsenSummary");
 if(!root||!filters)return;
 const categories=[["all","전체"],["north","홋카이도·도호쿠"],["east","간토·고신에쓰"],["central","도카이·호쿠리쿠"],["kinki","긴키"],["south","규슈·오키나와"]];
 const group=p=>{
  const r=p.image.split("/")[2];
  if(["hokkaido","tohoku"].includes(r))return "north";
  if(["north-kanto","greater-tokyo","koshinetsu"].includes(r))return "east";
  if(["tokai","hokuriku"].includes(r))return "central";
  if(r==="kinki")return "kinki";
  return "south";
 };
 const node=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!=null)n.textContent=txt;return n};
 function card(p){
  const article=node("article","jxOnsenCard");
  const button=node("button","jxOnsenOpen");button.type="button";button.dataset.jxPref=p.pref;button.dataset.jxArea=p.area;button.dataset.jxTown=p.town;button.setAttribute("aria-label",p.name+" 주변 관광지 보기");
  const photo=node("img");photo.src=p.image+"?jatlasPhoto=r"+p.rev;photo.alt=p.name+" 풍경";photo.loading="lazy";photo.decoding="async";button.append(photo);
  const info=node("span","jxOnsenCardBody");
  const name=node("strong","jxOnsenCardName",p.name);
  const ja=node("span","jxOnsenCardJa",p.ja);ja.lang="ja";
  info.append(node("small","jxOnsenCardPref",p.pref),name,ja,node("span","jxOnsenCardDesc",p.desc));
  button.append(info);
  const credit=node("div","jxOnsenCardFooter");
  credit.append(node("span",null,"Jatlas · "+p.id));
  const a=node("a",null,"사진 출처 ↗");a.href=p.source;a.target="_blank";a.rel="noopener noreferrer";credit.append(a);
  article.append(button,credit);return article;
 }
 let active="all";
 function render(){
  const view=entries.filter(p=>active==="all"||group(p)===active);
  root.replaceChildren(...view.map(card));
  if(summary)summary.textContent=view.length+"곳의 온천";
  Array.from(filters.children).forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.group===active)));
 }
 categories.forEach(([key,label])=>{
  const b=node("button",null,label);b.type="button";b.dataset.group=key;b.addEventListener("click",()=>{active=key;render()});filters.append(b);
 });
 render();
})();