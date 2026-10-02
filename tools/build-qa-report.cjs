/* Rebuild durable QA status from measured results; never infer identity from HTTP success. */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=n=>JSON.parse(fs.readFileSync(path.join(root,'audits',n+'.json'),'utf8'));
const r=read('runtime-inventory'),p=read('photo-audit'),maps=read('map-audit');
const active=r.places.filter(p=>maps[p.id]?.url===p.mapEmbed).map(p=>maps[p.id]);
const statuses=active.reduce((a,m)=>(a[m.status]=(a[m.status]||0)+1,a),{});
const localized=Object.values(read('localized-photos')).filter(x=>!x.error).length;
const rows=r.prefectures.map(x=>`| ${x.pref} | ${x.places} | ${x.foods.length} | ${x.events.length} | ${x.routes.length} | 진행 중 | 진행 중 | 대기 | 대기 |`).join('\n');
fs.writeFileSync(path.join(root,'CONTENT-COVERAGE-AUDIT.md'),`# Jatlas 47도도부현 콘텐츠 및 QA 현황

기준일: 2026-10-02. 실제 index.html 로딩 순서의 런타임 데이터를 집계합니다.

## 제작 상태

**47도도부현 콘텐츠 제작 완료**. 장소 ${r.places.length}개, 음식 ${r.prefectures.reduce((n,x)=>n+x.foods.length,0)}개(현별 등장 횟수), 추천일정 ${r.prefectures.reduce((n,x)=>n+x.routes.length,0)}개가 활성화되어 있습니다. 기존 37현 완료 / 10현 신규 제작 필요 표는 폐기합니다.

제작 완료는 사진·지도·번역·내용 품질이 통과했다는 뜻이 아닙니다. 기존 장소 ID와 저장된 계획의 호환성을 보존합니다.

## 현별 검수 상태

진행 중: 기계 검사 또는 1차 선별을 수행했지만 실제 대상 일치 확인과 수정이 남았습니다. 대기: 전체 범위를 통과시키지 않았습니다. 자동 검사 성공만으로 완료로 바꾸지 않습니다.

| 도도부현 | 장소 | 음식 | 행사 | 일정 | 사진 QA | 지도 QA | 콘텐츠 QA | 최종 QA |
|---|---:|---:|---:|---:|---|---|---|---|
${rows}

상세 결과 및 미해결 항목은 [PHOTO-MAP-QA.md](PHOTO-MAP-QA.md), 재현 가능한 원자료는 audits/에 기록합니다. 다음 작업은 전국 사진·지도 QA를 이어서 수행합니다.
`);
fs.writeFileSync(path.join(root,'PHOTO-MAP-QA.md'),`# 전국 사진·지도 QA

기준일: 2026-10-02. **전수검수 진행 중이며 완료 아님**.

## 이번 반영 범위

- PC 상세 지도, 모바일 상세 지도, 외부 지도 링크의 장소명 우선 검색 규칙 통일. 명시적 좌표 모드만 좌표 우선.
- 광역 지도에 중심 좌표 검색값을 명시해 세계지도로 떨어질 수 있는 URL 보정.
- Commons 원본 파일명을 정확히 대조한 사진 ${localized}개를 로컬 WebP로 저장하고 출처·저작자·라이선스 기록. 이는 사진 내용의 장소 일치 판정과 별개입니다.
- 세로·극단적 비율 사진의 contain 표시, 잘못 매칭된 것으로 선별된 장소 3개 / 음식 6개를 임시 준비 중 처리. 안내문·접근·소요시간은 유지.
- 47현 제작 완료 문서 갱신. 사진/지도/콘텐츠/최종 QA를 분리.

## 측정 결과

사진 검사: ${JSON.stringify(p.summary)}

현재 URL과 일치하는 지도 응답 기록: ${active.length}/${r.places.length}. 상태: ${JSON.stringify(statuses)}.
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
`);
console.log(JSON.stringify({mapResponses:active.length,statuses,localized,photos:p.summary}));
