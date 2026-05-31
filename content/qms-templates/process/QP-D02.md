# APQP 프로세스

**문서번호**: QP-D02  **버전**: {{rev_no}}  **발행일**: {{created_at}}
**회사명**: {{company_name}}  **프로세스 오너**: {{dept_engineering}}

> **적용 표준**: IATF 16949:2016 §8.1 (운용 기획 및 관리), §8.3, §8.3.4.1 (제품 승인 프로세스)  
> **본 문서는 IATF 16949 인증 적용 조직 전용입니다.** ISO 9001 단독 적용 조직은 QP-D01을 참조하십시오.  
> 참조 매뉴얼: AIAG APQP 2nd Edition, AIAG PPAP 4th Edition

---

## 1. 목적

신제품 개발 시 APQP(Advanced Product Quality Planning) 5단계를 체계적으로 적용하여 양산(SOP) 이전에 품질 리스크를 사전 예방하고, PPAP(Part Submission Warrant 포함 18개 요소)를 통해 고객의 공식 양산 승인을 획득한다.

---

## 2. 적용 범위

다음 상황에서 본 APQP 프로세스를 의무 적용한다.

| 적용 사유 | APQP 범위 | 비고 |
|---|---|---|
| 신규 제품 수주 | Phase 1~5 전체 | PPAP Level 고객 확인 |
| 기존 제품 설계 변경 (고객 도면 변경) | Phase 2~4 | Gate 재수행 |
| 4M 변경 (공정·설비·재료·방법) | Phase 3~4 | QP-D04 연계 |
| 고객이 APQP 실시를 명시 요구하는 경우 | Phase 1~5 전체 | 고객 CSR 우선 |
| 신규 제조 공장 이전 또는 라인 이설 | Phase 3~4 | — |

---

## 3. 책임과 권한

| 역할 | 담당 | 주요 책임 |
|---|---|---|
| APQP 팀장(프로그램 관리자) | {{dept_engineering}} | 일정 관리, Gate 체크리스트 주관, 고객 소통 창구 |
| 품질 담당 | {{dept_quality}} | PFMEA·Control Plan·MSA 주관, PPAP 패키지 최종 검토 |
| 생산 담당 | {{dept_production}} | 공정 흐름도·작업지침서 작성, 시험 양산 실시 |
| 구매 담당 | {{dept_purchasing}} | 협력사 APQP 추진, 자재 조달 일정 관리 |
| 영업 담당 | {{dept_sales}} | 고객 요구사항(SOW·CSR) 전달, 고객 승인 일정 조율 |
| 경영 책임자 | {{dept_management}} | APQP 착수 승인, 자원 배분 최종 결정 |

---

## 4. 프로세스 흐름 (SIPOC)

| 구분 | 내용 |
|---|---|
| **Supplier** | 고객(선선자), {{dept_sales}}, {{dept_engineering}}, 협력사 |
| **Input** | 고객 SOW/RFQ/도면, 프로그램 타임라인, 고객 특별 특성 목록, CSR, 법적·규제 요건, 과거 PFMEA·Lessons Learned |
| **Process** | Phase 1. 계획 및 정의 → Phase 2. 제품 설계·개발 → Phase 3. 공정 설계·개발 → Phase 4. 제품·공정 유효성 확인 → Phase 5. 피드백·시정조치·지속개선 |
| **Output** | APQP 5문서(공정 흐름도·PFMEA·Control Plan·MSA·초도 공정능력), PPAP 18개 요소 패키지, PSW(Part Submission Warrant) |
| **Customer** | 고객(선선자), 인증기관, {{dept_production}} |

---

## 5. 세부 절차 (APQP 5 Phases)

### Phase 1. 계획 및 정의 (Plan & Define Program)

**담당**: {{dept_quality}} + {{dept_sales}}  **기한**: 수주 후 2주 이내

1. **프로그램 팀 구성**: 다기능 팀(CFT) 킥오프 미팅 — 품질·개발·생산·구매·영업 전원 참여
2. **Voice of Customer 분석**: 고객 도면·사양서·CSR 검토, 특별 특성 초기 목록 작성
3. **설계 목표 및 신뢰성 목표 수립**: 수명, 내구성, 환경 조건 등
4. **예비 BOM 및 예비 공정 흐름도** 작성
5. **실행 가능성(Feasibility) 검토**: 4M(사람·설비·재료·방법) 관점 — QF-D02-00 체크리스트 활용
6. **APQP 마스터 일정(SOP 역산)** 확정 → {{dept_management}} 승인

> **Gate 0 산출물**: 팀 구성표, 초기 BOM, 예비 공정 흐름도, Feasibility 검토서, APQP 마스터 일정

---

### Phase 2. 제품 설계·개발 (Product Design & Development)

**담당**: {{dept_engineering}} + {{dept_quality}}  **기한**: Gate 0 통과 후 일정에 따라

1. **DFMEA 작성**: AIAG-VDA 4th Edition(2019) 7단계 방법론 — AP(Action Priority) 기반
   - AP-H 항목: 설계 변경 또는 DVP&R 추가 시험으로 반드시 조치
2. **도면 및 사양서 완성**: GD&T 포함, 특별 특성(SC/CC) 고객 협의 후 확정
3. **DVP&R(Design Verification Plan & Report)** 수립 및 실시
4. **시제품 제작** 및 기능·치수 평가
5. **특별 특성 목록** 최종 확정 → 고객 서명 획득

> **Gate 1 체크리스트(QF-D02-01)** 전 항목 충족 시 Phase 3 진행.  
> 미충족 항목이 있는 경우 해당 항목 조치 완료 확인 후 APQP 팀장이 Phase 3 진입 승인.

---

### Phase 3. 공정 설계·개발 (Process Design & Development)

**담당**: {{dept_production}} + {{dept_engineering}} + {{dept_quality}}  **기한**: Gate 1 통과 후 일정에 따라

1. **공정 흐름도(Process Flow Diagram)** 완성
   - 원자재 입고 ~ 출하까지 전 단계 도식화
   - 특별 특성 발생 공정 단계 명시적 표기
2. **PFMEA 작성**: AIAG-VDA 4th Edition 7단계 방법론 (QP-D03 상세 참조)
   - AP(Action Priority): H(High)/M(Medium)/L(Low) 판정
   - AP-H 항목: 공정 설계 변경 또는 감지 방법 추가로 즉시 조치
3. **관리 계획서(Control Plan)** 작성 — 3단계 구성:
   - Prototype Control Plan (시제품 단계)
   - Pre-launch Control Plan (시험 양산 단계)
   - Production Control Plan (양산 단계)
4. **측정시스템 분석(MSA) 계획** 수립: 특별 특성 계측기별 Gage R&R 계획
5. **포카요케 설계 및 검증**: AP-H 공정 단계에 적용
6. **작업지침서(WI) 초안** 작성: 각 공정 단계별 4M 기준

> **Gate 2 체크리스트(QF-D02-02)** 전 항목 충족 시 Phase 4 진행.

---

### Phase 4. 제품·공정 유효성 확인 (Product & Process Validation)

**담당**: 전 부서 협업(CFT)  **기한**: Gate 2 통과 후 ~ SOP 이전 (Gate 3: 양산 시사)

1. **시험 양산(Trial Run / Run-at-Rate)** 실시
   - 대표 양산 조건(설비·작업자·재료·방법): 최소 300 pcs 또는 연속 1시간 이상
2. **MSA(Measurement System Analysis) 실시**
   - Gage R&R(반복성·재현성): **%R&R ≤ 10%** 합격 기준
   - Bias, Linearity, Stability 평가 (특별 특성 계측기 전수)
3. **초기 공정능력 연구(Initial Process Capability Study)**
   - 특별 특성: **Cpk ≥ 1.67** (초기 양산 기준)
   - 일반 특성: **Cpk ≥ 1.33**
   - 미달성 시 → 공정 개선 후 재측정, PFMEA 갱신
4. **PPAP 18개 요소 패키지** 작성 및 고객 제출

| # | PPAP 요소 | 비고 |
|---|---|---|
| 1 | 설계 기록 (도면) | GD&T 포함 |
| 2 | 엔지니어링 변경 문서 | 해당 시 |
| 3 | 고객 엔지니어링 승인 | 해당 시 |
| 4 | DFMEA | AIAG-VDA 4th |
| 5 | 공정 흐름도 | |
| 6 | PFMEA | AIAG-VDA 4th, AP 기반 |
| 7 | Control Plan (양산) | 특별 특성 포함 |
| 8 | MSA 분석 결과 | Gage R&R 포함 |
| 9 | 치수 결과 | 전 치수 측정 |
| 10 | 재질·성능 시험 결과 | 인증 시험소 성적서 |
| 11 | 초기 공정능력 연구 | Cpk 결과표 |
| 12 | 공인 실험실 문서 | ISO/IEC 17025 인정 |
| 13 | 외관 승인 보고서(AAR) | 외관 요건 있을 경우 |
| 14 | 샘플 제품 | 고객 요구 수량 |
| 15 | 표준 샘플 | |
| 16 | 체크 에이드(Check Aid) | 전용 측정 지그 등 |
| 17 | 고객 특이 요구사항(CSR) | |
| 18 | PSW (Part Submission Warrant) | 고객 서명 필수 |

5. **PSW(Part Submission Warrant) 고객 승인 수령** → PPAP 패키지 완료

> **Gate 3 통과 조건**: PSW 고객 서명 수령, 모든 PPAP 요소 고객 Level 요건 충족.

---

### Phase 5. 피드백·시정조치·지속개선 (Feedback, Assessment & Corrective Action)

**담당**: {{dept_quality}}  **기한**: SOP 이후 (초도 양산 강화 관리 기간: 3~6개월)

1. **초도 양산 강화 관리(Enhanced Controls)** 실시: SPC 모니터링 빈도 증가
2. **고객 피드백 수집**: 현장 품질 데이터, 고객 클레임 추적
3. 개선 사항 → **PFMEA·Control Plan 갱신** (QP-D03, QP-D04 연계)
4. **교훈 사례집(Lessons Learned) 등록** → 다음 APQP 프로젝트 반영
5. 양산 Cpk 지속 모니터링: 특별 특성 **Cpk ≥ 1.33** 유지

---

## 6. KPI

| 지표 | 유형 | 산식 | 목표 | 측정 주기 | 담당 |
|---|---|---|---|---|---|
| Gate 리뷰 통과율 | 효과성 | 첫 번째 Gate 통과 건수 / 전체 Gate 수 × 100 | 100% | 프로젝트별 | {{dept_engineering}} |
| PPAP 1차 승인율 | 효과성 | 고객 1차 승인 건수 / 전체 PPAP 제출 건수 × 100 | ≥ 95% | 프로젝트별 | {{dept_quality}} |
| PPAP 제출~승인 소요일 | 효율성 | PSW 승인일 − PPAP 제출일 (영업일 평균) | 추세 감소 관리 | 분기 | {{dept_quality}} |
| 초기 공정능력 달성율 | 효율성 | Cpk ≥ 1.67 달성 SC 수 / 전체 SC 수 × 100 | ≥ 90% | 프로젝트별 | {{dept_quality}} |

---

## 7. 관련 문서 및 양식

| 구분 | 문서번호 | 문서명 |
|---|---|---|
| 연계 절차 | QP-D01 | 설계·개발 프로세스 (ISO 9001 §8.3) |
| 연계 절차 | QP-D03 | PFMEA 관리 프로세스 |
| 연계 절차 | QP-D04 | 공정설계·공정 변경 프로세스 |
| 연계 절차 | QP-DC01 | 문서·기록 관리 프로세스 |
| 양식 | QF-D02-00 | Feasibility 검토 체크리스트 |
| 양식 | QF-D02-01 | Gate 1 체크리스트 (제품 설계 완료) |
| 양식 | QF-D02-02 | Gate 2 체크리스트 (공정 설계 완료) |
| 양식 | QF-D02-03 | Gate 3 체크리스트 (양산 시사 완료) |
| 양식 | QF-D02-04 | APQP 마스터 일정표 |
| 참조 표준 | — | AIAG APQP 2nd Edition |
| 참조 표준 | — | AIAG PPAP 4th Edition |
| 참조 표준 | — | AIAG-VDA FMEA Handbook 2019 (4th Edition) |

---

## 개정 이력

| Rev. | 날짜 | 개정 내용 | 작성 | 검토 | 승인 |
|---|---|---|---|---|---|
| 00 | {{created_at}} | 최초 제정 | | | |
