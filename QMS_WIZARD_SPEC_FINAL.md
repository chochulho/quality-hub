# QMS 문서체계 마법사 — Claude Code 작업 명세서

> **진입점**: `/learn/qms/documentation` 페이지의 "QMS 문서체계 틀 잡기" 버튼  
> **목적**: 회사 기본 정보를 입력받아 IATF 16949 기반 문서 패키지를 자동 생성·제개정·관리하는 인터랙티브 마법사

---

## 0. 핵심 설계 원칙

### 템플릿 치환 우선, AI 보정 최소화
```
기본 MDX 템플릿 (저장소 보관)
  + {{플레이스홀더}} 치환 (즉시, ~1ms)
  + {{#if scope.xxx}} 조건부 섹션 (즉시)
  + AI 보정 (품질방침·조직 특이사항만, ~10초)
= 완성 문서
```
매번 전체 AI 생성 금지. 템플릿 치환으로 90% 완성 후 필요한 섹션만 AI 보정.

### 문서는 제정/개정 가능한 살아있는 객체
생성 후 편집·버전관리·다운로드까지 one-stop. 조직 변화에 따라 언제든 수정 가능.

---

## 1. 파일 구조

```
app/
└── tools/
    └── qms-wizard/
        ├── page.tsx                      # 마법사 셸 (Step 라우터)
        ├── layout.tsx                    # 전용 레이아웃 (nav 최소화)
        └── components/
            ├── StepIndicator.tsx
            ├── Step1_BasicInfo.tsx
            ├── Step2_Scope.tsx
            ├── Step3_OrgChart.tsx
            ├── Step4_Policy.tsx
            ├── Step5_Preview.tsx         # 문서 목록 + 미리보기
            └── DocumentEditor.tsx        # 제정/개정 에디터

app/
└── qms-library/                          # 생성된 문서 관리 (마법사 완료 후)
    ├── page.tsx                          # 문서 라이브러리 목록
    ├── [docNo]/
    │   ├── page.tsx                      # 문서 상세 (렌더링)
    │   └── edit/page.tsx                 # 문서 편집

lib/
└── qms/
    ├── templateEngine.ts                 # 플레이스홀더 치환 엔진
    ├── docSelector.ts                    # 범위·규모별 문서 목록 결정
    ├── processRecommender.ts             # 프로세스 수 자동 추천
    ├── kpiGenerator.ts                   # KPI 효과성/효율성 쌍 생성
    └── matrixBuilder.ts                  # 조항-문서 매트릭스 생성

content/
└── qms-templates/
    ├── process/                          # 프로세스 맵 MDX
    ├── manual/                           # 품질매뉴얼 MDX
    ├── turtle/                           # 터틀 다이어그램 MDX
    ├── kpi/                              # KPI 요약표 MDX
    ├── procedure/                        # 절차서 MDX
    └── instruction/                      # 지침서 MDX (옵션 B/C만)

types/
└── qmsWizard.ts                          # 전체 타입 정의
```

---

## 2. 전역 타입 정의

```typescript
// types/qmsWizard.ts

export interface WizardState {
  // Step 1
  companyName: string
  industry: 'automotive' | 'electronics' | 'machinery' | 'other'
  employeeCount: 'small' | 'medium' | 'large'   // ≤50 / 51~200 / 200+
  certTarget: ('IATF16949' | 'ISO9001')[]

  // Step 2
  scope: {
    productDesign: boolean
    processDesign: boolean
    manufacturing: boolean
    assembly: boolean
    outsourcing: boolean
    afterSales: boolean
  }

  // Step 3
  departments: Department[]

  // Step 4
  qualityPolicy: string

  // 생성 결과
  generatedDocs: GeneratedDoc[] | null
}

export interface Department {
  id: string
  name: string
  roles: DeptRole[]   // 'management'|'quality'|'production'|'sales'|'engineering'|'purchasing'|'hr'
}

export type DeptRole =
  | 'management' | 'quality' | 'production'
  | 'sales' | 'engineering' | 'purchasing' | 'hr'

export interface GeneratedDoc {
  docNo: string           // 'QP-C01'
  type: DocType
  title: string
  content: string         // Markdown 텍스트 (치환 완료)
  version: string         // 'Rev.00'
  createdAt: string       // ISO date
  revisedAt: string
  revisedBy: string
  approvedBy: string
  status: 'draft' | 'issued' | 'obsolete'
  revisionHistory: RevisionEntry[]
  iatfClause: string[]
}

export type DocType =
  | 'manual' | 'turtle' | 'process' | 'kpi'
  | 'procedure' | 'instruction' | 'matrix' | 'form'

export interface RevisionEntry {
  version: string
  date: string
  description: string
  author: string
  approver: string
}
```

---

## 3. 마법사 5단계 상세 명세

### Step 1 — 회사 기본 정보

| 필드 | 컴포넌트 | 필수 |
|------|----------|------|
| 회사명 | `Input` | ✅ |
| 업종 | `Select` — 자동차 부품 / 전자 부품 / 기계 부품 / 기타 | ✅ |
| 인원 규모 | `RadioGroup` — 50명 이하 / 51~200명 / 200명 초과 | ✅ |
| 인증 목표 | `Checkbox` 복수 선택 | ✅ |

---

### Step 2 — 업무 범위

카드형 체크박스 2열 그리드. 선택 시 Step 5에서 생성 문서 목록이 실시간으로 변동.

| 항목 | 설명 | 추가 문서 |
|------|------|-----------|
| 제품설계 | IATF 8.3 설계개발 | +QP-D01, QP-D02(APQP), DFMEA 절차 |
| 공정설계 | PFMEA, 공정 흐름도 | +QP-D03 |
| 제조 | 생산관리 프로세스 | 기본 포함 |
| 조립 | 작업표준서 추가 | +지침서 옵션 |
| 외주 공정 | 협력사 관리 | +QP-S01, QP-S02 |
| A/S | 고객만족 절차 | +QP-CS01 (QP-C01과 통합 가능) |

---

### Step 3 — 조직 / 업무분장

**UI**:
- 부서 추가 버튼 → 부서명 + 담당 역할(roles) 태그 입력
- "기본 부서 불러오기" 버튼 → 경영진/품질팀/생산팀/개발팀/구매팀/영업팀 기본값 삽입
- dnd-kit 드래그 앤 드롭 정렬

**데이터 사용**:
- `{{dept_quality}}` 등 플레이스홀더 치환 소스
- 터틀 다이어그램 `수행자` 항목 자동 채우기
- 책임/권한 매트릭스 자동 생성

---

### Step 4 — 품질방침

- 자유 입력 Textarea (max 500자)
- "AI 초안 생성" 버튼 → Claude API 호출 (회사명·업종·인증목표 기반)
- 샘플 방침 3개 토글 제공

---

### Step 5 — 문서 패키지 미리보기 & 생성

2열 레이아웃: 왼쪽 문서 목록 / 오른쪽 미리보기 패널

**생성 문서 목록** (규모·범위에 따라 자동 구성 — 섹션 4 참조)

**생성 버튼**:
```
[전체 문서 패키지 생성하기]  ← orange pill CTA
```
- 템플릿 로드 + 치환 → 즉시 문서 목록 렌더링
- AI 보정 필요 항목만 SSE 스트리밍 (품질방침 미입력 시 등)
- 완료 후 다운로드 + 문서 라이브러리 이동 버튼 노출

**다운로드**:
```
[ZIP (.md 전체)]   [Word 패키지 (.docx)]   [→ 문서 라이브러리로]
```

---

## 4. 프로세스 수 자동 추천 로직

```typescript
// lib/qms/processRecommender.ts

export function recommendProcesses(state: WizardState): DocEntry[] {
  // 기본 필수 6개 — 규모·범위 무관
  const always: DocEntry[] = [
    { docNo: 'QP-MR01', title: '경영검토 프로세스',      type: 'process' },
    { docNo: 'QP-A01',  title: '내부심사 프로세스',      type: 'process' },
    { docNo: 'QP-C01',  title: '고객불만 및 시정조치',   type: 'process' },
    { docNo: 'QP-CA01', title: '시정조치 프로세스',      type: 'process' },
    { docNo: 'QP-DC01', title: '문서·기록 관리',        type: 'process' },
    { docNo: 'QP-HR01', title: '인적자원 관리',         type: 'process' },
  ]

  // 규모별 추가
  const bySize: Record<string, DocEntry[]> = {
    small: [
      { docNo: 'QP-PO01', title: '구매 및 외주 관리 (통합)', type: 'process' },
      { docNo: 'QP-PM01', title: '설비·계측기 관리 (통합)',  type: 'process' },
    ],
    medium: [
      { docNo: 'QP-PU01', title: '구매 관리',     type: 'process' },
      { docNo: 'QP-OUT1', title: '외주 관리',     type: 'process' },
      { docNo: 'QP-EQ01', title: '설비 관리',     type: 'process' },
      { docNo: 'QP-MS01', title: '계측기 관리',   type: 'process' },
    ],
    large: [
      // medium 전체 +
      { docNo: 'QP-PR01', title: '생산계획 관리',     type: 'process' },
      { docNo: 'QP-WH01', title: '창고·물류 관리',    type: 'process' },
    ],
  }

  // 범위별 조건부
  const byScope: DocEntry[] = [
    ...(state.scope.productDesign  ? [
      { docNo: 'QP-D01', title: '설계개발 프로세스', type: 'process' },
      { docNo: 'QP-D02', title: 'APQP 프로세스',    type: 'process' },
      { docNo: 'QP-D03', title: 'PFMEA 관리',       type: 'process' },
    ] : []),
    ...(state.scope.outsourcing ? [
      { docNo: 'QP-S01', title: '협력사 평가·관리', type: 'process' },
      { docNo: 'QP-S02', title: '외주품 수입검사',  type: 'process' },
    ] : []),
    ...(state.scope.afterSales  ? [
      { docNo: 'QP-CS01', title: '고객만족·A/S 관리', type: 'process' },
    ] : []),
  ]

  const allProcesses = [
    ...always,
    ...(bySize[state.employeeCount] ?? []),
    ...byScope,
  ]

  // 매뉴얼·터틀·KPI·매트릭스도 함께 반환
  return [
    { docNo: 'QM-001',  title: '품질경영 매뉴얼',       type: 'manual'  },
    ...allProcesses,
    ...generateTurtles(allProcesses),                   // 프로세스마다 터틀 1개
    { docNo: 'KPI-001', title: 'KPI 요약표',             type: 'kpi'     },
    { docNo: 'MTX-001', title: 'IATF 조항-문서 매트릭스', type: 'matrix'  },
    ...recommendInstructions(state),                    // 지침서 옵션
  ]
}
```

---

## 5. KPI 구조 — 효과성 / 효율성 쌍

```typescript
// lib/qms/kpiGenerator.ts

export interface KpiItem {
  processDocNo: stringㄱㄱㄱㄱ
  name: string
  type: 'effectiveness' | 'efficiency'   // ← 반드시 쌍으로 생성
  formula: string
  target: string
  frequency: 'monthly' | 'quarterly' | 'annual'
  owner: string   // dept placeholder
}

// 예시: 고객불만 프로세스 KPI
const QPC01_KPIs: KpiItem[] = [
  // 효과성 — 목표를 달성했는가
  { processDocNo: 'QP-C01', type: 'effectiveness',
    name: '고객불만 재발율',
    formula: '동일 원인 재클레임 건수',
    target: '0건', frequency: 'quarterly', owner: '{{dept_quality}}' },
  { processDocNo: 'QP-C01', type: 'effectiveness',
    name: '8D 초기응답 준수율',
    formula: '48h 이내 회신 / 전체 × 100',
    target: '100%', frequency: 'monthly', owner: '{{dept_sales}}' },

  // 효율성 — 자원 대비 결과
  { processDocNo: 'QP-C01', type: 'efficiency',
    name: '불만 평균 처리 소요일',
    formula: '총 처리 소요일 합계 / 처리 건수',
    target: '≤ 10일', frequency: 'monthly', owner: '{{dept_quality}}' },
  { processDocNo: 'QP-C01', type: 'efficiency',
    name: '8D 1인당 처리 건수',
    formula: '월간 처리 건수 / 품질팀 투입 인원',
    target: '추세 관리', frequency: 'quarterly', owner: '{{dept_quality}}' },
]
```

### KPI-001 요약표 3계층 구조

```
KPI-001 품질목표 및 KPI 요약표
│
├── 1. 경영 레벨 KPI (3~5개)
│   대표이사 보고용. 고객만족도 / 불량률 / 납기준수율 / 매출 대비 품질비용
│
├── 2. 프로세스 레벨 KPI (프로세스별 효과성+효율성 쌍)
│   각 프로세스 오너가 월간/분기 모니터링
│   → 효과성: 목표 달성 여부
│   → 효율성: 투입 자원 대비 산출 (IATF 9.1.1 요건)
│
└── 3. 운영 레벨 KPI (현장 일상 모니터링)
    공정 불량률 / 설비 가동률 / 납기 준수율 (라인별)
```

---

## 6. IATF 조항-문서 매트릭스 (MTX-001)

```typescript
// lib/qms/matrixBuilder.ts

// 행: IATF 16949 주요 조항
// 열: 생성된 문서 목록
// 셀: '●' 주요반영 | '○' 부분반영 | '' 해당없음

export const IATF_CLAUSES = [
  { no: '4.1', title: '조직과 조직 상황 이해' },
  { no: '4.2', title: '이해관계자 니즈 이해' },
  { no: '4.3', title: '적용 범위 결정' },
  { no: '4.4', title: '품질경영시스템 및 프로세스' },
  { no: '5.1', title: '리더십과 의지표명' },
  { no: '5.2', title: '품질방침' },
  { no: '5.3', title: '조직의 역할·책임·권한' },
  { no: '6.1', title: '리스크와 기회' },
  { no: '6.2', title: '품질목표' },
  { no: '7.1', title: '자원' },
  { no: '7.2', title: '역량' },
  { no: '7.3', title: '인식' },
  { no: '7.4', title: '의사소통' },
  { no: '7.5', title: '문서화된 정보' },
  { no: '8.1', title: '운용 기획 및 관리' },
  { no: '8.2', title: '제품 및 서비스 요구사항' },
  { no: '8.3', title: '제품 및 서비스 설계·개발' },
  { no: '8.4', title: '외부 공급 프로세스 관리' },
  { no: '8.5', title: '생산 및 서비스 제공' },
  { no: '8.6', title: '제품 및 서비스 불출' },
  { no: '8.7', title: '부적합 출력물 관리' },
  { no: '9.1', title: '모니터링·측정·분석·평가' },
  { no: '9.2', title: '내부심사' },
  { no: '9.3', title: '경영검토' },
  { no: '10.2', title: '부적합 및 시정조치' },
  { no: '10.3', title: '지속적 개선' },
]

// 매트릭스 자동 빌드: 생성된 문서 목록 + 각 문서의 frontmatter.iatfClause[]를 교차
export function buildMatrix(docs: GeneratedDoc[]): MatrixCell[][] {
  return IATF_CLAUSES.map(clause =>
    docs.map(doc => ({
      clauseNo: clause.no,
      docNo: doc.docNo,
      coverage: doc.iatfClause.includes(clause.no) ? '●'
               : doc.iatfClause.some(c => c.startsWith(clause.no.split('.')[0])) ? '○'
               : ''
    }))
  )
}
```

**빈 조항 경고**: 매트릭스에서 특정 조항의 모든 셀이 공백이면 UI에서 경고 표시.
```
⚠ 조항 8.3 (설계개발)을 커버하는 문서가 없습니다.
   → 업무 범위에서 "제품설계"를 선택하면 QP-D01이 자동 추가됩니다.
```

---

## 7. 지침서 3단계 옵션

```typescript
// lib/qms/processRecommender.ts — recommendInstructions()

export function recommendInstructions(state: WizardState): DocEntry[] {
  const option = getInstructionOption(state)

  if (option === 'A') {
    // 별도 지침서 없음 — 절차서에 작업 방법 섹션 포함
    return []
  }

  if (option === 'B') {
    // 핵심 공정 지침서만 (10개 내외)
    return [
      { docNo: 'QI-P01', title: '수입검사 지침', type: 'instruction' },
      { docNo: 'QI-P02', title: '공정검사 지침', type: 'instruction' },
      { docNo: 'QI-P03', title: '출하검사 지침', type: 'instruction' },
      { docNo: 'QI-E01', title: '설비점검 지침', type: 'instruction' },
      { docNo: 'QI-M01', title: '계측기 교정 지침', type: 'instruction' },
      ...(state.scope.productDesign ? [
        { docNo: 'QI-D01', title: '도면 관리 지침', type: 'instruction' },
      ] : []),
    ]
  }

  if (option === 'C') {
    // 템플릿(빈 양식)만 제공, 내용은 현장 담당자가 채움
    return [
      { docNo: 'QI-TMPL', title: '지침서 표준 양식 (작성 가이드 포함)', type: 'instruction' },
    ]
  }

  return []
}

function getInstructionOption(state: WizardState): 'A' | 'B' | 'C' {
  if (state.employeeCount === 'small' && !state.scope.productDesign) return 'A'
  if (state.employeeCount === 'large') return 'C'
  return 'B'
}
```

**Step 5 UI에서 옵션 선택 가능**:
```
지침서 포함 수준  ○ 미포함 (절차서에 통합)  ● 핵심 공정만  ○ 전체 양식 제공
```
초기값은 `recommendInstructions()`가 추천하되, 사용자가 변경 가능.

---

## 8. 문서 제정 / 개정 시스템

### 8-1. 문서 상태 흐름

```
[초안 draft] → [발행 issued] → [개정 중 draft] → [발행 issued]
                                                ↘ [폐기 obsolete]
```

### 8-2. DocumentEditor 컴포넌트

**경로**: `app/tools/qms-wizard/components/DocumentEditor.tsx`  
**재사용처**: Step 5 미리보기 패널 인라인 편집 + `/qms-library/[docNo]/edit`

```typescript
interface DocumentEditorProps {
  doc: GeneratedDoc
  mode: 'inline' | 'fullpage'
  onSave: (updated: GeneratedDoc) => void
}
```

**기능**:
- MDX 소스 직접 편집 (CodeMirror 또는 간단한 Textarea)
- 미리보기 토글 (편집 ↔ 렌더링)
- 개정 시 다이얼로그:
  ```
  개정 사유 입력: [                    ]
  작성자:        [                    ]
  ※ 저장 시 Rev.00 → Rev.01 자동 증가
  ```
- 저장 시 `revisionHistory` 배열에 항목 추가

### 8-3. RevisionHistory 컴포넌트

문서 상세 페이지 하단에 표시:

```
Rev.  | 개정일     | 개정 내용           | 작성  | 승인
------|------------|---------------------|-------|------
01    | 2026-06-15 | 봉쇄조치 절차 추가  | 홍OO  |
00    | 2026-05-30 | 최초 제정           |       |
```

### 8-4. 저장소 (MVP: localStorage → 이후 Supabase)

```typescript
// lib/qms/docStorage.ts

const STORAGE_KEY = 'qms_library'

export function saveDoc(doc: GeneratedDoc): void {
  const library = loadLibrary()
  const idx = library.findIndex(d => d.docNo === doc.docNo)
  if (idx >= 0) library[idx] = doc
  else library.push(doc)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(library))
}

export function loadLibrary(): GeneratedDoc[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : []
}

export function incrementVersion(current: string): string {
  // 'Rev.00' → 'Rev.01'
  const num = parseInt(current.replace('Rev.', ''), 10)
  return `Rev.${String(num + 1).padStart(2, '0')}`
}
```

---

## 9. 플레이스홀더 전체 목록

### 단순 치환
| 플레이스홀더 | 설명 | 기본값 |
|-------------|------|--------|
| `{{company_name}}` | 회사명 | — |
| `{{created_at}}` | 문서 생성일 | today |
| `{{cert_target}}` | 인증 목표 | IATF 16949 |
| `{{dept_management}}` | 경영진 | 경영진 |
| `{{dept_quality}}` | 품질 부서 | 품질팀 |
| `{{dept_production}}` | 생산 부서 | 생산팀 |
| `{{dept_sales}}` | 영업 부서 | 영업팀 |
| `{{dept_engineering}}` | 개발/설계 부서 | 개발팀 |
| `{{dept_purchasing}}` | 구매 부서 | 구매팀 |
| `{{dept_hr}}` | 인사/총무 부서 | 인사팀 |

### 조건부 섹션
| 구문 | 조건 |
|------|------|
| `{{#if scope.productDesign}}…{{/if}}` | 제품설계 포함 시 |
| `{{#if scope.processDesign}}…{{/if}}` | 공정설계 포함 시 |
| `{{#if scope.outsourcing}}…{{/if}}` | 외주 공정 있을 시 |
| `{{#if scope.afterSales}}…{{/if}}` | A/S 포함 시 |
| `{{#if size.small}}…{{/if}}` | 50명 이하 시 |
| `{{#if size.large}}…{{/if}}` | 200명 초과 시 |

### 치환 엔진 핵심 코드

```typescript
// lib/qms/templateEngine.ts

export function renderTemplate(raw: string, state: WizardState): string {
  let result = raw

  // 1. 단순 치환
  const vars: Record<string, string> = {
    company_name:     state.companyName,
    created_at:       new Date().toISOString().split('T')[0],
    cert_target:      state.certTarget.join(', '),
    dept_management:  getDept(state, 'management', '경영진'),
    dept_quality:     getDept(state, 'quality',    '품질팀'),
    dept_production:  getDept(state, 'production', '생산팀'),
    dept_sales:       getDept(state, 'sales',      '영업팀'),
    dept_engineering: getDept(state, 'engineering','개발팀'),
    dept_purchasing:  getDept(state, 'purchasing', '구매팀'),
    dept_hr:          getDept(state, 'hr',         '인사팀'),
  }
  for (const [k, v] of Object.entries(vars)) {
    result = result.replaceAll(`{{${k}}}`, v)
  }

  // 2. 조건부 섹션
  const condRegex = /\{\{#if ([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g
  result = result.replace(condRegex, (_, cond, content) =>
    evalCond(cond.trim(), state) ? content : ''
  )

  return result
}

function getDept(state: WizardState, role: DeptRole, fallback: string): string {
  return state.departments.find(d => d.roles.includes(role))?.name ?? fallback
}

function evalCond(cond: string, state: WizardState): boolean {
  const parts = cond.split('.')
  let val: unknown = state
  for (const p of parts) {
    val = (val as Record<string, unknown>)?.[p]
  }
  return Boolean(val)
}
```

---

## 10. API Route — 문서 생성

**경로**: `app/api/qms-wizard/generate/route.ts`

```typescript
// POST body
{
  docNo: string,
  state: WizardState
}

// 처리 순서
// 1. 템플릿 파일 로드 (fs.readFile)
// 2. renderTemplate() 치환 → 즉시 완성
// 3. needsAIRefinement() 판단
//    → false: Response.json({ content })
//    → true:  SSE 스트리밍으로 해당 섹션만 AI 보정

// AI 보정 대상 (최소화)
// - 품질방침 미입력 시 자동 생성
// - 조직 구조가 기본 템플릿과 크게 다를 때 (부서 3개 이하 등)
```

**각 docType별 시스템 프롬프트 키워드**:

| docType | 프롬프트 핵심 |
|---------|-------------|
| `manual` | IATF 16949 조항 번호 포함, 5단계 문서 계층 구조 |
| `turtle` | Input/Output/Resources/Competency/KPI/연관프로세스 6항목 표 |
| `process` | SIPOC + 스윔레인 흐름 + 효과성/효율성 KPI 쌍 |
| `kpi` | 경영/프로세스/운영 3계층, 효과성+효율성 필수 쌍 |
| `procedure` | 목적/범위/용어/책임/절차/관련문서 표준 구조 |
| `instruction` | 단계별 작업 방법, 체크포인트, 안전 주의사항 |
| `matrix` | IATF 조항 × 문서 교차표, 빈 조항 경고 포함 |

---

## 11. 문서 라이브러리 페이지 (`/qms-library`)

마법사 완료 후 문서를 지속 관리하는 공간.

### UI 구성
- 상단: 문서 상태 필터 (전체 / 초안 / 발행 / 폐기) + 문서 유형 필터
- 문서 카드 그리드:
  ```
  [QP-C01]  고객불만 및 시정조치
  Rev.01  |  발행  |  2026-06-15
  [미리보기]  [편집]  [다운로드]
  ```
- 우측 사이드바: IATF 조항-문서 매트릭스 요약 (빈 조항 경고 표시)

### 문서 편집 흐름
```
[편집] 클릭
  → DocumentEditor 열림 (fullpage mode)
  → 내용 수정
  → [저장 및 개정] 클릭
     → 개정 사유 입력 다이얼로그
     → version Rev.N → Rev.N+1 자동 증가
     → revisionHistory 업데이트
     → status: 'issued'로 변경
```

---

## 12. 디자인 시스템

```css
--color-orange: #F26B3A;
--color-navy:   #2B4B8C;
```

- **CTA 버튼**: `bg-[#F26B3A] text-white rounded-full px-6 py-3`
- **StepIndicator**: 완료 단계 orange fill, 현재 단계 navy 테두리
- **문서 유형 색상 코딩**:

| 유형 | 색상 |
|------|------|
| 매뉴얼 | navy `#2B4B8C` |
| 터틀 | teal `#1D9E75` |
| 프로세스 | blue `#378ADD` |
| KPI | orange `#F26B3A` |
| 절차서 | green `#639922` |
| 지침서 | gray `#888780` |
| 매트릭스 | purple `#534AB7` |

- **문서 상태 배지**:
  - 초안: `bg-amber-50 text-amber-800`
  - 발행: `bg-green-50 text-green-800`
  - 폐기: `bg-gray-100 text-gray-500 line-through`

---

## 13. MVP 범위 외 (향후 로드맵)

- [ ] Supabase 저장 및 팀원 공유
- [ ] 문서 버전 diff 비교 뷰
- [ ] AuditSay 직접 연동 (생성 프로세스 → 내부심사 체크리스트 자동 생성)
- [ ] APQPManager 연동 (APQP 프로세스 → 프로젝트 생성)
- [ ] PDF 출력 (법적 서식 포함)
- [ ] 다국어 (영문 동시 생성)
- [ ] 조항-문서 매트릭스 갭 분석 리포트

---

## 14. 참고 파일

이미 생성된 MDX 샘플 템플릿:
- `content/qms-templates/process/QP-C01_customer-complaint.mdx`
- `content/qms-templates/process/QP-A01_internal-audit.mdx`

치환 엔진 레퍼런스:
- `TEMPLATE_ENGINE_REFERENCE.md`
