# Jatlas audits

이 폴더는 현재 사이트의 검증 상태와 사람이 확인한 QA 기록만 보관합니다. 완료된 권역별 마이그레이션 실행 기록과 일회성 구조 정리 보고서는 Git 기록으로 이동했으며 작업 트리에서는 제거했습니다.

## canonical 검증 정본

- `id-migration-map.json`: 기존 place/food 식별자와 canonical ID 대응표
- `*-map-canonical-review.json`: 12개 권역의 canonical 지도 완료 상태와 risk flag
- `photo-queue.json`: 현재 사진 QA 대기열
- `photo-audit.json`: 현재/최근 사진 기계 검사 결과
- `map-audit.json`, `map-identity-review.json`: 지도 검수 자료
- `visual-review.json`: 수동 시각 검토 메모
- `dom-regression.json`, `regression-tests.json`: 회귀검사 결과

## 사진 검토 기록

`*photo-review.json` 파일은 현재 사진 선택이 기존 자동 플래그를 해결했는지 판정할 때 `tools/build-photo-queue.py`가 읽습니다. 현재 사진 경로와 일치하는 검토 기록만 유효합니다.

## 출처 별칭

`photo-source-aliases.json`은 과거 Wikimedia 파일명이 다른 canonical 파일명으로 정규화된 경우의 최소 별칭 데이터입니다. 이전의 대형 이미지 마이그레이션 보고서를 대체하며 `tools/build-photo-qa.py`가 사용합니다.

과거 완료 보고서가 필요한 경우 Git history에서 해당 시점의 파일을 조회합니다.
