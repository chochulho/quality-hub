import type { GeneratedDoc, MatrixCell, StandardKey } from '@/types/qmsWizard'

// ─────────────────────────────────────────────
// 표준 조항 × 문서 매트릭스 빌더
// spec: QMS_WIZARD_SPEC_FINAL.md §6
// ─────────────────────────────────────────────
// ISO 9001:2015 와 IATF 16949:2016은 동일한 HLS 조항 번호 체계(4.x~10.x) 공유.
// 향후 ISO 14001/45001 추가 시 STANDARD_CLAUSE_SETS에 해당 조항 목록만 추가.
// ─────────────────────────────────────────────

export interface StandardClause {
  no: string
  title: string
}

// ISO 9001:2015 / IATF 16949:2016 공통 HLS 조항
export const ISO9001_CLAUSES: StandardClause[] = [
  { no: '4.1',  title: '조직과 조직 상황 이해' },
  { no: '4.2',  title: '이해관계자 니즈 이해' },
  { no: '4.3',  title: '적용 범위 결정' },
  { no: '4.4',  title: '품질경영시스템 및 프로세스' },
  { no: '5.1',  title: '리더십과 의지표명' },
  { no: '5.2',  title: '품질방침' },
  { no: '5.3',  title: '조직의 역할·책임·권한' },
  { no: '6.1',  title: '리스크와 기회' },
  { no: '6.2',  title: '품질목표' },
  { no: '7.1',  title: '자원' },
  { no: '7.2',  title: '역량' },
  { no: '7.3',  title: '인식' },
  { no: '7.4',  title: '의사소통' },
  { no: '7.5',  title: '문서화된 정보' },
  { no: '8.1',  title: '운용 기획 및 관리' },
  { no: '8.2',  title: '제품 및 서비스 요구사항' },
  { no: '8.3',  title: '제품 및 서비스 설계·개발' },
  { no: '8.4',  title: '외부 공급 프로세스 관리' },
  { no: '8.5',  title: '생산 및 서비스 제공' },
  { no: '8.6',  title: '제품 및 서비스 불출' },
  { no: '8.7',  title: '부적합 출력물 관리' },
  { no: '9.1',  title: '모니터링·측정·분석·평가' },
  { no: '9.2',  title: '내부심사' },
  { no: '9.3',  title: '경영검토' },
  { no: '10.2', title: '부적합 및 시정조치' },
  { no: '10.3', title: '지속적 개선' },
]

// 향후 ISO 14001/45001 조항 목록 추가 위치
// export const ISO14001_CLAUSES: StandardClause[] = [ ... ]
// export const ISO45001_CLAUSES: StandardClause[] = [ ... ]

// certTarget에 따라 사용할 조항 목록 반환
export function getClausesForTarget(certTarget: StandardKey[]): StandardClause[] {
  // ISO 9001/IATF 16949는 동일한 HLS 조항 공유 → 같은 목록 사용
  if (certTarget.some(k => k === 'ISO9001' || k === 'IATF16949')) {
    return ISO9001_CLAUSES
  }
  return ISO9001_CLAUSES
}

// 생성된 문서 목록 + standardClauses[] 교차해 매트릭스 생성
export function buildMatrix(docs: GeneratedDoc[], certTarget: StandardKey[] = ['ISO9001']): MatrixCell[][] {
  const clauses = getClausesForTarget(certTarget)
  return clauses.map(clause =>
    docs.map(doc => ({
      clauseNo: clause.no,
      docNo: doc.docNo,
      coverage: doc.standardClauses.includes(clause.no)
        ? '✓'
        : doc.standardClauses.some(c => c.startsWith(clause.no.split('.')[0]))
          ? '△'
          : '',
    }))
  )
}

// 커버되지 않는 조항 목록 반환 (UI 경고용)
export function findUncoveredClauses(docs: GeneratedDoc[], certTarget: StandardKey[] = ['ISO9001']): StandardClause[] {
  const clauses = getClausesForTarget(certTarget)
  return clauses.filter(clause =>
    !docs.some(doc =>
      doc.standardClauses.includes(clause.no) ||
      doc.standardClauses.some(c => c.startsWith(clause.no.split('.')[0]))
    )
  )
}
