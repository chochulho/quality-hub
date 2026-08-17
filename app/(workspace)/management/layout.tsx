import { redirect } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import ManagementTabs from "@/components/management/ManagementTabs";

export const metadata = { title: "경영관리" };

/**
 * 경영관리 — 워크스페이스 내부 기능 (자매 SaaS 아님).
 * 로그인한 조직 멤버라면 누구나 접근 가능 (역할 게이트 없음 — /calculators, /learn과 동일 수준).
 * 하위 항목별 편집 권한은 lib/auth/management.ts의 canEditManagementItem으로 부서 단위 판단.
 */
export default async function ManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login?next=/management");

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center gap-2 mb-1">
        <ClipboardList className="h-5 w-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">경영관리</p>
      </div>
      <h1 className="text-3xl font-extrabold text-brand-navy tracking-tight mb-8">
        KPI·경영검토·리스크·비상계획을 한 곳에서
      </h1>

      <ManagementTabs />

      {children}
    </div>
  );
}
