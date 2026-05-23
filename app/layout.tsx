import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PillHeader from "@/components/layout/PillHeader";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Quality Hub — 품질 실무자를 위한 지식 베이스",
    template: "%s | Quality Hub",
  },
  description:
    "IATF 16949·ISO 9001·SPC·MSA부터 품질기술사 시험까지. 정리된 지식과 실무 도구를 함께 제공합니다.",
  metadataBase: new URL("https://quality-hub.vercel.app"),
  openGraph: {
    siteName: "Quality Hub",
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
        {/* PillHeader는 자체적으로 클라이언트 사이드 auth 상태를 구독 */}
        <PillHeader />
        <main className="flex-1 pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
