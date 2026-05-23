"use client";

import { useState } from "react";
import type { ReactNode } from "react";

interface Tab {
  id: string;
  label: string;
  sublabel?: string;
  content: ReactNode;
}

interface Props {
  tabs: Tab[];
  defaultTab?: string;
}

export function LeanGuideTabs({ tabs, defaultTab }: Props) {
  const [activeId, setActiveId] = useState(defaultTab ?? tabs[0]?.id);

  return (
    <div className="flex flex-col gap-6">
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveId(tab.id)}
              className={`shrink-0 flex flex-col items-start px-4 py-3 text-sm transition-all duration-200 border-b-2 -mb-px ${
                isActive
                  ? "border-brand-orange text-brand-navy font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <span>{tab.label}</span>
              {tab.sublabel && (
                <span className="text-[10px] font-normal text-muted-foreground">{tab.sublabel}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab panels — all mounted, non-active hidden via CSS */}
      {tabs.map((tab) => (
        <div key={tab.id} className={tab.id === activeId ? "" : "hidden"}>
          {tab.content}
        </div>
      ))}
    </div>
  );
}
