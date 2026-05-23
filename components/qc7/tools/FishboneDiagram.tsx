"use client";

import { useState } from "react";
import { Plus, Trash2, Download, ChevronRight } from "lucide-react";
import ToolShell from "../ToolShell";
import { exportFishbone } from "@/lib/qc7/excelExporter";

const INITIAL_CATEGORIES = ["Man (인원)", "Machine (설비)", "Material (원자재)", "Method (방법)"];

interface SubCause {
  id: string;
  text: string;
}

interface Cause {
  id: string;
  text: string;
  subCauses: SubCause[];
}

interface Category {
  name: string;
  causes: Cause[];
}

let seq = 1;
const mkCause = (text = ""): Cause => ({ id: `c${seq++}`, text, subCauses: [] });
const mkSub = (): SubCause => ({ id: `s${seq++}`, text: "" });

// SVG constants
const W = 820;
const H = 400;
const SPINE_Y = H / 2;
const HEAD_X = W - 76;
const TAIL_X = 55;
const JUNCTIONS = [TAIL_X + 160, TAIL_X + 345];
const BONE_DX = -58;
const BONE_DY = 125; // absolute value

function renderBone(
  cat: Category,
  jx: number,
  isTop: boolean
): React.ReactNode {
  const dir = isTop ? -1 : 1;
  const boneEndX = jx + BONE_DX;
  const boneEndY = SPINE_Y + dir * BONE_DY;
  const validCauses = cat.causes.filter((c) => c.text.trim());
  const n = validCauses.length;

  return (
    <g>
      {/* Diagonal bone */}
      <line
        x1={jx} y1={SPINE_Y}
        x2={boneEndX} y2={boneEndY}
        stroke="#2B4B8C" strokeWidth={2}
      />
      {/* Category label */}
      <text
        x={boneEndX}
        y={boneEndY + dir * 17}
        fontSize={10}
        fontWeight="bold"
        fill="#2B4B8C"
        textAnchor="middle"
      >
        {cat.name.split(" ")[0]}
      </text>

      {validCauses.map((cause, ci) => {
        // Position cause along the bone at fraction t
        const t = (ci + 1) / (n + 1);
        const bx = jx + BONE_DX * t;
        const by = SPINE_Y + dir * BONE_DY * t;

        // Cause line: horizontal going left from bone contact
        const causeLen = 58;
        const cx = bx - causeLen;

        const validSubs = cause.subCauses.filter((sc) => sc.text.trim());

        return (
          <g key={cause.id}>
            {/* Cause line */}
            <line
              x1={cx} y1={by}
              x2={bx} y2={by}
              stroke="#4B5563" strokeWidth={1.5}
            />
            {/* Cause label */}
            <text
              x={cx - 4}
              y={by + 4}
              fontSize={9}
              fill="#1A1F2E"
              textAnchor="end"
            >
              {cause.text}
            </text>

            {/* Sub-causes: dashed vertical lines off the cause line */}
            {validSubs.map((sc, si) => {
              const scX = cx + 10 + si * 20;
              const scY = by + dir * 24;
              return (
                <g key={sc.id}>
                  <line
                    x1={scX} y1={by}
                    x2={scX} y2={scY}
                    stroke="#9CA3AF"
                    strokeWidth={1}
                    strokeDasharray="2 2"
                  />
                  <text
                    x={scX}
                    y={scY + dir * 9}
                    fontSize={8}
                    fill="#6B7280"
                    textAnchor="middle"
                  >
                    {sc.text}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  );
}

export default function FishboneDiagram() {
  const [effect, setEffect] = useState("불량 발생");
  const [categories, setCategories] = useState<Category[]>(
    INITIAL_CATEGORIES.map((name) => ({ name, causes: [mkCause()] }))
  );
  const [downloading, setDownloading] = useState(false);

  // ── Cause CRUD ──────────────────────────────────────────────────────────────

  const addCause = (ci: number) =>
    setCategories((prev) =>
      prev.map((cat, i) => (i === ci ? { ...cat, causes: [...cat.causes, mkCause()] } : cat))
    );

  const updateCause = (ci: number, causeId: string, text: string) =>
    setCategories((prev) =>
      prev.map((cat, i) =>
        i === ci
          ? { ...cat, causes: cat.causes.map((c) => (c.id === causeId ? { ...c, text } : c)) }
          : cat
      )
    );

  const removeCause = (ci: number, causeId: string) =>
    setCategories((prev) =>
      prev.map((cat, i) =>
        i === ci ? { ...cat, causes: cat.causes.filter((c) => c.id !== causeId) } : cat
      )
    );

  // ── Sub-cause CRUD ──────────────────────────────────────────────────────────

  const addSub = (ci: number, causeId: string) =>
    setCategories((prev) =>
      prev.map((cat, i) =>
        i === ci
          ? {
              ...cat,
              causes: cat.causes.map((c) =>
                c.id === causeId ? { ...c, subCauses: [...c.subCauses, mkSub()] } : c
              ),
            }
          : cat
      )
    );

  const updateSub = (ci: number, causeId: string, subId: string, text: string) =>
    setCategories((prev) =>
      prev.map((cat, i) =>
        i === ci
          ? {
              ...cat,
              causes: cat.causes.map((c) =>
                c.id === causeId
                  ? {
                      ...c,
                      subCauses: c.subCauses.map((sc) =>
                        sc.id === subId ? { ...sc, text } : sc
                      ),
                    }
                  : c
              ),
            }
          : cat
      )
    );

  const removeSub = (ci: number, causeId: string, subId: string) =>
    setCategories((prev) =>
      prev.map((cat, i) =>
        i === ci
          ? {
              ...cat,
              causes: cat.causes.map((c) =>
                c.id === causeId
                  ? { ...c, subCauses: c.subCauses.filter((sc) => sc.id !== subId) }
                  : c
              ),
            }
          : cat
      )
    );

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await exportFishbone(
        effect,
        categories.map((cat) => ({
          name: cat.name,
          causes: cat.causes
            .filter((c) => c.text.trim())
            .map((c) => ({
              text: c.text,
              subCauses: c.subCauses.filter((sc) => sc.text.trim()).map((sc) => sc.text),
            })),
        }))
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ToolShell
      title="특성요인도 (Fishbone / Ishikawa)"
      badge="QC 7가지 도구 ④"
      description="결과(불량)에 영향을 주는 원인과 하위 원인을 4M 기준으로 계층적으로 분류합니다. [+ 하위] 버튼으로 원인의 하위 가지를 추가할 수 있습니다."
      iatfClause="10.2.1 c)"
      downloadButton={
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-1.5 bg-brand-navy text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-brand-navy-dark disabled:opacity-40 transition-all"
        >
          <Download className="h-4 w-4" />
          {downloading ? "처리 중..." : "Excel 다운로드"}
        </button>
      }
      practice={
        <div className="space-y-5">
          {/* Effect input */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-1.5 block">
              결과 (Effect / 불량명)
            </label>
            <input
              className="border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-navy w-full md:w-72"
              value={effect}
              onChange={(e) => setEffect(e.target.value)}
              placeholder="예: 치수 불량"
            />
          </div>

          {/* SVG fishbone preview */}
          <div className="bg-white border border-border rounded-2xl p-4 overflow-x-auto">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              style={{ width: "100%", maxWidth: W, height: "auto" }}
            >
              <defs>
                <marker
                  id="arrowhead-fb"
                  markerWidth="8"
                  markerHeight="6"
                  refX="8"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 8 3, 0 6" fill="#2B4B8C" />
                </marker>
              </defs>

              {/* Main spine */}
              <line
                x1={TAIL_X} y1={SPINE_Y}
                x2={HEAD_X} y2={SPINE_Y}
                stroke="#2B4B8C" strokeWidth={3}
                markerEnd="url(#arrowhead-fb)"
              />

              {/* Effect box */}
              <rect
                x={HEAD_X} y={SPINE_Y - 24}
                width={76} height={48}
                rx={8} fill="#2B4B8C"
              />
              <text
                x={HEAD_X + 38} y={SPINE_Y + 5}
                fontSize={11} fontWeight="bold"
                fill="white" textAnchor="middle"
              >
                {effect || "결과"}
              </text>

              {/* 4 category bones */}
              {renderBone(categories[0], JUNCTIONS[0], true)}
              {renderBone(categories[1], JUNCTIONS[1], true)}
              {renderBone(categories[2], JUNCTIONS[0], false)}
              {renderBone(categories[3], JUNCTIONS[1], false)}
            </svg>
          </div>

          {/* Input panels per category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat, catIdx) => (
              <div key={catIdx} className="border border-border rounded-xl p-4">
                <h4 className="text-sm font-bold text-brand-navy mb-3">{cat.name}</h4>
                <div className="space-y-3">
                  {cat.causes.map((cause, causeIdx) => (
                    <div key={cause.id} className="space-y-1.5">
                      {/* Cause row */}
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs w-4 shrink-0">
                          {causeIdx + 1}.
                        </span>
                        <input
                          className="flex-1 border border-border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-brand-navy"
                          placeholder="원인 입력"
                          value={cause.text}
                          onChange={(e) => updateCause(catIdx, cause.id, e.target.value)}
                        />
                        <button
                          onClick={() => addSub(catIdx, cause.id)}
                          title="하위 원인 추가"
                          className="text-[11px] text-brand-orange border border-brand-orange/30 rounded-lg px-2 py-1.5 hover:bg-brand-orange/5 transition-all shrink-0 whitespace-nowrap"
                        >
                          + 하위
                        </button>
                        {cat.causes.length > 1 && (
                          <button
                            onClick={() => removeCause(catIdx, cause.id)}
                            className="text-muted-foreground hover:text-destructive shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Sub-cause rows (indented) */}
                      {cause.subCauses.length > 0 && (
                        <div className="ml-6 space-y-1">
                          {cause.subCauses.map((sc) => (
                            <div key={sc.id} className="flex items-center gap-1.5">
                              <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                              <input
                                className="flex-1 border border-border rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-brand-navy bg-muted/40"
                                placeholder="하위 원인"
                                value={sc.text}
                                onChange={(e) =>
                                  updateSub(catIdx, cause.id, sc.id, e.target.value)
                                }
                              />
                              <button
                                onClick={() => removeSub(catIdx, cause.id, sc.id)}
                                className="text-muted-foreground hover:text-destructive shrink-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={() => addCause(catIdx)}
                    className="text-xs text-brand-orange hover:text-brand-orange-hover flex items-center gap-1 mt-1"
                  >
                    <Plus className="h-3 w-3" /> 원인 추가
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            SVG 미리보기: 원인(회색 실선) · 하위 원인(회색 점선으로 수직 분기)
          </p>
        </div>
      }
    />
  );
}
