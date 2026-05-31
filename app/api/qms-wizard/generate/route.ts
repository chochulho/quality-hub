import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import type { WizardState, GeneratedDoc, DocType } from '@/types/qmsWizard'
import { getMatrixTitle } from '@/types/qmsWizard'
import { recommendProcesses } from '@/lib/qms/processRecommender'
import { renderTemplate } from '@/lib/qms/templateEngine'
import { TEMPLATE_META, getTurtleStandardClauses } from '@/lib/qms/templateMeta'
import { generateKpiContent } from '@/lib/qms/kpiGenerator'

const TEMPLATES_DIR = join(process.cwd(), 'content', 'qms-templates')

async function loadTemplate(relativePath: string): Promise<string | null> {
  try {
    return await readFile(join(TEMPLATES_DIR, relativePath), 'utf-8')
  } catch {
    return null
  }
}

// 터틀 다이어그램 내용을 프로세스 문서번호 기반으로 인라인 생성
function generateTurtleContent(sourceDocNo: string, processTitle: string, state: WizardState): string {
  const today = new Date().toISOString().split('T')[0]
  const isIATF = state.certTarget.includes('IATF16949')

  const Q = (key: string) => renderTemplate(`{{${key}}}`, state)
  const TURTLE_DATA: Record<string, { input: string; output: string; who: string; withWhat: string; how: string; measure: string }> = {
    // ── HLS 공통 ────────────────────────────────────────────────────────
    'QP-MR01': { input: '각 부서 성과 자료, 전회 조치 현황, 리스크·기회', output: '경영검토 회의록, 조치 계획, 자원 투입 결정', who: `최고경영자, 각 부서장`, withWhat: 'KPI-001, 보고서 양식', how: `QP-MR01, ${state.certTarget.join('/')} 9.3.2 입력 항목`, measure: '실시율 100%, 조치 완결율 ≥90%' },
    'QP-A01':  { input: '연간 심사 계획, 전회 NCR, 체크리스트', output: '심사 보고서, NCR 목록, 시정 조치 요청서', who: `${Q('dept_quality')} 내부심사원`, withWhat: '체크리스트, 심사 기록지', how: `${state.certTarget.join('/')} 요건, QP-A01, 인터뷰·기록 검토`, measure: '심사 실시율 100%, NCR 완료율 ≥95%' },
    'QP-CA01': { input: '내부 부적합, 고객 클레임, 심사 NCR', output: '완결 NCR, 갱신 문서, 수평 전개 결과', who: `${Q('dept_quality')}, 해당 부서`, withWhat: '5-Why, Fish-bone, 분석 도구', how: 'QP-CA01, 8D', measure: '기한 내 완료율 ≥95%, 재발률 ≤5%' },
    'QP-DC01': { input: '문서 작성·개정 요청, 고객 도면·규격', output: '승인된 문서, 개정 이력, 배포 완료 기록', who: `${Q('dept_quality')}, 문서 오너`, withWhat: '문서 대장, 서명 절차', how: 'QP-DC01, 문서 번호 체계', measure: '구버전 현장 적발 0건, 대장 갱신 적시성 100%' },
    // ── ISO 9001 기반 ───────────────────────────────────────────────────
    'QP-C01':  { input: '고객 불만·클레임·반품 접수', output: '8D 리포트, 시정 조치 결과, 완결 보고서', who: `${Q('dept_sales')}, ${Q('dept_quality')}`, withWhat: '고객 소통 채널(이메일·전화), CRM', how: '8D 방법론, 5-Why, 특성요인도, QP-C01', measure: '재발률 0건, 48h 응답율 100%, 평균 처리 ≤10일' },
    'QP-HR01': { input: '역량 요건, 교육 요청, 신규 입사자', output: '교육 기록부, 역량 평가 결과, 자격 증빙', who: `${Q('dept_hr')}, 각 부서장`, withWhat: '교육 자료, 평가지', how: 'QP-HR01, 역량 매트릭스', measure: '교육 계획 이행률 ≥95%, 역량 충족률 100%' },
    // ── 규모별 추가 ─────────────────────────────────────────────────────
    'QP-PO01': { input: '구매 요청서, 자재 소요 계획, 승인 공급자 목록', output: '발주서, 수입검사 성적서, 공급자 성과 기록', who: `${Q('dept_purchasing')}, ${Q('dept_quality')}`, withWhat: 'ERP·구매 시스템, 공급자 평가 양식', how: 'QP-PO01, 공급자 평가 기준', measure: '공급자 납기 준수율 ≥95%, 수입 불합격률 ≤1%' },
    'QP-PM01': { input: '설비 점검 계획, 계측기 교정 일정', output: '점검 기록부, 교정 성적서, 부적합 설비·계측기 격리 기록', who: `${Q('dept_production')}, ${Q('dept_quality')}`, withWhat: '설비 대장, 계측기 대장, 교정 기준기', how: 'QP-PM01, 예방보전 기준', measure: '계획 PM 이행률 ≥95%, 교정 준수율 100%' },
    'QP-PU01': { input: '구매 요청서, 승인 공급자 목록', output: '발주서, 공급자 성과 평가 기록', who: `${Q('dept_purchasing')}`, withWhat: 'ERP, 공급자 평가 양식', how: 'QP-PU01', measure: '공급자 납기 준수율 ≥95%, 발주 처리 소요 ≤3일' },
    'QP-OUT1': { input: '외주 작업 지시서, 외주 사양·도면', output: '외주 완료 보고서, 수입검사 기록', who: `${Q('dept_purchasing')}, ${Q('dept_quality')}`, withWhat: '외주 계약서, 검사 기준서', how: 'QP-OUT1', measure: '외주품 불합격률 ≤2%, 납기 준수율 ≥95%' },
    'QP-EQ01': { input: '설비 점검 계획, 예방보전(PM) 일정', output: '점검 기록부, 고장 기록, PM 완료 보고서', who: `${Q('dept_production')}`, withWhat: '설비 대장, 점검 체크리스트, 공구', how: 'QP-EQ01, 예방보전 기준', measure: '설비 OEE ≥85%, 계획 PM 이행률 ≥95%' },
    'QP-MS01': { input: '계측기 대장, 교정 일정', output: '교정 성적서, 부적합 계측기 격리·처리 기록', who: `${Q('dept_quality')}`, withWhat: '표준 교정 기준기, 계측기 대장', how: 'QP-MS01, MSA 기준', measure: '교정 준수율 100%, 계측기 사용 가능률 ≥98%' },
    'QP-PR01': { input: '고객 수요 계획, 재고 현황, 생산 능력', output: '생산 계획서, 자재 소요 계획(MRP), 작업 지시서', who: `${Q('dept_production')}, ${Q('dept_sales')}`, withWhat: 'ERP·MES, SCM 시스템', how: 'QP-PR01', measure: '생산 계획 달성률 ≥98%, 납기 준수율 ≥95%' },
    'QP-WH01': { input: '입고 지시서, 출하 지시서, 재고 기준', output: '입출고 기록, 재고 실사 결과, 출하 검사 합격 기록', who: `${Q('dept_production')}`, withWhat: 'WMS, 바코드 스캐너, FIFO 기준', how: 'QP-WH01', measure: '재고 정확도 ≥99%, 오배송률 0%' },
    // ── 범위별 추가 ─────────────────────────────────────────────────────
    'QP-D01':  { input: '고객 요구사항, 제품 사양, 법적·규제 요건', output: '설계 출력물(도면·BOM·사양서), 설계 검증·유효성확인 기록', who: `${Q('dept_engineering')}`, withWhat: 'CAD, DVP&R, 시험 설비', how: 'QP-D01, ISO 9001 8.3', measure: '설계 검증 초도 합격률 ≥90%, 설계 변경 건수 추세 관리' },
    'QP-D02':  { input: '고객 SOW, 프로그램 타임라인, 고객 특별 특성', output: 'APQP 5문서, PPAP 패키지, 게이트 리뷰 기록', who: `${Q('dept_engineering')}, ${Q('dept_quality')}, ${Q('dept_production')}`, withWhat: 'AIAG APQP 매뉴얼, PFMEA 소프트웨어', how: 'QP-D02, APQP 5단계, IATF 8.1', measure: '게이트 리뷰 통과율 100%, PPAP 승인률 ≥95%' },
    'QP-D03':  { input: '공정 흐름도, 고객 특별 특성, 설계 FMEA', output: 'PFMEA 문서, Control Plan, 관리 계획 업데이트 기록', who: `${Q('dept_engineering')}, ${Q('dept_quality')}, ${Q('dept_production')}`, withWhat: 'AIAG-VDA FMEA 핸드북, FMEA 소프트웨어', how: 'QP-D03, AIAG-VDA FMEA 방법론', measure: 'AP-H 항목 조치 완결율 100%, PFMEA 최신화율 100%' },
    'QP-D04':  { input: '제품 도면, 고객 요구사항, 공정 흐름도', output: '공정 PFMEA, Control Plan, 작업 표준(WI)', who: `${Q('dept_engineering')}, ${Q('dept_production')}, ${Q('dept_quality')}`, withWhat: 'FMEA 소프트웨어, 공정 흐름도 작성 도구', how: 'QP-D04, IATF 8.3.3', measure: '공정 PFMEA 완성도, AP-H 조치율 100%' },
    'QP-S01':  { input: '공급자 후보 목록, 평가 기준, 공급자 사전 설문', output: '승인 공급자 목록(AVL), 공급자 평가 결과서', who: `${Q('dept_purchasing')}, ${Q('dept_quality')}`, withWhat: '공급자 평가 양식, 현장 감사 체크리스트', how: 'QP-S01', measure: '승인 공급자 성과 점수 ≥80점, 연간 평가 완료율 ≥95%' },
    'QP-S02':  { input: '외주품·구매품 입고, 검사 기준서, 샘플링 계획', output: '수입검사 성적서, 불합격 기록, 특채 승인 기록', who: `${Q('dept_quality')}`, withWhat: '검사 장비, 검사 기준서', how: 'QP-S02, AQL 샘플링', measure: '수입 불합격률 ≤1%, 검사 소요 시간 추세 관리' },
    'QP-CS01': { input: '고객 만족도 조사, A/S 요청, VOC 접수', output: '고객 만족도 결과서, A/S 처리 기록, 개선 사항 보고서', who: `${Q('dept_sales')}, ${Q('dept_quality')}`, withWhat: 'CRM, 만족도 조사 도구, A/S 이력 관리', how: 'QP-CS01', measure: '고객 만족도 ≥80점, A/S 기한 준수율 ≥95%' },
  }

  const data = TURTLE_DATA[sourceDocNo] ?? {
    input: '[입력 정보를 입력하세요]',
    output: '[출력 결과를 입력하세요]',
    who: `${renderTemplate('{{dept_quality}}', state)}, 관련 부서`,
    withWhat: '[설비·자원·시스템]',
    how: `관련 절차서 (${sourceDocNo})`,
    measure: '[KPI 측정 지표]',
  }

  const shortNo = sourceDocNo.replace('QP-', '')
  const auditNote = isIATF
    ? '이 터틀 다이어그램은 IATF 16949 내부심사 공정 심사 시 활용합니다.'
    : '이 터틀 다이어그램은 ISO 9001 내부심사 공정 심사 시 활용합니다.'

  return `# ${processTitle} — 터틀 다이어그램

**문서번호**: TT-${shortNo}  **버전**: Rev.00  **발행일**: ${today}

**회사명**: ${renderTemplate('{{company_name}}', state)}

---

## 프로세스: ${processTitle.replace(' — 터틀 다이어그램', '')}

| 요소 | 내용 |
|------|------|
| **입력 (Input)** | ${data.input} |
| **출력 (Output)** | ${data.output} |
| **인원 (Who)** | ${data.who} |
| **설비·자원 (With What)** | ${data.withWhat} |
| **방법 (How)** | ${data.how} |
| **측정 (Measure)** | ${data.measure} |

---

> ${auditNote}

## 개정 이력

| Rev. | 날짜 | 개정 내용 | 작성 | 승인 |
|------|------|---------|------|------|
| 00 | ${today} | 최초 제정 | | |
`
}

// 표준 조항-문서 매트릭스를 Markdown으로 생성
function generateMatrixContent(docs: GeneratedDoc[], state: WizardState): string {
  const CLAUSES = [
    '4.1','4.2','4.3','4.4','5.1','5.2','5.3','6.1','6.2',
    '7.1','7.2','7.3','7.4','7.5','8.1','8.2','8.3','8.4','8.5','8.6','8.7',
    '9.1','9.2','9.3','10.2','10.3',
  ]

  const today = new Date().toISOString().split('T')[0]
  const title = getMatrixTitle(state.certTarget)
  const nonTurtle = docs.filter(d => d.type !== 'turtle' && d.type !== 'matrix')

  const header = `| 조항 | ${nonTurtle.map(d => d.docNo).join(' | ')} |`
  const divider = `|------|${nonTurtle.map(() => '------').join('|')}|`
  const rows = CLAUSES.map(clause => {
    const cells = nonTurtle.map(doc => {
      const covered = doc.standardClauses.includes(clause)
      const partial = !covered && doc.standardClauses.some(c => c.startsWith(clause.split('.')[0]))
      return covered ? '✓' : partial ? '△' : ''
    })
    return `| **${clause}** | ${cells.join(' | ')} |`
  })

  const uncovered = CLAUSES.filter(clause =>
    !nonTurtle.some(doc =>
      doc.standardClauses.includes(clause) ||
      doc.standardClauses.some(c => c.startsWith(clause.split('.')[0]))
    )
  )

  const warnings = uncovered.length > 0
    ? `\n\n> ⚠️ **미커버 조항**: ${uncovered.join(', ')} — 해당 조항을 커버하는 문서 추가를 검토하세요.`
    : '\n\n> ✓ 모든 주요 표준 조항이 커버됩니다.'

  return `# ${title}

**문서번호**: MTX-001  **버전**: Rev.00  **발행일**: ${today}

**회사명**: ${renderTemplate('{{company_name}}', state)}

---

✓ = 주요 반영 | △ = 부분 반영

${header}
${divider}
${rows.join('\n')}
${warnings}

---

## 개정 이력

| Rev. | 날짜 | 개정 내용 | 작성 | 승인 |
|------|------|---------|------|------|
| 00 | ${today} | 최초 제정 | | |
`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { state: WizardState }
    const { state } = body

    const docEntries = recommendProcesses(state)
    const today = new Date().toISOString().split('T')[0]

    // 1패스: 터틀·매트릭스를 제외한 일반 문서 생성
    const firstPass: GeneratedDoc[] = []

    for (const entry of docEntries) {
      if (entry.type === 'matrix') continue // 2패스에서 처리

      let content: string
      let standardClauses: string[] = []

      if (entry.type === 'turtle') {
        // 터틀 다이어그램 — TURTLE_DATA 기반 인라인 생성
        const sourceNo = 'QP-' + entry.docNo.replace('TT-', '')
        content = generateTurtleContent(sourceNo, entry.title, state)
        standardClauses = getTurtleStandardClauses(sourceNo)
      } else if (entry.type === 'kpi') {
        // KPI — 선택된 프로세스 기반 동적 생성 (파일 불사용)
        const processDocNos = docEntries
          .filter(e => e.type === 'process')
          .map(e => e.docNo)
        content = generateKpiContent(processDocNos, state)
        standardClauses = TEMPLATE_META[entry.docNo]?.standardClauses ?? ['9.1', '6.2']
      } else {
        // 일반 문서 — 템플릿 파일 로드 + 치환
        const meta = TEMPLATE_META[entry.docNo]
        const raw = meta ? await loadTemplate(meta.path) : null

        if (raw) {
          content = renderTemplate(raw, state)
          standardClauses = meta.standardClauses
        } else {
          content = renderTemplate(
            `# ${entry.title}\n\n**문서번호**: ${entry.docNo}  **버전**: {{rev_no}}  **발행일**: {{created_at}}\n\n**회사명**: {{company_name}}\n\n---\n\n[TODO: 이 문서의 내용을 작성하세요]\n\n---\n\n## 개정 이력\n\n| Rev. | 날짜 | 개정 내용 | 작성 | 승인 |\n|------|------|---------|------|------|\n| 00 | {{created_at}} | 최초 제정 | | |\n`,
            state
          )
          standardClauses = TEMPLATE_META[entry.docNo]?.standardClauses ?? []
        }
      }

      firstPass.push({
        docNo:           entry.docNo,
        type:            entry.type as DocType,
        title:           entry.title,
        content,
        version:         'Rev.00',
        createdAt:       today,
        revisedAt:       today,
        revisedBy:       '',
        approvedBy:      '',
        status:          'draft',
        revisionHistory: [],
        standardClauses,
        layer:           entry.layer,
      })
    }

    // 2패스: 매트릭스 생성 (1패스 문서 목록 기반)
    const matrixEntry = docEntries.find(e => e.type === 'matrix')
    if (matrixEntry) {
      firstPass.push({
        docNo:           matrixEntry.docNo,
        type:            'matrix',
        title:           matrixEntry.title,
        content:         generateMatrixContent(firstPass, state),
        version:         'Rev.00',
        createdAt:       today,
        revisedAt:       today,
        revisedBy:       '',
        approvedBy:      '',
        status:          'draft',
        revisionHistory: [],
        standardClauses: ['4.4','7.5'],
        layer:           'iso9001',
      })
    }

    return NextResponse.json({ docs: firstPass })
  } catch (err) {
    console.error('[qms-wizard/generate]', err)
    return NextResponse.json({ error: '문서 생성 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
