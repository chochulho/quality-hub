"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Menu, BookOpen, ArrowRight, LayoutDashboard, Shield,
  ChevronDown, ExternalLink, BarChart3, ListChecks, BookMarked,
  GraduationCap, FlaskConical,
} from "lucide-react";
import MobileNav from "./MobileNav";
import LogoutButton from "@/components/auth/LogoutButton";
import GradeBadge from "@/components/dashboard/GradeBadge";
import { createClient } from "@/lib/supabase/client";
import { SUPERADMIN_EMAIL, ALL_TOOL_IDS, TOOLS } from "@/lib/auth/grades";

type ClientSession = {
  name: string;
  planId: string;
  role: "superadmin" | "owner" | "admin" | "member";
  orgName?: string | null;
  logoUrl?: string | null;
  pending?: boolean;
} | null;

const TOOL_DOT: Record<string, string> = {
  "auditsay":           "bg-brand-navy",
  "nc-manager":         "bg-red-600",
  "apqp-manager":       "bg-brand-orange",
  "gauge-manager":      "bg-green-700",
  "4m-change-manager":  "bg-purple-700",
};

// SSO가 구성된 도구 — 로그인 시 /api/sso/:id 경유
const SSO_TOOL_IDS = new Set(["auditsay", "gauge-manager"]);

// 무료 계산 도구 (v2: VSM/Kanban 제거, /calculators/* 경로)
const CALCULATOR_TOOLS = [
  {
    href:  "/calculators/spc",
    label: "SPC 분석기",
    desc:  "공정능력 · 관리도",
    Icon:  BarChart3,
    color: "text-brand-orange",
  },
  {
    href:  "/calculators/qc7",
    label: "QC 7가지 도구",
    desc:  "파레토 · 히스토그램 · 특성요인도",
    Icon:  ListChecks,
    color: "text-brand-orange",
  },
  {
    href:  "/new-qc7",
    label: "신 QC 7가지 도구",
    desc:  "친화도 · 연관도 · 계통도 · PDPC",
    Icon:  ListChecks,
    color: "text-brand-orange",
  },
  {
    href:  "/calculators/fmea-demo",
    label: "FMEA 체험 데모",
    desc:  "AI 대화형 AIAG-VDA",
    Icon:  FlaskConical,
    color: "text-brand-orange",
  },
] as const;

// 학습 링크 (v2)
const LEARN_LINKS = [
  {
    href:  "/learn",
    label: "학습 위키",
    desc:  "IATF 16949 · SPC · MSA · FMEA",
    Icon:  BookMarked,
  },
  {
    href:  "/learn/exam/pqe",
    label: "시험 학습 코너",
    desc:  "품질기술사 · 신QC7 · QFD · Lean",
    Icon:  GraduationCap,
  },
];

const SUPPORT_LINKS = [
  { href: "/support/qna",     label: "Q&A",       desc: "자주 묻는 질문" },
  { href: "/support/notice",  label: "공지사항",  desc: "업데이트 · 소식" },
  { href: "/support/request", label: "서비스 요청", desc: "문의 · 기능 제안" },
];

export default function PillHeader() {
  const [scrolled,       setScrolled]       = useState(false);
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const [session,        setSession]        = useState<ClientSession>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
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
    let mounted = true;

    async function resolveSession(user: { email?: string | null } | null) {
      if (!mounted) return;
      if (!user?.email) { setSession(null); return; }

      if (user.email === SUPERADMIN_EMAIL) {
        setSession({ name: "관리자", planId: "enterprise", role: "superadmin", orgName: null, logoUrl: null });
        return;
      }

      const { data } = await supabase.rpc("get_my_membership");
      if (!mounted) return;
      const m = data?.[0];
      if (m) {
        setSession({
          name:    user.email?.split("@")[0] ?? "사용자",
          planId:  m.plan_id ?? "free",
          role:    m.member_role ?? "member",
          orgName: m.org_name ?? null,
          logoUrl: m.logo_url ?? null,
          pending: m.org_status === "pending",
        });
      } else {
        setSession(null);
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => { resolveSession(session?.user ?? null); }
    );
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggle = (name: string) =>
    setActiveDropdown((prev) => (prev === name ? null : name));
  const close = () => setActiveDropdown(null);

  const hasCompanyBar = !!session && !session.pending && !!(session.logoUrl || session.orgName)

  return (
    <>
      <header className="fixed top-4 md:top-6 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none">
        <div ref={navRef} className="pointer-events-auto w-full max-w-5xl relative">
          <nav
            className={`flex flex-col px-5 bg-white/90 backdrop-blur-md border border-border transition-shadow duration-200 ${
              hasCompanyBar ? "rounded-2xl" : "rounded-full"
            } ${scrolled ? "shadow-md" : "shadow-sm"}`}
          >
            {/* 회사 컨텍스트 바 */}
            {hasCompanyBar && (
              <div className="flex items-center justify-between pt-2.5 pb-2 border-b border-border/60">
                <div className="flex items-center gap-2 min-w-0">
                  {session!.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={session!.logoUrl}
                      alt={session!.orgName ?? ""}
                      className="h-5 w-auto max-w-[72px] object-contain shrink-0"
                    />
                  ) : null}
                  <span className="text-xs font-semibold text-foreground truncate max-w-[160px]">
                    {session!.orgName}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground/80 shrink-0 pl-4">
                  Powered by{" "}
                  <span className="font-semibold text-brand-navy">QMintel</span>
                </span>
              </div>
            )}

            {/* 메인 네비게이션 행 */}
            <div className={`flex items-center justify-between ${hasCompanyBar ? "py-2.5" : "py-3"}`}>

            {/* 로고 */}
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-brand-navy shrink-0"
              onClick={close}
            >
              <BookOpen className="h-5 w-5 text-brand-orange" />
              <span className="text-sm md:text-base">QMintel</span>
            </Link>

            {/* 데스크탑 네비게이션 */}
            <ul className="hidden md:flex items-center gap-5">

              {/* 학습 드롭다운 */}
              <li className="relative">
                <button
                  onClick={() => toggle("learn")}
                  className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                    activeDropdown === "learn"
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  학습
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${activeDropdown === "learn" ? "rotate-180" : ""}`} />
                </button>

                {activeDropdown === "learn" && (
                  <div className="absolute top-[calc(100%+16px)] left-1/2 -translate-x-1/2 w-72 bg-white border border-border rounded-2xl shadow-xl p-3 z-50">
                    <ul className="space-y-1">
                      {LEARN_LINKS.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            onClick={close}
                            className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors group"
                          >
                            <link.Icon className="h-4 w-4 text-brand-orange mt-0.5 shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-foreground group-hover:text-brand-navy transition-colors leading-none mb-0.5">
                                {link.label}
                              </p>
                              <p className="text-[11px] text-muted-foreground">{link.desc}</p>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>

              {/* 계산 도구 드롭다운 */}
              <li className="relative">
                <button
                  onClick={() => toggle("calc")}
                  className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                    activeDropdown === "calc"
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  계산 도구
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${activeDropdown === "calc" ? "rotate-180" : ""}`} />
                </button>

                {activeDropdown === "calc" && (
                  <div className="absolute top-[calc(100%+16px)] left-1/2 -translate-x-1/2 w-72 bg-white border border-border rounded-2xl shadow-xl p-3 z-50">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                      무료 계산 도구
                    </p>
                    <ul className="space-y-1">
                      {CALCULATOR_TOOLS.map((tool) => (
                        <li key={tool.href}>
                          <Link href={tool.href} onClick={close}>
                            <div className="flex items-start gap-3 px-3 py-2.5 rounded-xl transition-colors group hover:bg-muted cursor-pointer">
                              <tool.Icon className={`h-4 w-4 mt-0.5 shrink-0 ${tool.color}`} />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium leading-none mb-0.5 text-foreground group-hover:text-brand-navy transition-colors">
                                  {tool.label}
                                </p>
                                <p className="text-[11px] text-muted-foreground">{tool.desc}</p>
                              </div>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>

              {/* 도구(SaaS) 드롭다운 */}
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
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${activeDropdown === "tools" ? "rotate-180" : ""}`} />
                </button>

                {activeDropdown === "tools" && (
                  <div className="absolute top-[calc(100%+16px)] left-1/2 -translate-x-1/2 w-64 bg-white border border-border rounded-2xl shadow-xl p-3 z-50">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                      SaaS 도구
                    </p>
                    <ul className="space-y-0.5">
                      {ALL_TOOL_IDS.map((id) => {
                        const tool = TOOLS[id];
                        // 로그인 + SSO 지원 도구 → /api/sso/:id 경유 (같은 탭)
                        const useSso = !!session && SSO_TOOL_IDS.has(id);
                        const href = useSso ? `/api/sso/${id}` : tool.href;
                        return (
                          <li key={id}>
                            <a
                              href={href}
                              target={useSso ? "_self" : "_blank"}
                              rel={useSso ? undefined : "noopener noreferrer"}
                              onClick={close}
                              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors group"
                            >
                              <span className={`h-2 w-2 rounded-full shrink-0 ${TOOL_DOT[id]}`} />
                              <div className="min-w-0 flex-1">
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
                )}
              </li>

              {/* 블로그 */}
              <li>
                <Link
                  href="/blog"
                  onClick={close}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  블로그
                </Link>
              </li>

              {/* 요금제 */}
              <li>
                <Link
                  href="/pricing"
                  onClick={close}
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
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${activeDropdown === "support" ? "rotate-180" : ""}`} />
                </button>

                {activeDropdown === "support" && (
                  <div className="absolute top-[calc(100%+16px)] right-0 w-52 bg-white border border-border rounded-2xl shadow-xl p-2 z-50">
                    <ul className="space-y-0.5">
                      {SUPPORT_LINKS.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            onClick={close}
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
                  {session.pending ? (
                    /* 기업 승인 대기 중 */
                    <>
                      <span className="text-xs font-medium text-amber-700 bg-amber-100 rounded-full px-3 py-1.5">
                        승인 대기 중
                      </span>
                      <LogoutButton showIcon={false} />
                    </>
                  ) : (
                    /* 정상 로그인 */
                    <>
                      <GradeBadge planId={session.planId} size="sm" />
                      {session.role === "superadmin" && (
                        <Link
                          href="/admin"
                          onClick={close}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-brand-orange transition-colors"
                        >
                          <Shield className="h-3.5 w-3.5" />
                          관리자
                        </Link>
                      )}
                      <Link
                        href="/dashboard"
                        onClick={close}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold bg-brand-navy text-white rounded-full px-4 py-2 hover:bg-brand-navy-dark transition-all hover:-translate-y-0.5 duration-200"
                      >
                        <LayoutDashboard className="h-3.5 w-3.5" />
                        대시보드
                      </Link>
                      <LogoutButton showIcon={false} />
                    </>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    href="/login"
                    onClick={close}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
                  >
                    로그인
                  </Link>
                  <Link
                    href="/register"
                    onClick={close}
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
            {/* /메인 네비게이션 행 */}
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
