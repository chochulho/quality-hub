'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, ArrowRight, HelpCircle } from 'lucide-react'
import { PRICING_TIERS, ALL_TOOL_IDS, TOOLS, GRADE_TOOLS, type Grade } from '@/lib/auth/grades'
import PricingCard from '@/components/pricing/PricingCard'

const FAQ = [
  {
    q: '요금제는 언제든지 변경할 수 있나요?',
    a: '네, 언제든지 업그레이드 및 다운그레이드 가능합니다. 업그레이드는 즉시 반영되며, 다운그레이드는 다음 결제일부터 적용됩니다.',
  },
  {
    q: '기업 회원과 개인 회원의 차이는 무엇인가요?',
    a: '기업 회원은 관리자 검토 후 활성화되며, 추후 팀원 초대 기능이 제공됩니다. 개인 회원은 이메일 인증 후 즉시 이용 가능합니다.',
  },
  {
    q: '연간 결제 시 할인이 되나요?',
    a: '네, 연간 결제 시 약 10% 할인됩니다. Silver ₩44,000, Gold ₩89,000, Platinum ₩179,000/월 환산 요금으로 이용하실 수 있습니다.',
  },
  {
    q: '자매 사이트 SSO(자동 로그인)는 언제 지원되나요?',
    a: 'SSO 기능은 Phase 2에서 제공될 예정입니다. Platinum 플랜 구독자부터 우선 적용됩니다. 현재는 각 도구를 개별 링크로 이용하실 수 있습니다.',
  },
  {
    q: '무료 체험판이 있나요?',
    a: '회원가입 없이 품질 학습 위키와 SPC·QC7·VSM 등 내장 도구를 무료로 이용할 수 있습니다. 자매 SaaS 도구는 구독 후 이용 가능합니다.',
  },
]

const FEATURE_ROWS = [
  { label: '품질 학습 위키', grades: ['free', 'silver', 'gold', 'platinum'] },
  { label: 'SPC · QC7 · QFD · VSM · Kanban 내장도구', grades: ['free', 'silver', 'gold', 'platinum'] },
  { label: 'AuditSay (심사 체크리스트)', grades: ['silver', 'gold', 'platinum'] },
  { label: 'NC Manager (부적합·CAPA)', grades: ['silver', 'gold', 'platinum'] },
  { label: 'APQP Manager (PFMEA·PPAP)', grades: ['gold', 'platinum'] },
  { label: 'Gauge Manager (검교정·MSA)', grades: ['platinum'] },
  { label: '4M Change Manager (변경관리)', grades: ['platinum'] },
  { label: '이메일 지원', grades: ['silver', 'gold', 'platinum'] },
  { label: '이메일·채팅 지원', grades: ['gold', 'platinum'] },
  { label: '팀원 초대 (출시 예정)', grades: ['gold', 'platinum'] },
  { label: 'SSO 자동 로그인 (예정)', grades: ['platinum'] },
]

const GRADE_ORDER: Grade[] = ['free', 'silver', 'gold', 'platinum']

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">

      {/* 헤더 */}
      <div className="text-center mb-12">
        <p className="text-sm font-medium text-brand-orange mb-3">요금제</p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-brand-navy tracking-tight mb-4">
          도구 번들 하나로{' '}
          <span className="text-brand-orange">품질시스템 전체</span>를
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          등급에 따라 최대 5개의 자매 SaaS 도구를 하나의 구독으로 이용하세요.
        </p>

        {/* 월간/연간 토글 */}
        <div className="inline-flex items-center gap-3 mt-8 bg-muted rounded-full px-2 py-1.5">
          <button
            onClick={() => setAnnual(false)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !annual ? 'bg-white shadow text-foreground' : 'text-muted-foreground'
            }`}
          >
            월간 결제
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              annual ? 'bg-white shadow text-foreground' : 'text-muted-foreground'
            }`}
          >
            연간 결제
            <span className="ml-1.5 text-[10px] font-bold bg-brand-orange text-white rounded-full px-1.5 py-0.5">
              10% 절약
            </span>
          </button>
        </div>
      </div>

      {/* 요금 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start mb-20">
        {PRICING_TIERS.map((tier) => (
          <PricingCard key={tier.id} tier={tier} annual={annual} />
        ))}
      </div>

      {/* 기능 비교표 */}
      <div className="mb-20">
        <h2 className="text-2xl font-extrabold text-brand-navy mb-8 text-center">
          기능 비교
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 pr-4 font-semibold text-foreground w-1/2">기능</th>
                {GRADE_ORDER.map((g) => (
                  <th key={g} className="text-center py-3 px-3 font-semibold text-foreground">
                    {PRICING_TIERS.find((t) => t.id === g)?.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURE_ROWS.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-muted/30' : ''}>
                  <td className="py-3 pr-4 text-foreground">{row.label}</td>
                  {GRADE_ORDER.map((g) => (
                    <td key={g} className="py-3 px-3 text-center">
                      {row.grades.includes(g) ? (
                        <Check className="h-4 w-4 text-brand-orange mx-auto" />
                      ) : (
                        <span className="text-border text-lg">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto mb-16">
        <h2 className="text-2xl font-extrabold text-brand-navy mb-8 text-center">
          자주 묻는 질문
        </h2>
        <div className="space-y-4">
          {FAQ.map((item, i) => (
            <div key={i} className="border border-border rounded-2xl p-6">
              <div className="flex gap-3">
                <HelpCircle className="h-5 w-5 text-brand-orange shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground mb-2">{item.q}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 하단 CTA */}
      <div className="rounded-3xl bg-brand-navy p-10 text-center">
        <p className="text-xs font-medium text-white/60 mb-2 uppercase tracking-wide">시작하기</p>
        <h2 className="text-3xl font-extrabold text-white mb-3">
          지금 바로 품질 도구 번들을 경험하세요
        </h2>
        <p className="text-white/70 mb-8 text-sm">
          학습 위키와 내장 도구는 가입 없이 무료. 자매 SaaS는 구독 후 즉시 이용.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-brand-orange text-white rounded-full px-8 py-3.5 font-semibold hover:bg-brand-orange-hover transition-all hover:-translate-y-0.5 duration-200"
          >
            지금 가입하기
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/20 rounded-full px-8 py-3.5 font-semibold hover:bg-white/20 transition-all"
          >
            무료로 먼저 둘러보기
          </Link>
        </div>
      </div>
    </div>
  )
}
