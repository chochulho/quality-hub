import ExcelJS from "exceljs";

export interface QFDPhase {
  whats: { id: string; label: string; importance: number }[];
  hows: { id: string; label: string; target?: string }[];
  body: Record<string, Record<string, string>>;
  roof: Record<string, Record<string, string>>;
}

const STRENGTH: Record<string, number> = { "◎": 9, "○": 3, "△": 1, "": 0 };

const BODY_FILL: Record<string, string> = {
  "◎": "FF2B4B8C",
  "○": "FF8EA9D8",
  "△": "FFD0D8EC",
  "":  "FFFFFFFF",
};

const BODY_FONT_COLOR: Record<string, string> = {
  "◎": "FFFFFFFF",
  "○": "FFFFFFFF",
  "△": "FF2B4B8C",
  "":  "FF1A1F2E",
};

// ── Roof SVG (same diamond geometry as the web HOQMatrix) ────────────────────

const ROOF_SVG_COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
  "++": { fill: "#16A34A", stroke: "#15803D", text: "#FFFFFF" },
  "+":  { fill: "#BBF7D0", stroke: "#86EFAC", text: "#166534" },
  "-":  { fill: "#FECACA", stroke: "#FCA5A5", text: "#991B1B" },
  "--": { fill: "#EF4444", stroke: "#DC2626", text: "#FFFFFF" },
  "":   { fill: "#F9FAFB", stroke: "#E5E7EB", text: "#9CA3AF" },
};

function buildRoofSvg(phase: QFDPhase): { svg: string; width: number; height: number } {
  const n = phase.hows.length;
  if (n < 2) return { svg: "", width: 0, height: 0 };

  const CELL = 50;
  const half = CELL / 2;
  const width = n * CELL;
  const height = n * half;

  let content = "";
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const val = phase.roof[phase.hows[i].id]?.[phase.hows[j].id] ?? "";
      const cx = ((i + j + 1) / 2) * CELL;
      const cy = (n - j + i) * half;
      const pts = [
        `${cx},${cy - half}`,
        `${cx + half},${cy}`,
        `${cx},${cy + half}`,
        `${cx - half},${cy}`,
      ].join(" ");
      const col = ROOF_SVG_COLORS[val] ?? ROOF_SVG_COLORS[""];
      content += `<polygon points="${pts}" fill="${col.fill}" stroke="${col.stroke}" stroke-width="1.5"/>`;
      if (val) {
        const fs = CELL * 0.28;
        content += `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" font-size="${fs}" font-weight="bold" fill="${col.text}" font-family="Arial,sans-serif">${val}</text>`;
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${content}</svg>`;
  return { svg, width, height };
}

async function svgToPngBuffer(svg: string, width: number, height: number): Promise<ArrayBuffer> {
  const scale = 2;
  return new Promise((resolve, reject) => {
    const img = new Image();
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("canvas 2d unavailable"));
        return;
      }
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      canvas.toBlob((b) => {
        if (!b) { reject(new Error("toBlob failed")); return; }
        b.arrayBuffer().then(resolve).catch(reject);
      }, "image/png");
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("SVG load failed")); };
    img.src = url;
  });
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function downloadWorkbook(wb: ExcelJS.Workbook, filename: string) {
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer as ArrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function computeWeightedScores(phase: QFDPhase): number[] {
  return phase.hows.map((how) =>
    phase.whats.reduce((sum, what) => {
      const s = STRENGTH[phase.body[what.id]?.[how.id] ?? ""] ?? 0;
      return sum + what.importance * s;
    }, 0)
  );
}

function computeRanks(scores: number[]): number[] {
  const sorted = [...scores].sort((a, b) => b - a);
  return scores.map((s) => sorted.findIndex((v) => v === s) + 1);
}

function solidFill(argb: string): ExcelJS.Fill {
  return { type: "pattern", pattern: "solid", fgColor: { argb } };
}

function border(): Partial<ExcelJS.Borders> {
  const b: Partial<ExcelJS.Border> = { style: "thin", color: { argb: "FFD0D0D0" } };
  return { top: b, bottom: b, left: b, right: b };
}

function sanitizeSheetName(name: string): string {
  return name.replace(/[*?:\\/[\]]/g, " ").trim().slice(0, 31);
}

function colLetter(zeroIdx: number): string {
  let result = "";
  let n = zeroIdx + 1;
  while (n > 0) {
    n--;
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26);
  }
  return result;
}

// ── Sheet builder ─────────────────────────────────────────────────────────────

async function buildPhaseSheet(wb: ExcelJS.Workbook, phase: QFDPhase, sheetName: string) {
  const ws = wb.addWorksheet(sanitizeSheetName(sheetName));
  const nHows = phase.hows.length;

  ws.columns = [
    { width: 28 },
    { width: 8 },
    ...phase.hows.map(() => ({ width: 11 })),
  ];

  // ── Roof area: empty placeholder rows + embedded PNG image ──────────────────
  // Row height calculated so the total area approximates a 2:1 (w:h) ratio,
  // matching the SVG diamond geometry.
  const roofRowCount = nHows >= 2 ? nHows - 1 : 0;
  if (nHows >= 2) {
    // Each HOW column is 11 char-units ≈ 82px. Half that per row keeps diamonds square.
    const rowHeightPt = Math.round((nHows * 82) / (2 * roofRowCount) * (72 / 96));
    for (let i = 0; i < roofRowCount; i++) {
      const row = ws.addRow([]);
      row.height = rowHeightPt;
      if (i === 0) {
        const c = row.getCell(1);
        c.value = "지붕 상관";
        c.font = { bold: true, size: 8, color: { argb: "FF9CA3AF" } };
        c.alignment = { horizontal: "right", vertical: "middle" };
      }
    }

    try {
      const { svg, width, height } = buildRoofSvg(phase);
      const pngBuffer = await svgToPngBuffer(svg, width, height);
      const imageId = wb.addImage({ buffer: pngBuffer, extension: "png" });
      // String range: "C1:G4" — col C = first HOW col, last HOW col, rows 1..roofRowCount
      const startCol = colLetter(2);           // always C
      const endCol = colLetter(nHows + 1);     // last HOW column
      ws.addImage(imageId, `${startCol}1:${endCol}${roofRowCount}`);
    } catch {
      // Fallback: silently skip image — roof area remains blank placeholder rows
    }
  }

  // ── HOW header row ────────────────────────────────────────────────────────────
  const howHeaderRow = ws.addRow([
    "요구사항 / 특성",
    "중요도",
    ...phase.hows.map((h) => h.label),
  ]);
  howHeaderRow.height = 90;
  howHeaderRow.font = { bold: true, color: { argb: "FFFFFFFF" } };

  const c1 = howHeaderRow.getCell(1);
  c1.fill = solidFill("FF2B4B8C");
  c1.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  c1.border = border();

  const c2 = howHeaderRow.getCell(2);
  c2.fill = solidFill("FF2B4B8C");
  c2.alignment = { horizontal: "center", vertical: "middle" };
  c2.border = border();

  for (let j = 0; j < nHows; j++) {
    const c = howHeaderRow.getCell(j + 3);
    c.fill = solidFill("FF1E3666");
    c.alignment = { horizontal: "center", vertical: "bottom", textRotation: 90, wrapText: false };
    c.border = border();
  }

  // ── WHAT rows ─────────────────────────────────────────────────────────────────
  for (const what of phase.whats) {
    const row = ws.addRow([
      what.label,
      what.importance,
      ...phase.hows.map((how) => phase.body[what.id]?.[how.id] ?? ""),
    ]);
    row.height = 22;

    const label = row.getCell(1);
    label.fill = solidFill("FFF5F4F0");
    label.font = { size: 10 };
    label.alignment = { vertical: "middle", wrapText: true };
    label.border = border();

    const imp = row.getCell(2);
    imp.fill = solidFill("FFF5F4F0");
    imp.font = { bold: true, size: 11 };
    imp.alignment = { horizontal: "center", vertical: "middle" };
    imp.border = border();

    for (let j = 0; j < nHows; j++) {
      const val = phase.body[what.id]?.[phase.hows[j].id] ?? "";
      const c = row.getCell(j + 3);
      c.value = val || "";
      c.fill = solidFill(BODY_FILL[val] ?? "FFFFFFFF");
      c.font = { bold: true, size: 12, color: { argb: BODY_FONT_COLOR[val] ?? "FF1A1F2E" } };
      c.alignment = { horizontal: "center", vertical: "middle" };
      c.border = border();
    }
  }

  // ── Target row ────────────────────────────────────────────────────────────────
  if (phase.hows.some((h) => h.target)) {
    const row = ws.addRow(["목표값", "", ...phase.hows.map((h) => h.target ?? "")]);
    row.height = 20;

    const lc = row.getCell(1);
    lc.value = "목표값";
    lc.fill = solidFill("FFE8E4DC");
    lc.font = { bold: true, size: 9 };
    lc.alignment = { horizontal: "right", vertical: "middle" };
    lc.border = border();

    row.getCell(2).fill = solidFill("FFE8E4DC");
    row.getCell(2).border = border();

    for (let j = 0; j < nHows; j++) {
      const c = row.getCell(j + 3);
      c.fill = solidFill("FFE8E4DC");
      c.font = { size: 9 };
      c.alignment = { horizontal: "center", vertical: "middle" };
      c.border = border();
    }
  }

  // ── Weighted score & rank rows ────────────────────────────────────────────────
  const scores = computeWeightedScores(phase);
  const ranks = computeRanks(scores);

  const scoreRow = ws.addRow(["가중 점수", "", ...scores]);
  scoreRow.height = 22;
  const sr1 = scoreRow.getCell(1);
  sr1.fill = solidFill("FFFFF3E0");
  sr1.font = { bold: true, size: 10, color: { argb: "FFF26B3A" } };
  sr1.alignment = { horizontal: "right", vertical: "middle" };
  sr1.border = border();
  scoreRow.getCell(2).fill = solidFill("FFFFF3E0");
  scoreRow.getCell(2).border = border();
  for (let j = 0; j < nHows; j++) {
    const c = scoreRow.getCell(j + 3);
    c.fill = solidFill("FFFFF3E0");
    c.font = { bold: true, size: 11, color: { argb: "FFF26B3A" } };
    c.alignment = { horizontal: "center", vertical: "middle" };
    c.border = border();
  }

  const rankRow = ws.addRow(["순위", "", ...ranks]);
  rankRow.height = 18;
  const rr1 = rankRow.getCell(1);
  rr1.fill = solidFill("FFFFF3E0");
  rr1.font = { bold: true, size: 9 };
  rr1.alignment = { horizontal: "right", vertical: "middle" };
  rr1.border = border();
  rankRow.getCell(2).fill = solidFill("FFFFF3E0");
  rankRow.getCell(2).border = border();
  for (let j = 0; j < nHows; j++) {
    const c = rankRow.getCell(j + 3);
    c.fill = solidFill("FFFFF3E0");
    c.font = { size: 9 };
    c.alignment = { horizontal: "center", vertical: "middle" };
    c.border = border();
  }

  // ── Freeze panes ──────────────────────────────────────────────────────────────
  ws.views = [
    {
      state: "frozen",
      xSplit: 2,
      ySplit: roofRowCount + 1,
    } as ExcelJS.WorksheetViewFrozen,
  ];
}

// ── Public export function ───────────────────────────────────────────────────

export async function exportQFD(phases: QFDPhase[], phaseLabels: string[]) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Quality Hub";
  wb.created = new Date();

  for (let idx = 0; idx < phases.length; idx++) {
    const phase = phases[idx];
    if (phase.whats.length === 0 && phase.hows.length === 0) continue;
    await buildPhaseSheet(wb, phase, phaseLabels[idx] ?? `Phase ${idx + 1}`);
  }

  // ── Phase linkage summary sheet ───────────────────────────────────────────────
  const summary = wb.addWorksheet("Phase 연결 요약");
  summary.columns = [
    { width: 4 },
    { width: 28 },
    { width: 6 },
    { width: 28 },
  ];

  const titleRow = summary.addRow(["", "QFD Phase 연결 요약", "", ""]);
  titleRow.getCell(2).font = { bold: true, size: 13, color: { argb: "FF2B4B8C" } };
  summary.addRow([]);

  phases.forEach((phase, idx) => {
    if (idx >= phases.length - 1 || phase.hows.length === 0) return;
    const nextPhase = phases[idx + 1];

    const hRow = summary.addRow(["", `Phase ${idx + 1} HOWs → Phase ${idx + 2} WHATs`, "", ""]);
    const hCell = hRow.getCell(2);
    hCell.font = { bold: true, color: { argb: "FF2B4B8C" } };
    hCell.fill = solidFill("FFF5F4F0");

    phase.hows.forEach((how, i) => {
      const nextWhat = nextPhase.whats[i];
      summary.addRow(["", how.label, "→", nextWhat?.label ?? "(미입력)"]);
    });
    summary.addRow([]);
  });

  await downloadWorkbook(wb, "QFD_매트릭스.xlsx");
}
