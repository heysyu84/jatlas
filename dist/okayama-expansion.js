(()=>{const cf=f=>'https://commons.wikimedia.org/wiki/Special:FilePath/'+encodeURIComponent(f)+'?width=960';const cp=f=>'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(f).replace(/%20/g,'_');const map=q=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q);const note='오카야마현 공식 관광 안내의 명칭과 위치를 기준으로 등록했습니다. 방문 전 운영·교통 안내를 확인하세요.';
if(regionalCatalog.some(x=>x.pref==='오카야마'))return;

const places=[
{id:2200,pref:'오카야마',area:'오카야마성·고라쿠엔',town:'오카야마시 기타구',name:'오카야마 고라쿠엔',tag:'일본정원·명승·계절',description:'오카야마번주 이케다 쓰나마사가 휴식 공간으로 조성한 대명정원으로, 넓은 잔디와 연못·차밭·계절 꽃 사이로 오카야마성을 함께 바라볼 수 있습니다.',activity:'정원 산책로를 천천히 돌며 유이신잔과 연못, 차밭을 둘러보고 아사히강 너머 오카야마성 풍경도 함께 감상해보세요.',checked:'2026.09.30',lat:34.6678,lon:133.9350,source:'https://www.okayama-japan.jp/en/spot/10672',note,mapQuery:'岡山後楽園'},
{id:2201,pref:'오카야마',area:'오카야마성·고라쿠엔',town:'오카야마시 기타구',name:'오카야마성',tag:'성·역사·전망',description:'검은 판벽 때문에 우조라 불리는 오카야마의 대표 성곽으로, 재건 천수 내부 전시와 최상층 전망에서 아사히강·고라쿠엔·시내를 조망할 수 있습니다.',activity:'천수 전시를 둘러본 뒤 최상층에서 고라쿠엔 방향을 바라보고 아사히강을 건너 정원과 이어보세요.',checked:'2026.09.30',lat:34.6650,lon:133.9361,source:'https://www.okayama-japan.jp/en/bizen-area',note,mapQuery:'岡山城'},
{id:2202,pref:'오카야마',area:'기비지',town:'오카야마시 기타구',name:'기비쓰 신사',tag:'국보·신사·모모타로',description:'기비쓰히코노미코토와 우라의 전승이 남아 모모타로 이야기의 뿌리와 연결되는 신사로, 국보 본전·배전과 약 360m의 긴 회랑이 특징입니다.',activity:'국보 본전과 배전을 참배한 뒤 긴 회랑을 걸으며 나루카마 신사 의식과 모모타로 전승 관련 장소를 살펴보세요.',checked:'2026.09.30',lat:34.6693,lon:133.8503,source:'https://www.okayama-japan.jp/en/spot/10624',note,mapQuery:'岡山 吉備津神社'},
{id:2203,pref:'오카야마',area:'기비지',town:'소자시',name:'빗추 고쿠분지',tag:'오층탑·사찰·전원풍경',description:'나라 시대 국분사 전통을 잇는 사찰로, 약 34m 높이의 오층탑이 들판과 계절 꽃 사이에 서 있는 풍경이 기비지를 대표합니다.',activity:'오층탑과 사찰 경내를 둘러보고 자전거나 도보로 주변 전원과 고분·유적을 이어보세요.',checked:'2026.09.30',lat:34.6756,lon:133.7756,source:'https://www.okayama-japan.jp/en/spot/10611',note,mapQuery:'岡山 備中国分寺'},
{id:2204,pref:'오카야마',area:'구라시키',town:'구라시키시',name:'구라시키 미관지구',tag:'옛 거리·운하·산책',description:'흰 벽 창고와 나마코벽, 버드나무가 늘어선 운하가 이어지는 구라시키의 대표 역사 거리로, 전통 건축과 카페·공방·문화시설이 밀집해 있습니다.',activity:'구라시키강을 따라 골목과 옛 상가를 걸으며 카페와 공방을 둘러보고 저녁에는 야간 경관 조명도 확인해보세요.',checked:'2026.09.30',lat:34.5966,lon:133.7719,source:'https://www.okayama-japan.jp/en/spot/10736',note,mapQuery:'倉敷美観地区'},
{id:2205,pref:'오카야마',area:'구라시키',town:'구라시키시',name:'오하라 미술관',tag:'미술관·서양미술·근대건축',description:'1930년에 설립된 일본 최초의 사립 서양미술관으로, 엘 그레코·모네·르누아르 등 서양미술과 일본 근현대미술·고대미술 컬렉션을 소장합니다.',activity:'본관 중심으로 대표 작품을 감상하고 관람 가능 별관을 확인하세요. 내부 촬영 제한이 있으므로 현장 안내를 따르세요.',checked:'2026.09.30',lat:34.5960,lon:133.7712,source:'https://www.okayama-japan.jp/en/spot/10698',note,mapQuery:'倉敷 大原美術館'},
{id:2206,pref:'오카야마',area:'구라시키',town:'구라시키시',name:'구라시키 아이비 스퀘어',tag:'근대산업유산·건축·복합공간',description:'옛 구라시키 방적공장을 붉은 벽돌과 담쟁이 풍경을 살려 호텔·박물관·공방 등으로 재생한 근대산업유산 복합공간입니다.',activity:'담쟁이로 덮인 벽돌 건축을 둘러보고 구라보 기념관과 공방 운영 여부를 확인해 미관지구 산책과 함께 이어보세요.',checked:'2026.09.30',lat:34.5951,lon:133.7745,source:'https://www.okayama-japan.jp/en/spot/10808',note,mapQuery:'倉敷アイビースクエア'},
{id:2207,pref:'오카야마',area:'다카하시·후키야',town:'다카하시시',name:'빗추 마쓰야마성',tag:'현존천수·산성·운해',description:'일본에서 유일하게 현존 천수가 남은 산성으로, 거대한 암벽과 석벽 위에 작은 천수가 자리하며 가을~봄에는 운해에 떠 있는 듯한 풍경으로도 유명합니다.',activity:'후이고토게에서 산길을 걸어 천수와 석벽을 둘러보세요. 운해 전망대를 노린다면 새벽 기상·도로 상황을 별도로 확인하세요.',checked:'2026.09.30',lat:34.8092,lon:133.6221,source:'https://www.okayama-japan.jp/en/spot/10771',note,mapQuery:'備中松山城'},
{id:2208,pref:'오카야마',area:'다카하시·후키야',town:'다카하시시',name:'후키야 후루사토무라',tag:'전통마을·벤가라·산책',description:'벤가라 생산으로 번영한 산골 상업마을로, 붉은빛 세키슈 기와와 벤가라색 외벽이 통일된 독특한 거리 풍경을 이룹니다.',activity:'주요 전통가옥과 벤가라 관련 시설을 둘러보고 붉은 거리와 공방을 천천히 걸어보세요.',checked:'2026.09.30',lat:34.8626,lon:133.4683,source:'https://www.okayama-japan.jp/en/spot/10745',note,mapQuery:'岡山 吹屋ふるさと村'},
{id:2209,pref:'오카야마',area:'쓰야마',town:'쓰야마시',name:'쓰야마성(가쿠잔공원)',tag:'성터·석벽·벚꽃',description:'모리 다다마사가 1616년에 완성한 성의 거대한 석벽과 복원 빗추야구라가 남아 있으며, 약 1,000그루 벚꽃이 피는 서일본의 대표 봄 명소이기도 합니다.',activity:'높은 석벽을 따라 혼마루까지 올라 복원 망루와 시가지를 둘러보고 벚꽃철에는 개화·야간개장 정보를 확인하세요.',checked:'2026.09.30',lat:35.0632,lon:134.0046,source:'https://www.okayama-japan.jp/en/spot/10789',note,mapQuery:'岡山 津山城 鶴山公園'},
{id:2210,pref:'오카야마',area:'쓰야마',town:'쓰야마시',name:'쓰야마 조토 지구',tag:'전통거리·이즈모가도·산책',description:'옛 이즈모 가도를 따라 에도시대 상가와 전통가옥이 길게 이어지는 중요 전통적 건조물군 보존지구로, 쓰야마의 성하마을 생활상을 느낄 수 있습니다.',activity:'옛 상가와 골목을 걸으며 역사 건축과 카페·전시시설을 둘러보고 쓰야마성과 함께 하루에 묶어보세요.',checked:'2026.09.30',lat:35.0600,lon:134.0160,source:'https://www.okayama-japan.jp/en/spot/17598',note,mapQuery:'津山 城東地区'},
{id:2211,pref:'오카야마',area:'히루젠·유바라',town:'마니와시',name:'히루젠 고원',tag:'고원·자전거·목장',description:'주고쿠산지 북부의 넓은 고원 리조트로, 저지 소가 풀을 뜯는 목장과 자전거길·캠핑·허브정원 등 자연 체험이 풍부합니다.',activity:'히루젠 저지랜드와 목장 풍경을 즐기거나 자전거길을 골라 달려보세요. 계절별 운영시설과 날씨를 확인하세요.',checked:'2026.09.30',lat:35.2910,lon:133.6460,source:'https://www.okayama-japan.jp/en/spot/10766',note,mapQuery:'岡山 蒜山高原'},
{id:2212,pref:'오카야마',area:'히루젠·유바라',town:'마니와시',name:'유바라 온천',tag:'온천·노천탕·료칸',description:'아사히강과 유바라댐 아래에 료칸이 이어지는 미마사카 삼탕의 하나로, 강바닥에서 자연 용출하는 대형 노천탕 스나유가 상징입니다.',activity:'온천가를 산책하고 숙박 또는 당일입욕을 즐겨보세요. 스나유를 이용할 경우 현장 이용예절과 복장 안내를 확인하세요.',checked:'2026.09.30',lat:35.2024,lon:133.7337,source:'https://www.okayama-japan.jp/en/spot/11573',note,mapQuery:'岡山 湯原温泉'},
{id:2213,pref:'오카야마',area:'비젠·오사후네',town:'세토치시',name:'비젠 오사후네 도검박물관',tag:'일본도·박물관·장인',description:'가마쿠라 시대부터 일본도 산지로 번영한 오사후네에 자리한 도검 전문 박물관으로, 비젠도 전시와 단조·연마 등 제작 기술을 가까이에서 볼 수 있습니다.',activity:'도검 전시와 공방을 둘러보고 전통 단조 공개일이 맞는지 확인해 장인의 작업을 관람해보세요.',checked:'2026.09.30',lat:34.7004,lon:134.0998,source:'https://www.okayama-japan.jp/en/spot/10777',note,mapQuery:'岡山 備前長船刀剣博物館'},
{id:2214,pref:'오카야마',area:'비젠·오사후네',town:'비젠시',name:'구 시즈타니 학교',tag:'국보·교육유산·단풍',description:'1670년 오카야마번주 이케다 미쓰마사가 세운 서민을 위한 학교로, 국보 강당과 석담·중요문화재 건물이 남아 일본 근세 교육유산을 보여줍니다.',activity:'국보 강당과 공자 관련 건물을 둘러보고 가을에는 두 그루의 가이노키 단풍과 야간조명 일정을 확인해보세요.',checked:'2026.09.30',lat:34.7941,lon:134.2202,source:'https://www.okayama-japan.jp/en/spot/10849',note,mapQuery:'岡山 旧閑谷学校'},
{id:2215,pref:'오카야마',area:'우시마도·세토우치',town:'세토치시',name:'우시마도 올리브원',tag:'올리브·세토내해·전망',description:'약 2,000그루 올리브나무가 자라는 구릉에서 세토내해의 섬들을 내려다볼 수 있어 일본의 에게해라 불리는 우시마도의 대표 전망 명소입니다.',activity:'올리브밭과 전망대를 산책하며 세토내해를 바라보고 매장에서 올리브 제품과 지역 기념품도 살펴보세요.',checked:'2026.09.30',lat:34.6167,lon:134.1690,source:'https://www.okayama-japan.jp/en/spot/10845',note,mapQuery:'岡山 牛窓オリーブ園'},
{id:2216,pref:'오카야마',area:'이누지마',town:'오카야마시 히가시구',name:'이누지마 세이렌쇼 미술관',tag:'현대미술·산업유산·섬',description:'옛 구리 제련소 유구와 현대미술·건축을 결합해 산업유산을 재생한 이누지마의 대표 미술관으로, 자연에너지를 활용하는 건축도 특징입니다.',activity:'제련소 유구와 전시 공간을 둘러보고 아트하우스 프로젝트와 섬 마을 산책을 함께 계획하세요. 휴관일과 배 시간을 반드시 확인하세요.',checked:'2026.09.30',lat:34.5649,lon:134.1011,source:'https://www.okayama-japan.jp/en/spot/10705',note,mapQuery:'岡山 犬島精錬所美術館'},
{id:2217,pref:'오카야마',area:'기비지',town:'오카야마시 기타구',name:'빗추 다카마쓰성터',tag:'성터·전국시대·역사',description:'1582년 도요토미 히데요시가 제방을 쌓아 성을 물에 잠기게 한 다카마쓰성 수공으로 유명한 전쟁 유적으로, 현재는 공원과 자료관이 조성되어 있습니다.',activity:'성터 공원과 자료관을 둘러보고 인근 수공 제방 흔적까지 역사 산책으로 이어보세요.',checked:'2026.09.30',lat:34.6917,lon:133.8259,source:'https://www.okayama-japan.jp/en/spot/10772',note,mapQuery:'岡山 備中高松城跡'}
];
for(const p of places)p.mapUrl=map(p.mapQuery);

const guides={
'2200':{access:'JR 오카야마역에서 버스 약 15분 또는 노면전차 시로시타 정류장에서 도보 약 10분입니다.',duration:'1시간 30분~2시간'},
'2201':{access:'JR 오카야마역에서 노면전차 시로시타 정류장까지 이동한 뒤 도보 약 10분입니다.',duration:'1시간 30분~2시간'},
'2202':{access:'JR 기비쓰역에서 도보 약 10분입니다.',duration:'1시간 30분~2시간'},
'2203':{access:'JR 소자역에서 택시 약 15분 또는 렌터사이클로 약 20분입니다.',duration:'1~2시간'},
'2204':{access:'JR 구라시키역에서 도보 약 10~15분입니다.',duration:'2~5시간'},
'2205':{access:'JR 구라시키역에서 도보 약 15분, 미관지구 안에 있습니다.',duration:'1시간 30분~3시간'},
'2206':{access:'JR 구라시키역에서 도보 약 15분, 미관지구 동쪽에 있습니다.',duration:'45~90분'},
'2207':{access:'JR 빗추다카하시역에서 예약제 승합택시 또는 버스로 후이고토게까지 간 뒤 도보 약 20분입니다.',duration:'2~4시간'},
'2208':{access:'JR 빗추다카하시역에서 후키야행 버스로 약 55분입니다.',duration:'2~4시간'},
'2209':{access:'JR 쓰야마역에서 도보 약 10분입니다.',duration:'1시간 30분~2시간'},
'2210':{access:'JR 쓰야마역에서 도보 약 15분 또는 쓰야마성에서 동쪽으로 걸어 이동하세요.',duration:'1시간 30분~3시간'},
'2211':{access:'JR 주고쿠가쓰야마역에서 마니와시 커뮤니티버스로 약 80분입니다. 렌터카가 편리합니다.',duration:'반나절~1일'},
'2212':{access:'JR 주고쿠가쓰야마역에서 유바라온천·히루젠 방면 커뮤니티버스로 약 35분입니다.',duration:'2시간~1박'},
'2213':{access:'JR 오사후네역에서 택시 약 7분입니다.',duration:'1시간 30분~3시간'},
'2214':{access:'JR 요시나가역에서 택시 약 10분 또는 시내버스를 이용하세요.',duration:'1시간 30분~2시간'},
'2215':{access:'JR 오쿠역에서 우시마도 방면 버스와 택시를 조합하거나 렌터카를 이용하세요.',duration:'1~2시간'},
'2216':{access:'JR 사이이다이지역에서 호덴항으로 이동한 뒤 정기선으로 약 10분, 이누지마항에서 도보 약 5분입니다.',duration:'반나절~1일'},
'2217':{access:'JR 빗추다카마쓰역에서 도보 약 10분입니다.',duration:'1~2시간'}
};
const facts=Object.fromEntries(places.map(p=>[String(p.id),[guides[String(p.id)].duration]]));

const photos={
'2200':{src:cf('Okayama Korakuen Garden01.jpg'),alt:'오카야마 고라쿠엔',source:cp('Okayama Korakuen Garden01.jpg')},
'2201':{src:cf('Okayama Castle 01.jpg'),alt:'오카야마성',source:cp('Okayama Castle 01.jpg')},
'2202':{src:cf('Kibitsu-jinja Honden-Haiden 01.jpg'),alt:'기비쓰 신사',source:cp('Kibitsu-jinja Honden-Haiden 01.jpg')},
'2203':{src:cf('Bitchu Kokubunji in Soja Okayama pref Japan01s3.jpg'),alt:'빗추 고쿠분지',source:cp('Bitchu Kokubunji in Soja Okayama pref Japan01s3.jpg')},
'2204':{src:cf('Kurashiki Bikan Historical Quarter.jpg'),alt:'구라시키 미관지구',source:cp('Kurashiki Bikan Historical Quarter.jpg')},
'2205':{src:cf('Ohara Museum of Art01bs3200.jpg'),alt:'오하라 미술관',source:cp('Ohara Museum of Art01bs3200.jpg')},
'2206':{src:cf('Kurashiki Ivy Square01s3200.jpg'),alt:'구라시키 아이비 스퀘어',source:cp('Kurashiki Ivy Square01s3200.jpg')},
'2207':{src:cf('Bitchu Matsuyama Castle 02.jpg'),alt:'빗추 마쓰야마성',source:cp('Bitchu Matsuyama Castle 02.jpg')},
'2208':{src:cf('Fukiya Furusato Village.jpg'),alt:'후키야 후루사토무라',source:cp('Fukiya Furusato Village.jpg')},
'2209':{src:cf('Tsuyama Castle01s5s3200.jpg'),alt:'쓰야마성',source:cp('Tsuyama Castle01s5s3200.jpg')},
'2210':{src:cf('Joto district Tsuyama.jpg'),alt:'쓰야마 조토 지구',source:cp('Joto district Tsuyama.jpg')},
'2211':{src:cf('Hiruzen Plateau.jpg'),alt:'히루젠 고원',source:cp('Hiruzen Plateau.jpg')},
'2212':{src:cf('Yubara Onsen.jpg'),alt:'유바라 온천',source:cp('Yubara Onsen.jpg')},
'2213':{src:cf('Bizen Osafune Japanese Sword Museum.jpg'),alt:'비젠 오사후네 도검박물관',source:cp('Bizen Osafune Japanese Sword Museum.jpg')},
'2214':{src:cf('Shizutani School Lecture Hall.JPG'),alt:'구 시즈타니 학교',source:cp('Shizutani School Lecture Hall.JPG')},
'2215':{src:cf('Ushimado Olive Garden.jpg'),alt:'우시마도 올리브원',source:cp('Ushimado Olive Garden.jpg')},
'2216':{src:cf('Inujima Seirensho Art Museum.jpg'),alt:'이누지마 세이렌쇼 미술관',source:cp('Inujima Seirensho Art Museum.jpg')},
'2217':{src:cf('Bitchu-Takamatsu Castle ruins.JPG'),alt:'빗추 다카마쓰성터',source:cp('Bitchu-Takamatsu Castle ruins.JPG')}
};

const foods=[
{name:'오카야마 바라즈시',area:'오카야마 전역',kind:'향토·초밥',where:'오카야마시·현내',description:'식초밥 위에 사와라·새우·아나고·제철 채소 등 세토내해와 산의 재료를 화려하게 올리는 오카야마 대표 향토 초밥입니다.',source:'https://www.okayama-japan.jp/en/gourmet'},
{name:'오카야마 데미카쓰동',area:'오카야마성·고라쿠엔',kind:'향토·돈가스덮밥',where:'오카야마시',description:'밥 위에 돈가스를 올리고 진한 데미글라스 계열 소스를 끼얹는 오카야마시의 대표 지역 덮밥입니다.',source:'https://www.okayama-japan.jp/en/gourmet'},
{name:'히루젠 야키소바',area:'히루젠·유바라',kind:'향토·면요리',where:'히루젠',description:'된장을 바탕으로 마늘·양파·사과 등을 넣은 달콤짭짤한 소스에 닭고기와 양배추를 볶는 히루젠 대표 야키소바입니다.',source:'https://www.okayama-japan.jp/en/18994'},
{name:'쓰야마 호르몬 우동',area:'쓰야마',kind:'향토·면요리',where:'쓰야마시',description:'철판에서 소 내장과 우동을 진한 소스로 함께 볶는 쓰야마의 대표 지역 음식입니다.',source:'https://www.okayama-japan.jp/en/gourmet'},
{name:'히나세 가키오코',area:'비젠·오사후네',kind:'굴·오코노미야키',where:'비젠시 히나세',description:'겨울철 히나세산 굴을 듬뿍 넣어 철판에 구워내는 오코노미야키로, 굴 산지의 계절 별미입니다.',source:'https://www.okayama-japan.jp/en/gourmet'},
{name:'오카야마 백도·샤인머스캣',area:'오카야마 전역',kind:'과일·디저트',where:'오카야마 전역',description:'햇빛이 풍부한 기후에서 재배한 흰 복숭아와 포도가 오카야마의 대표 과일로, 제철 생과와 파르페·디저트로 즐깁니다.',source:'https://www.okayama-japan.jp/en/faq'}
];
const foodDetails={
'오카야마 바라즈시':{kind:'한 끼·향토식',taste:'식초밥과 해산물·채소가 어우러지는 산뜻하고 풍성한 맛',how:'향토요리점이나 역 주변 식당에서 계절 재료 구성을 비교해보세요.'},
'오카야마 데미카쓰동':{kind:'한 끼',taste:'바삭한 돈가스와 진하고 달큰한 데미글라스 소스',how:'오카야마시 중심가의 노포와 전문점에서 소스 농도와 곁들임 차이를 비교해보세요.'},
'히루젠 야키소바':{kind:'한 끼',taste:'된장 베이스의 달콤짭짤한 소스와 닭고기의 감칠맛',how:'히루젠 지역 인증점이나 식당에서 철판에 갓 볶은 메뉴로 즐겨보세요.'},
'쓰야마 호르몬 우동':{kind:'한 끼',taste:'고소한 내장과 진한 소스가 배인 쫄깃한 우동',how:'쓰야마 시내 철판요리점에서 갓 볶은 상태로 맛보세요.'},
'히나세 가키오코':{kind:'계절 한 끼',taste:'굴의 진한 바다향과 오코노미야키 소스의 감칠맛',how:'굴 제철인 겨울에 히나세 지역 전문점에서 굴 양과 굽기 스타일을 비교해보세요.'},
'오카야마 백도·샤인머스캣':{kind:'과일·디저트',taste:'백도의 부드러운 단맛과 머스캣의 향긋하고 아삭한 식감',how:'제철에는 생과로, 카페에서는 과일 파르페와 디저트로 즐겨보세요.'}
};
const foodPhotos={
'오카야마 바라즈시':{src:cf('Okayama barazushi.jpg'),source:cp('Okayama barazushi.jpg')},
'오카야마 데미카쓰동':{src:cf('Demi-katsudon in Okayama.jpg'),source:cp('Demi-katsudon in Okayama.jpg')},
'히루젠 야키소바':{src:cf('Hiruzen yakisoba.JPG'),source:cp('Hiruzen yakisoba.JPG')},
'쓰야마 호르몬 우동':{src:cf('Tsuyama hormone udon.jpg'),source:cp('Tsuyama hormone udon.jpg')},
'히나세 가키오코':{src:cf('Kakioko.jpg'),source:cp('Kakioko.jpg')},
'오카야마 백도·샤인머스캣':{src:cf('Shine Muscat grapes.jpg'),source:cp('Shine Muscat grapes.jpg')}
};

const events=[
{id:'ok-saidaiji-eyou',pref:'오카야마',name:'사이다이지 에요(알몸축제)',area:'오카야마시 동부',months:[2],timing:'매년 2월 셋째 토요일 밤',scheduleType:'고정 규칙',type:'전통축제·신사',description:'사이다이지 간논인에서 수천 명의 남성이 후도시 차림으로 두 개의 신목을 차지하기 위해 경쟁하는 중요무형민속문화재 전통행사입니다.',source:'https://www.okayama-japan.jp/en/spot/13458'},
{id:'ok-tsuyama-sakura',pref:'오카야마',name:'쓰야마 벚꽃 마쓰리',area:'쓰야마',months:[3,4],timing:'예년 3월 하순~4월 초',scheduleType:'매년 개화·행사 일정 확인',type:'벚꽃·계절행사',description:'쓰야마성의 높은 석벽 주변에 약 1,000그루 벚꽃이 피는 봄 축제로, 야간조명과 지역 먹거리·체험 행사가 함께 열립니다.',source:'https://www.okayama-japan.jp/en/spot/13497'},
{id:'ok-kurashiki-tenryo',pref:'오카야마',name:'구라시키 텐료 여름 마쓰리',area:'구라시키',months:[7],timing:'예년 7월 하순',scheduleType:'매년 일정 발표',type:'여름축제·춤',description:'구라시키 중심가에서 다이칸바야시 춤과 밴드 퍼레이드, 텐료 다이코 등 다양한 공연이 이어지는 대형 여름 축제입니다.',source:'https://www.okayama-japan.jp/en/spot/13484'},
{id:'ok-momotaro',pref:'오카야마',name:'오카야마 모모타로 마쓰리',area:'오카야마성·고라쿠엔',months:[8],timing:'예년 8월 중순',scheduleType:'매년 일정 발표',type:'도시축제·우라자춤',description:'도깨비 분장을 한 무용수들의 우라자 춤이 중심이 되는 오카야마시의 대표 여름 축제로, 마지막에는 참가자와 관람객이 함께 춤추는 장면이 하이라이트입니다.',source:'https://www.okayama-japan.jp/en/spot/13483'},
{id:'ok-genso-teien',pref:'오카야마',name:'고라쿠엔 환상정원',area:'오카야마성·고라쿠엔',months:[4,5,8,11],timing:'봄·여름·가을 기간 한정 · 해마다 일정 확인',scheduleType:'매년 일정 발표',type:'야간개장·일루미네이션',description:'고라쿠엔을 계절별 기간 한정으로 야간 개장하고 정원과 연못·건축을 은은한 조명으로 비추는 대표 야간 행사입니다.',source:'https://www.okayama-japan.jp/en/bizen-area'}
];

const intros={
'오카야마':['','일본 3대 정원 고라쿠엔과 구라시키의 전통 거리, 기비지의 모모타로 전승, 현존 천수 산성, 고원·온천과 세토내해의 섬 예술까지 남북으로 다양한 여행 테마가 이어지는 현입니다.'],
'오카야마성·고라쿠엔':['','오카야마성과 고라쿠엔을 아사히강을 사이에 두고 함께 둘러보며 성곽과 대명정원, 도심 문화를 편리하게 즐길 수 있는 중심 지역입니다.'],
'기비지':['','모모타로 전승이 남은 신사와 오층탑·고분·전원 풍경을 자전거와 로컬선으로 이어보기 좋은 역사 지역입니다.'],
'구라시키':['','흰 벽 창고와 운하의 전통 거리, 서양미술관과 근대산업유산이 밀집해 하루 종일 걸어서 즐기기 좋은 지역입니다.'],
'다카하시·후키야':['','현존 천수가 남은 산성과 붉은 벤가라 마을을 통해 산간 성곽·광산 문화의 깊은 역사를 만날 수 있는 지역입니다.'],
'쓰야마':['','거대한 성터 석벽과 전통 상가 거리가 남아 있고 봄 벚꽃과 지역 먹거리로도 유명한 북부 오카야마의 역사 도시입니다.'],
'히루젠·유바라':['','넓은 고원 목장과 자전거길, 강변 자연온천을 함께 즐길 수 있는 오카야마 북부의 자연·휴양 지역입니다.'],
'비젠·오사후네':['','비젠도의 일본도 제작 전통과 국보 교육유산, 세토내해 굴 음식까지 역사와 장인문화를 즐길 수 있는 동부 지역입니다.'],
'우시마도·세토우치':['','올리브 언덕에서 세토내해 섬 풍경을 내려다보고 온화한 해안 마을 분위기를 즐길 수 있는 지역입니다.'],
'이누지마':['','산업유산을 현대미술과 건축으로 재생한 미술관과 작은 섬 마을을 배를 타고 찾아가는 세토내해 예술 여행지입니다.'],
'오카야마시 동부':['','세토내해와 가까운 오카야마 동부에서 사이다이지의 전통행사와 이누지마 예술 여행을 이어볼 수 있는 지역입니다.']
};
const heroes={'오카야마성·고라쿠엔':2200,'기비지':2202,'구라시키':2204,'다카하시·후키야':2207,'쓰야마':2209,'히루젠·유바라':2211,'비젠·오사후네':2213,'우시마도·세토우치':2215,'이누지마':2216};

const routes=[
{id:'r-2200-0',pref:'오카야마',areas:['오카야마성·고라쿠엔'],title:'고라쿠엔과 오카야마성 반나절',duration:'반나절',intro:'일본 3대 정원과 검은 천수 성곽을 아사히강을 건너 한 번에 둘러보는 오카야마시 대표 일정입니다.',note:'두 장소가 매우 가까워 도보 연결이 쉽고 야간개장 시즌에는 오후부터 시작해도 좋습니다.',days:[{label:'오카야마성·고라쿠엔',places:[2200,2201],schedule:[[2200,'09:00',places.find(p=>p.id===2200).activity],[null,'11:00','아사히강 주변에서 점심·이동'],[2201,'12:30',places.find(p=>p.id===2201).activity]]}],image:''},
{id:'r-2200-1',pref:'오카야마',areas:['기비지'],title:'기비쓰 신사와 빗추 고쿠분지 하루',duration:'1일',intro:'모모타로 전승의 신사와 전원 속 오층탑을 로컬선·자전거로 이어보는 기비지 대표 역사 일정입니다.',note:'소자 주변에서 렌터사이클을 이용하면 고분과 전원 풍경까지 범위를 넓히기 좋습니다.',days:[{label:'기비지',places:[2202,2203],schedule:[[2202,'09:30',places.find(p=>p.id===2202).activity],[null,'12:00','기비지 이동·점심'],[2203,'13:30',places.find(p=>p.id===2203).activity]]}],image:''},
{id:'r-2200-2',pref:'오카야마',areas:['구라시키'],title:'구라시키 미관지구 예술 하루',duration:'1일',intro:'운하 옛 거리에서 서양미술과 붉은 벽돌 산업유산까지 모두 도보로 이어보는 구라시키 핵심 일정입니다.',note:'오하라 미술관 휴관일을 먼저 확인하고 저녁에는 미관지구 야간조명까지 남아보는 구성이 좋습니다.',days:[{label:'구라시키',places:[2204,2205,2206],schedule:[[2204,'09:30',places.find(p=>p.id===2204).activity],[2205,'11:00',places.find(p=>p.id===2205).activity],[null,'13:00','미관지구에서 점심·카페'],[2206,'14:30',places.find(p=>p.id===2206).activity]]}],image:''},
{id:'r-2200-3',pref:'오카야마',areas:['다카하시·후키야'],title:'빗추 마쓰야마성 반나절',duration:'반나절',intro:'일본 유일의 현존 천수 산성에 올라 암벽과 석벽, 작은 천수를 깊게 살펴보는 일정입니다.',note:'산길 도보가 필요하며 운해 전망대 촬영은 별도 새벽 일정으로 분리하는 편이 안전합니다.',days:[{label:'다카하시',places:[2207],schedule:[[2207,'09:30',places.find(p=>p.id===2207).activity],[null,'12:30','빗추다카하시 시내에서 점심·휴식']]}],image:''},
{id:'r-2200-4',pref:'오카야마',areas:['다카하시·후키야'],title:'빗추 마쓰야마성과 후키야 하루',duration:'1일',intro:'현존 산성에서 벤가라 산골마을까지 이어보는 다카하시 지역의 역사 밀도 높은 일정입니다.',note:'두 장소 사이 대중교통 편수가 적어 버스 시간표를 먼저 고정하거나 렌터카 이용을 권합니다.',days:[{label:'다카하시·후키야',places:[2207,2208],schedule:[[2207,'09:00',places.find(p=>p.id===2207).activity],[null,'12:00','다카하시 시내 또는 이동 중 점심'],[2208,'14:00',places.find(p=>p.id===2208).activity]]}],image:''},
{id:'r-2200-5',pref:'오카야마',areas:['쓰야마'],title:'쓰야마성과 조토 거리 하루',duration:'1일',intro:'거대한 성터 석벽과 이즈모가도 옛 상가를 걸어서 이어보는 쓰야마 대표 역사 일정입니다.',note:'벚꽃철에는 쓰야마성 체류시간이 크게 늘 수 있어 조토 지구 일정은 오후 늦게 배치하세요.',days:[{label:'쓰야마',places:[2209,2210],schedule:[[2209,'09:30',places.find(p=>p.id===2209).activity],[null,'12:00','쓰야마에서 호르몬 우동 점심'],[2210,'13:30',places.find(p=>p.id===2210).activity]]}],image:''},
{id:'r-2200-6',pref:'오카야마',areas:['히루젠·유바라'],title:'히루젠 고원 하루',duration:'1일',intro:'목장·자전거·고원 풍경과 저지 유제품을 여유롭게 즐기는 자연 체험 일정입니다.',note:'고원 내 관광지 사이 거리가 있으므로 렌터카나 자전거를 이용하면 편리합니다.',days:[{label:'히루젠',places:[2211],schedule:[[2211,'10:00',places.find(p=>p.id===2211).activity],[null,'12:30','히루젠 야키소바·저지 유제품 점심'],[2211,'14:00','오후에는 자전거·목장·허브정원 중 취향에 맞는 체험을 선택하세요.']]}],image:''},
{id:'r-2200-7',pref:'오카야마',areas:['히루젠·유바라'],title:'히루젠 고원과 유바라 온천 하루',duration:'1일',intro:'낮에는 고원 풍경과 지역 음식을 즐기고 오후에는 강변 온천에서 쉬어가는 북부 대표 휴양 일정입니다.',note:'대중교통만 이용하면 이동시간이 길어 숙박 또는 렌터카 일정이 특히 잘 맞습니다.',days:[{label:'히루젠·유바라',places:[2211,2212],schedule:[[2211,'09:30',places.find(p=>p.id===2211).activity],[null,'12:30','히루젠에서 점심·유바라 이동'],[2212,'15:00',places.find(p=>p.id===2212).activity]]}],image:''},
{id:'r-2200-8',pref:'오카야마',areas:['비젠·오사후네'],title:'일본도와 시즈타니 교육유산 하루',duration:'1일',intro:'비젠도의 장인 기술과 에도시대 교육유산을 하루에 나누어 보는 오카야마 동부 역사문화 일정입니다.',note:'도검 단조 공개일과 시즈타니 학교의 계절행사를 확인하고 두 장소 사이 교통 시간을 넉넉히 잡으세요.',days:[{label:'비젠·오사후네',places:[2213,2214],schedule:[[2213,'09:30',places.find(p=>p.id===2213).activity],[null,'12:30','오사후네·비젠 이동 및 점심'],[2214,'14:00',places.find(p=>p.id===2214).activity]]}],image:''},
{id:'r-2200-9',pref:'오카야마',areas:['우시마도·세토우치'],title:'우시마도 올리브와 세토내해 반나절',duration:'반나절',intro:'올리브 언덕에서 섬이 떠 있는 세토내해 전망을 바라보며 천천히 쉬어가는 해안 일정입니다.',note:'대중교통 편수가 많지 않아 버스와 택시 시간 또는 렌터카 동선을 미리 확인하세요.',days:[{label:'우시마도',places:[2215],schedule:[[2215,'10:30',places.find(p=>p.id===2215).activity],[null,'12:30','우시마도에서 점심·해안 산책']]}],image:''},
{id:'r-2200-10',pref:'오카야마',areas:['이누지마'],title:'이누지마 현대미술 하루',duration:'1일',intro:'세토내해의 작은 섬에서 산업유산 미술관과 아트하우스, 마을 풍경을 걸어서 즐기는 예술 일정입니다.',note:'미술관 휴관일에는 일부 배편도 달라질 수 있어 전시 운영일과 왕복 선박 시간표를 반드시 함께 확인하세요.',days:[{label:'이누지마',places:[2216],schedule:[[2216,'10:30',places.find(p=>p.id===2216).activity],[null,'13:00','섬에서 점심·마을 산책'],[2216,'14:00','오후에는 아트하우스 프로젝트와 해안 마을을 걸어보세요.']]}],image:''}
];
const routePlanning={};
for(const r of routes){const d=r.days[0];routePlanning[r.id]={start:places.find(p=>p.id===d.places[0])?.name||'',end:places.find(p=>p.id===d.places.at(-1))?.name||'',move:'구간별 공식 교통편과 시간표를 확인해 도보·철도·버스·자전거·선박을 선택하세요.',meal:d.schedule.find(x=>x[0]===null)?.[2]||'일정 중간에 식사·휴식',rain:'야외 일정은 날씨에 맞춰 줄이고 실내 시설 관람을 늘리세요.',skip:'시간이 부족하면 마지막 장소를 다음 일정으로 미루세요.',warning:r.note,schedule:d.schedule}}

const credits=[
{label:'오카야마 고라쿠엔',source:photos['2200'].source,author:'Fjkelfeimvvn',license:'GFDL / CC BY-SA',licenseUrl:photos['2200'].source},
{label:'오카야마성',source:photos['2201'].source,author:'Wikimedia Commons contributor',license:'Commons license',licenseUrl:photos['2201'].source},
{label:'기비쓰 신사',source:photos['2202'].source,author:'Wikimedia Commons contributor',license:'Commons license',licenseUrl:photos['2202'].source},
{label:'구라시키 미관지구',source:photos['2204'].source,author:'Wikimedia Commons contributor',license:'Commons license',licenseUrl:photos['2204'].source},
{label:'오하라 미술관',source:photos['2205'].source,author:'663highland',license:'CC BY-SA',licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/'},
{label:'빗추 마쓰야마성',source:photos['2207'].source,author:'Wikimedia Commons contributor',license:'Commons license',licenseUrl:photos['2207'].source},
{label:'쓰야마성',source:photos['2209'].source,author:'663highland',license:'CC BY-SA',licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/'},
{label:'구 시즈타니 학교',source:photos['2214'].source,author:'Wikimedia Commons contributor',license:'Commons license',licenseUrl:photos['2214'].source}
];

regionalCatalog.push({pref:'오카야마',places,events,foods,photos,guides,intros,heroes,facts,foodDetails,foodPhotos,routePlanning,routes,credits,hero:photos['2200']});
})();