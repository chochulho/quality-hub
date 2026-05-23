// Pure simulation engine — no React, no side effects
import type {
  DayIndex, DayResult, InventorySnapshot,
  KanbanCard, ProductId, SimulationData, SimWarning,
} from "./types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function cloneInventory(inv: InventorySnapshot): InventorySnapshot {
  return {
    fg:    { ...inv.fg },
    parts: { ...inv.parts },
  };
}

let _idCounter = 0;
function uid(prefix: string): string {
  return `${prefix}-${++_idCounter}`;
}
function resetIds() { _idCounter = 0; }

// ── Core day simulation ───────────────────────────────────────────────────────

/**
 * Simulate a single day given the starting inventory.
 * Returns the updated inventory, all kanban cards issued, warnings, and an event log.
 */
export function simulateDay(
  data: SimulationData,
  day: DayIndex,
  inventoryBefore: InventorySnapshot,
): DayResult {
  const inv = cloneInventory(inventoryBefore);
  const kanbans: KanbanCard[] = [];
  const warnings: SimWarning[] = [];
  const eventLog: string[] = [];

  const { bom, productionPlan, shippingPlan } = data;
  const products: ProductId[] = ["가", "나", "다"];

  // ── STEP 1: 출하 (shipping) ────────────────────────────────────────────────
  for (const product of products) {
    const shipBoxes = shippingPlan.byProduct[product][day] ?? 0;
    if (shipBoxes === 0) continue;

    const available = inv.fg[product];
    const actual    = Math.min(shipBoxes, available);

    if (actual < shipBoxes) {
      warnings.push({
        severity: "error",
        message: `완제품 ${product} 재고 부족: 출하 계획 ${shipBoxes}박스, 재고 ${available}박스 → ${actual}박스만 출하`,
      });
    }

    inv.fg[product] -= actual;

    // Emit 1 withdrawal kanban per box shipped
    const prodDef = bom.products.find(p => p.id === product)!;
    for (let i = 0; i < actual; i++) {
      kanbans.push({
        type: "withdrawal",
        id: uid("wk"),
        product,
        boxSize: prodDef.boxSize,
        qtyBoxes: 1,
        from: "FG 슈퍼마켓",
        to: "고객",
        day,
      });
    }

    eventLog.push(
      `[출하] 완제품 ${product} ${actual}박스 출하 → 인출 칸반 ${actual}매 발행`
    );
  }

  // ── STEP 2: 생산 (production) ──────────────────────────────────────────────
  for (const product of products) {
    const planBoxes = productionPlan.byProduct[product][day] ?? 0;
    if (planBoxes === 0) continue;

    const prodDef = bom.products.find(p => p.id === product)!;

    // Determine maximum producible constrained by available parts
    let maxProd = planBoxes;
    for (const partDef of bom.parts) {
      const usagePerBox = partDef.usagePerProductBox[product] ?? 0;
      if (usagePerBox === 0) continue;
      const available  = inv.parts[partDef.id];
      const maxByPart  = Math.floor(available / usagePerBox);
      maxProd = Math.min(maxProd, maxByPart);
    }

    if (maxProd === 0) {
      warnings.push({
        severity: "error",
        message: `완제품 ${product} 생산 불가: 부품 재고 부족 (계획 ${planBoxes}박스)`,
      });
      eventLog.push(`[생산] 완제품 ${product} 생산 불가 — 부품 부족`);
      continue;
    }

    if (maxProd < planBoxes) {
      warnings.push({
        severity: "warning",
        message: `완제품 ${product} 부품 부족: 계획 ${planBoxes}박스 → 실제 생산 ${maxProd}박스`,
      });
    }

    // Consume parts proportionally and emit parts-order kanbans
    for (const partDef of bom.parts) {
      const usagePerBox = partDef.usagePerProductBox[product] ?? 0;
      if (usagePerBox === 0) continue;

      const totalConsume = usagePerBox * maxProd;
      const actualConsume = Math.min(totalConsume, inv.parts[partDef.id]); // safety clamp

      inv.parts[partDef.id] -= actualConsume;

      // Emit 1 parts-order kanban per part-box consumed
      for (let i = 0; i < actualConsume; i++) {
        kanbans.push({
          type: "partsOrder",
          id: uid("pk"),
          part: partDef.id,
          boxSize: partDef.boxSize,
          qtyBoxes: 1,
          triggeredBy: product,
          day,
        });
      }

      eventLog.push(
        `[부품소비] ${product} 생산 → 부품 ${partDef.id} ${actualConsume}박스 소비, 부품주문 칸반 ${actualConsume}매`
      );
    }

    // Add to FG and emit production kanbans
    inv.fg[product] += maxProd;

    for (let i = 0; i < maxProd; i++) {
      kanbans.push({
        type: "production",
        id: uid("prk"),
        product,
        boxSize: prodDef.boxSize,
        qtyBoxes: 1,
        process: "조립공정",
        day,
      });
    }

    eventLog.push(
      `[생산완료] 완제품 ${product} ${maxProd}박스 → FG 슈퍼마켓 입고, 생산 칸반 ${maxProd}매 발행`
    );
  }

  return {
    day,
    inventoryBefore,
    inventoryAfter: inv,
    kanbans,
    warnings,
    eventLog,
  };
}

// ── Multi-day simulation ──────────────────────────────────────────────────────

/**
 * Run simulation from day 0 up to and including upToDay.
 * Each day feeds its inventoryAfter into the next day.
 */
export function simulateAll(
  data: SimulationData,
  upToDay: DayIndex,
): DayResult[] {
  resetIds(); // deterministic IDs per full run
  const results: DayResult[] = [];
  let currentInventory = cloneInventory(data.initialInventory);

  for (let d = 0; d <= upToDay; d++) {
    const result = simulateDay(data, d as DayIndex, currentInventory);
    results.push(result);
    currentInventory = result.inventoryAfter;
  }

  return results;
}
