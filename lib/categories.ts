/**
 * LEARN_CATEGORIES — 클라이언트·서버 모두에서 안전하게 import 가능
 * (fs/path 등 Node.js 전용 모듈 미사용)
 */
export const LEARN_CATEGORIES = [
  { id: "qms", label: "품질경영", icon: "🏭" },
  { id: "statistics", label: "기초 통계", icon: "📉" },
  { id: "spc", label: "SPC", icon: "📊" },
  { id: "capability", label: "공정능력", icon: "📈" },
  { id: "msa", label: "MSA", icon: "🔬" },
  { id: "quality-cost", label: "품질 코스트", icon: "💰" },
  { id: "fmea", label: "FMEA", icon: "⚠️" },
  { id: "apqp", label: "APQP", icon: "📋" },
  { id: "qfd", label: "QFD", icon: "🏠" },
  { id: "lean", label: "린 생산", icon: "🔄" },
  { id: "doe", label: "실험계획법", icon: "🧪" },
  { id: "6sigma", label: "6 시그마", icon: "σ" },
  { id: "qc7", label: "QC 7가지 도구", icon: "🔧" },
  { id: "new-qc7", label: "신 QC 7가지 도구", icon: "📐" },
  { id: "service-quality", label: "서비스 품질", icon: "🛎️" },
  { id: "nc-capa", label: "부적합·CAPA", icon: "🔴" },
  { id: "change-management", label: "변경관리", icon: "🔄" },
  { id: "tpm", label: "TPM", icon: "⚙️" },
  { id: "reliability", label: "신뢰성 공학", icon: "🔩" },
  { id: "competence", label: "적격성·자격", icon: "🎯" },
  { id: "qe-exam", label: "품질기술사 시험", icon: "📝" },
] as const;

export type CategoryId = (typeof LEARN_CATEGORIES)[number]["id"];
