// ─────────────────────────────────────────────
// QMS 문서 → 자매 사이트 연결 매핑
// CLAUDE.md §2에 명시된 URL만 사용
// 광고 톤 금지 — 학습·실무 맥락의 자연스러운 다음 단계로
// ─────────────────────────────────────────────

export interface RelatedTool {
  name: string
  url: string          // CLAUDE.md §2 허용 도메인
  tagline: string      // 한 줄 요약
  description: string  // 2~3문장, 자연스러운 연결
  ctaText: string
}

// docNo → RelatedTool 매핑
// 터틀 다이어그램(TT-*)은 소스 프로세스 docNo와 동일하게 처리
const TOOL_MAP: Record<string, RelatedTool> = {

  // ── AuditSay (내부심사) ──────────────────────────────
  'QP-A01': {
    name: 'AuditSay',
    url: 'https://auditsay.com',
    tagline: '내부심사를 디지털로 전환',
    description:
      'QP-A01로 내부심사 프로세스 체계를 잡았다면, 실제 심사 실행은 AuditSay로 바로 이어갈 수 있습니다. ' +
      'IATF 16949 조항별 체크리스트 자동 생성, NCR 추적, 시정조치 연계까지 하나의 흐름으로 처리됩니다.',
    ctaText: 'AuditSay에서 내부심사 시작하기',
  },

  // ── APQPManager (설계·FMEA) ──────────────────────────
  'QP-D02': {
    name: 'APQP Manager',
    url: 'https://apqpmanager.com',
    tagline: 'APQP 5문서 자동 연동 관리',
    description:
      'APQP 프로세스 절차를 수립했다면, 실제 프로젝트 단위 실행은 APQP Manager로 이어서 관리할 수 있습니다. ' +
      'Flow Diagram → PFMEA → Control Plan → Work Instruction 5문서가 자동으로 연동되어 변경 이력이 한 곳에서 관리됩니다.',
    ctaText: 'APQP Manager에서 프로젝트 시작하기',
  },
  'QP-D03': {
    name: 'APQP Manager',
    url: 'https://apqpmanager.com',
    tagline: 'PFMEA · Control Plan 연동 관리',
    description:
      'PFMEA 관리 절차를 정의했다면, 개별 PFMEA 작성과 Control Plan 자동 연동은 APQP Manager에서 바로 진행할 수 있습니다. ' +
      '공정 변경 시 PFMEA와 Control Plan이 함께 업데이트되어 누락 위험을 줄입니다.',
    ctaText: 'APQP Manager로 PFMEA 작성하기',
  },
  'QP-D04': {
    name: 'APQP Manager',
    url: 'https://apqpmanager.com',
    tagline: '공정 PFMEA · Control Plan 연동',
    description:
      '공정설계 절차를 수립했다면, 실제 공정 PFMEA 작성과 이력 관리는 APQP Manager로 체계화할 수 있습니다. ' +
      '공정 단계별 FMEA 항목과 Control Plan이 자동으로 연결됩니다.',
    ctaText: 'APQP Manager에서 공정 PFMEA 시작하기',
  },

  // ── GaugeManager (계측기·설비) ───────────────────────
  'QP-MS01': {
    name: 'Gauge Manager',
    url: 'https://gaugemanager.com',
    tagline: '계측기 교정 이력 디지털 관리',
    description:
      '계측기 관리 절차를 갖췄다면, 개별 계측기의 교정 이력·MSA·자산 추적은 Gauge Manager로 자동화할 수 있습니다. ' +
      '교정 만기 알림, MSA 결과 기록, 불합격 계측기 격리 처리를 한 곳에서 관리합니다.',
    ctaText: 'Gauge Manager 시작하기',
  },
  'QP-PM01': {
    name: 'Gauge Manager',
    url: 'https://gaugemanager.com',
    tagline: '설비 · 계측기 통합 관리',
    description:
      '설비·계측기 통합 관리 절차를 만들었다면, 실제 점검 이력과 교정 일정은 Gauge Manager로 자동화할 수 있습니다. ' +
      '계획 대비 실적 추적과 이상 발생 시 알림 기능을 제공합니다.',
    ctaText: 'Gauge Manager 시작하기',
  },
}

// 터틀 다이어그램(TT-*)은 소스 프로세스와 같은 도구로 연결
function normalizeDockNo(docNo: string): string {
  if (docNo.startsWith('TT-')) {
    return 'QP-' + docNo.slice(3)
  }
  return docNo
}

export function getRelatedTool(docNo: string): RelatedTool | null {
  return TOOL_MAP[normalizeDockNo(docNo)] ?? null
}
