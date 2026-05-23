"use client";

import { useState } from "react";
import SingleAnalysis from "./SingleAnalysis";
import BatchAnalysis from "./BatchAnalysis";

const TABS = [
  { id: "single", label: "단독 분석", desc: "규격 입력 + Excel 붙여넣기" },
  { id: "batch", label: "일괄 분석", desc: "Excel 업로드 → 다수 특성 동시 분석" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SpcAnalyzer() {
  const [activeTab, setActiveTab] = useState<TabId>("single");

  return (
    <div>
      {/* Tab navigation */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl mb-6 max-w-sm">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-white text-brand-navy shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab description */}
      <p className="text-sm text-muted-foreground mb-5">
        {TABS.find((t) => t.id === activeTab)?.desc}
      </p>

      {/* Tab content */}
      {activeTab === "single" ? <SingleAnalysis /> : <BatchAnalysis />}
    </div>
  );
}
