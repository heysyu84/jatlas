# Jatlas

일본 여행 가이드 정적 웹사이트의 현재 소스 저장소입니다. 실제 서비스 런타임은 `dist/`에 있으며 HTML / CSS / JavaScript + Leaflet으로 동작합니다. 별도 npm 빌드는 필요하지 않습니다.

## 실행

```sh
python -m http.server 8000 --directory dist
```

Windows에서 `python` 명령이 없다면 `py -m http.server 8000 --directory dist`를 사용할 수 있습니다. 다른 정적 웹 서버를 사용할 때도 웹 루트는 `dist/`입니다.

## 현재 구조 개편 상태

2026-10-06 기준으로 **도카이(기후·시즈오카·아이치·미에)**와 **도호쿠(아오모리·이와테·미야기·아키타·야마가타·후쿠시마)**의 관광지·음식 사진은 canonical 구조로 이전했습니다. 아직 이전하지 않은 권역은 기존 구조를 유지하며, 전국 이전이 끝날 때까지 구형 이미지 폴더와 override 계층은 호환용으로 보존합니다.

도카이 사진의 정본은 다음 두 요소입니다.

- 이미지 파일: `dist/images/regions/tokai/<prefecture>/places/` 또는 `foods/`
- 사진·출처 등록부: `dist/photo-registry-data.js`
- 런타임 호환 계층: `dist/photo-registry.js`

도카이에서는 `commons/`, `licensed/`, `official/`, `qa/`, `regional/`, `user/` 등에 남아 있는 동일 사진을 더 이상 정본으로 보지 않습니다. 전국 이전 및 역참조 검증이 끝나기 전까지는 삭제하지 않습니다.

## 프로젝트 구조

- `dist/index.html`: 사이트 진입점
- `dist/*.css`, `dist/*.js`: 현재 화면·탐색·지도·번역·장소·음식·행사·일정 런타임
- `dist/photo-registry-data.js`: 이전 완료 권역의 canonical 사진 경로, SHA-256, 출처·이용조건, revision
- `dist/photo-registry.js`: canonical 등록부를 기존 장소·음식·대표사진 런타임에 적용
- `dist/images/regions/`: 새 이미지 구조. `권역/도도부현/places|foods` 순서
- `dist/images/commons|licensed|official|qa|regional|user|...`: 전국 이전이 끝나지 않아 남아 있는 기존 이미지 구조
- `dist/boundaries/`: 도도부현별 시구정촌 경계 데이터
- `dist/vendor/`: 로컬 지도 라이브러리
- `sources/`: 관광 정보·사진·지도 출처와 조사 자료
- `tools/`: 회귀 보호, 사진 생성·정리, 구조 이전·감사 도구
- `audits/`: 검수 결과와 구조 이전 기준표. 사이트 런타임의 정본으로 직접 사용하지 않음
- `scripts/`: 지도·지명 등 전처리 스크립트
- `.github/workflows/`: GitHub Pages 배포와 검증 작업
- `AGENTS.md`: 모든 작업 세션이 따라야 하는 저장소 안전 규칙

JavaScript와 도도부현 데이터의 본격적인 폴더 재배치는 사진·출처의 전국 이전과 미사용 파일 정리가 끝난 뒤 진행합니다.

## Canonical ID와 파일명

관광지는 일본의 공식 도도부현 코드 + 타입 + 영구 일련번호를 사용합니다. 음식은 `F`, 관광지는 `P`를 사용합니다.

- 기후 관광지: `21-P0008`
- 시즈오카 관광지: `22-P0001`
- 아이치 관광지: `23-P0018`
- 미에 관광지: `24-P0014`
- 음식: `21-F0001`

파일명은 `{canonicalId}-{english-slug}.webp` 형식입니다.

```text
dist/images/regions/tokai/gifu/places/21-P0008-gujo-hachiman-castle.webp
dist/images/regions/tokai/aichi/foods/23-F0007-hitsumabushi.webp
```

canonical ID는 표시 순서가 아니며 한 번 발급한 뒤 재사용하지 않습니다. 전국 이전이 끝나기 전까지 기존 숫자 ID는 저장 일정·지도 등의 호환을 위해 함께 유지합니다.

## 사진 교체 방법

이전 완료 권역의 사진은 **새 파일명을 만들지 않고 기존 canonical 경로의 파일 내용을 교체**합니다. `-new`, `-final`, `-v2` 같은 교체용 이름을 만들지 않습니다.

1. 최신 `main`과 마지막 정상 GitHub Pages 배포 SHA를 확인합니다.
2. `dist/photo-registry-data.js`에서 대상 canonical ID와 현재 경로·SHA-256·출처를 확인합니다.
3. 같은 canonical 경로에 새 WebP 파일을 넣습니다.
4. 같은 커밋에서 등록부의 `sha256`, `source`, `terms`, `author`, `userPhoto`를 실제 새 사진에 맞게 수정하고 `revision`을 1 올립니다.
5. `tools/content-change-intent.json`의 `baseCommit`을 마지막 정상 Pages 배포 SHA로 맞추고 `allow.canonicalPhotoChanges`에 canonical ID와 이전/새 이미지 경로·SHA-256·출처·revision을 정확히 기록합니다.
6. 회귀 보호 검사를 통과시킨 뒤 GitHub Pages 배포 성공까지 확인합니다.

canonical 사진은 각 사진의 `revision`을 브라우저 캐시 키로 사용하므로 **교체한 사진만 새로 요청**됩니다. 배포 과정에서도 이미 저장된 사진 파일은 다시 다운로드하지 않습니다.

## 대표사진 규칙

도카이부터 별도의 hero 이미지 복사본을 만들지 않습니다. 페이지를 새로 불러올 때 현재 화면 범위 안에서 `heroEligible` 관광지 사진 하나를 무작위로 고릅니다.

- 현 화면: 그 현의 관광지만 후보
- 권역 화면: 그 권역의 관광지만 후보
- 시·마을 화면: 그 시·마을의 관광지만 후보
- 후보가 1개면 항상 그 1개
- 후보가 0개면 같은 현의 다른 동네 사진을 임의로 가져오지 않음

## 사진·출처 안전 규칙

관광지 카드, 대표사진, 사진 출처, 출처 모음은 이전 완료 권역에서 같은 canonical 등록부를 기준으로 합니다. 사진 파일과 출처를 따로 수정하지 마세요.

`tools/regression-guard.cjs`는 canonical 파일의 실제 SHA-256과 등록부의 SHA-256을 비교하고, 마지막 정상 배포와 비교해 승인되지 않은 사진 내용·출처 변경을 차단합니다. 삭제 관광지 부활 방지와 중복 관광지 검사도 계속 유지됩니다.

구형 사진과 임시 override 파일은 **전국 canonical 이전 → 새 구조 정상 배포 → 전체 역참조 0 확인** 이후 별도 정리 커밋에서 삭제합니다. 파일명이나 수정 날짜만 보고 삭제하지 않습니다.

## 인터넷 연결과 데이터 저장

- 상세 지도는 Google Maps iframe을 사용하므로 인터넷 연결이 필요합니다.
- 공식 관광 안내·사진 출처·길찾기 링크도 인터넷 연결이 필요합니다.
- 사이트의 로컬 이미지, 경계 데이터, JS/CSS 라이브러리는 저장소에 포함됩니다.
- 내 계획·관심 장소·언어 설정은 브라우저 localStorage에 저장됩니다.
- API 키, 비밀번호, Git 인증정보는 저장소에 넣지 않습니다.

## 콘텐츠와 라이선스

사진과 지도 데이터의 출처·이용 조건은 사진 등록부와 사이트 출처 표시를 함께 유지하세요. 제3자 자료는 각 원본의 이용 조건을 따릅니다.
