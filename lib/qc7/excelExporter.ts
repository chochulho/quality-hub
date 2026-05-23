import ExcelJS from "exceljs";

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

function headerRow(ws: ExcelJS.Worksheet, values: string[]) {
  const row = ws.addRow(values);
  row.font = { bold: true };
  row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8E4DC" } };
}

function addChartImage(ws: ExcelJS.Worksheet, wb: ExcelJS.Workbook, base64: string, col: number, row: number) {
  const imageId = wb.addImage({ base64, extension: "png" });
  ws.addImage(imageId, { tl: { col, row }, ext: { width: 520, height: 300 } });
}

// ─── Check Sheet ─────────────────────────────────────────────────────────────

export async function exportCheckSheet(
  items: { name: string; count: number }[]
) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("체크시트");
  ws.columns = [{ width: 30 }, { width: 12 }, { width: 12 }];
  headerRow(ws, ["항목", "집계 수", "비율 (%)"]);
  const total = items.reduce((s, i) => s + i.count, 0);
  for (const item of items) {
    ws.addRow([item.name, item.count, total ? +((item.count / total) * 100).toFixed(1) : 0]);
  }
  ws.addRow(["합계", total, 100]);
  await downloadWorkbook(wb, "체크시트.xlsx");
}

// ─── Histogram ───────────────────────────────────────────────────────────────

export async function exportHistogram(
  data: number[],
  bins: { x: number; count: number }[],
  chartBase64?: string
) {
  const wb = new ExcelJS.Workbook();
  const ws1 = wb.addWorksheet("원본 데이터");
  ws1.columns = [{ width: 16 }];
  headerRow(ws1, ["측정값"]);
  data.forEach((v) => ws1.addRow([v]));

  const ws2 = wb.addWorksheet("빈도표");
  ws2.columns = [{ width: 16 }, { width: 12 }];
  headerRow(ws2, ["구간 중앙값", "빈도"]);
  bins.forEach((b) => ws2.addRow([b.x, b.count]));

  if (chartBase64) addChartImage(ws2, wb, chartBase64, 3, 0);

  await downloadWorkbook(wb, "히스토그램.xlsx");
}

// ─── Pareto Chart ─────────────────────────────────────────────────────────────

export async function exportPareto(
  rows: { name: string; count: number; cumPct: number }[],
  chartBase64?: string
) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("파레토");
  ws.columns = [{ width: 30 }, { width: 12 }, { width: 14 }];
  headerRow(ws, ["항목", "빈도", "누적 비율 (%)"]);
  rows.forEach((r) => ws.addRow([r.name, r.count, +r.cumPct.toFixed(1)]));
  if (chartBase64) addChartImage(ws, wb, chartBase64, 4, 0);
  await downloadWorkbook(wb, "파레토차트.xlsx");
}

// ─── Fishbone ─────────────────────────────────────────────────────────────────

export async function exportFishbone(
  effect: string,
  categories: { name: string; causes: { text: string; subCauses: string[] }[] }[]
) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("특성요인도");
  ws.columns = [{ width: 20 }, { width: 30 }, { width: 30 }];
  const titleRow = ws.addRow(["결과 (Effect)", effect]);
  titleRow.font = { bold: true };
  ws.addRow([]);
  headerRow(ws, ["카테고리", "원인", "하위 원인"]);

  for (const cat of categories) {
    if (cat.causes.length === 0) {
      ws.addRow([cat.name, "", ""]);
      continue;
    }
    let catPrinted = false;
    for (const cause of cat.causes) {
      const catLabel = catPrinted ? "" : cat.name;
      if (cause.subCauses.length === 0) {
        ws.addRow([catLabel, cause.text, ""]);
        catPrinted = true;
      } else {
        let causePrinted = false;
        for (const sc of cause.subCauses) {
          ws.addRow([
            catPrinted ? "" : catLabel,
            causePrinted ? "" : cause.text,
            sc,
          ]);
          catPrinted = true;
          causePrinted = true;
        }
      }
    }
  }
  await downloadWorkbook(wb, "특성요인도.xlsx");
}

// ─── Scatter Plot ─────────────────────────────────────────────────────────────

export async function exportScatter(
  xLabel: string,
  yLabel: string,
  xs: number[],
  ys: number[],
  r: number,
  slope: number,
  intercept: number,
  chartBase64?: string
) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("산포도");
  ws.columns = [{ width: 16 }, { width: 16 }];
  headerRow(ws, [xLabel, yLabel]);
  xs.forEach((x, i) => ws.addRow([x, ys[i]]));

  const ws2 = wb.addWorksheet("통계 요약");
  ws2.columns = [{ width: 24 }, { width: 16 }];
  ws2.addRow(["Pearson r", +r.toFixed(4)]);
  ws2.addRow(["기울기 (slope)", +slope.toFixed(4)]);
  ws2.addRow(["절편 (intercept)", +intercept.toFixed(4)]);
  if (chartBase64) addChartImage(ws2, wb, chartBase64, 3, 0);

  await downloadWorkbook(wb, "산포도.xlsx");
}

// ─── Stratification ──────────────────────────────────────────────────────────

export async function exportStratification(
  groups: { name: string; data: number[] }[],
  chartBase64?: string
) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("층별");
  const colWidth = groups.map((g) => Math.max(g.name.length * 2, 14));
  ws.columns = groups.map((g, i) => ({ header: g.name, width: colWidth[i] }));
  headerRow(ws, groups.map((g) => g.name));
  const maxLen = Math.max(...groups.map((g) => g.data.length));
  for (let i = 0; i < maxLen; i++) {
    ws.addRow(groups.map((g) => g.data[i] ?? ""));
  }
  if (chartBase64) addChartImage(ws, wb, chartBase64, groups.length + 1, 0);
  await downloadWorkbook(wb, "층별.xlsx");
}

// ─── Affinity Diagram ────────────────────────────────────────────────────────

export async function exportAffinity(
  groups: { name: string; cards: string[] }[]
) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("친화도");
  ws.columns = [{ width: 24 }, { width: 40 }];
  headerRow(ws, ["그룹", "카드 내용"]);
  for (const g of groups) {
    if (g.cards.length === 0) {
      ws.addRow([g.name, ""]);
    } else {
      g.cards.forEach((c, i) => ws.addRow([i === 0 ? g.name : "", c]));
    }
  }
  await downloadWorkbook(wb, "친화도.xlsx");
}

// ─── Relations Diagram ───────────────────────────────────────────────────────

export async function exportRelations(
  factors: string[],
  matrix: boolean[][],
  outCounts: number[]
) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("연관도");
  ws.columns = [{ width: 24 }, ...factors.map(() => ({ width: 10 })), { width: 12 }, { width: 12 }];
  headerRow(ws, ["요인", ...factors, "출력(원인)", "순위"]);
  const inCounts = factors.map((_, j) => matrix.reduce((s, row) => s + (row[j] ? 1 : 0), 0));
  const sorted = outCounts.map((o, i) => ({ i, score: o - inCounts[i] })).sort((a, b) => b.score - a.score);
  const rank = new Array(factors.length);
  sorted.forEach((s, r) => (rank[s.i] = r + 1));
  factors.forEach((f, i) => {
    ws.addRow([f, ...matrix[i].map((v) => (v ? "→" : "")), outCounts[i], rank[i]]);
  });
  await downloadWorkbook(wb, "연관도.xlsx");
}

// ─── Tree Diagram ─────────────────────────────────────────────────────────────

interface TreeNode {
  text: string;
  children: TreeNode[];
}

export async function exportTree(root: TreeNode) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("계통도");
  ws.columns = [{ width: 6 }, { width: 30 }, { width: 30 }, { width: 30 }, { width: 30 }];
  headerRow(ws, ["레벨", "Level 1", "Level 2", "Level 3", "Level 4"]);

  function walk(node: TreeNode, depth: number, parentTexts: string[]) {
    const cols = ["", "", "", "", ""];
    cols[0] = String(depth);
    cols[depth] = node.text;
    ws.addRow(cols);
    for (const child of node.children) {
      walk(child, depth + 1, [...parentTexts, node.text]);
    }
  }
  walk(root, 1, []);
  await downloadWorkbook(wb, "계통도.xlsx");
}

// ─── Matrix Diagram ───────────────────────────────────────────────────────────

const SCORE_MAP: Record<string, number> = { "◎": 9, "○": 3, "△": 1, "×": 0, "": 0 };

export async function exportMatrix(
  rows: string[],
  cols: string[],
  cells: string[][]
) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("매트릭스도");
  ws.columns = [{ width: 24 }, ...cols.map(() => ({ width: 10 })), { width: 12 }];
  headerRow(ws, ["", ...cols, "합계"]);
  for (let i = 0; i < rows.length; i++) {
    const scores = cells[i].map((c) => SCORE_MAP[c] ?? 0);
    ws.addRow([rows[i], ...cells[i], scores.reduce((a, b) => a + b, 0)]);
  }
  const totals = cols.map((_, j) => rows.reduce((s, _, i) => s + (SCORE_MAP[cells[i]?.[j]] ?? 0), 0));
  const totalRow = ws.addRow(["열 합계", ...totals, ""]);
  totalRow.font = { bold: true };
  await downloadWorkbook(wb, "매트릭스도.xlsx");
}

// ─── Matrix Data Analysis ────────────────────────────────────────────────────

export async function exportMatrixData(
  labels: string[],
  data: number[][],
  corrMatrix: number[][]
) {
  const wb = new ExcelJS.Workbook();
  const ws1 = wb.addWorksheet("원본 데이터");
  ws1.columns = labels.map(() => ({ width: 14 }));
  headerRow(ws1, labels);
  const rowCount = data[0]?.length ?? 0;
  for (let i = 0; i < rowCount; i++) {
    ws1.addRow(data.map((col) => col[i]));
  }
  const ws2 = wb.addWorksheet("상관계수 행렬");
  ws2.columns = [{ width: 20 }, ...labels.map(() => ({ width: 10 }))];
  headerRow(ws2, ["", ...labels]);
  labels.forEach((label, i) => {
    ws2.addRow([label, ...corrMatrix[i].map((v) => +v.toFixed(4))]);
  });
  await downloadWorkbook(wb, "매트릭스데이터해석.xlsx");
}

// ─── PDPC ─────────────────────────────────────────────────────────────────────

export interface PDPCStep {
  step: string;
  risks: { risk: string; countermeasure: string }[];
}

export async function exportPDPC(steps: PDPCStep[]) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("PDPC");
  ws.columns = [{ width: 24 }, { width: 30 }, { width: 30 }];
  headerRow(ws, ["계획 단계", "위험 요소", "대책"]);
  for (const s of steps) {
    if (s.risks.length === 0) {
      ws.addRow([s.step, "", ""]);
    } else {
      s.risks.forEach((r, i) => ws.addRow([i === 0 ? s.step : "", r.risk, r.countermeasure]));
    }
  }
  await downloadWorkbook(wb, "PDPC.xlsx");
}

// ─── Arrow Diagram (CPM) ──────────────────────────────────────────────────────

import type { CPMResult } from "./statistics";

export async function exportArrowDiagram(results: CPMResult[]) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("애로우다이어그램");
  ws.columns = [
    { width: 24 }, { width: 10 }, { width: 20 },
    { width: 8 }, { width: 8 }, { width: 8 }, { width: 8 }, { width: 10 }, { width: 12 },
  ];
  headerRow(ws, ["작업명", "기간(일)", "선행작업", "ES", "EF", "LS", "LF", "여유(Float)", "임계경로"]);
  for (const r of results) {
    const row = ws.addRow([
      r.name, r.duration, r.predecessors.join(", "),
      r.es, r.ef, r.ls, r.lf, r.float, r.isCritical ? "★ 임계" : "",
    ]);
    if (r.isCritical) {
      row.font = { bold: true, color: { argb: "FFDC2626" } };
    }
  }
  await downloadWorkbook(wb, "애로우다이어그램.xlsx");
}
