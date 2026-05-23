"use client";

import { useState } from "react";
import { Download, RotateCcw, Lightbulb } from "lucide-react";
import { HOQMatrix, type QFDPhase } from "./HOQMatrix";
import { PhaseTransfer } from "./PhaseTransfer";
import { exportQFD } from "@/lib/qfd/qfdExporter";

const PHASE_LABELS = ["Phase 1: 제품 계획", "Phase 2: 부품 전개", "Phase 3: 공정 계획"];
const EXCEL_PHASE_LABELS = ["Phase 1 제품 계획", "Phase 2 부품 전개", "Phase 3 공정 계획"];
const PHASE_SHORT = ["Phase 1", "Phase 2", "Phase 3"];
const PHASE_DESC = [
  "VOC → 제품 특성",
  "제품 특성 → 부품 특성",
  "부품 특성 → 공정 매개변수",
];

function emptyPhase(): QFDPhase {
  return { whats: [], hows: [], body: {}, roof: {} };
}

const INITIAL_STATE: [QFDPhase, QFDPhase, QFDPhase] = [
  emptyPhase(),
  emptyPhase(),
  emptyPhase(),
];

// ── Sample data: 휴대용 산업 측정기기 신제품 개발 ──────────────────────────────
function makeSamplePhase1(): QFDPhase {
  const W = {
    w1: "장기간 사용",
    w2: "가볍게 휴대",
    w3: "조용한 작동",
    w4: "빠른 측정",
  };
  const H = {
    h1: "내구성",
    h2: "경량화",
    h3: "방수 등급",
    h4: "저소음 설계",
    h5: "측정 속도",
  };
  return {
    whats: [
      { id: "w1", label: W.w1, importance: 5 },
      { id: "w2", label: W.w2, importance: 4 },
      { id: "w3", label: W.w3, importance: 3 },
      { id: "w4", label: W.w4, importance: 4 },
    ],
    hows: [
      { id: "h1", label: H.h1, target: "내충격 1.5m" },
      { id: "h2", label: H.h2, target: "≤ 500g" },
      { id: "h3", label: H.h3, target: "IP67" },
      { id: "h4", label: H.h4, target: "≤ 40dB" },
      { id: "h5", label: H.h5, target: "≤ 2초" },
    ],
    body: {
      w1: { h1: "◎", h2: "○",  h3: "◎",  h4: "△",  h5: "" },
      w2: { h1: "△",  h2: "◎", h3: "○",  h4: "○",  h5: "△" },
      w3: { h1: "○",  h2: "△",  h3: "",   h4: "◎",  h5: "" },
      w4: { h1: "",   h2: "○",  h3: "",   h4: "",   h5: "◎" },
    },
    roof: {
      h1: { h2: "-",  h3: "++", h4: "+",  h5: "" },
      h2: { h3: "-",  h4: "+",  h5: "+" },
      h3: { h4: "",   h5: "" },
      h4: { h5: "-" },
    },
  };
}

function makeSamplePhase2(): QFDPhase {
  const W = {
    w1: "내구성",
    w2: "경량화",
    w3: "방수 등급",
    w4: "저소음 설계",
    w5: "측정 속도",
  };
  const H = {
    h1: "케이스 두께",
    h2: "소재 밀도",
    h3: "O링 압축률",
    h4: "댐퍼 경도",
  };
  return {
    whats: [
      { id: "w1", label: W.w1, importance: 5 },
      { id: "w2", label: W.w2, importance: 4 },
      { id: "w3", label: W.w3, importance: 4 },
      { id: "w4", label: W.w4, importance: 3 },
      { id: "w5", label: W.w5, importance: 4 },
    ],
    hows: [
      { id: "h1", label: H.h1, target: "2.5mm" },
      { id: "h2", label: H.h2, target: "2.7g/㎤" },
      { id: "h3", label: H.h3, target: "20~30%" },
      { id: "h4", label: H.h4, target: "Shore A 40" },
    ],
    body: {
      w1: { h1: "◎", h2: "○",  h3: "△",  h4: "" },
      w2: { h1: "○",  h2: "◎", h3: "",   h4: "" },
      w3: { h1: "△",  h2: "",   h3: "◎", h4: "" },
      w4: { h1: "",   h2: "",   h3: "",   h4: "◎" },
      w5: { h1: "△",  h2: "○",  h3: "",   h4: "" },
    },
    roof: {
      h1: { h2: "+", h3: "++", h4: "" },
      h2: { h3: "",  h4: "" },
      h3: { h4: "" },
    },
  };
}

export function QFDViewer() {
  const [phases, setPhases] = useState<[QFDPhase, QFDPhase, QFDPhase]>(INITIAL_STATE);
  const [activePhase, setActivePhase] = useState<0 | 1 | 2>(0);
  const [exporting, setExporting] = useState(false);

  function updatePhase(idx: number, next: QFDPhase) {
    const updated = [...phases] as [QFDPhase, QFDPhase, QFDPhase];
    updated[idx] = next;
    setPhases(updated);
  }

  function handleTransfer(fromIdx: number) {
    const toIdx = fromIdx + 1;
    const fromPhase = phases[fromIdx];
    const newWhats = fromPhase.hows
      .filter((h) => h.label.trim())
      .map((h) => ({
        id: Math.random().toString(36).slice(2, 9),
        label: h.label,
        importance: 3,
      }));
    const updated = [...phases] as [QFDPhase, QFDPhase, QFDPhase];
    updated[toIdx] = { ...updated[toIdx], whats: newWhats };
    setPhases(updated);
    setActivePhase(toIdx as 0 | 1 | 2);
  }

  async function handleExport() {
    setExporting(true);
    try {
      await exportQFD(phases, EXCEL_PHASE_LABELS);
    } finally {
      setExporting(false);
    }
  }

  function handleReset() {
    if (window.confirm("모든 입력 내용을 초기화하시겠습니까?")) {
      setPhases([emptyPhase(), emptyPhase(), emptyPhase()] as [QFDPhase, QFDPhase, QFDPhase]);
      setActivePhase(0);
    }
  }

  function handleLoadSample() {
    const hasData = phases.some((p) => p.whats.length > 0 || p.hows.length > 0);
    if (hasData && !window.confirm("현재 입력 내용이 삭제됩니다. 예시를 불러올까요?")) return;
    setPhases([makeSamplePhase1(), makeSamplePhase2(), emptyPhase()] as [QFDPhase, QFDPhase, QFDPhase]);
    setActivePhase(0);
  }

  const phaseHasData = (idx: number) =>
    phases[idx].whats.length > 0 || phases[idx].hows.length > 0;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Phase tabs */}
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActivePhase(idx as 0 | 1 | 2)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
                activePhase === idx
                  ? "bg-white text-brand-navy shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="hidden sm:inline">{PHASE_SHORT[idx]}</span>
              <span className="sm:hidden">P{idx + 1}</span>
              {phaseHasData(idx) && (
                <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-brand-orange inline-block" />
              )}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleLoadSample}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-brand-navy border border-brand-navy/30 rounded-xl hover:bg-brand-navy hover:text-white transition-colors"
          >
            <Lightbulb className="h-3.5 w-3.5" />
            예시 불러오기
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground border border-border rounded-xl hover:border-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            초기화
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting || (!phaseHasData(0) && !phaseHasData(1) && !phaseHasData(2))}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold bg-brand-orange text-white rounded-xl hover:bg-brand-orange-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            {exporting ? "다운로드 중..." : "Excel 다운로드"}
          </button>
        </div>
      </div>

      {/* Phase description */}
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold text-brand-navy">{PHASE_LABELS[activePhase]}</span>
        <span className="text-muted-foreground">— {PHASE_DESC[activePhase]}</span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="font-semibold">관계:</span>
        {[["◎", "강(9)", "bg-brand-navy text-white"], ["○", "중(3)", "bg-blue-300 text-white"], ["△", "약(1)", "bg-blue-100 text-brand-navy"]].map(([sym, label, cls]) => (
          <span key={sym} className="flex items-center gap-1">
            <span className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold ${cls}`}>{sym}</span>
            {label}
          </span>
        ))}
        <span className="ml-2 font-semibold">지붕:</span>
        {[["++", "강+", "bg-green-500 text-white"], ["+", "약+", "bg-green-200 text-green-900"], ["-", "약−", "bg-red-100 text-red-700"], ["--", "강−", "bg-red-400 text-white"]].map(([sym, label, cls]) => (
          <span key={sym} className="flex items-center gap-1">
            <span className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold ${cls}`}>{sym}</span>
            {label}
          </span>
        ))}
      </div>

      {/* Phase Transfer (show between phases) */}
      {activePhase > 0 && phases[activePhase - 1].hows.some((h) => h.label.trim()) && (
        <PhaseTransfer
          fromPhase={phases[activePhase - 1]}
          fromLabel={PHASE_SHORT[activePhase - 1]}
          toLabel={PHASE_SHORT[activePhase]}
          onTransfer={(newWhats) => {
            const updated = [...phases] as [QFDPhase, QFDPhase, QFDPhase];
            updated[activePhase] = { ...updated[activePhase], whats: newWhats };
            setPhases(updated);
          }}
        />
      )}

      {/* HOQ Matrix */}
      <div className="border border-border rounded-2xl p-4 overflow-hidden">
        <HOQMatrix
          phase={phases[activePhase]}
          onChange={(next) => updatePhase(activePhase, next)}
        />
        {phases[activePhase].whats.length === 0 && phases[activePhase].hows.length === 0 && (
          <div className="text-center py-10 text-muted-foreground text-sm space-y-2">
            <p className="font-medium text-base text-foreground">아직 입력된 내용이 없습니다.</p>
            <p>
              처음 사용하신다면{" "}
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-brand-navy font-semibold underline underline-offset-2 hover:text-brand-orange transition-colors"
              >
                예시 불러오기
              </button>
              를 눌러 완성된 매트릭스를 확인해 보세요.
            </p>
            <p className="text-xs">
              또는 위 매트릭스의 <strong>요구사항 추가</strong>로 WHATs를, 헤더의 <strong>＋</strong>로 HOWs를 직접 입력하세요.
            </p>
          </div>
        )}
      </div>

      {/* Quick guide */}
      <details className="text-xs text-muted-foreground border border-border rounded-xl">
        <summary className="px-4 py-2.5 cursor-pointer font-semibold hover:bg-muted/50 rounded-xl">
          입력 방법 안내
        </summary>
        <div className="px-4 pb-4 pt-2 grid sm:grid-cols-2 gap-x-6 gap-y-2">
          <div>
            <p className="font-semibold text-foreground mb-1">관계 매트릭스 (본체)</p>
            <p>셀을 클릭하면 강도가 순환됩니다: <strong>빈칸 → ◎ → ○ → △ → 빈칸</strong></p>
          </div>
          <div>
            <p className="font-semibold text-foreground mb-1">지붕 상관 (Roof)</p>
            <p>HOW 헤더 위 셀을 클릭: <strong>빈칸 → ++ → + → - → -- → 빈칸</strong></p>
          </div>
          <div>
            <p className="font-semibold text-foreground mb-1">가중 점수</p>
            <p>Σ(중요도 × 강도점수)가 자동 계산됩니다. 점수가 높을수록 우선순위 ↑</p>
          </div>
          <div>
            <p className="font-semibold text-foreground mb-1">Phase 전환</p>
            <p>Phase 1 입력 후 Phase 2 탭으로 이동하면 HOWs를 자동으로 가져올 수 있습니다.</p>
          </div>
        </div>
      </details>
    </div>
  );
}
