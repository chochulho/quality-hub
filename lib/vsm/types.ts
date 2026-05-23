export interface VSMProcess {
  id: string;
  name: string;
  cycleTime: number;       // seconds (VA time)
  changeoverTime: number;  // minutes
  uptime: number;          // 0–100 %
  operators: number;
  shifts: number;
  targetCycleTime?: number;
  targetUptime?: number;
  lane?: 0 | 1;                    // 0 = main flow (default), 1 = sub-process (separate row)
  connectsToProcessId?: string;    // lane 1 only: which lane-0 process this sub-process feeds into
}

export interface VSMInventory {
  id: string;
  quantity: number;        // pcs (between processes)
  targetQuantity?: number;
}

export interface VSMHeader {
  supplierName: string;
  customerName: string;
  dailyDemand: number;     // pcs/day
  workingSeconds: number;  // available seconds/day (default 27000)
}

export type VSMIconType =
  | "kaizen-burst"
  | "truck"
  | "factory"
  | "supermarket"
  | "kanban-post"
  | "operator"
  | "label"
  // New icons
  | "fifo-lane"
  | "production-control"
  | "manual-info-flow"
  | "electronic-info-flow"
  | "mrp-box"
  | "forklift"
  | "production-kanban"
  | "withdrawal-kanban"
  | "push-arrow"
  | "pull-arrow";

// Sidebar drag item: "process-box" creates a new VSMProcess on drop
// all other types create a DroppedIcon annotation
export type VSMSidebarItemType = "process-box" | VSMIconType;

export type VSMDropZone = "information" | "material" | "timeline";

export interface DroppedIcon {
  id: string;
  type: VSMIconType;
  x: number;    // content SVG coordinate (before zoom/pan)
  y: number;
  label?: string;
  zone?: VSMDropZone;
}

export interface VSMState {
  mode: "current" | "future";
  header: VSMHeader;
  processes: VSMProcess[];
  inventories: VSMInventory[]; // length === processes.length + 1
  droppedIcons: DroppedIcon[];
}

export interface ProcessMetrics {
  effectiveCT: number;     // cycleTime / (uptime / 100)
  taktTime: number;        // workingSeconds / dailyDemand
  bottleneckRatio: number; // effectiveCT / taktTime
  isBottleneck: boolean;
}

export interface VSMMetrics {
  taktTime: number;
  totalLTDays: number;
  vatSeconds: number;
  nvaRatio: number;        // 0–100 %
  bottleneckProcess: string;
  bottleneckRatio: number;
  processMetrics: ProcessMetrics[];
  inventoryDays: number[];
}
