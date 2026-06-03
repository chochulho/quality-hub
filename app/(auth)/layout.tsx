import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | QmIntel',
    default: 'QmIntel',
  },
}

/**
 * 인증 전용 레이아웃 — PillHeader/Footer 없이 중앙 정렬
 * Root layout의 PillHeader는 fixed/floating이므로 auth 페이지에서도
 * 콘텐츠 가운데 정렬에 방해 없음
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20"
      style={{
        background: `
          radial-gradient(ellipse at 85% 15%, rgba(255, 232, 194, 0.4), transparent 50%),
          radial-gradient(ellipse at 15% 85%, rgba(220, 231, 245, 0.5), transparent 55%),
          #FDFBF7
        `,
      }}
    >
      {children}
    </div>
  )
}
