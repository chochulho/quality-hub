"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import type {
  DayIndex, KanbanCard, InventorySnapshot, SimulationData,
} from "@/lib/kanban/types";
import { DAY_LABELS } from "@/lib/kanban/types";
import { SAMPLE_DATA } from "@/lib/kanban/sampleData";
import { simulateAll } from "@/lib/kanban/kanbanEngine";
import { KanbanCardComponent } from "./KanbanCard";
import { KanbanFlowDiagram } from "./KanbanFlowDiagram";

// ── Sub-components ────────────────────────────────────────────────────────────

/** Day plan table: shows production + shipping plan for selected day */
function DayPlanPanel({
  data,
  selectedDay,
}: {
  data: SimulationData;
  selectedDay: DayIndex;
}) {
  const products = data.bom.products;
  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <h3 className="text-sm font-semibold text-brand-navy mb-3">
        {DAY_LABELS[selectedDay]}요일 계획
      </h3>
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left text-muted-foreground font-medium pb-1.5 pr-2">제품</th>
            <th className="text-right text-brand-navy font-semibold pb-1.5 pr-2">생산계획</th>
            <th className="text-right text-brand-orange font-semibold pb-1.5">출하계획</th>
          </tr>
        </thead>
        <tbody>
          {products.map(prod => {
            const prodPlan = data.productionPlan.byProduct[prod.id][selectedDay] ?? 0;
            const shipPlan = data.shippingPlan.byProduct[prod.id][selectedDay] ?? 0;
            return (
              <tr key={prod.id} className="border-t border-border">
                <td className="py-1.5 pr-2 font-semibold text-foreground">
                  완제품 {prod.id}
                  <span className="text-muted-foreground font-normal ml-1">
                    ({prod.boxSize}개/BOX)
                  </span>
                </td>
                <td className="py-1.5 pr-2 text-right">
                  {prodPlan > 0 ? (
                    <span className="font-semibold text-brand-navy">{prodPlan}박스</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="py-1.5 text-right">
                  {shipPlan > 0 ? (
                    <span className="font-semibold text-brand-orange">{shipPlan}박스</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Collapsible group of kanban cards */
function KanbanCardGroup({
  title,
  type,
  cards,
  colorClass,
}: {
  title: string;
  type: KanbanCard["type"];
  cards: KanbanCard[];
  colorClass: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const LIMIT = 6;

  if (cards.length === 0) return null;

  const visible = expanded ? cards : cards.slice(0, LIMIT);
  const hidden  = cards.length - LIMIT;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className={`inline-block w-2.5 h-2.5 rounded-full ${colorClass}`} />
        <span className="text-xs font-semibold text-foreground">{title}</span>
        <span className="text-xs text-muted-foreground">({cards.length}매)</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {visible.map(card => (
          <KanbanCardComponent key={card.id} card={card} />
        ))}
      </div>
      {hidden > 0 && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDown className="h-3 w-3" />
          더보기 (+{hidden}매)
        </button>
      )}
      {expanded && hidden > 0 && (
        <button
          onClick={() => setExpanded(false)}
          className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronUp className="h-3 w-3" />
          접기
        </button>
      )}
    </div>
  );
}

/** Before / after inventory comparison table */
function InventoryPanel({
  before,
  after,
  bom,
}: {
  before: InventorySnapshot;
  after:  InventorySnapshot;
  bom: SimulationData["bom"];
}) {
  function Delta({ a, b }: { a: number; b: number }) {
    const d = b - a;
    if (d === 0) return <span className="text-muted-foreground">±0</span>;
    return (
      <span className={d > 0 ? "text-[#16A34A] font-semibold" : "text-destructive font-semibold"}>
        {d > 0 ? "+" : ""}{d}
      </span>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <h3 className="text-sm font-semibold text-brand-navy mb-3">재고 현황 (전 → 후)</h3>

      {/* FG */}
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
        완제품 재고 (박스)
      </p>
      <table className="w-full text-xs mb-4">
        <thead>
          <tr>
            <th className="text-left text-muted-foreground font-medium pb-1">제품</th>
            <th className="text-right text-muted-foreground font-medium pb-1">이전</th>
            <th className="text-right text-muted-foreground font-medium pb-1">이후</th>
            <th className="text-right text-muted-foreground font-medium pb-1">변화</th>
          </tr>
        </thead>
        <tbody>
          {bom.products.map(prod => (
            <tr key={prod.id} className="border-t border-border">
              <td className="py-1 font-semibold">완제품 {prod.id}</td>
              <td className="py-1 text-right">{before.fg[prod.id]}</td>
              <td className="py-1 text-right font-semibold">{after.fg[prod.id]}</td>
              <td className="py-1 text-right">
                <Delta a={before.fg[prod.id]} b={after.fg[prod.id]} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Parts */}
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
        부품 재고 (박스)
      </p>
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left text-muted-foreground font-medium pb-1">부품</th>
            <th className="text-right text-muted-foreground font-medium pb-1">이전</th>
            <th className="text-right text-muted-foreground font-medium pb-1">이후</th>
            <th className="text-right text-muted-foreground font-medium pb-1">변화</th>
          </tr>
        </thead>
        <tbody>
          {bom.parts.map(part => (
            <tr key={part.id} className="border-t border-border">
              <td className="py-1 font-semibold">부품 {part.id}</td>
              <td className="py-1 text-right">{before.parts[part.id]}</td>
              <td className="py-1 text-right font-semibold">{after.parts[part.id]}</td>
              <td className="py-1 text-right">
                <Delta a={before.parts[part.id]} b={after.parts[part.id]} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main simulator ────────────────────────────────────────────────────────────

export function KanbanSimulator() {
  const [selectedDay, setSelectedDay] = useState<DayIndex>(0);
  const [data] = useState<SimulationData>(() => SAMPLE_DATA);

  // Run cumulative simulation up to selectedDay (all previous days affect inventory)
  const results = useMemo(
    () => simulateAll(data, selectedDay),
    [data, selectedDay],
  );
  const current = results[selectedDay];

  const productionCards = current.kanbans.filter(k => k.type === "production");
  const withdrawalCards = current.kanbans.filter(k => k.type === "withdrawal");
  const partsOrderCards = current.kanbans.filter(k => k.type === "partsOrder");
  const totalCards = current.kanbans.length;
  const errorCount = current.warnings.filter(w => w.severity === "error").length;
  const warnCount  = current.warnings.filter(w => w.severity === "warning").length;

  return (
    <div className="max-w-[1400px] mx-auto px-2 sm:px-4 py-6">

      {/* ── Page header ── */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-brand-orange uppercase tracking-wider mb-1.5">
          Lean 분석 도구
        </p>
        <h1 className="text-3xl font-extrabold text-brand-navy mb-2">
          칸반 흐름 시뮬레이션
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          BOM·생산계획·출하계획 데이터를 바탕으로 생산 칸반·인출 칸반·부품주문 칸반이
          어떻게 발행되고 흐르는지 요일별로 추적합니다. 재고는 누적 계산됩니다.
        </p>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Day selector */}
        <div className="flex items-center gap-0.5 rounded-full border border-border p-1 bg-white">
          {([0, 1, 2, 3, 4] as DayIndex[]).map(d => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-150 ${
                selectedDay === d
                  ? "bg-brand-navy text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {DAY_LABELS[d]}
            </button>
          ))}
        </div>

        {/* Reset */}
        <button
          onClick={() => setSelectedDay(0)}
          className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-brand-navy/40 transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          초기화
        </button>

        {/* Card count badge */}
        <span className="ml-2 text-xs text-muted-foreground">
          오늘 발행 칸반:{" "}
          <strong className="text-brand-navy">{totalCards}매</strong>
          {" "}(생산 {productionCards.length} / 인출 {withdrawalCards.length} / 부품주문 {partsOrderCards.length})
        </span>

        {/* Warnings */}
        {current.warnings.length > 0 && (
          <span className="ml-auto flex items-center gap-1.5 text-sm font-medium text-destructive">
            <AlertTriangle className="h-4 w-4" />
            에러 {errorCount}건
            {warnCount > 0 && ` · 경고 ${warnCount}건`}
          </span>
        )}
      </div>

      {/* ── Main 2-column layout ── */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">

        {/* ── Left: Diagram + Event log ── */}
        <div className="flex-1 min-w-0">

          {/* Flow diagram */}
          <div className="rounded-2xl border border-border bg-white p-4 mb-4">
            <KanbanFlowDiagram
              dayResult={current}
              initialInventory={data.initialInventory}
            />
          </div>

          {/* Event log */}
          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <h3 className="text-sm font-semibold text-brand-navy mb-2.5 flex items-center gap-2">
              이벤트 로그
              <span className="text-xs text-muted-foreground font-normal">
                — {DAY_LABELS[selectedDay]}요일 (누적)
              </span>
            </h3>

            {current.eventLog.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">이 날은 발생한 이벤트가 없습니다.</p>
            ) : (
              <div className="space-y-0.5 max-h-52 overflow-y-auto pr-1">
                {current.eventLog.map((line, i) => (
                  <p key={i} className="text-xs font-mono text-muted-foreground leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            )}

            {/* Warnings */}
            {current.warnings.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {current.warnings.map((w, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 text-xs rounded-lg p-2.5 ${
                      w.severity === "error"
                        ? "bg-destructive/8 text-destructive border border-destructive/20"
                        : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                    }`}
                  >
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    {w.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right panel (320px) ── */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">

          {/* Day plan */}
          <DayPlanPanel data={data} selectedDay={selectedDay} />

          {/* Kanban cards by group */}
          <div className="rounded-2xl border border-border bg-white p-4">
            <h3 className="text-sm font-semibold text-brand-navy mb-3">
              발행된 칸반 카드
              {totalCards > 0 && (
                <span className="ml-2 text-xs text-muted-foreground font-normal">
                  총 {totalCards}매
                </span>
              )}
            </h3>

            {totalCards === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                이 날은 발행된 칸반이 없습니다.
              </p>
            ) : (
              <div className="space-y-5 max-h-[520px] overflow-y-auto pr-1">
                <KanbanCardGroup
                  title="생산 칸반"
                  type="production"
                  cards={productionCards}
                  colorClass="bg-brand-navy"
                />
                <KanbanCardGroup
                  title="인출 칸반"
                  type="withdrawal"
                  cards={withdrawalCards}
                  colorClass="bg-[#16A34A]"
                />
                <KanbanCardGroup
                  title="부품주문 칸반"
                  type="partsOrder"
                  cards={partsOrderCards}
                  colorClass="bg-[#CA8A04]"
                />
              </div>
            )}
          </div>

          {/* Inventory before/after */}
          <InventoryPanel
            before={current.inventoryBefore}
            after={current.inventoryAfter}
            bom={data.bom}
          />

        </div>
      </div>

      {/* ── BOM reference ── */}
      <details className="mt-4 rounded-2xl border border-border bg-muted/20 overflow-hidden">
        <summary className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-muted/40 transition-colors list-none">
          <span className="text-sm font-semibold text-brand-navy">BOM 구성 참조</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </summary>
        <div className="p-4 border-t border-border overflow-x-auto">
          <BOMTable data={data} />
        </div>
      </details>
    </div>
  );
}

/** Read-only BOM table */
function BOMTable({ data }: { data: SimulationData }) {
  return (
    <div className="flex flex-col sm:flex-row gap-6">
      {/* Products */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          완제품
        </p>
        <table className="text-xs">
          <thead>
            <tr>
              <th className="text-left pr-4 pb-1 font-semibold text-brand-navy">제품</th>
              <th className="text-right pr-4 pb-1 font-medium text-muted-foreground">CT</th>
              <th className="text-right pb-1 font-medium text-muted-foreground">박스 크기</th>
            </tr>
          </thead>
          <tbody>
            {data.bom.products.map(p => (
              <tr key={p.id} className="border-t border-border">
                <td className="py-1 pr-4 font-semibold">{p.id}</td>
                <td className="py-1 pr-4 text-right text-muted-foreground">{p.cycleTimeMin}분</td>
                <td className="py-1 text-right text-muted-foreground">{p.boxSize}개/BOX</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Parts BOM matrix */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          부품 BOM (제품 1박스당 필요 부품 박스 수)
        </p>
        <table className="text-xs">
          <thead>
            <tr>
              <th className="text-left pr-4 pb-1 font-semibold text-brand-navy">부품</th>
              <th className="text-right pr-3 pb-1 font-medium text-muted-foreground">박스</th>
              {data.bom.products.map(p => (
                <th key={p.id} className="text-right pr-3 pb-1 font-semibold text-brand-navy">
                  완제품{p.id}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.bom.parts.map(part => (
              <tr key={part.id} className="border-t border-border">
                <td className="py-1 pr-4 font-semibold">부품 {part.id}</td>
                <td className="py-1 pr-3 text-right text-muted-foreground">{part.boxSize}개</td>
                {data.bom.products.map(p => (
                  <td key={p.id} className="py-1 pr-3 text-right">
                    {part.usagePerProductBox[p.id] !== undefined ? (
                      <span className="font-semibold text-foreground">
                        {part.usagePerProductBox[p.id]}박스
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
