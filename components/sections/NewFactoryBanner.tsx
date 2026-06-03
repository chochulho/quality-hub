import { CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function NewFactoryBanner() {
  return (
    <section className="py-16 md:py-20 bg-brand-navy">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center gap-10">

          {/* 텍스트 영역 */}
          <div className="flex-1 space-y-6">
            <div className="space-y-3">
              <p className="text-brand-orange text-sm font-medium">
                🏗️ 신설 공장이신가요?
              </p>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">
                QMS를 처음부터 구축하셔야 한다면,<br className="hidden md:block" />
                AI 위자드와 30년 품질 경력 전문가가<br className="hidden md:block" />
                IATF 16949 인증 준비를 함께 진행해 드립니다.
              </h2>
            </div>

            <ul className="space-y-2.5">
              {[
                'AI 위자드 — 매뉴얼·절차서 초안 자동 생성',
                '자동차 부품 품질 30년 경력 전문가 직접 검토',
                'Business 플랜 1년 약정 시 우대 가격',
                '회사 규모와 인증 목표에 맞는 맞춤 패키지',
              ].map(item => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-white/80">
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="space-y-2">
              <p className="text-white/60 text-xs">
                💬 무료 30분 화상 상담으로 시작하세요
              </p>
              <p className="text-white/50 text-xs">
                회사 현황을 듣고 적합한 진행 방식을 제안해 드립니다.
              </p>
            </div>

            <Link
              href="/qms-wizard"
              className="inline-flex items-center gap-2 bg-brand-orange text-white rounded-full px-8 py-4 font-semibold hover:bg-brand-orange-hover transition-all hover:-translate-y-0.5"
            >
              무료 상담 신청 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* 우측 장식 — 신뢰 배지 */}
          <div className="md:w-72 shrink-0">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
              <p className="text-white/50 text-xs font-medium uppercase tracking-wide">포함 내용</p>
              {[
                { label: 'AI 문서 초안', desc: '매뉴얼 · 절차서 · 지침서' },
                { label: '전문가 상담', desc: '무료 30분 화상 검토' },
                { label: '맞춤 패키지', desc: '회사 규모별 최적 제안' },
                { label: '인증 로드맵', desc: 'IATF 16949 단계별 가이드' },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-orange mt-1.5 shrink-0" />
                  <div>
                    <p className="text-white text-sm font-semibold">{item.label}</p>
                    <p className="text-white/50 text-xs">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
