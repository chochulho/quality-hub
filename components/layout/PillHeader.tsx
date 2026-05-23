"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, BookOpen, ArrowRight, LayoutDashboard, Shield } from "lucide-react";
import MobileNav from "./MobileNav";
import LogoutButton from "@/components/auth/LogoutButton";
import GradeBadge from "@/components/dashboard/GradeBadge";
import { createClient } from "@/lib/supabase/client";
import { SUPERADMIN_EMAIL, type Grade } from "@/lib/auth/grades";

type ClientSession = {
  name: string;
  grade: Grade;
  role: "superadmin" | "company_admin" | "member";
} | null;

const navLinks = [
  { href: "/learn", label: "학습" },
  { href: "/blog", label: "블로그" },
  { href: "/tools", label: "도구" },
  { href: "/pricing", label: "요금제" },
  { href: "/about", label: "소개" },
];

export default function PillHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [session, setSession] = useState<ClientSession>(null);

  // 클라이언트 사이드 auth 상태 구독
  useEffect(() => {
    const supabase = createClient();

    async function fetchProfile() {
      const { data: { session: authSession } } = await supabase.auth.getSession();

      if (!authSession?.user) {
        setSession(null);
        return;
      }

      const isSuperadmin = authSession.user.email === SUPERADMIN_EMAIL;
      if (isSuperadmin) {
        setSession({ name: "관리자", grade: "platinum", role: "superadmin" });
        return;
      }

      const { data } = await supabase.rpc("qh_get_my_profile");
      const profile = data?.[0];

      if (profile) {
        setSession({
          name: profile.prof_name,
          grade: (profile.company_grade as Grade) ?? "free",
          role: profile.role ?? "member",
        });
      } else {
        // auth 유저는 있지만 qh_profiles가 없는 경우 (가입 미완료)
        setSession(null);
      }
    }

    fetchProfile();

    // 로그인/로그아웃 시 자동 갱신
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className="fixed top-4 md:top-6 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none">
        <nav
          className={`pointer-events-auto w-full max-w-5xl flex items-center justify-between px-5 py-3 bg-white/90 backdrop-blur-md border border-border rounded-full transition-shadow duration-200 ${
            scrolled ? "shadow-md" : "shadow-sm"
          }`}
        >
          {/* 로고 */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-brand-navy shrink-0"
          >
            <BookOpen className="h-5 w-5 text-brand-orange" />
            <span className="text-sm md:text-base">Quality Hub</span>
          </Link>

          {/* 데스크탑 네비게이션 */}
          <ul className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* 우측 — 로그인 상태에 따라 분기 */}
          <div className="flex items-center gap-2">
            {session ? (
              // 로그인 상태
              <div className="hidden md:flex items-center gap-2">
                <GradeBadge grade={session.grade} size="sm" />
                {session.role === "superadmin" && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-brand-orange transition-colors"
                  >
                    <Shield className="h-3.5 w-3.5" />
                    관리자
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold bg-brand-navy text-white rounded-full px-4 py-2 hover:bg-brand-navy-dark transition-all hover:-translate-y-0.5 duration-200"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  대시보드
                </Link>
                <LogoutButton showIcon={false} />
              </div>
            ) : (
              // 비로그인 상태
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
                >
                  로그인
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold bg-brand-orange text-white rounded-full px-4 py-2 hover:bg-brand-orange-hover transition-all hover:-translate-y-0.5 duration-200"
                >
                  시작하기
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}

            {/* 모바일 햄버거 */}
            <button
              className="md:hidden p-1.5 text-foreground rounded-full hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="메뉴 열기"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </header>

      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={navLinks}
        userSession={session}
      />
    </>
  );
}
