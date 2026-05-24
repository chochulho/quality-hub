"use client";

import Link from "next/link";
import { Clock, Bell, ArrowLeft } from "lucide-react";

interface ComingSoonPageProps {
  feature: string;
  description: string;
  expectedDate?: string;
  notifyEmail?: boolean;
  backHref?: string;
  backLabel?: string;
}

/**
 * 베타 기간 "준비 중" 페이지 — §8.5 스펙
 * 이메일 등록 시 Free 가입으로 연결 (notifyEmail=true).
 */
export default function ComingSoonPage({
  feature,
  description,
  expectedDate,
  notifyEmail = false,
  backHref = "/learn/exam/pqe",
  backLabel = "시험 학습 코너로",
}: ComingSoonPageProps) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-24 text-center">
      {/* 아이콘 */}
      <div className="bg-brand-orange/10 rounded-3xl p-5 mb-6">
        <Clock className="h-10 w-10 text-brand-orange" />
      </div>

      {/* 텍스트 */}
      <p className="text-sm font-medium text-brand-orange mb-2">준비 중</p>
      <h1 className="text-3xl md:text-4xl font-extrabold text-brand-navy mb-4">
        {feature}
      </h1>
      <p className="text-muted-foreground max-w-md leading-relaxed mb-2">
        {description}
      </p>
      {expectedDate && (
        <p className="text-sm font-medium text-brand-navy mb-8">
          {expectedDate}
        </p>
      )}

      {/* 이메일 알림 CTA */}
      {notifyEmail && (
        <div className="w-full max-w-sm mt-4 mb-8">
          <p className="text-sm text-muted-foreground mb-3">
            공개 시 이메일로 알림 받기 — 무료 가입으로 자동 처리됩니다.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-brand-orange text-white rounded-full px-6 py-3 font-semibold hover:bg-brand-orange-hover transition-all hover:-translate-y-0.5 duration-200 text-sm"
          >
            <Bell className="h-4 w-4" />
            무료로 알림 신청하기
          </Link>
        </div>
      )}

      {/* 뒤로가기 */}
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand-navy transition-colors mt-4"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>
    </div>
  );
}
