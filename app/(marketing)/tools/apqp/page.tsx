import Link from 'next/link'
import { ArrowRight, Bot, FileText, GitMerge, Languages, Package, CheckSquare } from 'lucide-react'

export const metadata = {
  title: 'APQP Manager — AI 대화형 FMEA',
  description:
    'AI와 대화하면서 AIAG-VDA FMEA를 자동 작성합니다. PFD→PFMEA→CP→WI→Check Sheet 5문서를 자동 연동하고 PPAP를 완성합니다.',
}

const FLOW_STEPS = [
  { icon: GitMerge,    label: 'PFD',         desc: '공정 흐름도\n(ReactFlow 시각화)' },
  { icon: Bot,         label: 'PFMEA',       desc: 'AI 대화형\nAIAG-VDA 분석' },
  { icon: FileText,    label: 'CP',          desc: '관리 계획서\n(PFMEA 자동 연계)' },
  { icon: CheckSquare, label: 'WI',          desc: '작업 표준서\n(CP 항목 연계)' },
  { icon: Package,     label: 'Check Sheet', desc: '점검 시트\n(WI 자동 생성)' },
]

const FEATURES = [
  {
    icon: Bot,
    title: 'AI와 대화하며 FMEA 작성',
    desc: '공정을 설명하면 AI가 불량 유형·원인·예방/검출 관리·조치우선순위(AP)를 AIAG-VDA 규격에 맞게 자동 제안합니다. 세계 어디에도 없는 기능.',
    highlight: true,
  },
  {
    icon: GitMerge,
    title: '5문서 자동 연동',
    desc: 'PFD 공정 단계가 PFMEA의 공정 컬럼이 됩니다. PFMEA 조치가 CP 관리 특성이 됩니다. 문서 간 재입력 제로.',
    highlight: false,
  },
  {
    icon: FileText,
    title: 'Excel·PDF FMEA 파싱 업로드',
    desc: '기존에 만들어 둔 Excel·PDF FMEA를 AI가 자동 파싱해 시스템으로 가져옵니다. 기존 자산을 버리지 않아도 됩니다.',
    highlight: false,
  },
  {
    icon: Languages,
    title: 'AI 다국어 자동 번역',
    desc: '완성된 문서를 영어·중국어·베트남어로 AI가 즉시 번역합니다. 해외 공장·고객사 제출 문서 준비에 드는 시간을 90% 단축.',
    highlight: false,
  },
  {
    icon: Package,
    title: 'PPAP 18개 요소 자동화',
    desc: '5문서가 완성되면 PPAP 패키지가 자동으로 구성됩니다. Gate Review 플로우로 승인 이력을 남기세요.',
    highlight: false,
  },
]

const COMPARE_ROWS = [
  { label: 'FMEA 1장 작성 시간', before: '3~5일', after: '2~4시간' },
  { label: '5문서 정합성 유지', before: '수동 확인', after: '자동 연동' },
  { label: '해외 번역', before: '번역사 외주', after: 'AI 즉시 번역' },
  { label: '개정 이력 관리', before: 'Excel 버전 관리', after: '자동 Revision 기록' },
]

export default function ApqpManagerPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 md:py-20">

      {/* Hero */}
      <div className="text-center mb-16">
        <p className="text-sm font-medium text-brand-orange mb-3">APQP Manager</p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-brand-navy leading-tight mb-5">
          AI와 대화하면서
          <br />
          <span className="text-brand-orange">FMEA를 자동 완성</span>하세요
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8" style={{ wordBreak: 'keep-all' }}>
          AIAG-VDA 규격 기반 · PFD → PFMEA → CP → WI → Check Sheet 5문서 자동 연동.<br />
          Excel로 FMEA 작성하던 시대는 끝났습니다.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/calculators/fmea-demo"
            className="inline-flex items-center gap-2 bg-brand-orange text-white rounded-full px-8 py-4 font-semibold hover:bg-brand-orange-hover hover:-translate-y-0.5 transition-all duration-200 shadow-sm"
          >
            FMEA 데모 3분 체험
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="https://apqpmanager.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white border border-border text-foreground rounded-full px-8 py-4 font-semibold hover:border-brand-navy hover:-translate-y-0.5 transition-all duration-200"
          >
            apqpmanager.com 방문
          </a>
        </div>
      </div>

      {/* 5문서 연동 흐름 */}
      <div className="mb-16">
        <h2 className="text-2xl font-extrabold text-brand-navy text-center mb-8">
          5문서가 하나로 연결됩니다
        </h2>
        <div className="flex flex-wrap justify-center items-center gap-2">
          {FLOW_STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={step.label} className="flex items-center gap-2">
                <div className="flex flex-col items-center text-center">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-2 ${
                    step.label === 'PFMEA'
                      ? 'bg-brand-orange text-white'
                      : 'bg-brand-navy/5 text-brand-navy'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className={`text-xs font-bold ${step.label === 'PFMEA' ? 'text-brand-orange' : 'text-brand-navy'}`}>
                    {step.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5 whitespace-pre-line leading-snug">
                    {step.desc}
                  </span>
                </div>
                {i < FLOW_STEPS.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-border shrink-0 mb-6" />
                )}
              </div>
            )
          })}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4">
          각 문서가 앞 단계 데이터를 자동 참조 — 재입력·불일치 제로
        </p>
      </div>

      {/* 기능 카드 */}
      <div className="mb-16">
        <h2 className="text-2xl font-extrabold text-brand-navy text-center mb-8">
          왜 APQP Manager인가
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className={`rounded-2xl p-6 border ${
                  f.highlight
                    ? 'border-brand-orange bg-brand-orange/5'
                    : 'border-border bg-white'
                }`}
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4 ${
                  f.highlight ? 'bg-brand-orange text-white' : 'bg-muted text-brand-navy'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-extrabold text-brand-navy mb-2">
                  {f.highlight && (
                    <span className="text-[10px] font-bold bg-brand-orange text-white rounded-full px-2 py-0.5 mr-2 align-middle">
                      차별화
                    </span>
                  )}
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed" style={{ wordBreak: 'keep-all' }}>
                  {f.desc}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Before / After */}
      <div className="mb-16">
        <h2 className="text-2xl font-extrabold text-brand-navy text-center mb-8">
          도입 전 · 후
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-3 pr-4 font-semibold text-muted-foreground">항목</th>
                <th className="text-center py-3 px-4 font-bold text-foreground bg-muted/60 rounded-tl-xl">
                  Excel·수작업
                </th>
                <th className="text-center py-3 px-4 font-bold text-white bg-brand-navy rounded-tr-xl">
                  APQP Manager
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="py-3 pr-4 text-foreground font-medium">{row.label}</td>
                  <td className="py-3 px-4 text-center text-muted-foreground bg-muted/30">
                    {row.before}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-brand-orange bg-brand-navy/5">
                    {row.after}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-3xl bg-brand-navy p-10 text-center">
        <p className="text-xs font-medium text-white/60 mb-2 uppercase tracking-wide">지금 시작하기</p>
        <h2 className="text-3xl font-extrabold text-white mb-3">
          3분 데모로 직접 확인해 보세요
        </h2>
        <p className="text-white/70 mb-8 text-sm" style={{ wordBreak: 'keep-all' }}>
          회원가입 불필요. AI와 대화하면서 실제 PFMEA 행이 생성되는 과정을 체험하세요.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/calculators/fmea-demo"
            className="inline-flex items-center gap-2 bg-brand-orange text-white rounded-full px-8 py-3.5 font-semibold hover:bg-brand-orange-hover transition-all hover:-translate-y-0.5 duration-200"
          >
            FMEA 데모 시작하기
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="https://apqpmanager.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/20 rounded-full px-8 py-3.5 font-semibold hover:bg-white/20 transition-all"
          >
            전체 기능 보기
          </a>
        </div>
      </div>
    </div>
  )
}
