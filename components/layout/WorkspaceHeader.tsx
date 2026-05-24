import Link from "next/link";
import {
  LayoutDashboard, BookOpen, Calculator, Users, Building2,
  CreditCard, BookMarked, Shield,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import WorkspaceUserMenu from "./WorkspaceUserMenu";

/**
 * WorkspaceHeader — 로그인한 기업 회원 전용 헤더 (§6)
 *
 * 규칙:
 * - 마케팅 헤더와 완전 분리 (PillHeader와 공유하지 않음).
 * - 메시 그라디언트·오렌지 CTA 자제 — navy 기반 차분한 톤.
 * - 블로그·요금제·Q&A 링크 노출 금지.
 * - 역할 기반 메뉴: admin+ 인원/사업장, owner만 결제.
 */
export default async function WorkspaceHeader() {
  const session = await getSession();
  if (!session) return null; // 미로그인은 마케팅 레이아웃이 처리

  const isSuperAdmin = session.role === "superadmin";
  const isAdmin = session.role === "company_admin" || isSuperAdmin;
  const isOwner = session.role === "company_admin" || isSuperAdmin; // v0.1: company_admin = owner

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-navy border-b border-white/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* 로고 + 회사명 */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2 text-white">
            <BookOpen className="h-5 w-5 text-brand-orange" />
            <span className="font-bold text-sm hidden sm:block">
              {session.companyName ?? "Quality Hub"}
            </span>
          </Link>
        </div>

        {/* 네비게이션 */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {/* 대시보드 */}
          <NavItem href="/dashboard" Icon={LayoutDashboard} label="대시보드" />

          {/* 참고 자료 (공개 URL로 연결 — /reference/* 준비 후 교체) */}
          <NavItem href="/calculators" Icon={Calculator} label="계산 도구" />
          <NavItem href="/learn" Icon={BookMarked} label="위키" />

          {/* admin+ 전용 */}
          {isAdmin && (
            <>
              <NavItem href="/members" Icon={Users} label="인원 관리" />
              <NavItem href="/sites" Icon={Building2} label="사업장" />
            </>
          )}

          {/* owner 전용 */}
          {isOwner && (
            <NavItem href="/billing" Icon={CreditCard} label="결제" />
          )}

          {/* superadmin */}
          {isSuperAdmin && (
            <NavItem href="/admin" Icon={Shield} label="관리자" className="text-brand-orange" />
          )}
        </nav>

        {/* 우측: 사용자 메뉴 */}
        <div className="flex items-center gap-2 shrink-0">
          <WorkspaceUserMenu
            name={session.name}
            grade={session.grade}
            role={session.role ?? "member"}
          />
        </div>
      </div>
    </header>
  );
}

function NavItem({
  href,
  Icon,
  label,
  className = "",
}: {
  href: string;
  Icon: React.ElementType;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors ${className}`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
