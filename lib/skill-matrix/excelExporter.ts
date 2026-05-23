import ExcelJS from "exceljs";

export type SkillLevel = 0 | 1 | 2 | 3 | 4;

export interface Process {
  id: string;
  name: string;
  target: number;
}

export interface Person {
  id: string;
  name: string;
  target: number;
}

export type Skills = Record<string, Record<string, SkillLevel>>;

const LEVEL_META: Record<
  SkillLevel,
  { label: string; symbol: string; fgColor: string; fontColor: string }
> = {
  0: { label: "없음", symbol: "○", fgColor: "FFE5E7EB", fontColor: "FF9CA3AF" },
  1: { label: "교육중", symbol: "△", fgColor: "FFFEF9C3", fontColor: "FFA16207" },
  2: { label: "보조", symbol: "◑", fgColor: "FFFDE047", fontColor: "FF713F12" },
  3: { label: "단독", symbol: "●", fgColor: "FFFB923C", fontColor: "FFFFFFFF" },
  4: { label: "지도가능", symbol: "★", fgColor: "FFF26B3A", fontColor: "FFFFFFFF" },
};

function qualifiedCount(
  skills: Skills,
  personId: string,
  processes: Process[]
): number {
  return processes.filter((p) => (skills[personId]?.[p.id] ?? 0) >= 3).length;
}

function processQualifiedCount(
  skills: Skills,
  processId: string,
  personnel: Person[]
): number {
  return personnel.filter((w) => (skills[w.id]?.[processId] ?? 0) >= 3).length;
}

export async function exportSkillMatrix(
  processes: Process[],
  personnel: Person[],
  skills: Skills,
  title: string = "다기능도"
) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Quality Hub";
  const ws = wb.addWorksheet("다기능도", {
    views: [{ state: "frozen", xSplit: 2, ySplit: 3 }],
  });

  const NAVY = "FF2B4B8C";
  const ORANGE = "FFF26B3A";
  const LIGHT_GRAY = "FFF5F4F0";
  const BORDER_COLOR = "FFE8E4DC";
  const GREEN_BG = "FFD1FAE5";
  const RED_BG = "FFFEE2E2";

  const thin: ExcelJS.Border = { style: "thin", color: { argb: BORDER_COLOR } };
  const allBorders: Partial<ExcelJS.Borders> = {
    top: thin, bottom: thin, left: thin, right: thin,
  };

  // Column widths
  ws.getColumn(1).width = 14; // 성명
  ws.getColumn(2).width = 10; // 인원별 목표
  processes.forEach((_, i) => {
    ws.getColumn(i + 3).width = 12;
  });
  ws.getColumn(processes.length + 3).width = 12; // 인원별 현황

  // Row 1: Title
  ws.mergeCells(1, 1, 1, processes.length + 3);
  const titleCell = ws.getCell(1, 1);
  titleCell.value = title;
  titleCell.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } };
  ws.getRow(1).height = 28;

  // Row 2: Header — 성명 | 인원별목표 | [공정들] | 인원별현황
  const headerRow = ws.getRow(2);
  headerRow.height = 36;

  function headerCell(col: number, value: string) {
    const cell = ws.getCell(2, col);
    cell.value = value;
    cell.font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } };
    cell.border = allBorders;
  }
  headerCell(1, "성명");
  headerCell(2, "인원별\n목표");
  processes.forEach((p, i) => headerCell(i + 3, p.name));
  headerCell(processes.length + 3, "인원별\n현황");

  // Row 3: 공정별 목표
  const targetRow = ws.getRow(3);
  targetRow.height = 24;

  function targetCell(col: number, value: string | number, isLabel = false) {
    const cell = ws.getCell(3, col);
    cell.value = value;
    cell.font = { bold: isLabel, size: 10, color: { argb: isLabel ? "FFFFFFFF" : NAVY } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: isLabel ? ORANGE : LIGHT_GRAY },
    };
    cell.border = allBorders;
  }
  targetCell(1, "공정별 목표", true);
  targetCell(2, "");
  processes.forEach((p, i) => targetCell(i + 3, p.target));
  targetCell(processes.length + 3, "");

  // Data rows — one per person
  personnel.forEach((person, rowIdx) => {
    const row = ws.getRow(rowIdx + 4);
    row.height = 22;

    // Name
    const nameCell = ws.getCell(rowIdx + 4, 1);
    nameCell.value = person.name;
    nameCell.font = { size: 10, bold: false };
    nameCell.alignment = { horizontal: "left", vertical: "middle" };
    nameCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHT_GRAY } };
    nameCell.border = allBorders;

    // Person target
    const ptCell = ws.getCell(rowIdx + 4, 2);
    ptCell.value = person.target;
    ptCell.font = { size: 10, color: { argb: NAVY } };
    ptCell.alignment = { horizontal: "center", vertical: "middle" };
    ptCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHT_GRAY } };
    ptCell.border = allBorders;

    // Skill cells
    processes.forEach((proc, colIdx) => {
      const level = (skills[person.id]?.[proc.id] ?? 0) as SkillLevel;
      const meta = LEVEL_META[level];
      const skillCell = ws.getCell(rowIdx + 4, colIdx + 3);
      skillCell.value = `${meta.symbol} ${meta.label}`;
      skillCell.font = { size: 10, color: { argb: meta.fontColor } };
      skillCell.alignment = { horizontal: "center", vertical: "middle" };
      skillCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: meta.fgColor },
      };
      skillCell.border = allBorders;
    });

    // Person summary
    const current = qualifiedCount(skills, person.id, processes);
    const met = current >= person.target;
    const summaryCell = ws.getCell(rowIdx + 4, processes.length + 3);
    summaryCell.value = `${current} / ${person.target}`;
    summaryCell.font = { size: 10, bold: true, color: { argb: met ? "FF16A34A" : "FFDC2626" } };
    summaryCell.alignment = { horizontal: "center", vertical: "middle" };
    summaryCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: met ? GREEN_BG : RED_BG },
    };
    summaryCell.border = allBorders;
  });

  // Summary row — 공정별 현황
  const summaryRowIdx = personnel.length + 4;
  const summaryRow = ws.getRow(summaryRowIdx);
  summaryRow.height = 22;

  function summaryCell(col: number, value: string | number, isLabel = false) {
    const cell = ws.getCell(summaryRowIdx, col);
    cell.value = value;
    cell.font = { bold: true, size: 10, color: { argb: isLabel ? "FFFFFFFF" : NAVY } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: isLabel ? ORANGE : LIGHT_GRAY },
    };
    cell.border = allBorders;
  }

  summaryCell(1, "공정별 현황", true);
  summaryCell(2, "");
  processes.forEach((proc, i) => {
    const count = processQualifiedCount(skills, proc.id, personnel);
    summaryCell(i + 3, count);
  });
  summaryCell(processes.length + 3, "");

  // Gap row
  const gapRowIdx = personnel.length + 5;
  const gapRow = ws.getRow(gapRowIdx);
  gapRow.height = 22;

  function gapCell(col: number, value: string | number, met?: boolean, isLabel = false) {
    const cell = ws.getCell(gapRowIdx, col);
    cell.value = value;
    cell.font = {
      bold: true,
      size: 10,
      color: {
        argb: isLabel ? "FFFFFFFF" : met == null ? NAVY : met ? "FF16A34A" : "FFDC2626",
      },
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: isLabel ? NAVY : met == null ? LIGHT_GRAY : met ? GREEN_BG : RED_BG,
      },
    };
    cell.border = allBorders;
  }

  gapCell(1, "목표 대비", undefined, true);
  gapCell(2, "");
  processes.forEach((proc, i) => {
    const count = processQualifiedCount(skills, proc.id, personnel);
    const met = count >= proc.target;
    gapCell(i + 3, met ? "✓ 충족" : `✗ ${count - proc.target}`, met);
  });
  gapCell(processes.length + 3, "");

  // Legend — below main table (2 rows gap)
  const legendRow = gapRowIdx + 2;
  ws.getCell(legendRow, 1).value = "◀ 스킬 레벨 범례";
  ws.getCell(legendRow, 1).font = { bold: true, size: 9, color: { argb: NAVY } };
  ([0, 1, 2, 3, 4] as SkillLevel[]).forEach((lv, i) => {
    const meta = LEVEL_META[lv];
    const cell = ws.getCell(legendRow + 1, i + 1);
    cell.value = `${meta.symbol} ${meta.label}`;
    cell.font = { size: 9, color: { argb: meta.fontColor } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: meta.fgColor } };
    cell.border = allBorders;
    ws.getRow(legendRow + 1).height = 20;
  });

  // Download
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer as ArrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `다기능도_${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
