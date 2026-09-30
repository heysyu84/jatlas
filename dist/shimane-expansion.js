(()=>{const cf=f=>'https://commons.wikimedia.org/wiki/Special:FilePath/'+encodeURIComponent(f)+'?width=960';const cp=f=>'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(f).replace(/%20/g,'_');const map=q=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q);const note='시마네현 공식 관광 안내의 명칭과 위치를 기준으로 등록했습니다. 방문 전 운영·교통 안내를 확인하세요.';
if(regionalCatalog.some(x=>x.pref==='시마네'))return;

const places=[
{id:2100,pref:'시마네',area:'마쓰에·신지코',town:'마쓰에시',name:'마쓰에성',tag:'국보·성·역사',description:'1607~1611년에 축성된 산인 지방 유일의 현존 천수 성곽으로, 일본에 남은 12개 현존 천수 가운데 하나이며 천수는 국보로 지정되어 있습니다.',activity:'천수 내부를 올라 성 구조와 전시를 살펴보고 최상층에서 마쓰에 시내와 신지코 방향을 바라보세요.',checked:'2026.09.30',lat:35.4751,lon:133.0506,source:'https://kankou-shimane.com/en/destinations/9289',note,mapQuery:'島根 松江城'},
{id:2101,pref:'시마네',area:'마쓰에·신지코',town:'마쓰에시',name:'호리카와 유람선',tag:'유람선·성하마을·산책',description:'마쓰에성의 옛 해자를 따라 약 50분 동안 작은 배로 성하마을을 돌아보는 유람선으로, 성곽과 무가저택·수로 풍경을 낮은 시점에서 즐길 수 있습니다.',activity:'마쓰에성 관람 전후에 유람선을 타고 해자와 성하마을 풍경을 둘러보세요. 악천후나 수위에 따라 운항이 변경될 수 있습니다.',checked:'2026.09.30',lat:35.4741,lon:133.0520,source:'https://www.kankou-shimane.com/en/destinations/9294',note,mapQuery:'松江 堀川遊覧船'},
{id:2102,pref:'시마네',area:'마쓰에·신지코',town:'마쓰에시',name:'다마쓰쿠리 온천',tag:'온천·료칸·산책',description:'이즈모국 풍토기에도 기록된 오래된 온천지로, 다마유강을 따라 료칸과 족욕·신사·상점이 이어지는 마쓰에 대표 온천 마을입니다.',activity:'강변 온천가를 산책하고 숙박 또는 당일치기 입욕을 즐겨보세요. 시설별 입욕 가능 시간은 미리 확인하세요.',checked:'2026.09.30',lat:35.4154,lon:133.0072,source:'https://www.kankou-shimane.com/en/destinations/',note,mapQuery:'島根 玉造温泉'},
{id:2103,pref:'시마네',area:'야스기',town:'야스기시',name:'아다치 미술관',tag:'미술관·일본정원·니혼가',description:'근현대 일본화 컬렉션과 대규모 일본정원을 함께 감상하는 미술관으로, 창과 복도를 통해 정원을 한 폭의 그림처럼 보도록 설계된 공간이 특징입니다.',activity:'요코야마 다이칸 등 일본화와 계절에 따라 달라지는 정원을 여유 있게 둘러보세요. 최소 2시간 정도 잡는 편이 좋습니다.',checked:'2026.09.30',lat:35.3806,lon:133.1949,source:'https://kankou-shimane.com/en/destinations/9290',note,mapQuery:'島根 足立美術館'},
{id:2104,pref:'시마네',area:'이즈모',town:'이즈모시',name:'이즈모타이샤',tag:'국보·신사·신화',description:'오쿠니누시노오카미를 모시는 일본의 대표 신사 가운데 하나로, 국보 본전과 다이샤즈쿠리 건축, 가구라덴의 거대한 시메나와로 유명합니다.',activity:'본전과 경내를 참배하고 가구라덴까지 천천히 둘러보세요. 일반적인 신사와 다른 참배 예법 안내가 있으면 현지 안내를 따르세요.',checked:'2026.09.30',lat:35.4020,lon:132.6854,source:'https://www.kankou-shimane.com/en/destinations/9282',note,mapQuery:'島根 出雲大社'},
{id:2105,pref:'시마네',area:'이즈모',town:'이즈모시',name:'이나사노하마',tag:'해변·신화·일몰',description:'이즈모타이샤 서쪽에 이어지는 백사장으로, 벤텐지마 바위와 일몰 풍경이 아름답고 음력 10월 신들을 맞이하는 가미무카에 의식의 무대이기도 합니다.',activity:'이즈모타이샤에서 걸어서 해변까지 이어보고 벤텐지마와 일몰 풍경을 감상해보세요.',checked:'2026.09.30',lat:35.4003,lon:132.6717,source:'https://www.kankou-shimane.com/en/destination_city/izumo',note,mapQuery:'島根 稲佐の浜'},
{id:2106,pref:'시마네',area:'이즈모·히노미사키',town:'이즈모시',name:'이즈모 히노미사키 등대',tag:'등대·해안·전망',description:'시마네반도 서단의 흰 석조 등대로, 높이 43.65m의 전망대에서 일본해와 해안 절벽을 넓게 조망할 수 있습니다.',activity:'등대 내부 공개시간이 맞으면 전망대에 올라 해안을 내려다보고 주변 산책로와 히노미사키 신사를 함께 둘러보세요.',checked:'2026.09.30',lat:35.4338,lon:132.6267,source:'https://kankou-shimane.com/en/destinations/9292',note,mapQuery:'島根 出雲日御碕灯台'},
{id:2107,pref:'시마네',area:'이와미긴잔·오다',town:'오다시',name:'이와미긴잔 은광 유적',tag:'세계유산·광산·역사',description:'16~17세기 세계 은 생산과 교역에 큰 영향을 준 은광 유적으로, 광산뿐 아니라 오모리 마을·운송로·항구와 자연환경까지 포함해 세계유산으로 등록되어 있습니다.',activity:'오모리 마을에서 광산 방향으로 천천히 걸으며 유적과 자연을 함께 살펴보세요. 지역이 넓어 자전거·버스 동선을 미리 정하면 좋습니다.',checked:'2026.09.30',lat:35.1064,lon:132.4369,source:'https://www.kankou-shimane.com/en/destinations/9287',note,mapQuery:'島根 石見銀山'},
{id:2108,pref:'시마네',area:'이와미긴잔·오다',town:'오다시',name:'류겐지 마부',tag:'광산갱도·세계유산·역사',description:'이와미긴잔의 수백 개 갱도 가운데 일반 방문객이 연중 들어갈 수 있는 대표 갱도로, 에도시대 광부들이 정으로 파낸 흔적을 벽면에서 볼 수 있습니다.',activity:'오모리에서 숲길을 따라 갱도까지 이동해 내부의 채굴 흔적을 살펴보세요. 내부는 서늘하고 젖은 구간이 있을 수 있습니다.',checked:'2026.09.30',lat:35.1069,lon:132.4268,source:'https://www.kankou-shimane.com/en/destinations/9280',note,mapQuery:'島根 龍源寺間歩'},
{id:2109,pref:'시마네',area:'이와미긴잔·오다',town:'오다시',name:'오모리 마을',tag:'세계유산·옛 거리·산책',description:'이와미긴잔 관리와 상업의 중심이었던 산골 마을로, 약 1.5km 길이의 거리 주변에 무가저택·상가·사찰과 전통 가옥이 보존되어 있습니다.',activity:'오모리 거리를 걸으며 옛 관청·상가와 카페를 둘러보고 광산 산책로와 이어보세요.',checked:'2026.09.30',lat:35.1120,lon:132.4442,source:'https://www.kankou-shimane.com/en/destinations/10932',note,mapQuery:'島根 石見銀山 大森町'},
{id:2110,pref:'시마네',area:'이와미긴잔·유노쓰',town:'오다시',name:'유노쓰 온천',tag:'온천·전통거리·세계유산',description:'이와미긴잔의 항구 역할을 했던 유노쓰에 남은 오래된 온천 마을로, 19세기 이후 건물이 이어지는 전통거리와 공동탕이 특징입니다.',activity:'온천가를 산책하고 공동탕이나 숙소의 입욕을 즐겨보세요. 저녁에는 이와미 가구라 공연이 열리는 날도 있으니 일정을 확인하세요.',checked:'2026.09.30',lat:35.0913,lon:132.3508,source:'https://www.kankou-shimane.com/en/destinations/9305',note,mapQuery:'島根 温泉津温泉'},
{id:2111,pref:'시마네',area:'쓰와노',town:'쓰와노초',name:'쓰와노 도노마치 거리',tag:'성하마을·수로·산책',description:'흰 회벽 건물과 무가저택 흔적, 잉어가 헤엄치는 수로가 이어지는 쓰와노의 상징적인 옛 거리입니다.',activity:'도노마치 수로를 따라 걷고 쓰와노 가톨릭교회와 옛 학교·카페까지 함께 둘러보세요.',checked:'2026.09.30',lat:34.4700,lon:131.7736,source:'https://www.kankou-shimane.com/en/destinations/9286',note,mapQuery:'島根 津和野 殿町通り'},
{id:2112,pref:'시마네',area:'쓰와노',town:'쓰와노초',name:'다이코다니 이나리 신사',tag:'신사·센본도리이·전망',description:'쓰와노를 내려다보는 산비탈에 자리한 이나리 신사로, 약 1,000개의 붉은 도리이가 약 300m 참배길을 따라 이어지는 풍경이 유명합니다.',activity:'도리이 참배길을 따라 올라 본전을 참배하고 높은 곳에서 쓰와노 시가지를 바라보세요.',checked:'2026.09.30',lat:34.4652,lon:131.7695,source:'https://www.kankou-shimane.com/en/destinations/9288',note,mapQuery:'島根 太皷谷稲成神社'},
{id:2113,pref:'시마네',area:'쓰와노',town:'쓰와노초',name:'쓰와노성터',tag:'성터·산성·전망',description:'해발 약 362m 산 위에 남은 중세 산성 유적으로, 석벽 위에서 계곡에 자리한 쓰와노 성하마을을 한눈에 내려다볼 수 있습니다.',activity:'체어리프트를 이용한 뒤 약 20분 산길을 걸어 혼마루와 석벽 전망을 둘러보세요. 겨울철 리프트 운휴일을 확인하세요.',checked:'2026.09.30',lat:34.4633,lon:131.7652,source:'https://www.kankou-shimane.com/en/destinations/9284',note,mapQuery:'島根 津和野城跡'},
{id:2114,pref:'시마네',area:'하마다·이와미',town:'하마다시',name:'시마네 해양관 AQUAS',tag:'수족관·벨루가·가족',description:'이와미 해변공원에 자리한 대형 수족관으로, 벨루가와 펭귄·상어 등 다양한 해양생물을 전시하며 대형 수조 터널과 벨루가 프로그램이 대표적입니다.',activity:'벨루가 프로그램과 먹이주기·공연 시간을 먼저 확인한 뒤 대형 수조와 해양생물 전시를 둘러보세요.',checked:'2026.09.30',lat:34.9889,lon:132.1045,source:'https://www.kankou-shimane.com/en/destinations/9296',note,mapQuery:'島根 しまね海洋館アクアス'},
{id:2115,pref:'시마네',area:'오키·니시노시마',town:'니시노시마초',name:'구니가 해안',tag:'지오파크·절벽·하이킹',description:'오키 유네스코 세계지질공원의 대표 해안으로, 높이 257m의 마텐가이 절벽과 아치형 바위·초원·방목 소와 말이 어우러지는 대규모 해안 경관입니다.',activity:'마텐가이 전망대와 초원 산책로를 걸어보거나 운항 시기에 맞춰 해안 유람선을 이용하세요. 강풍과 절벽 가장자리에 주의하세요.',checked:'2026.09.30',lat:36.0931,lon:132.9943,source:'https://www.kankou-shimane.com/en/destinations/9307',note,mapQuery:'島根 隠岐 国賀海岸'},
{id:2116,pref:'시마네',area:'오키·도고',town:'오키노시마초',name:'촛불섬(로소쿠지마)',tag:'기암·일몰·유람선',description:'오키 도고 앞바다에 솟은 촛대 모양 바위로, 맑고 파도가 잔잔한 날 유람선에서 해가 바위 끝에 겹치면 촛불이 켜진 듯한 풍경을 볼 수 있습니다.',activity:'일몰 시각에 맞춘 전용 유람선 운항 여부를 미리 확인하고 예약하세요. 기상과 파도 때문에 결항될 수 있습니다.',checked:'2026.09.30',lat:36.2868,lon:132.9958,source:'https://www.kankou-shimane.com/en/destinations/9291',note,mapQuery:'島根 隠岐 ローソク島'}
];
for(const p of places)p.mapUrl=map(p.mapQuery);

const guides={
'2100':{access:'JR 마쓰에역에서 레이크라인 버스로 마쓰에성 오테마에 정류장까지 약 10분입니다.',duration:'1시간 30분~2시간'},
'2101':{access:'마쓰에성 주변 오테마에·후레아이광장 등 여러 선착장에서 탑승할 수 있습니다.',duration:'약 50분~1시간 30분'},
'2102':{access:'JR 다마쓰쿠리온센역에서 온천가까지 버스·택시 또는 숙소 송영을 이용하세요.',duration:'2시간~1박'},
'2103':{access:'JR 야스기역에서 무료 셔틀버스로 약 20분입니다.',duration:'2~3시간'},
'2104':{access:'이치바타전철 이즈모타이샤마에역에서 도보 약 10분 또는 JR 이즈모시역에서 버스를 이용하세요.',duration:'1시간 30분~3시간'},
'2105':{access:'이즈모타이샤에서 서쪽으로 도보 약 15분입니다.',duration:'45~90분'},
'2106':{access:'JR 이즈모시역 또는 이즈모타이샤에서 히노미사키행 버스를 이용하세요.',duration:'1시간 30분~2시간'},
'2107':{access:'JR 오다시역에서 이와미긴잔·오모리 방면 버스로 약 30분입니다.',duration:'반나절~1일'},
'2108':{access:'오모리 버스정류장에서 계곡 산책로를 따라 도보 약 40분입니다.',duration:'2~3시간'},
'2109':{access:'JR 오다시역에서 오모리 방면 버스를 이용하세요.',duration:'1시간 30분~3시간'},
'2110':{access:'JR 유노쓰역에서 온천가 방면 버스로 약 5분 또는 도보로 이동하세요.',duration:'2시간~1박'},
'2111':{access:'JR 쓰와노역에서 도보 약 10분입니다.',duration:'1~2시간'},
'2112':{access:'JR 쓰와노역에서 도보 약 30분 또는 택시 약 5분입니다.',duration:'1~1시간 30분'},
'2113':{access:'쓰와노 시내에서 관광리프트를 이용한 뒤 산길을 약 20분 걸으세요.',duration:'1시간 30분~2시간'},
'2114':{access:'JR 하시역에서 버스를 이용하거나 하마다역에서 지역 교통편을 확인하세요.',duration:'2~4시간'},
'2115':{access:'오키 기센으로 니시노시마의 벳푸항에 들어간 뒤 버스·렌터카·택시로 이동하세요.',duration:'3~5시간'},
'2116':{access:'오키노시마초에서 계절별 촛불섬 유람선 출항지와 송영편을 예약할 때 확인하세요.',duration:'2~3시간 · 유람선 포함'}
};
const facts=Object.fromEntries(places.map(p=>[String(p.id),[guides[String(p.id)].duration]]));

const photos={
'2100':{src:cf('Matsue castle02s4592.jpg'),alt:'마쓰에성',source:cp('Matsue castle02s4592.jpg')},
'2101':{src:cf('Horikawa Sightseeing Boat, Matsue - Apr 11, 2026.jpg'),alt:'호리카와 유람선',source:cp('Horikawa Sightseeing Boat, Matsue - Apr 11, 2026.jpg')},
'2102':{src:cf('Tamatsukuri onsen01st3200.jpg'),alt:'다마쓰쿠리 온천',source:cp('Tamatsukuri onsen01st3200.jpg')},
'2103':{src:cf('Adachi Museum of Art Garden.jpg'),alt:'아다치 미술관',source:cp('Adachi Museum of Art Garden.jpg')},
'2104':{src:cf('Izumo taisha.JPG'),alt:'이즈모타이샤',source:cp('Izumo taisha.JPG')},
'2105':{src:cf('Inasa no hama.jpg'),alt:'이나사노하마',source:cp('Inasa no hama.jpg')},
'2106':{src:cf('080719 Hinomisaki Lighthouse Izumo Shimane pref Japan01s3.jpg'),alt:'이즈모 히노미사키 등대',source:cp('080719 Hinomisaki Lighthouse Izumo Shimane pref Japan01s3.jpg')},
'2107':{src:cf('Iwami Ginzan Silver Mine, Shimizudani Refinery Ruins 001.JPG'),alt:'이와미긴잔 은광 유적',source:cp('Iwami Ginzan Silver Mine, Shimizudani Refinery Ruins 001.JPG')},
'2108':{src:cf('Iwami Ginzan Silver Mine, Ryugenji Mabu Mine Shaft 001.JPG'),alt:'류겐지 마부',source:cp('Iwami Ginzan Silver Mine, Ryugenji Mabu Mine Shaft 001.JPG')},
'2109':{src:cf('Omori shimogawara hukuya ato.JPG'),alt:'오모리 마을',source:cp('Omori shimogawara hukuya ato.JPG')},
'2110':{src:cf('180505 Yunotsu of Iwami Ginzan Silver Mine Oda Shimane pref Japan02s3.jpg'),alt:'유노쓰 온천',source:cp('180505 Yunotsu of Iwami Ginzan Silver Mine Oda Shimane pref Japan02s3.jpg')},
'2111':{src:cf('TsuwanoJP.jpg'),alt:'쓰와노',source:cp('TsuwanoJP.jpg')},
'2112':{src:cf('View of Taikodani Inari Shrine.jpg'),alt:'다이코다니 이나리 신사',source:cp('View of Taikodani Inari Shrine.jpg')},
'2113':{src:cf('Tsuwano castle a site of Sanjukkendai.JPG'),alt:'쓰와노성터',source:cp('Tsuwano castle a site of Sanjukkendai.JPG')},
'2114':{src:cf('Shimane Aquarium AQUAS beluga pool.jpg'),alt:'시마네 해양관 AQUAS',source:cp('Shimane Aquarium AQUAS beluga pool.jpg')},
'2115':{src:cf('Matengai Cliff at Kuniga coast, Nishinoshima.jpg'),alt:'구니가 해안',source:cp('Matengai Cliff at Kuniga coast, Nishinoshima.jpg')},
'2116':{src:cf('Rousoku Iwa.jpg'),alt:'촛불섬',source:cp('Rousoku Iwa.jpg')}
};

const foods=[
{name:'이즈모 소바',area:'이즈모',kind:'향토·소바',where:'이즈모·마쓰에',description:'메밀 껍질째 갈아 색과 향이 진한 면을 쓰는 시마네 대표 소바로, 둥근 그릇을 포개 먹는 와리고 소바와 따뜻한 가마아게 소바가 유명합니다.',source:'https://www.kankou-shimane.com/en/'},
{name:'신지코 시지미국',area:'마쓰에·신지코',kind:'호수·향토음식',where:'마쓰에·신지코 주변',description:'신지코에서 잡히는 야마토 시지미를 된장국 등으로 즐기는 지역 음식으로, 작은 조개에서 우러나는 깊은 감칠맛이 특징입니다.',source:'https://www.kankou-shimane.com/en/'},
{name:'노도구로',area:'하마다·이와미',kind:'해산물·지역 특산',where:'하마다·일본해 연안',description:'지방이 풍부한 흰살생선 아카무쓰를 시마네에서는 노도구로로 즐기며, 소금구이·조림·회 등으로 먹습니다.',source:'https://www.kankou-shimane.com/en/'},
{name:'시마네 와규',area:'시마네 전역',kind:'지역 특산·와규',where:'시마네 전역',description:'시마네현에서 사육되는 브랜드 와규로, 스테이크·야키니쿠·스키야키 등으로 부드러운 육질과 풍부한 지방 풍미를 즐깁니다.',source:'https://www.kankou-shimane.com/en/'},
{name:'겐지마키',area:'쓰와노',kind:'화과자·기념품',where:'쓰와노초',description:'얇은 카스텔라풍 반죽으로 팥소를 길게 감싼 쓰와노 대표 화과자로, 차와 함께 먹기 좋고 기념품으로도 많이 구입합니다.',source:'https://www.kankou-shimane.com/en/destinations/9444'}
];
const foodDetails={
'이즈모 소바':{kind:'한 끼',taste:'메밀 향이 진하고 고소하며 비교적 굵은 식감',how:'처음이라면 와리고 소바로 여러 단을 나눠 먹으며 양념 변화를 즐겨보세요.'},
'신지코 시지미국':{kind:'국·아침식사',taste:'조개의 진한 감칠맛과 된장의 구수함',how:'마쓰에의 아침 식사나 정식에서 시지미 된장국을 골라보세요.'},
'노도구로':{kind:'한 끼·해산물',taste:'흰살생선이지만 지방이 풍부하고 부드러운 맛',how:'소금구이로 지방 풍미를 느끼거나 제철에는 회·초밥으로 맛보세요.'},
'시마네 와규':{kind:'한 끼',taste:'부드러운 육질과 지방의 감칠맛',how:'스테이크·야키니쿠·스키야키 중 예산과 취향에 맞게 골라보세요.'},
'겐지마키':{kind:'간식·기념품',taste:'부드러운 반죽과 달콤한 팥소',how:'쓰와노 산책 중 차와 함께 맛보고 여러 제과점 제품을 비교해보세요.'}
};
const foodPhotos={
'이즈모 소바':{src:cf('Izumo soba.JPG'),source:cp('Izumo soba.JPG')},
'신지코 시지미국':{src:cf('Miso soup of shizimi(corbicula japonica) 2014.jpg'),source:cp('Miso soup of shizimi(corbicula japonica) 2014.jpg')},
'노도구로':{src:cf('Nodoguro (26323999913).jpg'),source:cp('Nodoguro (26323999913).jpg')},
'시마네 와규':{src:cf('Wagyu beef.jpeg'),source:cp('Wagyu beef.jpeg')},
'겐지마키':{src:cf('Genji-maki, sweet in Tsuwano - September 2005.jpg'),source:cp('Genji-maki, sweet in Tsuwano - September 2005.jpg')}
};

const events=[
{id:'sm-kamiari',pref:'시마네',name:'이즈모타이샤 가미아리사이·가미무카에사이',area:'이즈모',months:[11,12],timing:'음력 10월 10일 전후 · 매년 양력 날짜 변동',scheduleType:'매년 공식 일정 확인',type:'신사·전통제례',description:'전국의 신들이 이즈모에 모인다는 전승에 따라 이나사노하마에서 신들을 맞이하고 이즈모타이샤에서 제례를 이어가는 이즈모의 대표 신앙 행사입니다.',source:'https://www.kankou-shimane.com/en/news/27025'},
{id:'sm-suitoro',pref:'시마네',name:'마쓰에 수이토로',area:'마쓰에·신지코',months:[9,10],timing:'예년 가을 · 개최일별 점등일 확인',scheduleType:'매년 일정 발표',type:'등불·야간행사',description:'국보 마쓰에성과 주변 성하마을을 수많은 행등과 조명으로 밝히는 가을 야간 행사입니다.',source:'https://www.kankou-shimane.com/en/destination_city/matsue'},
{id:'sm-sagimai',pref:'시마네',name:'쓰와노 사기마이',area:'쓰와노',months:[7],timing:'매년 7월 20일·27일',scheduleType:'고정 날짜',type:'전통춤·마쓰리',description:'400년 넘게 전승된 백로 춤으로, 수컷과 암컷 백로 의상을 입은 무용수가 피리·북 소리에 맞춰 쓰와노 마을을 돌며 춤을 봉납합니다.',source:'https://www.kankou-shimane.com/en/destinations/9444'},
{id:'sm-yabusame',pref:'시마네',name:'쓰와노 야부사메 신지',area:'쓰와노',months:[4],timing:'예년 4월 둘째 일요일',scheduleType:'매년 일정 확인',type:'기마궁술·전통행사',description:'오래된 야부사메 마장에서 말을 달리며 과녁을 쏘는 쓰와노의 전통 신사 의식으로, 벚꽃철과 겹치는 해에는 풍경이 특히 인상적입니다.',source:'https://www.kankou-shimane.com/en/wp-content/themes/navi_en/brochure/IWAMI_English.pdf'},
{id:'sm-iwami-kagura',pref:'시마네',name:'이와미 가구라 정기공연',area:'하마다·이와미',months:[1,2,3,4,5,6,7,8,9,10,11,12],timing:'연중 · 공연장별 날짜 확인',scheduleType:'정기공연·일정 확인',type:'전통공연·가구라',description:'화려한 의상과 빠른 장단으로 신화 이야기를 풀어내는 이와미 지역의 전통 가구라 공연으로, 여러 공연장에서 정기공연이 열립니다.',source:'https://www.kankou-shimane.com/en/travel_information/13359'}
];

const intros={
'시마네':['','이즈모 신화와 신사, 마쓰에의 성하마을과 정원, 세계유산 이와미긴잔, 쓰와노의 옛 거리, 오키 제도의 지오파크까지 동서와 섬 지역에 서로 다른 여행 테마가 펼쳐지는 현입니다.'],
'마쓰에·신지코':['','국보 마쓰에성과 해자, 신지코 풍경과 오래된 온천을 함께 즐길 수 있는 시마네 동부의 성하마을 지역입니다.'],
'야스기':['','아다치 미술관의 일본정원과 니혼가를 중심으로 차분한 예술 여행을 즐기기 좋은 지역입니다.'],
'이즈모':['','이즈모타이샤와 이나사노하마를 중심으로 일본 신화와 인연 신앙, 일몰 풍경을 함께 즐길 수 있는 지역입니다.'],
'이즈모·히노미사키':['','이즈모타이샤에서 해안을 따라 히노미사키 등대와 신사로 이어지는 시마네반도 서쪽의 바다 전망 지역입니다.'],
'이와미긴잔·오다':['','세계유산 은광 유적과 오모리 옛 거리, 산길을 걸으며 광산 역사와 자연을 함께 체험하는 지역입니다.'],
'이와미긴잔·유노쓰':['','은광의 외항으로 번영했던 옛 항구와 온천마을이 남아 있어 세계유산의 생활문화까지 이어볼 수 있는 지역입니다.'],
'쓰와노':['','흰 벽과 잉어 수로가 이어지는 옛 성하마을, 산 위 신사와 성터가 어우러진 서부 시마네의 역사 여행지입니다.'],
'하마다·이와미':['','일본해 해산물과 이와미 가구라, 대형 수족관을 함께 즐길 수 있는 시마네 서부 해안 지역입니다.'],
'오키·니시노시마':['','거대한 해식 절벽과 초원, 방목 소와 말이 어우러지는 오키 세계지질공원의 대표 자연 지역입니다.'],
'오키·도고':['','기암과 일몰, 섬 특유의 문화와 자연을 배와 육로로 천천히 즐기는 오키 제도 도고 지역입니다.']
};
const heroes={'마쓰에·신지코':2100,'야스기':2103,'이즈모':2104,'이즈모·히노미사키':2106,'이와미긴잔·오다':2107,'이와미긴잔·유노쓰':2110,'쓰와노':2112,'하마다·이와미':2114,'오키·니시노시마':2115,'오키·도고':2116};

const routes=[
{id:'r-2100-0',pref:'시마네',areas:['마쓰에·신지코'],title:'마쓰에성과 호리카와 유람선 반나절',duration:'반나절',intro:'국보 현존 천수와 옛 해자를 육상과 배에서 이어보는 마쓰에 대표 일정입니다.',note:'성 내부 계단이 가파르므로 관람시간을 넉넉히 잡고 유람선 운항상황을 확인하세요.',days:[{label:'마쓰에',places:[2100,2101],schedule:[[2100,'09:30',places.find(p=>p.id===2100).activity],[null,'11:30','마쓰에성 주변에서 점심·휴식'],[2101,'12:30',places.find(p=>p.id===2101).activity]]}],image:''},
{id:'r-2100-1',pref:'시마네',areas:['마쓰에·신지코'],title:'마쓰에성과 다마쓰쿠리 온천 하루',duration:'1일',intro:'성하마을 관광 뒤 오래된 온천가로 이동해 쉬어가는 마쓰에 대표 역사·휴양 일정입니다.',note:'숙박한다면 다마쓰쿠리 온천을 오후 늦게 배치하면 저녁 온천가 분위기까지 즐기기 좋습니다.',days:[{label:'마쓰에·다마쓰쿠리',places:[2100,2102],schedule:[[2100,'09:30',places.find(p=>p.id===2100).activity],[null,'12:30','마쓰에 시내에서 점심·다마쓰쿠리 이동'],[2102,'14:30',places.find(p=>p.id===2102).activity]]}],image:''},
{id:'r-2100-2',pref:'시마네',areas:['야스기'],title:'아다치 미술관 반나절',duration:'반나절',intro:'일본정원과 근현대 일본화를 한 공간에서 여유롭게 감상하는 예술 중심 일정입니다.',note:'정원과 전시 규모가 커서 최소 2시간을 잡고 야스기역 셔틀 시간을 확인하세요.',days:[{label:'야스기',places:[2103],schedule:[[2103,'10:00',places.find(p=>p.id===2103).activity],[null,'13:00','미술관 또는 야스기에서 점심·휴식']]}],image:''},
{id:'r-2100-3',pref:'시마네',areas:['이즈모'],title:'이즈모타이샤와 이나사노하마 반나절',duration:'반나절',intro:'이즈모 신화의 대표 신사와 신들을 맞이하는 해변을 걸어서 이어보는 핵심 일정입니다.',note:'일몰을 보고 싶다면 오후에 시작하되 이즈모타이샤 참배 가능 시간과 돌아가는 교통편을 먼저 확인하세요.',days:[{label:'이즈모',places:[2104,2105],schedule:[[2104,'10:00',places.find(p=>p.id===2104).activity],[null,'12:00','신몬도리에서 점심·카페'],[2105,'14:00',places.find(p=>p.id===2105).activity]]}],image:''},
{id:'r-2100-4',pref:'시마네',areas:['이즈모','이즈모·히노미사키'],title:'이즈모타이샤와 히노미사키 하루',duration:'1일',intro:'이즈모의 신사 문화에서 일본해 절벽과 흰 등대 풍경까지 이어보는 하루 일정입니다.',note:'히노미사키행 버스 편수가 많지 않으므로 왕복 시간표를 먼저 고정하세요.',days:[{label:'이즈모·히노미사키',places:[2104,2106],schedule:[[2104,'09:30',places.find(p=>p.id===2104).activity],[null,'12:00','이즈모타이샤 주변에서 점심·버스 이동'],[2106,'13:30',places.find(p=>p.id===2106).activity]]}],image:''},
{id:'r-2100-5',pref:'시마네',areas:['이와미긴잔·오다'],title:'오모리와 류겐지 마부 하루',duration:'1일',intro:'세계유산 광산마을과 실제 갱도를 걸어서 이어보는 이와미긴잔 핵심 일정입니다.',note:'오모리에서 류겐지 마부까지 왕복 도보 시간이 길어 자전거 대여나 현지 이동수단을 고려하세요.',days:[{label:'이와미긴잔',places:[2109,2108,2107],schedule:[[2109,'09:30',places.find(p=>p.id===2109).activity],[2108,'11:30',places.find(p=>p.id===2108).activity],[null,'13:30','오모리로 돌아와 점심·휴식'],[2107,'14:30',places.find(p=>p.id===2107).activity]]}],image:''},
{id:'r-2100-6',pref:'시마네',areas:['이와미긴잔·유노쓰','이와미긴잔·오다'],title:'이와미긴잔과 유노쓰 온천 1박2일',duration:'1박2일',intro:'세계유산 은광을 충분히 둘러본 뒤 옛 항구 온천마을에서 숙박하는 시마네 중부 대표 일정입니다.',note:'두 지역을 당일에 급하게 묶기보다 유노쓰 숙박으로 나누면 이와미 가구라 야간공연까지 연결하기 좋습니다.',days:[{label:'DAY 1 · 이와미긴잔',places:[2109,2108],schedule:[[2109,'10:00',places.find(p=>p.id===2109).activity],[2108,'12:00',places.find(p=>p.id===2108).activity],[null,'15:00','유노쓰로 이동·숙박']]},{label:'DAY 2 · 유노쓰',places:[2110],schedule:[[2110,'09:30',places.find(p=>p.id===2110).activity],[null,'12:00','유노쓰에서 점심·출발']]}],image:''},
{id:'r-2100-7',pref:'시마네',areas:['쓰와노'],title:'쓰와노 성하마을과 산 위 전망 하루',duration:'1일',intro:'도노마치의 옛 거리에서 붉은 도리이 참배길과 산성 전망까지 이어보는 쓰와노 대표 일정입니다.',note:'쓰와노성 리프트 운휴일과 마지막 하행 시간을 먼저 확인하고 산길에는 편한 신발을 준비하세요.',days:[{label:'쓰와노',places:[2111,2112,2113],schedule:[[2111,'09:30',places.find(p=>p.id===2111).activity],[null,'11:30','쓰와노에서 점심'],[2112,'12:30',places.find(p=>p.id===2112).activity],[2113,'14:00',places.find(p=>p.id===2113).activity]]}],image:''},
{id:'r-2100-8',pref:'시마네',areas:['하마다·이와미'],title:'AQUAS와 이와미 해안 반나절',duration:'반나절',intro:'시마네 서부의 해양생물을 실내에서 즐기는 가족·전시 중심 일정입니다.',note:'벨루가 프로그램 시간이 방문 동선을 좌우하므로 입장 후 당일 프로그램부터 확인하세요.',days:[{label:'하마다·이와미',places:[2114],schedule:[[2114,'10:00',places.find(p=>p.id===2114).activity],[null,'13:00','이와미 해변공원 주변에서 점심·휴식']]}],image:''},
{id:'r-2100-9',pref:'시마네',areas:['오키·니시노시마'],title:'구니가 해안 하루',duration:'1일',intro:'오키의 초원과 거대한 해식 절벽을 하이킹 또는 유람선으로 깊게 즐기는 자연 일정입니다.',note:'본토에서 당일 왕복보다는 오키 숙박을 전제로 하고 섬 내 버스·렌터카와 페리 시간표를 함께 확인하세요.',days:[{label:'오키·니시노시마',places:[2115],schedule:[[2115,'09:30',places.find(p=>p.id===2115).activity],[null,'13:00','니시노시마에서 점심·휴식']]}],image:''},
{id:'r-2100-10',pref:'시마네',areas:['오키·도고'],title:'촛불섬 일몰 유람선 반나절',duration:'반나절',intro:'해질 무렵 바위 위에 태양이 겹치는 오키의 상징적인 일몰 장면을 배에서 노리는 일정입니다.',note:'맑은 날씨·잔잔한 파도·일몰 위치가 모두 맞아야 하므로 관람을 보장할 수 없습니다. 반드시 사전 예약과 당일 운항 확인이 필요합니다.',days:[{label:'오키·도고',places:[2116],schedule:[[2116,'16:00',places.find(p=>p.id===2116).activity],[null,'18:30','귀항 후 오키노시마에서 저녁']]}],image:''}
];
const routePlanning={};
for(const r of routes){for(const d of r.days){/* preserved schedules */}const first=r.days[0],last=r.days[r.days.length-1];routePlanning[r.id]={start:places.find(p=>p.id===first.places[0])?.name||'',end:places.find(p=>p.id===last.places.at(-1))?.name||'',move:'구간별 공식 교통편과 시간표를 확인해 도보·철도·버스·선박을 선택하세요.',meal:r.days.flatMap(d=>d.schedule).find(x=>x[0]===null)?.[2]||'일정 중간에 식사·휴식',rain:'야외 일정은 날씨에 맞춰 줄이고 실내 관람 또는 이동일정을 조정하세요.',skip:'시간이 부족하면 마지막 장소를 다음 일정으로 미루세요.',warning:r.note,schedule:first.schedule}}

const credits=[
{label:'마쓰에성',source:photos['2100'].source,author:'663highland',license:'CC BY-SA / GFDL',licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/'},
{label:'호리카와 유람선',source:photos['2101'].source,author:'Spiegel',license:'CC BY 4.0',licenseUrl:'https://creativecommons.org/licenses/by/4.0/'},
{label:'다마쓰쿠리 온천',source:photos['2102'].source,author:'663highland',license:'CC BY-SA / GFDL',licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/'},
{label:'아다치 미술관',source:photos['2103'].source,author:'Bernard Gagnon',license:'CC BY-SA / GFDL',licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/'},
{label:'이즈모타이샤',source:photos['2104'].source,author:'Urashimataro',license:'Public domain',licenseUrl:photos['2104'].source},
{label:'이나사노하마',source:photos['2105'].source,author:'Aimaimyi',license:'CC BY-SA 3.0 / GFDL',licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/'},
{label:'히노미사키 등대',source:photos['2106'].source,author:'663highland',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/'},
{label:'유노쓰 온천',source:photos['2110'].source,author:'663highland',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/'},
{label:'다이코다니 이나리 신사',source:photos['2112'].source,author:'そらみみ',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/'},
{label:'쓰와노성터',source:photos['2113'].source,author:'Reggaeman',license:'Public domain',licenseUrl:photos['2113'].source},
{label:'시마네 해양관 AQUAS',source:photos['2114'].source,author:'Totti',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/'},
{label:'구니가 해안',source:photos['2115'].source,author:'Yuvalr',license:'CC BY-SA 4.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/'},
{label:'촛불섬',source:photos['2116'].source,author:'Navian',license:'Public domain',licenseUrl:photos['2116'].source}
];

regionalCatalog.push({pref:'시마네',places,events,foods,photos,guides,intros,heroes,facts,foodDetails,foodPhotos,routePlanning,routes,credits,hero:photos['2104']});
})();