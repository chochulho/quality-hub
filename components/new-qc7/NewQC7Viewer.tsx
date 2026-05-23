"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const AffinityDiagram = dynamic(() => import("./tools/AffinityDiagram"), { ssr: false });
const RelationsDiagram = dynamic(() => import("./tools/RelationsDiagram"), { ssr: false });
const TreeDiagram = dynamic(() => import("./tools/TreeDiagram"), { ssr: false });
const MatrixDiagram = dynamic(() => import("./tools/MatrixDiagram"), { ssr: false });
const MatrixDataAnalysis = dynamic(() => import("./tools/MatrixDataAnalysis"), { ssr: false });
const PDPC = dynamic(() => import("./tools/PDPC"), { ssr: false });
const ArrowDiagram = dynamic(() => import("./tools/ArrowDiagram"), { ssr: false });

const TOOLS = [
  { id: "affinity", label: "① 친화도", component: AffinityDiagram },
  { id: "relations", label: "② 연관도", component: RelationsDiagram },
  { id: "tree", label: "③ 계통도", component: TreeDiagram },
  { id: "matrix", label: "④ 매트릭스도", component: MatrixDiagram },
  { id: "matrix-data", label: "⑤ 데이터 해석", component: MatrixDataAnalysis },
  { id: "pdpc", label: "⑥ PDPC", component: PDPC },
  { id: "arrow", label: "⑦ 애로우 다이어그램", component: ArrowDiagram },
] as const;

type ToolId = (typeof TOOLS)[number]["id"];

export default function NewQC7Viewer() {
  const [active, setActive] = useState<ToolId>("affinity");

  const ActiveTool = TOOLS.find((t) => t.id === active)?.component ?? AffinityDiagram;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar */}
      <nav className="lg:w-52 shrink-0">
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
