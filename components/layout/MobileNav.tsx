"use client";

import Link from "next/link";
import {
  X, BookOpen, ArrowRight, LayoutDashboard, ChevronDown, ExternalLink,
  BarChart3, ListChecks, BookMarked, GraduationCap, FlaskConical,
} from "lucide-react";
import { useState, useEffect } from "react";
import LogoutButton from "@/components/auth/LogoutButton";
import GradeBadge from "@/components/dashboard/GradeBadge";
import { ALL_TOOL_IDS, TOOLS } from "@/lib/auth/grades";

const TOOL_DOT: Record<string, string> = {
  "auditsay":           "bg-brand-navy",
  "nc-manager":         "bg-red-600",
  "apqp-manager":       "bg-brand-orange",
  "gauge-manager":      "bg-green-700",
  "4m-change-manager":  "bg-purple-700",
};

// 무료 계산 도구 (v2)
const CALCULATOR_TOOLS = [
  { href: "/calculators/spc",  label: "SPC 분석기",        Icon: BarChart3 },
  { href: "/calculators/qc7",  label: "QC 7가지 도구",     Icon: ListChecks },
  { href: "/new-qc7",          label: "신 QC 7가지 도구",  Icon: ListChecks },
  { href: null,                label: "FMEA 체험 데모 (준비 중)", Icon: FlaskConical },
] as const;

// 학습 링크
const LEARN_LINKS = [
  { href: "/learn",            label: "학습 위키",       Icon: BookMarked },
  { href: "/learn/exam/pqe",   label: "시험 학습 코너",  Icon: GraduationCap },
];

const SUPPORT_LINKS = [
  { href: "/support/qna",     label: "Q&A" },
  { href: "/support/notice",  label: "공지사항" },
  { href: "/support/request", label: "서비스 요청" },
];

interface UserSession {
  name:   string;
  planId: string;
  role:   "superadmin" | "owner" | "admin" | "member";
}

interface MobileNavProps {
  open:        boolean;
  onClose:     () => void;
  userSession: UserSession | null;
}

export default function MobileNav({ open, onClose, userSession }: MobileNavProps) {
  const [learnOpen,   setLearnOpen]   = useState(false);
  const [calcOpen,    setCalcOpen]    = useState(false);
  const [toolsOpen,   setToolsOpen]   = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // 닫힐 때 accordion 초기화
  useEffect(() => {
    if (!open) {
      setLearnOpen(false);
      setCalcOpen(false);
      setToolsOpen(false);
      setSupportOpen(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] md:hidden">
      {/* 배경 */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* 사이드 패널 */}
      <div className="absolute inset-y-0 right-0 w-full max-w-xs bg-white shadow-2xl flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2 font-bold text-brand-navy">
            <BookOpen className="h-5 w-5 text-brand-orange" />
            <span>QMintel</span>
          </div>
          <button onClick={onClose} className="p-1 text-muted-foreground" aria-label="메뉴 닫기">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 로그인 상태 표시 */}
        {userSession && (
          <div className="px-6 py-4 border-b border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{userSession.name}</p>
                <GradeBadge planId={userSession.planId} size="sm" />
              </div>
              <LogoutButton showIcon={false} className="text-xs" />
            </div>
          </div>
        )}

        {/* 네비게이션 링크 */}
        <nav className="flex-1 px-6 py-6 flex flex-col gap-0 overflow-y-auto">

          {/* 학습 accordion */}
          <div className="border-b border-border/50">
            <button
              onClick={() => setLearnOpen(!learnOpen)}
              className="w-full flex items-center justify-between py-3.5 text-base font-medium text-foreground"
            >
              학습
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${learnOpen ? "rotate-180" : ""}`} />
            </button>
            {learnOpen && (
              <div className="pb-4 space-y-1">
                {LEARN_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className="flex items-center gap-2.5 py-2 group"
                  >
                    <link.Icon className="h-4 w-4 text-brand-orange shrink-0" />
                    <span className="text-sm text-foreground group-hover:text-brand-navy transition-colors">
                      {link.label}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 계산 도구 accordion */}
          <div className="border-b border-border/50">
            <button
              onClick={() => setCalcOpen(!calcOpen)}
              className="w-full flex items-center justify-between py-3.5 text-base font-medium text-foreground"
            >
              계산 도구
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${calcOpen ? "rotate-180" : ""}`} />
            </button>
            {calcOpen && (
              <div className="pb-4 space-y-1">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  무료 계산 도구
                </p>
                {CALCULATOR_TOOLS.map((tool) => {
                  const isComingSoon = tool.href === null;
                  const inner = (
                    <div className={`flex items-center gap-2.5 py-2 group ${isComingSoon ? "opacity-50" : ""}`}>
                      <tool.Icon className="h-4 w-4 text-brand-orange shrink-0" />
                      <span className={`text-sm transition-colors ${isComingSoon ? "text-muted-foreground" : "text-foreground group-hover:text-brand-navy"}`}>
                        {tool.label}
                      </span>
                    </div>
                  );
                  return isComingSoon ? (
                    <div key={tool.label}>{inner}</div>
                  ) : (
                    <Link key={tool.href!} href={tool.href!} onClick={onClose}>
                      {inner}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* 도구(SaaS) accordion */}
          <div className="border-b border-border/50">
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className="w-full flex items-center justify-between py-3.5 text-base font-medium text-foreground"
            >
              도구 (SaaS)
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${toolsOpen ? "rotate-180" : ""}`} />
            </button>
            {toolsOpen && (
              <div className="pb-4 space-y-1">
                {ALL_TOOL_IDS.map((id) => {
                  const tool = TOOLS[id];
                  return (
                    <a
                      key={id}
                      href={tool.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={onClose}
                      className="flex items-center gap-2.5 py-2 group"
                    >
                      <span className={`h-2 w-2 rounded-full shrink-0 ${TOOL_DOT[id]}`} />
                      <span className="text-sm text-foreground group-hover:text-brand-navy transition-colors">
                        {tool.name}
                      </span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground ml-auto" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* 블로그 */}
          <Link
            href="/blog" onClick={onClose}
            className="flex items-center justify-between py-3.5 text-base font-medium text-foreground hover:text-brand-orange transition-colors border-b border-border/50"
          >
            블로그 <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>

          {/* 요금제 */}
          <Link
            href="/pricing" onClick={onClose}
            className="flex items-center justify-between py-3.5 text-base font-medium text-foreground hover:text-brand-orange transition-colors border-b border-border/50"
          >
            요금제 <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>

          {/* 지원 accordion */}
          <div className="border-b border-border/50">
            <button
              onClick={() => setSupportOpen(!supportOpen)}
              className="w-full flex items-center justify-between py-3.5 text-base font-medium text-foreground"
            >
              지원
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${supportOpen ? "rotate-180" : ""}`} />
            </button>
            {supportOpen && (
              <div className="pb-4 space-y-0.5">
                {SUPPORT_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className="flex items-center gap-2.5 py-2 text-sm text-foreground hover:text-brand-orange transition-colors"
                  >
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* 하단 CTA */}
        <div className="px-6 py-6 border-t border-border space-y-2">
          {userSession ? (
            <Link
              href="/dashboard" onClick={onClose}
              className="flex items-center justify-center gap-2 w-full bg-brand-navy text-white rounded-full px-6 py-3 font-semibold hover:bg-brand-navy-dark transition-all"
            >
              <LayoutDashboard className="h-4 w-4" />
              대시보드
            </Link>
          ) : (
            <>
              <Link
                href="/register" onClick={onClose}
                className="flex items-center justify-center gap-2 w-full bg-brand-orange text-white rounded-full px-6 py-3 font-semibold hover:bg-brand-orange-hover transition-all"
              >
                시작하기
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login" onClick={onClose}
                className="flex items-center justify-center w-full border border-border text-foreground rounded-full px-6 py-3 font-medium text-sm hover:bg-muted transition-all"
              >
                로그인
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
