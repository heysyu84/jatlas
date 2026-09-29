# Japlan boundary build

Distributed with japan-map-selector 0.2.5. Administrative dataset reference date: 2021-01-01; not a claim of current municipal boundaries. Japlan splits files by prefecture, rounds coordinates to five decimals, retains polygon holes, removes Dokdo geometry, and creates a navigation index. No tourist content is added by this dataset. Korean and Japanese display names are supplied by the municipal name index.

# データの出典とライセンス

## 国土数値情報の利用について

このプロジェクトで使用している行政区域データは、国土交通省国土数値情報ダウンロードサービスから提供されたものを加工して作成しています。

### データ出典

- **出典**: 「国土数値情報（行政区域データ）」（国土交通省）
- **URL**: https://nlftp.mlit.go.jp/ksj/index.html
- **利用データ**: 
  - 都道府県データ: N03-21_210101.json（令和3年1月1日時点）
  - 市区町村データ: N03-21_210101.json（令和3年1月1日時点）

### 利用規約

国土数値情報の利用にあたっては、[国土数値情報ダウンロードサービス利用約款](https://nlftp.mlit.go.jp/ksj/other/agreement.html)に従っています。

### 著作権

国土数値情報の著作権は国土交通省に帰属します。

## データの加工について

オリジナルの国土数値情報データに対して、以下の加工を行っています：

1. **フォーマット変換**: シェープファイルからGeoJSON形式への変換
2. **簡略化**: ポリゴンの頂点数を削減し、ファイルサイズを最適化
3. **属性の整理**: 必要な属性のみを抽出し、データ構造を簡素化
4. **座標系の統一**: 世界測地系（WGS84）への統一

### 二次利用について

本プロジェクトで提供する加工済みデータを利用する場合は、以下の点にご注意ください：

1. 国土数値情報の出典を明記すること
2. データの正確性について、国土交通省および本プロジェクトは一切の責任を負いません
3. 商用利用を含む、あらゆる目的での利用が可能です

## その他のデータソース

### smartnews-smri/japan-topography

簡略化されたデータの一部は、[smartnews-smri/japan-topography](https://github.com/smartnews-smri/japan-topography)プロジェクトを参考にしています。

- **ライセンス**: CC0 1.0 Universal
- **URL**: https://github.com/smartnews-smri/japan-topography

## クレジット表示の例

本ライブラリを使用してアプリケーションを作成する場合、以下のようなクレジット表示を推奨します：

```
地図データ：「国土数値情報（行政区域データ）」（国土交通省）を加工して作成
```

または

```html
<footer>
  <p>地図データ：<a href="https://nlftp.mlit.go.jp/ksj/index.html">国土数値情報（行政区域データ）</a>（国土交通省）を加工して作成</p>
</footer>
```
## Korean map names (2026-09-26 update)
All 1,896 displayed administrative areas have Korean labels keyed by their five-digit JIS code. Readings come from Japan Post kana bundled in jp-zipcode-lookup 0.3.5 (https://github.com/kawanet/jp-zipcode-lookup), transcribed using Hangulize 0.0.9 Japanese rules (https://github.com/sublee/hangulize). Existing reviewed labels take precedence. District prefixes are removed from town readings; city and ward labels are separated. Identical Korean names within Hokkaido have region qualifiers. Historical Hamamatsu ward readings supplement the 2021 boundary layer. This is pronunciation-based localization, not a claim that every label is an officially standardized Korean exonym.

Travel-map scope (2026-09-27): Kuril islands excluded from prefecture silhouettes and municipality layers. Removed municipality IDs 01695–01700, and Habomai island components of Nemuro 01223 (mainland retained). The prior Dokdo exclusion remains. Navigation groups follow Jalan’s 12-region travel grouping; artwork is not copied.
