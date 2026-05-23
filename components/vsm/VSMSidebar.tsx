"use client";

import { useState } from "react";
import { Layers, ChevronDown, ChevronRight, Plus, X } from "lucide-react";
import type { VSMSidebarItemType } from "@/lib/vsm/types";
import {
  SIDEBAR_ICON_CATEGORIES,
  ICON_COMPONENTS,
  ProcessBoxIcon,
} from "./vsmIcons";

interface VSMSidebarProps {
  onDragStart: (type: VSMSidebarItemType, e: React.DragEvent<HTMLDivElement>) => void;
  onAddProcess?: () => void; // mobile: tap to add process
  className?: string;
  isMobile?: boolean;
  mobileOpen?: boolean;
  onMobileToggle?: () => void;
}

function IconTile({
  type,
  label,
  isProcessCreator,
  onDragStart,
  onClick,
}: {
  type: VSMSidebarItemType;
  label: string;
  isProcessCreator?: boolean;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onClick?: () => void;
}) {
  const IconComp =
    type === "process-box"
      ? ProcessBoxIcon
      : ICON_COMPONENTS[type as keyof typeof ICON_COMPONENTS];

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      title={label}
      className={`group flex flex-col items-center justify-center gap-1 w-full aspect-square rounded-xl border cursor-grab active:cursor-grabbing transition-all duration-150 select-none p-1 ${
        isProcessCreator
          ? "border-brand-orange/40 bg-brand-orange/5 hover:border-brand-orange hover:bg-brand-orange/10 hover:scale-105"
          : "border-border bg-white hover:border-brand-navy/40 hover:bg-brand-navy/5 hover:scale-105"
      }`}
    >
      <svg viewBox="0 0 32 32" width={26} height={26} className="flex-shrink-0">
        {IconComp && <IconComp />}
      </svg>
      <span
        className={`text-[9px] leading-tight text-center break-all font-medium ${
          isProcessCreator ? "text-brand-orange" : "text-muted-foreground group-hover:text-foreground"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

// ── Desktop sidebar ──────────────────────────────────────────────────────────

function DesktopSidebar({
  onDragStart,
}: {
  onDragStart: (type: VSMSidebarItemType, e: React.DragEvent<HTMLDivElement>) => void;
}) {
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    () => new Set(SIDEBAR_ICON_CATEGORIES.map((c) => c.id))
  );

  function toggleCategory(id: string) {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <aside className="w-[196px] min-w-[196px] border-r border-border bg-muted/20 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-border bg-white">
        <Layers className="h-3.5 w-3.5 text-brand-navy" />
        <span className="text-[11px] font-semibold text-brand-navy tracking-wide">VSM 기호 라이브러리</span>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto py-1">
        {SIDEBAR_ICON_CATEGORIES.map((cat) => {
          const isOpen = openCategories.has(cat.id);
          return (
            <div key={cat.id}>
              <button
                onClick={() => toggleCategory(cat.id)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground hover:bg-muted/40 transition-colors"
              >
                {cat.label}
                {isOpen ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>

              {isOpen && (
                <div className="grid grid-cols-3 gap-1.5 px-2 pb-2">
                  {cat.items.map((item) => (
                    <IconTile
                      key={item.type}
                      type={item.type}
                      label={item.label}
                      isProcessCreator={item.isProcessCreator}
                      onDragStart={(e) => onDragStart(item.type, e)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-2 border-t border-border text-[9px] text-muted-foreground leading-relaxed bg-white">
        아이콘을 캔버스로 드래그하여 배치하세요.
        <br />
        <span className="text-brand-orange font-medium">공정 박스</span>는 드래그 시 새 공정을 추가합니다.
      </div>
    </aside>
  );
}

// ── Mobile bottom sheet ──────────────────────────────────────────────────────

function MobileSidebar({
  mobileOpen,
  onMobileToggle,
  onDragStart,
  onAddProcess,
}: {
  mobileOpen: boolean;
  onMobileToggle: () => void;
  onDragStart: (type: VSMSidebarItemType, e: React.DragEvent<HTMLDivElement>) => void;
  onAddProcess?: () => void;
}) {
  const [activeCategory, setActiveCategory] = useState<string>(
    SIDEBAR_ICON_CATEGORIES[0].id
  );

  const currentCat = SIDEBAR_ICON_CATEGORIES.find((c) => c.id === activeCategory)!;

  return (
    <>
      {/* Toggle button */}
      <div className="fixed bottom-4 right-4 z-50 flex gap-2">
        {onAddProcess && (
          <button
            onClick={onAddProcess}
            className="flex items-center gap-1.5 rounded-full bg-brand-orange text-white px-4 py-2.5 text-sm font-semibold shadow-lg hover:bg-brand-orange/90 transition-all"
          >
            <Plus className="h-4 w-4" />
            공정 추가
          </button>
        )}
        <button
          onClick={onMobileToggle}
          className="flex items-center gap-1.5 rounded-full bg-brand-navy text-white px-4 py-2.5 text-sm font-semibold shadow-lg hover:bg-brand-navy-dark transition-all"
        >
          <Layers className="h-4 w-4" />
          기호
        </button>
      </div>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={onMobileToggle}
        />
      )}

      {/* Bottom sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl border-t border-border shadow-xl transition-transform duration-300 ${
          mobileOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Handle */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-border mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
          <span className="text-sm font-semibold text-brand-navy">VSM 기호 라이브러리</span>
          <button onClick={onMobileToggle}>
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 px-3 pb-2 overflow-x-auto">
          {SIDEBAR_ICON_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-full px-3 py-1 text-[11px] font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? "bg-brand-navy text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Icons grid */}
        <div className="grid grid-cols-4 gap-2 px-4 pb-6 max-h-48 overflow-y-auto">
          {currentCat.items.map((item) => (
            <IconTile
              key={item.type}
              type={item.type}
              label={item.label}
              isProcessCreator={item.isProcessCreator}
              onDragStart={(e) => onDragStart(item.type, e)}
              onClick={
                item.isProcessCreator && onAddProcess ? onAddProcess : undefined
              }
            />
          ))}
        </div>

        <p className="text-center text-[10px] text-muted-foreground pb-3 px-4">
          데스크탑에서 드래그로 정확한 위치에 배치하세요
        </p>
      </div>
    </>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function VSMSidebar({
  onDragStart,
  onAddProcess,
  className = "",
  isMobile = false,
  mobileOpen = false,
  onMobileToggle,
}: VSMSidebarProps) {
  function handleDragStart(type: VSMSidebarItemType, e: React.DragEvent<HTMLDivElement>) {
    e.dataTransfer.setData("vsm-item-type", type);
    e.dataTransfer.effectAllowed = "copy";
    onDragStart(type, e);
  }

  if (isMobile) {
    return (
      <div className={className}>
        <MobileSidebar
          mobileOpen={mobileOpen}
          onMobileToggle={onMobileToggle ?? (() => {})}
          onDragStart={handleDragStart}
          onAddProcess={onAddProcess}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <DesktopSidebar onDragStart={handleDragStart} />
    </div>
  );
}
