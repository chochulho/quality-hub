import ExcelJS from "exceljs";
import type { VariableResult, AttributeResult } from "./calculations";

const BORDER: Partial<ExcelJS.Borders> = {
  top: { style: "thin" }, bottom: { style: "thin" },
  left: { style: "thin" }, right: { style: "thin" },
};

const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern", pattern: "solid",
  fgColor: { argb: "FF2B4B8C" },
};

const OOC_FILL: ExcelJS.Fill = {
  type: "pattern", pattern: "solid",
  fgColor: { argb: "FFFEE2E2" },
};

function headerRow(ws: ExcelJS.Worksheet, cols: string[]) {
  const row = ws.addRow(cols);
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = HEADER_FILL;
    cell.border = BORDER;
    cell.alignment = { horizontal: "center" };
  });
}

function dataRow(
  ws: ExcelJS.Worksheet,
  values: (string | number)[],
  ooc = false
) {
  const row = ws.addRow(values);
  row.eachCell((cell) => {
    cell.border = BORDER;
    cell.alignment = { horizontal: "center" };
    if (ooc) cell.fill = OOC_FILL;
  });
}

export async function exportVariableToExcel(result: VariableResult): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Quality Hub";

  // ── Upper chart sheet ───────────────────────────────────
  const ws1 = wb.addWorksheet(result.upperLabel);
  ws1.columns = [
    { key: "label", width: 10 },
    { key: "value", width: 14 },
    { key: "ucl",   width: 14 },
    { key: "cl",    width: 14 },
    { key: "lcl",   width: 14 },
    { key: "ooc",   width: 12 },
  ];
  headerRow(ws1, ["번호", "값", "UCL", "CL", "LCL", "이상 여부"]);
  result.upperChart.forEach((p) =>
    dataRow(ws1, [p.label, p.value, p.ucl, p.cl, p.lcl, p.ooc ? "이상" : ""], p.ooc)
  );

  // ── Lower chart sheet ───────────────────────────────────
  const ws2 = wb.addWorksheet(result.lowerLabel);
  ws2.columns = ws1.columns;
  headerRow(ws2, ["번호", "값", "UCL", "CL", "LCL", "이상 여부"]);
  result.lowerChart.forEach((p) =>
    dataRow(ws2, [p.label, p.value, p.ucl, p.cl, p.lcl, p.ooc ? "이상" : ""], p.ooc)
  );

  // ── Summary sheet ───────────────────────────────────────
  const ws3 = wb.addWorksheet("요약");
  ws3.getColumn(1).width = 22;
  ws3.getColumn(2).width = 16;
  const summaryRows: [string, string | number][] = [
    ["관리도 유형", result.type.toUpperCase()],
    ["소그룹 크기 (n)", result.n],
    ["전체 평균 (X̄ ̄)", result.xbarbar],
  ];
  if (result.rbar != null) summaryRows.push(["평균 범위 (R̄)", result.rbar]);
  if (result.sbar != null) summaryRows.push(["평균 표준편차 (S̄)", result.sbar]);
  if (result.mRbar != null) summaryRows.push(["평균 이동범위 (MR̄)", result.mRbar]);
  const upperOoc = result.upperChart.filter((p) => p.ooc).length;
  const lowerOoc = result.lowerChart.filter((p) => p.ooc).length;
  summaryRows.push(
    [`${result.upperLabel} 이상 포인트`, upperOoc],
    [`${result.lowerLabel} 이상 포인트`, lowerOoc]
  );
  summaryRows.forEach(([k, v]) => {
    const row = ws3.addRow([k, v]);
    row.getCell(1).font = { bold: true };
    row.eachCell((c) => (c.border = BORDER));
  });

  await downloadWorkbook(wb, `${result.type}-chart.xlsx`);
}

export async function exportAttributeToExcel(result: AttributeResult, chartTitle: string): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Quality Hub";

  const ws = wb.addWorksheet(chartTitle);
  ws.columns = [
    { key: "label", width: 10 },
    { key: "value", width: 14 },
    { key: "ucl",   width: 14 },
    { key: "cl",    width: 14 },
    { key: "lcl",   width: 14 },
    { key: "ooc",   width: 12 },
  ];
  headerRow(ws, ["번호", "값", "UCL", "CL", "LCL", "이상 여부"]);
  result.chart.forEach((p) =>
    dataRow(ws, [p.label, p.value, p.ucl, p.cl, p.lcl, p.ooc ? "이상" : ""], p.ooc)
  );

  const ws2 = wb.addWorksheet("요약");
  ws2.getColumn(1).width = 22;
  ws2.getColumn(2).width = 16;
  const rows: [string, string | number][] = [
    ["관리도 유형", result.type.toUpperCase() + " 관리도"],
    ["중심선 (CL)", result.centerLine],
    ["이상 포인트 수", result.chart.filter((p) => p.ooc).length],
  ];
  rows.forEach(([k, v]) => {
    const row = ws2.addRow([k, v]);
    row.getCell(1).font = { bold: true };
    row.eachCell((c) => (c.border = BORDER));
  });

  await downloadWorkbook(wb, `${result.type}-chart.xlsx`);
}

async function downloadWorkbook(wb: ExcelJS.Workbook, filename: string) {
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
