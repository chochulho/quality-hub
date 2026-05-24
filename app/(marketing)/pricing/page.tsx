import Link from 'next/link'
import { Check, ArrowRight, HelpCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import PricingCard, { type PlanTier } from '@/components/pricing/PricingCard'
import PricingToggle from '@/components/pricing/PricingToggle'
import type { ToolId } from '@/lib/auth/grades'

// ── DB에서 플랜 조회 ──────────────────────────────────────────
async function getPublicPlans(): Promise<PlanTier[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('v_public_plans')
      .select('*')
      .order('sort_order')

    if (error || !data?.length) throw new Error('DB fallback')

    // DB 데이터 → PlanTier 변환
    return data.map((row) => {
      const entitlements = row.tool_entitlements as Record<string, unknown>
      const includedTools = getIncludedTools(row.id, entitlements)

      return {
        id: row.id,
        name: row.name,
        label: getPlanLabel(row.id),
        monthlyKRW: row.beta_price_monthly ?? row.price_krw_monthly,
        annualKRW:  row.beta_price_yearly  ?? row.price_krw_yearly,
        toolCount:  row.selectable_tool_count > 0 ? row.selectable_tool_count : includedTools.length,
        includedTools,
        highlight: row.id === 'team',
        features: getPlanFeatures(row.id, row.max_members, row.max_sites, row.features),
        ctaLabel: row.id === 'free' ? '무료로 시작' : `${row.name} 시작하기`,
      } satisfies PlanTier
    })
  } catch {
    // DB 연결 실패 시 정적 폴백
    return STATIC_FALLBACK
  }
}

function getIncludedTools(planId: string, entitlements: Record<string, unknown>): ToolId[] {
  if (planId === 'free') return []
  if (planId === 'business' || planId === 'enterprise') {
    return ['auditsay', 'nc-manager', 'apqp-manager', 'gauge-manager', '4m-change-manager']
  }
  // starter/team: selectable — 대표 도구 표시
  if (planId === 'starter')  return ['auditsay']
  if (planId === 'team')     return ['auditsay', 'apqp-manager', 'nc-manager']
  return []
}

function getPlanLabel(planId: string): string {
  const labels: Record<string, string> = {
    free:       '학습 + 계산 도구',
    starter:    '도구 1개 선택',
    team:       '도구 3개 선택',
    business:   '5개 도구 전체',
    enterprise: '맞춤 견적',
  }
  return labels[planId] ?? ''
}

function getPlanFeatures(
  planId: string,
  maxMembers: number,
  maxSites: number,
  features: Record<string, unknown>
): string[] {
  const base: Record<string, string[]> = {
    free: [
      '품질 학습 위키 전체 무료',
      'SPC · QC7 계산 도구',
      'FMEA 체험 데모 (준비 중)',
      '회원 가입 없이 이용 가능',
    ],
    starter: [
      'SaaS 도구 1개 선택',
      'SPC · QC7 계산 도구',
      `팀원 최대 ${maxMembers}명`,
      '이메일 지원',
    ],
    team: [
      'SaaS 도구 3개 선택',
      'SPC · QC7 계산 도구',
      `팀원 최대 ${maxMembers}명 · 사업장 ${maxSites}개`,
      '이메일·채팅 지원',
    ],
    business: [
      '5개 SaaS 도구 전체 포함',
      `팀원 최대 ${maxMembers}명 · 사업장 ${maxSites}개`,
      features?.sso === 'addon' ? 'SSO 자동 로그인 (애드온)' : 'SSO 자동 로그인',
      '전담 지원',
    ],
    enterprise: [
      '5개 SaaS 도구 전체',
      '무제한 인원 · 사업장',
      'SSO + 감사 로그',
      '전담 매니저 지원',
    ],
  }
  return base[planId] ?? []
}

// 정적 폴백 (DB 연결 전 또는 실패 시)
const STATIC_FALLBACK: PlanTier[] = [
  {
    id: 'free', name: '무료', label: '학습 + 계산 도구',
    monthlyKRW: null, annualKRW: null, toolCount: 0, includedTools: [],
    highlight: false,
    features: ['품질 학습 위키 전체 무료', 'SPC · QC7 계산 도구', 'FMEA 체험 데모 (준비 중)', '회원 가입 없이 이용 가능'],
    ctaLabel: '무료로 시작',
  },
  {
    id: 'starter', name: 'Starter', label: '도구 1개 선택',
    monthlyKRW: 24500, annualKRW: 22050, toolCount: 1, includedTools: ['auditsay'],
    highlight: false,
    features: ['SaaS 도구 1개 선택', 'SPC · QC7 계산 도구', '팀원 최대 10명', '이메일 지원'],
    ctaLabel: 'Starter 시작하기',
  },
  {
    id: 'team', name: 'Team', label: '도구 3개 선택',
    monthlyKRW: 74500, annualKRW: 67050, toolCount: 3, includedTools: ['auditsay', 'apqp-manager', 'nc-manager'],
    highlight: true,
    features: ['SaaS 도구 3개 선택', 'SPC · QC7 계산 도구', '팀원 최대 30명 · 사업장 2개', '이메일·채팅 지원'],
    ctaLabel: 'Team 시작하기',
  },
  {
    id: 'business', name: 'Business', label: '5개 도구 전체',
    monthlyKRW: 195000, annualKRW: 175500, toolCount: 5,
    includedTools: ['auditsay', 'nc-manager', 'apqp-manager', 'gauge-manager', '4m-change-manager'],
    highlight: false,
    features: ['5개 SaaS 도구 전체 포함', '팀원 최대 80명 · 사업장 3개', 'SSO 자동 로그인 (애드온)', '전담 지원'],
    ctaLabel: 'Business 시작하기',
  },
]

// ── 기능 비교표 ───────────────────────────────────────────────
const FEATURE_ROWS = [
  { label: '품질 학습 위키',            plans: ['free', 'starter', 'team', 'business'] },
  { label: 'SPC · QC7 계산 도구',       plans: ['free', 'starter', 'team', 'business'] },
  { label: 'SaaS 도구 선택',            plans: ['starter', 'team'] },
  { label: 'SaaS 도구 전체 (5개)',       plans: ['business'] },
  { label: '팀원 관리',                 plans: ['starter', 'team', 'business'] },
  { label: '사업장 복수',               plans: ['team', 'business'] },
  { label: 'SSO 자동 로그인',            plans: ['business'] },
  { label: '이메일 지원',               plans: ['starter', 'team', 'business'] },
  { label: '채팅 지원',                 plans: ['team', 'business'] },
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
    q: '베타 가격은 언제까지인가요?',
    a: '베타 기간(출시 후 6개월) 동안 정가의 50% 할인된 가격으로 이용하실 수 있습니다. 베타 가입자는 이후에도 12개월간 동일 가격이 유지됩니다.',
  },
  {
    q: 'Enterprise 플랜은 어떻게 신청하나요?',
    a: '무제한 인원·사업장, SSO, 감사 로그, 전담 지원이 필요한 경우 서비스 요청 채널로 문의해 주세요. 맞춤 견적을 제공해 드립니다.',
  },
  {
    q: '무료 체험판이 있나요?',
    a: '회원가입 없이 품질 학습 위키와 SPC·QC7 계산 도구를 무료로 이용할 수 있습니다. 자매 SaaS 도구는 구독 후 이용 가능합니다.',
  },
]

// ── Page (Server Component) ───────────────────────────────────
export const metadata = { title: '요금제' }

export default async function PricingPage() {
  const tiers = await getPublicPlans()
  const planIds = tiers.map((t) => t.id)

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
        {/* 베타 배너 */}
        <div className="inline-flex items-center gap-2 mt-6 bg-brand-orange/10 border border-brand-orange/20 rounded-full px-5 py-2 text-sm font-medium text-brand-orange">
          🎉 베타 출시 기념 — 정가 대비 <strong>50% 할인</strong> 적용 중
        </div>

        {/* 월간/연간 토글 — Client Component */}
        <PricingToggle />
      </div>

      {/* 요금 카드 */}
      <div id="pricing-cards" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start mb-20">
        {tiers.map((tier) => (
          <PricingCard key={tier.id} tier={tier} />
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
                {tiers.map((t) => (
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
                  {planIds.map((id) => (
                    <td key={id} className="py-3 px-3 text-center">
                      {row.plans.includes(id) ? (
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

      {/* 왜 이 가격인가? */}
      <div className="text-center mb-10">
        <p className="text-sm text-muted-foreground">
          직접 QMS를 구축하면 얼마나 드는지 비교해 보셨나요?{' '}
          <Link href="/compare" className="text-brand-orange font-medium hover:underline">
            자체 구축 vs quality‑hub 비용 비교 →
          </Link>
        </p>
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
