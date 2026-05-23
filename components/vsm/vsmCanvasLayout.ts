// Shared canvas layout constants used by SVGCanvas and VSMViewer
// Both files import from here to keep coordinate math consistent

export const W = 1200;
export const H = 650; // increased to accommodate 2 lanes

// --- Zone boundaries ---
export const INFO_ZONE_Y = 30;
export const INFO_ZONE_H = 120;

export const MATERIAL_ZONE_Y = INFO_ZONE_Y + INFO_ZONE_H; // 150
export const MATERIAL_ZONE_H = 370; // increased for 2 lanes (was 280)

export const TIMELINE_Y = MATERIAL_ZONE_Y + MATERIAL_ZONE_H; // 520
export const TIMELINE_H = 100;

// --- Process box dimensions ---
export const PROC_W = 100;
export const PROC_H = 80;

// --- Lane 0: Main flow (top lane in material zone) ---
export const LANE_0_Y = MATERIAL_ZONE_Y + 20; // 170 — top edge of process boxes
export const PROCESS_Y = LANE_0_Y; // alias for backward compat

// --- Lane 1: Sub-process flow (bottom lane in material zone) ---
export const LANE_1_Y = MATERIAL_ZONE_Y + 200; // 350 — top edge of sub-process boxes
export const LANE_SEPARATOR_Y = MATERIAL_ZONE_Y + 165; // 315 — divider line between lanes

/** Return the Y coordinate for a given lane (0 or 1) */
export function getLaneY(lane: 0 | 1): number {
  return lane === 1 ? LANE_1_Y : LANE_0_Y;
}

// --- Supplier / Customer box positions ---
export const SUPPLIER_X = 20;
export const SUPPLIER_Y = LANE_0_Y;
export const CUSTOMER_X = 1060;
export const CUSTOMER_Y = LANE_0_Y;
export const ENDPOINT_W = 80;
export const ENDPOINT_H = 60;

// --- Inventory triangle ---
export const INV_SIZE = 28; // triangle half-base
export const INV_Y = LANE_0_Y + PROC_H / 2; // vertically centered with lane-0 process boxes

// Usable horizontal space for process slots (between supplier and customer)
export const USABLE_X_START = SUPPLIER_X + ENDPOINT_W + 20;
export const USABLE_X_END = CUSTOMER_X - 20;
export const USABLE_W = USABLE_X_END - USABLE_X_START; // 940

/**
 * Calculate the center X of each process slot given n processes.
 * Used by both SVGCanvas (rendering) and VSMViewer (drop insertion).
 */
export function getProcessSlotCenters(n: number): number[] {
  if (n === 0) return [];
  const slotW = USABLE_W / n;
  return Array.from({ length: n }, (_, i) => USABLE_X_START + i * slotW + slotW / 2);
}

/**
 * Given a drop x coordinate, find the insertion index (0-based).
 * Returns 0..n (n = append at end).
 */
export function getInsertionIndex(dropX: number, currentCount: number): number {
  if (currentCount === 0) return 0;
  const centers = getProcessSlotCenters(currentCount);
  for (let i = 0; i < centers.length; i++) {
    if (dropX < centers[i]) return i;
  }
  return currentCount;
}
