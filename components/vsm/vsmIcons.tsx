import type { VSMIconType, VSMSidebarItemType } from "@/lib/vsm/types";

interface IconProps {
  size?: number;
  fill?: string;
  stroke?: string;
}

// ── Existing icons ──────────────────────────────────────────────────────────

export function KaizenBurstIcon({ fill = "#F26B3A", stroke = "#E55A28" }: IconProps) {
  return (
    <polygon
      points="16,1 19.5,9 28,6 23,13.5 31,16 23,18.5 28,26 19.5,23 16,31 12.5,23 4,26 9,18.5 1,16 9,13.5 4,6 12.5,9"
      fill={fill}
      stroke={stroke}
      strokeWidth="0.8"
    />
  );
}

export function TruckIcon({ fill = "#2B4B8C", stroke = "#1E3666" }: IconProps) {
  return (
    <g>
      <rect x="2" y="9" width="19" height="15" rx="2" fill={fill} stroke={stroke} strokeWidth="1" />
      <rect x="21" y="13" width="9" height="11" rx="1" fill={fill} stroke={stroke} strokeWidth="1" />
      <line x1="21" y1="13" x2="21" y2="24" stroke={stroke} strokeWidth="1" />
      <circle cx="7" cy="26" r="3" fill="white" stroke={stroke} strokeWidth="1" />
      <circle cx="22" cy="26" r="3" fill="white" stroke={stroke} strokeWidth="1" />
      <rect x="22" y="15" width="6" height="5" rx="1" fill="white" opacity="0.4" />
    </g>
  );
}

export function FactoryIcon({ fill = "#2B4B8C", stroke = "#1E3666" }: IconProps) {
  return (
    <g>
      <rect x="3" y="15" width="26" height="14" rx="1" fill={fill} stroke={stroke} strokeWidth="1" />
      <rect x="6" y="7" width="4" height="10" fill={fill} stroke={stroke} strokeWidth="1" />
      <rect x="14" y="5" width="4" height="12" fill={fill} stroke={stroke} strokeWidth="1" />
      <rect x="22" y="9" width="4" height="8" fill={fill} stroke={stroke} strokeWidth="1" />
      <rect x="5" y="19" width="6" height="10" fill="white" />
      <rect x="21" y="19" width="6" height="10" fill="white" />
      <rect x="13" y="19" width="6" height="7" fill="white" />
    </g>
  );
}

export function SupermarketIcon({ fill = "#2B4B8C", stroke = "#1E3666" }: IconProps) {
  return (
    <g stroke={stroke} strokeWidth="1.5" fill="none">
      <line x1="4" y1="8" x2="28" y2="8" />
      <line x1="4" y1="17" x2="28" y2="17" />
      <line x1="4" y1="26" x2="28" y2="26" />
      <line x1="4" y1="8" x2="4" y2="29" />
      <line x1="28" y1="8" x2="28" y2="29" />
      <rect x="6" y="9" width="5" height="7" fill={fill} />
      <rect x="13" y="9" width="5" height="7" fill={fill} />
      <rect x="20" y="9" width="6" height="7" fill={fill} />
      <rect x="6" y="18" width="5" height="7" fill={fill} />
      <rect x="13" y="18" width="5" height="7" fill={fill} />
    </g>
  );
}

export function KanbanPostIcon({ fill = "#F26B3A", stroke = "#E55A28" }: IconProps) {
  return (
    <g>
      <line x1="10" y1="3" x2="10" y2="29" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <polygon points="10,3 26,3 26,16 10,16" fill={fill} stroke={stroke} strokeWidth="1" />
      <rect x="11" y="5" width="10" height="4" rx="1" fill="white" opacity="0.5" />
      <rect x="11" y="11" width="7" height="2.5" rx="1" fill="white" opacity="0.5" />
    </g>
  );
}

export function OperatorIcon({ fill = "#2B4B8C", stroke = "#1E3666" }: IconProps) {
  return (
    <g>
      <circle cx="16" cy="9" r="5.5" fill={fill} stroke={stroke} strokeWidth="1" />
      <path d="M8,29 L10,17 L22,17 L24,29 Z" fill={fill} stroke={stroke} strokeWidth="1" />
      <line x1="8" y1="21" x2="4" y2="27" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="24" y1="21" x2="28" y2="27" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
    </g>
  );
}

export function LabelIcon({ fill = "#F5F4F0", stroke = "#2B4B8C" }: IconProps) {
  return (
    <g>
      <rect x="2" y="5" width="28" height="22" rx="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
      <line x1="6" y1="12" x2="26" y2="12" stroke={stroke} strokeWidth="1" />
      <line x1="6" y1="17" x2="26" y2="17" stroke={stroke} strokeWidth="1" />
      <line x1="6" y1="22" x2="18" y2="22" stroke={stroke} strokeWidth="1" />
    </g>
  );
}

// ── New icons ────────────────────────────────────────────────────────────────

export function FifoLaneIcon({ fill = "#2B4B8C", stroke = "#1E3666" }: IconProps) {
  return (
    <g>
      <rect x="2" y="10" width="28" height="12" rx="2" fill="none" stroke={stroke} strokeWidth="1.5" />
      <line x1="9" y1="10" x2="9" y2="22" stroke={stroke} strokeWidth="1" strokeDasharray="2 2" />
      <line x1="23" y1="10" x2="23" y2="22" stroke={stroke} strokeWidth="1" strokeDasharray="2 2" />
      <text x="16" y="19" textAnchor="middle" fontSize="6" fontWeight="700" fill={fill} fontFamily="Inter, sans-serif">
        FIFO
      </text>
      <polygon points="24,16 28,16 26,13 26,19" fill={fill} />
    </g>
  );
}

export function ProductionControlIcon({ fill = "#2B4B8C", stroke = "#1E3666" }: IconProps) {
  return (
    <g>
      <rect x="2" y="5" width="28" height="22" rx="3" fill={fill} stroke={stroke} strokeWidth="1.5" />
      <line x1="2" y1="13" x2="30" y2="13" stroke={stroke} strokeWidth="1" opacity="0.5" />
      <text x="16" y="11" textAnchor="middle" fontSize="5" fontWeight="700" fill="white" fontFamily="Inter, sans-serif">
        생산관리
      </text>
      <text x="16" y="21" textAnchor="middle" fontSize="4.5" fill="white" fontFamily="Inter, sans-serif" opacity="0.9">
        Prod. Control
      </text>
      {/* Small lightning bolt */}
      <polygon points="18,24 16,26 17.5,26 15.5,30 18,27.5 16.5,27.5" fill="#F26B3A" />
    </g>
  );
}

export function ManualInfoFlowIcon({ fill = "#2B4B8C", stroke = "#1E3666" }: IconProps) {
  return (
    <g>
      <line x1="2" y1="18" x2="25" y2="18" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
      <polygon points="30,18 22,13.5 22,22.5" fill={stroke} />
      <text x="15" y="13" textAnchor="middle" fontSize="5.5" fill={fill} fontFamily="Inter, sans-serif">
        수동 정보
      </text>
    </g>
  );
}

export function ElectronicInfoFlowIcon({ fill = "#2B4B8C", stroke = "#1E3666" }: IconProps) {
  return (
    <g>
      <polyline
        points="2,18 6,11 11,25 16,11 21,18 25,18"
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon points="30,18 22,13.5 22,22.5" fill={stroke} />
      <text x="14" y="10" textAnchor="middle" fontSize="5" fill={fill} fontFamily="Inter, sans-serif">
        전자 정보
      </text>
    </g>
  );
}

export function MrpBoxIcon({ fill = "#2B4B8C", stroke = "#1E3666" }: IconProps) {
  return (
    <g>
      <rect x="2" y="5" width="28" height="22" rx="2" fill="white" stroke={stroke} strokeWidth="1.5" />
      <rect x="2" y="5" width="28" height="9" rx="2" fill={fill} />
      {/* Rounded top only via clip */}
      <rect x="2" y="10" width="28" height="4" fill={fill} />
      <text x="16" y="12" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="white" fontFamily="Inter, sans-serif">
        MRP/ERP
      </text>
      <text x="16" y="21" textAnchor="middle" fontSize="5" fill={stroke} fontFamily="Inter, sans-serif">
        데이터 박스
      </text>
      <line x1="5" y1="25" x2="27" y2="25" stroke={stroke} strokeWidth="0.7" opacity="0.4" />
    </g>
  );
}

export function ForkliftIcon({ fill = "#2B4B8C", stroke = "#1E3666" }: IconProps) {
  return (
    <g>
      {/* Body */}
      <rect x="10" y="10" width="17" height="13" rx="1" fill={fill} stroke={stroke} strokeWidth="1" />
      {/* Forks */}
      <line x1="2" y1="15" x2="10" y2="15" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="2" y1="20" x2="10" y2="20" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
      {/* Mast */}
      <rect x="25" y="6" width="3" height="17" rx="1" fill={fill} stroke={stroke} strokeWidth="0.8" />
      {/* Wheels */}
      <circle cx="14" cy="25" r="3.5" fill="white" stroke={stroke} strokeWidth="1.2" />
      <circle cx="24" cy="25" r="3.5" fill="white" stroke={stroke} strokeWidth="1.2" />
      {/* Cab window */}
      <rect x="12" y="12" width="7" height="5" rx="1" fill="white" opacity="0.35" />
    </g>
  );
}

export function ProductionKanbanIcon({ fill = "#2B4B8C", stroke = "#1E3666" }: IconProps) {
  return (
    <g>
      <rect x="2" y="6" width="28" height="20" rx="2" fill="white" stroke={stroke} strokeWidth="1.5" />
      <rect x="2" y="6" width="28" height="8" rx="2" fill={fill} />
      <rect x="2" y="10" width="28" height="4" fill={fill} />
      <text x="16" y="12" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="white" fontFamily="Inter, sans-serif">
        생산 칸반
      </text>
      <line x1="5" y1="19" x2="27" y2="19" stroke={stroke} strokeWidth="0.8" />
      <line x1="5" y1="22" x2="22" y2="22" stroke={stroke} strokeWidth="0.8" />
    </g>
  );
}

export function WithdrawalKanbanIcon({ fill = "#F26B3A", stroke = "#E55A28" }: IconProps) {
  return (
    <g>
      {/* Card with notched top-right corner */}
      <path d="M2,6 L22,6 L30,14 L30,26 L2,26 Z" fill="white" stroke={stroke} strokeWidth="1.5" />
      <path d="M22,6 L22,14 L30,14" fill="none" stroke={stroke} strokeWidth="1" />
      {/* Header bar */}
      <path d="M2,6 L22,6 L22,14 L2,14 Z" fill={fill} />
      <text x="12" y="12" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="white" fontFamily="Inter, sans-serif">
        인출 칸반
      </text>
      <line x1="5" y1="19" x2="27" y2="19" stroke={stroke} strokeWidth="0.8" />
      <line x1="5" y1="22" x2="22" y2="22" stroke={stroke} strokeWidth="0.8" />
    </g>
  );
}

// ── Arrow icons ──────────────────────────────────────────────────────────────

export function PushArrowIcon({ fill = "#2B4B8C", stroke = "#1E3666" }: IconProps) {
  return (
    <g>
      {/* Thick shaft */}
      <line x1="2" y1="16" x2="23" y2="16" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" />
      {/* Arrowhead */}
      <polygon points="30,16 21,10 21,22" fill={stroke} />
      {/* "push" label above */}
      <text x="14" y="10" textAnchor="middle" fontSize="5.5" fontWeight="700" fill={fill} fontFamily="Inter, sans-serif">push</text>
    </g>
  );
}

export function PullArrowIcon({ fill = "#F26B3A", stroke = "#E55A28" }: IconProps) {
  return (
    <g>
      {/* Curved pull arrow (C-shape turning back) */}
      <path
        d="M28,10 Q32,16 28,22 Q20,28 10,22 L14,22"
        fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round"
      />
      {/* Arrowhead at end */}
      <polygon points="8,22 16,17 16,27" fill={stroke} />
      <text x="16" y="10" textAnchor="middle" fontSize="5.5" fontWeight="700" fill={fill} fontFamily="Inter, sans-serif">pull</text>
    </g>
  );
}

// ── Sidebar "Process Box" placeholder icon ───────────────────────────────────
export function ProcessBoxIcon({ fill = "#F26B3A", stroke = "#E55A28" }: IconProps) {
  return (
    <g>
      <rect x="2" y="4" width="28" height="24" rx="3" fill="none" stroke={stroke} strokeWidth="2" strokeDasharray="3 2" />
      <text x="16" y="15" textAnchor="middle" fontSize="6" fontWeight="700" fill={fill} fontFamily="Inter, sans-serif">
        공정
      </text>
      <text x="16" y="22" textAnchor="middle" fontSize="5" fill={fill} fontFamily="Inter, sans-serif" opacity="0.7">
        박스
      </text>
    </g>
  );
}

// ── Icon map ─────────────────────────────────────────────────────────────────

export const ICON_COMPONENTS: Record<VSMIconType, React.FC<IconProps>> = {
  "kaizen-burst": KaizenBurstIcon,
  "truck": TruckIcon,
  "factory": FactoryIcon,
  "supermarket": SupermarketIcon,
  "kanban-post": KanbanPostIcon,
  "push-arrow": PushArrowIcon,
  "pull-arrow": PullArrowIcon,
  "operator": OperatorIcon,
  "label": LabelIcon,
  "fifo-lane": FifoLaneIcon,
  "production-control": ProductionControlIcon,
  "manual-info-flow": ManualInfoFlowIcon,
  "electronic-info-flow": ElectronicInfoFlowIcon,
  "mrp-box": MrpBoxIcon,
  "forklift": ForkliftIcon,
  "production-kanban": ProductionKanbanIcon,
  "withdrawal-kanban": WithdrawalKanbanIcon,
};

// ── Sidebar categories ────────────────────────────────────────────────────────

export const SIDEBAR_ICON_CATEGORIES: Array<{
  id: string;
  label: string;
  items: Array<{ type: VSMSidebarItemType; label: string; isProcessCreator?: boolean }>;
}> = [
  {
    id: "material",
    label: "물류 흐름",
    items: [
      { type: "process-box", label: "공정 박스", isProcessCreator: true },
      { type: "supermarket", label: "슈퍼마켓" },
      { type: "fifo-lane", label: "FIFO 레인" },
    ],
  },
  {
    id: "transport",
    label: "운반",
    items: [
      { type: "truck", label: "트럭" },
      { type: "forklift", label: "지게차" },
    ],
  },
  {
    id: "info",
    label: "정보 흐름",
    items: [
      { type: "production-control", label: "생산관리" },
      { type: "manual-info-flow", label: "수동 정보흐름" },
      { type: "electronic-info-flow", label: "전자 정보흐름" },
      { type: "mrp-box", label: "MRP/ERP" },
    ],
  },
  {
    id: "kanban",
    label: "칸반 신호",
    items: [
      { type: "kanban-post", label: "칸반 포스트" },
      { type: "production-kanban", label: "생산 칸반" },
      { type: "withdrawal-kanban", label: "인출 칸반" },
    ],
  },
  {
    id: "improvement",
    label: "개선 표기",
    items: [
      { type: "kaizen-burst", label: "Kaizen Burst" },
      { type: "operator", label: "작업자" },
      { type: "label", label: "작업 라벨" },
    ],
  },
  {
    id: "arrows",
    label: "화살표",
    items: [
      { type: "push-arrow", label: "푸시 화살표" },
      { type: "pull-arrow", label: "풀 화살표" },
      { type: "manual-info-flow", label: "수동 정보흐름" },
      { type: "electronic-info-flow", label: "전자 정보흐름" },
    ],
  },
];

// Legacy export for backwards compatibility (SVGCanvas still uses PALETTE_ICONS for legend)
export const PALETTE_ICONS: Array<{ type: VSMIconType; label: string }> = [
  { type: "kaizen-burst", label: "Kaizen Burst" },
  { type: "truck", label: "트럭/납품" },
  { type: "factory", label: "공장" },
  { type: "supermarket", label: "슈퍼마켓" },
  { type: "kanban-post", label: "칸반 포스트" },
  { type: "operator", label: "작업자" },
  { type: "label", label: "레이블" },
];
