import Link from 'next/link'
import { ArrowRight, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'

export const metadata = {
  title: '자체 구축 vs quality-hub — QMS 비용 비교',
  description:
    'QMS를 직접 구축하면 얼마나 드나요? 초기 비용·구축 기간·운영비를 quality-hub Business와 실제로 비교해 보세요.',
}

const COMPARE_ROWS: {
  label: string
  self: { text: string; sub?: string; bad?: boolean }
  hub: { text: string; sub?: string; highlight?: boolean }
}[] = [
  {
    label: '초기 비용',
    self: { text: '₩30,000,000~', sub: '개발·컨설팅·라이선스', bad: true },
    hub:  { text: '₩0', sub: '구독만 하면 즉시 시작', highlight: true },
  },
  {
    label: '구축 기간',
    self: { text: '6개월 ~ 1년', sub: '요구분석·개발·테스트', bad: true },
    hub:  { text: '1주일', sub: '가입 → 도구 선택 → 운영', highlight: true },
  },
  {
    label: '연간 운영비',
    self: { text: '₩15,000,000~', sub: '서버·유지보수·업데이트', bad: true },
    hub:  { text: '₩4,680,000', sub: 'Business 플랜 연간 (정가 기준)', highlight: false },
  },
  {
    label: '유지보수 인력',
    self: { text: '전담 1명 필요', sub: 'IT 담당자 상시 필요', bad: true },
    hub:  { text: '없음', sub: '운영·패치·배포 모두 포함', highlight: true },
  },
  {
    label: '표준 업데이트',
    self: { text: '별도 비용', sub: 'IATF·ISO 개정 시 재작업', bad: true },
    hub:  { text: '자동', sub: '표준 개정 즉시 반영', highlight: true },
  },
  {
    label: 'IATF 개정 대응',
    self: { text: '자체 분석 필요', sub: '담당자 교육·문서 재작성', bad: true },
    hub:  { text: '즉시 반영', sub: '구독 중 무상 제공', highlight: true },
  },
  {
    label: 'AIAG-VDA FMEA AI 작성',
    self: { text: '불가능', sub: '세계 어디에도 없는 기능', bad: true },
    hub:  { text: '포함', sub: 'AI와 대화하며 FMEA 자동 작성', highlight: true },
  },
]

const SAVINGS = [
  { label: '첫해 절감 효과', value: '₩40,320,000~', note: '구축비 + 운영비 차액' },
  { label: '구축 기간 단축', value: '약 50주', note: '6개월 → 1주일' },
  { label: '전담 인력 대체', value: '연 ₩50,000,000~', note: 'IT 담당자 1명 인건비' },
]

export default function ComparePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">

      {/* 헤더 */}
      <div className="text-center mb-14">
        <p className="text-sm font-medium text-brand-orange mb-3">가격 부담 완화</p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-brand-navy tracking-tight leading-tight mb-5">
          QMS 직접 만들면
          <br />
          <span className="text-brand-orange">얼마나</span> 드나요?
        </h1>
        <p
          className="text-lg text-muted-foreground max-w-2xl mx-auto"
          style={{ wordBreak: 'keep-all' }}
        >
          개발사 견적서·컨설턴트 비용·유지보수 인력까지 더하면,{' '}
          <strong className="text-foreground">자체 구축이 항상 저렴하지는 않습니다.</strong>
        </p>
      </div>

      {/* 비교표 */}
      <div className="overflow-x-auto mb-14">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left py-4 pr-4 font-semibold text-muted-foreground w-1/3" />
              <th className="text-center py-4 px-4 font-extrabold text-foreground bg-muted/60 rounded-tl-xl">
                자체 구축
              </th>
              <th className="text-center py-4 px-4 font-extrabold text-white bg-brand-navy rounded-tr-xl">
                quality‑hub Business
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPARE_ROWS.map((row, i) => {
              const isLast = i === COMPARE_ROWS.length - 1
              return (
                <tr
                  key={row.label}
                  className={isLast ? 'border-t-2 border-brand-orange/30' : 'border-t border-border'}
                >
                  {/* 항목 */}
                  <td className="py-4 pr-4 font-semibold text-foreground align-top">
                    {row.label}
                    {isLast && (
                      <span className="ml-2 text-[10px] font-bold bg-brand-orange text-white rounded-full px-2 py-0.5 align-middle">
                        차별화
                      </span>
                    )}
                  </td>

                  {/* 자체 구축 */}
                  <td className="py-4 px-4 text-center align-top bg-muted/30">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1.5">
                        {row.self.bad && (
                          <XCircle className="h-4 w-4 text-destructive shrink-0" />
                        )}
                        <span
                          className={`font-bold ${
                            row.self.bad ? 'text-destructive' : 'text-foreground'
                          } ${isLast ? 'text-base' : ''}`}
                        >
                          {row.self.text}
                        </span>
                      </div>
                      {row.self.sub && (
                        <span className="text-xs text-muted-foreground">{row.self.sub}</span>
                      )}
                    </div>
                  </td>

                  {/* quality-hub */}
                  <td className="py-4 px-4 text-center align-top bg-brand-navy/5">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1.5">
                        {row.hub.highlight && (
                          <CheckCircle2 className="h-4 w-4 text-brand-orange shrink-0" />
                        )}
                        <span
                          className={`font-bold ${
                            row.hub.highlight ? 'text-brand-navy' : 'text-foreground'
                          } ${isLast ? 'text-base text-brand-orange' : ''}`}
                        >
                          {row.hub.text}
                        </span>
                      </div>
                      {row.hub.sub && (
                        <span className="text-xs text-muted-foreground">{row.hub.sub}</span>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 절감 요약 카드 */}
      <div
        className="rounded-3xl p-8 md:p-10 mb-14"
        style={{
          background: `
            radial-gradient(ellipse at 85% 15%, rgba(255, 232, 194, 0.5), transparent 60%),
            #1E3666
          `,
        }}
      >
        <p className="text-xs font-medium text-white/60 uppercase tracking-wide mb-2">절감 효과 요약</p>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-8" style={{ wordBreak: 'keep-all' }}>
          첫해에만 <span className="text-[#FFB347]">₩40,000,000</span> 이상 절약할 수 있습니다.
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SAVINGS.map((s) => (
            <div key={s.label} className="bg-white/10 rounded-2xl p-5">
              <p className="text-xs text-white/60 mb-1">{s.label}</p>
              <p className="text-2xl font-extrabold text-white mb-1">{s.value}</p>
              <p className="text-xs text-white/50">{s.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AIAG-VDA FMEA 강조 */}
      <div className="rounded-3xl border border-brand-orange/30 bg-brand-orange/5 p-8 mb-14">
        <div className="flex items-start gap-4">
          <AlertTriangle className="h-6 w-6 text-brand-orange shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-extrabold text-brand-navy mb-2">
              AIAG‑VDA FMEA AI 자동 작성 — 세계 어디에도 없는 기능
            </h3>
            <p
              className="text-sm text-muted-foreground leading-relaxed"
              style={{ wordBreak: 'keep-all' }}
            >
              APQP Manager는 단순 양식 도구가 아닙니다.{' '}
              <strong className="text-foreground">AI와 대화하면서 AIAG‑VDA 규격에 맞는 FMEA를 자동 작성</strong>
              합니다. 이 기능을 직접 구축하는 것은 현실적으로 불가능하며,{' '}
              quality‑hub Business 구독에 기본 포함됩니다.
            </p>
            <Link
              href="/calculators/fmea-demo"
              className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-brand-orange hover:text-brand-orange-hover transition-colors"
            >
              FMEA 데모 3분 체험하기
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          베타 기간 동안 정가 대비 <strong className="text-brand-orange">50% 할인</strong> 적용 중
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 bg-brand-orange text-white rounded-full px-8 py-4 font-semibold hover:bg-brand-orange-hover hover:-translate-y-0.5 transition-all duration-200 shadow-sm"
          >
            요금제 보기
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white border border-border text-foreground rounded-full px-8 py-4 font-semibold hover:border-brand-navy hover:-translate-y-0.5 transition-all duration-200"
          >
            무료로 시작하기
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          신용카드 불필요 · 무료 플랜 영구 제공
        </p>
      </div>
    </div>
  )
}
