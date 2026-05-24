'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, ArrowRight, HelpCircle } from 'lucide-react'
import PricingCard, { type PlanTier } from '@/components/pricing/PricingCard'

// ── 정적 플랜 데이터 (TODO: 2주차 — v_public_plans DB 뷰로 교체) ─────────────
const PLAN_TIERS: PlanTier[] = [
  {
    id: 'free',
    name: '무료',
    label: '학습 + 계산 도구',
    monthlyKRW: null,
    annualKRW: null,
    toolCount: 0,
    includedTools: [],
    highlight: false,
    features: [
      '품질 학습 위키 전체 무료',
      'SPC · QC7 계산 도구',
      'FMEA 체험 데모 (준비 중)',
      '회원 가입 없이 이용 가능',
    ],
    ctaLabel: '무료로 시작',
  },
  {
    id: 'starter',
    name: 'Starter',
    label: '도구 1개 선택',
    monthlyKRW: 49000,
    annualKRW: 44000,
    toolCount: 1,
    includedTools: ['auditsay'],
    highlight: false,
    features: [
      'SaaS 도구 1개 선택',
      'SPC · QC7 계산 도구',
      '팀원 최대 10명',
      '이메일 지원',
    ],
    ctaLabel: 'Starter 시작하기',
  },
  {
    id: 'team',
    name: 'Team',
    label: '도구 3개 선택',
    monthlyKRW: 149000,
    annualKRW: 134000,
    toolCount: 3,
    includedTools: ['auditsay', 'apqp-manager', 'nc-manager'],
    highlight: true,
    features: [
      'SaaS 도구 3개 선택',
      'SPC · QC7 계산 도구',
      '팀원 최대 30명 · 사업장 2개',
      '이메일·채팅 지원',
    ],
    ctaLabel: 'Team 시작하기',
  },
  {
    id: 'business',
    name: 'Business',
    label: '5개 도구 전체',
    monthlyKRW: 390000,
    annualKRW: 351000,
    toolCount: 5,
    includedTools: ['auditsay', 'nc-manager', 'apqp-manager', 'gauge-manager', '4m-change-manager'],
    highlight: false,
    features: [
      '5개 SaaS 도구 전체 포함',
      '팀원 최대 80명 · 사업장 3개',
      'SSO 자동 로그인 (애드온)',
      '전담 지원',
    ],
    ctaLabel: 'Business 시작하기',
  },
]

const FAQ = [
  {
    q: '요금제는 언제든지 변경할 수 있나요?',
    a: '네, 언제든지 업그레이드 및 다운그레이드 가능합니다. 업그레이드는 즉시 반영되며, 다운그레이드는 다음 결제일부터 적용됩니다.',
  },
  {
    q: 'Starter · Team 플랜에서 어떤 도구를 선택할 수 있나요?',
    a: 'AuditSay · NC Manager · APQP Manager · Gauge Manager · 4M Change Manager 5가지 중에서 플랜에 맞는 수만큼 선택할 수 있습니다. 대시보드에서 언제든지 변경 가능합니다.',
  },
  {
    q: '연간 결제 시 할인이 되나요?',
    a: '네, 연간 결제 시 약 10% 할인됩니다. 가입 후 대시보드에서 연간 결제로 전환할 수 있습니다.',
  },
  {
    q: 'Enterprise 플랜은 어떻게 신청하나요?',
    a: '무제한 인원·사업장, SSO, 감사 로그, 전담 지원이 필요한 경우 Q&A 또는 서비스 요청 채널로 문의해 주세요. 맞춤 견적을 제공해 드립니다.',
  },
  {
    q: '무료 체험판이 있나요?',
    a: '회원가입 없이 품질 학습 위키와 SPC·QC7 계산 도구를 무료로 이용할 수 있습니다. 자매 SaaS 도구는 구독 후 이용 가능합니다.',
  },
]

const FEATURE_ROWS = [
  { label: '품질 학습 위키', plans: ['free', 'starter', 'team', 'business'] },
  { label: 'SPC · QC7 계산 도구',  plans: ['free', 'starter', 'team', 'business'] },
  { label: 'SaaS 도구 선택',        plans: ['starter', 'team'] },
  { label: 'SaaS 도구 전체 (5개)',  plans: ['business'] },
  { label: '팀원 관리',             plans: ['starter', 'team', 'business'] },
  { label: '사업장 복수',           plans: ['team', 'business'] },
  { label: 'SSO 자동 로그인',       plans: ['business'] },
  { label: '감사 로그',             plans: [] },  // enterprise only
  { label: '이메일 지원',           plans: ['starter', 'team', 'business'] },
  { label: '채팅 지원',             plans: ['team', 'business'] },
]

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)

  return (
    <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">

      {/* 헤더 */}
      <div className="text-center mb-12">
        <p className="text-sm font-medium text-brand-orange mb-3">요금제</p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-brand-navy tracking-tight mb-4">
          필요한 도구만{' '}
          <span className="text-brand-orange">구독하세요</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Free부터 Business까지. 팀 규모와 필요에 맞게 시작하고, 언제든지 변경하세요.
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

      {/* 요금 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start mb-20">
        {PLAN_TIERS.map((tier) => (
          <PricingCard key={tier.id} tier={tier} annual={annual} />
        ))}
      </div>

      {/* 기능 비교표 */}
      <div className="mb-20">
        <h2 className="text-2xl font-extrabold text-brand-navy mb-8 text-center">기능 비교</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 pr-4 font-semibold text-foreground w-1/2">기능</th>
                {PLAN_TIERS.map((t) => (
                  <th key={t.id} className="text-center py-3 px-3 font-semibold text-foreground">
                    {t.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURE_ROWS.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-muted/30' : ''}>
                  <td className="py-3 pr-4 text-foreground">{row.label}</td>
                  {PLAN_TIERS.map((t) => (
                    <td key={t.id} className="py-3 px-3 text-center">
                      {row.plans.includes(t.id) ? (
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
        <h2 className="text-2xl font-extrabold text-brand-navy mb-8 text-center">자주 묻는 질문</h2>
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
          학습 위키와 계산 도구는 가입 없이 무료. 자매 SaaS는 구독 후 즉시 이용.
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
