"use client";

import { ChevronDown, Layers } from "lucide-react";
import { PALETTE_ICONS, ICON_COMPONENTS } from "./vsmIcons";
import type { VSMIconType } from "@/lib/vsm/types";

interface Props {
  open: boolean;
  onToggle: () => void;
}

export function VSMIconPalette({ open, onToggle }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-brand-navy">
          <Layers className="h-4 w-4 text-brand-orange" />
          VSM 아이콘 팔레트
          <span className="text-xs font-normal text-muted-foreground">드래그해서 맵에 배치</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 p-3 border-t border-border">
          {PALETTE_ICONS.map(({ type, label }) => {
            const Icon = ICON_COMPONENTS[type as VSMIconType];
            return (
              <div
                key={type}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", type);
                  e.dataTransfer.effectAllowed = "copy";
                }}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl border border-border
                  hover:border-brand-orange hover:bg-brand-orange/5 cursor-grab
                  active:cursor-grabbing transition-all select-none"
                title={label}
              >
                <svg viewBox="0 0 32 32" width="32" height="32">
                  <Icon />
                </svg>
                <span className="text-[10px] text-muted-foreground text-center leading-tight">
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
