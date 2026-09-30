# Jatlas 도도부현 콘텐츠 커버리지 감사

최종 감사일: 2026-10-01  
현재 기준 브랜치: `main`  
레거시 복구 기준: `f96041d`의 `dist/regional-data.js`

## 목적
전용 expansion 파일 유무만 보고 기존 데이터를 다시 만드는 중복 작업을 방지하기 위한 기준표입니다.  
현 작업 시작 전 이 문서를 먼저 확인합니다.

## 상태 정의
- **새 구조 완료**: 현재 `main`에서 실제 여행 콘텐츠가 활성화되어 있으며 현별/전용 데이터 구조로 운용 중입니다.
- **기존 데이터 이전 필요**: 과거 완성형 콘텐츠가 존재하지만 현재 새 구조에서는 활성 데이터가 사라졌거나 전용 모듈로 이전되지 않았습니다. 새로 만들지 말고 레거시 데이터를 먼저 복구·비교합니다.
- **신규 제작 필요**: 지도·행정구역 또는 샘플 수준 외에 완성형 여행 콘텐츠를 만든 이력이 확인되지 않았습니다.

## 전체 집계
- 새 구조 완료: **28현**
- 기존 데이터 이전 필요: **7현**
- 신규 제작 필요: **12현**
- 합계: **47도도부현**

## 새 구조 완료 — 28현

| 도도부현 | 현재 주 데이터 모듈 |
|---|---|
| 도쿄 | `tokyo.js / tokyo-complete.js / tokyo-expansion.js` |
| 야마나시 | `yamanashi-data.js / yamanashi.js` |
| 시즈오카 | `shizuoka-expansion.js` |
| 미에 | `mie-expansion.js` |
| 아이치 | `aichi-expansion.js` |
| 시가 | `shiga-hyogo-expansion.js` |
| 교토 | `kyoto-nara-expansion.js` |
| 오사카 | `osaka-data.js / osaka.js` |
| 효고 | `shiga-hyogo-expansion.js` |
| 나라 | `kyoto-nara-expansion.js` |
| 와카야마 | `wakayama-expansion.js` |
| 돗토리 | `tottori-expansion.js` |
| 시마네 | `shimane-expansion.js` |
| 오카야마 | `okayama-expansion.js` |
| 히로시마 | `hiroshima-expansion.js` |
| 야마구치 | `yamaguchi-expansion.js` |
| 도쿠시마 | `tokushima-expansion.js` |
| 가가와 | `kagawa-expansion.js` |
| 에히메 | `ehime-expansion.js` |
| 고치 | `kochi-expansion.js` |
| 후쿠오카 | `fukuoka-expansion.js` |
| 사가 | `saga-expansion.js` |
| 나가사키 | `nagasaki-expansion.js` |
| 구마모토 | `kumamoto-expansion.js` |
| 오이타 | `oita-expansion.js` |
| 미야자키 | `miyazaki-expansion.js` |
| 가고시마 | `kagoshima-expansion.js` |
| 오키나와 | `okinawa-expansion.js` |

## 기존 데이터 이전 필요 — 7현

아래 수치는 레거시 기준 커밋 `f96041d`에서 실제로 확인한 완성 데이터 수입니다.

| 도도부현 | 장소 | 음식 | 행사 | 일정 | 이전 원본 |
|---|---:|---:|---:|---:|---|
| 이바라키 | 16 | 4 | 5 | 10 | `regional-data.js@f96041d` |
| 도치기 | 19 | 4 | 5 | 11 | `regional-data.js@f96041d` |
| 군마 | 16 | 4 | 5 | 10 | `regional-data.js@f96041d` |
| 사이타마 | 20 | 6 | 6 | 10 | `regional-data.js@f96041d` |
| 지바 | 23 | 6 | 9 | 12 | `regional-data.js@f96041d` |
| 가나가와 | 28 | 7 | 9 | 12 | `regional-data.js@f96041d` |
| 기후 | 23 | 5 | 8 | 16 | `regional-data.js@f96041d` |

### 이전 원칙
1. 위 8현은 **처음부터 다시 작성하지 않습니다**.
2. `f96041d`의 해당 현 객체를 추출해 기존 장소 ID, 설명, 음식, 행사, 일정, 사진, 번역을 먼저 보존합니다.
3. 현재 `CONTENT-GUIDE.md` 기준으로 문체·일본어·소요시간·출처·행사 날짜·사진을 재검토합니다.
4. 현재 다른 현과 같은 현별 expansion 구조로 분리합니다.
5. Commons 이미지는 현재 로컬 이미지 워크플로로 이전합니다.
6. 이전 완료 후 이 문서에서 해당 현을 **새 구조 완료**로 이동합니다.

## 신규 제작 필요 — 12현

- 홋카이도
- 아오모리
- 이와테
- 미야기
- 아키타
- 야마가타
- 후쿠시마
- 니가타
- 나가노
- 도야마
- 이시카와
- 후쿠이

이 12현은 완성형 레거시 여행 데이터가 확인되지 않았으므로 현재 기준으로 처음부터 조사·작성합니다.

## 레거시 감사 메모
- 2026-09-29 작업 이력에서 아이치·기후·미에와 북간토·수도권 일부 현은 이미 밀도 재검토, 일본어 현지화, 음식·행사·일정 작업까지 수행되었습니다.
- `f96041d` 시점의 `regional-data.js`에는 사이타마·지바·가나가와·시즈오카·기후·아이치·미에·이바라키·도치기·군마·교토·나라·효고의 완성형 객체가 존재합니다.
- 이후 구조 개편 과정에서 `regional-data.js`가 비워지고 현별 모듈로 순차 이전되었습니다.
- 시즈오카·미에·교토·나라·효고는 현재 새 구조에 다시 포함되어 있으므로 **새 구조 완료**로 분류합니다.
- 아이치는 레거시 완성본을 `aichi-expansion.js`로 이전하고 2026년 행사 일정·일정 참조 오류·사진 경로를 보정했으므로 **새 구조 완료**로 분류합니다. 사이타마·지바·가나가와·이바라키·도치기·군마·기후는 여전히 **기존 데이터 이전 필요** 상태입니다.
- 가나가와의 `kanagawa-audit.js`는 기존 `regionalCatalog`의 가나가와 객체가 있을 때만 보정하는 파일이므로, 현재 빈 `regional-data.js` 상태에서는 단독으로 원본 데이터를 복구하지 못합니다.

## 다음 작업 순서
우선 **기후 → 사이타마 → 지바 → 가나가와 → 이바라키 → 도치기 → 군마** 순으로 레거시 이전을 진행합니다.  
이전 8현을 모두 복구한 뒤 신규 제작 필요 12현으로 넘어갑니다.
