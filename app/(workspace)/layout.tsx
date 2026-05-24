import WorkspaceHeader from "@/components/layout/WorkspaceHeader";

/**
 * 워크스페이스 레이아웃 — 로그인한 기업 회원 전용 (§6)
 *
 * 규칙:
 * - 마케팅 헤더(PillHeader) 완전 분리.
 * - 블로그·요금제·Q&A 링크 노출 금지.
 * - 워크스페이스 컴포넌트에서 메시 그라디언트·오렌지 자제 — navy 기반 차분한 톤.
 *
 * TODO: 워크스페이스 전용 Footer 추가 (현재 없음)
 */
export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <WorkspaceHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
