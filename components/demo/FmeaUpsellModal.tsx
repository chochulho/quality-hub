'use client'

import Link from 'next/link'
import { ArrowRight, X, Zap, CheckCircle2 } from 'lucide-react'

interface Props {
  onClose: () => void
}

const UPSELL_POINTS = [
  'FMEA 행 저장 및 팀과 공유',
  'PFD → PFMEA → CP → WI 5문서 자동 연동',
  'Excel·PDF FMEA 파일 AI 파싱 업로드',
  'PPAP 18개 요소 자동화',
  'AI 다국어 번역 (영어·중국어·베트남어)',
]

export default function FmeaUpsellModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 백드롭 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* 헤더 */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-brand-orange/10 text-brand-orange rounded-full px-4 py-2 text-sm font-semibold mb-4">
            <Zap className="h-4 w-4" />
            데모 체험 완료!
          </div>
          <h2 className="text-2xl font-extrabold text-brand-navy mb-2">
            전체 기능을 사용해 보세요
          </h2>
          <p className="text-sm text-muted-foreground" style={{ wordBreak: 'keep-all' }}>
            APQP Manager에서 AI 대화형 FMEA를 팀과 함께 실제로 작성해 보세요.
          </p>
        </div>

        {/* 기능 목록 */}
        <ul className="space-y-2.5 mb-7">
          {UPSELL_POINTS.map((point) => (
            <li key={point} className="flex items-start gap-2.5 text-sm">
              <CheckCircle2 className="h-4 w-4 text-brand-orange shrink-0 mt-0.5" />
              <span className="text-foreground">{point}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="flex flex-col gap-3">
          <Link
            href="https://apqpmanager.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-brand-orange text-white rounded-full px-6 py-3.5 font-semibold hover:bg-brand-orange-hover hover:-translate-y-0.5 transition-all duration-200"
          >
            APQP Manager 시작하기
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/register"
            className="flex items-center justify-center gap-2 w-full border border-border text-foreground rounded-full px-6 py-3.5 font-semibold hover:border-brand-navy hover:-translate-y-0.5 transition-all duration-200 text-sm"
          >
            quality-hub 무료 가입
          </Link>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          베타 기간 50% 할인 · 신용카드 불필요
        </p>
      </div>
    </div>
  )
}
