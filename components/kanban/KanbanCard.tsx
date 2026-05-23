"use client";

import type { KanbanCard } from "@/lib/kanban/types";

interface KanbanCardProps {
  card: KanbanCard;
}

const TYPE_CONFIG = {
  production: {
    label: "생산 칸반",
    headerClass: "bg-brand-navy text-white",
    borderClass: "border-brand-navy/30",
  },
  withdrawal: {
    label: "인출 칸반",
    headerClass: "bg-[#16A34A] text-white",
    borderClass: "border-[#16A34A]/30",
  },
  partsOrder: {
    label: "부품주문 칸반",
    headerClass: "bg-[#CA8A04] text-white",
    borderClass: "border-[#CA8A04]/30",
  },
};

export function KanbanCardComponent({ card }: KanbanCardProps) {
  const config = TYPE_CONFIG[card.type];

  return (
    <div className={`w-40 rounded-lg border overflow-hidden shadow-sm ${config.borderClass}`}>
      {/* Colored header */}
      <div className={`px-2.5 py-1.5 text-[10px] font-bold tracking-wide ${config.headerClass}`}>
        {config.label}
      </div>

      {/* Card body */}
      <div className="bg-white px-2.5 py-2 text-[10px] space-y-0.5 min-h-[62px]">
        {card.type === "production" && (
          <>
            <Row label="제품" value={`완제품 ${card.product}`} />
            <Row label="컨테이너" value={`${card.boxSize}개/BOX`} />
            <Row label="수량" value={`${card.qtyBoxes}박스`} />
            <Row label="공정" value={card.process} />
          </>
        )}

        {card.type === "withdrawal" && (
          <>
            <Row label="품목" value={`완제품 ${card.product}`} />
            <Row label="컨테이너" value={`${card.boxSize}개/BOX`} />
            <Row label="출처" value={card.from} />
            <Row label="목적지" value={card.to} />
          </>
        )}

        {card.type === "partsOrder" && (
          <>
            <Row label="부품" value={`부품 ${card.part}`} />
            <Row label="컨테이너" value={`${card.boxSize}개/BOX`} />
            <Row label="수량" value={`${card.qtyBoxes}박스`} />
            <Row label="원인제품" value={`완제품 ${card.triggeredBy}`} />
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-1">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-foreground text-right leading-tight">{value}</span>
    </div>
  );
}
