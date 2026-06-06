import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard, BookOpen, Calculator, Users, Building2,
  CreditCard, BookMarked, Shield, Settings,
} from "lucide-react";
import { getSession } from "@/lib/auth/session";
import WorkspaceUserMenu from "./WorkspaceUserMenu";

/**
 * WorkspaceHeader — 로그인한 기업 회원 전용 헤더 (§6)
 * v2: session.grade → session.planId, role 체계 변경
 */
export default async function WorkspaceHeader() {
  const session = await getSession();
  if (!session) return null;

  const isSuperAdmin = session.role === "superadmin";
  const isAdmin = session.role === "owner" || session.role === "admin" || isSuperAdmin;
  const isOwner = session.role === "owner" || isSuperAdmin;

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-navy border-b border-white/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* 로고 + 조직명 */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-2 text-white">
            {session.logoUrl ? (
              <Image
                src={session.logoUrl}
                alt={session.orgName ?? "QMintel"}
                width={80}
                height={28}
                className="h-7 w-auto max-w-[80px] object-contain"
                unoptimized
              />
            ) : (
              <BookOpen className="h-5 w-5 text-brand-orange" />
            )}
            <span className="font-bold text-sm hidden sm:block">
              {session.orgName ?? "QMintel"}
            </span>
          </Link>
        </div>

        {/* 네비게이션 */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          <NavItem href="/dashboard" Icon={LayoutDashboard} label="대시보드" />
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
            <>
              <NavItem href="/billing" Icon={CreditCard} label="결제" />
              <NavItem href="/settings" Icon={Settings} label="설정" />
            </>
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
            planId={session.planId}
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
