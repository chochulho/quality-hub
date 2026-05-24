import { Suspense } from "react";
import { LearnSidebar } from "@/components/learn/LearnSidebar";

export default function GlossaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
      <div className="flex gap-8">
        {/* Sidebar — 학습 노트와 동일한 사이드바 공유 */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-28">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
              카테고리
            </p>
            <Suspense fallback={<SidebarSkeleton />}>
              <LearnSidebar />
            </Suspense>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="space-y-1 animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="h-8 bg-muted rounded-lg" />
      ))}
    </div>
  );
}
