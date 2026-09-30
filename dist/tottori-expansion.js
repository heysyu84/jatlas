(()=>{const cf=f=>'https://commons.wikimedia.org/wiki/Special:FilePath/'+encodeURIComponent(f)+'?width=960';const cp=f=>'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(f).replace(/%20/g,'_');const map=q=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q);const note='공식 관광 안내의 명칭과 위치를 기준으로 등록했습니다. 방문 전 운영·교통 안내를 확인하세요.';
if(regionalCatalog.some(x=>x.pref==='돗토리'))return;

const places=[
{id:2000,pref:'돗토리',area:'돗토리 사구·이나바',town:'돗토리시',name:'돗토리 사구',tag:'사구·자연·전망',description:'산인해안 지오파크 안에 펼쳐진 일본을 대표하는 해안 사구로, 바람이 만든 모래결과 우마노세 언덕에서 바라보는 일본해 풍경이 인상적입니다.',activity:'우마노세까지 걸어 사구와 바다를 함께 바라보세요. 한여름에는 모래가 매우 뜨거울 수 있어 신발과 수분을 준비하세요.',checked:'2026.09.30',lat:35.541061,lon:134.228275,source:'https://www.tottori-tour.jp/en/sightseeing/456/',note,mapQuery:'鳥取砂丘'},
{id:2001,pref:'돗토리',area:'돗토리 사구·이나바',town:'돗토리시',name:'모래 미술관',tag:'미술관·모래조각·전시',description:'매년 새로운 주제로 세계 각국의 조각가들이 만든 대형 모래조각을 선보이는 돗토리 사구 인근의 실내 미술관입니다.',activity:'현재 전시 주제와 휴관 기간을 확인한 뒤 작품을 둘러보고 전망 공간에서 사구 방향도 바라보세요.',checked:'2026.09.30',lat:35.540144,lon:134.237021,source:'https://www.tottori-tour.jp/en/sightseeing/483/',note,mapQuery:'鳥取砂丘 砂の美術館'},
{id:2002,pref:'돗토리',area:'우라도메·이와미',town:'이와미초',name:'우라도메 해안',tag:'해안·지오파크·유람선',description:'일본해의 파도와 바람이 만든 동굴·기암·백사장이 이어지는 산인해안 지오파크의 대표 해안으로, 산책로와 유람선에서 서로 다른 풍경을 즐길 수 있습니다.',activity:'해안 산책로를 걷거나 운항 시기에 맞춰 유람선을 타보세요. 바다 상황에 따라 운항이 바뀔 수 있으므로 당일 확인이 필요합니다.',checked:'2026.09.30',lat:35.5904,lon:134.3260,source:'https://www.tottori-tour.jp/en/sightseeing/775/',note,mapQuery:'鳥取 浦富海岸'},
{id:2003,pref:'돗토리',area:'돗토리 사구·이나바',town:'돗토리시',name:'하쿠토 신사',tag:'신사·신화·해안',description:'고지기에 등장하는 이나바의 흰토끼 신화와 연결된 신사로, 토끼가 상처를 씻었다고 전해지는 미타라시이케와 인연 맺기 신앙으로 알려져 있습니다.',activity:'경내와 미타라시이케를 둘러보고 길 건너 하쿠토 해안까지 함께 산책해보세요.',checked:'2026.09.30',lat:35.5296,lon:134.1177,source:'https://www.tottori-tour.jp/en/sightseeing/768/',note,mapQuery:'鳥取 白兎神社'},
{id:2004,pref:'돗토리',area:'구라요시·미사사',town:'구라요시시',name:'구라요시 시라카베 도조군',tag:'옛 거리·창고·산책',description:'에도~메이지 시대 상업 도시의 분위기가 남아 있는 전통 거리로, 흰 회벽 창고와 붉은 기와·돌다리가 다마가와 강을 따라 이어집니다.',activity:'아카가와라와 옛 상가를 천천히 걸으며 공방·카페·기념품점을 함께 둘러보세요.',checked:'2026.09.30',lat:35.4304,lon:133.8248,source:'https://www.tottori-tour.jp/en/sightseeing/792/',note,mapQuery:'鳥取 倉吉 白壁土蔵群'},
{id:2005,pref:'돗토리',area:'구라요시·미사사',town:'미사사초',name:'미사사 온천',tag:'온천·료칸·산책',description:'미사사강을 따라 료칸과 다리가 이어지는 산인 대표 온천지로, 라돈 함유 온천과 강변 산책 풍경으로 알려져 있습니다.',activity:'료칸의 당일치기 입욕 가능 여부를 확인하고 강변과 온천가를 산책해보세요. 숙박한다면 저녁과 아침의 분위기도 비교해보세요.',checked:'2026.09.30',lat:35.4099,lon:133.8947,source:'https://www.tottori-tour.jp/en/accommodation/819/',note,mapQuery:'鳥取 三朝温泉'},
{id:2006,pref:'돗토리',area:'구라요시·미사사',town:'미사사초',name:'미토쿠산 산부쓰지·나게이레도',tag:'국보·사찰·산악수행',description:'미토쿠산 절벽에 매달린 듯 세워진 국보 나게이레도로 유명한 산악 사찰입니다. 참배 등산로에는 급경사와 사슬 구간이 있어 일반 사찰 관람과 성격이 다릅니다.',activity:'등산 입산 규정과 날씨를 반드시 확인하세요. 장비나 동행 조건이 맞지 않으면 안전한 요하이쇼에서 나게이레도를 바라보는 방법도 있습니다.',checked:'2026.09.30',lat:35.3965,lon:133.9594,source:'https://www.tottori-tour.jp/en/sightseeing/806/',note,mapQuery:'鳥取 三徳山 三佛寺 投入堂'},
{id:2007,pref:'돗토리',area:'호쿠에이·코난',town:'호쿠에이초',name:'아오야마 고쇼 후루사토관',tag:'만화·전시·체험',description:'명탐정 코난의 작가 아오야마 고쇼의 고향에 조성된 기념관으로, 작품 세계와 작가의 작업 공간·원화 관련 전시를 즐길 수 있습니다.',activity:'기념관을 관람한 뒤 코난역과 베이카 상점가로 이어지는 캐릭터 조형물 산책도 함께 즐겨보세요.',checked:'2026.09.30',lat:35.4898,lon:133.7591,source:'https://www.tottori-tour.jp/en/sightseeing/826/',note,mapQuery:'鳥取 青山剛昌ふるさと館'},
{id:2008,pref:'돗토리',area:'구라요시·미사사',town:'구라요시시',name:'돗토리 이십세기배 기념관',tag:'박물관·과일·체험',description:'일본에서 유일한 배 전문 박물관으로, 돗토리의 이십세기배 재배 역사와 품종을 전시하고 계절에 따라 배 시식과 디저트를 즐길 수 있습니다.',activity:'대형 배나무 전시와 품종 소개를 보고 시식 코너 운영 여부를 확인해보세요.',checked:'2026.09.30',lat:35.431586,lon:133.835694,source:'https://www.tottori-tour.jp/en/sightseeing/1128/',note,mapQuery:'鳥取 二十世紀梨記念館 なしっこ館'},
{id:2009,pref:'돗토리',area:'다이센·요나고',town:'다이센초',name:'다이센',tag:'산·하이킹·단풍',description:'해발 1,709m로 주고쿠 지방 최고봉인 산으로, 봄 신록·여름 등산·가을 단풍·겨울 설경까지 계절마다 다른 풍경을 보여줍니다.',activity:'정상 등산을 하지 않더라도 다이센지 주변 숲길과 전망 지점을 걸어보세요. 등산 시에는 최신 등산로와 기상 정보를 확인하세요.',checked:'2026.09.30',lat:35.3710,lon:133.5460,source:'https://www.tottori-tour.jp/en/sightseeing/844/',note,mapQuery:'鳥取 大山'},
{id:2010,pref:'돗토리',area:'다이센·요나고',town:'다이센초',name:'다이센지',tag:'사찰·산악신앙·역사',description:'다이센 산악신앙의 중심이었던 오래된 사찰로, 한때 백여 개의 사원과 수천 명의 승려가 있었다고 전해지는 역사 깊은 지역에 남아 있습니다.',activity:'본당과 참배길을 둘러보고 오가미야마 신사 오쿠노미야까지 숲길을 이어 걸어보세요.',checked:'2026.09.30',lat:35.3904,lon:133.5399,source:'https://www.tottori-tour.jp/en/sightseeing/855/',note,mapQuery:'鳥取 大山寺'},
{id:2011,pref:'돗토리',area:'다이센·요나고',town:'다이센초',name:'오가미야마 신사 오쿠노미야',tag:'신사·삼나무길·산악신앙',description:'다이센 신앙의 중심 신사로, 약 700m의 자연석 참배길 끝에 큰 곤겐즈쿠리 신전이 자리합니다.',activity:'다이센지에서 자연석 참배길을 걸어 오쿠노미야를 참배해보세요. 비나 눈이 올 때는 돌길이 미끄러울 수 있습니다.',checked:'2026.09.30',lat:35.3888,lon:133.5355,source:'https://www.tottori-tour.jp/en/sightseeing/845/',note,mapQuery:'鳥取 大神山神社 奥宮'},
{id:2012,pref:'돗토리',area:'다이센·요나고',town:'난부초',name:'돗토리 하나카이로',tag:'꽃·정원·야간조명',description:'다이센을 배경으로 계절 꽃을 즐길 수 있는 대형 플라워 파크로, 지붕이 있는 약 1km 회랑과 겨울철 일루미네이션도 특징입니다.',activity:'계절별 주요 꽃과 야간 개장 여부를 확인하고 전망 회랑과 정원을 천천히 둘러보세요.',checked:'2026.09.30',lat:35.3481,lon:133.4235,source:'https://www.tottori-tour.jp/en/sightseeing/860/',note,mapQuery:'鳥取 とっとり花回廊'},
{id:2013,pref:'돗토리',area:'다이센·요나고',town:'요나고시',name:'가이케 온천',tag:'온천·해변·료칸',description:'일본해 해변을 따라 료칸이 이어지는 산인 최대급 온천지로, 바다와 다이센을 함께 바라볼 수 있는 입지가 특징입니다.',activity:'해변을 산책하고 숙소나 당일치기 온천에서 바다 전망 입욕을 즐겨보세요. 숙소별 이용 조건은 미리 확인하세요.',checked:'2026.09.30',lat:35.4575,lon:133.3586,source:'https://www.tottori-tour.jp/en/accommodation/1074/',note,mapQuery:'鳥取 皆生温泉'},
{id:2014,pref:'돗토리',area:'사카이미나토',town:'사카이미나토시',name:'미즈키 시게루 로드',tag:'만화·거리·산책',description:'사카이미나토역에서 이어지는 약 800m 거리 곳곳에 게게게의 기타로 등 요괴 캐릭터 동상이 놓인 만화 테마 거리입니다.',activity:'청동 요괴상을 찾아 걸으며 상점과 요괴 신사, 스탬프 코스를 즐겨보세요. 밤에는 조명된 거리 분위기도 달라집니다.',checked:'2026.09.30',lat:35.5453,lon:133.2247,source:'https://www.tottori-tour.jp/en/sightseeing/835/',note,mapQuery:'鳥取 水木しげるロード'}
];
for(const p of places)p.mapUrl=map(p.mapQuery);

const guides={
'2000':{access:'JR 돗토리역에서 사구행 버스로 이동하세요.',duration:'1시간 30분~3시간'},
'2001':{access:'JR 돗토리역에서 사구행 버스를 타고 모래 미술관 앞에서 하차하세요.',duration:'1~2시간'},
'2002':{access:'JR 이와미역에서 지역버스 또는 택시를 이용하세요. 사구에서 차로 약 15분 거리입니다.',duration:'2~4시간'},
'2003':{access:'JR 돗토리역에서 시카노 방면 버스로 하쿠토진자마에까지 이동하세요.',duration:'45~90분'},
'2004':{access:'JR 구라요시역에서 시라카베 도조군 방면 버스로 이동하세요.',duration:'1시간 30분~3시간'},
'2005':{access:'JR 구라요시역에서 미사사 온천행 버스로 약 20분입니다.',duration:'2시간~1박'},
'2006':{access:'JR 구라요시역에서 미토쿠산 방면 버스를 이용하세요. 등산 참배는 입산 시간과 규정을 확인하세요.',duration:'3~5시간'},
'2007':{access:'JR 유라역(코난역)에서 도보 약 20분 또는 택시를 이용하세요.',duration:'1시간 30분~3시간'},
'2008':{access:'JR 구라요시역에서 버스로 약 10분입니다.',duration:'1~2시간'},
'2009':{access:'JR 요나고역에서 다이센지 방면 버스로 약 50분입니다.',duration:'반나절~1일'},
'2010':{access:'JR 요나고역에서 다이센지 방면 버스로 이동한 뒤 참배길을 걸으세요.',duration:'1~2시간'},
'2011':{access:'다이센지에서 자연석 참배길을 따라 도보 약 20분입니다.',duration:'1~1시간 30분'},
'2012':{access:'JR 요나고역에서 무료 셔틀버스 운행 여부와 시간표를 확인하세요.',duration:'2~4시간'},
'2013':{access:'JR 요나고역에서 가이케 온천행 버스를 이용하세요.',duration:'2시간~1박'},
'2014':{access:'JR 사카이미나토역에서 바로 이어집니다.',duration:'2~4시간'}
};
const facts=Object.fromEntries(places.map(p=>[String(p.id),[guides[String(p.id)].duration]]));

const photos={
'2000':{src:cf('Tottori-Sakyu Tottori Japan.JPG'),alt:'돗토리 사구',source:cp('Tottori-Sakyu Tottori Japan.JPG')},
'2001':{src:cf('Tottori Sand Museum.jpg'),alt:'모래 미술관',source:cp('Tottori Sand Museum.jpg')},
'2002':{src:cf('Uradome Coast Sengan-Matsushima.JPG'),alt:'우라도메 해안',source:cp('Uradome Coast Sengan-Matsushima.JPG')},
'2003':{src:cf('Hakutojinja -01.jpg'),alt:'하쿠토 신사',source:cp('Hakutojinja -01.jpg')},
'2004':{src:cf('Kurayoshi Utsubuki-Tamagawa27n4592.jpg'),alt:'구라요시 시라카베 도조군',source:cp('Kurayoshi Utsubuki-Tamagawa27n4592.jpg')},
'2005':{src:cf('Misasa onsen01bs3200.jpg'),alt:'미사사 온천',source:cp('Misasa onsen01bs3200.jpg')},
'2006':{src:cf('Japan Tottori MitokuSan Nageiredo DSC01248.jpg'),alt:'미토쿠산 산부쓰지 나게이레도',source:cp('Japan Tottori MitokuSan Nageiredo DSC01248.jpg')},
'2007':{src:cf('Gosho Aoyama Manga Factory.jpg'),alt:'아오야마 고쇼 후루사토관',source:cp('Gosho Aoyama Manga Factory.jpg')},
'2008':{src:cf('Tottori Nijisseiki Pear Museum01n4592.jpg'),alt:'돗토리 이십세기배 기념관',source:cp('Tottori Nijisseiki Pear Museum01n4592.jpg')},
'2009':{src:cf('Daisen in Autumn.jpg'),alt:'다이센',source:cp('Daisen in Autumn.jpg')},
'2010':{src:cf('Daisen in Autumn.jpg'),alt:'다이센지',source:cp('Daisen in Autumn.jpg')},
'2011':{src:cf('Daisen in Autumn.jpg'),alt:'오가미야마 신사 오쿠노미야',source:cp('Daisen in Autumn.jpg')},
'2012':{src:cf('Tottori Hanakairo-Flower Park.JPG'),alt:'돗토리 하나카이로',source:cp('Tottori Hanakairo-Flower Park.JPG')},
'2013':{src:cf('Kaike onsen05s3648.jpg'),alt:'가이케 온천',source:cp('Kaike onsen05s3648.jpg')},
'2014':{src:cf('Mizuki Shigeru Road -03.jpg'),alt:'미즈키 시게루 로드',source:cp('Mizuki Shigeru Road -03.jpg')}
};

const foods=[
{name:'마쓰바 대게',area:'돗토리 전역',kind:'해산물·겨울 특산',where:'돗토리·사카이미나토 등',description:'성장한 수컷 대게를 부르는 이름으로, 11월 초부터 3월 무렵까지 일본해에서 잡히는 돗토리의 대표 겨울 먹거리입니다.',source:'https://www.tottori-tour.jp/en/food/1077/'},
{name:'돗토리 와규',area:'돗토리 전역',kind:'지역 특산·와규',where:'돗토리 전역',description:'오랜 소 사육 역사를 가진 돗토리의 브랜드 와규로, 부드러운 육질과 지방의 풍미를 살린 스테이크·야키니쿠·샤부샤부로 즐깁니다.',source:'https://www.tottori-tour.jp/en/food/'},
{name:'규코쓰 라멘',area:'구라요시·미사사',kind:'향토·라멘',where:'구라요시·고토우라 등 중부',description:'소뼈로 우린 맑고 향긋한 육수가 특징인 돗토리 중부의 지역 라멘입니다.',source:'https://www.tottori-tour.jp/en/food/1115/'},
{name:'이십세기배',area:'돗토리 전역',kind:'지역 특산·과일',where:'돗토리 전역',description:'아삭한 식감과 산뜻한 단맛·산미가 특징인 돗토리의 대표 배 품종으로, 늦여름부터 가을에 수확 체험도 즐길 수 있습니다.',source:'https://www.tottori-tour.jp/en/sightseeing/1190/'},
{name:'두부 치쿠와',area:'돗토리 사구·이나바',kind:'향토·가공식품',where:'돗토리 동부',description:'생선살 대신 두부 비중을 높여 만든 돗토리의 전통 치쿠와로, 부드럽고 담백한 맛이 특징입니다.',source:'https://www.tottori-tour.jp/en/food/'}
];
const foodDetails={
'마쓰바 대게':{kind:'한 끼·해산물',taste:'단맛이 있는 게살과 진한 게 내장 풍미',how:'제철인 겨울에 삶은 대게·구이·전골·회 등으로 맛보세요.'},
'돗토리 와규':{kind:'한 끼',taste:'부드러운 육질과 풍부한 지방의 감칠맛',how:'스테이크·야키니쿠·샤부샤부 등 예산과 취향에 맞는 조리법을 골라보세요.'},
'규코쓰 라멘':{kind:'한 끼',taste:'소뼈의 고소한 향과 비교적 깔끔한 뒷맛',how:'구라요시와 고토우라 등 중부 지역 전문점에서 가게별 육수를 비교해보세요.'},
'이십세기배':{kind:'과일·기념품',taste:'아삭한 식감과 시원한 단맛·산미',how:'제철에는 생과와 배 따기 체험을, 그 외에는 주스·젤리 등 가공품을 살펴보세요.'},
'두부 치쿠와':{kind:'간식·반찬',taste:'부드럽고 담백한 두부 풍미',how:'그대로 먹거나 살짝 구워 반찬·간식으로 즐겨보세요.'}
};
const foodPhotos={
'마쓰바 대게':{src:cf('Matsuba Crab (51242431199).jpg'),source:cp('Matsuba Crab (51242431199).jpg')},
'돗토리 와규':{src:cf('Wagyu beef.jpeg'),source:cp('Wagyu beef.jpeg')},
'규코쓰 라멘':{src:cf('Gyukotsu miso ramen 01.jpg'),source:cp('Gyukotsu miso ramen 01.jpg')},
'이십세기배':{src:cf('Tottori Nijisseiki Pear Museum03s4592.jpg'),source:cp('Tottori Nijisseiki Pear Museum03s4592.jpg')},
'두부 치쿠와':{src:cf('Chimura Tofu Chikuwa no Sato.jpg'),source:cp('Chimura Tofu Chikuwa no Sato.jpg')}
};

const events=[
{id:'t-shanshan',pref:'돗토리',name:'돗토리 샨샨 마쓰리',area:'돗토리 사구·이나바',months:[8],timing:'예년 8월 중순',scheduleType:'매년 일정 발표',type:'마쓰리·우산춤',description:'수천 명이 화려한 우산을 들고 춤추는 돗토리시의 대표 여름 축제로, 방울 소리가 이어지는 대규모 우산춤 행렬이 중심입니다.',source:'https://www.tottori-tour.jp/en/sightseeing/772/'},
{id:'t-kurayoshi-utsubuki',pref:'돗토리',name:'구라요시 우쓰부키 마쓰리',area:'구라요시·미사사',months:[8],timing:'예년 8월 첫 주말',scheduleType:'매년 일정 발표',type:'마쓰리·불꽃놀이',description:'구라요시 시내의 퍼레이드와 전통 춤, 강변 공연과 불꽃놀이가 이어지는 중부 지역의 대표 여름 축제입니다.',source:'https://www.tottori-tour.jp/en/sightseeing/1124/'},
{id:'t-daisen-opening',pref:'돗토리',name:'다이센 여름 산 개장제·횃불행렬',area:'다이센·요나고',months:[6],timing:'예년 6월 첫 주말',scheduleType:'매년 일정 발표',type:'산축제·횃불행렬',description:'다이센 등산 시즌의 시작을 알리는 행사로, 오가미야마 신사에서 수많은 참가자가 횃불을 들고 내려오는 장면이 하이라이트입니다.',source:'https://www.tottori-tour.jp/en/sightseeing/1696/'},
{id:'t-sakyu-illusion',pref:'돗토리',name:'돗토리 사구 일루전',area:'돗토리 사구·이나바',months:[12],timing:'예년 12월 초~크리스마스 무렵',scheduleType:'매년 일정 발표',type:'일루미네이션·겨울',description:'돗토리 사구 주차장 주변을 대형 조명 장식으로 꾸미는 산인 지역의 대표 겨울 일루미네이션 행사입니다.',source:'https://www.tottori-tour.jp/en/seasonalevents/'},
{id:'t-hanakairo-light',pref:'돗토리',name:'돗토리 하나카이로 플라워 일루미네이션',area:'다이센·요나고',months:[11,12,1],timing:'예년 11월~1월',scheduleType:'매년 일정 발표',type:'꽃·일루미네이션',description:'하나카이로 정원과 회랑을 겨울 야간 조명으로 꾸미는 행사로, 꽃 정원과 다이센을 낮과 다른 분위기로 즐길 수 있습니다.',source:'https://www.tottori-tour.jp/en/seasonalevents/'}
];

const intros={
'돗토리':['','일본해의 사구와 리아스식 해안, 구라요시의 옛 거리와 온천, 다이센의 산악 풍경, 만화 테마 거리까지 동서로 서로 다른 여행 테마가 이어지는 현입니다.'],
'돗토리 사구·이나바':['','돗토리 사구와 모래 예술, 이나바의 흰토끼 신화까지 자연과 문화 이야기를 함께 즐길 수 있는 동부 중심 지역입니다.'],
'우라도메·이와미':['','기암과 동굴, 투명한 바다가 이어지는 산인해안 지오파크의 해안 절경을 산책과 유람선으로 즐길 수 있는 지역입니다.'],
'구라요시·미사사':['','전통 상가와 흰 벽 창고, 배 문화와 온천, 산악 사찰이 가까운 범위에 모인 돗토리 중부의 역사·휴양 지역입니다.'],
'호쿠에이·코난':['','명탐정 코난 작가의 고향을 따라 캐릭터 조형물과 기념관을 걸어서 즐길 수 있는 만화 테마 지역입니다.'],
'다이센·요나고':['','주고쿠 최고봉 다이센의 산악신앙과 숲길, 대형 꽃정원과 해변 온천을 함께 즐길 수 있는 서부 지역입니다.'],
'사카이미나토':['','미즈키 시게루의 요괴 캐릭터 거리와 일본해 수산물 문화를 함께 즐길 수 있는 항구 도시 지역입니다.']
};
const heroes={'돗토리 사구·이나바':2000,'우라도메·이와미':2002,'구라요시·미사사':2004,'호쿠에이·코난':2007,'다이센·요나고':2009,'사카이미나토':2014};

const routes=[
{id:'r-2000-0',pref:'돗토리',areas:['돗토리 사구·이나바'],title:'돗토리 사구와 모래 미술관 반나절',duration:'반나절',intro:'사구의 자연 풍경과 대형 모래조각 전시를 한 권역에서 이어보는 돗토리 대표 일정입니다.',note:'한여름에는 사구를 먼저 방문하고 더운 시간에는 실내 미술관을 배치하면 좋습니다.',days:[{label:'돗토리 사구·이나바',places:[2000,2001],schedule:[[2000,'09:00',places.find(p=>p.id===2000).activity],[null,'11:30','사구 주변에서 휴식·점심'],[2001,'12:30',places.find(p=>p.id===2001).activity]]}],image:''},
{id:'r-2000-1',pref:'돗토리',areas:['돗토리 사구·이나바','우라도메·이와미'],title:'돗토리 사구와 우라도메 해안 하루',duration:'1일',intro:'돗토리 동부의 대표 사구와 리아스식 해안을 하루에 나누어 즐기는 자연 풍경 일정입니다.',note:'대중교통 연결은 시간이 걸릴 수 있으므로 버스 시각이나 렌터카 이용을 미리 확인하세요.',days:[{label:'동부 해안',places:[2000,2002],schedule:[[2000,'09:00',places.find(p=>p.id===2000).activity],[null,'11:30','이와미 방면 이동·점심'],[2002,'13:00',places.find(p=>p.id===2002).activity]]}],image:''},
{id:'r-2000-2',pref:'돗토리',areas:['돗토리 사구·이나바'],title:'하쿠토 신사와 돗토리 사구 하루',duration:'1일',intro:'이나바의 흰토끼 신화와 돗토리의 대표 자연 풍경을 함께 즐기는 동부 일정입니다.',note:'하쿠토 신사와 사구 사이 버스 편을 확인하고 해안 산책은 날씨에 맞춰 조정하세요.',days:[{label:'이나바',places:[2003,2000],schedule:[[2003,'09:30',places.find(p=>p.id===2003).activity],[null,'11:30','돗토리 시내·사구 방면 이동 및 점심'],[2000,'13:30',places.find(p=>p.id===2000).activity]]}],image:''},
{id:'r-2000-3',pref:'돗토리',areas:['구라요시·미사사'],title:'구라요시 옛 거리와 배 박물관 하루',duration:'1일',intro:'구라요시의 전통 거리와 돗토리 대표 과일 문화를 실내외로 나누어 즐기는 일정입니다.',note:'시라카베 도조군은 상점 영업시간을, 배 기념관은 휴관일을 각각 확인하세요.',days:[{label:'구라요시',places:[2004,2008],schedule:[[2004,'10:00',places.find(p=>p.id===2004).activity],[null,'12:30','구라요시에서 점심·이동'],[2008,'14:00',places.find(p=>p.id===2008).activity]]}],image:''},
{id:'r-2000-4',pref:'돗토리',areas:['구라요시·미사사'],title:'미사사 온천과 구라요시 하루',duration:'1일',intro:'전통 거리 산책 뒤 산속 온천마을에서 쉬어가는 돗토리 중부의 대표 휴양 일정입니다.',note:'미사사에서 숙박할 경우 오후 이동 뒤 온천가를 천천히 즐기는 구성이 좋습니다.',days:[{label:'구라요시·미사사',places:[2004,2005],schedule:[[2004,'10:00',places.find(p=>p.id===2004).activity],[null,'12:30','구라요시에서 점심·미사사 이동'],[2005,'14:30',places.find(p=>p.id===2005).activity]]}],image:''},
{id:'r-2000-5',pref:'돗토리',areas:['구라요시·미사사'],title:'미토쿠산 산부쓰지 산악참배 하루',duration:'1일',intro:'국보 나게이레도를 목표로 미토쿠산의 산악신앙을 체험하는 일정입니다.',note:'일반 관광 산책이 아니라 안전 규정이 있는 산악 코스입니다. 기상·복장·동행 조건을 충족하지 못하면 입산하지 마세요.',days:[{label:'미토쿠산',places:[2006],schedule:[[2006,'09:30',places.find(p=>p.id===2006).activity],[null,'13:30','하산 후 미사사·구라요시 방면 이동 및 휴식']]}],image:''},
{id:'r-2000-6',pref:'돗토리',areas:['호쿠에이·코난','구라요시·미사사'],title:'코난 테마와 구라요시 하루',duration:'1일',intro:'아오야마 고쇼의 고향과 구라요시의 역사 거리를 함께 즐기는 중부 문화 일정입니다.',note:'기념관 운영시간을 먼저 확인하고 유라역~기념관 사이 캐릭터 산책 시간을 따로 잡으세요.',days:[{label:'호쿠에이·구라요시',places:[2007,2004],schedule:[[2007,'09:30',places.find(p=>p.id===2007).activity],[null,'12:00','호쿠에이·구라요시 이동 및 점심'],[2004,'14:00',places.find(p=>p.id===2004).activity]]}],image:''},
{id:'r-2000-7',pref:'돗토리',areas:['다이센·요나고'],title:'다이센지와 오가미야마 신사 하루',duration:'1일',intro:'다이센 산악신앙의 불교 사찰과 신사를 숲길로 이어보는 서부 대표 일정입니다.',note:'돌길과 숲길이 이어지므로 비·눈이 올 때는 미끄럼에 주의하고 겨울 접근 정보를 확인하세요.',days:[{label:'다이센',places:[2010,2011,2009],schedule:[[2010,'09:30',places.find(p=>p.id===2010).activity],[2011,'11:00',places.find(p=>p.id===2011).activity],[null,'12:30','다이센지 주변에서 점심·휴식'],[2009,'14:00',places.find(p=>p.id===2009).activity]]}],image:''},
{id:'r-2000-8',pref:'돗토리',areas:['다이센·요나고'],title:'하나카이로와 가이케 온천 하루',duration:'1일',intro:'다이센을 배경으로 한 꽃정원과 일본해 해변 온천을 하루에 이어보는 자연·휴양 일정입니다.',note:'하나카이로 셔틀과 가이케행 버스 시간을 확인하면 대중교통으로도 구성하기 쉽습니다.',days:[{label:'요나고 주변',places:[2012,2013],schedule:[[2012,'10:00',places.find(p=>p.id===2012).activity],[null,'13:00','요나고·가이케 방면 이동 및 점심'],[2013,'15:00',places.find(p=>p.id===2013).activity]]}],image:''},
{id:'r-2000-9',pref:'돗토리',areas:['사카이미나토'],title:'미즈키 시게루 로드 반나절',duration:'반나절',intro:'사카이미나토역부터 이어지는 요괴 캐릭터 거리를 천천히 걷고 상점과 먹거리를 즐기는 일정입니다.',note:'주말에는 인기 상점과 전시시설이 붐빌 수 있으므로 오전 방문이 편합니다.',days:[{label:'사카이미나토',places:[2014],schedule:[[2014,'10:00',places.find(p=>p.id===2014).activity],[null,'12:30','사카이미나토에서 해산물 점심·휴식']]}],image:''}
];
const routePlanning={};
for(const r of routes){const d=r.days[0];routePlanning[r.id]={start:places.find(p=>p.id===d.places[0])?.name||'',end:places.find(p=>p.id===d.places.at(-1))?.name||'',move:'구간별 길찾기로 도보·대중교통을 선택하세요.',meal:d.schedule.find(x=>x[0]===null)?.[2]||'일정 중간에 식사·휴식',rain:'야외 일정은 날씨에 맞춰 줄이고 실내 시설 관람을 늘리세요.',skip:'시간이 부족하면 마지막 장소를 다음 일정으로 미루세요.',warning:r.note,schedule:d.schedule}}

const credits=[
{label:'돗토리 사구',source:photos['2000'].source,author:'Hashi photo',license:'CC BY-SA 3.0 / GFDL',licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/'},
{label:'모래 미술관',source:photos['2001'].source,author:'Drivephotographer',license:'CC0',licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/'},
{label:'우라도메 해안',source:photos['2002'].source,author:'663highland',license:'CC BY-SA',licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/'},
{label:'하쿠토 신사',source:photos['2003'].source,author:'Wikimedia Commons contributor',license:'Commons license',licenseUrl:photos['2003'].source},
{label:'구라요시 시라카베 도조군',source:photos['2004'].source,author:'663highland',license:'CC BY-SA',licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/'},
{label:'미사사 온천',source:photos['2005'].source,author:'663highland',license:'CC BY-SA 3.0',licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/'},
{label:'미토쿠산 산부쓰지',source:photos['2006'].source,author:'Wikimedia Commons contributor',license:'Commons license',licenseUrl:photos['2006'].source},
{label:'아오야마 고쇼 후루사토관',source:photos['2007'].source,author:'Flow in edgewise',license:'CC / GFDL',licenseUrl:photos['2007'].source},
{label:'돗토리 이십세기배 기념관',source:photos['2008'].source,author:'663highland',license:'CC BY-SA / GFDL',licenseUrl:photos['2008'].source},
{label:'다이센',source:photos['2009'].source,author:'Reggaeman',license:'CC BY-SA 3.0 / GFDL',licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/'},
{label:'돗토리 하나카이로',source:photos['2012'].source,author:'Flow in edgewise',license:'CC BY-SA 3.0 / GFDL',licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/'},
{label:'가이케 온천',source:photos['2013'].source,author:'663highland',license:'CC BY-SA 3.0 / GFDL',licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/'},
{label:'미즈키 시게루 로드',source:photos['2014'].source,author:'Wikimedia Commons contributor',license:'Commons license',licenseUrl:photos['2014'].source}
];

regionalCatalog.push({pref:'돗토리',places,events,foods,photos,guides,intros,heroes,facts,foodDetails,foodPhotos,routePlanning,routes,credits,hero:photos['2000']});
})();