import { VARIABLE_CONSTANTS, IMR_D4, IMR_D3, IMR_D2 } from "./constants";

// ─── Shared helpers ────────────────────────────────────────────────────────────

function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function range(arr: number[]): number {
  return Math.max(...arr) - Math.min(...arr);
}

function stddev(arr: number[]): number {
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1));
}

function fmt(n: number): number {
  return Math.round(n * 10000) / 10000;
}

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ChartPoint {
  label: string;
  value: number;
  ucl: number;
  cl: number;
  lcl: number;
  ooc: boolean; // out of control
}

export interface VariableResult {
  type: "xbar-r" | "xbar-s" | "imr";
  upperChart: ChartPoint[]; // X-bar or I
  lowerChart: ChartPoint[]; // R, S, or MR
  upperLabel: string;
  lowerLabel: string;
  n: number;
  xbarbar: number;
  rbar?: number;
  sbar?: number;
  mRbar?: number;
}

export interface AttributeResult {
  type: "p" | "np" | "c" | "u";
  chart: ChartPoint[];
  centerLine: number;
}

// ─── Variable charts ───────────────────────────────────────────────────────────

export function calcXbarR(subgroups: number[][]): VariableResult {
  const n = subgroups[0].length;
  const c = VARIABLE_CONSTANTS[n];
  if (!c) throw new Error(`X̄-R 관리도는 소그룹 크기 2~10만 지원합니다. (입력: ${n})`);

  const xbars = subgroups.map((g) => mean(g));
  const ranges = subgroups.map((g) => range(g));
  const xbarbar = fmt(mean(xbars));
  const rbar = fmt(mean(ranges));

  const ucl_x = fmt(xbarbar + c.A2 * rbar);
  const lcl_x = fmt(xbarbar - c.A2 * rbar);
  const ucl_r = fmt(c.D4 * rbar);
  const lcl_r = fmt(Math.max(0, c.D3 * rbar));

  return {
    type: "xbar-r",
    upperChart: xbars.map((v, i) => ({
      label: `${i + 1}`,
      value: fmt(v),
      ucl: ucl_x,
      cl: xbarbar,
      lcl: lcl_x,
      ooc: v > ucl_x || v < lcl_x,
    })),
    lowerChart: ranges.map((v, i) => ({
      label: `${i + 1}`,
      value: fmt(v),
      ucl: ucl_r,
      cl: rbar,
      lcl: lcl_r,
      ooc: v > ucl_r || v < lcl_r,
    })),
    upperLabel: "X̄ 관리도",
    lowerLabel: "R 관리도",
    n,
    xbarbar,
    rbar,
  };
}

export function calcXbarS(subgroups: number[][]): VariableResult {
  const n = subgroups[0].length;
  const c = VARIABLE_CONSTANTS[n];
  if (!c) throw new Error(`X̄-S 관리도는 소그룹 크기 2~10만 지원합니다. (입력: ${n})`);

  const xbars = subgroups.map((g) => mean(g));
  const stdevs = subgroups.map((g) => (g.length > 1 ? stddev(g) : 0));
  const xbarbar = fmt(mean(xbars));
  const sbar = fmt(mean(stdevs));

  const ucl_x = fmt(xbarbar + c.A3 * sbar);
  const lcl_x = fmt(xbarbar - c.A3 * sbar);
  const ucl_s = fmt(c.B4 * sbar);
  const lcl_s = fmt(Math.max(0, c.B3 * sbar));

  return {
    type: "xbar-s",
    upperChart: xbars.map((v, i) => ({
      label: `${i + 1}`,
      value: fmt(v),
      ucl: ucl_x,
      cl: xbarbar,
      lcl: lcl_x,
      ooc: v > ucl_x || v < lcl_x,
    })),
    lowerChart: stdevs.map((v, i) => ({
      label: `${i + 1}`,
      value: fmt(v),
      ucl: ucl_s,
      cl: sbar,
      lcl: lcl_s,
      ooc: v > ucl_s || v < lcl_s,
    })),
    upperLabel: "X̄ 관리도",
    lowerLabel: "S 관리도",
    n,
    xbarbar,
    sbar,
  };
}

export function calcIMR(individuals: number[]): VariableResult {
  const xbar = fmt(mean(individuals));
  const movingRanges = individuals
    .slice(1)
    .map((v, i) => Math.abs(v - individuals[i]));
  const mrBar = fmt(mean(movingRanges));

  const sigma = mrBar / IMR_D2;
  const ucl_i = fmt(xbar + 3 * sigma);
  const lcl_i = fmt(xbar - 3 * sigma);
  const ucl_mr = fmt(IMR_D4 * mrBar);
  const lcl_mr = Math.max(0, IMR_D3 * mrBar);

  return {
    type: "imr",
    upperChart: individuals.map((v, i) => ({
      label: `${i + 1}`,
      value: fmt(v),
      ucl: ucl_i,
      cl: xbar,
      lcl: lcl_i,
      ooc: v > ucl_i || v < lcl_i,
    })),
    lowerChart: [
      { label: "1", value: 0, ucl: ucl_mr, cl: mrBar, lcl: lcl_mr, ooc: false },
      ...movingRanges.map((v, i) => ({
        label: `${i + 2}`,
        value: fmt(v),
        ucl: ucl_mr,
        cl: mrBar,
        lcl: lcl_mr,
        ooc: v > ucl_mr || v < lcl_mr,
      })),
    ],
    upperLabel: "I 관리도 (개별값)",
    lowerLabel: "MR 관리도 (이동범위)",
    n: 1,
    xbarbar: xbar,
    mRbar: mrBar,
  };
}

// ─── Attribute charts ──────────────────────────────────────────────────────────

export function calcP(defectives: number[], sampleSizes: number[]): AttributeResult {
  const pbar = fmt(
    defectives.reduce((a, b) => a + b, 0) /
      sampleSizes.reduce((a, b) => a + b, 0)
  );

  const chart: ChartPoint[] = defectives.map((d, i) => {
    const n = sampleSizes[i];
    const p = fmt(d / n);
    const sigma = Math.sqrt((pbar * (1 - pbar)) / n);
    const ucl = fmt(pbar + 3 * sigma);
    const lcl = fmt(Math.max(0, pbar - 3 * sigma));
    return { label: `${i + 1}`, value: p, ucl, cl: pbar, lcl, ooc: p > ucl || p < lcl };
  });

  return { type: "p", chart, centerLine: pbar };
}

export function calcNP(defectives: number[], n: number): AttributeResult {
  const npbar = fmt(mean(defectives));
  const pbar = npbar / n;
  const sigma = Math.sqrt(npbar * (1 - pbar));
  const ucl = fmt(npbar + 3 * sigma);
  const lcl = fmt(Math.max(0, npbar - 3 * sigma));

  const chart: ChartPoint[] = defectives.map((v, i) => ({
    label: `${i + 1}`,
    value: v,
    ucl,
    cl: npbar,
    lcl,
    ooc: v > ucl || v < lcl,
  }));

  return { type: "np", chart, centerLine: npbar };
}

export function calcC(defects: number[]): AttributeResult {
  const cbar = fmt(mean(defects));
  const sigma = Math.sqrt(cbar);
  const ucl = fmt(cbar + 3 * sigma);
  const lcl = fmt(Math.max(0, cbar - 3 * sigma));

  const chart: ChartPoint[] = defects.map((v, i) => ({
    label: `${i + 1}`,
    value: v,
    ucl,
    cl: cbar,
    lcl,
    ooc: v > ucl || v < lcl,
  }));

  return { type: "c", chart, centerLine: cbar };
}

export function calcU(defects: number[], units: number[]): AttributeResult {
  const ubar = fmt(
    defects.reduce((a, b) => a + b, 0) / units.reduce((a, b) => a + b, 0)
  );

  const chart: ChartPoint[] = defects.map((d, i) => {
    const n = units[i];
    const u = fmt(d / n);
    const sigma = Math.sqrt(ubar / n);
    const ucl = fmt(ubar + 3 * sigma);
    const lcl = fmt(Math.max(0, ubar - 3 * sigma));
    return { label: `${i + 1}`, value: u, ucl, cl: ubar, lcl, ooc: u > ucl || u < lcl };
  });

  return { type: "u", chart, centerLine: ubar };
}

// ─── Data parser ───────────────────────────────────────────────────────────────

export function parseTabData(text: string): number[][] {
  return text
    .trim()
    .split("\n")
    .map((row) =>
      row
        .split(/\t|,/)
        .map((cell) => parseFloat(cell.trim()))
        .filter((v) => !isNaN(v))
    )
    .filter((row) => row.length > 0);
}
