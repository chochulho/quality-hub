import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// PillHeader·Footer는 각 레이아웃 그룹이 담당:
// - (marketing)/layout.tsx → PillHeader + Footer
// - (workspace)/layout.tsx → WorkspaceHeader
// - (auth)/layout.tsx     → 헤더 없음 (로그인/회원가입 전용)

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "QMintel — 품질 실무자를 위한 지식 베이스",
    template: "%s | QMintel",
  },
  description:
    "IATF 16949·ISO 9001·SPC·MSA부터 품질기술사 시험까지. 정리된 지식과 실무 도구를 함께 제공합니다.",
  metadataBase: new URL("https://qmintel.com"),
  openGraph: {
    siteName: "QMintel",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css"
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
