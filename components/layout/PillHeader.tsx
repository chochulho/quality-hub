"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Menu, BookOpen, ArrowRight, LayoutDashboard, Shield,
  ChevronDown, ExternalLink,
} from "lucide-react";
import MobileNav from "./MobileNav";
import LogoutButton from "@/components/auth/LogoutButton";
import GradeBadge from "@/components/dashboard/GradeBadge";
import { createClient } from "@/lib/supabase/client";
import { SUPERADMIN_EMAIL, ALL_TOOL_IDS, TOOLS, type Grade } from "@/lib/auth/grades";

type ClientSession = {
  name: string;
  grade: Grade;
  role: "superadmin" | "company_admin" | "member";
} | null;

const TOOL_DOT: Record<string, string> = {
  "auditsay": "bg-brand-navy",
  "nc-manager": "bg-red-600",
  "apqp-manager": "bg-brand-orange",
  "gauge-manager": "bg-green-700",
  "4m-change-manager": "bg-purple-700",
};

const INTERNAL_TOOLS = [
  { href: "/spc",       label: "SPC 분석기",     desc: "공정능력 · 관리도" },
  { href: "/qc7",       label: "QC 7가지 도구",  desc: "히스토그램 · 파레토 · 특성요인도" },
  { href: "/new-qc7",   label: "신QC 7가지 도구",desc: "친화도 · 연관도 · 계통도" },
  { href: "/qfd",       label: "QFD",            desc: "품질기능전개 · HOQ" },
  { href: "/vsm",       label: "VSM",            desc: "가치흐름지도" },
  { href: "/kanban",    label: "Kanban",         desc: "칸반 시뮬레이터" },
];

const SUPPORT_LINKS = [
  { href: "/support/qna",     label: "Q&A",       desc: "자주 묻는 질문" },
  { href: "/support/notice",  label: "공지사항",  desc: "업데이트 · 소식" },
  { href: "/support/request", label: "서비스 요청", desc: "문의 · 기능 제안" },
];

export default function PillHeader() {
  const [scrolled,        setScrolled]        = useState(false);
  const [mobileOpen,      setMobileOpen]      = useState(false);
  const [session,         setSession]         = useState<ClientSession>(null);
  const [activeDropdown,  setActiveDropdown]  = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  // 클라이언트 사이드 auth 상태 구독
  useEffect(() => {
    const supabase = createClient();

    async function fetchProfile() {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession?.user) { setSession(null); return; }

      if (authSession.user.email === SUPERADMIN_EMAIL) {
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
        setSession(null);
      }
    }

    fetchProfile();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => fetchProfile());
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggle = (name: string) =>
    setActiveDropdown((prev) => (prev === name ? null : name));

  return (
    <>
      <header className="fixed top-4 md:top-6 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none">
        {/* pointer-events-auto 래퍼 + relative (드롭다운 기준점) */}
        <div ref={navRef} className="pointer-events-auto w-full max-w-5xl relative">
          <nav
            className={`flex items-center justify-between px-5 py-3 bg-white/90 backdrop-blur-md border border-border rounded-full transition-shadow duration-200 ${
              scrolled ? "shadow-md" : "shadow-sm"
            }`}
          >
            {/* 로고 */}
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-brand-navy shrink-0"
              onClick={() => setActiveDropdown(null)}
            >
              <BookOpen className="h-5 w-5 text-brand-orange" />
              <span className="text-sm md:text-base">Quality Hub</span>
            </Link>

            {/* 데스크탑 네비게이션 */}
            <ul className="hidden md:flex items-center gap-6">
              {/* 학습 */}
              <li>
                <Link
                  href="/learn"
                  onClick={() => setActiveDropdown(null)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  학습
                </Link>
              </li>

              {/* 도구 드롭다운 */}
              <li className="relative">
                <button
                  onClick={() => toggle("tools")}
                  className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                    activeDropdown === "tools"
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  도구
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      activeDropdown === "tools" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {activeDropdown === "tools" && (
                  <div className="absolute top-[calc(100%+16px)] left-1/2 -translate-x-1/2 w-[540px] bg-white border border-border rounded-2xl shadow-xl p-5 z-50">
                    <div className="grid grid-cols-2 gap-6">
                      {/* SaaS 도구 */}
                      <div>
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          SaaS 도구
                        </p>
                        <ul className="space-y-2.5">
                          {ALL_TOOL_IDS.map((id) => {
                            const tool = TOOLS[id];
                            return (
                              <li key={id}>
                                <a
                                  href={tool.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => setActiveDropdown(null)}
                                  className="flex items-center gap-2.5 group"
                                >
                                  <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${TOOL_DOT[id]}`} />
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-foreground group-hover:text-brand-navy transition-colors leading-none">
                                      {tool.name}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                                      {tool.tagline}
                                    </p>
                                  </div>
                                  <ExternalLink className="h-3 w-3 text-muted-foreground ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      {/* 내장 도구 */}
                      <div>
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          내장 도구 <span className="normal-case font-normal">(무료)</span>
                        </p>
                        <ul className="space-y-2.5">
                          {INTERNAL_TOOLS.map((tool) => (
                            <li key={tool.href}>
                              <Link
                                href={tool.href}
                                onClick={() => setActiveDropdown(null)}
                                className="flex items-center gap-2.5 group"
                              >
                                <span className="h-2.5 w-2.5 rounded-full shrink-0 bg-muted-foreground/30" />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-foreground group-hover:text-brand-navy transition-colors leading-none">
                                    {tool.label}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                                    {tool.desc}
                                  </p>
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </li>

              {/* 블로그 */}
              <li>
                <Link
                  href="/blog"
                  onClick={() => setActiveDropdown(null)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  블로그
                </Link>
              </li>

              {/* 요금제 */}
              <li>
                <Link
                  href="/pricing"
                  onClick={() => setActiveDropdown(null)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  요금제
                </Link>
              </li>

              {/* 지원 드롭다운 */}
              <li className="relative">
                <button
                  onClick={() => toggle("support")}
                  className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                    activeDropdown === "support"
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  지원
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      activeDropdown === "support" ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {activeDropdown === "support" && (
                  <div className="absolute top-[calc(100%+16px)] right-0 w-52 bg-white border border-border rounded-2xl shadow-xl p-2 z-50">
                    <ul className="space-y-0.5">
                      {SUPPORT_LINKS.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            onClick={() => setActiveDropdown(null)}
                            className="flex flex-col px-3 py-2.5 rounded-xl hover:bg-muted transition-colors"
                          >
                            <span className="text-sm font-medium text-foreground">{link.label}</span>
                            <span className="text-[11px] text-muted-foreground mt-0.5">{link.desc}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            </ul>

            {/* 우측 — 로그인 상태에 따라 분기 */}
            <div className="flex items-center gap-2">
              {session ? (
                <div className="hidden md:flex items-center gap-2">
                  <GradeBadge grade={session.grade} size="sm" />
                  {session.role === "superadmin" && (
                    <Link
                      href="/admin"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-brand-orange transition-colors"
                    >
                      <Shield className="h-3.5 w-3.5" />
                      관리자
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    onClick={() => setActiveDropdown(null)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold bg-brand-navy text-white rounded-full px-4 py-2 hover:bg-brand-navy-dark transition-all hover:-translate-y-0.5 duration-200"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    대시보드
                  </Link>
                  <LogoutButton showIcon={false} />
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    href="/login"
                    onClick={() => setActiveDropdown(null)}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
                  >
                    로그인
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setActiveDropdown(null)}
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

        </div>
      </header>

      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        userSession={session}
      />
    </>
  );
}
