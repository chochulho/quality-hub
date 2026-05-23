import { normalPDF } from "./statistics";

export interface HistogramBin {
  x0: number;
  x1: number;
  xMid: number;
  count: number;
  frequency: number; // count / n
  density: number;   // frequency / binWidth
}

export interface ChartPoint {
  x: number;
  density?: number;
  within?: number;  // scaled to histogram (density * n * binWidth)
  overall?: number;
}

/**
 * Sturges 공식으로 히스토그램 빈 생성
 * k = ceil(log2(n)) + 1
 */
export function computeHistogram(data: number[]): HistogramBin[] {
  if (data.length < 2) return [];

  const n = data.length;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;

  if (range === 0) {
    return [{ x0: min - 0.5, x1: min + 0.5, xMid: min, count: n, frequency: 1, density: n }];
  }

  const k = Math.max(5, Math.ceil(Math.log2(n)) + 1);
  const binWidth = range / k;

  const bins: HistogramBin[] = Array.from({ length: k }, (_, i) => ({
    x0: min + i * binWidth,
    x1: min + (i + 1) * binWidth,
    xMid: min + (i + 0.5) * binWidth,
    count: 0,
    frequency: 0,
    density: 0,
  }));

  for (const v of data) {
    let idx = Math.floor((v - min) / binWidth);
    if (idx >= k) idx = k - 1;
    if (idx < 0) idx = 0;
    bins[idx].count++;
  }

  for (const bin of bins) {
    bin.frequency = bin.count / n;
    bin.density = bin.frequency / binWidth;
  }

  return bins;
}

/**
 * 차트 오버레이용 정규곡선 포인트 생성
 * y값은 히스토그램 카운트 스케일로 조정됨
 */
export function computeNormalCurve(
  mu: number,
  sigma: number,
  bins: HistogramBin[],
  n: number,
  numPoints = 200
): ChartPoint[] {
  if (sigma <= 0 || bins.length === 0) return [];

  const binWidth = bins[0].x1 - bins[0].x0;
  const xMin = bins[0].x0 - binWidth;
  const xMax = bins[bins.length - 1].x1 + binWidth;
  const step = (xMax - xMin) / numPoints;

  return Array.from({ length: numPoints + 1 }, (_, i) => {
    const x = xMin + i * step;
    const density = normalPDF(x, mu, sigma);
    // 히스토그램 카운트 스케일에 맞춤
    const scaled = density * n * binWidth;
    return { x, within: scaled, overall: scaled };
  });
}

/**
 * 히스토그램 빈을 Recharts 형식으로 변환
 */
export function binsToChartData(bins: HistogramBin[]): Array<{ x: number; count: number; xLabel: string }> {
  return bins.map((bin) => ({
    x: bin.xMid,
    count: bin.count,
    xLabel: bin.xMid.toFixed(4),
  }));
}
