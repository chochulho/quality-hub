"use client";

import Link from "next/link";
import { X, BookOpen, ArrowRight, LayoutDashboard } from "lucide-react";
import { useEffect } from "react";
import LogoutButton from "@/components/auth/LogoutButton";
import GradeBadge from "@/components/dashboard/GradeBadge";
import type { Grade } from "@/lib/auth/grades";

interface NavLink {
  href: string;
  label: string;
}

interface UserSession {
  name: string;
  grade: Grade;
  role: 'superadmin' | 'company_admin' | 'member';
}

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  links: NavLink[];
  userSession: UserSession | null;
}

export default function MobileNav({ open, onClose, links, userSession }: MobileNavProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] md:hidden">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 right-0 w-full max-w-xs bg-white shadow-2xl flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2 font-bold text-brand-navy">
            <BookOpen className="h-5 w-5 text-brand-orange" />
            <span>Quality Hub</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="메뉴 닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 로그인 상태 표시 */}
        {userSession && (
          <div className="px-6 py-4 border-b border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{userSession.name}</p>
                <GradeBadge grade={userSession.grade} size="sm" />
              </div>
              <LogoutButton showIcon={false} className="text-xs" />
            </div>
          </div>
        )}

        {/* 네비게이션 링크 */}
        <nav className="flex-1 px-6 py-6 flex flex-col gap-1 overflow-y-auto">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="flex items-center justify-between py-3 text-base font-medium text-foreground hover:text-brand-orange transition-colors border-b border-border/50"
            >
              {link.label}
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </nav>

        {/* 하단 CTA */}
        <div className="px-6 py-6 border-t border-border space-y-2">
          {userSession ? (
            <Link
              href="/dashboard"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full bg-brand-navy text-white rounded-full px-6 py-3 font-semibold hover:bg-brand-navy-dark transition-all"
            >
              <LayoutDashboard className="h-4 w-4" />
              대시보드
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full bg-brand-orange text-white rounded-full px-6 py-3 font-semibold hover:bg-brand-orange-hover transition-all"
              >
                시작하기
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                onClick={onClose}
                className="flex items-center justify-center w-full border border-border text-foreground rounded-full px-6 py-3 font-medium hover:bg-muted transition-all text-sm"
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
