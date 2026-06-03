import type { FlowDef } from '@/types/flowchart'

// ─────────────────────────────────────────────────────────────
// QMS 프로세스 문서별 흐름도 정의
// 문서번호(docNo) → FlowDef 매핑
// ─────────────────────────────────────────────────────────────

const FLOWCHARTS: Record<string, FlowDef> = {

  // ── QP-C01: 고객불만 및 시정조치 프로세스 ───────────────────
  'QP-C01': {
    lanes: [
      { id: 'sales',   label: '영업팀',   rowStart: 0, rowEnd: 1,  bgColor: 'rgba(59,130,246,0.07)' },
      { id: 'contain', label: '품질·생산', rowStart: 2, rowEnd: 3,  bgColor: 'rgba(13,148,136,0.07)' },
      { id: 'analyze', label: '품질팀',   rowStart: 4, rowEnd: 7,  bgColor: 'rgba(242,107,58,0.06)' },
      { id: 'close',   label: '완결',     rowStart: 8, rowEnd: 8,  bgColor: 'rgba(22,163,74,0.07)'  },
    ],
    nodes: [
      { id: 'S',       type: 'start',    label: '고객불만 접수',                                          row: 0, col: 0, color: 'white'  },
      { id: 'P1',      type: 'process',  label: 'P1. 불만 접수 및 등록\n접수대장 등록·유형 분류',             row: 1, col: 0, color: 'blue'   },
      { id: 'D1',      type: 'decision', label: '긴급 판단',                                              row: 2, col: 0, color: 'amber'  },
      { id: 'N_MGT',   type: 'note',     label: '경영진 즉시 보고',                                        row: 2, col: 1, color: 'gray'   },
      { id: 'P2',      type: 'process',  label: 'P2. 긴급 봉쇄조치 (D3)\n격리·선별·48h 이내 고객 통보',     row: 3, col: 0, color: 'teal'   },
      { id: 'P3',      type: 'process',  label: 'P3. 근본원인 분석 (D4~D5)\n5-Why · Is/Is Not · 특성요인도', row: 4, col: 0, color: 'orange' },
      { id: 'N_DFMEA', type: 'note',     label: '설계기인\n→ DFMEA 검토*',                                row: 4, col: 1, color: 'gray'   },
      { id: 'P4',      type: 'process',  label: 'P4. 시정조치 실행 (D6)\n공정변경·설비개선·작업표준서 개정',  row: 5, col: 0, color: 'teal'   },
      { id: 'P5',      type: 'process',  label: 'P5. 유효성 검증 (D7)\n동일 불량 재발 모니터링·30일',        row: 6, col: 0, color: 'orange' },
      { id: 'D2',      type: 'decision', label: '검증\n통과?',                                            row: 7, col: 0, color: 'amber'  },
      { id: 'P6',      type: 'process',  label: 'P6. 수평전개 및 종결 (D8)\nFMEA·관리계획서 개정·8D 최종 제출', row: 8, col: 0, color: 'navy' },
      { id: 'E',       type: 'end',      label: '고객 최종 승인 수령\n불만 종결 처리',                       row: 9, col: 0, color: 'white' },
    ],
    edges: [
      { from: 'S',   to: 'P1' },
      { from: 'P1',  to: 'D1' },
      { from: 'D1',  to: 'N_MGT',   label: '긴급',   style: 'dashed' },
      { from: 'D1',  to: 'P2',      label: '만만' },
      { from: 'P2',  to: 'P3' },
      { from: 'P3',  to: 'N_DFMEA', style: 'dashed' },
      { from: 'P3',  to: 'P4' },
      { from: 'P4',  to: 'P5' },
      { from: 'P5',  to: 'D2' },
      { from: 'D2',  to: 'P6',  label: '통과' },
      { from: 'D2',  to: 'P3',  label: '실패', route: 'left-loop' },
      { from: 'P6',  to: 'E' },
    ],
  },

  // ── QP-CA01: 시정조치 프로세스 ─────────────────────────────
  'QP-CA01': {
    lanes: [
      { id: 'q1',   label: '품질팀',  rowStart: 0, rowEnd: 2,  bgColor: 'rgba(242,107,58,0.06)' },
      { id: 'dept', label: '담당부서', rowStart: 3, rowEnd: 5,  bgColor: 'rgba(13,148,136,0.07)' },
      { id: 'q2',   label: '품질팀',  rowStart: 6, rowEnd: 8,  bgColor: 'rgba(242,107,58,0.06)' },
      { id: 'end',  label: '완결',    rowStart: 9, rowEnd: 9,  bgColor: 'rgba(22,163,74,0.07)'  },
    ],
    nodes: [
      { id: 'S',    type: 'start',    label: '부적합 발생·접수',                                              row: 0, col: 0, color: 'white'  },
      { id: 'P1',   type: 'process',  label: 'P1. 접수 및 등록\nNCR 작성·심각도 분류·조치 기한 설정',          row: 1, col: 0, color: 'orange' },
      { id: 'D1',   type: 'decision', label: '심각도\n분류',                                                  row: 2, col: 0, color: 'amber'  },
      { id: 'N_A',  type: 'note',     label: 'A급: 경영진\n즉시 보고',                                        row: 2, col: 1, color: 'gray'   },
      { id: 'P2',   type: 'process',  label: 'P2. 즉각 봉쇄조치\n부적합품 격리·전수 선별·라인 정지 판단',     row: 3, col: 0, color: 'teal'   },
      { id: 'P3',   type: 'process',  label: 'P3. 근본원인 분석\n5-Why · 특성요인도 · Is/Is Not',             row: 4, col: 0, color: 'orange' },
      { id: 'P4',   type: 'process',  label: 'P4. 시정조치 계획·실행\n4M 변경·문서 갱신·교육 실시',           row: 5, col: 0, color: 'teal'   },
      { id: 'P5',   type: 'process',  label: 'P5. 유효성 검증\n재발 여부 30일 (또는 3 Lot) 모니터링',         row: 6, col: 0, color: 'orange' },
      { id: 'D2',   type: 'decision', label: '재발\n없음?',                                                   row: 7, col: 0, color: 'amber'  },
      { id: 'P6',   type: 'process',  label: 'P6. 종결 및 수평전개\nNCR 완결·3년 보관·경영검토 입력',          row: 8, col: 0, color: 'navy'   },
      { id: 'E',    type: 'end',      label: '시정조치 완결',                                                  row: 9, col: 0, color: 'white'  },
    ],
    edges: [
      { from: 'S',  to: 'P1' },
      { from: 'P1', to: 'D1' },
      { from: 'D1', to: 'N_A',  label: 'A급', style: 'dashed' },
      { from: 'D1', to: 'P2' },
      { from: 'P2', to: 'P3' },
      { from: 'P3', to: 'P4' },
      { from: 'P4', to: 'P5' },
      { from: 'P5', to: 'D2' },
      { from: 'D2', to: 'P6',   label: '재발 없음' },
      { from: 'D2', to: 'P3',   label: '재발', route: 'left-loop' },
      { from: 'P6', to: 'E' },
    ],
  },

  // ── QP-A01: 내부심사 프로세스 ──────────────────────────────
  'QP-A01': {
    lanes: [
      { id: 'mgmt',   label: '경영진',    rowStart: 0, rowEnd: 1,  bgColor: 'rgba(43,75,140,0.06)'  },
      { id: 'audit',  label: '심사팀',    rowStart: 2, rowEnd: 4,  bgColor: 'rgba(242,107,58,0.06)' },
      { id: 'dept',   label: '피심사부서', rowStart: 5, rowEnd: 6,  bgColor: 'rgba(13,148,136,0.07)' },
      { id: 'close',  label: '완결',      rowStart: 7, rowEnd: 7,  bgColor: 'rgba(22,163,74,0.07)'  },
    ],
    nodes: [
      { id: 'S',    type: 'start',    label: '심사 계획 수립',                                          row: 0, col: 0, color: 'white'  },
      { id: 'P1',   type: 'process',  label: 'P1. 연간 심사 계획 수립\n심사 범위·일정·심사원 지정',     row: 1, col: 0, color: 'navy'   },
      { id: 'P2',   type: 'process',  label: 'P2. 심사 준비\n체크리스트·심사 통보 (최소 2주 전)',       row: 2, col: 0, color: 'orange' },
      { id: 'P3',   type: 'process',  label: 'P3. 현장 심사 실시\n인터뷰·증거 수집·NCR 초안 작성',     row: 3, col: 0, color: 'orange' },
      { id: 'D1',   type: 'decision', label: 'NCR\n발행?',                                             row: 4, col: 0, color: 'amber'  },
      { id: 'P4',   type: 'process',  label: 'P4. 시정조치 요구\nNCR 발행·피심사 부서 통보',            row: 5, col: 0, color: 'teal'   },
      { id: 'P5',   type: 'process',  label: 'P5. 시정조치 이행\nCA 계획 제출·조치 실행 (QP-CA01 연계)', row: 6, col: 0, color: 'teal'  },
      { id: 'P6',   type: 'process',  label: 'P6. 완결 및 보고\n심사 보고서·경영검토 입력',             row: 7, col: 0, color: 'navy'   },
      { id: 'E',    type: 'end',      label: '심사 완결',                                               row: 8, col: 0, color: 'white'  },
    ],
    edges: [
      { from: 'S',  to: 'P1' },
      { from: 'P1', to: 'P2' },
      { from: 'P2', to: 'P3' },
      { from: 'P3', to: 'D1' },
      { from: 'D1', to: 'P4', label: 'NCR 있음' },
      { from: 'D1', to: 'P6', label: '적합', route: 'left-loop' },
      { from: 'P4', to: 'P5' },
      { from: 'P5', to: 'P6' },
      { from: 'P6', to: 'E'  },
    ],
  },

  // ── QP-DC01: 문서·기록 관리 프로세스 ───────────────────────
  'QP-DC01': {
    lanes: [
      { id: 'create', label: '작성부서', rowStart: 0, rowEnd: 2, bgColor: 'rgba(59,130,246,0.06)'  },
      { id: 'review', label: '검토·승인', rowStart: 3, rowEnd: 4, bgColor: 'rgba(43,75,140,0.06)'  },
      { id: 'manage', label: '품질팀',   rowStart: 5, rowEnd: 7, bgColor: 'rgba(242,107,58,0.06)' },
    ],
    nodes: [
      { id: 'S',    type: 'start',    label: '문서 작성 요청',                                          row: 0, col: 0, color: 'white'  },
      { id: 'P1',   type: 'process',  label: 'P1. 문서 초안 작성\n양식·문서번호 부여·초안 작성',        row: 1, col: 0, color: 'blue'   },
      { id: 'P2',   type: 'process',  label: 'P2. 검토 요청\n관련 부서 검토·의견 반영',                 row: 2, col: 0, color: 'blue'   },
      { id: 'P3',   type: 'process',  label: 'P3. 검토 및 승인\n내용 검토·최고경영자 승인',             row: 3, col: 0, color: 'navy'   },
      { id: 'D1',   type: 'decision', label: '승인\n여부',                                             row: 4, col: 0, color: 'amber'  },
      { id: 'P4',   type: 'process',  label: 'P4. 문서 등록·배포\n문서대장 등록·구 버전 폐기',          row: 5, col: 0, color: 'orange' },
      { id: 'P5',   type: 'process',  label: 'P5. 문서 관리\n정기 검토(1년)·개정 관리',                row: 6, col: 0, color: 'orange' },
      { id: 'P6',   type: 'process',  label: 'P6. 기록 보관\n보관 기간 준수·접근 통제',                row: 7, col: 0, color: 'orange' },
      { id: 'E',    type: 'end',      label: '문서 관리 완결',                                          row: 8, col: 0, color: 'white'  },
    ],
    edges: [
      { from: 'S',  to: 'P1' },
      { from: 'P1', to: 'P2' },
      { from: 'P2', to: 'P3' },
      { from: 'P3', to: 'D1' },
      { from: 'D1', to: 'P4', label: '승인' },
      { from: 'D1', to: 'P1', label: '반려', route: 'left-loop' },
      { from: 'P4', to: 'P5' },
      { from: 'P5', to: 'P6' },
      { from: 'P6', to: 'E'  },
    ],
  },

  // ── QP-MR01: 경영검토 프로세스 ─────────────────────────────
  'QP-MR01': {
    lanes: [
      { id: 'quality', label: '품질팀',  rowStart: 0, rowEnd: 2, bgColor: 'rgba(242,107,58,0.06)' },
      { id: 'mgmt',    label: '경영진',  rowStart: 3, rowEnd: 5, bgColor: 'rgba(43,75,140,0.06)'  },
      { id: 'close',   label: '완결',    rowStart: 6, rowEnd: 6, bgColor: 'rgba(22,163,74,0.07)'  },
    ],
    nodes: [
      { id: 'S',   type: 'start',    label: '경영검토 계획',                                           row: 0, col: 0, color: 'white'  },
      { id: 'P1',  type: 'process',  label: 'P1. 자료 수집 및 준비\nKPI·심사결과·고객불만·리스크 취합', row: 1, col: 0, color: 'orange' },
      { id: 'P2',  type: 'process',  label: 'P2. 경영검토 자료 작성\n현황 분석·개선 과제 초안',        row: 2, col: 0, color: 'orange' },
      { id: 'P3',  type: 'process',  label: 'P3. 경영검토 회의 실시\n최고경영자·부서장 참석',          row: 3, col: 0, color: 'navy'   },
      { id: 'P4',  type: 'process',  label: 'P4. 결정 사항 정리\n개선 지시·목표 설정·자원 배분',       row: 4, col: 0, color: 'navy'   },
      { id: 'P5',  type: 'process',  label: 'P5. 실행 모니터링\n부서별 조치 이행 추적',                row: 5, col: 0, color: 'navy'   },
      { id: 'P6',  type: 'process',  label: 'P6. 기록 보관\n경영검토 회의록·5년 보관',                 row: 6, col: 0, color: 'orange' },
      { id: 'E',   type: 'end',      label: '경영검토 완결',                                            row: 7, col: 0, color: 'white'  },
    ],
    edges: [
      { from: 'S',  to: 'P1' },
      { from: 'P1', to: 'P2' },
      { from: 'P2', to: 'P3' },
      { from: 'P3', to: 'P4' },
      { from: 'P4', to: 'P5' },
      { from: 'P5', to: 'P6' },
      { from: 'P6', to: 'E'  },
    ],
  },
}

export function getFlowchart(docNo: string): FlowDef | null {
  return FLOWCHARTS[docNo] ?? null
}

export const FLOWCHART_DOC_NOS = Object.keys(FLOWCHARTS)
