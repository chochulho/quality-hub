import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Lock, Zap, Check } from 'lucide-react'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { TOOLS, PLAN_LABELS, type ToolId } from '@/lib/auth/grades'
import PaymentButton from '@/components/billing/PaymentButton'

export const metadata = { title: '업그레이드' }

// 플랜별 표시용 기능 목록
function getPlanFeatures(planId: string, monthlyKRW: number): string[] {
  const fmtPrice = `₩${monthlyKRW.toLocaleString()}/월`
  const map: Record<string, string[]> = {
    starter: [
      `SaaS 도구 1개 선택 · ${fmtPrice}`,
      'FMEA AI 챗봇 월 3건',
      'AI 영문 번역',
      '팀원 최대 10명',
    ],
    team: [
      `SaaS 도구 3개 선택 · ${fmtPrice}`,
      'FMEA AI 챗봇 월 10건',
      'AI 영문 + 중국어 번역',
      '팀원 최대 30명',
    ],
    business: [
      `5개 도구 전체 · ${fmtPrice}`,
      'FMEA AI 챗봇 무제한',
      'AI 다국어 번역 3개 언어',
      'Excel/PDF FMEA 자동 파싱',
      '팀원 최대 80명',
    ],
  }
  return map[planId] ?? []
}

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ tool?: string; from?: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login?next=/billing/upgrade')

  const { tool: toolParam } = await searchParams
  const targetTool = toolParam as ToolId | undefined
  const toolDef = targetTool ? TOOLS[targetTool] : null

  const currentPlan = session.planId
  const currentPlanName = PLAN_LABELS[currentPlan as keyof typeof PLAN_LABELS] ?? currentPlan

  // DB에서 플랜 가격 조회
  const supabase = await createClient()
  const { data: plans } = await supabase
    .from('plans')
    .select('id, name, price_krw_monthly, price_krw_yearly')
    .in('id', ['starter', 'team', 'business'])
    .order('sort_order')

  // 현재 플랜보다 상위 플랜만 표시
  const planOrder = ['free', 'starter', 'team', 'business', 'enterprise']
  const currentIdx = planOrder.indexOf(currentPlan)
  const availablePlans = (plans ?? []).filter(
    (p) => planOrder.indexOf(p.id) > currentIdx
  )

  if (availablePlans.length === 0) redirect('/dashboard')

  const recommendedPlan = availablePlans[0]

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">

      {/* 헤더 */}
      <div className="text-center mb-10">
        {toolDef ? (
          <>
            <div className={`inline-flex items-center gap-2 ${toolDef.color} text-white rounded-full px-4 py-2 text-sm font-semibold mb-4`}>
              <Lock className="h-4 w-4" />
              {toolDef.name} 잠금
            </div>
            <h1 className="text-3xl font-extrabold text-brand-navy mb-3">
              {toolDef.name}을 이용하려면<br />업그레이드가 필요합니다
            </h1>
            <p className="text-muted-foreground">
              현재 <strong>{currentPlanName}</strong> 플랜 · {toolDef.name}은 Starter 이상에서 선택 가능
            </p>
          </>
        ) : (
          <>
            <div className="inline-flex items-center gap-2 bg-brand-orange text-white rounded-full px-4 py-2 text-sm font-semibold mb-4">
              <Zap className="h-4 w-4" />
              플랜 업그레이드
            </div>
            <h1 className="text-3xl font-extrabold text-brand-navy mb-3">
              더 많은 도구를 이용하세요
            </h1>
            <p className="text-muted-foreground">
              현재 <strong>{currentPlanName}</strong> 플랜 · 업그레이드로 더 많은 기능을 이용하세요
            </p>
          </>
        )}
      </div>

      {/* 업그레이드 플랜 카드 */}
      <div className="space-y-4 mb-10">
        {availablePlans.map((plan) => {
          const isRecommended = plan.id === recommendedPlan.id
          const monthlyKRW   = plan.price_krw_monthly ?? 0
          const yearlyKRW    = plan.price_krw_yearly  ?? 0
          const features     = getPlanFeatures(plan.id, monthlyKRW)

          return (
            <div
              key={plan.id}
              className={`rounded-2xl border p-6 transition-all ${
                isRecommended
                  ? 'border-brand-orange bg-brand-orange/5 shadow-sm'
                  : 'border-border bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-extrabold text-brand-navy">{plan.name}</h3>
                    {isRecommended && (
                      <span className="text-[10px] font-bold bg-brand-orange text-white rounded-full px-2 py-0.5">
                        추천
                      </span>
                    )}
                  </div>
                  <ul className="space-y-1 mt-2">
                    {features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                        <Check className="h-3.5 w-3.5 text-brand-orange shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 가격 */}
                <div className="text-right shrink-0">
                  <div className="text-2xl font-extrabold text-brand-navy whitespace-nowrap">
                    ₩{monthlyKRW.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">/월 · VAT 별도</div>
                  {yearlyKRW > 0 && (
                    <div className="text-xs text-brand-orange font-medium mt-1">
                      연납 시 ₩{yearlyKRW.toLocaleString()}/년
                    </div>
                  )}
                </div>
              </div>

              {/* 결제 버튼 (Client Component) */}
              <PaymentButton
                planId={plan.id}
                planName={plan.name}
                billingType="monthly"
                orgName={session.orgName ?? ''}
                isRecommended={isRecommended}
              />

              {/* 연납 버튼 */}
              {yearlyKRW > 0 && (
                <div className="mt-2">
                  <PaymentButton
                    planId={plan.id}
                    planName={plan.name}
                    billingType="yearly"
                    orgName={session.orgName ?? ''}
                    isRecommended={false}
                    label={`연간 결제 ₩${yearlyKRW.toLocaleString()}/년 (2개월 무료)`}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* VAT 안내 */}
      <p className="text-xs text-muted-foreground text-center mb-6">
        모든 가격은 VAT 별도입니다. 결제 시 부가세(10%)가 추가됩니다.
      </p>

      {/* 문의 안내 */}
      <div className="rounded-2xl bg-muted/60 border border-border p-5 text-sm text-muted-foreground text-center">
        <p>
          결제 관련 문의:{' '}
          <Link href="/support/request" className="text-brand-orange font-medium hover:underline">
            서비스 요청
          </Link>
        </p>
      </div>

      <div className="mt-6 text-center">
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← 대시보드로 돌아가기
        </Link>
      </div>
    </div>
  )
}
