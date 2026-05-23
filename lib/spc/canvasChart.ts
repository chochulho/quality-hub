/**
 * 일괄 Excel 내보내기용 캔버스 기반 공정능력 차트 생성기
 * Recharts 없이 HTML5 Canvas로 직접 렌더링하여 base64 PNG 반환
 */

import { computeHistogram, computeNormalCurve } from "./histogram";

export function drawCapabilityChartToBase64(
  data: number[],
  mean: number,
  stdDev: number,
  lsl?: number,
  usl?: number,
  target?: number
): string {
  const SCALE = 2; // retina
  const W = 480, H = 260;
  const PAD = { top: 28, right: 24, bottom: 36, left: 44 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const canvas = document.createElement("canvas");
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  const bins = computeHistogram(data);
  if (bins.length === 0) return "";

  const curve = computeNormalCurve(mean, stdDev, bins, data.length, 120);

  // x 범위: 데이터 + LSL/USL 포함
  const binW = bins[0].x1 - bins[0].x0;
  const specValues = [lsl, usl, target].filter((v): v is number => v != null);
  const xMin = Math.min(bins[0].x0 - binW * 0.8, ...specValues.map(v => v - binW * 0.5));
  const xMax = Math.max(bins[bins.length - 1].x1 + binW * 0.8, ...specValues.map(v => v + binW * 0.5));

  const maxCount = Math.max(...bins.map(b => b.count), 1);

  const xScale = (x: number) => PAD.left + ((x - xMin) / (xMax - xMin)) * plotW;
  const yScale = (y: number) => PAD.top + plotH - (y / maxCount) * plotH;

  // 배경 격자
  ctx.strokeStyle = "#F3F2EE";
  ctx.lineWidth = 0.6;
  for (let i = 0; i <= 4; i++) {
    const y = PAD.top + (plotH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(PAD.left, y);
    ctx.lineTo(PAD.left + plotW, y);
    ctx.stroke();
  }

  // 히스토그램 바
  for (const bin of bins) {
    const x = xScale(bin.x0);
    const w = Math.max(1, xScale(bin.x1) - xScale(bin.x0) - 1);
    const y = yScale(bin.count);
    const h = PAD.top + plotH - y;
    ctx.fillStyle = "rgba(43,75,140,0.15)";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "rgba(43,75,140,0.35)";
    ctx.lineWidth = 0.8;
    ctx.strokeRect(x, y, w, h);
  }

  // 정규곡선
  ctx.beginPath();
  ctx.strokeStyle = "#F26B3A";
  ctx.lineWidth = 2;
  let firstPt = true;
  for (const pt of curve) {
    const px = xScale(pt.x);
    const py = yScale(pt.within ?? 0);
    if (firstPt) { ctx.moveTo(px, py); firstPt = false; }
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // 기준선 공통 함수
  const drawRefLine = (xVal: number, color: string, label: string) => {
    const px = xScale(xVal);
    if (px < PAD.left - 10 || px > PAD.left + plotW + 10) return;
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.setLineDash([4, 3]);
    ctx.lineWidth = 1.5;
    ctx.moveTo(px, PAD.top);
    ctx.lineTo(px, PAD.top + plotH);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = color;
    ctx.font = "bold 9px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, px, PAD.top - 7);
    ctx.restore();
  };

  // 평균선
  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = "#9CA3AF";
  ctx.setLineDash([3, 3]);
  ctx.lineWidth = 1;
  const mPx = xScale(mean);
  ctx.moveTo(mPx, PAD.top + 4);
  ctx.lineTo(mPx, PAD.top + plotH);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  if (lsl != null) drawRefLine(lsl, "#DC2626", "LSL");
  if (usl != null) drawRefLine(usl, "#DC2626", "USL");
  if (target != null) drawRefLine(target, "#16A34A", "T");

  // x축
  ctx.beginPath();
  ctx.strokeStyle = "#D1CFC8";
  ctx.lineWidth = 1;
  ctx.moveTo(PAD.left, PAD.top + plotH);
  ctx.lineTo(PAD.left + plotW, PAD.top + plotH);
  ctx.stroke();

  // x축 눈금 레이블 (5개)
  ctx.fillStyle = "#6B7280";
  ctx.font = "8px Arial, sans-serif";
  ctx.textAlign = "center";
  const ticks = 5;
  for (let i = 0; i <= ticks; i++) {
    const xVal = xMin + (i / ticks) * (xMax - xMin);
    const px = xScale(xVal);
    ctx.fillText(xVal.toFixed(3), px, PAD.top + plotH + 14);
    ctx.beginPath();
    ctx.strokeStyle = "#D1CFC8";
    ctx.lineWidth = 0.8;
    ctx.moveTo(px, PAD.top + plotH);
    ctx.lineTo(px, PAD.top + plotH + 4);
    ctx.stroke();
  }

  // y축 레이블 (count)
  ctx.fillStyle = "#9CA3AF";
  ctx.font = "8px Arial, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("0", PAD.left - 4, PAD.top + plotH);
  ctx.fillText(String(maxCount), PAD.left - 4, PAD.top + 4);

  return canvas.toDataURL("image/png").split(",")[1];
}
