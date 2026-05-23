"use client";

import { useState } from "react";
import { Printer, FileSpreadsheet } from "lucide-react";
import { exportSingleResult } from "@/lib/spc/excelExporter";
import type { CapabilityResult } from "@/lib/spc/statistics";

interface ExportButtonsProps {
  result: CapabilityResult;
  data: number[];
  characteristicName: string;
}

export default function ExportButtons({ result, data, characteristicName }: ExportButtonsProps) {
  const [excelLoading, setExcelLoading] = useState(false);

  const handlePDF = () => {
    window.print();
  };

  const handleExcel = async () => {
    setExcelLoading(true);
    try {
      let chartBase64: string | undefined;

      const chartEl = document.getElementById("capability-chart");
      if (chartEl) {
        const { default: html2canvas } = await import("html2canvas");
        const canvas = await html2canvas(chartEl, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        });
        chartBase64 = canvas.toDataURL("image/png").split(",")[1];
      }

      await exportSingleResult(result, data, characteristicName || "특성", chartBase64);
    } finally {
      setExcelLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePDF}
        className="inline-flex items-center gap-1.5 border border-border rounded-full px-4 py-2 text-sm font-medium text-foreground hover:border-brand-navy hover:bg-muted transition-all"
      >
        <Printer className="h-4 w-4" />
        PDF 저장
      </button>
      <button
        onClick={handleExcel}
        disabled={excelLoading}
        className="inline-flex items-center gap-1.5 border border-border rounded-full px-4 py-2 text-sm font-medium text-foreground hover:border-brand-navy hover:bg-muted transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FileSpreadsheet className="h-4 w-4 text-green-700" />
        {excelLoading ? "생성 중…" : "Excel 다운로드"}
      </button>
    </div>
  );
}
