import ExcelJS from "exceljs";
import type { CapabilityResult } from "./statistics";
import { cpkGrade } from "./statistics";

function fmt(v: number | undefined, digits = 4): string {
  if (v == null) return "-";
  return v.toFixed(digits);
}

function fmtPPM(v: number | undefined): string {
  if (v == null) return "-";
  return v.toFixed(2);
}

const GRADE_ARGB: Record<string, string> = {
  excellent: "FFD1FAE5",
  good:      "FFDBEAFE",
  marginal:  "FFFEF9C3",
  poor:      "FFFEE2E2",
};

function gradeFill(value: number | undefined): ExcelJS.Fill | undefined {
  const grade = cpkGrade(value);
  const argb = GRADE_ARGB[grade];
  if (!argb) return undefined;
  return { type: "pattern", pattern: "solid", fgColor: { argb } };
}

async function downloadWorkbook(wb: ExcelJS.Workbook, filename: string) {
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer as ArrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** 단일 특성 분석 결과를 Excel로 내보내기 */
export async function exportSingleResult(
  result: CapabilityResult,
  data: number[],
  characteristicName = "특성",
  chartBase64?: string
): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.created = new Date();

  const ws = wb.addWorksheet("분석결과");
  ws.columns = [
    { width: 22 }, // A
    { width: 14 }, // B
    { width: 22 }, // C
    { width: 14 }, // D
    { width: 2  }, // E (spacer)
    { width: 10 }, // F
    { width: 10 }, // G
    { width: 10 }, // H
    { width: 10 }, // I
    { width: 10 }, // J
    { width: 10 }, // K
    { width: 10 }, // L
  ];

  // Row 1: 제목
  ws.addRow([`공정능력 분석 결과 — ${characteristicName}`]);
  ws.mergeCells("A1:D1");
  ws.getCell("A1").font = { bold: true, size: 14, color: { argb: "FF2B4B8C" } };

  // Row 2: 분석일시
  ws.addRow([`분석일시: ${new Date().toLocaleString("ko-KR")}`]);
  ws.mergeCells("A2:D2");
  ws.getCell("A2").font = { size: 9, color: { argb: "FF6B7280" } };

  ws.addRow([]); // Row 3 spacer

  // Row 4: Process Data 헤더
  ws.addRow(["Process Data"]);
  ws.mergeCells("A4:D4");
  ws.getCell("A4").font = { bold: true, size: 9, color: { argb: "FF6B7280" } };
  ws.getCell("A4").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F4F0" } };

  // Rows 5-7: 공정 데이터
  ws.addRow(["LSL",      result.lsl    ?? "-", "USL", result.usl ?? "-"]);
  ws.addRow(["Target",   result.target ?? "-", "평균 (X̄)", fmt(result.mean, 5)]);
  ws.addRow(["Sample N", result.n,             "StDev (σ)", fmt(result.stdDev, 6)]);
  if (result.sigmaLevel != null) {
    ws.addRow(["Sigma Level", fmt(result.sigmaLevel, 2)]);
  }

  ws.addRow([]); // spacer

  // 능력 지수 헤더
  ws.addRow(["잠재 능력 (Within)", "", "전체 능력 (Overall)", ""]);
  const capHdrRowNum = ws.rowCount;
  ["A", "C"].forEach((col) => {
    ws.getCell(`${col}${capHdrRowNum}`).font = { bold: true, size: 9, color: { argb: "FF6B7280" } };
    ws.getCell(`${col}${capHdrRowNum}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F4F0" } };
  });

  ws.addRow(["Cp",  fmt(result.cp),  "Pp",  fmt(result.pp)]);
  ws.addRow(["CPL", fmt(result.cpl), "PPL", fmt(result.ppl)]);
  ws.addRow(["CPU", fmt(result.cpu), "PPU", fmt(result.ppu)]);

  // Cpk / Ppk — 등급 배경색
  const cpkRow = ws.addRow(["Cpk", fmt(result.cpk), "Ppk", fmt(result.ppk)]);
  cpkRow.getCell(1).font = { bold: true };
  cpkRow.getCell(3).font = { bold: true };
  const cpkFill = gradeFill(result.cpk);
  const ppkFill = gradeFill(result.ppk);
  if (cpkFill) cpkRow.getCell(2).fill = cpkFill;
  if (ppkFill) cpkRow.getCell(4).fill = ppkFill;

  if (result.cpm != null) {
    ws.addRow(["", "", "Cpm", fmt(result.cpm)]);
  }

  ws.addRow([]); // spacer

  // PPM 섹션
  const ppmHdrRow = ws.addRow(["PPM 성과", "관측", "예상 (Within)", "예상 (Overall)"]);
  ppmHdrRow.eachCell((cell) => { cell.font = { bold: true }; });
  ppmHdrRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF5F4F0" } };

  ws.addRow(["PPM < LSL",
    fmtPPM(result.obs_ppm_below),
    fmtPPM(result.exp_within_ppm_below),
    fmtPPM(result.exp_overall_ppm_below),
  ]);
  ws.addRow(["PPM > USL",
    fmtPPM(result.obs_ppm_above),
    fmtPPM(result.exp_within_ppm_above),
    fmtPPM(result.exp_overall_ppm_above),
  ]);
  const totalRow = ws.addRow(["PPM Total",
    fmtPPM(result.obs_ppm_total),
    fmtPPM(result.exp_within_ppm_total),
    fmtPPM(result.exp_overall_ppm_total),
  ]);
  totalRow.font = { bold: true };

  // 레이블 열(A) 색상
  ws.eachRow((row) => {
    const cell = row.getCell(1);
    if (typeof cell.value === "string" &&
        cell.value !== "" &&
        !["공정능력", "분석일시", "Process Data", "잠재 능력 (Within)", "PPM 성과"].some(
          (p) => String(cell.value).startsWith(p)
        )) {
      cell.font = { ...(cell.font as ExcelJS.Font || {}), color: { argb: "FF374151" } };
    }
  });

  // 차트 이미지 삽입
  if (chartBase64) {
    const imageId = wb.addImage({ base64: chartBase64, extension: "png" });
    ws.addImage(imageId, {
      tl: { col: 5, row: 0 },
      ext: { width: 520, height: 340 },
    });
  }

  // 시트2: 원시 데이터
  const wsRaw = wb.addWorksheet("원시데이터");
  wsRaw.columns = [{ width: 8 }, { width: 14 }];
  const rawHdr = wsRaw.addRow(["순번", "측정값"]);
  rawHdr.font = { bold: true };
  data.forEach((v, i) => wsRaw.addRow([i + 1, v]));

  const date = new Date().toISOString().slice(0, 10);
  await downloadWorkbook(wb, `공정능력_${characteristicName}_${date}.xlsx`);
}

/** 일괄 분석 요약 결과를 Excel로 내보내기 */
export async function exportBatchResults(
  results: Array<{ name: string; result: CapabilityResult; data: number[]; chartBase64?: string }>
): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.created = new Date();

  // 요약 시트
  const wsSummary = wb.addWorksheet("요약");
  const headers = [
    "특성명", "N", "평균", "StDev", "LSL", "Target", "USL",
    "Cp", "CPL", "CPU", "Cpk", "Pp", "PPL", "PPU", "Ppk", "Cpm",
    "PPM Total (관측)", "PPM Total (예상)",
  ];
  const hdrRow = wsSummary.addRow(headers);
  hdrRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  hdrRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2B4B8C" } };

  for (const { name, result } of results) {
    const row = wsSummary.addRow([
      name, result.n, fmt(result.mean), fmt(result.stdDev),
      result.lsl ?? "-", result.target ?? "-", result.usl ?? "-",
      fmt(result.cp, 4), fmt(result.cpl, 4), fmt(result.cpu, 4), fmt(result.cpk, 4),
      fmt(result.pp, 4), fmt(result.ppl, 4), fmt(result.ppu, 4), fmt(result.ppk, 4),
      fmt(result.cpm, 4),
      fmtPPM(result.obs_ppm_total), fmtPPM(result.exp_overall_ppm_total),
    ]);
    // Cpk 셀 (11번째 = K열) 등급 색상
    const fill = gradeFill(result.cpk);
    if (fill) row.getCell(11).fill = fill;
  }

  wsSummary.columns = headers.map((_, i) => ({ width: i === 0 ? 20 : 14 }));

  // 특성별 상세 시트 (차트 포함)
  for (const { name, result, data, chartBase64 } of results) {
    const ws = wb.addWorksheet(name.slice(0, 31));
    ws.columns = [
      { width: 22 }, { width: 14 }, { width: 22 }, { width: 14 },
      { width: 2  }, { width: 10 }, { width: 10 }, { width: 10 },
      { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 },
    ];

    ws.addRow([`공정능력: ${name}`]).font = { bold: true, size: 12, color: { argb: "FF2B4B8C" } };
    ws.addRow([]);
    ws.addRow(["LSL",    result.lsl    ?? "-", "USL", result.usl ?? "-"]);
    ws.addRow(["Target", result.target ?? "-", "평균", fmt(result.mean)]);
    ws.addRow(["N",      result.n,             "StDev", fmt(result.stdDev)]);
    ws.addRow([]);
    ws.addRow(["Cp",  fmt(result.cp),  "Pp",  fmt(result.pp)]);
    const cpkRow = ws.addRow(["Cpk", fmt(result.cpk), "Ppk", fmt(result.ppk)]);
    cpkRow.font = { bold: true };
    const fill = gradeFill(result.cpk);
    if (fill) cpkRow.getCell(2).fill = fill;
    ws.addRow([]);
    ws.addRow(["PPM Total (관측)",   fmtPPM(result.obs_ppm_total)]);
    ws.addRow(["PPM Total (예상)",   fmtPPM(result.exp_overall_ppm_total)]);
    ws.addRow([]);
    ws.addRow(["측정값"]).font = { bold: true };
    data.forEach((v) => ws.addRow([v]));

    // 차트 이미지 삽입
    if (chartBase64) {
      const imageId = wb.addImage({ base64: chartBase64, extension: "png" });
      ws.addImage(imageId, {
        tl: { col: 5, row: 0 },
        ext: { width: 480, height: 260 },
      });
    }
  }

  const date = new Date().toISOString().slice(0, 10);
  await downloadWorkbook(wb, `공정능력_일괄분석_${date}.xlsx`);
}
