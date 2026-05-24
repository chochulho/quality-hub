import Link from 'next/link'
import { ArrowRight, BarChart2, Grid3X3, Bot } from 'lucide-react'

const FREE_TOOLS = [
  {
    icon: BarChart2,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    label: 'SPC',
    title: '공정능력 분석 (Cp/Cpk)',
    desc: '엑셀 없이 1분 만에. 데이터 붙여넣기만 하세요.',
    cta: '바로 사용하기',
    href: '/calculators/spc',
  },
  {
    icon: Grid3X3,
    color: 'text-green-600',
    bg: 'bg-green-50',
    label: 'QC7',
    title: 'QC 7가지 도구',
    desc: '파레토·히스토그램·피쉬본 인터랙티브 작성',
    cta: '도구 선택하기',
    href: '/calculators/qc7',
  },
  {
    icon: Bot,
    color: 'text-brand-orange',
    bg: 'bg-brand-orange/5',
    label: 'FMEA 데모',
    title: 'FMEA 체험 (AI 대화형, AIAG‑VDA)',
    desc: 'AI와 대화하면서 FMEA 자동 작성. 3분 체험.',
    cta: '데모 시작하기',
    href: '/calculators/fmea-demo',
  },
]

export default function FreeToolsSection() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-sm font-medium text-brand-orange mb-2">무료 계산 도구</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-brand-navy">
            회원가입 없이 즉시 사용
          </h2>
          <p className="mt-2 text-muted-foreground max-w-md mx-auto text-sm" style={{ wordBreak: 'keep-all' }}>
            SPC·QC7·FMEA — 매일 쓰는 실무 계산 도구를 브라우저에서 바로.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FREE_TOOLS.map((tool) => {
            const Icon = tool.icon
            return (
              <div
                key={tool.label}
                className="rounded-2xl border border-border bg-white p-6 flex flex-col hover:border-brand-navy transition-colors duration-200"
              >
                {/* Icon + label */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`${tool.bg} rounded-xl p-2.5 shrink-0`}>
                    <Icon className={`h-5 w-5 ${tool.color}`} />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    {tool.label}
                  </span>
                </div>

                {/* Title + desc */}
                <h3 className="text-base font-extrabold text-brand-navy mb-2 leading-snug">
                  {tool.title}
                </h3>
                <p className="text-sm text-muted-foreground flex-1 mb-5" style={{ wordBreak: 'keep-all' }}>
                  {tool.desc}
                </p>

                {/* CTA */}
                <Link
                  href={tool.href}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange hover:text-brand-orange-hover transition-colors"
                >
                  {tool.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )
          })}
        </div>

        {/* 학습 코너 링크 */}
        <div className="mt-6 text-center">
          <Link
            href="/learn"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            품질기술사·품질기사 시험 학습 코너도 있어요 →
          </Link>
        </div>
      </div>
    </section>
  )
}
