// 문서번호 → 템플릿 파일 경로 + 표준 조항 + 레이어 매핑
// API route에서 FS 로드 경로 및 매트릭스 빌더 데이터 소스로 사용
// spec: QMS_WIZARD_SPEC_FINAL.md §10

import type { DocLayer } from '@/types/qmsWizard'

export interface TemplateMeta {
  path: string             // content/qms-templates/ 기준 상대 경로
  standardClauses: string[] // 이 문서가 커버하는 표준 조항 (ISO 9001/IATF 공통 번호 체계)
  layer: DocLayer
}

export const TEMPLATE_META: Record<string, TemplateMeta> = {
  // ─── 매뉴얼 ───────────────────────────────────────────────────────
  'QM-001':  {
    path: 'manual/QM-001.md',
    standardClauses: ['4.1','4.2','4.3','4.4','5.1','5.2','5.3',
                      '6.1','6.2','7.5','8.1','9.1','9.2','9.3','10.2','10.3'],
    layer: 'iso9001',
  },

  // ─── HLS 공통 4개 핵심 프로세스 ──────────────────────────────────
  'QP-MR01': { path: 'process/QP-MR01.md', standardClauses: ['9.3','5.1','6.2'],     layer: 'hls' },
  'QP-A01':  { path: 'process/QP-A01.md',  standardClauses: ['9.2','7.2'],           layer: 'hls' },
  'QP-CA01': { path: 'process/QP-CA01.md', standardClauses: ['10.2','8.7'],          layer: 'hls' },
  'QP-DC01': { path: 'process/QP-DC01.md', standardClauses: ['7.5'],                 layer: 'hls' },

  // ─── ISO 9001 기반 프로세스 ────────────────────────────────────────
  'QP-C01':  { path: 'process/QP-C01.md',  standardClauses: ['8.2','10.2','9.1'],    layer: 'iso9001' },
  'QP-HR01': { path: 'process/QP-HR01.md', standardClauses: ['7.1','7.2','7.3'],     layer: 'iso9001' },

  // ─── 규모별 추가 (ISO 9001 기반) ──────────────────────────────────
  'QP-PO01': { path: 'process/QP-PO01.md', standardClauses: ['8.4','8.5'],           layer: 'iso9001' },
  'QP-PM01': { path: 'process/QP-PM01.md', standardClauses: ['7.1','9.1'],           layer: 'iso9001' },
  'QP-PU01': { path: 'process/QP-PU01.md', standardClauses: ['8.4'],                 layer: 'iso9001' },
  'QP-OUT1': { path: 'process/QP-OUT1.md', standardClauses: ['8.4'],                 layer: 'iso9001' },
  'QP-EQ01': { path: 'process/QP-EQ01.md', standardClauses: ['7.1'],                 layer: 'iso9001' },
  'QP-MS01': { path: 'process/QP-MS01.md', standardClauses: ['7.1','9.1'],           layer: 'iso9001' },
  'QP-PR01': { path: 'process/QP-PR01.md', standardClauses: ['8.5'],                 layer: 'iso9001' },
  'QP-WH01': { path: 'process/QP-WH01.md', standardClauses: ['8.5'],                 layer: 'iso9001' },

  // ─── 범위별 추가 (ISO 9001 기반) ──────────────────────────────────
  'QP-D01':  { path: 'process/QP-D01.md',  standardClauses: ['8.3'],                 layer: 'iso9001' },
  'QP-S01':  { path: 'process/QP-S01.md',  standardClauses: ['8.4'],                 layer: 'iso9001' },
  'QP-S02':  { path: 'process/QP-S02.md',  standardClauses: ['8.4'],                 layer: 'iso9001' },
  'QP-CS01': { path: 'process/QP-CS01.md', standardClauses: ['8.2','9.1'],           layer: 'iso9001' },

  // ─── IATF 16949 추가요구사항 전용 ─────────────────────────────────
  'QP-D02':  { path: 'process/QP-D02.md',  standardClauses: ['8.3'],                 layer: 'iatf_addon' },
  'QP-D03':  { path: 'process/QP-D03.md',  standardClauses: ['8.3','8.5'],           layer: 'iatf_addon' },
  'QP-D04':  { path: 'process/QP-D04.md',  standardClauses: ['8.3'],                 layer: 'iatf_addon' },

  // ─── 지침서 (ISO 9001 기반) ──────────────────────────────────────
  'QI-P01':  { path: 'instruction/QI-P01.md', standardClauses: ['8.6'],              layer: 'iso9001' },
  'QI-P02':  { path: 'instruction/QI-P02.md', standardClauses: ['8.5'],              layer: 'iso9001' },
  'QI-P03':  { path: 'instruction/QI-P03.md', standardClauses: ['8.6'],              layer: 'iso9001' },
  'QI-E01':  { path: 'instruction/QI-E01.md', standardClauses: ['7.1'],              layer: 'iso9001' },
  'QI-M01':  { path: 'instruction/QI-M01.md', standardClauses: ['7.1'],              layer: 'iso9001' },
  'QI-D01':  { path: 'instruction/QI-D01.md', standardClauses: ['7.5','8.3'],        layer: 'iso9001' },
  'QI-TMPL': { path: 'instruction/QI-TMPL.md', standardClauses: [],                  layer: 'iso9001' },

  // ─── KPI / 매트릭스 ──────────────────────────────────────────────
  'KPI-001': { path: 'kpi/KPI-001.md',     standardClauses: ['9.1','6.2'],           layer: 'iso9001' },
  'MTX-001': { path: 'matrix/MTX-001.md',  standardClauses: ['4.4','7.5'],           layer: 'iso9001' },
}

// 터틀 다이어그램은 프로세스 문서에서 docNo를 파생하므로 별도 메타 없이 inline 생성
export function getTurtleStandardClauses(sourceDocNo: string): string[] {
  return TEMPLATE_META[sourceDocNo]?.standardClauses ?? []
}
