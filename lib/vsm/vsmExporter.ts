import ExcelJS from "exceljs";
import type { VSMState } from "./types";
import { calcVSMMetrics } from "./vsmMetrics";

function solidFill(argb: string): ExcelJS.Fill {
  return { type: "pattern", pattern: "solid", fgColor: { argb } };
}

function border(): Partial<ExcelJS.Borders> {
  const s: ExcelJS.BorderStyle = "thin";
  const c = { argb: "FFE8E4DC" };
  return { top: { style: s, color: c }, bottom: { style: s, color: c }, left: { style: s, color: c }, right: { style: s, color: c } };
}

function headerCell(cell: ExcelJS.Cell, text: string) {
  cell.value = text;
  cell.fill = solidFill("FF2B4B8C");
  cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
  cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  cell.border = border();
}

async function downloadWorkbook(wb: ExcelJS.Workbook, filename: string) {
  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportVSM(state: VSMState): Promise<void> {
  const metrics = calcVSMMetrics(state);
  const wb = new ExcelJS.Workbook();
  wb.creator = "QMintel VSM";

  // ── Sheet 1: 공정 데이터 ────────────────────────────────────────────────────
  const ws1 = wb.addWorksheet("공정 데이터");
  ws1.columns = [
    { key: "name",       width: 16 },
    { key: "ct",         width: 10 },
    { key: "effectiveCt",width: 12 },
    { key: "co",         width: 10 },
    { key: "uptime",     width: 10 },
    { key: "operators",  width: 10 },
    { key: "shifts",     width: 10 },
    { key: "invBefore",  width: 12 },
    { key: "invDays",    width: 12 },
    { key: "takt",       width: 10 },
    { key: "bottleneck", width: 12 },
  ];

  const headers = [
    "공정명", "CT (초)", "유효 CT (초)", "C/O (분)", "가동률 (%)",
    "작업자", "교대", "전 재공 (pcs)", "재공 일수", "택트타임 (초)", "병목 여부",
  ];
  const hRow = ws1.addRow(headers);
  hRow.height = 30;
  headers.forEach((_, i) => headerCell(hRow.getCell(i + 1), headers[i]));

  state.processes.forEach((p, i) => {
    const m = metrics.processMetrics[i];
    const inv = state.inventories[i];
    const row = ws1.addRow([
      p.name,
      p.cycleTime,
      Math.round(m.effectiveCT * 10) / 10,
      p.changeoverTime,
      p.uptime,
      p.operators,
      p.shifts,
      inv.quantity,
      Math.round(metrics.inventoryDays[i] * 10) / 10,
      Math.round(metrics.taktTime * 10) / 10,
      m.isBottleneck ? "▲ 병목" : "",
    ]);
    row.height = 22;
    row.eachCell((c) => {
      c.border = border();
      c.alignment = { vertical: "middle", horizontal: "center" };
    });
    if (m.isBottleneck) {
      row.getCell(11).fill = solidFill("FFFFF3E0");
      row.getCell(11).font = { bold: true, color: { argb: "FFF26B3A" } };
    }
    if (m.bottleneckRatio > 1) {
      row.getCell(3).fill = solidFill("FFFFEBEE");
      row.getCell(3).font = { color: { argb: "FFDC2626" } };
    }
  });

  // Last inventory
  const lastInv = state.inventories[state.processes.length];
  const lastDays = metrics.inventoryDays[state.processes.length];
  const lastRow = ws1.addRow([
    "(완제품 재고)",
    "", "", "", "", "", "",
    lastInv.quantity,
    Math.round(lastDays * 10) / 10,
    "", "",
  ]);
  lastRow.height = 22;
  lastRow.eachCell((c) => { c.border = border(); c.alignment = { vertical: "middle", horizontal: "center" }; });

  // ── Sheet 2: VSM 요약 ───────────────────────────────────────────────────────
  const ws2 = wb.addWorksheet("VSM 요약");
  ws2.columns = [{ key: "label", width: 24 }, { key: "value", width: 20 }];

  const today = new Date().toLocaleDateString("ko-KR");
  const summaryRows: [string, string | number][] = [
    ["분석일", today],
    ["공급자", state.header.supplierName],
    ["고객", state.header.customerName],
    ["일 수요 (pcs)", state.header.dailyDemand],
    ["가용 근무 시간 (초)", state.header.workingSeconds],
    ["택트타임 (초)", Math.round(metrics.taktTime * 10) / 10],
    ["총 리드타임 (일)", Math.round(metrics.totalLTDays * 100) / 100],
    ["부가가치 시간 (초)", metrics.vatSeconds],
    ["NVA 비율 (%)", Math.round(metrics.nvaRatio * 10) / 10],
    ["병목 공정", metrics.bottleneckProcess],
    ["병목 비율 (유효CT / TT)", Math.round(metrics.bottleneckRatio * 100) / 100],
  ];

  const h2Row = ws2.addRow(["항목", "값"]);
  h2Row.height = 28;
  headerCell(h2Row.getCell(1), "항목");
  headerCell(h2Row.getCell(2), "값");

  summaryRows.forEach(([label, value]) => {
    const row = ws2.addRow([label, value]);
    row.height = 22;
    row.getCell(1).fill = solidFill("FFF5F4F0");
    row.getCell(1).font = { bold: true };
    row.eachCell((c) => {
      c.border = border();
      c.alignment = { vertical: "middle" };
    });
  });

  await downloadWorkbook(wb, `VSM_${state.mode === "current" ? "현재상태" : "미래상태"}_${today.replace(/\./g, "")}.xlsx`);
}
