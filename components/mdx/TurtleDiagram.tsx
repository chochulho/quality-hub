interface TurtleCell {
  label: string;
  eng: string;
  note: string;
}

const WHO: TurtleCell     = { label: "인원",     eng: "Who",        note: "작업자·기술자 자격·교육훈련" };
const WITH: TurtleCell    = { label: "설비·자원", eng: "With What",  note: "설비·지그·측정기·소프트웨어" };
const HOW: TurtleCell     = { label: "방법",     eng: "How",        note: "절차서·CP·작업지침서·표준" };
const MEASURE: TurtleCell = { label: "측정",     eng: "Measure",    note: "KPI·불량률·사이클타임" };
const INPUT: TurtleCell   = { label: "입력",     eng: "Input",      note: "주문·도면·원자재·이전 공정 출력" };
const OUTPUT: TurtleCell  = { label: "출력",     eng: "Output",     note: "완제품·기록·다음 공정 입력" };

function SupportBox({ cell, color }: { cell: TurtleCell; color: string }) {
  return (
    <div className={`${color} rounded-xl p-3 text-center flex-1`}>
      <p className="text-xs font-bold leading-tight">
        {cell.label} <span className="font-normal opacity-70">({cell.eng})</span>
      </p>
      <p className="mt-1 text-[10px] opacity-75 leading-snug hidden sm:block">
        {cell.note}
      </p>
    </div>
  );
}

function IOBox({ cell, color }: { cell: TurtleCell; color: string }) {
  return (
    <div className={`${color} rounded-xl p-3 text-center w-full`}>
      <p className="text-xs font-bold">
        {cell.label} <span className="font-normal opacity-70">({cell.eng})</span>
      </p>
      <p className="mt-1 text-[10px] opacity-75 leading-snug hidden sm:block">
        {cell.note}
      </p>
    </div>
  );
}

export function TurtleDiagram({ processName = "프로세스" }: { processName?: string }) {
  return (
    <div className="not-prose my-8 rounded-2xl border border-border bg-muted/20 p-4">
      <div className="grid grid-cols-[1fr_1.6fr_1fr] gap-2 items-stretch">

        {/* Row 1: top support cells */}
        <div />
        <div className="flex gap-2">
          <SupportBox cell={WHO}  color="bg-blue-50 border border-blue-200 text-blue-800" />
          <SupportBox cell={WITH} color="bg-blue-50 border border-blue-200 text-blue-800" />
        </div>
        <div />

        {/* Row 2: arrows + center */}
        <div className="flex items-center gap-2">
          <IOBox cell={INPUT} color="bg-green-50 border border-green-200 text-green-800" />
          <span className="text-brand-orange font-bold text-xl shrink-0">→</span>
        </div>

        <div className="bg-brand-navy text-white rounded-xl flex items-center justify-center text-center p-4 min-h-[72px]">
          <div>
            <p className="text-[10px] opacity-60 uppercase tracking-wider mb-1">Process</p>
            <p className="text-sm font-bold">{processName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-brand-orange font-bold text-xl shrink-0">→</span>
          <IOBox cell={OUTPUT} color="bg-green-50 border border-green-200 text-green-800" />
        </div>

        {/* Row 3: bottom support cells */}
        <div />
        <div className="flex gap-2">
          <SupportBox cell={HOW}     color="bg-orange-50 border border-orange-200 text-orange-800" />
          <SupportBox cell={MEASURE} color="bg-orange-50 border border-orange-200 text-orange-800" />
        </div>
        <div />

      </div>

      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        IATF 16949 내부심사 — 프로세스 완전성 확인 도구
      </p>
    </div>
  );
}
