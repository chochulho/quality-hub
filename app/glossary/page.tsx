import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { GLOSSARY_TERMS } from "@/lib/glossary";
import { GlossaryClient } from "./GlossaryClient";

export const metadata: Metadata = {
  title: "품질 용어사전",
  description:
    "FMEA·SPC·MSA·APQP·린·6시그마 등 품질 실무에서 자주 쓰이는 200여 가지 용어를 한눈에 확인하세요.",
};

export default function GlossaryPage() {
  const totalCount = GLOSSARY_TERMS.length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">
      {/* 헤더 */}
      <div className="mb-10">
        <p className="text-sm font-medium text-brand-orange mb-3 flex items-center gap-1.5">
          <BookOpen className="h-4 w-4" />
          품질 용어사전
        </p>
        <h1 className="text-4xl font-extrabold text-brand-navy mb-3">
          용어를 알면 품질이 보인다
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          FMEA·SPC·MSA·APQP·린·6시그마 등 품질 실무에서 자주 쓰이는{" "}
          <span className="font-semibold text-brand-navy">{totalCount}가지 용어</span>를
          검색·분류해서 확인하세요. 카드를 클릭하면 상세 설명과 연관 용어를 볼 수 있습니다.
        </p>
      </div>

      {/* 클라이언트 컴포넌트 (검색/필터/목록) */}
      <GlossaryClient />
    </div>
  );
}
