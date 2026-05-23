"use client";

import { Plus, Trash2 } from "lucide-react";

export interface QFDPhase {
  whats: { id: string; label: string; importance: number }[];
  hows: { id: string; label: string; target?: string }[];
  body: Record<string, Record<string, string>>;
  roof: Record<string, Record<string, string>>;
}

interface HOQMatrixProps {
  phase: QFDPhase;
  onChange: (phase: QFDPhase) => void;
  readonly?: boolean;
}

const BODY_CYCLE = ["", "◎", "○", "△"] as const;
const ROOF_CYCLE = ["", "++", "+", "-", "--"] as const;
const STRENGTH: Record<string, number> = { "◎": 9, "○": 3, "△": 1, "": 0 };

const BODY_STYLE: Record<string, string> = {
  "◎": "bg-brand-navy text-white font-bold",
  "○": "bg-blue-300 text-white font-bold",
  "△": "bg-blue-100 text-brand-navy font-bold",
  "":  "bg-white hover:bg-muted",
};

// SVG roof diamond colors
const ROOF_COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
  "++": { fill: "#16A34A", stroke: "#15803D", text: "#FFFFFF" },
  "+":  { fill: "#BBF7D0", stroke: "#86EFAC", text: "#166534" },
  "-":  { fill: "#FECACA", stroke: "#FCA5A5", text: "#991B1B" },
  "--": { fill: "#EF4444", stroke: "#DC2626", text: "#FFFFFF" },
  "":   { fill: "#F9FAFB", stroke: "#E5E7EB", text: "#9CA3AF" },
};

// HOW column width in pixels — must match the w-10 (40px) class used in the table
const CELL_W = 40;

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function cycleNext<T>(arr: readonly T[], val: T): T {
  const idx = arr.indexOf(val);
  return arr[(idx + 1) % arr.length];
}

function computeScores(phase: QFDPhase): number[] {
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

// ── Triangular roof SVG ───────────────────────────────────────────────────────
interface RoofSVGProps {
  hows: QFDPhase["hows"];
  roof: QFDPhase["roof"];
  onToggle: (id1: string, id2: string) => void;
  readonly?: boolean;
}

function RoofSVG({ hows, roof, onToggle, readonly }: RoofSVGProps) {
  const n = hows.length;
  if (n < 2) return null;

  // For HOW pair (i, j) with i < j (0-indexed):
  //   cx = (i + j + 1) / 2 × CELL_W          — aligns with HOW column midpoints
  //   cy = (n − j + i) × CELL_W/2              — higher j-i = higher in triangle
  // Diamond half-diagonal = CELL_W/2            — cells share edges exactly
  const halfD = CELL_W / 2;
  const svgW = n * CELL_W;
  const svgH = n * halfD; // = n * CELL_W/2

  const pairs: { i: number; j: number; cx: number; cy: number; val: string }[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const cx = ((i + j + 1) / 2) * CELL_W;
      const cy = (n - j + i) * halfD;
      const val = roof[hows[i].id]?.[hows[j].id] ?? "";
      pairs.push({ i, j, cx, cy, val });
    }
  }

  return (
    <svg
      width={svgW}
      height={svgH}
      style={{ display: "block" }}
      aria-label="지붕 상관 매트릭스"
    >
      {/* Subtle vertical column guides */}
      {hows.slice(1, -1).map((_, k) => (
        <line
          key={k}
          x1={(k + 1) * CELL_W}
          y1={(n - 1) * halfD}
          x2={(k + 1) * CELL_W}
          y2={(k + 1) * halfD}
          stroke="#E5E7EB"
          strokeWidth="0.5"
          strokeDasharray="2,2"
        />
      ))}

      {/* Triangle outer border */}
      <polygon
        points={`${svgW / 2},0 ${svgW},${svgH} 0,${svgH}`}
        fill="none"
        stroke="#D1D5DB"
        strokeWidth="1"
      />

      {/* Diamond cells */}
      {pairs.map(({ i, j, cx, cy, val }) => {
        const c = ROOF_COLORS[val] ?? ROOF_COLORS[""];
        const pts = `${cx},${cy - halfD} ${cx + halfD},${cy} ${cx},${cy + halfD} ${cx - halfD},${cy}`;
        const label = `${hows[i].label || `H${i + 1}`} × ${hows[j].label || `H${j + 1}`}`;

        return (
          <g
            key={`${hows[i].id}-${hows[j].id}`}
            onClick={() => !readonly && onToggle(hows[i].id, hows[j].id)}
            style={{ cursor: readonly ? "default" : "pointer" }}
            role={readonly ? undefined : "button"}
            aria-label={label}
          >
            <title>{label}{val ? `: ${val}` : " (클릭하여 입력)"}</title>
            <polygon
              points={pts}
              fill={c.fill}
              stroke={c.stroke}
              strokeWidth="0.75"
            />
            {val && (
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={val === "++" || val === "--" ? "8" : "9"}
                fontWeight="bold"
                fill={c.text}
                style={{ userSelect: "none", pointerEvents: "none" }}
              >
                {val}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function HOQMatrix({ phase, onChange, readonly }: HOQMatrixProps) {
  function update(next: QFDPhase) {
    onChange(next);
  }

  // ── WHAT mutations ───────────────────────────────────────────────────────────
  function addWhat() {
    const id = uid();
    update({ ...phase, whats: [...phase.whats, { id, label: "", importance: 3 }] });
  }

  function removeWhat(id: string) {
    const body = { ...phase.body };
    delete body[id];
    update({ ...phase, whats: phase.whats.filter((w) => w.id !== id), body });
  }

  function setWhatLabel(id: string, label: string) {
    update({ ...phase, whats: phase.whats.map((w) => (w.id === id ? { ...w, label } : w)) });
  }

  function setWhatImportance(id: string, importance: number) {
    update({ ...phase, whats: phase.whats.map((w) => (w.id === id ? { ...w, importance } : w)) });
  }

  // ── HOW mutations ────────────────────────────────────────────────────────────
  function addHow() {
    const id = uid();
    update({ ...phase, hows: [...phase.hows, { id, label: "", target: "" }] });
  }

  function removeHow(id: string) {
    const body: Record<string, Record<string, string>> = {};
    for (const [wid, row] of Object.entries(phase.body)) {
      const r = { ...row };
      delete r[id];
      body[wid] = r;
    }
    const roof: Record<string, Record<string, string>> = {};
    for (const [hid, row] of Object.entries(phase.roof)) {
      if (hid === id) continue;
      const r = { ...row };
      delete r[id];
      roof[hid] = r;
    }
    update({ ...phase, hows: phase.hows.filter((h) => h.id !== id), body, roof });
  }

  function setHowLabel(id: string, label: string) {
    update({ ...phase, hows: phase.hows.map((h) => (h.id === id ? { ...h, label } : h)) });
  }

  function setHowTarget(id: string, target: string) {
    update({ ...phase, hows: phase.hows.map((h) => (h.id === id ? { ...h, target } : h)) });
  }

  // ── Body & Roof mutations ────────────────────────────────────────────────────
  function toggleBody(whatId: string, howId: string) {
    const cur = phase.body[whatId]?.[howId] ?? "";
    update({
      ...phase,
      body: {
        ...phase.body,
        [whatId]: { ...phase.body[whatId], [howId]: cycleNext(BODY_CYCLE, cur) },
      },
    });
  }

  function toggleRoof(id1: string, id2: string) {
    const cur = phase.roof[id1]?.[id2] ?? "";
    update({
      ...phase,
      roof: {
        ...phase.roof,
        [id1]: { ...phase.roof[id1], [id2]: cycleNext(ROOF_CYCLE, cur) },
      },
    });
  }

  const scores = computeScores(phase);
  const ranks = computeRanks(scores);
  const CELL = "w-10 h-10 text-sm border border-border cursor-pointer select-none transition-colors duration-100";

  return (
    <div className="overflow-x-auto">
      <table className="border-collapse" style={{ tableLayout: "auto" }}>
        <thead>
          {/* ── Triangular roof ───────────────────────────────────────────── */}
          {phase.hows.length >= 2 && (
            <tr>
              <td
                colSpan={2}
                className="align-bottom pr-2 pb-1 text-right border-0"
              >
                <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                  지붕 상관
                </span>
              </td>
              <td
                colSpan={phase.hows.length}
                className="p-0 align-bottom"
                style={{ width: phase.hows.length * CELL_W }}
              >
                <RoofSVG
                  hows={phase.hows}
                  roof={phase.roof}
                  onToggle={toggleRoof}
                  readonly={readonly}
                />
              </td>
              {!readonly && <td className="border-0" />}
            </tr>
          )}

          {/* ── HOW header row ────────────────────────────────────────────── */}
          <tr className="bg-brand-navy text-white">
            <th className="text-left px-3 py-2 text-xs font-semibold whitespace-nowrap min-w-[140px] border border-brand-navy-dark">
              요구사항
            </th>
            <th className="text-center px-1 py-2 text-xs font-semibold w-12 border border-brand-navy-dark">
              중요도
            </th>
            {phase.hows.map((how, j) => (
              <th key={how.id} className="p-0 w-10 border border-brand-navy-dark">
                <div className="flex flex-col items-center">
                  {!readonly && (
                    <button
                      type="button"
                      onClick={() => removeHow(how.id)}
                      className="text-white/40 hover:text-red-300 p-0.5 mt-0.5 transition-colors"
                      title="HOW 삭제"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                  <div
                    className="flex items-end justify-center"
                    style={{ height: "80px", writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                  >
                    {readonly ? (
                      <span
                        className="text-xs font-medium px-1 truncate"
                        style={{ maxHeight: "72px" }}
                      >
                        {how.label || `HOW ${j + 1}`}
                      </span>
                    ) : (
                      <input
                        type="text"
                        value={how.label}
                        onChange={(e) => setHowLabel(how.id, e.target.value)}
                        placeholder={`특성 ${j + 1}`}
                        className="bg-transparent text-white text-xs placeholder:text-white/40 focus:outline-none w-full text-center"
                        style={{
                          writingMode: "vertical-rl",
                          transform: "rotate(180deg)",
                          height: "72px",
                        }}
                      />
                    )}
                  </div>
                </div>
              </th>
            ))}
            {!readonly && (
              <th className="border border-brand-navy-dark">
                <button
                  type="button"
                  onClick={addHow}
                  className="w-10 h-full flex items-center justify-center text-white/70 hover:text-white hover:bg-brand-navy-dark transition-colors py-2"
                  title="HOW 추가"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {/* ── WHAT rows ───────────────────────────────────────────────────── */}
          {phase.whats.map((what) => (
            <tr key={what.id} className="group">
              <td className="border border-border bg-muted/30 p-0 h-10 min-w-[140px]">
                <div className="flex items-center h-full">
                  {!readonly && (
                    <button
                      type="button"
                      onClick={() => removeWhat(what.id)}
                      className="text-muted-foreground/40 hover:text-red-400 px-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      title="WHAT 삭제"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {readonly ? (
                    <span className="px-2 text-sm">{what.label}</span>
                  ) : (
                    <input
                      type="text"
                      value={what.label}
                      onChange={(e) => setWhatLabel(what.id, e.target.value)}
                      placeholder="요구사항 입력"
                      className="flex-1 h-10 px-2 text-sm bg-transparent focus:outline-none focus:bg-white border-l border-border/40 min-w-0"
                    />
                  )}
                </div>
              </td>
              <td className="border border-border bg-muted/30 p-0 h-10 w-12">
                {readonly ? (
                  <span className="flex items-center justify-center h-full text-sm font-bold">
                    {what.importance}
                  </span>
                ) : (
                  <select
                    value={what.importance}
                    onChange={(e) => setWhatImportance(what.id, Number(e.target.value))}
                    className="w-full h-10 text-center text-sm font-bold bg-transparent focus:outline-none cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                )}
              </td>
              {phase.hows.map((how) => {
                const val = phase.body[what.id]?.[how.id] ?? "";
                return (
                  <td key={how.id} className="border border-border p-0 w-10 h-10">
                    <button
                      type="button"
                      onClick={() => !readonly && toggleBody(what.id, how.id)}
                      className={`${CELL} ${BODY_STYLE[val]} ${readonly ? "cursor-default" : ""} w-10 h-10`}
                      title={`${what.label} × ${how.label}`}
                    >
                      {val}
                    </button>
                  </td>
                );
              })}
              {!readonly && <td className="w-10" />}
            </tr>
          ))}

          {/* ── Add WHAT row ─────────────────────────────────────────────── */}
          {!readonly && (
            <tr>
              <td colSpan={phase.hows.length + 3} className="border border-dashed border-border p-0">
                <button
                  type="button"
                  onClick={addWhat}
                  className="w-full flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-brand-navy hover:bg-muted/50 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  요구사항 추가
                </button>
              </td>
            </tr>
          )}

          {/* ── Target row ──────────────────────────────────────────────── */}
          <tr className="bg-muted/20">
            <td
              className="border border-border px-3 py-1 text-xs font-semibold text-muted-foreground text-right"
              colSpan={2}
            >
              목표값
            </td>
            {phase.hows.map((how) => (
              <td key={how.id} className="border border-border p-0 w-10 h-8">
                {readonly ? (
                  <span className="flex items-center justify-center h-full text-xs">
                    {how.target}
                  </span>
                ) : (
                  <input
                    type="text"
                    value={how.target ?? ""}
                    onChange={(e) => setHowTarget(how.id, e.target.value)}
                    placeholder="—"
                    className="w-10 h-8 text-xs text-center bg-transparent focus:outline-none focus:bg-white border-0 placeholder:text-muted-foreground/40"
                  />
                )}
              </td>
            ))}
            {!readonly && <td className="w-10" />}
          </tr>

          {/* ── Weighted score row ──────────────────────────────────────── */}
          <tr className="bg-orange-50">
            <td
              className="border border-border px-3 py-2 text-xs font-bold text-brand-orange text-right"
              colSpan={2}
            >
              가중 점수
            </td>
            {scores.map((s, j) => (
              <td
                key={j}
                className="border border-border text-center text-sm font-bold text-brand-orange w-10 h-9"
              >
                {s}
              </td>
            ))}
            {!readonly && <td className="w-10" />}
          </tr>

          {/* ── Rank row ────────────────────────────────────────────────── */}
          <tr className="bg-orange-50/60">
            <td
              className="border border-border px-3 py-1 text-xs font-semibold text-muted-foreground text-right"
              colSpan={2}
            >
              순위
            </td>
            {ranks.map((r, j) => (
              <td
                key={j}
                className="border border-border text-center text-xs font-semibold text-muted-foreground w-10 h-7"
              >
                {scores[j] > 0 ? r : "—"}
              </td>
            ))}
            {!readonly && <td className="w-10" />}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
