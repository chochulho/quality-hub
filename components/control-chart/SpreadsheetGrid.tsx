"use client";

import {
  useRef, useCallback,
  type KeyboardEvent, type ClipboardEvent,
} from "react";
import { Plus } from "lucide-react";

interface SpreadsheetGridProps {
  data: string[][];
  onChange: (data: string[][]) => void;
  colHeaders: string[];
  rowLabel?: string;
  minRows?: number;
  placeholder?: string;
}

export function SpreadsheetGrid({
  data,
  onChange,
  colHeaders,
  rowLabel = "No.",
  minRows = 15,
  placeholder = "0",
}: SpreadsheetGridProps) {
  const cols = colHeaders.length;
  const tbodyRef = useRef<HTMLTableSectionElement>(null);

  // Always show at least minRows
  const displayData: string[][] =
    data.length >= minRows
      ? data
      : [...data, ...Array.from({ length: minRows - data.length }, () => Array(cols).fill(""))];

  // ── Update single cell ────────────────────────────────────────────────────
  const updateCell = useCallback(
    (row: number, col: number, value: string) => {
      const next = displayData.map((r, ri) =>
        ri === row ? r.map((c, ci) => (ci === col ? value : c)) : [...r]
      );
      onChange(next);
    },
    [displayData, onChange]
  );

  // ── Focus helper ──────────────────────────────────────────────────────────
  const focusCell = useCallback((row: number, col: number) => {
    const input = tbodyRef.current?.querySelector<HTMLInputElement>(
      `[data-r="${row}"][data-c="${col}"]`
    );
    input?.focus();
  }, []);

  // ── Keyboard navigation ───────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>, row: number, col: number) => {
      const rows = displayData.length;
      switch (e.key) {
        case "Tab":
          e.preventDefault();
          if (e.shiftKey) {
            if (col > 0) focusCell(row, col - 1);
            else if (row > 0) focusCell(row - 1, cols - 1);
          } else {
            if (col < cols - 1) focusCell(row, col + 1);
            else if (row + 1 < rows) focusCell(row + 1, 0);
          }
          break;
        case "Enter":
          e.preventDefault();
          if (row + 1 < rows) focusCell(row + 1, col);
          break;
        case "ArrowUp":
          if (row > 0) { e.preventDefault(); focusCell(row - 1, col); }
          break;
        case "ArrowDown":
          if (row + 1 < rows) { e.preventDefault(); focusCell(row + 1, col); }
          break;
        case "ArrowLeft":
          if ((e.target as HTMLInputElement).selectionStart === 0 && col > 0) {
            e.preventDefault(); focusCell(row, col - 1);
          }
          break;
        case "ArrowRight": {
          const inp = e.target as HTMLInputElement;
          if (inp.selectionStart === inp.value.length && col < cols - 1) {
            e.preventDefault(); focusCell(row, col + 1);
          }
          break;
        }
      }
    },
    [displayData.length, cols, focusCell]
  );

  // ── Paste from Excel ──────────────────────────────────────────────────────
  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>, startRow: number, startCol: number) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      const pasteRows = text
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .trimEnd()
        .split("\n")
        .map((r) => r.split("\t"));

      const neededRows = startRow + pasteRows.length;
      const base: string[][] = Array.from(
        { length: Math.max(displayData.length, neededRows) },
        (_, ri) => displayData[ri] ? [...displayData[ri]] : Array(cols).fill("")
      );

      pasteRows.forEach((pr, ri) => {
        pr.forEach((val, ci) => {
          const r = startRow + ri;
          const c = startCol + ci;
          if (r < base.length && c < cols) base[r][c] = val.trim();
        });
      });

      onChange(base);
      // Focus last pasted cell
      const lastRow = Math.min(startRow + pasteRows.length - 1, base.length - 1);
      const lastCol = Math.min(startCol + (pasteRows[pasteRows.length - 1]?.length ?? 1) - 1, cols - 1);
      setTimeout(() => focusCell(lastRow, lastCol), 0);
    },
    [displayData, cols, onChange, focusCell]
  );

  // ── Add rows ──────────────────────────────────────────────────────────────
  const addRows = useCallback(() => {
    const next = [...displayData, ...Array.from({ length: 5 }, () => Array(cols).fill(""))];
    onChange(next);
  }, [displayData, cols, onChange]);

  // ── Clear all ─────────────────────────────────────────────────────────────
  const clearAll = useCallback(() => {
    onChange(Array.from({ length: minRows }, () => Array(cols).fill("")));
    setTimeout(() => focusCell(0, 0), 0);
  }, [cols, minRows, onChange, focusCell]);

  const filledRows = displayData.filter((r) => r.some((c) => c.trim() !== "")).length;

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="overflow-auto max-h-72">
        <table className="w-full border-collapse text-xs" style={{ minWidth: cols * 80 + 48 }}>
          {/* Column headers */}
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="w-10 bg-slate-100 border-b border-r border-border px-2 py-1.5 text-center text-muted-foreground font-medium select-none">
                {rowLabel}
              </th>
              {colHeaders.map((h, ci) => (
                <th
                  key={ci}
                  className="bg-slate-100 border-b border-r border-border px-2 py-1.5 text-center text-muted-foreground font-medium select-none"
                  style={{ minWidth: 80 }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          {/* Data rows */}
          <tbody ref={tbodyRef}>
            {displayData.map((row, ri) => {
              const isEmpty = row.every((c) => c === "");
              return (
                <tr key={ri} className={isEmpty ? "opacity-40 hover:opacity-70" : "hover:bg-blue-50/30"}>
                  {/* Row number */}
                  <td className="bg-slate-50 border-b border-r border-border px-2 py-0 text-center text-muted-foreground font-mono select-none">
                    {ri + 1}
                  </td>
                  {/* Data cells */}
                  {row.map((cell, ci) => (
                    <td key={ci} className="border-b border-r border-border p-0">
                      <input
                        data-r={ri}
                        data-c={ci}
                        type="text"
                        inputMode="decimal"
                        value={cell}
                        placeholder={placeholder}
                        onChange={(e) => updateCell(ri, ci, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, ri, ci)}
                        onPaste={(e) => handlePaste(e, ri, ci)}
                        className="w-full h-full px-2 py-1.5 text-center font-mono bg-transparent outline-none focus:bg-blue-100/60 focus:ring-1 focus:ring-inset focus:ring-brand-navy placeholder:text-slate-300"
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-t border-border">
        <button
          type="button"
          onClick={addRows}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="h-3 w-3" />
          5행 추가
        </button>
        <span className="text-xs text-muted-foreground">
          {filledRows}행 입력됨 · {displayData.length}행 × {cols}열
        </span>
        <button
          type="button"
          onClick={clearAll}
          className="text-xs text-muted-foreground hover:text-red-500 transition-colors"
        >
          초기화
        </button>
      </div>
    </div>
  );
}
