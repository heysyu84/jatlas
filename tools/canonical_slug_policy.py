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
