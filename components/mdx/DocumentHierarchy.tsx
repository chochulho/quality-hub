const LEVELS = [
  { num: 1, label: "품질방침", eng: "Policy",            note: "경영진의 의지 선언" },
  { num: 2, label: "품질매뉴얼", eng: "Manual",          note: "QMS 전체 구조 기술" },
  { num: 3, label: "프로세스 맵 / 절차서", eng: "SOP",   note: "What · Who · When · How" },
  { num: 4, label: "작업지침서", eng: "Work Instruction", note: "세부 작업 방법" },
  { num: 5, label: "기록",        eng: "Records",         note: "실행 증거 · 추적성" },
];

const widths = ["w-[32%]", "w-[50%]", "w-[68%]", "w-[84%]", "w-full"];

const colors = [
  "bg-brand-navy text-white",
  "bg-brand-navy/80 text-white",
  "bg-brand-navy/60 text-white",
  "bg-brand-orange/75 text-white",
  "bg-brand-orange text-white",
];

export function DocumentHierarchy() {
  return (
    <div className="not-prose my-8 flex flex-col items-center gap-1">
      {LEVELS.map((level, i) => (
        <div
          key={level.num}
          className={`${widths[i]} ${colors[i]} rounded-xl px-4 py-3 flex items-center gap-3`}
        >
          <span className="shrink-0 w-5 text-center text-[11px] font-bold opacity-60">
            L{level.num}
          </span>
          <div className="flex-1 min-w-0">
            <span className="font-bold text-sm">{level.label}</span>
            <span className="ml-1.5 text-[11px] opacity-70">({level.eng})</span>
          </div>
          <span className="hidden sm:inline text-[11px] opacity-80 whitespace-nowrap">
            {level.note}
          </span>
        </div>
      ))}
      <p className="mt-3 text-xs text-muted-foreground text-center">
        ↑ 위로 갈수록 권위·추상도 증가 &nbsp;/&nbsp; 아래로 갈수록 수량·세부도 증가
      </p>
    </div>
  );
}
