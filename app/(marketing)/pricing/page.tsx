import type { Metadata } from 'next'
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
      const features = row.features as Record<string, unknown>
      const includedTools = getIncludedTools(row.id)

      return {
        id: row.id,
        name: row.name,
        label: getPlanLabel(row.id),
        monthlyKRW: row.price_krw_monthly,
        annualKRW:  row.price_krw_yearly,
        toolCount:  row.selectable_tool_count > 0 ? row.selectable_tool_count : includedTools.length,
        includedTools,
        highlight: row.id === 'team',
        badge: row.id === 'business' ? 'FMEA 챗봇 무제한' : undefined,
        features: getPlanFeatures(row.id, row.max_members, row.max_sites, features),
        ctaLabel: row.id === 'free' ? '무료로 시작' : `${row.name} 시작하기`,
      } satisfies PlanTier
    })
  } catch {
    // DB 연결 실패 시 정적 폴백
    return STATIC_FALLBACK
  }
}

function getIncludedTools(planId: string): ToolId[] {
  if (planId === 'free') return []
  // 모든 유료 플랜: 5개 도구 전체 표시 (Starter·Team은 선택 가능, Business는 전체 포함)
  return ['auditsay', 'apqp-manager', 'nc-manager', 'gauge-manager', '4m-change-manager']
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
      '품질 학습 위키 전체',
      'SPC · QC7 계산 도구',
      'FMEA 체험 데모 (1세션/일)',
      '회원가입 없이 이용 가능',
      `팀원 최대 ${maxMembers}명`,
    ],
    starter: [
      'SaaS 도구 1개 선택',
      'FMEA AI 챗봇 월 3건',
      'AI 영문 번역',
      'SPC · QC7 계산 도구',
      `팀원 최대 ${maxMembers}명 · 사업장 ${maxSites}개`,
      '이메일 지원',
    ],
    team: [
      'SaaS 도구 3개 선택',
      'FMEA AI 챗봇 월 10건',
      'AI 영문 + 중국어 번역',
      'SPC · QC7 계산 도구',
      `팀원 최대 ${maxMembers}명 · 사업장 ${maxSites}개`,
      '이메일 · 채팅 지원',
    ],
    business: [
      '5개 SaaS 도구 전체 포함',
      'FMEA AI 챗봇 무제한',
      'AI 다국어 번역 (영어·중국어·베트남어)',
      'Excel/PDF FMEA 자동 파싱',
      `팀원 최대 ${maxMembers}명 · 사업장 ${maxSites}개`,
      features?.sso === 'addon' ? 'SSO 자동 로그인 (애드온)' : 'SSO 자동 로그인',
      '이메일 · 채팅 지원',
    ],
    enterprise: [
      '5개 SaaS 도구 전체',
      'FMEA AI 챗봇 무제한',
      'AI 다국어 번역 무제한',
      'Excel/PDF FMEA 자동 파싱',
      '무제한 인원 · 사업장',
      'SSO + 감사 로그',
      '전담 매니저 지원',
    ],
  }
  return base[planId] ?? []
}

// 정적 폴백 (DB 연결 전 또는 실패 시)
const ALL_5_TOOLS: ToolId[] = ['auditsay', 'apqp-manager', 'nc-manager', 'gauge-manager', '4m-change-manager']

const STATIC_FALLBACK: PlanTier[] = [
  {
    id: 'free', name: '무료', label: '학습 + 계산 도구',
    monthlyKRW: null, annualKRW: null, toolCount: 0, includedTools: [],
    highlight: false,
    features: ['품질 학습 위키 전체', 'SPC · QC7 계산 도구', 'FMEA 체험 데모 (1세션/일)', '회원가입 없이 이용 가능', '팀원 최대 3명'],
    ctaLabel: '무료로 시작',
  },
  {
    id: 'starter', name: 'Starter', label: '도구 1개 선택',
    monthlyKRW: 49000, annualKRW: 490000, toolCount: 1, includedTools: ALL_5_TOOLS,
    highlight: false,
    features: ['SaaS 도구 1개 선택', 'FMEA AI 챗봇 월 3건', 'AI 영문 번역', 'SPC · QC7 계산 도구', '팀원 최대 10명 · 사업장 1개', '이메일 지원'],
    ctaLabel: 'Starter 시작하기',
  },
  {
    id: 'team', name: 'Team', label: '도구 3개 선택',
    monthlyKRW: 149000, annualKRW: 1490000, toolCount: 3, includedTools: ALL_5_TOOLS,
    highlight: true,
    features: ['SaaS 도구 3개 선택', 'FMEA AI 챗봇 월 10건', 'AI 영문 + 중국어 번역', 'SPC · QC7 계산 도구', '팀원 최대 30명 · 사업장 2개', '이메일 · 채팅 지원'],
    ctaLabel: 'Team 시작하기',
  },
  {
    id: 'business', name: 'Business', label: '5개 도구 전체',
    monthlyKRW: 290000, annualKRW: 2900000, toolCount: 5, includedTools: ALL_5_TOOLS,
    highlight: false,
    badge: 'FMEA 챗봇 무제한',
    features: ['5개 SaaS 도구 전체 포함', 'FMEA AI 챗봇 무제한', 'AI 다국어 번역 (영어·중국어·베트남어)', 'Excel/PDF FMEA 자동 파싱', '팀원 최대 80명 · 사업장 3개', 'SSO 자동 로그인 (애드온)', '이메일 · 채팅 지원'],
    ctaLabel: 'Business 시작하기',
  },
]

// ── 기능 비교표 ───────────────────────────────────────────────
type PlanId = 'free' | 'starter' | 'team' | 'business'
type CellValue = true | false | string

const FEATURE_ROWS: Array<{
  label: string
  highlight?: boolean   // Business 열 강조 (오렌지 볼드)
  cells: Record<PlanId, CellValue>
}> = [
  {
    label: '품질 학습 위키',
    cells: { free: true, starter: true, team: true, business: true },
  },
  {
    label: 'SPC · QC7 계산 도구',
    cells: { free: true, starter: true, team: true, business: true },
  },
  {
    label: 'FMEA 체험 데모',
    cells: { free: '1세션/일', starter: true, team: true, business: true },
  },
  {
    label: 'SaaS 도구 선택',
    cells: { free: false, starter: '1개', team: '3개', business: '전체 5개' },
  },
  {
    label: 'FMEA AI 챗봇',
    highlight: true,
    cells: { free: '데모만', starter: '월 3건', team: '월 10건', business: '무제한' },
  },
  {
    label: 'AI 다국어 번역',
    highlight: true,
    cells: { free: false, starter: '영어', team: '영어·중국어', business: '영어·중국어·베트남어' },
  },
  {
    label: 'Excel/PDF 자동 파싱',
    highlight: true,
    cells: { free: false, starter: false, team: false, business: true },
  },
  {
    label: '팀원 수',
    cells: { free: '3명', starter: '10명', team: '30명', business: '80명' },
  },
  {
    label: '사업장',
    cells: { free: '1개', starter: '1개', team: '2개', business: '3개' },
  },
  {
    label: 'SSO 자동 로그인',
    cells: { free: false, starter: false, team: false, business: '애드온' },
  },
  {
    label: '이메일 지원',
    cells: { free: false, starter: true, team: true, business: true },
  },
  {
    label: '채팅 지원',
    cells: { free: false, starter: false, team: true, business: true },
  },
]

const FAQ = [
  {
    q: '요금제는 언제든지 변경할 수 있나요?',
    a: '네, 언제든지 업그레이드 및 다운그레이드 가능합니다. 업그레이드는 즉시 반영되며, 다운그레이드는 다음 결제일부터 적용됩니다.',
  },
  {
    q: 'Starter · Team 플랜에서 어떤 도구를 선택할 수 있나요?',
    a: 'AuditSay · APQP Manager · NC Manager · Gauge Manager · 4M Change Manager 5가지 중에서 플랜에 맞는 수만큼 선택할 수 있습니다. 대시보드에서 언제든지 변경 가능합니다.',
  },
  {
    q: 'Enterprise 플랜은 어떻게 신청하나요?',
    a: '무제한 인원·사업장, SSO, 감사 로그, 전담 지원이 필요한 경우 서비스 요청 채널로 문의해 주세요. 맞춤 견적을 제공해 드립니다.',
  },
  {
    q: '무료 체험판이 있나요?',
    a: '회원가입 없이 품질 학습 위키와 SPC·QC7 계산 도구를 무료로 이용할 수 있습니다. 자매 SaaS 도구는 구독 후 이용 가능합니다.',
  },
  {
    q: 'FMEA AI 챗봇 사용량 한도는 어떻게 계산되나요?',
    a: 'Starter는 월 3건, Team은 월 10건, Business는 무제한입니다. 1건은 하나의 FMEA 항목 완성 기준이며, 매월 1일 초기화됩니다. 한도 초과 시 다음 달까지 대기하거나 Business로 업그레이드하여 즉시 무제한 사용이 가능합니다.',
  },
  {
    q: 'AI 다국어 번역은 어떻게 작동하나요?',
    a: 'Starter는 한국어→영어, Team은 영어·중국어 추가, Business는 베트남어까지 지원합니다. 한국 자동차 부품사가 글로벌 OEM에 보내는 고객 통보 문서, 8D 보고서, FMEA 문서 등을 AI가 자동 번역합니다.',
  },
  {
    q: '부가세는 별도인가요?',
    a: '표시 가격은 모두 VAT 별도입니다. 결제 시 부가세(10%)가 추가됩니다. 세금계산서 발행이 필요한 경우 결제 시 사업자 정보를 입력해 주세요.',
  },
  {
    q: '환불 정책은 어떻게 되나요?',
    a: '가입 후 7일 이내 전액 환불 가능합니다. 7일 이후에는 사용 기간에 비례한 환불이 가능하며, 자세한 내용은 이용약관을 참고해 주세요.',
  },
]

// ── Page (Server Component) ───────────────────────────────────
const PRICING_TITLE = "요금제 | QMintel — Free·Starter·Team·Business";
const PRICING_DESC =
  "QMintel 요금제 비교. Free 무료부터 Business 5개 도구 전체까지. 도구 1개 선택부터 시작하는 합리적 가격.";

export const metadata: Metadata = {
  title: PRICING_TITLE,
  description: PRICING_DESC,
  openGraph: {
    title: PRICING_TITLE,
    description: PRICING_DESC,
    type: "website",
    locale: "ko_KR",
    siteName: "QMintel",
  },
  twitter: {
    card: "summary",
    title: PRICING_TITLE,
    description: PRICING_DESC,
  },
};

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
                  <td className={`py-3 pr-4 ${row.highlight ? 'font-semibold text-foreground' : 'text-foreground'}`}>
                    {row.label}
                  </td>
                  {planIds.map((id) => {
                    const cell = row.cells[id as PlanId] ?? false
                    const isBizHighlight = row.highlight && id === 'business'
                    return (
                      <td key={id} className="py-3 px-3 text-center">
                        {cell === true ? (
                          <Check className={`h-4 w-4 mx-auto ${isBizHighlight ? 'text-brand-orange' : 'text-brand-orange'}`} />
                        ) : cell === false ? (
                          <span className="text-muted-foreground/40 text-lg leading-none">—</span>
                        ) : (
                          <span className={`text-sm font-medium ${isBizHighlight ? 'text-brand-orange font-bold' : 'text-foreground'}`}>
                            {cell}
                          </span>
                        )}
                      </td>
                    )
                  })}
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
      <div className="text-center mb-6">
        <p className="text-sm text-muted-foreground">
          직접 QMS를 구축하면 얼마나 드는지 비교해 보셨나요?{' '}
          <Link href="/compare" className="text-brand-orange font-medium hover:underline">
            자체 구축 vs QMintel 비용 비교 →
          </Link>
        </p>
      </div>

      {/* VAT 별도 안내 */}
      <div className="text-center mb-10">
        <p className="text-xs text-muted-foreground/70">
          모든 가격은 VAT 별도입니다. 부가세는 결제 시 자동 계산됩니다.
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
