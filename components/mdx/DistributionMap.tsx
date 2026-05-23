"use client";

/**
 * Distribution Relationship Map
 * Shows how probability distributions are derived from / approximate each other
 */
export function DistributionMap() {
  const nodes = [
    // Continuous — top row
    { id: "normal",  x: 240, y: 52,  label: "정규분포", sub: "N(μ, σ²)",       color: "#2B4B8C", text: "#fff" },
    { id: "t",       x: 90,  y: 168, label: "t 분포",   sub: "t(ν)",            color: "#3B6AB5", text: "#fff" },
    { id: "chi2",    x: 240, y: 168, label: "χ² 분포",  sub: "χ²(ν)",           color: "#3B6AB5", text: "#fff" },
    { id: "f",       x: 390, y: 168, label: "F 분포",   sub: "F(ν₁,ν₂)",       color: "#3B6AB5", text: "#fff" },
    // Discrete — bottom row
    { id: "hyper",   x: 60,  y: 310, label: "초기하분포", sub: "HG(N,D,n)",    color: "#6B7280", text: "#fff" },
    { id: "binom",   x: 230, y: 310, label: "이항분포",  sub: "B(n,p)",         color: "#6B7280", text: "#fff" },
    { id: "poisson", x: 390, y: 310, label: "포아송분포", sub: "Pois(λ)",       color: "#6B7280", text: "#fff" },
  ];

  const edges: {
    from: string; to: string;
    label: string; color: string;
    dashed?: boolean;
    // optional custom path control point offsets
    cx?: number; cy?: number;
  }[] = [
    // 정규 → χ²
    { from: "normal", to: "chi2",   label: "제곱합",          color: "#2B4B8C" },
    // 정규 + χ² → t
    { from: "normal", to: "t",      label: "Z/√(χ²/ν)",      color: "#3B6AB5" },
    { from: "chi2",   to: "t",      label: "",                color: "#3B6AB5" },
    // χ² + χ² → F
    { from: "chi2",   to: "f",      label: "χ²비",            color: "#3B6AB5" },
    // 초기하 → 이항
    { from: "hyper",  to: "binom",  label: "n/N < 0.05",      color: "#9CA3AF", dashed: true },
    // 이항 → 포아송
    { from: "binom",  to: "poisson",label: "n↑ p↓ (np=λ)",   color: "#9CA3AF", dashed: true },
    // 이항 → 정규
    { from: "binom",  to: "normal", label: "np≥5, nq≥5",      color: "#F26B3A", dashed: true },
    // 포아송 → 정규
    { from: "poisson",to: "normal", label: "λ > 10",           color: "#F26B3A", dashed: true },
  ];

  const W = 500;
  const H = 400;
  const NODE_W = 110;
  const NODE_H = 48;

  // Node center
  const center = (id: string) => {
    const n = nodes.find((n) => n.id === id)!;
    return { x: n.x, y: n.y };
  };

  // Edge: simple quadratic bezier
  const edgePath = (fromId: string, toId: string, cx?: number, cy?: number) => {
    const f = center(fromId);
    const t = center(toId);
    const mx = cx ?? (f.x + t.x) / 2;
    const my = cy ?? (f.y + t.y) / 2;
    return `M${f.x},${f.y + NODE_H / 2} Q${mx},${my} ${t.x},${t.y - NODE_H / 2}`;
  };

  const edgePathLateral = (fromId: string, toId: string) => {
    const f = center(fromId);
    const t = center(toId);
    const fy = f.y + NODE_H / 2;
    const ty = t.y + NODE_H / 2;
    return `M${f.x + NODE_W / 2},${fy} L${t.x - NODE_W / 2},${ty}`;
  };

  return (
    <div className="my-6 rounded-2xl border border-border overflow-hidden bg-white">
      <div className="bg-muted/40 px-5 py-3 border-b border-border">
        <p className="text-sm font-semibold text-brand-navy">확률분포 관계도</p>
      </div>
      <div className="p-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          style={{ maxWidth: W, display: "block", margin: "0 auto" }}
          aria-label="확률분포 유도 및 근사 관계도"
        >
          <defs>
            <marker id="arr-navy" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 Z" fill="#2B4B8C" />
            </marker>
            <marker id="arr-blue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 Z" fill="#3B6AB5" />
            </marker>
            <marker id="arr-gray" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 Z" fill="#9CA3AF" />
            </marker>
            <marker id="arr-orange" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 Z" fill="#F26B3A" />
            </marker>
          </defs>

          {/* --- Section background labels --- */}
          <rect x={10} y={28} width={W - 20} height={204} rx={10}
            fill="#EFF6FF" stroke="#BFDBFE" strokeWidth={1} />
          <text x={22} y={46} fontSize={10} fill="#3B82F6" fontWeight="700">연속형 (계량형)</text>

          <rect x={10} y={278} width={W - 20} height={100} rx={10}
            fill="#F9FAFB" stroke="#E5E7EB" strokeWidth={1} />
          <text x={22} y={296} fontSize={10} fill="#6B7280" fontWeight="700">이산형 (계수형)</text>

          {/* --- CLT bridge zone --- */}
          <rect x={155} y={242} width={190} height={40} rx={8}
            fill="#FFF7ED" stroke="#FED7AA" strokeWidth={1} strokeDasharray="4,3" />
          <text x={250} y={257} textAnchor="middle" fontSize={9} fill="#EA580C" fontWeight="700">중심극한정리 (CLT)</text>
          <text x={250} y={270} textAnchor="middle" fontSize={9} fill="#EA580C">n 클수록 정규분포로 수렴</text>

          {/* --- Edges --- */}

          {/* 정규 → χ² (vertical down center) */}
          <line
            x1={center("normal").x} y1={center("normal").y + NODE_H / 2}
            x2={center("chi2").x}   y2={center("chi2").y - NODE_H / 2}
            stroke="#2B4B8C" strokeWidth={1.8} markerEnd="url(#arr-navy)"
          />
          <text x={center("normal").x + 6} y={(center("normal").y + center("chi2").y) / 2 + 5}
            fontSize={9} fill="#2B4B8C" fontWeight="600">제곱합</text>

          {/* χ² → t (diagonal left) */}
          <line
            x1={center("chi2").x - NODE_W / 2} y1={center("chi2").y}
            x2={center("t").x + NODE_W / 2}    y2={center("t").y}
            stroke="#3B6AB5" strokeWidth={1.5} markerEnd="url(#arr-blue)"
          />
          {/* 정규 → t (diagonal left) */}
          <line
            x1={center("normal").x - NODE_W / 2} y1={center("normal").y + 10}
            x2={center("t").x + NODE_W / 2}       y2={center("t").y - 8}
            stroke="#3B6AB5" strokeWidth={1.5} markerEnd="url(#arr-blue)"
          />
          <text x={148} y={132} fontSize={9} fill="#3B6AB5" fontWeight="600">Z / √(χ²/ν)</text>

          {/* χ² → F (lateral right) */}
          <line
            x1={center("chi2").x + NODE_W / 2} y1={center("chi2").y}
            x2={center("f").x - NODE_W / 2}    y2={center("f").y}
            stroke="#3B6AB5" strokeWidth={1.5} markerEnd="url(#arr-blue)"
          />
          <text x={(center("chi2").x + center("f").x) / 2} y={center("chi2").y - 7}
            textAnchor="middle" fontSize={9} fill="#3B6AB5" fontWeight="600">χ²비</text>

          {/* 초기하 → 이항 */}
          <line
            x1={center("hyper").x + NODE_W / 2} y1={center("hyper").y}
            x2={center("binom").x - NODE_W / 2}  y2={center("binom").y}
            stroke="#9CA3AF" strokeWidth={1.5} strokeDasharray="5,3" markerEnd="url(#arr-gray)"
          />
          <text x={(center("hyper").x + center("binom").x) / 2} y={center("hyper").y - 8}
            textAnchor="middle" fontSize={9} fill="#6B7280">n/N &lt; 0.05</text>

          {/* 이항 → 포아송 */}
          <line
            x1={center("binom").x + NODE_W / 2}    y1={center("binom").y}
            x2={center("poisson").x - NODE_W / 2}  y2={center("poisson").y}
            stroke="#9CA3AF" strokeWidth={1.5} strokeDasharray="5,3" markerEnd="url(#arr-gray)"
          />
          <text x={(center("binom").x + center("poisson").x) / 2} y={center("binom").y - 8}
            textAnchor="middle" fontSize={9} fill="#6B7280">n↑ p↓</text>

          {/* 이항 → 정규 (up to CLT box) */}
          <line
            x1={center("binom").x}    y1={center("binom").y - NODE_H / 2}
            x2={center("binom").x}    y2={242 + 40}
            stroke="#F26B3A" strokeWidth={1.5} strokeDasharray="5,3" markerEnd="url(#arr-orange)"
          />
          {/* 포아송 → 정규 (up to CLT box) */}
          <line
            x1={center("poisson").x}  y1={center("poisson").y - NODE_H / 2}
            x2={center("poisson").x}  y2={242 + 40}
            stroke="#F26B3A" strokeWidth={1.5} strokeDasharray="5,3" markerEnd="url(#arr-orange)"
          />
          {/* CLT box → 정규 */}
          <line
            x1={250} y1={242}
            x2={center("normal").x} y2={center("normal").y + NODE_H / 2}
            stroke="#F26B3A" strokeWidth={1.5} strokeDasharray="5,3" markerEnd="url(#arr-orange)"
          />

          {/* t(ν→∞) → Z 아래 메모 */}
          <text x={center("t").x} y={center("t").y + NODE_H / 2 + 14}
            textAnchor="middle" fontSize={8} fill="#6B7280">ν→∞ 이면 N(0,1)</text>

          {/* --- Nodes --- */}
          {nodes.map((n) => (
            <g key={n.id}>
              <rect
                x={n.x - NODE_W / 2}
                y={n.y - NODE_H / 2}
                width={NODE_W}
                height={NODE_H}
                rx={10}
                fill={n.color}
              />
              <text x={n.x} y={n.y - 4} textAnchor="middle"
                fontSize={12} fontWeight="700" fill={n.text}>
                {n.label}
              </text>
              <text x={n.x} y={n.y + 12} textAnchor="middle"
                fontSize={10} fill={n.text} opacity={0.85}>
                {n.sub}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="px-5 pb-4 pt-3 border-t border-border flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <svg width="28" height="10"><line x1="0" y1="5" x2="28" y2="5" stroke="#2B4B8C" strokeWidth="2"/></svg>
          수학적 유도
        </span>
        <span className="flex items-center gap-2">
          <svg width="28" height="10"><line x1="0" y1="5" x2="28" y2="5" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="5,3"/></svg>
          근사 (이산형 간)
        </span>
        <span className="flex items-center gap-2">
          <svg width="28" height="10"><line x1="0" y1="5" x2="28" y2="5" stroke="#F26B3A" strokeWidth="2" strokeDasharray="5,3"/></svg>
          정규 근사 (CLT)
        </span>
      </div>
    </div>
  );
}
