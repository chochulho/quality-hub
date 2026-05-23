import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, AlertCircle, ArrowUpRight } from 'lucide-react'
import { getSession } from '@/lib/auth/session'
import { ALL_TOOL_IDS, TOOLS, isToolUnlocked, GRADE_LABELS, PRICING_TIERS } from '@/lib/auth/grades'
import ToolAccessCard from '@/components/dashboard/ToolAccessCard'
import GradeBadge from '@/components/dashboard/GradeBadge'
import LogoutButton from '@/components/auth/LogoutButton'

export const metadata = { title: '대시보드' }

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const isPending = session.companyStatus === 'pending'
  const unlockedCount = ALL_TOOL_IDS.filter((id) =>
    isToolUnlocked(session.grade, id)
  ).length

  const nextTier = PRICING_TIERS.find(
    (t) => t.toolCount > unlockedCount && t.id !== 'free'
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">

      {/* 헤더 */}
      <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">
            안녕하세요, <span className="font-medium text-foreground">{session.name}</span>님
            {session.companyName && (
              <span className="ml-1.5 text-muted-foreground">
                · {session.companyName}
              </span>
            )}
          </p>
          <h1 className="text-3xl font-extrabold text-brand-navy tracking-tight">
            내 도구 대시보드
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <GradeBadge grade={session.grade} />
            <span className="text-sm text-muted-foreground">
              {isPending ? '승인 대기 중' : `${unlockedCount}개 도구 이용 중`}
            </span>
          </div>
        </div>
        <LogoutButton className="text-sm" />
      </div>

      {/* 기업 승인 대기 배너 */}
      {isPending && (
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800">기업회원 승인 대기 중</p>
            <p className="text-sm text-amber-700 mt-0.5">
              관리자 검토 후 활성화됩니다. 보통 1~2 영업일 내 이메일로 안내드립니다.
            </p>
          </div>
        </div>
      )}

      {/* 도구 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ALL_TOOL_IDS.map((toolId) => (
          <ToolAccessCard
            key={toolId}
            tool={TOOLS[toolId]}
            unlocked={!isPending && isToolUnlocked(session.grade, toolId)}
            currentGrade={session.grade}
          />
        ))}
      </div>

      {/* 업그레이드 CTA (Platinum이 아닌 경우) */}
      {session.grade !== 'platinum' && !isPending && nextTier && (
        <div className="mt-12 rounded-3xl bg-brand-navy p-8 md:p-10">
          <div className="max-w-2xl">
            <p className="text-xs font-medium text-white/60 mb-2 uppercase tracking-wide">
              업그레이드
            </p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
              {GRADE_LABELS[nextTier.id]} 플랜으로{' '}
              <span className="text-brand-orange">{nextTier.toolCount}개</span>
              {' '}도구를 이용하세요
            </h2>
            <p className="text-white/70 text-sm mb-6">
              {nextTier.features[nextTier.features.length - 1]}
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 bg-brand-orange text-white rounded-full px-6 py-3 font-semibold hover:bg-brand-orange-hover transition-all hover:-translate-y-0.5 duration-200 text-sm"
            >
              요금제 보기
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* 학습 콘텐츠 바로가기 */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/learn"
          className="group flex items-center justify-between p-5 rounded-2xl border border-border bg-white hover:border-brand-navy transition-colors"
        >
          <div>
            <p className="font-semibold text-foreground">품질 학습 위키</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              SPC, FMEA, IATF 등 45개+ 아티클
            </p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-brand-orange transition-colors" />
        </Link>
        <Link
          href="/spc"
          className="group flex items-center justify-between p-5 rounded-2xl border border-border bg-white hover:border-brand-navy transition-colors"
        >
          <div>
            <p className="font-semibold text-foreground">SPC 분석 도구</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              공정능력 분석 · 관리도 — 무료 이용
            </p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-brand-orange transition-colors" />
        </Link>
      </div>
    </div>
  )
}
