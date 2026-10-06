#!/usr/bin/env python3
"""Canonical filename slug policy for Jatlas.

Rules:
- Never transliterate the Korean UI name.
- Places: use an explicit official/common slug when one is curated; otherwise
  romanize the Japanese place name/query with macron-less standard Hepburn.
- Foods: use an explicit curated canonical slug.
"""
import re
from pykakasi import kakasi

_KAKASI=kakasi()

PLACE_OVERRIDES={
# Greater Tokyo
'11-P0007':'omiya-bonsai-art-museum',
'11-P0008':'railway-museum',
'11-P0010':'oshi-castle-gyoda-local-history-museum',
'11-P0019':'metropolitan-area-outer-underground-discharge-channel',
'11-P0022':'tokorozawa-aviation-memorial-park',
'11-P0023':'tobu-zoo',
'12-P0001':'naritasan-shinshoji',
'12-P0003':'national-museum-of-japanese-history',
'12-P0013':'tokyo-disneyland',
'12-P0014':'tokyo-disneysea',
'12-P0016':'mother-farm',
'12-P0019':'chiba-port-tower',
'12-P0020':'tokyo-german-village',
'12-P0022':'funabashi-andersen-park',
'13-P0002':'tokyo-skytree',
'13-P0004':'tokyo-national-museum',
'13-P0009':'tokyo-metropolitan-government-observatory',
'13-P0010':'shibuya-scramble-crossing',
'13-P0012':'shibuya-sky',
'13-P0013':'tokyo-tower',
'13-P0016':'showa-kinen-park',
'13-P0021':'miraikan',
'13-P0022':'tokyo-big-sight',
'13-P0023':'divercity-tokyo-plaza',
'13-P0024':'tokyo-joypolis',
'13-P0027':'national-museum-of-nature-and-science',
'13-P0031':'ghibli-museum',
'13-P0039':'tokyo-dome-city',
'13-P0040':'tokyo-station-marunouchi-building',
'13-P0041':'imperial-palace-east-gardens',
'13-P0047':'sumida-hokusai-museum',
'13-P0048':'edo-tokyo-museum',
'13-P0049':'teamlab-planets-tokyo',
'13-P0050':'teamlab-borderless',
'13-P0053':'mori-art-museum',
'14-P0001':'yokohama-red-brick-warehouse',
'14-P0003':'yokohama-chinatown',
'14-P0009':'enoshima-sea-candle',
'14-P0010':'enoshima-aquarium',
'14-P0017':'cup-noodles-museum-yokohama',
'14-P0018':'yokohama-marine-tower',
'14-P0022':'hakone-open-air-museum',
'14-P0027':'pola-museum-of-art',
# Hokuriku
'16-P0002':'toyama-glass-art-museum',
'16-P0004':'toyama-prefectural-museum-of-art-and-design',
'16-P0005':'tateyama-kurobe-alpine-route',
'16-P0008':'kurobe-gorge-railway',
'16-P0013':'himi-banya-gai',
'16-P0021':'firefly-squid-museum',
'16-P0022':'firefly-squid-sea-tour',
'17-P0005':'21st-century-museum-of-contemporary-art-kanazawa',
'17-P0011':'ishikawa-aviation-plaza',
'17-P0014':'wajima-museum-of-urushi-art',
'17-P0017':'notojima-aquarium',
'18-P0004':'fukui-prefectural-museum-of-cultural-history',
'18-P0009':'fukui-prefectural-dinosaur-museum',
'18-P0018':'rainbow-line-summit-park',
'18-P0023':'wakasa-mikata-jomon-museum',
# Kinki
'25-P0007':'lake-biwa-museum',
'25-P0016':'miho-museum',
'27-P0004':'umeda-sky-building',
'27-P0008':'osaka-museum-of-history',
'27-P0014':'expo-70-commemorative-park',
'27-P0024':'osaka-museum-of-housing-and-living',
'27-P0025':'nakanoshima-museum-of-art-osaka',
'27-P0027':'cup-noodles-museum-osaka-ikeda',
'28-P0003':'kobe-nunobiki-herb-gardens-ropeway',
'28-P0012':'kobe-harborland',
'28-P0013':'rokko-garden-terrace',
'28-P0016':'kinosaki-ropeway',
'28-P0023':'kobe-port-tower',
'29-P0014':'nara-national-museum',
'30-P0003':'wakayama-marina-city-kuroshio-market',
# Sanin-Sanyo common/official English names
'31-P0001':'tottori-sand-dunes',
'31-P0002':'sand-museum',
'31-P0003':'uradome-coast',
'31-P0008':'gosho-aoyama-manga-factory',
'31-P0009':'tottori-nijisseiki-pear-museum',
'31-P0013':'tottori-flower-park',
'31-P0015':'mizuki-shigeru-road',
'32-P0001':'matsue-castle',
'32-P0004':'adachi-museum-of-art',
'32-P0007':'izumo-taisha',
'33-P0001':'okayama-korakuen',
'33-P0002':'okayama-castle',
'33-P0003':'kurashiki-bikan-historical-quarter',
'34-P0001':'atomic-bomb-dome',
'34-P0002':'hiroshima-peace-memorial-museum',
'34-P0006':'itsukushima-shrine',
'34-P0008':'miyajima-ropeway',
'35-P0001':'karato-market',
'35-P0004':'tsunoshima-bridge',
'35-P0005':'motonosumi-shrine',
'35-P0008':'kintaikyo-bridge',
# Shikoku: explicit slugs where the map query has trailing location/context
# that would otherwise collapse the filename to a prefecture or generic token.
'36-P0001':'naruto-whirlpools-uzunomichi',
'36-P0006':'bizan-ropeway',
'36-P0012':'iya-valley-peeing-boy-statue',
'36-P0016':'tairyuji-ropeway',
'37-P0002':'takamatsu-castle-tamamo-park',
'37-P0003':'yashima-yashimaru',
'37-P0005':'kanamaruza',
'37-P0007':'zentsuji',
'37-P0009':'takaya-shrine-sky-torii',
'37-P0010':'zenigata-sand-sculpture-kotohiki-park',
'37-P0013':'art-house-project-honmura',
'37-P0015':'angel-road',
'37-P0019':'okuboji',
'38-P0003':'ishiteji',
'38-P0005':'shimanami-kaido',
'38-P0008':'oyamazumi-shrine',
'38-P0015':'tenshaen',
'38-P0016':'yusumizugaura-terraced-fields',
'39-P0003':'katsurahama',
'39-P0005':'chikurinji',
'39-P0006':'ryugado-cave',
'39-P0009':'nakatsu-gorge',
'39-P0010':'cape-muroto',
'39-P0011':'monet-garden-marmottan',
'39-P0013':'shimanto-river-sightseeing-boat',
'39-P0016':'ashizuri-aquarium-satoumi',
'39-P0017':'kashiwajima',
'39-P0018':'kochi-sunday-market',
'39-P0019':'mikurodo-hotsumisakiji',
# Kyushu curated slugs for branded/composite names and ambiguous query tails.
'40-P0001':'fukuoka-castle-maizuru-park','40-P0003':'kushida-shrine','40-P0004':'fukuoka-tower','40-P0005':'dazaifu-tenmangu','40-P0006':'kyushu-national-museum','40-P0007':'nanzoin',
'40-P0010':'munakata-taisha-hetsugu','40-P0012':'munakata-taisha-nakatsugu','40-P0013':'mojiko-retro','40-P0016':'kawachi-wisteria-garden','40-P0017':'yanagawa-river-cruise','40-P0018':'tachibana-tei-ohana','40-P0019':'yame-fukushima-traditional-townscape',
'40-P0023':'canal-city-hakata','40-P0024':'jr-hakata-city','40-P0025':'tenjin-underground-mall','40-P0026':'one-fukuoka-building','40-P0027':'lalaport-fukuoka',
'41-P0001':'saga-castle-honmaru-history-museum','41-P0002':'saga-balloon-museum','41-P0003':'yoshinogari-historical-park','41-P0006':'nanatsugama','41-P0007':'yobuko-morning-market','41-P0008':'hizen-nagoya-castle-ruins','41-P0009':'kyushu-ceramic-museum',
'41-P0010':'tozan-shrine','41-P0012':'takeo-onsen-romon-gate','41-P0014':'takeo-shrine-great-camphor','41-P0016':'yutoku-inari-shrine','41-P0017':'hizen-hamashuku-sake-brewery-street','41-P0018':'ouo-shrine-sea-torii',
'42-P0001':'glover-garden','42-P0003':'dejima','42-P0004':'nagasaki-peace-park','42-P0005':'nagasaki-atomic-bomb-museum','42-P0006':'mount-inasa-observatory','42-P0007':'spectacles-bridge','42-P0008':'nagasaki-shinchi-chinatown','42-P0009':'gunkanjima-hashima',
'42-P0010':'twenty-six-martyrs-museum','42-P0011':'kujuku-shima-pearl-sea-resort','42-P0013':'huis-ten-bosch','42-P0014':'hario-radio-towers','42-P0016':'hirado-xavier-memorial-church','42-P0017':'kawachi-pass','42-P0018':'shimabara-castle-samurai-residences',
'42-P0020':'nita-pass-unzen-ropeway','42-P0021':'obama-onsen-hot-foot-105','42-P0024':'takahama-beach','42-P0025':'fukue-castle-ruins','42-P0026':'saruiwa','42-P0028':'watatsumi-shrine','42-P0029':'eboshidake-observatory','42-P0030':'hamanomachi-arcade',
'43-P0002':'sakura-no-baba-josaien','43-P0004':'kumamon-square','43-P0005':'kamitori-shimotori-arcades','43-P0006':'sakura-machi-kumamoto','43-P0007':'kusasenrigahama','43-P0008':'aso-nakadake-crater','43-P0017':'yamaga-onsen-yachiyoza',
'43-P0020':'amakusa-dolphin-center','43-P0021':'amakusa-five-bridges-matsushima-observatory','43-P0022':'amakusa-christian-museum','43-P0026':'kumagawa-river-cruise-hassenba','43-P0027':'reigando-unganzanji',
'44-P0001':'beppu-hells','44-P0002':'kannawa-onsen-jigoku-mushi-kobo','44-P0004':'beppu-ropeway','44-P0006':'umitamago-aquarium','44-P0008':'jr-oita-city','44-P0009':'oita-prefectural-art-museum-opam','44-P0013':'kokonoe-yume-grand-suspension-bridge',
'44-P0015':'tadewara-wetlands-chojabaru','44-P0016':'nagayu-onsen-ramune-onsen','44-P0021':'fukiji','44-P0022':'kitsuki-castle-town','44-P0023':'bungotakada-showa-no-machi','44-P0024':'mameda-machi','44-P0027':'aonodomon-yabakei',
'45-P0001':'aoshima','45-P0003':'horikiri-pass-michinoeki-phoenix','45-P0005':'nishitachi-tachibana-dori','45-P0007':'sun-messe-nichinan','45-P0009':'michinoeki-nango-jacaranda','45-P0011':'takachiho-gorge-manai-falls',
'45-P0013':'amanoiwato-shrine-west-shrine','45-P0015':'kunimigaoka','45-P0016':'umagase','45-P0017':'sea-cross','45-P0018':'omi-shrine','45-P0020':'aya-teruha-suspension-bridge','45-P0024':'takachiho-farm',
'46-P0002':'sakurajima-lava-nagisa-park-footbath','46-P0004':'shiroyama-observatory','46-P0005':'tenmonkan','46-P0006':'ioworld-kagoshima-aquarium','46-P0007':'sand-bath-hall-saraku','46-P0008':'cape-nagasakibana','46-P0009':'lake-ikeda',
'46-P0010':'chiran-samurai-residences','46-P0011':'chiran-peace-museum','46-P0013':'kirishima-onsen-market','46-P0016':'izumi-fumoto-samurai-residences','46-P0017':'izumi-crane-observation-center','46-P0020':'cape-sata','46-P0021':'kanoya-rose-garden',
'46-P0023':'shiratani-unsuikyo','46-P0024':'jomon-sugi','46-P0025':'okono-taki','46-P0026':'yakusugi-land','46-P0028':'tomori-beach','46-P0029':'kinsakubaru-primeval-forest','46-P0030':'kuroshio-no-mori-mangrove-park','46-P0031':'honohoshi-beach',
# Okinawa curated English slugs. Do not derive filenames from the Korean UI label.
'47-P0001':'shurijo-castle-park','47-P0002':'shikinaen','47-P0003':'kokusai-dori','47-P0004':'makishi-public-market','47-P0005':'tsuboya-yachimun-street',
'47-P0006':'sefa-utaki','47-P0007':'okinawa-world-gyokusendo','47-P0008':'okinawa-peace-memorial-park','47-P0009':'himeyuri-peace-museum','47-P0010':'mihama-american-village',
'47-P0011':'zakimi-castle-ruins','47-P0012':'cape-zanpa','47-P0013':'nakagusuku-castle-ruins','47-P0014':'katsuren-castle-ruins','47-P0015':'kaichu-road',
'47-P0016':'koza-gate-street-eisa-museum','47-P0017':'okinawa-churaumi-aquarium','47-P0018':'bise-fukugi-tree-road','47-P0019':'nakijin-castle-ruins','47-P0020':'kouri-bridge-kouri-island',
'47-P0021':'cape-manzamo','47-P0022':'cape-hedo','47-P0023':'daisekirinzan','47-P0024':'hiji-falls','47-P0025':'furuzamami-beach',
'47-P0026':'aharen-beach','47-P0027':'yonaha-maehama-beach','47-P0028':'irabu-bridge','47-P0029':'higashi-hennazaki','47-P0030':'sunayama-beach',
'47-P0031':'toriike-pond','47-P0032':'kabira-bay','47-P0033':'tamatorizaki-observatory','47-P0034':'taketomi-traditional-village','47-P0035':'pinaisara-falls',
'47-P0036':'yubu-island','47-P0037':'hateruma-nishihama','47-P0038':'euglena-mall-ishigaki-public-market',
}

FOOD_SLUGS={
'11-F0001':'buta-miso-don','11-F0002':'musashino-udon','11-F0003':'miso-potato','11-F0004':'waraji-katsudon','11-F0005':'imokoi','11-F0006':'jelly-fry',
'12-F0001':'katsuura-tantanmen','12-F0002':'narita-unagi','12-F0003':'namero','12-F0004':'peanut-monaka','12-F0005':'boiled-peanuts','12-F0006':'futomaki-matsuri-zushi',
'13-F0001':'kanda-soba','13-F0002':'tempura-soba','13-F0003':'tororo-soba','13-F0004':'tokyo-sayama-tea-dessert','13-F0005':'tonkatsu-tempura-ramen','13-F0006':'ramen-donburi','13-F0007':'menchi-katsu','13-F0008':'monjayaki','13-F0009':'soba','13-F0010':'soba-tempura','13-F0011':'soba-tempura','13-F0012':'sushi-tempura','13-F0013':'sushi-soba','13-F0014':'tsukiji-seafood-sushi','13-F0015':'yakitori','13-F0016':'tropical-fruit-dessert','13-F0017':'oshima-milk-ashitaba-snack','13-F0018':'wasabi-soba','13-F0019':'chankonabe','13-F0020':'harajuku-crepe',
'14-F0001':'misaki-tuna','14-F0002':'shonan-shirasu-don','14-F0003':'odawara-kamaboko','14-F0004':'yokosuka-navy-curry','14-F0005':'yokohama-shumai','14-F0006':'yokohama-ie-kei-ramen','14-F0007':'hakone-black-eggs',
'16-F0001':'gokayama-tofu','16-F0002':'kombujime','16-F0003':'takaoka-croquette','16-F0004':'toyama-black-ramen','16-F0005':'masuzushi','16-F0006':'shiroebi','16-F0007':'hotaruika','16-F0008':'himi-buri',
'17-F0001':'kanazawa-oden','17-F0002':'kanazawa-curry','17-F0003':'kaisendon','17-F0004':'gold-leaf-soft-serve','17-F0005':'nodoguro','17-F0006':'wajima-fugu','17-F0007':'jibuni','17-F0008':'hanton-rice',
'18-F0001':'mizu-yokan','18-F0002':'saba-heshiko','18-F0003':'seiko-gani','18-F0004':'sauce-katsudon','18-F0005':'yaki-saba-zushi','18-F0006':'echizen-oroshi-soba','18-F0007':'echizen-gani','18-F0008':'wakasa-beef',
'25-F0001':'biwamasu','25-F0002':'saba-somen','25-F0003':'aka-konnyaku','25-F0004':'omi-champon','25-F0005':'omi-beef','25-F0006':'funazushi',
'26-F0001':'kyo-tsukemono','26-F0002':'nishin-soba','26-F0003':'yatsuhashi','26-F0004':'obanzai','26-F0005':'uji-matcha-dessert','26-F0006':'yudofu',
'27-F0001':'kitsune-udon','27-F0002':'takoyaki','27-F0003':'doteyaki','27-F0004':'butaman','27-F0005':'okonomiyaki','27-F0006':'ikayaki','27-F0007':'kushikatsu',
'28-F0001':'kobe-beef','28-F0002':'banshu-ramen','28-F0003':'awajishima-onion','28-F0004':'akashiyaki','28-F0005':'izushi-sara-soba','28-F0006':'himeji-oden',
'29-F0001':'kakinoha-zushi','29-F0002':'nara-chameshi','29-F0003':'narazuke','29-F0004':'miwa-somen','29-F0005':'yomogi-mochi',
'30-F0001':'katsuura-fresh-tuna','30-F0002':'koyasan-shojin-ryori','30-F0003':'nanko-ume-umeboshi','30-F0004':'mehari-zushi','30-F0005':'arida-mikan','30-F0006':'wakayama-ramen',
'31-F0001':'gyukotsu-ramen','31-F0002':'tottori-wagyu','31-F0003':'tofu-chikuwa','31-F0004':'matsuba-gani','31-F0005':'nijisseiki-pear',
'32-F0001':'genjimaki','32-F0002':'nodoguro','32-F0003':'shimane-wagyu','32-F0004':'shinjiko-shijimi-jiru','32-F0005':'izumo-soba',
'33-F0001':'tsuyama-horumon-udon','33-F0002':'okayama-demi-katsudon','33-F0003':'okayama-barazushi','33-F0004':'okayama-white-peach-shine-muscat','33-F0005':'hinase-kakioko','33-F0006':'hiruzen-yakisoba',
'34-F0001':'kure-navy-curry','34-F0002':'momiji-manju','34-F0003':'setoda-lemon','34-F0004':'anago-meshi','34-F0005':'onomichi-ramen','34-F0006':'hiroshima-oysters','34-F0007':'hiroshima-okonomiyaki',
'35-F0001':'kawara-soba','35-F0002':'fuku-pufferfish','35-F0003':'senzaki-squid','35-F0004':'yamaguchi-uiro','35-F0005':'iwakuni-zushi','35-F0006':'hagi-natsumikan-sweets',
'36-F0001':'naruto-kintoki','36-F0002':'tokushima-ramen','36-F0003':'sudachi','36-F0004':'awa-odori-chicken','36-F0005':'iya-soba','36-F0006':'handa-somen',
'37-F0001':'sanuki-udon','37-F0002':'shodoshima-somen','37-F0003':'shoyu-mame','37-F0004':'olive-beef','37-F0005':'wasanbon','37-F0006':'iriko-dashi','37-F0007':'honetsukidori',
'38-F0001':'matsuyama-tai-meshi','38-F0002':'yawatahama-champon','38-F0003':'ehime-mikan','38-F0004':'uwajima-tai-meshi','38-F0005':'imabari-yakitori','38-F0006':'jakoten',
'39-F0001':'katsuo-no-tataki','39-F0002':'nabeyaki-ramen','39-F0003':'tosa-akaushi','39-F0004':'tosa-jiro','39-F0005':'sawachi-ryori','39-F0006':'shimanto-unagi','39-F0007':'imo-kenpi',
'40-F0001':'goma-saba','40-F0002':'mentaiko','40-F0003':'motsunabe','40-F0004':'mojiko-yaki-curry','40-F0005':'mizutaki','40-F0006':'yanagawa-unagi-seiromushi','40-F0007':'yame-cha','40-F0008':'hakata-ramen',
'41-F0001':'takezaki-gani','41-F0002':'saga-beef','41-F0003':'sicilian-rice','41-F0004':'yobuko-ika-ikizukuri','41-F0005':'ureshino-onsen-yudofu','41-F0006':'ureshino-cha',
'42-F0001':'castella','42-F0002':'goto-udon','42-F0003':'nagasaki-champon','42-F0004':'lemon-steak','42-F0005':'sara-udon','42-F0006':'sasebo-burger','42-F0007':'shippoku-ryori','42-F0008':'iki-beef','42-F0009':'turkish-rice',
'43-F0001':'karashi-renkon','43-F0002':'kumamoto-ramen','43-F0003':'dago-jiru','43-F0004':'basashi','43-F0005':'amakusa-seafood','43-F0006':'aso-akaushi','43-F0007':'ikinari-dango','43-F0008':'taipien','43-F0009':'hitoyoshi-ayu',
'44-F0001':'nakatsu-karaage','44-F0002':'ryukyu','44-F0003':'beppu-reimen','44-F0004':'bungo-beef','44-F0005':'seki-aji-seki-saba','44-F0006':'yaseuma','44-F0007':'jigoku-mushi','44-F0008':'toriten','44-F0009':'hita-yakisoba',
'45-F0001':'nikumaki-onigiri','45-F0002':'miyazaki-karamen','45-F0003':'miyazaki-mango','45-F0004':'miyazaki-beef','45-F0005':'obiten','45-F0006':'cheese-manju','45-F0007':'chicken-nanban','45-F0008':'hyuganatsu','45-F0009':'hiyajiru',
'46-F0001':'kagoshima-ramen','46-F0002':'kagoshima-kurobuta','46-F0003':'karukan','46-F0004':'keihan','46-F0005':'makurazaki-katsuo','46-F0006':'satsuma-age','46-F0007':'shirokuma','46-F0008':'yakushima-tobiuo','46-F0009':'chiran-cha','46-F0010':'kibinago-sashimi',
'47-F0001':'goya-champuru','47-F0002':'rafute','47-F0003':'miyako-soba','47-F0004':'sata-andagi','47-F0005':'yaeyama-soba',
'47-F0006':'okinawa-soba','47-F0007':'umi-budo','47-F0008':'ishigaki-beef','47-F0009':'jimami-tofu','47-F0010':'taco-rice',
}

BRAND_REPLACEMENTS={
'roopuuei':'ropeway','poototawaa':'port-tower','marintawaa':'marine-tower',
'sukaitsurii':'skytree','tawaa':'tower','puraza':'plaza','myuujiamu':'museum',
'biggusaito':'big-sight','joiporisu':'joypolis','dizuniirando':'disneyland',
'dizuniishii':'disneysea','haabaarando':'harborland','gaadenterasu':'garden-terrace',
'arupenruuto':'alpine-route','anderusen':'andersen','shiikyandoru':'sea-candle',
}

def _ascii_slug(text):
    s=str(text or '').lower()
    s=re.sub(r'[^0-9a-z]+','-',s)
    return re.sub(r'-+','-',s).strip('-')

def _collapse_long_vowels(s):
    # pykakasi emits long o/u as ou/oo/uu. Canonical filenames use
    # macron-less conventional spellings: Tokyo, Sensoji, Tojinbo, etc.
    s=re.sub(r'oo','o',s)
    s=re.sub(r'ou','o',s)
    s=re.sub(r'uu','u',s)
    return s

def romanize_japanese(text):
    parts=[]
    for item in _KAKASI.convert(str(text or '')):
        orig=item.get('orig') or ''
        hep=item.get('hepburn') or orig
        if re.fullmatch(r'[\x00-\x7f]+',orig):
            token=orig.lower()
        else:
            token=_collapse_long_vowels(hep.lower())
        parts.append(token)
    s=_ascii_slug('-'.join(parts))
    for src,dst in BRAND_REPLACEMENTS.items():
        s=s.replace(src,dst)
    return _ascii_slug(s)

def query_subject(query):
    tokens=[t for t in re.split(r'\s+',str(query or '').strip()) if t]
    if not tokens:
        return ''
    return tokens[-1]

def place_slug(canonical_id, query):
    if canonical_id in PLACE_OVERRIDES:
        return PLACE_OVERRIDES[canonical_id]
    subject=query_subject(query)
    slug=romanize_japanese(subject)
    if not slug:
        raise KeyError(f'No place slug for {canonical_id}')
    return slug

def food_slug(canonical_id):
    if canonical_id not in FOOD_SLUGS:
        raise KeyError(f'No food slug for {canonical_id}')
    return FOOD_SLUGS[canonical_id]
