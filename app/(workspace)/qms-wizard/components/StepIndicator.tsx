// StepIndicator — 단계 진행 표시 바
// spec: QMS_WIZARD_SPEC_FINAL.md §12 (완료 단계 orange fill, 현재 단계 navy 테두리)

const STEP_LABELS = ['기본 정보', '업무 범위', '조직도', '품질방침', '문서 미리보기']

interface Props {
  current: number  // 1-based
  total: number
}

export default function StepIndicator({ current, total }: Props) {
  return (
    <div className="flex items-center gap-0">
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1
        const done    = n < current
        const active  = n === current
        const pending = n > current

        return (
          <div key={n} className="flex items-center flex-1 min-w-0">
            {/* 원 */}
            <div className="flex flex-col items-center shrink-0">
              <div
                className={[
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all',
                  done    ? 'bg-brand-orange border-brand-orange text-white'      : '',
                  active  ? 'bg-white border-brand-navy text-brand-navy'          : '',
                  pending ? 'bg-white border-border text-muted-foreground'        : '',
                ].join(' ')}
              >
                {done ? '✓' : n}
              </div>
              <span className={[
                'mt-1 text-[10px] whitespace-nowrap hidden sm:block',
                active  ? 'text-brand-navy font-semibold' : 'text-muted-foreground',
              ].join(' ')}>
                {STEP_LABELS[i]}
              </span>
            </div>
            {/* 연결선 */}
            {n < total && (
              <div className={[
                'flex-1 h-0.5 mx-1',
                done ? 'bg-brand-orange' : 'bg-border',
              ].join(' ')} />
            )}
          </div>
        )
      })}
    </div>
  )
}
