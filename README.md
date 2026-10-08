# Jatlas

사진으로 장소를 발견하고 지도에서 여행을 이어가는 일본 여행 사이트입니다. 정식 배포 파일은 `dist/`에 있으며 GitHub Pages와 Cloudflare Pages에서 그대로 제공합니다.

현재 데이터에는 47개 도도부현, 관광지 1,155곳, 음식 346개, 온천 안내 66곳이 포함됩니다. 영상 없는 인트로의 마지막까지 스크롤하면 전국 탐색 화면으로 연결됩니다. 탐색과 지도, 실시간 검색, 한국어·일본어, 라이트·다크 모드, 저장과 여행 노트를 한 화면에서 이용합니다.

## 파일 구성

- `app/`, `components/`, `lib/`: 새 홈페이지의 편집 가능한 화면과 기능 소스
- `dist/index.html`, `dist/_next/`: 검사 후 커밋한 정적 배포 파일
- `dist/data/catalog.json`: 기존 관광지와 음식, 코스, 행사, 온천 안내를 통합한 한국어·일본어 콘텐츠
- `dist/data/geography.json`: 분쟁 지역을 제외한 지도 도형
- `dist/photo-registry-data.js`: 사진의 canonical ID, 경로, 출처, SHA-256, revision 정본
- `dist/map-canonical-data.js`: 관광지 좌표 정본
- `dist/images/regions/<region>/<prefecture>/places|foods/`: 사진 저장 위치
- `public/images`, `public/data`, `public/fonts`: 위 정본을 빌드에서 읽는 심볼릭 링크. 사진을 중복 보관하지 않습니다.
- `sources/`: 사진과 콘텐츠의 확인 자료
- `tools/`, `audits/`: 중복·사진·좌표·배포 전후 보존 검사
- `.github/workflows/`: GitHub Pages 배포와 무결성 검사

기존 화면과 구동 코드는 `backup/legacy-ui-20261008` 브랜치에 격리되어 있습니다. 이 백업에는 이미지가 중복 저장되어 있지 않으며 운영 위치의 공용 사진을 참조합니다. 변경 전 전체 기록도 `backup/pre-editorial-site-20261008`과 `backup/pre-launch-snapshot-20261008`에 남아 있습니다.

## 실행과 빌드

정식 배포 파일은 별도 빌드 없이 로컬 서버로 확인할 수 있습니다.

```sh
python -m http.server 8000 --directory dist
```

소스 편집은 Node.js 22.13 이상과 package.json에 지정한 pnpm 버전을 사용합니다.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm build
```

빌드는 정적 파일을 만든 뒤 공유 사진과 데이터를 원래 위치에 유지하며 `dist/`를 갱신합니다. 배포는 커밋된 `dist/`를 사용하므로 운영 서버에 Node.js가 필요하지 않습니다.

## ID와 사진 수정

관광지와 음식의 ID는 공식 도도부현 코드, `P` 또는 `F`, 영구 일련번호로 구성합니다. 예: `21-P0008`, `23-F0007`. 사진 파일명은 `{canonicalId}-{english-slug}.webp`이며 날짜·촬영 번호·교체 버전 접미사를 붙이지 않습니다.

사진을 교체할 때는 기존 경로를 유지하고 `dist/photo-registry-data.js`의 해시·출처·revision과 통합 카탈로그의 사진 정보를 함께 갱신합니다. 기존 콘텐츠나 사진을 의도적으로 변경할 때는 마지막 정상 배포 SHA를 기준으로 `tools/content-change-intent.json`에 대상과 변경 값을 명시합니다.

## 검증과 배포

```sh
node tools/test-national-canonical-completion.cjs
node tools/audit-duplicates.cjs
node tools/regression-guard.cjs
```

검사는 실제 홈페이지가 읽는 카탈로그와 배포된 스크립트를 확인합니다. 기존 버전과의 비교에서는 Git 기록의 구형 런타임도 그대로 평가합니다. 사진 파일, 고정 ID, 지도 좌표, 삭제한 장소, 중복, 승인하지 않은 정보 변경이 검사 대상입니다. GitHub Pages 배포는 이 검사를 통과한 뒤 진행합니다.

정적 자산은 상대 경로로 연결되어 저장소 하위 주소와 도메인 루트에서 모두 동작합니다. 공식 안내, 사진 출처, 날씨, 외부 지도에는 인터넷 연결이 필요합니다. 저장과 여행 노트는 사용자의 브라우저에 보관됩니다.
