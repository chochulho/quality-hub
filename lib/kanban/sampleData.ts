// Hardcoded sample data matching the Excel BOM screenshot
import type { SimulationData } from "./types";

export const SAMPLE_DATA: SimulationData = {
  bom: {
    products: [
      { id: "가", cycleTimeMin: 30, boxSize: 4  },
      { id: "나", cycleTimeMin: 20, boxSize: 10 },
      { id: "다", cycleTimeMin: 10, boxSize: 20 },
    ],
    parts: [
      { id: "A", boxSize: 10, usagePerProductBox: { 가: 2, 나: 2, 다: 1 } },
      { id: "B", boxSize: 5,  usagePerProductBox: { 가: 1, 나: 2         } },
      { id: "C", boxSize: 50, usagePerProductBox: { 가: 3, 나: 3, 다: 2 } },
      { id: "D", boxSize: 40, usagePerProductBox: { 가: 2, 나: 2, 다: 2 } },
      { id: "E", boxSize: 20, usagePerProductBox: { 가: 1,        다: 1 } },
    ],
  },
  productionPlan: {
    byProduct: {
      가: { 0: 4, 1: 2, 2: 2, 3: 6           },
      나: { 0: 6, 1: 10, 2: 6, 3: 8,  4: 10  },
      다: { 0: 20, 1: 10, 2: 30, 3: 20, 4: 30 },
    },
  },
  shippingPlan: {
    byProduct: {
      가: { 0: 20,              3: 20               },
      나: { 0: 10, 1: 10, 2: 10, 3: 20, 4: 10       },
      다: { 0: 40,       2: 20, 3: 20,       4: 40  },
    },
  },
  initialInventory: {
    fg:    { 가: 20,  나: 40,  다: 60  },
    parts: { A: 40,  B: 15,  C: 100, D: 160, E: 20 },
  },
};
