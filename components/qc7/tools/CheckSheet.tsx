"use client";

import { useState } from "react";
import { Plus, Trash2, Download, RefreshCw } from "lucide-react";
import ToolShell from "../ToolShell";
import { exportCheckSheet } from "@/lib/qc7/excelExporter";

interface Item {
  id: number;
  name: string;
  count: number;
}

let nextId = 1;

export default function CheckSheet() {
  const [items, setItems] = useState<Item[]>([
    { id: nextId++, name: "스크래치", count: 0 },
    { id: nextId++, name: "치수 불량", count: 0 },
    { id: nextId++, name: "도장 불량", count: 0 },
  ]);
  const [newName, setNewName] = useState("");
  const [downloading, setDownloading] = useState(false);

  const addItem = () => {
    const name = newName.trim();
    if (!name) return;
    setItems((prev) => [...prev, { id: nextId++, name, count: 0 }]);
    setNewName("");
  };

  const increment = (id: number) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, count: it.count + 1 } : it)));

  const decrement = (id: number) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, count: Math.max(0, it.count - 1) } : it)));

  const remove = (id: number) => setItems((prev) => prev.filter((it) => it.id !== id));

  const reset = () => setItems((prev) => prev.map((it) => ({ ...it, count: 0 })));

  const total = items.reduce((s, it) => s + it.count, 0);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await exportCheckSheet(items);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ToolShell
      title="체크시트 (Check Sheet)"
      badge="QC 7가지 도구 ①"
      description="불량 유형, 발생 위치 등을 항목별로 클릭하여 집계합니다. 데이터 수집의 가장 기본적인 도구입니다."
      iatfClause="10.2 부적합 및 시정 조치"
      downloadButton={
        <button
          onClick={handleDownload}
          disabled={downloading || total === 0}
          className="inline-flex items-center gap-1.5 bg-brand-navy text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-brand-navy-dark disabled:opacity-40 transition-all"
        >
          <Download className="h-4 w-4" />
          {downloading ? "다운로드 중..." : "Excel 다운로드"}
        </button>
      }
      practice={
        <div className="space-y-4">
          {/* Add item */}
          <div className="flex gap-2">
            <input
              className="flex-1 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-navy"
              placeholder="항목 추가 (예: 외관 불량)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
            />
            <button
              onClick={addItem}
              className="inline-flex items-center gap-1 bg-brand-orange text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-brand-orange-hover transition-all"
            >
              <Plus className="h-4 w-4" /> 추가
            </button>
          </div>

          {/* Items */}
          <div className="border border-border rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted text-xs font-semibold text-muted-foreground">
                  <th className="text-left px-4 py-3">항목</th>
                  <th className="text-center px-4 py-3 w-32">집계</th>
                  <th className="text-center px-4 py-3 w-32">수량</th>
                  <th className="w-10 px-2 py-3" />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-border">
                    <td className="px-4 py-3 text-sm font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => decrement(item.id)}
                          className="w-7 h-7 rounded-lg border border-border text-muted-foreground hover:border-brand-navy hover:text-brand-navy text-lg leading-none transition-all"
                        >
                          −
                        </button>
                        <button
                          onClick={() => increment(item.id)}
                          className="w-7 h-7 rounded-lg border border-border text-muted-foreground hover:border-brand-orange hover:text-brand-orange text-lg leading-none transition-all"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-2xl font-extrabold text-brand-navy">{item.count}</span>
                    </td>
                    <td className="px-2 py-3">
                      <button onClick={() => remove(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-muted">
                  <td className="px-4 py-3 text-sm font-bold">합계</td>
                  <td />
                  <td className="px-4 py-3 text-center text-2xl font-extrabold text-brand-orange">{total}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex justify-end">
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded-full px-4 py-2 transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" /> 초기화
            </button>
          </div>
        </div>
      }
    />
  );
}
