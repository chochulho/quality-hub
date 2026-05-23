/**
 * SPC 통계 계산 유틸리티
 * 정규분포 CDF는 Abramowitz & Stegun 근사 (최대 오차 7.5e-8) 사용
 */

export interface SpecLimits {
  lsl?: number;
  target?: number;
  usl?: number;
}

export interface CapabilityResult {
  /** Process Data */
  mean: number;
  stdDev: number;
  n: number;
  lsl?: number;
  target?: number;
  usl?: number;

  /** Potential (Within) Capability — v1: stdDev_within = stdDev */
  cp?: number;
  cpl?: number;
  cpu?: number;
  cpk?: number;

  /** Overall Capability */
  pp?: number;
  ppl?: number;
  ppu?: number;
  ppk?: number;
  cpm?: number;

  /** Observed Performance (PPM) */
  obs_ppm_below?: number;
  obs_ppm_above?: number;
  obs_ppm_total?: number;

  /** Expected Within Performance (PPM) */
  exp_within_ppm_below?: number;
  exp_within_ppm_above?: number;
  exp_within_ppm_total?: number;

  /** Expected Overall Performance (PPM) */
  exp_overall_ppm_below?: number;
  exp_overall_ppm_above?: number;
  exp_overall_ppm_total?: number;

  /** Sigma level */
  sigmaLevel?: number;
}

/** 표본 평균 */
export function mean(data: number[]): number {
  if (data.length === 0) return 0;
  return data.reduce((s, v) => s + v, 0) / data.length;
}

/** 표본 표준편차 (ddof=1) */
export function stdDev(data: number[], xbar?: number): number {
  if (data.length < 2) return 0;
  const m = xbar ?? mean(data);
  const variance = data.reduce((s, v) => s + (v - m) ** 2, 0) / (data.length - 1);
  return Math.sqrt(variance);
}

/**
 * 표준정규분포 CDF Φ(z)
 * Abramowitz & Stegun 26.2.17 근사
 */
export function normalCDF(z: number): number {
  const sign = z < 0 ? -1 : 1;
  const absZ = Math.abs(z);
  const t = 1 / (1 + 0.2316419 * absZ);
  const poly =
    t * (0.319381530 +
      t * (-0.356563782 +
        t * (1.781477937 +
          t * (-1.821255978 +
            t * 1.330274429))));
  const pdf = Math.exp(-0.5 * absZ * absZ) / Math.sqrt(2 * Math.PI);
  const cdf = 1 - pdf * poly;
  return 0.5 + sign * (cdf - 0.5);
}

/** 정규분포 PDF f(x | μ, σ) */
export function normalPDF(x: number, mu: number, sigma: number): number {
  if (sigma <= 0) return 0;
  return Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI));
}

/** PPM 계산 (관측) */
function observedPPM(data: number[], lsl?: number, usl?: number) {
  if (data.length === 0) return { below: undefined, above: undefined, total: undefined };
  const n = data.length;
  const below = lsl != null ? (data.filter((v) => v < lsl).length / n) * 1e6 : undefined;
  const above = usl != null ? (data.filter((v) => v > usl).length / n) * 1e6 : undefined;
  const total =
    below != null && above != null ? below + above :
    below != null ? below :
    above;
  return { below, above, total };
}

/** PPM 계산 (정규분포 기반 추정) */
function expectedPPM(mu: number, sigma: number, lsl?: number, usl?: number) {
  if (sigma <= 0) return { below: undefined, above: undefined, total: undefined };
  const below = lsl != null ? normalCDF((lsl - mu) / sigma) * 1e6 : undefined;
  const above = usl != null ? (1 - normalCDF((usl - mu) / sigma)) * 1e6 : undefined;
  const total =
    below != null && above != null ? below + above :
    below != null ? below :
    above;
  return { below, above, total };
}

/** 공정능력 지수 전체 계산 */
export function computeCapability(
  data: number[],
  spec: SpecLimits,
  characteristicName = ""
): CapabilityResult {
  if (data.length < 2) {
    return { mean: mean(data), stdDev: 0, n: data.length, ...spec };
  }

  const mu = mean(data);
  const sigma = stdDev(data, mu);
  const { lsl, target, usl } = spec;

  // Potential (Within) capability — v1: sigma_within = sigma
  let cp: number | undefined;
  let cpl: number | undefined;
  let cpu: number | undefined;
  let cpk: number | undefined;

  if (lsl != null && usl != null && sigma > 0) {
    cp = (usl - lsl) / (6 * sigma);
  }
  if (lsl != null && sigma > 0) {
    cpl = (mu - lsl) / (3 * sigma);
  }
  if (usl != null && sigma > 0) {
    cpu = (usl - mu) / (3 * sigma);
  }
  if (cpl != null && cpu != null) {
    cpk = Math.min(cpl, cpu);
  } else if (cpl != null) {
    cpk = cpl;
  } else if (cpu != null) {
    cpk = cpu;
  }

  // Overall capability — v1: identical to within
  const pp = cp;
  const ppl = cpl;
  const ppu = cpu;
  const ppk = cpk;

  // Cpm (Taguchi index) — requires target
  let cpm: number | undefined;
  if (cp != null && target != null && sigma > 0) {
    const tau = Math.sqrt(sigma ** 2 + (mu - target) ** 2);
    if (lsl != null && usl != null) {
      cpm = (usl - lsl) / (6 * tau);
    }
  }

  // Sigma level
  const sigmaLevel = cpk != null ? cpk * 3 : undefined;

  // PPM
  const obs = observedPPM(data, lsl, usl);
  const expWithin = expectedPPM(mu, sigma, lsl, usl);
  const expOverall = expectedPPM(mu, sigma, lsl, usl); // same as within in v1

  return {
    mean: mu,
    stdDev: sigma,
    n: data.length,
    lsl,
    target,
    usl,
    cp,
    cpl,
    cpu,
    cpk,
    pp,
    ppl,
    ppu,
    ppk,
    cpm,
    sigmaLevel,
    obs_ppm_below: obs.below,
    obs_ppm_above: obs.above,
    obs_ppm_total: obs.total,
    exp_within_ppm_below: expWithin.below,
    exp_within_ppm_above: expWithin.above,
    exp_within_ppm_total: expWithin.total,
    exp_overall_ppm_below: expOverall.below,
    exp_overall_ppm_above: expOverall.above,
    exp_overall_ppm_total: expOverall.total,
  };
}

/** Cpk 기반 색상 등급 */
export function cpkGrade(cpk?: number): "excellent" | "good" | "warning" | "fail" | "none" {
  if (cpk == null) return "none";
  if (cpk >= 1.67) return "excellent";
  if (cpk >= 1.33) return "good";
  if (cpk >= 1.0) return "warning";
  return "fail";
}

export const GRADE_COLORS: Record<string, string> = {
  excellent: "text-green-600",
  good: "text-blue-600",
  warning: "text-yellow-600",
  fail: "text-red-600",
  none: "text-muted-foreground",
};

export const GRADE_BG: Record<string, string> = {
  excellent: "bg-green-100 text-green-800",
  good: "bg-blue-100 text-blue-800",
  warning: "bg-yellow-100 text-yellow-800",
  fail: "bg-red-100 text-red-800",
  none: "bg-muted text-muted-foreground",
};

// ---------------------------------------------------------------------------
// 계수형 (Attribute) 공정능력
// ---------------------------------------------------------------------------

/**
 * 역표준정규분포 CDF Φ⁻¹(p)
 * Acklam rational approximation (max error ~3.05e-9)
 */
export function normalInv(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;

  const a = [
    -3.969683028665376e+01, 2.209460984245205e+02,
    -2.759285104469687e+02, 1.383577518672690e+02,
    -3.066479806614716e+01, 2.506628277459239e+00,
  ];
  const b = [
    -5.447609879822406e+01, 1.615858368580409e+02,
    -1.556989798598866e+02, 6.680131188771972e+01,
    -1.328068155288572e+01,
  ];
  const c = [
    -7.784894002430293e-03, -3.223964580411365e-01,
    -2.400758277161838e+00, -2.549732539343734e+00,
     4.374664141464968e+00,  2.938163982698783e+00,
  ];
  const d = [
    7.784695709041462e-03, 3.224671290700398e-01,
    2.445134137142996e+00, 3.754408661907416e+00,
  ];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
           ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  } else if (p <= pHigh) {
    const q = p - 0.5;
    const r = q * q;
    return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q /
           (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
  } else {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
              ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  }
}

export interface AttributeCapabilityResult {
  n: number;
  defects: number;
  defectRate: number;       // p̄ (소수)
  defectRatePct: number;    // p̄ × 100 (%)
  dpmo: number;
  sigmaLevel: number;
  cpkEquivalent: number;    // Sigma Level / 3
}

/** 계수형 공정능력 계산 (이항분포 기반) */
export function computeAttributeCapability(
  n: number,
  defects: number
): AttributeCapabilityResult {
  const defectRate = defects / n;
  const conformRate = 1 - defectRate;
  const dpmo = defectRate * 1e6;
  const sigmaLevel = conformRate <= 0 ? 0 : conformRate >= 1 ? 8 : normalInv(conformRate);
  const cpkEquivalent = sigmaLevel / 3;

  return {
    n,
    defects,
    defectRate,
    defectRatePct: defectRate * 100,
    dpmo,
    sigmaLevel: Math.max(0, sigmaLevel),
    cpkEquivalent: Math.max(0, cpkEquivalent),
  };
}

/** 텍스트에서 숫자 배열 파싱 (Excel 붙여넣기용) */
export function parseDataText(text: string): number[] {
  return text
    .split(/[\n\r\t,;\s]+/)
    .map((s) => s.trim().replace(/,/g, "."))
    .filter((s) => s !== "")
    .map((s) => parseFloat(s))
    .filter((v) => !isNaN(v));
}
