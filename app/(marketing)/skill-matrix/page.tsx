import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import SkillMatrixTool from "@/components/skill-matrix/SkillMatrixTool";

export const metadata: Metadata = {
  title: "다기능도 (Skill Matrix)",
  description:
    "공정별·인원별 적격성 현황을 입력하고 목표 대비 GAP을 즉시 확인. Excel 다운로드 지원.",
};

export default function SkillMatrixPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
      {/* 뒤로 가기 */}
      <Link
        href="/tools"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        도구 목록으로
      </Link>

      {/* 헤더 */}
      <div className="mb-8">
        <p className="text-sm font-medium text-brand-orange mb-2">적격성 관리 도구</p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-brand-navy mb-3">
          다기능도 (Skill Matrix)
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          공정별·인원별 스킬 레벨을 입력하고 목표 대비 GAP을 즉시 파악하세요.
          작성 완료 후 Excel 파일로 다운로드할 수 있습니다.
        </p>
      </div>

      {/* 사용 방법 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {[
          { step: "1", title: "공정·인원 설정", desc: "이름을 클릭해 편집, + 버튼으로 추가" },
          { step: "2", title: "목표 입력", desc: "공정별 최소 인원 수 / 인원별 다기능화 목표" },
          { step: "3", title: "스킬 레벨 입력", desc: "셀 클릭 → 레벨 순환. GAP 자동 표시" },
        ].map((s) => (
          <div key={s.step} className="flex items-start gap-3 p-4 rounded-2xl border border-border bg-white">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-orange text-white text-sm font-bold shrink-0">
              {s.step}
            </span>
            <div>
              <p className="font-semibold text-sm text-foreground">{s.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 도구 본체 */}
      <SkillMatrixTool />

      {/* 학습 노트 링크 */}
      <div className="mt-10 p-5 rounded-2xl border border-border bg-background-soft flex items-start gap-3">
        <BookOpen className="h-5 w-5 text-brand-orange shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">적격성 vs 자격 이론이 헷갈린다면?</p>
          <p className="text-xs text-muted-foreground mt-1">
            ISO 9001 7.2의 적격성(Competence)과 자격(Qualification)의 차이, 스킬 레벨 4단계 해석,
            교육훈련 효과성 평가 방법을 학습 노트에서 확인하세요.
          </p>
          <Link
            href="/learn/competence/competence-qualification"
            className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-brand-orange hover:underline"
          >
            적격성·자격 학습 노트 보기 →
          </Link>
        </div>
      </div>
    </div>
  );
}
