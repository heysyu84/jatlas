(()=>{const cf=f=>'https://commons.wikimedia.org/wiki/Special:FilePath/'+encodeURIComponent(f)+'?width=960';const cp=f=>'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(f).replace(/%20/g,'_');const map=q=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q);const note='공식 관광 안내의 명칭과 위치를 기준으로 등록했습니다. 방문 전 운영·교통 안내를 확인하세요.';
if(regionalCatalog.some(x=>x.pref==='와카야마'))return;

const places=[
{id:1900,pref:'와카야마',area:'와카야마시',town:'와카야마시',name:'와카야마성',tag:'성·역사·전망',description:'기슈 도쿠가와가의 거점이었던 성으로, 복원 천수와 석벽·정원, 시내를 내려다보는 전망을 함께 즐길 수 있는 와카야마시의 대표 명소입니다.',activity:'천수와 성곽 구역을 둘러보고 높은 곳에서 와카야마 시내를 바라보세요. 봄철에는 성 주변 벚꽃 산책도 함께 즐기기 좋습니다.',checked:'2026.09.30',lat:34.2276,lon:135.1716,source:'https://visitwakayama.jp/en/attractions/detail_661.html',note,mapQuery:'和歌山城'},
{id:1901,pref:'와카야마',area:'와카야마시',town:'와카야마시',name:'기미이데라',tag:'사찰·벚꽃·전망',description:'나라 시대에 창건되었다고 전해지는 고찰로, 긴 돌계단과 본당, 와카노우라 방면 전망과 이른 벚꽃으로 잘 알려져 있습니다.',activity:'돌계단을 올라 본당과 경내를 둘러보고 와카노우라 방향의 전망을 감상해보세요. 계단이 많아 편한 신발이 좋습니다.',checked:'2026.09.30',lat:34.1871,lon:135.1897,source:'https://visitwakayama.jp/en/attractions/detail_784.html',note,mapQuery:'和歌山 紀三井寺'},
{id:1902,pref:'와카야마',area:'와카야마시',town:'와카야마시',name:'와카야마 마리나시티·구로시오 시장',tag:'시장·테마파크·해안',description:'와카야마만의 인공섬에 포르토 유럽과 구로시오 시장, 온천 시설 등이 모인 해안 복합 관광지입니다.',activity:'구로시오 시장에서 해산물과 참치 해체 공연 일정을 확인하고 포르토 유럽과 해안 산책을 함께 즐겨보세요.',checked:'2026.09.30',lat:34.1549,lon:135.1742,source:'https://visitwakayama.jp/en/attractions/detail_592.html',note,mapQuery:'和歌山マリーナシティ 黒潮市場'},
{id:1903,pref:'와카야마',area:'고야산',town:'고야초',name:'고야산 곤고부지',tag:'세계유산·사찰·정원',description:'고야산 진언종의 총본산으로, 넓은 전각과 장벽화, 일본 최대급 석정으로 알려진 반류테이를 둘러볼 수 있습니다.',activity:'주전각의 방과 장벽화를 둘러보고 반류테이 석정을 천천히 감상해보세요. 행사나 법회로 일부 구역이 제한되는지 확인하세요.',checked:'2026.09.30',lat:34.2144,lon:135.5842,source:'https://visitwakayama.jp/en/attractions/detail_524.html',note,mapQuery:'高野山 金剛峯寺'},
{id:1904,pref:'와카야마',area:'고야산',town:'고야초',name:'고야산 오쿠노인',tag:'세계유산·사찰·삼나무길',description:'고보대사 구카이의 묘소로 이어지는 약 2km의 참배길을 따라 오래된 삼나무와 수많은 묘비·공양탑이 이어지는 고야산의 핵심 성지입니다.',activity:'이치노하시에서 고보대사 고뵤까지 삼나무 숲길을 걸어보세요. 성지이므로 조용한 관람 예절과 촬영 제한 안내를 따르세요.',checked:'2026.09.30',lat:34.2220,lon:135.6050,source:'https://visitwakayama.jp/en/attractions/detail_515.html',note,mapQuery:'高野山 奥之院'},
{id:1905,pref:'와카야마',area:'고야산',town:'고야초',name:'단조가란',tag:'세계유산·사찰·불교건축',description:'구카이가 고야산에서 밀교 수행 도량 건설을 시작한 핵심 성역으로, 곤폰다이토와 곤도 등 상징적인 불교 건축이 모여 있습니다.',activity:'곤폰다이토와 곤도를 중심으로 가람을 걸으며 건축과 종교 공간을 둘러보세요. 야간에는 조명이 켜지는 시기도 있습니다.',checked:'2026.09.30',lat:34.2125,lon:135.5824,source:'https://visitwakayama.jp/en/attractions/detail_481.html',note,mapQuery:'高野山 壇上伽藍'},
{id:1906,pref:'와카야마',area:'구마노 혼구',town:'다나베시',name:'구마노 혼구 타이샤',tag:'세계유산·신사·순례',description:'구마노 산잔 가운데 하나로, 구마노 고도 순례의 중심 신사입니다. 현재 사전은 1889년 홍수 뒤 옛 터에서 옮겨 세워졌습니다.',activity:'신사 본전 구역을 참배하고 구마노 고도 순례길의 분위기를 느껴보세요. 오유노하라까지 도보로 이어 둘러보기 좋습니다.',checked:'2026.09.30',lat:33.8406,lon:135.7731,source:'https://visitwakayama.jp/en/attractions/detail_462.html',note,mapQuery:'熊野本宮大社'},
{id:1907,pref:'와카야마',area:'구마노 혼구',town:'다나베시',name:'오유노하라',tag:'신사터·대도리이·순례',description:'구마노 혼구 타이샤가 원래 자리했던 성지로, 논과 숲 사이에 거대한 대도리이와 옛 사전 터가 남아 있습니다.',activity:'대도리이를 지나 옛 신사 터까지 걸으며 현재의 혼구 타이샤와 이전 성지의 관계를 함께 살펴보세요.',checked:'2026.09.30',lat:33.8361,lon:135.7764,source:'https://visitwakayama.jp/en/attractions/detail_478.html',note,mapQuery:'熊野本宮大社 大斎原'},
{id:1908,pref:'와카야마',area:'신구·구마노 하야타마',town:'신구시',name:'구마노 하야타마 타이샤',tag:'세계유산·신사·순례',description:'구마노 산잔의 하나로 신구 시내에 자리한 주홍빛 신사입니다. 오래된 나기나무와 구마노 신앙의 역사로 알려져 있습니다.',activity:'본전과 경내의 신목을 둘러보고 신구 시내의 구마노 신앙 유적과 함께 방문해보세요.',checked:'2026.09.30',lat:33.7311,lon:135.9877,source:'https://visitwakayama.jp/en/attractions/detail_472.html',note,mapQuery:'熊野速玉大社'},
{id:1909,pref:'와카야마',area:'신구·구마노 하야타마',town:'신구시',name:'가미쿠라 신사',tag:'신사·거석·계단',description:'구마노 하야타마 타이샤의 기원과 관련된 오래된 성지로, 산 중턱의 거대한 고토비키이와 바위가 신앙의 대상입니다.',activity:'매우 가파른 돌계단을 올라 고토비키이와와 신구 시내 전망을 살펴보세요. 비가 오거나 미끄러운 날에는 특히 주의하세요.',checked:'2026.09.30',lat:33.7242,lon:135.9830,source:'https://visitwakayama.jp/en/attractions/detail_479.html',note,mapQuery:'新宮 神倉神社'},
{id:1910,pref:'와카야마',area:'나치·가쓰우라',town:'나치카쓰라초',name:'구마노 나치 타이샤',tag:'세계유산·신사·순례',description:'나치 폭포 신앙과 깊게 연결된 구마노 산잔의 하나로, 산비탈의 주홍빛 사전과 세이간토지·폭포 풍경이 어우러집니다.',activity:'다이몬자카나 버스를 이용해 신사로 올라가 참배한 뒤 세이간토지와 나치 폭포 방향으로 이어 둘러보세요.',checked:'2026.09.30',lat:33.6680,lon:135.8905,source:'https://visitwakayama.jp/en/attractions/detail_482.html',note,mapQuery:'熊野那智大社'},
{id:1911,pref:'와카야마',area:'나치·가쓰우라',town:'나치카쓰라초',name:'나치 폭포',tag:'폭포·세계유산·자연',description:'높이 133m의 일단 폭포로 알려진 구마노 나치의 상징적인 폭포이며, 히로 신사의 신체로 숭배되어 온 성지입니다.',activity:'히로 신사 경내의 폭포 전망 지점에서 수직으로 떨어지는 물줄기를 감상하고 나치 타이샤·세이간토지와 함께 둘러보세요.',checked:'2026.09.30',lat:33.6753,lon:135.8894,source:'https://visitwakayama.jp/en/attractions/detail_491.html',note,mapQuery:'那智の滝'},
{id:1912,pref:'와카야마',area:'시라하마',town:'시라하마초',name:'시라라하마 해변',tag:'해변·온천·리조트',description:'약 640m 길이의 하얀 모래가 펼쳐진 시라하마의 대표 해변으로, 온천 리조트 지역과 가까워 산책과 휴양을 함께 즐기기 좋습니다.',activity:'백사장을 산책하고 해 질 무렵 바다 풍경을 감상해보세요. 여름에는 해수욕장 운영과 안전구역을 확인하세요.',checked:'2026.09.30',lat:33.6812,lon:135.3444,source:'https://visitwakayama.jp/en/attractions/detail_483.html',note,mapQuery:'白良浜'},
{id:1913,pref:'와카야마',area:'시라하마',town:'시라하마초',name:'산단베키',tag:'절벽·동굴·해안',description:'태평양을 마주한 약 50m 높이의 절벽이 이어지는 시라하마의 해안 절경으로, 엘리베이터를 타고 해식동굴을 둘러볼 수 있습니다.',activity:'절벽 전망대에서 바다를 감상하고 운영 중이라면 산단베키 동굴까지 내려가보세요. 강풍이 강한 날은 난간 주변에 주의하세요.',checked:'2026.09.30',lat:33.6657,lon:135.3352,source:'https://visitwakayama.jp/en/attractions/detail_517.html',note,mapQuery:'白浜 三段壁'},
{id:1914,pref:'와카야마',area:'시라하마',town:'시라하마초',name:'어드벤처 월드',tag:'동물원·수족관·테마파크',description:'사파리형 동물원과 해양 동물 공연, 놀이시설을 한곳에서 즐길 수 있는 시라하마의 대형 복합 테마파크입니다.',activity:'보고 싶은 동물과 공연 시간을 먼저 확인해 사파리·마린월드·놀이시설의 우선순위를 정해 하루를 계획하세요.',checked:'2026.09.30',lat:33.6672,lon:135.3777,source:'https://visitwakayama.jp/en/attractions/detail_666.html',note,mapQuery:'白浜 アドベンチャーワールド'},
{id:1915,pref:'와카야마',area:'구시모토',town:'구시모토초',name:'하시구이이와',tag:'기암·해안·일출',description:'바다 위로 약 850m에 걸쳐 크고 작은 바위기둥이 일렬로 늘어선 구시모토의 대표 해안 지형입니다.',activity:'간조 시간을 확인해 바위 주변 해안 풍경을 둘러보고, 날씨가 좋다면 일출 시간대 풍경도 고려해보세요.',checked:'2026.09.30',lat:33.4898,lon:135.7956,source:'https://visitwakayama.jp/en/attractions/detail_514.html',note,mapQuery:'串本 橋杭岩'},
{id:1916,pref:'와카야마',area:'구시모토',town:'구시모토초',name:'시오노미사키',tag:'곶·등대·태평양',description:'혼슈 최남단에 자리한 곶으로, 넓은 잔디와 등대 주변에서 태평양의 수평선을 바라볼 수 있습니다.',activity:'혼슈 최남단 표지와 잔디 광장을 둘러보고 등대 운영시간이 맞으면 전망을 함께 즐겨보세요.',checked:'2026.09.30',lat:33.4372,lon:135.7612,source:'https://visitwakayama.jp/en/attractions/detail_513.html',note,mapQuery:'串本 潮岬'}
];
for(const p of places)p.mapUrl=map(p.mapQuery);

const guides={
'1900':{access:'JR·난카이 와카야마시역 또는 JR 와카야마역에서 버스로 시청·공원앞 주변까지 이동하세요.',duration:'1시간 30분~2시간'},
'1901':{access:'JR 기미이데라역에서 도보 약 10분입니다.',duration:'1시간 30분~2시간'},
'1902':{access:'JR 가이난역에서 마리나시티행 버스를 이용하세요.',duration:'3~5시간'},
'1903':{access:'난카이 고야산역에서 버스로 센주인바시 주변까지 이동한 뒤 도보로 둘러보세요.',duration:'1시간~1시간 30분'},
'1904':{access:'고야산 내 버스로 오쿠노인마에 또는 이치노하시구치 방면으로 이동하세요.',duration:'2~3시간'},
'1905':{access:'센주인바시에서 도보로 이동하거나 고야산 내 버스를 이용하세요.',duration:'1시간~1시간 30분'},
'1906':{access:'기이타나베역·신구역 등에서 구마노 혼구 방면 노선버스를 이용하세요.',duration:'1시간~1시간 30분'},
'1907':{access:'구마노 혼구 타이샤에서 도보 약 10분입니다.',duration:'30~60분'},
'1908':{access:'JR 신구역에서 도보 약 15분 또는 시내버스를 이용하세요.',duration:'45~75분'},
'1909':{access:'JR 신구역에서 도보 약 15~20분입니다. 신사 입구부터 매우 가파른 돌계단이 이어집니다.',duration:'1~1시간 30분'},
'1910':{access:'JR 기이카쓰우라역·나치역에서 나치산행 버스를 이용하세요.',duration:'1시간 30분~2시간'},
'1911':{access:'나치산 버스정류장에서 신사·세이간토지와 연결해 도보로 이동하세요.',duration:'45~75분'},
'1912':{access:'JR 시라하마역에서 메이코 버스로 시라하마 해변 방면으로 이동하세요.',duration:'1~2시간'},
'1913':{access:'JR 시라하마역 또는 시라하마 중심에서 메이코 버스를 이용하세요.',duration:'1~1시간 30분'},
'1914':{access:'JR 시라하마역에서 어드벤처 월드행 버스를 이용하세요.',duration:'5~8시간'},
'1915':{access:'JR 기이히메역에서 도보 약 15분 또는 구시모토역에서 버스·택시를 이용하세요.',duration:'45~90분'},
'1916':{access:'JR 구시모토역에서 시오노미사키 방면 버스 또는 택시를 이용하세요.',duration:'1~2시간'}
};
const facts=Object.fromEntries(places.map(p=>[String(p.id),[guides[String(p.id)].duration]]));

const photos={
'1900':{src:cf('Wakayama Castle, tenshu-1.jpg'),alt:'와카야마성',source:cp('Wakayama Castle, tenshu-1.jpg')},
'1901':{src:cf('Kimiidera (Wakayama-shi) Temple hdsr S5 xw03.jpg'),alt:'기미이데라',source:cp('Kimiidera (Wakayama-shi) Temple hdsr S5 xw03.jpg')},
'1902':{src:cf('Porto Europe - Kuroshio-Ichiba.jpg'),alt:'와카야마 마리나시티',source:cp('Porto Europe - Kuroshio-Ichiba.jpg')},
'1903':{src:cf('Kongobuji Koyasan07n3200.jpg'),alt:'고야산 곤고부지',source:cp('Kongobuji Koyasan07n3200.jpg')},
'1904':{src:cf('Okunoin, Koyasan - figure d.JPG'),alt:'고야산 오쿠노인',source:cp('Okunoin, Koyasan - figure d.JPG')},
'1905':{src:cf('Danjogaran Koyasan12n3200.jpg'),alt:'단조가란',source:cp('Danjogaran Koyasan12n3200.jpg')},
'1906':{src:cf('Inside the Kumano Hongu Taisha.jpg'),alt:'구마노 혼구 타이샤',source:cp('Inside the Kumano Hongu Taisha.jpg')},
'1907':{src:cf('Oyunohara banner.jpg'),alt:'오유노하라',source:cp('Oyunohara banner.jpg')},
'1908':{src:cf('Kumanohayatama-taisha11s4s4592.jpg'),alt:'구마노 하야타마 타이샤',source:cp('Kumanohayatama-taisha11s4s4592.jpg')},
'1909':{src:cf('Kamikura-jinja, shaden.jpg'),alt:'가미쿠라 신사',source:cp('Kamikura-jinja, shaden.jpg')},
'1910':{src:cf('KumanoNachiTaisha.jpg'),alt:'구마노 나치 타이샤',source:cp('KumanoNachiTaisha.jpg')},
'1911':{src:cf('Nachi Falls002.JPG'),alt:'나치 폭포',source:cp('Nachi Falls002.JPG')},
'1912':{src:cf('131221 Shirarahama Beach Shirahama Wakayama pref Japan07s3bs.jpg'),alt:'시라라하마 해변',source:cp('131221 Shirarahama Beach Shirahama Wakayama pref Japan07s3bs.jpg')},
'1913':{src:cf('Sandanbeki.JPG'),alt:'산단베키',source:cp('Sandanbeki.JPG')},
'1914':{src:cf('Adventure World, Shirahama, Wakayama - Apr 24, 2015.jpg'),alt:'어드벤처 월드',source:cp('Adventure World, Shirahama, Wakayama - Apr 24, 2015.jpg')},
'1915':{src:cf('Hashiguiiwa Rock Kushimoto Town.jpg'),alt:'하시구이이와',source:cp('Hashiguiiwa Rock Kushimoto Town.jpg')},
'1916':{src:cf('Cape Shionomisaki, Wakayama - 52630088313.jpg'),alt:'시오노미사키',source:cp('Cape Shionomisaki, Wakayama - 52630088313.jpg')}
};

const foods=[
{name:'와카야마 라멘',area:'와카야마시',kind:'향토·지역 대표',where:'와카야마시',description:'돼지뼈와 간장을 조합한 진한 국물 계열이 대표적인 와카야마의 지역 라멘으로, 현지에서는 중화소바라고 부르는 가게도 많습니다.',source:'https://visitwakayama.jp/en/'},
{name:'메하리즈시',area:'구마노 혼구',kind:'향토·주먹밥',where:'구마노 지역',description:'소금에 절인 다카나 잎으로 밥을 크게 감싼 구마노 지방의 전통 주먹밥으로, 순례길 도시락으로도 잘 어울립니다.',source:'https://visitwakayama.jp/en/itineraries/detail_19.html'},
{name:'가쓰우라 생참치',area:'나치·가쓰우라',kind:'해산물·지역 특산',where:'나치카쓰우라초',description:'냉동하지 않은 생참치의 대규모 어획지로 알려진 가쓰우라항에서 회와 덮밥 등으로 즐기는 대표 해산물입니다.',source:'https://visitwakayama.jp/en/stories/detail_348.html'},
{name:'난코우메 우메보시',area:'와카야마 전역',kind:'지역 특산·절임',where:'미나베·다나베 등',description:'와카야마를 대표하는 난코우메를 소금에 절여 말리고 숙성한 매실 절임으로, 부드러운 과육과 강한 산미가 특징입니다.',source:'https://visitwakayama.jp/en/stories/detail_756.html'},
{name:'아리다 미캉',area:'와카야마 전역',kind:'지역 특산·과일',where:'아리다 지역',description:'온난한 기후와 경사지 과수원에서 재배되는 와카야마의 대표 감귤로, 겨울철 선물과 디저트 재료로 널리 즐깁니다.',source:'https://visitwakayama.jp/en/stories/detail_306.html'},
{name:'고야산 쇼진요리',area:'고야산',kind:'사찰음식·채식',where:'고야초',description:'고야산의 슈쿠보와 사찰 문화 속에서 발전한 채식 중심의 불교 음식으로, 두부·참깨·제철 채소를 정갈하게 구성합니다.',source:'https://visitwakayama.jp/en/attractions/detail_593.html'}
];
const foodDetails={
'와카야마 라멘':{kind:'한 끼',taste:'돼지뼈의 감칠맛과 간장 풍미가 진한 국물',how:'가게마다 국물 농도와 면 스타일이 달라 현지 중화소바 전문점에서 비교해보세요.'},
'메하리즈시':{kind:'간식·한 끼',taste:'다카나의 짭짤함과 밥의 담백함',how:'구마노 고도나 혼구 주변에서 간단한 점심이나 휴대식으로 즐겨보세요.'},
'가쓰우라 생참치':{kind:'한 끼·해산물',taste:'냉동하지 않은 참치의 부드러운 식감과 담백한 감칠맛',how:'가쓰우라항 주변에서 생참치 회·덮밥·초밥 등 원하는 형태로 골라보세요.'},
'난코우메 우메보시':{kind:'반찬·기념품',taste:'강한 산미와 짠맛, 부드러운 과육',how:'염도와 꿀 첨가 여부에 따라 맛이 크게 달라 시식 후 취향에 맞는 제품을 골라보세요.'},
'아리다 미캉':{kind:'과일·기념품',taste:'선명한 단맛과 산미, 풍부한 과즙',how:'제철인 늦가을~겨울에는 생과로 맛보고 주스·젤리 등 가공품도 비교해보세요.'},
'고야산 쇼진요리':{kind:'한 끼·사찰음식',taste:'두부와 채소 중심의 담백하고 섬세한 맛',how:'슈쿠보 숙박 식사나 쇼진요리 식당에서 계절 구성과 예약 여부를 확인해보세요.'}
};
const foodPhotos={
'와카야마 라멘':{src:cf('Wakayamaramen2.jpg'),source:cp('Wakayamaramen2.jpg')},
'메하리즈시':{src:cf('Mehari zushi with anago by woinary in Osaka.jpg'),source:cp('Mehari zushi with anago by woinary in Osaka.jpg')},
'가쓰우라 생참치':{src:cf('TunaSushi.jpg'),source:cp('TunaSushi.jpg')},
'난코우메 우메보시':{src:cf('Umeboshi.jpg'),source:cp('Umeboshi.jpg')},
'아리다 미캉':{src:cf('Wakayama-Mount Arida mandarin orange-xl.jpg'),source:cp('Wakayama-Mount Arida mandarin orange-xl.jpg')},
'고야산 쇼진요리':{src:cf('Buddhist vegetarian food, Shukubo of Kongosanmaiin - May 3, 2011.jpg'),source:cp('Buddhist vegetarian food, Shukubo of Kongosanmaiin - May 3, 2011.jpg')}
};

const events=[
{id:'w-nachi-fire',pref:'와카야마',name:'나치노 오기 마쓰리',area:'나치·가쓰우라',months:[7],timing:'매년 7월 14일',scheduleType:'고정 날짜',type:'불축제·신사',description:'구마노 나치 타이샤의 대표 제례로, 거대한 불꽃 횃불과 부채 모양 신여가 나치 폭포 앞에서 만나는 역동적인 여름 행사입니다.',source:'https://visitwakayama.jp/en/events/detail_79.html'},
{id:'w-koya-candle',pref:'와카야마',name:'고야산 만도쿠요에',area:'고야산',months:[8],timing:'매년 8월 13일',scheduleType:'고정 날짜',type:'촛불·추모행사',description:'오쿠노인 참배길을 수많은 촛불로 밝히며 고인을 추모하는 고야산의 여름 야간 행사입니다.',source:'https://visitwakayama.jp/en/events/detail_102.html'},
{id:'w-katsuura-tuna',pref:'와카야마',name:'가쓰우라 생참치 축제',area:'나치·가쓰우라',months:[1,2],timing:'예년 1월 말~2월 초 · 해마다 변동',scheduleType:'매년 일정 발표',type:'먹거리·시장행사',description:'가쓰우라항의 생참치를 중심으로 해체 시연과 판매·시식 등이 열리는 겨울 먹거리 행사입니다.',source:'https://visitwakayama.jp/en/events/detail_30.html'},
{id:'w-shirahama-open',pref:'와카야마',name:'시라라하마 해수욕장 개장',area:'시라하마',months:[5],timing:'매년 5월 3일',scheduleType:'고정 날짜',type:'해변·계절행사',description:'일본에서도 이른 시기에 해수욕 시즌을 시작하는 시라라하마의 계절 행사로, 해변 안전 기원 행사와 함께 여름 시즌의 시작을 알립니다.',source:'https://visitwakayama.jp/en/events/detail_10.html'},
{id:'w-waka-matsuri',pref:'와카야마',name:'와카 마쓰리',area:'와카야마시',months:[5],timing:'예년 5월 · 개최일 발표',scheduleType:'매년 일정 발표',type:'마쓰리·행렬',description:'기슈 도쇼구의 제례를 중심으로 전통 행렬과 지역 공연이 이어지는 와카야마시의 대표 봄 축제입니다.',source:'https://visitwakayama.jp/en/events/index.html'}
];

const intros={
'와카야마':['','고야산의 산악 불교, 구마노 고도와 세 신사, 시라하마의 해안 리조트, 혼슈 최남단의 태평양 풍경까지 기이반도를 따라 다양한 여행 테마가 이어지는 현입니다.'],
'와카야마시':['','성곽과 오래된 사찰, 해안 시장과 리조트 시설을 함께 즐길 수 있는 와카야마현 북서부의 중심 도시입니다.'],
'고야산':['','산 전체가 거대한 종교도시처럼 이어지는 세계유산 불교 성지로, 사찰과 삼나무 숲길, 슈쿠보 문화를 깊게 체험할 수 있는 지역입니다.'],
'구마노 혼구':['','구마노 고도 순례의 중심 신사와 옛 성지가 남아 있어 깊은 산속 신앙 문화를 느낄 수 있는 지역입니다.'],
'신구·구마노 하야타마':['','구마노 하야타마 타이샤와 가미쿠라 신사를 중심으로 구마노 신앙의 기원을 도시 안에서 걸어서 만날 수 있는 지역입니다.'],
'나치·가쓰우라':['','구마노 나치 타이샤와 나치 폭포의 신앙 풍경, 가쓰우라항의 생참치 문화를 함께 즐길 수 있는 남동부 해안 지역입니다.'],
'시라하마':['','하얀 모래 해변과 해식 절벽, 온천과 대형 테마파크를 함께 즐길 수 있는 기이반도 서남부의 대표 리조트 지역입니다.'],
'구시모토':['','하시구이이와의 기암과 혼슈 최남단 시오노미사키에서 태평양의 탁 트인 풍경을 즐길 수 있는 지역입니다.']
};
const heroes={'와카야마시':1900,'고야산':1904,'구마노 혼구':1906,'신구·구마노 하야타마':1908,'나치·가쓰우라':1911,'시라하마':1912,'구시모토':1915};

const routes=[
{id:'r-1900-0',pref:'와카야마',areas:['와카야마시'],title:'와카야마성과 기미이데라 하루',duration:'1일',intro:'와카야마시의 성곽 역사와 오래된 사찰을 대중교통으로 이어보는 대표 일정입니다.',note:'두 장소 사이 이동은 버스·JR을 조합하고 계단이 많은 기미이데라는 여유 있게 관람하세요.',days:[{label:'와카야마시',places:[1900,1901],schedule:[[1900,'09:30',places.find(p=>p.id===1900).activity],[null,'12:00','와카야마 시내에서 점심·이동'],[1901,'13:30',places.find(p=>p.id===1901).activity]]}],image:''},
{id:'r-1900-1',pref:'와카야마',areas:['와카야마시'],title:'마리나시티와 구로시오 시장 반나절',duration:'반나절',intro:'해산물 시장과 해안 테마파크를 한곳에서 즐기는 와카야마만의 가벼운 일정입니다.',note:'참치 해체 공연과 상점 운영시간이 방문 만족도에 영향을 주므로 먼저 일정을 확인하세요.',days:[{label:'와카야마시',places:[1902],schedule:[[1902,'10:30',places.find(p=>p.id===1902).activity],[null,'13:30','마리나시티에서 점심·휴식']]}],image:''},
{id:'r-1900-2',pref:'와카야마',areas:['고야산'],title:'고야산 핵심 성지 하루',duration:'1일',intro:'곤고부지와 단조가란, 오쿠노인을 하루에 이어보며 고야산 불교 문화의 핵심을 살펴보는 일정입니다.',note:'고야산 내부 버스와 도보를 섞어 이동하고 오쿠노인 참배길에 충분한 시간을 남겨두세요.',days:[{label:'고야산',places:[1903,1905,1904],schedule:[[1903,'09:30',places.find(p=>p.id===1903).activity],[1905,'11:00',places.find(p=>p.id===1905).activity],[null,'12:30','고야산에서 쇼진요리·점심'],[1904,'14:00',places.find(p=>p.id===1904).activity]]}],image:''},
{id:'r-1900-3',pref:'와카야마',areas:['구마노 혼구'],title:'구마노 혼구 성지 반나절',duration:'반나절',intro:'현재의 혼구 타이샤와 옛 신사 터 오유노하라를 걸어서 이어보는 구마노 순례 입문 일정입니다.',note:'버스 운행 간격이 길 수 있어 혼구 도착과 출발 시간을 먼저 고정하세요.',days:[{label:'구마노 혼구',places:[1906,1907],schedule:[[1906,'10:00',places.find(p=>p.id===1906).activity],[1907,'11:30',places.find(p=>p.id===1907).activity],[null,'12:30','혼구 주변에서 점심·휴식']]}],image:''},
{id:'r-1900-4',pref:'와카야마',areas:['신구·구마노 하야타마'],title:'하야타마와 가미쿠라 반나절',duration:'반나절',intro:'신구 시내에서 구마노 하야타마 타이샤와 산 위의 원시 신앙 공간을 함께 보는 일정입니다.',note:'가미쿠라 신사의 돌계단이 매우 가파르므로 비가 오면 무리하지 말고 하야타마 중심으로 조정하세요.',days:[{label:'신구·구마노 하야타마',places:[1908,1909],schedule:[[1908,'09:30',places.find(p=>p.id===1908).activity],[1909,'11:00',places.find(p=>p.id===1909).activity],[null,'12:30','신구 시내에서 점심·휴식']]}],image:''},
{id:'r-1900-5',pref:'와카야마',areas:['나치·가쓰우라'],title:'나치 신앙과 폭포 하루',duration:'1일',intro:'구마노 나치 타이샤와 세이간토지 주변, 나치 폭포를 걸어서 이어보는 구마노 대표 일정입니다.',note:'다이몬자카를 걸을 경우 오르막 시간을 추가하고 버스 막차와 폭포·신사 관람시간을 확인하세요.',days:[{label:'나치·가쓰우라',places:[1910,1911],schedule:[[1910,'09:30',places.find(p=>p.id===1910).activity],[null,'12:00','나치산 주변에서 점심·이동'],[1911,'13:30',places.find(p=>p.id===1911).activity],[null,'15:30','기이카쓰우라로 이동해 생참치 식사·산책']]}],image:''},
{id:'r-1900-6',pref:'와카야마',areas:['시라하마'],title:'시라하마 해안 반나절',duration:'반나절',intro:'시라라하마의 백사장과 산단베키 절벽을 버스로 이어보는 시라하마 대표 해안 일정입니다.',note:'해안은 강풍과 파도 영향을 받으므로 날씨가 나쁘면 동굴·온천 등 실내 일정으로 바꾸세요.',days:[{label:'시라하마',places:[1912,1913],schedule:[[1912,'10:00',places.find(p=>p.id===1912).activity],[null,'12:00','시라하마에서 점심·버스 이동'],[1913,'13:30',places.find(p=>p.id===1913).activity]]}],image:''},
{id:'r-1900-7',pref:'와카야마',areas:['시라하마'],title:'어드벤처 월드 하루',duration:'1일',intro:'동물·사파리·해양공연과 놀이시설을 하루 동안 선택해 즐기는 가족·체험 중심 일정입니다.',note:'공연과 동물 프로그램 시간이 정해져 있으므로 입장 후 당일 시간표부터 확인하세요.',days:[{label:'시라하마',places:[1914],schedule:[[1914,'10:00',places.find(p=>p.id===1914).activity],[null,'13:00','파크 내에서 점심·휴식'],[1914,'14:00','오후에는 오전에 보지 못한 사파리·공연·놀이시설을 선택해 둘러보세요.']]}],image:''},
{id:'r-1900-8',pref:'와카야마',areas:['구시모토'],title:'하시구이이와와 시오노미사키 하루',duration:'1일',intro:'구시모토의 독특한 해안 기암과 혼슈 최남단의 태평양 전망을 함께 보는 자연 풍경 일정입니다.',note:'두 장소 사이 대중교통 편수가 적으므로 버스 시간이나 렌터카·택시 이용을 미리 확인하세요.',days:[{label:'구시모토',places:[1915,1916],schedule:[[1915,'09:30',places.find(p=>p.id===1915).activity],[null,'11:30','구시모토에서 점심·이동'],[1916,'13:30',places.find(p=>p.id===1916).activity]]}],image:''}
];
const routePlanning={};
for(const r of routes){const d=r.days[0];routePlanning[r.id]={start:places.find(p=>p.id===d.places[0])?.name||'',end:places.find(p=>p.id===d.places.at(-1))?.name||'',move:'구간별 길찾기로 도보·대중교통을 선택하세요.',meal:d.schedule.find(x=>x[0]===null)?.[2]||'일정 중간에 식사·휴식',rain:'야외 일정은 날씨에 맞춰 줄이고 실내 시설 관람을 늘리세요.',skip:'시간이 부족하면 마지막 장소를 다음 일정으로 미루세요.',warning:r.note,schedule:d.schedule}}

const credits=[
{label:'와카야마성',source:photos['1900'].source,author:'Saigen Jiro',license:'CC0',licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/'},
{label:'기미이데라',source:photos['1901'].source,author:'Hyppolyte de Saint-Rambert',license:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/'},
{label:'와카야마 마리나시티',source:photos['1902'].source,author:'Yanajin33',license:'CC BY-SA 3.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/'},
{label:'고야산 오쿠노인',source:photos['1904'].source,author:'Daderot',license:'CC BY-SA 3.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/'},
{label:'구마노 혼구 타이샤',source:photos['1906'].source,author:'Tim Notari',license:'CC BY-SA 2.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/2.0/'},
{label:'오유노하라',source:photos['1907'].source,author:'Douglas Perkins',license:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/'},
{label:'가미쿠라 신사',source:photos['1909'].source,author:'Saigen Jiro',license:'CC0',licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/'},
{label:'구마노 나치 타이샤',source:photos['1910'].source,author:'Fg2',license:'Public domain',licenseUrl:photos['1910'].source},
{label:'나치 폭포',source:photos['1911'].source,author:'Kansai explorer',license:'CC BY 3.0',licenseUrl:'https://creativecommons.org/licenses/by/3.0/'},
{label:'산단베키',source:photos['1913'].source,author:'ロリ',license:'CC BY-SA 3.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/'},
{label:'어드벤처 월드',source:photos['1914'].source,author:'Hideto KOBAYASHI',license:'CC BY 2.0',licenseUrl:'https://creativecommons.org/licenses/by/2.0/'},
{label:'하시구이이와',source:photos['1915'].source,author:'KishujiRapid',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/'}
];

regionalCatalog.push({pref:'와카야마',places,events,foods,photos,guides,intros,heroes,facts,foodDetails,foodPhotos,routePlanning,routes,credits,hero:photos['1900']});
})();