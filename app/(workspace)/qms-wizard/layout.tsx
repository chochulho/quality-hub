// 마법사 전용 레이아웃 — 워크스페이스 헤더 위에 풀스크린 단계 컨테이너
export default function QmsWizardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background-soft">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {children}
      </div>
    </div>
  )
}
