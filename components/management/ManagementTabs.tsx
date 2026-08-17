"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/management", label: "개요" },
  { href: "/management/kpi", label: "KPI/BSC" },
  { href: "/management/review", label: "경영검토" },
  { href: "/management/risk", label: "리스크분석" },
  { href: "/management/contingency", label: "비상계획" },
  { href: "/management/tft", label: "TFT활동" },
  { href: "/management/meetings", label: "회의" },
];

export default function ManagementTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1.5 border-b border-border pb-4 mb-8">
      {TABS.map((tab) => {
        const active =
          tab.href === "/management"
            ? pathname === "/management"
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              active
                ? "bg-brand-navy text-white"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
