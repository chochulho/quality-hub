"use client";

/**
 * Normal Distribution Bell Curve SVG
 * Shows μ ± 1σ / 2σ / 3σ shaded regions with percentage labels
 */
export function NormalCurve() {
  const W = 560;
  const H = 260;
  const padL = 20;
  const padR = 20;
  const padT = 20;
  const padB = 48;
  const gW = W - padL - padR;
  const gH = H - padT - padB;

  // Normal PDF: f(x) = exp(-x²/2) / √(2π), domain [-3.8, 3.8]
  const MIN_Z = -3.8;
  const MAX_Z = 3.8;
  const RANGE = MAX_Z - MIN_Z;

  const normalPDF = (z: number) => Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
  const MAX_Y = normalPDF(0); // peak height

  const zToX = (z: number) => padL + ((z - MIN_Z) / RANGE) * gW;
  const pdfToY = (p: number) => padT + gH - (p / MAX_Y) * gH * 0.92;
  const baseY = padT + gH;

  // Generate smooth curve points
  const steps = 200;
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const z = MIN_Z + (i / steps) * RANGE;
    points.push({ x: zToX(z), y: pdfToY(normalPDF(z)) });
  }

  const curvePath =
    points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ") +
    ` L${zToX(MAX_Z).toFixed(2)},${baseY} L${zToX(MIN_Z).toFixed(2)},${baseY} Z`;

  // Shaded area paths for ±1σ, ±2σ, ±3σ
  const shadedPath = (zLow: number, zHigh: number) => {
    const pts: string[] = [];
    const steps2 = 100;
    for (let i = 0; i <= steps2; i++) {
      const z = zLow + (i / steps2) * (zHigh - zLow);
      const cmd = i === 0 ? "M" : "L";
      pts.push(`${cmd}${zToX(z).toFixed(2)},${pdfToY(normalPDF(z)).toFixed(2)}`);
    }
    pts.push(`L${zToX(zHigh).toFixed(2)},${baseY} L${zToX(zLow).toFixed(2)},${baseY} Z`);
    return pts.join(" ");
  };

  // σ tick positions
  const sigmas = [-3, -2, -1, 0, 1, 2, 3];
  const sigmaLabels: Record<number, string> = {
    "-3": "μ-3σ", "-2": "μ-2σ", "-1": "μ-σ",
    "0": "μ",
    "1": "μ+σ", "2": "μ+2σ", "3": "μ+3σ",
  };

  return (
    <div className="my-6 rounded-2xl border border-border overflow-hidden bg-white">
      <div className="bg-muted/40 px-5 py-3 border-b border-border">
        <p className="text-sm font-semibold text-brand-navy">
          정규 분포 곡선 — μ ± 1σ / 2σ / 3σ 포함 구간
        </p>
      </div>
      <div className="p-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          style={{ maxWidth: W, display: "block", margin: "0 auto" }}
          aria-label="정규분포 종 모양 곡선"
        >
          <defs>
            {/* Gradient fills for each band */}
            <linearGradient id="grad3s" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#DBEAFE" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#DBEAFE" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="grad2s" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="grad1s" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Shaded bands: outermost first so inner draws on top */}
          <path d={shadedPath(-3, 3)} fill="url(#grad3s)" />
          <path d={shadedPath(-2, 2)} fill="url(#grad2s)" />
          <path d={shadedPath(-1, 1)} fill="url(#grad1s)" />

          {/* Curve outline */}
          <path d={curvePath} fill="none" stroke="#2B4B8C" strokeWidth={2.5} />

          {/* Baseline */}
          <line x1={padL} y1={baseY} x2={padL + gW} y2={baseY} stroke="#9CA3AF" strokeWidth={1} />

          {/* σ tick lines */}
          {sigmas.map((s) => {
            const x = zToX(s);
            const peakY = pdfToY(normalPDF(s));
            return (
              <line key={s} x1={x} y1={peakY} x2={x} y2={baseY}
                stroke={s === 0 ? "#2B4B8C" : "#9CA3AF"}
                strokeWidth={s === 0 ? 1.5 : 1}
                strokeDasharray={s === 0 ? "none" : "4,3"}
              />
            );
          })}

          {/* σ labels on X axis */}
          {sigmas.map((s) => (
            <text key={s} x={zToX(s)} y={baseY + 14} textAnchor="middle"
              fontSize={s === 0 ? 12 : 10}
              fontWeight={s === 0 ? "700" : "400"}
              fill={s === 0 ? "#1A1F2E" : "#6B7280"}
            >
              {sigmaLabels[s]}
            </text>
          ))}

          {/* Percentage span labels */}
          {/* ±1σ → 68.27% */}
          <line x1={zToX(-1)} y1={baseY + 30} x2={zToX(1)} y2={baseY + 30} stroke="#3B82F6" strokeWidth={1.5} />
          <line x1={zToX(-1)} y1={baseY + 27} x2={zToX(-1)} y2={baseY + 33} stroke="#3B82F6" strokeWidth={1.5} />
          <line x1={zToX(1)} y1={baseY + 27} x2={zToX(1)} y2={baseY + 33} stroke="#3B82F6" strokeWidth={1.5} />
          <text x={(zToX(-1) + zToX(1)) / 2} y={baseY + 44} textAnchor="middle" fontSize={11} fill="#2563EB" fontWeight="600">
            68.27%
          </text>

          {/* ±2σ → 95.45% */}
          <line x1={zToX(-2)} y1={baseY + 30} x2={zToX(-1) - 2} y2={baseY + 30} stroke="#60A5FA" strokeWidth={1} strokeDasharray="3,2" />
          <line x1={zToX(1) + 2} y1={baseY + 30} x2={zToX(2)} y2={baseY + 30} stroke="#60A5FA" strokeWidth={1} strokeDasharray="3,2" />

          {/* ±2σ bracket above */}
          {[[-2, -1], [1, 2]].map(([a, b], i) => (
            <line key={i} x1={zToX(a)} y1={baseY + 30} x2={zToX(b)} y2={baseY + 30}
              stroke="#60A5FA" strokeWidth={1} strokeDasharray="3,2" />
          ))}
          <line x1={zToX(-2)} y1={baseY + 30} x2={zToX(2)} y2={baseY + 30} stroke="none" />

          {/* simpler: just brace lines for ±2σ */}
          <text x={zToX(-1.8)} y={baseY + 25} textAnchor="start" fontSize={10} fill="#3B82F6">
            {"← 95.45% →"}
          </text>
          {/* ±3σ */}
          <text x={zToX(-2.9)} y={baseY + 37} textAnchor="start" fontSize={10} fill="#93C5FD">
            {"← 99.73% →"}
          </text>

          {/* UCL / LCL badge */}
          <rect x={zToX(3) - 28} y={padT + 2} width={54} height={18} rx={4} fill="#FFF3EB" stroke="#F26B3A" strokeWidth={1} />
          <text x={zToX(3)} y={padT + 14} textAnchor="middle" fontSize={10} fill="#F26B3A" fontWeight="700">UCL (+3σ)</text>
          <rect x={zToX(-3) - 26} y={padT + 2} width={54} height={18} rx={4} fill="#FFF3EB" stroke="#F26B3A" strokeWidth={1} />
          <text x={zToX(-3)} y={padT + 14} textAnchor="middle" fontSize={10} fill="#F26B3A" fontWeight="700">LCL (−3σ)</text>
        </svg>
      </div>

      {/* Legend */}
      <div className="px-5 pb-4 pt-3 border-t border-border grid grid-cols-3 gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="inline-block w-4 h-3 rounded" style={{ background: "rgba(59,130,246,0.75)" }} />
          μ ± 1σ = <strong className="text-foreground ml-0.5">68.27%</strong>
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block w-4 h-3 rounded" style={{ background: "rgba(147,197,253,0.7)" }} />
          μ ± 2σ = <strong className="text-foreground ml-0.5">95.45%</strong>
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block w-4 h-3 rounded" style={{ background: "rgba(219,234,254,0.7)" }} />
          μ ± 3σ = <strong className="text-foreground ml-0.5">99.73%</strong>
        </span>
      </div>
    </div>
  );
}
