import type { WizardState } from '@/types/qmsWizard'
import { renderTemplate } from '@/lib/qms/templateEngine'

// ─────────────────────────────────────────────
// KPI 코드 생성기
// 생성된 프로세스 목록 기반으로 KPI-001 Markdown 동적 생성
// spec: QMS_WIZARD_SPEC_FINAL.md §5
// ─────────────────────────────────────────────

interface KpiRow {
  name: string
  type: '효과성' | '효율성'
  formula: string
  target: string
  frequency: string
  ownerKey: string  // 'dept_quality' | 'dept_production' | 등
}

interface ProcessKpiSection {
  sectionTitle: string
  kpis: KpiRow[]
}

// 프로세스별 KPI 정의 (효과성/효율성 쌍 원칙)
const PROCESS_KPI_DATA: Record<string, ProcessKpiSection> = {
  // ── HLS 공통 ──────────────────────────────────────────────────────
  'QP-MR01': {
    sectionTitle: '경영검토 프로세스 (QP-MR01)',
    kpis: [
      { name: 'Action Item 완료율',       type: '효과성', formula: '기한 내 완료 / 전체 Action × 100', target: '≥ 90%',  frequency: '연간', ownerKey: 'dept_management' },
      { name: '경영검토 소요 시간',         type: '효율성', formula: '실제 소요 시간 (시간)',           target: '추세 관리', frequency: '연간', ownerKey: 'dept_quality' },
    ],
  },
  'QP-A01': {
    sectionTitle: '내부심사 프로세스 (QP-A01)',
    kpis: [
      { name: '심사 계획 이행률',           type: '효과성', formula: '실시 심사 / 계획 심사 × 100',       target: '100%',      frequency: '연간', ownerKey: 'dept_quality' },
      { name: 'NCR 기한 내 완료율',         type: '효과성', formula: '기한 내 완료 NCR / 전체 NCR × 100', target: '≥ 95%',    frequency: '분기', ownerKey: 'dept_quality' },
      { name: '심사 1일당 커버 조항 수',     type: '효율성', formula: '심사 조항 수 / 투입 심사 맨데이',   target: '추세 관리', frequency: '연간', ownerKey: 'dept_quality' },
    ],
  },
  'QP-CA01': {
    sectionTitle: '시정조치 프로세스 (QP-CA01)',
    kpis: [
      { name: '기한 내 완료율',             type: '효과성', formula: '기한 내 완료 / 전체 NCR × 100',   target: '≥ 95%',    frequency: '월간', ownerKey: 'dept_quality' },
      { name: '부적합 재발률',              type: '효과성', formula: '동일 원인 재발 건수',               target: '≤ 5%',     frequency: '분기', ownerKey: 'dept_quality' },
      { name: '평균 처리 소요일',            type: '효율성', formula: '총 소요일 합계 / 처리 건수',        target: '≤ 15일',   frequency: '월간', ownerKey: 'dept_quality' },
    ],
  },
  'QP-DC01': {
    sectionTitle: '문서·기록 관리 (QP-DC01)',
    kpis: [
      { name: '구버전 문서 현장 발견 건수',   type: '효과성', formula: '현장 구버전 발견 건수',             target: '0건',       frequency: '분기', ownerKey: 'dept_quality' },
      { name: '문서 개정 처리 소요일',        type: '효율성', formula: '요청~배포 완료 소요일 평균',         target: '≤ 5일',    frequency: '월간', ownerKey: 'dept_quality' },
    ],
  },
  // ── ISO 9001 기반 ────────────────────────────────────────────────
  'QP-C01': {
    sectionTitle: '고객불만 및 시정조치 (QP-C01)',
    kpis: [
      { name: '고객불만 재발률',             type: '효과성', formula: '동일 원인 재발 건수',               target: '0건',       frequency: '분기', ownerKey: 'dept_quality' },
      { name: '48h 초기응답 준수율',          type: '효과성', formula: '48h 이내 회신 / 전체 × 100',       target: '100%',      frequency: '월간', ownerKey: 'dept_sales' },
      { name: '불만 평균 처리 소요일',        type: '효율성', formula: '총 처리 소요일 / 처리 건수',        target: '≤ 10일',   frequency: '월간', ownerKey: 'dept_quality' },
    ],
  },
  'QP-HR01': {
    sectionTitle: '인적자원 관리 (QP-HR01)',
    kpis: [
      { name: '교육 계획 이행률',            type: '효과성', formula: '실시 교육 / 계획 교육 × 100',       target: '≥ 95%',    frequency: '연간', ownerKey: 'dept_hr' },
      { name: '역량 요건 충족률',            type: '효과성', formula: '역량 충족 인원 / 전체 인원 × 100',  target: '100%',      frequency: '연간', ownerKey: 'dept_hr' },
      { name: '교육 1인당 투자 시간',         type: '효율성', formula: '총 교육 시간 / 교육 인원',           target: '추세 관리', frequency: '연간', ownerKey: 'dept_hr' },
    ],
  },
  // ── 규모별 추가 ──────────────────────────────────────────────────
  'QP-PO01': {
    sectionTitle: '구매 및 외주 관리 (QP-PO01)',
    kpis: [
      { name: '공급자 납기 준수율',           type: '효과성', formula: '납기 내 납품 건 / 전체 × 100',      target: '≥ 95%',    frequency: '월간', ownerKey: 'dept_purchasing' },
      { name: '수입 불합격률',              type: '효과성', formula: '불합격 건수 / 수입검사 건수 × 100',   target: '≤ 1%',     frequency: '월간', ownerKey: 'dept_quality' },
      { name: '구매 리드타임',              type: '효율성', formula: '발주~입고 소요일 평균',               target: '추세 관리', frequency: '월간', ownerKey: 'dept_purchasing' },
    ],
  },
  'QP-PM01': {
    sectionTitle: '설비·계측기 관리 (QP-PM01)',
    kpis: [
      { name: '계획 PM 이행률',             type: '효과성', formula: '실시 PM / 계획 PM × 100',            target: '≥ 95%',    frequency: '월간', ownerKey: 'dept_production' },
      { name: '교정 준수율',               type: '효과성', formula: '기한 내 교정 / 전체 계측기 × 100',    target: '100%',      frequency: '월간', ownerKey: 'dept_quality' },
      { name: '설비 OEE',                  type: '효율성', formula: '가동률 × 성능률 × 양품률',             target: '≥ 85%',    frequency: '주간', ownerKey: 'dept_production' },
    ],
  },
  'QP-PU01': {
    sectionTitle: '구매 관리 (QP-PU01)',
    kpis: [
      { name: '공급자 납기 준수율',           type: '효과성', formula: '납기 내 납품 건 / 전체 × 100',      target: '≥ 95%',    frequency: '월간', ownerKey: 'dept_purchasing' },
      { name: '발주 처리 소요일',            type: '효율성', formula: '요청~발주 완료 소요일 평균',           target: '≤ 3일',    frequency: '월간', ownerKey: 'dept_purchasing' },
    ],
  },
  'QP-OUT1': {
    sectionTitle: '외주 관리 (QP-OUT1)',
    kpis: [
      { name: '외주품 불합격률',             type: '효과성', formula: '불합격 건수 / 수입검사 건수 × 100',   target: '≤ 2%',     frequency: '월간', ownerKey: 'dept_quality' },
      { name: '외주 납기 준수율',            type: '효율성', formula: '납기 내 납품 건 / 전체 × 100',       target: '≥ 95%',    frequency: '월간', ownerKey: 'dept_purchasing' },
    ],
  },
  'QP-EQ01': {
    sectionTitle: '설비 관리 (QP-EQ01)',
    kpis: [
      { name: '계획 PM 이행률',             type: '효과성', formula: '실시 PM / 계획 PM × 100',            target: '≥ 95%',    frequency: '월간', ownerKey: 'dept_production' },
      { name: '돌발 고장 건수',             type: '효과성', formula: '월간 돌발 고장 발생 건수',             target: '전월 대비 감소', frequency: '월간', ownerKey: 'dept_production' },
      { name: '설비 OEE',                  type: '효율성', formula: '가동률 × 성능률 × 양품률',             target: '≥ 85%',    frequency: '주간', ownerKey: 'dept_production' },
    ],
  },
  'QP-MS01': {
    sectionTitle: '계측기 관리 (QP-MS01)',
    kpis: [
      { name: '교정 준수율',               type: '효과성', formula: '기한 내 교정 / 전체 계측기 × 100',    target: '100%',      frequency: '월간', ownerKey: 'dept_quality' },
      { name: '부적합 계측기 사용 적발',     type: '효과성', formula: '현장 부적합 계측기 발견 건수',         target: '0건',       frequency: '분기', ownerKey: 'dept_quality' },
      { name: '계측기 사용 가능률',          type: '효율성', formula: '사용 가능 계측기 / 전체 × 100',       target: '≥ 98%',    frequency: '월간', ownerKey: 'dept_quality' },
    ],
  },
  'QP-PR01': {
    sectionTitle: '생산계획 관리 (QP-PR01)',
    kpis: [
      { name: '생산 계획 달성률',            type: '효과성', formula: '실제 생산량 / 계획 생산량 × 100',     target: '≥ 98%',    frequency: '월간', ownerKey: 'dept_production' },
      { name: '공정 리드타임',              type: '효율성', formula: '투입~출하 소요일 평균',                target: '추세 관리', frequency: '주간', ownerKey: 'dept_production' },
    ],
  },
  'QP-WH01': {
    sectionTitle: '창고·물류 관리 (QP-WH01)',
    kpis: [
      { name: '출하 오배송률',              type: '효과성', formula: '오배송 건수 / 출하 건수 × 100',        target: '0%',        frequency: '월간', ownerKey: 'dept_production' },
      { name: '재고 정확도',               type: '효과성', formula: '실사 일치 품목 / 전체 품목 × 100',     target: '≥ 99%',    frequency: '분기', ownerKey: 'dept_production' },
      { name: '출하 소요 시간',             type: '효율성', formula: '출하 지시~상차 완료 소요 시간 평균',    target: '추세 관리', frequency: '일간', ownerKey: 'dept_production' },
    ],
  },
  // ── 범위별 추가 ──────────────────────────────────────────────────
  'QP-D01': {
    sectionTitle: '설계개발 프로세스 (QP-D01)',
    kpis: [
      { name: '설계 검증 초도 합격률',        type: '효과성', formula: '초도 합격 / 전체 검증 × 100',        target: '≥ 90%',    frequency: '프로젝트당', ownerKey: 'dept_engineering' },
      { name: '설계 변경 건수',             type: '효율성', formula: '프로젝트당 설계 변경 발생 건수',         target: '추세 관리', frequency: '프로젝트당', ownerKey: 'dept_engineering' },
    ],
  },
  'QP-D02': {
    sectionTitle: 'APQP 프로세스 (QP-D02)',
    kpis: [
      { name: '게이트 리뷰 통과율',           type: '효과성', formula: '통과 게이트 / 전체 게이트 × 100',     target: '100%',      frequency: '프로젝트당', ownerKey: 'dept_quality' },
      { name: 'PPAP 승인률',               type: '효과성', formula: '승인 건수 / 제출 건수 × 100',          target: '≥ 95%',    frequency: '프로젝트당', ownerKey: 'dept_quality' },
      { name: 'PPAP 제출~승인 소요일',        type: '효율성', formula: '제출~승인 소요일 평균',                target: '추세 관리', frequency: '프로젝트당', ownerKey: 'dept_quality' },
    ],
  },
  'QP-D03': {
    sectionTitle: 'PFMEA 관리 (QP-D03)',
    kpis: [
      { name: 'AP-H 항목 조치 완결율',        type: '효과성', formula: '조치 완결 AP-H / 전체 AP-H × 100',   target: '100%',      frequency: '분기', ownerKey: 'dept_quality' },
      { name: 'PFMEA 개정 처리 소요일',        type: '효율성', formula: '변경 발생~PFMEA 갱신 완료 소요일',    target: '≤ 5일',    frequency: '분기', ownerKey: 'dept_engineering' },
    ],
  },
  'QP-D04': {
    sectionTitle: '공정설계·PFMEA (QP-D04)',
    kpis: [
      { name: '공정 PFMEA 최신화율',          type: '효과성', formula: '최신화 완료 PFMEA / 전체 × 100',      target: '100%',      frequency: '분기', ownerKey: 'dept_quality' },
      { name: '공정 변경 반영 소요일',         type: '효율성', formula: '공정 변경~PFMEA 반영 소요일 평균',    target: '≤ 7일',    frequency: '분기', ownerKey: 'dept_engineering' },
    ],
  },
  'QP-S01': {
    sectionTitle: '협력사 평가·관리 (QP-S01)',
    kpis: [
      { name: '공급자 성과 점수',             type: '효과성', formula: '공급자 평가 점수 (품질·납기·서비스)',   target: '≥ 80점',   frequency: '분기', ownerKey: 'dept_purchasing' },
      { name: '연간 공급자 평가 완료율',        type: '효율성', formula: '평가 완료 공급자 / 전체 × 100',       target: '≥ 95%',    frequency: '연간', ownerKey: 'dept_purchasing' },
    ],
  },
  'QP-S02': {
    sectionTitle: '외주품 수입검사 (QP-S02)',
    kpis: [
      { name: '수입 불합격률',              type: '효과성', formula: '불합격 건수 / 수입검사 건수 × 100',    target: '≤ 1%',     frequency: '월간', ownerKey: 'dept_quality' },
      { name: '검사 소요 시간',             type: '효율성', formula: '입고~검사 완료 소요 시간 평균',          target: '추세 관리', frequency: '월간', ownerKey: 'dept_quality' },
    ],
  },
  'QP-CS01': {
    sectionTitle: '고객만족·A/S 관리 (QP-CS01)',
    kpis: [
      { name: '고객 만족도',               type: '효과성', formula: '만족도 조사 평균 점수',                 target: '≥ 80점',   frequency: '분기', ownerKey: 'dept_sales' },
      { name: 'A/S 기한 준수율',            type: '효과성', formula: '기한 내 처리 / 전체 A/S × 100',        target: '≥ 95%',    frequency: '월간', ownerKey: 'dept_sales' },
      { name: 'A/S 평균 처리일',            type: '효율성', formula: '접수~완료 소요일 평균',                  target: '≤ 3일',    frequency: '월간', ownerKey: 'dept_quality' },
    ],
  },
}

// ── 공개 API ────────────────────────────────────────────────────────────────

// 선택된 프로세스 목록과 WizardState 기반으로 KPI-001 Markdown 생성
export function generateKpiContent(
  processDocNos: string[],
  state: WizardState,
): string {
  const today = new Date().toISOString().split('T')[0]
  const Q = (key: string) => renderTemplate(`{{${key}}}`, state)

  // 경영 레벨 KPI (항상 포함)
  const mgmtTable = [
    '| 지표 | 산식 | 목표 | 주기 | 담당 |',
    '|------|------|------|------|------|',
    `| 고객 불만 건수 | 월간 접수 건수 (누계) | 전년 대비 감소 | 월간 | ${Q('dept_quality')} |`,
    `| 외부 불량률 (PPM) | 반품 수량 / 출하 수량 × 10⁶ | ≤ 목표 PPM 설정 | 월간 | ${Q('dept_quality')} |`,
    `| 납기 준수율 | 납기 내 납품 건수 / 전체 × 100 | ≥ 95% | 월간 | ${Q('dept_sales')} |`,
    `| 매출 대비 품질 비용 | 품질 비용 / 매출 × 100 | ≤ 3% | 분기 | ${Q('dept_management')} |`,
  ].join('\n')

  // 운영 레벨 KPI (항상 포함)
  const opTable = [
    '| 지표 | 산식 | 목표 | 주기 | 담당 |',
    '|------|------|------|------|------|',
    `| 공정 불량률 (FTQ) | 초도 합격 수량 / 투입 수량 × 100 | ≥ 98% | 일간 | ${Q('dept_production')} |`,
    `| 설비 종합 효율 (OEE) | 가동률 × 성능률 × 양품률 | ≥ 85% | 주간 | ${Q('dept_production')} |`,
    `| 내부 납기 준수율 | 공정 계획 준수 건수 / 전체 × 100 | ≥ 98% | 주간 | ${Q('dept_production')} |`,
  ].join('\n')

  // 프로세스 레벨 KPI (선택된 프로세스만)
  const processSections: string[] = []
  let sectionIdx = 1

  for (const docNo of processDocNos) {
    const section = PROCESS_KPI_DATA[docNo]
    if (!section) continue

    const rows = section.kpis.map(k =>
      `| ${k.name} | ${k.type} | ${k.formula} | ${k.target} | ${k.frequency} | ${Q(k.ownerKey)} |`
    )

    processSections.push([
      `### 3.${sectionIdx} ${section.sectionTitle}`,
      '',
      '| 지표 | 유형 | 산식 | 목표 | 주기 | 담당 |',
      '|------|------|------|------|------|------|',
      ...rows,
    ].join('\n'))
    sectionIdx++
  }

  return [
    `# KPI 성과표 (품질목표 및 성과 모니터링)`,
    ``,
    `**문서번호**: KPI-001  **버전**: Rev.00  **발행일**: ${today}`,
    ``,
    `**회사명**: ${Q('company_name')}  **관리 부서**: ${Q('dept_quality')}`,
    ``,
    `---`,
    ``,
    `## 1. 목적`,
    ``,
    `${Q('company_name')}의 품질경영시스템 성과를 3계층(경영·프로세스·운영)으로 측정·모니터링하여 품질목표 달성 여부를 확인하고 지속적 개선의 근거를 제공한다.`,
    ``,
    `---`,
    ``,
    `## 2. 경영 레벨 KPI (최고경영자 보고용)`,
    ``,
    mgmtTable,
    ``,
    `---`,
    ``,
    `## 3. 프로세스 레벨 KPI`,
    ``,
    processSections.join('\n\n'),
    ``,
    `---`,
    ``,
    `## 4. 운영 레벨 KPI (현장 일상 모니터링)`,
    ``,
    opTable,
    ``,
    `---`,
    ``,
    `## 5. KPI 모니터링 주기 및 보고 체계`,
    ``,
    `\`\`\``,
    `일간/주간 : 현장 담당자 → 부서장`,
    `월간      : 부서장 → ${Q('dept_quality')} 취합 → 경영진 보고`,
    `분기      : KPI 검토 회의 (부서장 이상)`,
    `연간      : 경영검토 (QP-MR01) 에서 전체 KPI 평가`,
    `\`\`\``,
    ``,
    `---`,
    ``,
    `## 개정 이력`,
    ``,
    `| Rev. | 날짜 | 개정 내용 | 작성 | 승인 |`,
    `|------|------|---------|------|------|`,
    `| 00 | ${today} | 최초 제정 | | |`,
  ].join('\n')
}
