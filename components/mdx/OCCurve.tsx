"use client";

/**
 * OC Curve (Operating Characteristic Curve) SVG visualization
 * Shows Pa (probability of acceptance) vs lot defect rate (p)
 */
export function OCCurve() {
  const W = 540;
  const H = 320;
  const padL = 64;
  const padR = 32;
  const padT = 24;
  const padB = 52;
  const gW = W - padL - padR;
  const gH = H - padT - padB;

  // Sigmoid-like OC curve points (x = defect rate 0~20%, y = Pa 0~1)
  // Using binomial approx: n=50, c=1, AQL=2%, LTPD≈8%
  const curvePoints: [number, number][] = [
    [0.000, 1.000],
    [0.005, 0.974],
    [0.010, 0.910],
    [0.015, 0.827],
    [0.020, 0.736], // AQL ≈ 2% → Pa ≈ 0.736 (1-α)
    [0.030, 0.557],
    [0.040, 0.400],
    [0.050, 0.279],
    [0.060, 0.191],
    [0.070, 0.130],
    [0.080, 0.087], // LTPD ≈ 8% → Pa ≈ 0.087 (β)
    [0.100, 0.038],
    [0.130, 0.010],
    [0.160, 0.002],
    [0.200, 0.000],
  ];

  const maxP = 0.20;
  const toSvg = (p: number, pa: number) => ({
    x: padL + (p / maxP) * gW,
    y: padT + (1 - pa) * gH,
  });

  const pathD = curvePoints
    .map(([p, pa], i) => {
      const { x, y } = toSvg(p, pa);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  // Key reference points
  const AQL = 0.02;
  const LTPD = 0.08;
  const alpha = 1 - 0.736; // ≈ 0.264 → 생산자 위험
  const beta = 0.087;       // 소비자 위험
  const Pa_AQL = 0.736;
  const Pa_LTPD = beta;

  const aqlPt = toSvg(AQL, Pa_AQL);
  const ltpdPt = toSvg(LTPD, Pa_LTPD);
  const originY = toSvg(0, 0).y;
  const originX = toSvg(0, 0).x;
  const topY = padT;
  const rightX = padL + gW;

  // Shaded zones
  const goodZoneRight = aqlPt.x;
  const badZoneLeft = ltpdPt.x;

  return (
    <div className="my-6 rounded-2xl border border-border overflow-hidden bg-white">
      <div className="bg-muted/40 px-5 py-3 border-b border-border">
        <p className="text-sm font-semibold text-brand-navy">
          검사 특성 곡선 (OC Curve) — 계수형 샘플링 (n=50, c=1 예시)
        </p>
      </div>
      <div className="p-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          style={{ maxWidth: W, display: "block", margin: "0 auto" }}
          aria-label="OC 곡선: 로트 불량률에 따른 합격 확률"
        >
          {/* Shaded: 합격영역 (AQL 이하) */}
          <rect
            x={padL}
            y={padT}
            width={goodZoneRight - padL}
            height={gH}
            fill="#DCFCE7"
            opacity={0.5}
          />
          {/* Shaded: 불합격영역 (LTPD 이상) */}
          <rect
            x={badZoneLeft}
            y={padT}
            width={rightX - badZoneLeft}
            height={gH}
            fill="#FEE2E2"
            opacity={0.5}
          />

          {/* Grid lines — horizontal */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((pa) => {
            const y = padT + (1 - pa) * gH;
            return (
              <line
                key={pa}
                x1={padL}
                y1={y}
                x2={rightX}
                y2={y}
                stroke="#E8E4DC"
                strokeWidth={1}
              />
            );
          })}

          {/* Grid lines — vertical */}
          {[0, 0.05, 0.10, 0.15, 0.20].map((p) => {
            const x = padL + (p / maxP) * gW;
            return (
              <line
                key={p}
                x1={x}
                y1={padT}
                x2={x}
                y2={originY}
                stroke="#E8E4DC"
                strokeWidth={1}
              />
            );
          })}

          {/* Axes */}
          <line x1={padL} y1={padT} x2={padL} y2={originY} stroke="#6B7280" strokeWidth={1.5} />
          <line x1={padL} y1={originY} x2={rightX + 8} y2={originY} stroke="#6B7280" strokeWidth={1.5} />

          {/* Axis arrow */}
          <polygon points={`${rightX + 8},${originY - 4} ${rightX + 16},${originY} ${rightX + 8},${originY + 4}`} fill="#6B7280" />

          {/* OC Curve */}
          <path d={pathD} fill="none" stroke="#2B4B8C" strokeWidth={2.5} strokeLinejoin="round" />

          {/* --- Dashed reference lines --- */}
          {/* Pa = 1-α at AQL */}
          <line
            x1={padL}
            y1={aqlPt.y}
            x2={aqlPt.x}
            y2={aqlPt.y}
            stroke="#F26B3A"
            strokeWidth={1.2}
            strokeDasharray="5,3"
          />
          <line
            x1={aqlPt.x}
            y1={aqlPt.y}
            x2={aqlPt.x}
            y2={originY}
            stroke="#F26B3A"
            strokeWidth={1.2}
            strokeDasharray="5,3"
          />

          {/* Pa = β at LTPD */}
          <line
            x1={padL}
            y1={ltpdPt.y}
            x2={ltpdPt.x}
            y2={ltpdPt.y}
            stroke="#DC2626"
            strokeWidth={1.2}
            strokeDasharray="5,3"
          />
          <line
            x1={ltpdPt.x}
            y1={ltpdPt.y}
            x2={ltpdPt.x}
            y2={originY}
            stroke="#DC2626"
            strokeWidth={1.2}
            strokeDasharray="5,3"
          />

          {/* Dots on curve */}
          <circle cx={aqlPt.x} cy={aqlPt.y} r={5} fill="#F26B3A" stroke="white" strokeWidth={1.5} />
          <circle cx={ltpdPt.x} cy={ltpdPt.y} r={5} fill="#DC2626" stroke="white" strokeWidth={1.5} />

          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((pa) => {
            const y = padT + (1 - pa) * gH;
            return (
              <text key={pa} x={padL - 8} y={y + 4} textAnchor="end" fontSize={11} fill="#6B7280">
                {pa.toFixed(2)}
              </text>
            );
          })}

          {/* 1-α label on Y-axis */}
          <text x={padL - 8} y={aqlPt.y + 4} textAnchor="end" fontSize={10} fill="#F26B3A" fontWeight="600">
            1-α
          </text>
          {/* β label on Y-axis */}
          <text x={padL - 8} y={ltpdPt.y + 4} textAnchor="end" fontSize={10} fill="#DC2626" fontWeight="600">
            β
          </text>

          {/* X-axis labels */}
          {[0, 0.05, 0.10, 0.15, 0.20].map((p) => {
            const x = padL + (p / maxP) * gW;
            return (
              <text key={p} x={x} y={originY + 16} textAnchor="middle" fontSize={11} fill="#6B7280">
                {(p * 100).toFixed(0)}%
              </text>
            );
          })}

          {/* AQL label on X-axis */}
          <text x={aqlPt.x} y={originY + 30} textAnchor="middle" fontSize={10} fill="#F26B3A" fontWeight="700">
            AQL
          </text>
          {/* LTPD label on X-axis */}
          <text x={ltpdPt.x} y={originY + 30} textAnchor="middle" fontSize={10} fill="#DC2626" fontWeight="700">
            LTPD
          </text>

          {/* Axis titles */}
          <text
            x={padL - 44}
            y={padT + gH / 2}
            textAnchor="middle"
            fontSize={11}
            fill="#1A1F2E"
            fontWeight="600"
            transform={`rotate(-90, ${padL - 44}, ${padT + gH / 2})`}
          >
            합격 확률 Pa
          </text>
          <text x={rightX + 14} y={originY + 4} textAnchor="start" fontSize={11} fill="#1A1F2E" fontWeight="600">
            p →
          </text>
          <text x={padL + gW / 2} y={H - 4} textAnchor="middle" fontSize={11} fill="#6B7280">
            로트 불량률 (p)
          </text>

          {/* Zone labels */}
          <text x={padL + 10} y={padT + 16} fontSize={11} fill="#16A34A" fontWeight="700">합격 영역</text>
          <text x={badZoneLeft + 6} y={padT + 16} fontSize={11} fill="#DC2626" fontWeight="700">불합격 영역</text>

          {/* Annotations */}
          {/* α arrow on right side */}
          <line x1={rightX - 20} y1={topY + 2} x2={rightX - 20} y2={aqlPt.y - 2} stroke="#F26B3A" strokeWidth={1} markerEnd="url(#arrowO)" />
          <text x={rightX - 10} y={(topY + aqlPt.y) / 2 + 4} fontSize={10} fill="#F26B3A" fontWeight="600">α</text>
          <text x={rightX - 44} y={(topY + aqlPt.y) / 2 + 4} fontSize={9} fill="#F26B3A">생산자</text>
          <text x={rightX - 44} y={(topY + aqlPt.y) / 2 + 15} fontSize={9} fill="#F26B3A">위험</text>

          {/* β label */}
          <text x={ltpdPt.x + 12} y={ltpdPt.y - 6} fontSize={9} fill="#DC2626">소비자</text>
          <text x={ltpdPt.x + 12} y={ltpdPt.y + 5} fontSize={9} fill="#DC2626">위험 (β)</text>

          <defs>
            <marker id="arrowO" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#F26B3A" />
            </marker>
          </defs>
        </svg>
      </div>

      {/* Legend */}
      <div className="px-5 pb-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground border-t border-border pt-3">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-6 h-0.5 bg-brand-navy rounded" />
          OC 곡선
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-[#F26B3A]" />
          AQL 합격점 (1-α)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-[#DC2626]" />
          LTPD 점 (β)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-green-200 opacity-80" />
          합격 영역
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-red-200 opacity-80" />
          불합격 영역
        </span>
      </div>
    </div>
  );
}
