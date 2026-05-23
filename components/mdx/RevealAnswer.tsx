"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function RevealAnswer({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="my-0 rounded-b-xl border border-t-0 border-border overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-brand-navy hover:bg-brand-navy-dark text-white text-sm font-semibold transition-colors"
        style={{ fontFamily: "inherit" }}
      >
        <span className="flex items-center gap-2">
          <span>{open ? "해답 숨기기" : "해답 보기"}</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="prose max-w-none p-5 bg-sky-50/40 border-t border-border text-sm leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}
