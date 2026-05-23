"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const CheckSheet = dynamic(() => import("./tools/CheckSheet"), { ssr: false });
const HistogramTool = dynamic(() => import("./tools/HistogramTool"), { ssr: false });
const ParetoChart = dynamic(() => import("./tools/ParetoChart"), { ssr: false });
const FishboneDiagram = dynamic(() => import("./tools/FishboneDiagram"), { ssr: false });
const ScatterPlot = dynamic(() => import("./tools/ScatterPlot"), { ssr: false });
const Stratification = dynamic(() => import("./tools/Stratification"), { ssr: false });
const ControlChartLink = dynamic(() => import("./tools/ControlChartLink"), { ssr: false });

const TOOLS = [
  { id: "checksheet", label: "① 체크시트", component: CheckSheet },
  { id: "histogram", label: "② 히스토그램", component: HistogramTool },
  { id: "pareto", label: "③ 파레토 차트", component: ParetoChart },
  { id: "fishbone", label: "④ 특성요인도", component: FishboneDiagram },
  { id: "scatter", label: "⑤ 산포도", component: ScatterPlot },
  { id: "stratification", label: "⑥ 층별", component: Stratification },
  { id: "control-chart", label: "⑦ 관리도", component: ControlChartLink },
] as const;

type ToolId = (typeof TOOLS)[number]["id"];

export default function QC7Viewer() {
  const [active, setActive] = useState<ToolId>("checksheet");

  const ActiveTool = TOOLS.find((t) => t.id === active)?.component ?? CheckSheet;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar */}
      <nav className="lg:w-48 shrink-0">
        {/* Mobile: horizontal scroll */}
        <div className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 lg:sticky lg:top-28">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActive(tool.id)}
              className={`shrink-0 text-left rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 whitespace-nowrap ${
                active === tool.id
                  ? "bg-brand-navy text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {tool.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 min-w-0 border border-border rounded-2xl p-6">
        <ActiveTool />
      </div>
    </div>
  );
}
