import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Settings2 } from 'lucide-react'
import { getSession } from '@/lib/auth/session'
import { ALL_TOOL_IDS, TOOLS, isToolUnlocked, type ToolId } from '@/lib/auth/grades'
import { createClient } from '@/lib/supabase/server'
import ToolAccessCard from '@/components/dashboard/ToolAccessCard'
import GradeBadge from '@/components/dashboard/GradeBadge'
import DashboardStats from '@/components/dashboard/DashboardStats'
import LogoutButton from '@/components/auth/LogoutButton'
import ToolSelectTrigger from '@/components/dashboard/ToolSelectTrigger'

export const metadata = { title: '대시보드' }

const PLAN_MAX_TOOLS: Record<string, number> = { starter: 1, team: 3 }

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const isPending = session.orgStatus === 'pending'
  const isSelectable = session.planId === 'starter' || session.planId === 'team'
  const isTopPlan = session.planId === 'business' || session.planId === 'enterprise'

  // Starter/Team: org_selected_tools 조회
  let selectedTools: ToolId[] = []
  if (session.orgId && isSelectable) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('org_selected_tools')
      .select('tool_key')
      .eq('org_id', session.orgId)
    selectedTools = (data ?? []).map((r) => r.tool_key as ToolId)
  }

  const unlockedIds = ALL_TOOL_IDS.filter((id) =>
    isToolUnlocked(session.planId, id, selectedTools)
  )
  const maxSelectable = PLAN_MAX_TOOLS[session.planId]
  const needsSelection = isSelectable && selectedTools.length === 0 && !isPending

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">

      {/* ── 헤더 ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">
            안녕하세요,{' '}
            <span className="font-medium text-foreground">{session.name}</span>님
            {session.orgName && (
              <span className="ml-1.5 text-muted-foreground">· {session.orgName}</span>
            )}
          </p>
          <h1 className="text-3xl font-extrabold text-brand-navy tracking-tight">
            내 도구 대시보드
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <GradeBadge planId={session.planId} />
          </div>
        </div>
        <LogoutButton className="text-sm" />
      </div>

      {/* ── 통계 위젯 ─────────────────────────────────────────── */}
      <DashboardStats
        orgName={session.orgName}
        planId={session.planId}
        unlockedCount={unlockedIds.length}
        totalTools={ALL_TOOL_IDS.length}
        selectedCount={isSelectable ? selectedTools.length : undefined}
        maxSelectable={isSelectable ? maxSelectable : undefined}
        isPending={isPending}
      />

      {/* ── 승인 대기 배너 ────────────────────────────────────── */}
      {isPending && (
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4 flex gap-3 items-start">
          <span className="text-xl mt-0.5">⏳</span>
          <div>
            <p className="font-semibold text-amber-800">기업회원 승인 대기 중</p>
            <p className="text-sm text-amber-700 mt-0.5">
              관리자 검토 후 활성화됩니다. 보통 1~2 영업일 내 이메일로 안내드립니다.
            </p>
          </div>
        </div>
      )}

      {/* ── 도구 선택 안내 (Starter / Team, 선택 안 된 경우) ─── */}
      {needsSelection && (
        <div className="mb-8 rounded-2xl border border-brand-orange/40 bg-brand-orange/5 px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <Settings2 className="h-5 w-5 text-brand-orange shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-brand-navy">
                사용할 도구를 선택해 주세요
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {session.planId === 'starter' ? '1개' : '3개'} 도구를 선택하면 워크스페이스에서 바로 이용할 수 있습니다.
              </p>
            </div>
          </div>
          {/* Client-side 모달 트리거 */}
          <ToolSelectTrigger
            planId={session.planId}
            currentSelected={selectedTools}
          />
        </div>
      )}

      {/* ── 도구 카드 그리드 ──────────────────────────────────── */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          SaaS 도구
        </h2>
        {isSelectable && selectedTools.length > 0 && !isPending && (
          <ToolSelectTrigger
            planId={session.planId}
            currentSelected={selectedTools}
            variant="ghost"
          />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {ALL_TOOL_IDS.map((toolId) => (
          <ToolAccessCard
            key={toolId}
            tool={TOOLS[toolId]}
            unlocked={!isPending && isToolUnlocked(session.planId, toolId, selectedTools)}
            planId={session.planId}
          />
        ))}
      </div>

      {/* ── 업그레이드 CTA ────────────────────────────────────── */}
      {!isTopPlan && !isPending && (
        <div
          className="mb-10 rounded-3xl p-8 md:p-10"
          style={{
            background: `
              radial-gradient(ellipse at 90% 10%, rgba(255, 232, 194, 0.4), transparent 60%),
              #1E3666
            `,
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-xl">
              <p className="text-xs font-medium text-white/60 mb-2 uppercase tracking-wide">
                업그레이드
              </p>
              <h2 className="text-xl md:text-2xl font-extrabold text-white mb-2">
                {session.planId === 'free'
                  ? '도구를 이용하려면 Starter 플랜으로 시작하세요'
                  : session.planId === 'starter'
                  ? 'Team으로 업그레이드하면 3개 도구를 선택할 수 있습니다'
                  : 'Business 플랜으로 5개 도구를 모두 이용하세요'}
              </h2>
              <p className="text-white/60 text-sm">
                베타 기간 50% 할인 적용 중
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link
                href="/billing/upgrade"
                className="inline-flex items-center gap-2 bg-brand-orange text-white rounded-full px-6 py-3 font-semibold hover:bg-brand-orange-hover transition-all hover:-translate-y-0.5 duration-200 text-sm"
              >
                업그레이드
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/compare"
                className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/20 rounded-full px-6 py-3 font-semibold hover:bg-white/20 transition-all text-sm"
              >
                비용 비교
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── 참고 자료 바로가기 ────────────────────────────────── */}
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
        무료 도구 · 학습
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            href: '/calculators/spc',
            title: 'SPC 분석 도구',
            desc: '공정능력 분석 · 관리도 — 무료',
          },
          {
            href: '/calculators/fmea-demo',
            title: 'FMEA 체험 데모',
            desc: 'AI 대화형 AIAG-VDA FMEA — 무료',
          },
          {
            href: '/learn',
            title: '품질 학습 위키',
            desc: 'SPC · FMEA · IATF 아티클',
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center justify-between p-5 rounded-2xl border border-border bg-white hover:border-brand-navy transition-colors"
          >
            <div>
              <p className="font-semibold text-foreground text-sm">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-brand-orange transition-colors shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  )
}
