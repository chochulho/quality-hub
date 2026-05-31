# APQP 프로세스

**문서번호**: QP-D02  **버전**: {{rev_no}}  **발행일**: {{created_at}}

**회사명**: {{company_name}}  **프로세스 오너**: {{dept_engineering}}

---

## 1. 목적

APQP(Advanced Product Quality Planning)를 통해 신제품·신공정 개발 시 양산 전에 잠재적 문제를 사전 예방하고, 고객 요구사항을 100% 충족하는 제품을 적시에 공급한다.

## 2. 적용 범위

다음 상황에서 APQP를 실시한다:
- 신규 제품 수주 시
- 기존 제품의 설계 변경 (4M 변경 포함)
- 신규 공정 또는 제조 공장 이전
- 고객이 APQP를 명시적으로 요구하는 경우

## 3. APQP 팀 구성

| 역할 | 담당 부서 | 주요 책임 |
|------|---------|---------|
| APQP 팀장 | {{dept_engineering}} | 일정 관리, 고객 소통 창구 |
| 품질 담당 | {{dept_quality}} | PFMEA, Control Plan, MSA |
| 생산 담당 | {{dept_production}} | 공정 설계, 시제품 제작 |
| 구매 담당 | {{dept_purchasing}} | 협력사 APQP, 자재 조달 |
| 영업 담당 | {{dept_sales}} | 고객 요구사항 전달 |

---

## 4. APQP 5단계 상세

### Phase 1: 계획 및 정의 (Plan & Define Program)

**목표**: 고객 요구사항을 이해하고 개발 목표를 설정

**주요 활동**:
1. 고객 도면·사양·CSR 검토
2. 설계 목표 수립 (품질, 신뢰성, 비용, 납기)
3. 초기 BOM(Bill of Materials) 작성
4. 특별특성 초기 목록 작성
5. 팀 실행 가능성 검토 (Feasibility Commitment)

**산출물**:
- 설계 목표서
- 신뢰성 및 품질 목표
- 초기 BOM
- 초기 공정 흐름도

---

### Phase 2: 제품 설계 및 개발 (Product Design & Development)

**목표**: 제품 설계를 완성하고 검증

**주요 활동**:
1. **DFMEA** 작성 (AIAG-VDA 7단계 방법론 적용)
   - 구조 분석 → 기능 분석 → 고장 분석 → 리스크 분석 → 최적화 → 결과 문서화
2. 도면 및 사양서 완성 (GD&T 포함)
3. 특별특성 목록 완성 (고객 승인)
4. **DVP&R** (Design Verification Plan & Report) 수립 및 실시
5. 시제품 제작 및 평가

**산출물**:
- DFMEA (Action Priority 기반 조치 완료)
- 엔지니어링 도면 (승인 버전)
- DVP&R 결과
- 특별특성 목록 (고객 서명)

---

### Phase 3: 공정 설계 및 개발 (Process Design & Development)

**목표**: 제조 공정을 설계하고 문서화

**주요 활동**:
1. **공정 흐름도 (Process Flow Diagram)** 완성
2. **PFMEA** 작성 (AIAG-VDA 7단계 방법론)
3. **Control Plan** 작성 (시제품 단계)
4. 작업지침서(WI) 초안 작성
5. MSA 계획 수립
6. 포카요케 설계 및 검증

**산출물**:
- 공정 흐름도
- PFMEA (AP 기반 조치 완료)
- Control Plan (시제품)
- MSA 계획

---

### Phase 4: 제품 및 공정 유효성 확인 (Product & Process Validation)

**목표**: 대표 양산 조건으로 제품·공정을 최종 검증

**주요 활동**:
1. **MSA 실시** (Gage R&R, Bias, Linearity, Stability)
   - %GR&R ≤ 10% 목표
2. **초기 공정능력 분석** (Production Trial Run)
   - 특별특성: Cpk ≥ 1.67 (또는 고객 기준)
   - 일반특성: Cpk ≥ 1.33
3. **Control Plan** 완성 (양산 단계)
4. 포장 사양 확인
5. **PPAP 패키지** 작성 및 고객 제출

**PPAP 18개 요소 체크리스트**:

| # | 요소 | 필수 여부 |
|---|------|---------|
| 1 | 도면 | ● |
| 2 | 엔지니어링 변경 문서 | ● |
| 3 | 고객 엔지니어링 승인 | ● |
| 4 | DFMEA | ● |
| 5 | 공정 흐름도 | ● |
| 6 | PFMEA | ● |
| 7 | Control Plan | ● |
| 8 | MSA 분석 결과 | ● |
| 9 | 치수 결과 | ● |
| 10 | 재질·성능 시험 결과 | ● |
| 11 | 초기 공정능력 연구 | ● |
| 12 | 공인 실험실 문서 | ● |
| 13 | 외관 승인 보고서(AAR) | ● |
| 14 | 샘플 제품 | ● |
| 15 | 표준 샘플 | ● |
| 16 | 체크 에이드 | ● |
| 17 | 고객 특이 요구사항 | ● |
| 18 | PSW (Part Submission Warrant) | ● |

---

### Phase 5: 피드백·평가·개선 (Feedback, Assessment & Corrective Action)

**목표**: 양산 후 문제점을 반영하여 시스템을 개선

**주요 활동**:
1. 양산 초기 품질 모니터링 (런인 기간: 3~6개월)
2. 고객 피드백 수집 → DFMEA/PFMEA 갱신
3. 교훈 사례집(Lessons Learned) 등록
4. 다음 프로젝트에 Best Practice 반영

---

## 5. APQP 일정 관리

```
[수주] → [Phase1: 1~2주] → [Phase2: 2~4주] → [Phase3: 2~4주] → [Phase4: 2~3주] → [SOP]
```

- APQP 일정은 고객 SOP(Start of Production) 기준 역산하여 수립
- 각 Phase 완료 시 APQP 체크리스트 검토 및 승인

## 6. KPI

| 지표 | 유형 | 산식 | 목표 | 주기 |
|------|------|------|------|------|
| PPAP 1차 승인율 | 효과성 | 1차 승인 / 전체 제출 × 100 | ≥ 90% | 프로젝트별 |
| APQP 일정 준수율 | 효과성 | 일정 내 완료 / 전체 × 100 | ≥ 90% | 프로젝트별 |
| 양산 초기 불량률 | 효율성 | SOP 후 3개월 PPM | ≤ 목표 PPM | 월간 |

## 7. 관련 문서

- QP-D01 설계·개발 프로세스
- QP-D03 PFMEA 관리 프로세스
- AIAG-VDA FMEA Handbook (참조 표준)
- AIAG PPAP 4th Edition (참조 표준)

---

## 개정 이력

| Rev. | 날짜 | 개정 내용 | 작성 | 승인 |
|------|------|---------|------|------|
| 00 | {{created_at}} | 최초 제정 | | |
