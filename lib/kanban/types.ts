// Kanban Simulation — core type definitions

export type DayIndex = 0 | 1 | 2 | 3 | 4; // 0 = 월 … 4 = 금
export const DAY_LABELS: Record<DayIndex, string> = {
  0: "월",
  1: "화",
  2: "수",
  3: "목",
  4: "금",
} as const;

export type ProductId = "가" | "나" | "다";
export type PartId    = "A" | "B" | "C" | "D" | "E";

// ── BOM ───────────────────────────────────────────────────────────────────────

export interface ProductDef {
  id: ProductId;
  cycleTimeMin: number; // cycle time in minutes
  boxSize: number;      // units per container/box (FG)
}

export interface PartDef {
  id: PartId;
  boxSize: number;                                     // units per container/box (parts)
  usagePerProductBox: Partial<Record<ProductId, number>>; // part-boxes needed per 1 product-box produced
}

export interface BOM {
  products: ProductDef[];
  parts: PartDef[];
}

// ── Weekly plans (box counts) ─────────────────────────────────────────────────

export type WeeklyPlan = Partial<Record<DayIndex, number>>; // value = number of boxes

export interface ProductionPlan {
  byProduct: Record<ProductId, WeeklyPlan>;
}

export interface ShippingPlan {
  byProduct: Record<ProductId, WeeklyPlan>;
}

// ── Inventory snapshots ───────────────────────────────────────────────────────

export interface InventorySnapshot {
  fg:    Record<ProductId, number>; // FG boxes per product
  parts: Record<PartId,    number>; // part boxes per part ID
}

// ── Kanban card types ─────────────────────────────────────────────────────────

/** 생산 칸반: authorises production of exactly 1 container */
export interface ProductionKanban {
  type: "production";
  id: string;
  product: ProductId;
  boxSize: number;    // container size (informational)
  qtyBoxes: number;  // always 1 per card
  process: string;   // e.g. "조립공정"
  day: DayIndex;
}

/** 인출 칸반: authorises withdrawal of 1 container from FG supermarket */
export interface WithdrawalKanban {
  type: "withdrawal";
  id: string;
  product: ProductId;
  boxSize: number;
  qtyBoxes: number;  // always 1 per card
  from: string;      // "FG 슈퍼마켓"
  to: string;        // "고객"
  day: DayIndex;
}

/** 부품주문 칸반: authorises ordering / restocking 1 container of a part */
export interface PartsOrderKanban {
  type: "partsOrder";
  id: string;
  part: PartId;
  boxSize: number;
  qtyBoxes: number;       // always 1 per card
  triggeredBy: ProductId; // which product's production consumed this part
  day: DayIndex;
}

export type KanbanCard = ProductionKanban | WithdrawalKanban | PartsOrderKanban;

// ── Warnings ──────────────────────────────────────────────────────────────────

export interface SimWarning {
  severity: "warning" | "error";
  message: string; // Korean text
}

// ── Day result ────────────────────────────────────────────────────────────────

export interface DayResult {
  day: DayIndex;
  inventoryBefore: InventorySnapshot;
  inventoryAfter:  InventorySnapshot;
  kanbans: KanbanCard[];
  warnings: SimWarning[];
  eventLog: string[]; // Korean human-readable lines
}

// ── Root simulation data ──────────────────────────────────────────────────────

export interface SimulationData {
  bom:               BOM;
  productionPlan:    ProductionPlan;
  shippingPlan:      ShippingPlan;
  initialInventory:  InventorySnapshot;
}
