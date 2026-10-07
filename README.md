# Jatlas

일본 여행 가이드 정적 웹사이트의 현재 소스 저장소입니다. 실제 서비스 런타임은 `dist/`이며 HTML / CSS / JavaScript + Leaflet으로 동작합니다. 별도 npm 빌드는 필요하지 않습니다.

## 현재 상태

전국 canonical 마이그레이션은 완료되었습니다.

- 도도부현: 47 / 47
- 관광지 canonical ID: 1,138
- 음식 canonical ID: 346
- canonical 사진: 1,484
- canonical 지도 좌표: 1,138
- 현재 사진 QA 대기: 0
- canonical 사진 정본: `dist/photo-registry-data.js` + `dist/images/regions/`
- canonical 지도 정본: `dist/map-canonical-data.js`

과거 권역별 마이그레이션 스크립트·워크플로·완료 보고서는 현재 작업 트리에서 제거했습니다. 필요하면 Git 기록에서 복구할 수 있습니다.

## 실행

```sh
python -m http.server 8000 --directory dist
```

Windows에서 `python` 명령이 없다면 `py -m http.server 8000 --directory dist`를 사용할 수 있습니다. 정적 웹 서버의 웹 루트는 항상 `dist/`입니다.

## 현재 구조

- `dist/index.html`: 사이트 진입점과 런타임 스크립트 로딩 순서
- `dist/style.css`, `dist/national-catalog.css`: 화면 스타일
- `dist/*-expansion.js`, `dist/*-data.js`: 도도부현·지역 콘텐츠 데이터
- `dist/app.js`, `dist/discovery.js`, `dist/journeys.js`, `dist/national-catalog.js`: 주요 화면 기능
- `dist/locale.js`: 공통 UI와 지역/기능 번역을 합친 단일 언어 런타임
- `dist/photo-registry-data.js`: 전국 canonical 사진 경로·출처·SHA-256·revision
- `dist/photo-registry.js`: canonical 사진을 기존 런타임 객체에 적용하는 호환 계층
- `dist/images/regions/<region>/<prefecture>/places|foods/`: canonical 사진 저장 위치
- `dist/map-canonical-data.js`: 전국 관광지 canonical 좌표
- `dist/boundaries/`: 도도부현별 시구정촌 경계 데이터
- `dist/vendor/`: Leaflet 등 로컬 라이브러리
- `audits/`: 현재 검증 상태와 사람이 확인한 QA 기록
- `sources/`: 콘텐츠·사진·지도 출처 조사 자료
- `tools/`: 현재도 사용하는 감사·회귀검사·QA 도구
- `.github/workflows/`: 배포, 중복 관광지 검사, 전국 canonical 검증만 유지
- `AGENTS.md`: 저장소 수정 시 반드시 지켜야 하는 안전 규칙
- `CONTENT-GUIDE.md`: 콘텐츠 작성 규칙

## Canonical ID와 파일명

관광지는 일본 공식 도도부현 코드 + 타입 + 영구 일련번호를 사용합니다. 음식은 `F`, 관광지는 `P`입니다.

- 기후 관광지: `21-P0008`
- 시즈오카 관광지: `22-P0001`
- 아이치 음식: `23-F0007`

파일명은 `{canonicalId}-{english-slug}.webp` 형식입니다. slug에는 장소·음식 이름만 사용하며 촬영일, 원본 파일번호, 사이트명 같은 부가 문자열을 넣지 않습니다.

```text
dist/images/regions/tokai/gifu/places/21-P0008-gujo-hachiman-castle.webp
dist/images/regions/tokai/aichi/foods/23-F0007-hitsumabushi.webp
```

canonical ID는 표시 순서가 아니며 발급 후 재사용하지 않습니다. 기존 숫자형 place ID는 저장 일정과 기존 데이터 호환을 위한 내부 키로 유지합니다.

## 사진 교체

canonical 사진은 새 파일명을 만들지 않고 기존 canonical 경로의 파일 내용을 교체합니다.

1. 최신 `main`과 마지막 정상 GitHub Pages 배포 SHA를 확인합니다.
2. `dist/photo-registry-data.js`에서 canonical ID, 경로, SHA-256, 출처를 확인합니다.
3. 같은 canonical 경로의 WebP를 교체합니다.
4. 같은 커밋에서 `sha256`, 출처 메타데이터, `revision`을 갱신합니다.
5. `tools/content-change-intent.json`에 의도한 변경을 정확히 선언합니다.
6. 회귀검사와 GitHub Pages 배포 성공을 확인합니다.

`-new`, `-final`, `-v2` 같은 교체용 파일명은 만들지 않습니다.

## 언어 데이터

독립적인 언어 패치 파일을 새로 만들지 않습니다. 공통·기능·지역의 별도 번역 패치는 `dist/locale.js`에 통합합니다. 콘텐츠 모듈 자체에서 생성되는 지역 데이터는 기존 `regionalJapanese` 연결 방식을 사용할 수 있지만, 새 `*-locale.js` 파일을 추가하지 않습니다.

## 검증

현재 핵심 검증은 다음입니다.

- `node tools/audit-content.cjs /tmp/jatlas-runtime.json`: 실제 index 로딩 순서 기준 런타임 데이터 감사
- `node tools/test-national-canonical-completion.cjs`: 전국 사진·지도 canonical 완전성 검사
- `node tools/audit-duplicates.cjs`: 중복 관광지 검사
- `node tools/regression-guard.cjs`: 마지막 정상 배포 대비 의도하지 않은 콘텐츠·사진 변경 차단

GitHub Actions에서는 `pages.yml`, `audit-duplicates.yml`, `verify-national-canonical-completion.yml`만 상시 유지합니다.

## 인터넷 연결과 저장

- 상세 지도는 Google Maps iframe을 사용하므로 인터넷 연결이 필요합니다.
- 공식 관광 안내·사진 출처·길찾기 링크도 인터넷 연결이 필요합니다.
- 로컬 이미지, 경계 데이터, JS/CSS 라이브러리는 저장소에 포함됩니다.
- 내 계획·관심 장소·언어 설정은 브라우저 localStorage에 저장됩니다.
- API 키, 비밀번호, Git 인증정보는 저장소에 넣지 않습니다.
