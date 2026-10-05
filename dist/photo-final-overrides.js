/* Final user-approved representative photo overrides.
   Loaded after QA/repair scripts so these choices cannot be overwritten by older photo maps. */
(()=>{
  const replacements={
    "507":{src:"images/licensed/saitama-railway-museum-507.webp",alt:"철도박물관",source:"https://commons.wikimedia.org/wiki/File:The_Railway_Museum_20080614.jpg"},
    "518":{src:"images/licensed/saitama-g-cans-518.webp",alt:"수도권 외곽방수로",source:"https://commons.wikimedia.org/wiki/File:首都圏外郭放水路(調圧水槽と立坑).jpg"},
    "711":{src:"images/licensed/kanagawa-hakone-heiwa-711.webp",alt:"하코네 신사",source:"https://commons.wikimedia.org/wiki/File:%E7%AE%B1%E6%A0%B9%E7%A5%9E%E7%A4%BE_%E5%B9%B3%E5%92%8C%E3%81%AE%E9%B3%A5%E5%B1%85,_%E7%AE%B1%E6%A0%B9%E7%94%BA,_Japan_(Unsplash).jpg"},
    "1208":{src:"images/licensed/ibaraki-ushiku-daibutsu-1208.webp",alt:"우시쿠 대불",source:"https://commons.wikimedia.org/wiki/File:Okiku_Daibutsu_Cherry_Blossoms.jpg"},
    "2601":{src:"images/licensed/kagawa-takamatsu-castle-2601.webp",alt:"다카마쓰성터·다마모공원",source:"https://commons.wikimedia.org/wiki/File:Takamatsu_Castle_-_Tamamo_Park_20211125_08.jpg"},
    "2608":{src:"images/licensed/kagawa-takaya-shrine-2608.webp",alt:"다카야 신사·천공의 도리이",source:"https://commons.wikimedia.org/wiki/File:Takayajinja_20200407_02.jpg"},
    "2612":{src:"images/official/kagawa-naoshima-haisha-2612.webp",alt:"이에프로젝트·혼무라",source:"https://www.benesse-artsite.jp/art/arthouse.html"},
    "2613":{src:"images/licensed/kagawa-teshima-art-2613.webp",alt:"데시마 미술관",source:"https://commons.wikimedia.org/wiki/File:Teshima_Art_Museum_exterior_view_201310.jpg"},
    "2802":{src:"images/licensed/kochi-katsurahama-2802.webp",alt:"가쓰라하마",source:"https://commons.wikimedia.org/wiki/File:Katsurahama.jpg"},
    "2906":{src:"images/licensed/fukuoka-nanzoin-37986553175.webp",alt:"난조인",source:"https://www.flickr.com/photos/traveloriented/37986553175/"},
    "2908":{src:"images/official/fukuoka-keya-oto-424.webp",alt:"게야노오토",source:"https://www.crossroadfukuoka.jp/en/photo/424"},
    "2911":{src:"images/official/fukuoka-nakatsumiya-429.webp",alt:"오시마·무나카타타이샤 나카쓰구",source:"https://www.crossroadfukuoka.jp/en/photo/429"},
    "2914":{src:"images/official/fukuoka-sarakura-193.webp",alt:"사라쿠라산",source:"https://www.crossroadfukuoka.jp/en/photo/193"},
    "3103":{src:"images/official/nagasaki-peace-statue-3103.webp",alt:"평화공원·평화기념상",source:"https://www.nagasaki-tabinet.com/guide/130/"},
    "3202":{src:"images/licensed/kumamoto-suizenji-pond-3202.webp",alt:"스이젠지 조주엔",source:"https://commons.wikimedia.org/wiki/File:Suizen-ji_J%C5%8Dju-en_20230103-5.jpg"},
    "3203":{src:"images/licensed/kumamoto-kumamon-square-24086051195.webp",alt:"구마몬 스퀘어",source:"https://www.flickr.com/photos/othree/24086051195/"},
    "3506":{src:"images/licensed/kagoshima-saraku-3506.webp",alt:"모래찜회관 사라쿠",source:"https://commons.wikimedia.org/wiki/File:Ibusuki-sand-bath_Saraku.jpg"},
    "3525":{src:"images/licensed/kagoshima-yakusugi-land-3525.webp",alt:"야쿠스기랜드",source:"https://commons.wikimedia.org/wiki/File:Suspension_footbridge_in_Yakusugi_Land.jpg"},
    "3530":{src:"images/licensed/kagoshima-honohoshi-3530.webp",alt:"호노호시해안",source:"https://commons.wikimedia.org/wiki/File:Amami_island_Honohoshi_beach.jpg"},
    "4003":{src:"images/licensed/hokkaido-shrine-4003.webp",alt:"홋카이도 신궁",source:"https://commons.wikimedia.org/wiki/File:(JPN-Hokkaido)_Hokkaido_Shrine_2026-06-06.jpg"},
    "4024":{src:"images/licensed/hokkaido-kurodake-ropeway-4024.webp",alt:"소운쿄·구로다케 로프웨이",source:"https://commons.wikimedia.org/wiki/File:%E9%BB%92%E5%B2%B3%E3%83%AD%E3%83%BC%E3%83%97%E3%82%A6%E3%82%A7%E3%82%A4_-_panoramio.jpg"},
    "4203":{src:"images/licensed/iwate-hoonji-rakan-4203.webp",alt:"호온지 오백나한",source:"https://commons.wikimedia.org/wiki/File:ArhatsMorioka.JPG"},
    "4214":{src:"images/licensed/iwate-geibikei-4214.webp",alt:"게이비케이",source:"https://commons.wikimedia.org/wiki/File:230729_Geibikei_Ichinoseki_Iwate_pref_Japan04s3.jpg"},
    "4221":{src:"images/licensed/iwate-kappabuchi-4221.webp",alt:"갓파부치",source:"https://commons.wikimedia.org/wiki/File:Kappa-buchi02s3872.jpg"},
    "4408":{src:"images/licensed/akita-aoyagi-house-4408.webp",alt:"아오야기가",source:"https://commons.wikimedia.org/wiki/File:Aoyagi_Samurai_House,_Kakunodate,_April_2023_01.jpg"},
    "4414":{src:"images/licensed/akita-oyasukyo-steam-4414.webp",alt:"오야스쿄 대분탕",source:"https://commons.wikimedia.org/wiki/File:Oyasukyo3.JPG"},
    "4417":{src:"images/licensed/akita-inu-kaikan-4417.webp",alt:"아키타견 회관",source:"https://commons.wikimedia.org/wiki/File:Akita-Inu-Kaikan_110827.jpg"},
    "4504":{src:"images/licensed/yamagata-zao-ice-monsters-4504.webp",alt:"자오 로프웨이·수빙",source:"https://commons.wikimedia.org/wiki/File:Mt.Zao_-_Ice_monsters_field_-_panoramio.jpg"},
    "4721":{src:"images/official/toyama-hotaruika-sea-tour-4721.webp",alt:"호타루이카 해상관광",source:"https://prtimes.jp/main/html/rd/p/000000002.000149148.html"},
    "4809":{src:"images/licensed/ishikawa-natadera-4809.webp",alt:"나타데라",source:"https://commons.wikimedia.org/wiki/File:260719_Natadera_Komatsu_Ishikawa_pref_Japan16s4.jpg"},
    "4819":{src:"images/official/ishikawa-fukube-4819.webp",alt:"후쿠베 대폭포",source:"https://www.hot-ishikawa.jp/photo/detail_1111114178.html"},
    "5003":{src:"images/licensed/nagano-jigokudani-hotspring-5003.webp",alt:"지고쿠다니 야생원숭이공원",source:"https://commons.wikimedia.org/wiki/File:Jigokudani_hotspring_in_Nagano_Japan_001.jpg"},
    "5004":{src:"images/licensed/nagano-shibu-kanaguya-5004.webp",alt:"시부 온천",source:"https://www.flickr.com/photos/clvs7/49453787357/"},
    "5007":{src:"images/licensed/nagano-kamikochi-5007.webp",alt:"가미코치",source:"https://commons.wikimedia.org/wiki/File:%E4%B8%8A%E9%AB%98%E5%9C%B0_07.jpg"},
    "5107":{src:"images/licensed/yamanashi-iyashinosato-5107.webp",alt:"사이코 이야시노사토 넨바",source:"https://commons.wikimedia.org/wiki/File:Iyashinosato_village_04.jpg"},
    "5112":{src:"images/licensed/yamanashi-shosenkyo-5112.webp",alt:"쇼센쿄",source:"https://commons.wikimedia.org/wiki/File:Yamanashi_Shosenkyo_xl.jpg"},
    "5201":{src:"images/licensed/fukushima-jododaira-5201.webp",alt:"반다이아즈마 스카이라인·조도다이라",source:"https://commons.wikimedia.org/wiki/File:Joudodaira.JPG"},
    "5205":{src:"images/licensed/fukushima-sazaedo-5205.webp",alt:"아이즈 사자에도",source:"https://commons.wikimedia.org/wiki/File:%E4%BC%9A%E6%B4%A5%E3%81%95%E3%81%96%E3%81%88%E5%A0%82_(%E5%86%86%E9%80%9A%E4%B8%89%E5%8C%9D%E5%A0%82)20200208-IMG_7847.jpg"},
    "5219":{src:"images/licensed/fukushima-shioyasaki-5219.webp",alt:"시오야사키 등대",source:"https://commons.wikimedia.org/wiki/File:Shioyasaki_Light_House_(13332232033).jpg"},
    "1314":{
      src:"images/licensed/tochigi-ryuzu-1314.webp",
      alt:"류즈 폭포",
      source:"https://commons.wikimedia.org/wiki/File:Ryuzu_Falls_01.JPG"
    },
    "1408":{
      src:"images/licensed/gunma-shima-onsen-1408.webp",
      alt:"시마 온천",
      source:"https://commons.wikimedia.org/wiki/File:%E5%9B%9B%E4%B8%87%E6%B8%A9%E6%B3%89_%E4%B8%AD%E4%B9%8B%E6%9D%A1_2013_(9993444756).jpg"
    },
    "1409":{
      src:"images/licensed/gunma-takasaki-kannon-1409.webp",
      alt:"다카사키 백의대관음",
      source:"https://commons.wikimedia.org/wiki/File:Byakui_Kannon_-_Takasaki_city_-_panoramio.jpg"
    },
    "717":{
      src:"images/licensed/kanagawa-marine-tower-717.webp",
      alt:"요코하마 마린타워",
      source:"https://commons.wikimedia.org/wiki/File:Hikawamaru_from_Osanbashi_Pier.JPG"
    },
    "720":{
      src:"images/licensed/kanagawa-engakuji-720.webp",
      alt:"엔가쿠지",
      source:"https://commons.wikimedia.org/wiki/File:Engaku-ji_(36530160165).jpg"
    },
    "911":{
      src:"images/licensed/gifu-sekigahara-overview-911.webp",
      alt:"세키가하라 고전장",
      source:"https://commons.wikimedia.org/wiki/File:View_of_Sekigahara_from_Sasaoyama,_site_of_Ishida_Mitsunari%27s_headquarters.jpg"
    },
    "923":{
      src:"images/licensed/gifu-sekigahara-decisive-923.webp",
      alt:"세키가하라 고전장 결전지",
      source:"https://commons.wikimedia.org/wiki/File:The-Battlefield-of-Sekigahara-1.jpg"
    },
  "4113": {
    "src": "images/official/aomori-hirosaki-apple-4113.webp",
    "alt": "히로사키시 사과공원",
    "source": "https://aomori-tourism.com/photos/detail_7268.html"
  },
  "4224": {
    "src": "images/licensed/iwate-ryusendo-lake-4224.webp",
    "alt": "류센도",
    "source": "https://commons.wikimedia.org/wiki/File:Ryusendo_Cave_Underground_Lake_Cap_20201115.jpg"
  },
  "4103": {
    "src": "images/official/aomori-sannai-4103.webp",
    "alt": "산나이마루야마 유적",
    "source": "https://www.tohokukanko.jp/photos/detail_2208.html"
  },
    "726":{
      src:"images/licensed/kanagawa-pola-02-726.webp",
      alt:"폴라 미술관",
      source:"https://commons.wikimedia.org/wiki/File:191103_Pola_Museum_of_Art_Hakone_Japan02s3.jpg"
    },
    "3201":{
      src:"images/official/kumamoto-josaien-selected-03-3201.webp",
      alt:"사쿠라노바바 조사이엔",
      source:"https://kumamoto.guide/photogallery/"
    },
    "210":{
      src:"images/licensed/tokyo-ghibli-museum-210.webp",
      alt:"미타카의 숲 지브리 미술관",
      source:"https://commons.wikimedia.org/wiki/File:Ghibli_Museum_2024.JPG"
    },
    "4608":{
      src:"images/licensed/niigata-echigo-yuzawa-4608.webp",
      alt:"에치고유자와 온천",
      source:"https://commons.wikimedia.org/wiki/File:Entrance_to_Echigo-Yuzawa_Onsen.JPG"
    },
    "4706":{
      src:"images/official/toyama-shomyo-falls-4706.webp",
      alt:"쇼묘 폭포",
      source:"https://visit-toyama-japan.com/ko/image-gallery/51"
    },
    "4723":{
      src:"images/licensed/toyama-kurobe-dam-4723.webp",
      alt:"구로베댐",
      source:"https://commons.wikimedia.org/wiki/File:%E9%BB%92%E9%83%A8%E3%83%80%E3%83%A002.jpg"
    },
    "4919":{
      src:"images/official/fukui-obama-port-4919.webp",
      alt:"오바마 어항",
      source:"https://www.fuku-e.com/photo/detail_2544.html"
    },
    "906":{
      src:"images/licensed/gifu-gujo-hachiman-castle-906.webp",
      alt:"구조하치만성",
      source:"https://commons.wikimedia.org/wiki/File:Gujo_hachiman_castle_in_autumn.jpg"
    },
    "3717":{
      src:"images/official/mie-iga-ninja-show-3717.webp",
      alt:"이가류 닌자박물관",
      source:"https://www.kankomie.or.jp/media/photo_free/3201"
    },
    "3711":{
      src:"images/official/mie-nagashima-overview-3711.webp",
      alt:"나가시마 스파랜드",
      source:"https://www.kankomie.or.jp/media/photo_free/451"
    },
    "3721":{
      src:"images/official/mie-matsusaka-castle-3721.webp",
      alt:"마쓰사카성터",
      source:"https://www.kankomie.or.jp/media/photo_free/4846"
    },
    "3722":{
      src:"images/official/mie-gojobanyashiki-3722.webp",
      alt:"고조반야시키",
      source:"https://www.kankomie.or.jp/media/photo_free/4848"
    },
    "1622":{
      src:"images/licensed/nara-okadera-1622.webp",
      alt:"오카데라",
      source:"https://commons.wikimedia.org/wiki/File:Okadera_Asuka_Nara_pref06n3900.jpg"
    },
    "7":{
      src:"images/licensed/kyoto-arashiyama-bamboo-7.webp",
      alt:"아라시야마 대나무숲",
      source:"https://commons.wikimedia.org/wiki/File:Arashiyama_-_Bamboo_Forest,_Kyoto,_Japan10.jpg"
    },
    "401":{
      src:"images/licensed/osaka-kuromon-401.webp",
      alt:"구로몬 시장",
      source:"https://commons.wikimedia.org/wiki/File:%E9%BB%92%E9%96%80%E5%B8%82%E5%A0%B4_2024(1).jpg"
    },
    "406":{
      src:"images/licensed/osaka-castle-406.webp",
      alt:"오사카성 공원·천수각",
      source:"https://commons.wikimedia.org/wiki/File:Osaka_Castle_in_Japan.jpg"
    },
    "408":{
      src:"images/licensed/osaka-shitennoji-408.webp",
      alt:"시텐노지",
      source:"https://commons.wikimedia.org/wiki/File:Shitenno-ji_Temple_@_Osaka_(13382740383).jpg"
    },
    "412":{
      src:"images/licensed/osaka-usj-412.webp",
      alt:"유니버설 스튜디오 재팬",
      source:"https://commons.wikimedia.org/wiki/File:USJ_Entrance_2026.jpg"
    },
    "1108":{
      src:"images/licensed/mie-okage-yokocho-1108.webp",
      alt:"오카게요코초",
      source:"https://commons.wikimedia.org/wiki/File:Ise_Mie_Okage_Yokocho_15.jpg"
    },
    "1511":{
      src:"images/licensed/kyoto-ginkakuji-1511.webp",
      alt:"긴카쿠지",
      source:"https://commons.wikimedia.org/wiki/File:Silberner_Pavillion,_Ginkaku-ji,_Kyoto.jpg"
    },
    "1609":{
      src:"images/licensed/nara-yoshinoyama-1609.webp",
      alt:"요시노산",
      source:"https://commons.wikimedia.org/wiki/File:From_Mount_Yoshino_(6988360150).jpg"
    },
    "1614":{
      src:"images/licensed/nara-asukadera-1614.webp",
      alt:"아스카데라",
      source:"https://commons.wikimedia.org/wiki/File:Asuka_Temple.JPG"
    },
    "1619":{
      src:"images/licensed/nara-tanzan-jinja-1619.webp",
      alt:"단잔 신사",
      source:"https://commons.wikimedia.org/wiki/File:Tanzan_jinja_lanterns_at_balcony.jpg"
    },
    "1707":{
      src:"images/licensed/hyogo-kinosaki-onsen-1707.webp",
      alt:"기노사키 온천",
      source:"https://commons.wikimedia.org/wiki/File:Kinosaki_Onsen_at_night.jpg"
    },
    "1717":{
      src:"images/licensed/hyogo-awaji-hanasajiki-1717.webp",
      alt:"아와지 하나사지키",
      source:"https://commons.wikimedia.org/wiki/File:%E3%81%82%E3%82%8F%E3%81%98%E8%8A%B1%E3%81%95%E3%81%98%E3%81%8D%E3%83%9D%E3%83%94%E3%83%BC.jpg"
    },
    "1719":{
      src:"images/licensed/hyogo-akashi-castle-1719.webp",
      alt:"아카시성",
      source:"https://commons.wikimedia.org/wiki/File:Castle_of_Akashi%EF%BC%9A%E6%98%8E%E7%9F%B3%E5%9F%8E_-_panoramio.jpg"
    },
    "1722":{
      src:"images/licensed/hyogo-kobe-port-tower-1722.webp",
      alt:"고베 포트타워",
      source:"https://commons.wikimedia.org/wiki/File:Kobe_nakatottei07s3200.jpg"
    },
    "1907":{
      src:"images/licensed/wakayama-oyunohara-1907.webp",
      alt:"오유노하라",
      source:"https://commons.wikimedia.org/wiki/File:Oyunohara_autumn_panorama.jpeg"
    },
    "1911":{
      src:"images/licensed/wakayama-nachi-falls-1911.webp",
      alt:"나치 폭포",
      source:"https://commons.wikimedia.org/wiki/File:%E9%82%A3%E6%99%BA%E6%BB%9D%E3%81%A8%E4%B8%89%E9%87%8D%E5%A1%94_-_Nachi-no-taki_waterfall_-_panoramio.jpg"
    },
    "2013":{
      src:"images/licensed/tottori-kaike-onsen-2013.webp",
      alt:"가이케 온천",
      source:"https://commons.wikimedia.org/wiki/File:Kaike_onsen01n3200.jpg"
    },
    "2103":{
      src:"images/licensed/shimane-adachi-museum-2103.webp",
      alt:"아다치 미술관",
      source:"https://commons.wikimedia.org/wiki/File:Adachi_Museum_of_Art_Garden_03.jpg"
    },
    "2108":{
      src:"images/licensed/shimane-ryugenji-mabu-2108.webp",
      alt:"류겐지 마부",
      source:"https://commons.wikimedia.org/wiki/File:Iwami_Ginzan_Silver_Mine,_Ryugenji_Mabu_Mine_Shaft_002.JPG"
    },
    "2302":{
      src:"images/licensed/hiroshima-castle-2302.webp",
      alt:"히로시마성",
      source:"https://commons.wikimedia.org/wiki/File:20181111_Hiroshima_Castle_statue.jpg"
    },
    "2400":{
      src:"images/licensed/yamaguchi-karato-market-2400.webp",
      alt:"가라토 시장",
      source:"https://commons.wikimedia.org/wiki/File:Karato_Piers_and_Karato_Market.jpg"
    },
    "2602":{
      src:"images/official/kagawa-yashimaru-2602.webp",
      alt:"야시마·야시마루",
      source:"https://www.yashima-navi.jp/jp/gallery/entry-538.html",
      fit:"contain"
    },
    "2616":{
      src:"images/licensed/kagawa-shodoshima-olive-park-2616.webp",
      alt:"쇼도시마 올리브공원",
      source:"https://commons.wikimedia.org/wiki/File:Shodoshima_Olive_Park_Shodo_Island_Japan01s3.jpg"
    },
    "2619":{
      src:"images/licensed/kagawa-marugamemachi-2619.webp",
      alt:"다카마쓰 마루가메마치 상점가",
      source:"https://commons.wikimedia.org/wiki/File:Marugamemachi_Shopping_Street_2021-08_ac_(4).jpg"
    },
    "2703":{
      src:"images/licensed/ehime-bansuiso-2703.webp",
      alt:"반스이소",
      source:"https://commons.wikimedia.org/wiki/File:Bansui-so_2016-04-30.jpg"
    },
    "2712":{
      src:"images/licensed/ehime-garyu-sanso-2712.webp",
      alt:"가류산소",
      source:"https://commons.wikimedia.org/wiki/File:%E8%87%A5%E9%BE%8D%E5%B1%B1%E8%8D%98_-_garyuu_sanso_-_panoramio.jpg"
    },
    "2800":{
      src:"images/licensed/kochi-castle-2800.webp",
      alt:"고치성",
      source:"https://commons.wikimedia.org/wiki/File:Kochi_Castle09.JPG"
    },
    "2913":{
      src:"images/licensed/fukuoka-kokura-castle-2913.webp",
      alt:"고쿠라성",
      source:"https://commons.wikimedia.org/wiki/File:Kokura-jo-teien.jpg"
    },
    "2922":{
      src:"images/licensed/fukuoka-canal-city-2922.webp",
      alt:"캐널시티 하카타",
      source:"https://commons.wikimedia.org/wiki/File:Dancing_fountains,_Canal_City,_Fukuoka,_Japan.jpg"
    },
    "3004":{
      src:"images/licensed/saga-nijinomatsubara-3004.webp",
      alt:"니지노마쓰바라",
      source:"https://commons.wikimedia.org/wiki/File:Nijinomatsubara.jpg"
    },
    "3007":{
      src:"images/licensed/saga-nagoya-castle-museum-3007.webp",
      alt:"히젠 나고야성터·사가현립 나고야성박물관",
      source:"https://commons.wikimedia.org/wiki/File:Saga_Prefectural_Nagoya_Castle_Museum_240812.jpg"
    },
    "3008":{
      src:"images/licensed/saga-kyushu-ceramic-museum-3008.webp",
      alt:"사가현립 규슈도자문화관",
      source:"https://commons.wikimedia.org/wiki/File:The_Kyushu_Ceramic_Museum_-_52125636824.jpg"
    },
    "3010":{
      src:"images/licensed/saga-okawachiyama-3010.webp",
      alt:"오카와치야마",
      source:"https://commons.wikimedia.org/wiki/File:Nabeshimayaki_Okawachiyama_Imari-shi_Saga-ken_PB110083.jpg"
    },
    "3101":{
      src:"images/licensed/nagasaki-oura-church-3101.webp",
      alt:"오우라 천주당",
      source:"https://commons.wikimedia.org/wiki/File:Former_the_archbishop_hall_of_the_Roman_Catholic_Archdiocese_of_Nagasaki01s3.jpg"
    },
    "3109":{
      src:"images/licensed/nagasaki-26-martyrs-3109.webp",
      alt:"일본26성인 순교지·니시자카",
      source:"https://commons.wikimedia.org/wiki/File:26_Martyrs_Shrine_and_Museum_and_St._Phillip_Church.jpg"
    },
    "3115":{
      src:"images/licensed/nagasaki-hirado-east-west-3115.webp",
      alt:"히라도 자비에르기념교회·사원과 교회가 보이는 풍경",
      source:"https://commons.wikimedia.org/wiki/File:East_meets_west_in_hirado.jpg"
    },
    "3124":{
      src:"images/official/nagasaki-fukue-castle-3124.webp",
      alt:"후쿠에성터·이시다성",
      source:"https://www.nagasaki-tabinet.com/guide/348"
    },
    "3310":{
      src:"images/licensed/oita-yunotsubo-street-3310.webp",
      alt:"유노쓰보거리",
      source:"https://commons.wikimedia.org/wiki/File:Mount_Yufudake_from_Yunotsubo_Street.JPG"
    },
    "3315":{
      src:"images/licensed/oita-ramune-onsen-3315.webp",
      alt:"나가유온천·라무네온천관",
      source:"https://commons.wikimedia.org/wiki/File:RamuneOnsenExterior.JPG"
    },
    "3316":{
      src:"images/licensed/oita-oka-castle-3316.webp",
      alt:"오카성터",
      source:"https://commons.wikimedia.org/wiki/File:Oka_Castle%27s_Main_Gate_Ruin.jpg"
    },
    "3319":{
      src:"images/licensed/oita-usa-jingu-3319.webp",
      alt:"우사신궁",
      source:"https://commons.wikimedia.org/wiki/File:Stone_sign_and_Torii_of_Usa_Jingu_Shrine_-_Mar_26,_2018.jpg"
    },
    "3415":{
      src:"images/licensed/miyazaki-umagase-3415.webp",
      alt:"우마가세",
      source:"https://commons.wikimedia.org/wiki/File:%E9%A6%AC%E3%83%B6%E8%83%8C%E7%AA%81%E7%AB%AF.jpg"
    },
    "3522":{
      src:"images/licensed/kagoshima-shiratani-unsuikyo-3522.webp",
      alt:"시라타니운스이쿄",
      source:"https://commons.wikimedia.org/wiki/File:Yaku-Island_Shiratani-Unsui-Gorge.jpg"
    },
    "3523":{
      src:"images/licensed/kagoshima-jomonsugi-3523.webp",
      alt:"조몬스기",
      source:"https://commons.wikimedia.org/wiki/File:Jomonsugi_(52931651088).jpg"
    },
    "3524":{
      src:"images/licensed/kagoshima-oko-falls-3524.webp",
      alt:"오코노타키",
      source:"https://commons.wikimedia.org/wiki/File:Oko_Falls_in_Yakushima.jpg"
    },
    "3606":{
      src:"images/licensed/okinawa-gyokusendo-3606.webp",
      alt:"오키나와월드·교쿠센도",
      source:"https://commons.wikimedia.org/wiki/File:Gyokusendo_Cave_-_panoramio.jpg"
    },
    "3637":{
      src:"images/licensed/okinawa-euglena-mall-3637.webp",
      alt:"유글레나몰·이시가키시 공설시장",
      source:"https://commons.wikimedia.org/wiki/File:Ishigaki_eugrena_mall.jpg"
    },
    "3410":{
      src:"images/licensed/miyazaki-takachiho-gorge-3410.webp",
      alt:"다카치호 협곡",
      source:"https://commons.wikimedia.org/wiki/File:%E7%A7%8B%E8%89%B2%E3%81%AE%E9%AB%98%E5%8D%83%E7%A9%82%E5%B3%A1_(Autumn_Colored_Takachiho_Gorge)_24_Nov,_2012_-_panoramio.jpg"
    },
    "3513":{
      src:"images/licensed/kagoshima-takachiho-gawara-3513.webp",
      alt:"다카치호가와라",
      source:"https://commons.wikimedia.org/wiki/File:Takachiho-gawara_Kirishima_City_Kagoshima_Pref02n4050.jpg"
    },
    "3605":{
      src:"images/licensed/okinawa-sefa-utaki-3605.webp",
      alt:"세이화우타키",
      source:"https://commons.wikimedia.org/wiki/File:Okinawa_Nanjo_Sefa-utaki_Gusuku_site_Yuinchi_06.jpg"
    },
    "3621":{
      src:"images/licensed/okinawa-cape-hedo-3621.webp",
      alt:"헤도곶",
      source:"https://commons.wikimedia.org/wiki/File:Cape_Hedo_202011.jpg"
    },
    "1017":{
      src:"images/user/aichi-ghibli-park-1017.svg",
      alt:"지브리 파크",
      source:"images/user/aichi-ghibli-park-1017.svg"
    },
    "3413":{
      src:"images/user/miyazaki-amanoyasugawara-3413.webp",
      alt:"아마노야스가와라",
      source:"images/user/miyazaki-amanoyasugawara-3413.webp"
    },
  };
  for(const [id,pic] of Object.entries(replacements)){
    tokyoPhotos[id]={...pic};
    for(const r of regionalCatalog){
      if(r.photos?.[id])r.photos[id]={...pic};
    }
  }
  if(typeof designPhotos!=="undefined"){
    designPhotos["시마 온천"]={...replacements["1408"]};
    designPhotos["세키가하라·요로"]={...replacements["911"]};
    designPhotos["세키가하라"]={...replacements["923"]};
  }

  const approvedCredits={"3413": {"src": "images/user/miyazaki-amanoyasugawara-3413.webp", "alt": "아마노야스가와라", "source": "images/user/miyazaki-amanoyasugawara-3413.webp", "filename": "아마노야스가와라", "author": "사용자 직접 촬영", "license": "사용자 제공", "licenseUrl": "images/user/miyazaki-amanoyasugawara-3413.webp"},"4113": {"src": "images/official/aomori-hirosaki-apple-4113.webp", "alt": "히로사키시 사과공원", "source": "https://aomori-tourism.com/photos/detail_7268.html", "filename": "히로사키시 사과공원", "author": "青森県・青森県観光国際交流機構", "license": "관광 홍보용 웹 이용 허가", "licenseUrl": "https://aomori-tourism.com/photos/detail_7268.html"}, "4224": {"src": "images/licensed/iwate-ryusendo-lake-4224.webp", "alt": "류센도", "source": "https://commons.wikimedia.org/wiki/File:Ryusendo_Cave_Underground_Lake_Cap_20201115.jpg", "filename": "류센도", "author": "あおもりくま", "license": "Public domain", "licenseUrl": "https://commons.wikimedia.org/wiki/File:Ryusendo_Cave_Underground_Lake_Cap_20201115.jpg"}, "4103": {"src": "images/official/aomori-sannai-4103.webp", "alt": "산나이마루야마 유적", "source": "https://www.tohokukanko.jp/photos/detail_2208.html", "filename": "산나이마루야마 유적", "author": "東北観光推進機構・写真提供者", "license": "관광 홍보용 이용 허가", "licenseUrl": "https://www.tohokukanko.jp/photos/detail_2208.html"}};
  const host=document.querySelector('#photoCreditList');
  for(const [id,pic] of Object.entries(approvedCredits)){
    photoQaPendingPlaces.delete(Number(id));
    const row=document.createElement('p'),a=document.createElement('a');
    row.className='photoAttribution';row.setAttribute('translate','no');
    a.href=pic.source;a.target='_blank';a.rel='noopener';a.textContent=pic.filename;
    row.append(a,document.createTextNode(' · '+pic.author+' · '+pic.license+' · WebP / resized'));
    const l=document.createElement('a');l.href=pic.licenseUrl;l.target='_blank';l.rel='noopener';l.textContent=' '+pic.license;row.append(l);host.append(row);
  }
  for(const r of routeTemplates){
    const p=r.days.flatMap(d=>d.places).map(id=>samples.find(p=>p.id===id)).find(p=>photoForPlace(p));
    const pic=photoForPlace(p);r.image=pic?.src||'';r.imageAlt=pic?.alt||'';
  }
  if(typeof render==="function")render();
})();

/* Selected photo batch 11-28 verified local and locked. */


/* User-selected Commons batch 2026-10-06 A */
(()=>{
  const replacements={
    "3611":{src:"images/licensed/approved/okinawa-zanpa-3611.webp",alt:"잔파곶",source:"https://commons.wikimedia.org/wiki/File:500px_photo_(188688269).jpeg"},
    "4420":{src:"images/licensed/approved/akita-korakukan-4420.webp",alt:"고라쿠칸",source:"https://commons.wikimedia.org/wiki/File:Korakukan_2025-07_ac_(2).jpg"},
    "4129":{src:"images/licensed/approved/aomori-hotokegaura-4129.webp",alt:"호토케가우라",source:"https://commons.wikimedia.org/wiki/File:Aomori-Hotokegaura-xl.jpg"},
    "5221":{src:"images/licensed/approved/fukushima-matsukawaura-5221.webp",alt:"마쓰카와우라",source:"https://commons.wikimedia.org/wiki/File:20091011%E6%9D%BE%E5%B7%9D%E6%B5%A6.jpg"},
    "1305":{src:"images/licensed/approved/tochigi-oya-history-1305.webp",alt:"오야 자료관",source:"https://commons.wikimedia.org/wiki/File:Oya_History_Museum_entrance_2016-05-12.jpg"}
  };
  for(const [id,pic] of Object.entries(replacements)){
    if(typeof photoQaPendingPlaces!=="undefined")photoQaPendingPlaces.delete(Number(id));
    const place=typeof samples!=="undefined"?samples.find(p=>String(p.id)===id):null;
    const previous=place&&typeof photoForPlace==="function"?photoForPlace(place):null;
    if(typeof tokyoPhotos!=="undefined")tokyoPhotos[id]={...pic};
    if(typeof regionalCatalog!=="undefined")for(const r of regionalCatalog){
      if(r.photos?.[id])r.photos[id]={...pic};
      if(previous?.src&&r.hero?.src===previous.src)r.hero={...pic};
    }
    if(place&&previous?.src&&typeof designPhotos!=="undefined"){
      for(const [key,hero] of Object.entries(designPhotos)){
        if(hero?.src===previous.src&&[place.pref,place.area,place.town,place.name].includes(key))designPhotos[key]={...pic};
      }
    }
  }
  if(typeof render==="function")render();
})();
