# 전국 사진·지도 QA

기준일: 2026-10-02. **전수검수 진행 중이며 완료 아님**.

## 이번 반영 범위

- PC 상세 지도, 모바일 상세 지도, 외부 지도 링크의 장소명 우선 검색 규칙 통일. 명시적 좌표 모드만 좌표 우선.
- 광역 지도에 중심 좌표 검색값을 명시해 세계지도로 떨어질 수 있는 URL 보정.
- Commons 원본 파일명을 정확히 대조한 사진 137개를 로컬 WebP로 저장하고 출처·저작자·라이선스 기록. 이는 사진 내용의 장소 일치 판정과 별개입니다.
- 세로·극단적 비율 사진의 contain 표시, 잘못 매칭된 것으로 선별된 장소 3개 / 음식 6개를 임시 준비 중 처리. 안내문·접근·소요시간은 유지.
- 47현 제작 완료 문서 갱신. 사진/지도/콘텐츠/최종 QA를 분리.

## 측정 결과

사진 검사: {"entries":1506,"uniqueLocalImages":1450,"flags":{"dark":15,"external-image":22,"extreme-ratio":18,"low-resolution":37,"missing-photo":9},"duplicateGroups":20}

현재 URL과 일치하는 지도 응답 기록: 980/1160. 상태: {"entity-result":745,"search-or-area-result":235}.
entity-result는 Google의 장소 응답을 파싱했다는 뜻일 뿐, 의도한 관광지라는 판정이 아닙니다. search-or-area-result는 검색/광역 응답이며 개별 확인 대상입니다. URL 변경 이전 기록은 집계에서 제외합니다.

## 남은 작업

- audits/visual-review.json의 피사체·구도·음식 의심 항목을 공식 출처와 대조하고 사진 교체. 1차 연락사진 검토는 외부 이미지가 빈칸이었던 부분을 포함하지 않습니다.
- 외부 이미지 및 실제 존재하지 않는 Commons 파일명(특히 오카야마) 해결. audits/photo-candidates.json은 검색 후보일 뿐 승인 목록이 아닙니다.
- 준비 중 장소: 1208 우시쿠 대불, 2906 난조인, 3203 구마몬 스퀘어. 음식: 이모니, 오시마 우유·아시타바 간식, 이십세기배, 도사 아카우시, 미즈타키, 요부코 오징어 활어회.
- 도이미사키·알펜루트 대표 구도 재검토. 중복 그룹은 같은 장소/메뉴의 정당한 재사용인지 구별 후 처리.
- 모든 지도 응답의 실제 장소명·주소 대조, 기존 지역 핀 좌표와 거리 불일치 확인. 4912 명칭/설명과 御清水, 4812 와지마 아침시장 운영 장소·설명은 콘텐츠와 함께 재검증.
- 일본어 소개/즐기는 방법에 한국어가 남는 항목, 추천일정 이동거리·대표명소 누락 검토.
- 실브라우저 PC·모바일 시각 회귀, 실제 Google 지도 UI 목적지 확인은 미완료. DOM 테스트는 픽셀 레이아웃 검사가 아닙니다.

## 재현

1. node tools/audit-content.cjs
2. python tools/audit-photos.py (선택: --sheets)
3. python tools/audit-maps.py (기존 URL별 캐시 재사용, 네트워크 필요)
4. node tools/test-map-photo.cjs
5. JATLAS_JSDOM=/absolute/path/to/node_modules/jsdom node tools/test-dom.cjs
6. node tools/build-qa-report.cjs

로컬화 재시도: python tools/localize-qa-photos.py → python tools/build-photo-qa.py → 1, 2, 4, 5, 6 재실행. 실패는 미해결로 남기며 검색 후보를 자동 대체하지 않습니다.
