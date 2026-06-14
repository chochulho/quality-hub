import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Check, Lock, Zap } from 'lucide-react'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { TOOLS, PLAN_LABELS, type ToolId } from '@/lib/auth/grades'

export const metadata = { title: '업그레이드' }

// 플랜 업그레이드 경로 정의
const UPGRADE_PATH = [
  { id: 'starter', name: 'Starter', monthlyKRW: 49000,  tools: 1 },
  { id: 'team',    name: 'Team',    monthlyKRW: 149000, tools: 3 },
  { id: 'business',name: 'Business',monthlyKRW: 290000, tools: 5 },
]

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

  // 현재 플랜보다 상위 플랜만 표시
  const planOrder = ['free', 'starter', 'team', 'business', 'enterprise']
  const currentIdx = planOrder.indexOf(currentPlan)
  const availablePlans = UPGRADE_PATH.filter(
    (p) => planOrder.indexOf(p.id) > currentIdx
  )

  if (availablePlans.length === 0) {
    // 이미 최고 플랜
    redirect('/dashboard')
  }

  // 추천 플랜: 도구가 지정된 경우 해당 도구를 포함하는 최소 플랜
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
              {toolDef.name}을 이용하려면
              <br />
              업그레이드가 필요합니다
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
              현재 <strong>{currentPlanName}</strong> 플랜 · 업그레이드로 더 많은 SaaS 도구를 이용하세요
            </p>
          </>
        )}
      </div>

      {/* 업그레이드 플랜 카드 */}
      <div className="space-y-4 mb-10">
        {availablePlans.map((plan, i) => {
          const isRecommended = plan.id === recommendedPlan.id

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
                  <p className="text-sm text-muted-foreground mb-3">
                    SaaS 도구 <strong>{plan.tools}개</strong> 선택 가능
                    {plan.tools === 5 && ' (전체)'}
                  </p>
                  <ul className="space-y-1">
                    {[
                      `SaaS 도구 ${plan.tools}개 ${plan.tools === 5 ? '전체' : '선택'}`,
                      'SPC · QC7 계산 도구 (무료 유지)',
                      plan.id === 'business' ? '팀원 최대 80명' : plan.id === 'team' ? '팀원 최대 30명' : '팀원 최대 10명',
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                        <Check className="h-3.5 w-3.5 text-brand-orange shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-2xl font-extrabold text-brand-navy">
                    ₩{plan.monthlyKRW.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">/월</div>
                  <div className="text-xs text-brand-orange font-medium mt-1">베타 50% 할인</div>
                  <div className="text-lg font-bold text-brand-orange">
                    ₩{Math.round(plan.monthlyKRW * 0.5).toLocaleString()}
                    <span className="text-xs font-normal text-muted-foreground">/월</span>
                  </div>
                </div>
              </div>

              {/* CTA — TODO: 결제 연동 후 실제 결제 플로우 연결 */}
              <button
                disabled
                className={`mt-4 w-full flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold text-sm transition-all ${
                  isRecommended
                    ? 'bg-brand-orange text-white opacity-60 cursor-not-allowed'
                    : 'border border-border text-muted-foreground cursor-not-allowed'
                }`}
              >
                {plan.name} 업그레이드 (결제 연동 준비 중)
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>

      {/* 안내 */}
      <div className="rounded-2xl bg-muted/60 border border-border p-5 text-sm text-muted-foreground text-center">
        <p className="mb-2">결제 연동 준비 중입니다.</p>
        <p>
          지금 바로 이용하려면{' '}
          <Link href="/support/request" className="text-brand-orange font-medium hover:underline">
            서비스 요청
          </Link>
          으로 문의해 주세요.
        </p>
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← 대시보드로 돌아가기
        </Link>
      </div>
    </div>
  )
}
