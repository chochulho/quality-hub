"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, User, ChevronDown, Settings } from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";
import GradeBadge from "@/components/dashboard/GradeBadge";

interface WorkspaceUserMenuProps {
  name: string;
  planId: string;
  role: string;
}

export default function WorkspaceUserMenu({ name, planId, role }: WorkspaceUserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors rounded-lg px-2 py-1.5"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 shrink-0">
          <User className="h-4 w-4" />
        </span>
        <span className="hidden sm:block max-w-[100px] truncate">{name}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-52 bg-white border border-border rounded-2xl shadow-xl p-2 z-50">
          {/* 사용자 정보 */}
          <div className="px-3 py-2.5 border-b border-border mb-1">
            <p className="text-sm font-semibold text-foreground truncate">{name}</p>
            <div className="mt-1">
              <GradeBadge planId={planId} size="sm" />
            </div>
          </div>

          {/* 설정 (placeholder) */}
          <button
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-muted transition-colors text-left"
            disabled
          >
            <Settings className="h-4 w-4" />
            계정 설정
            <span className="ml-auto text-[10px] bg-muted-foreground/20 rounded-full px-1.5 py-0.5">준비 중</span>
          </button>

          {/* 로그아웃 */}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors">
            <LogOut className="h-4 w-4 text-red-500" />
            <LogoutButton
              showIcon={false}
              className="text-sm text-red-600 font-medium"
            />
          </div>
        </div>
      )}
    </div>
  );
}
