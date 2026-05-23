"use client";

import { useState, useMemo, useCallback } from "react";
import { Plus, Trash2, Download, RefreshCw } from "lucide-react";
import {
  exportSkillMatrix,
  type SkillLevel,
  type Process,
  type Person,
  type Skills,
} from "@/lib/skill-matrix/excelExporter";

// ─── 상수 ────────────────────────────────────────────────────────────────────

const LEVELS: { value: SkillLevel; label: string }[] = [
  { value: 0, label: "없음" },
  { value: 1, label: "교육중" },
  { value: 2, label: "보조" },
  { value: 3, label: "단독" },
  { value: 4, label: "지도가능" },
];

// ─── 스킬 아이콘 (파이 차트형 SVG) ──────────────────────────────────────────

const FILL_COLOR = "#F26B3A"; // brand-orange
const RING_COLOR = "#2B4B8C"; // brand-navy

/* 중심(cx,cy)=16, 반지름 r=13, 상단(16,3)에서 시계방향 */
const PIE_PATHS: Record<SkillLevel, string> = {
  0: "",
  // 25% — 상단→오른쪽 (90°)
  1: "M 16 16 L 16 3 A 13 13 0 0 1 29 16 Z",
  // 50% — 상단→오른쪽→하단 (180°)
  2: "M 16 16 L 16 3 A 13 13 0 0 1 29 16 A 13 13 0 0 1 16 29 Z",
  // 75% — 상단→왼쪽 (270°, large-arc=1)
  3: "M 16 16 L 16 3 A 13 13 0 1 1 3 16 Z",
  4: "",
};

function SkillIcon({ level, size = 36 }: { level: SkillLevel; size?: number }) {
  const scale = size / 32;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      style={{ transform: `scale(${scale})`, transformOrigin: "center" }}
    >
      {/* 배경 원 */}
      <circle cx="16" cy="16" r="13" fill="#FFFFFF" stroke="#E8E4DC" strokeWidth="1.5" />

      {/* 채움 */}
      {level === 4 ? (
        <circle cx="16" cy="16" r="13" fill={FILL_COLOR} />
      ) : level > 0 ? (
        <path d={PIE_PATHS[level]} fill={FILL_COLOR} />
      ) : null}

      {/* 외곽 링 */}
      <circle cx="16" cy="16" r="13" fill="none" stroke={RING_COLOR} strokeWidth="1.5" strokeOpacity="0.25" />

      {/* 레벨 4: 중앙 별 */}
      {level === 4 && (
        <text
          x="16" y="20"
          textAnchor="middle"
          fontSize="11"
          fontWeight="bold"
          fill="#FFFFFF"
          fontFamily="system-ui"
        >
          ★
        </text>
      )}
    </svg>
  );
}

// ─── 샘플 데이터 ─────────────────────────────────────────────────────────────

const SAMPLE: { processes: Process[]; personnel: Person[]; skills: Skills } = {
  processes: [
    { id: "p1", name: "원자재\n입고검사", target: 3 },
    { id: "p2", name: "프레스\n작업", target: 2 },
    { id: "p3", name: "용접", target: 2 },
    { id: "p4", name: "조립", target: 3 },
    { id: "p5", name: "외관\n검사", target: 3 },
    { id: "p6", name: "포장\n출하", target: 2 },
  ],
  personnel: [
    { id: "w1", name: "김철수", target: 3 },
    { id: "w2", name: "이영희", target: 3 },
    { id: "w3", name: "박민준", target: 2 },
    { id: "w4", name: "최지원", target: 4 },
    { id: "w5", name: "정승호", target: 2 },
  ],
  skills: {
    w1: { p1: 4, p2: 3, p3: 1, p4: 3, p5: 2, p6: 0 },
    w2: { p1: 3, p2: 0, p3: 0, p4: 4, p5: 3, p6: 3 },
    w3: { p1: 0, p2: 4, p3: 3, p4: 2, p5: 0, p6: 0 },
    w4: { p1: 2, p2: 3, p3: 4, p4: 3, p5: 4, p6: 4 },
    w5: { p1: 0, p2: 2, p3: 3, p4: 0, p5: 0, p6: 3 },
  },
};

let nextId = 100;
const uid = () => `id${nextId++}`;

// ─── 헬퍼 ────────────────────────────────────────────────────────────────────

function qualifiedCount(skills: Skills, personId: string, processes: Process[]) {
  return processes.filter((p) => (skills[personId]?.[p.id] ?? 0) >= 3).length;
}

function processQualifiedCount(skills: Skills, processId: string, personnel: Person[]) {
  return personnel.filter((w) => (skills[w.id]?.[processId] ?? 0) >= 3).length;
}

// ─── 컴포넌트 ────────────────────────────────────────────────────────────────

export default function SkillMatrixTool() {
  const [processes, setProcesses] = useState<Process[]>(SAMPLE.processes);
  const [personnel, setPersonnel] = useState<Person[]>(SAMPLE.personnel);
  const [skills, setSkills] = useState<Skills>(SAMPLE.skills);
  const [matrixTitle, setMatrixTitle] = useState("다기능도 (Skill Matrix)");
  const [exporting, setExporting] = useState(false);

  // ── 셀 클릭: 레벨 순환 ──────────────────────────────────────────────────

  const cycleSkill = useCallback(
    (personId: string, processId: string) => {
      setSkills((prev) => {
        const cur = (prev[personId]?.[processId] ?? 0) as SkillLevel;
        const next = ((cur + 1) % 5) as SkillLevel;
        return {
          ...prev,
          [personId]: { ...prev[personId], [processId]: next },
        };
      });
    },
    []
  );

  // ── 공정 추가/삭제 ──────────────────────────────────────────────────────

  const addProcess = useCallback(() => {
    const id = uid();
    setProcesses((prev) => [...prev, { id, name: "공정명", target: 2 }]);
  }, []);

  const removeProcess = useCallback((id: string) => {
    setProcesses((prev) => prev.filter((p) => p.id !== id));
    setSkills((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((wId) => {
        const copy = { ...next[wId] };
        delete copy[id];
        next[wId] = copy;
      });
      return next;
    });
  }, []);

  const updateProcess = useCallback(
    (id: string, field: "name" | "target", value: string | number) => {
      setProcesses((prev) =>
        prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
      );
    },
    []
  );

  // ── 인원 추가/삭제 ──────────────────────────────────────────────────────

  const addPerson = useCallback(() => {
    const id = uid();
    setPersonnel((prev) => [...prev, { id, name: "이름", target: 2 }]);
    setSkills((prev) => ({ ...prev, [id]: {} }));
  }, []);

  const removePerson = useCallback((id: string) => {
    setPersonnel((prev) => prev.filter((w) => w.id !== id));
    setSkills((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const updatePerson = useCallback(
    (id: string, field: "name" | "target", value: string | number) => {
      setPersonnel((prev) =>
        prev.map((w) => (w.id === id ? { ...w, [field]: value } : w))
      );
    },
    []
  );

  // ── 요약 계산 ──────────────────────────────────────────────────────────

  const personSummary = useMemo(
    () =>
      personnel.map((w) => ({
        id: w.id,
        current: qualifiedCount(skills, w.id, processes),
        target: w.target,
      })),
    [personnel, processes, skills]
  );

  const processSummary = useMemo(
    () =>
      processes.map((p) => ({
        id: p.id,
        current: processQualifiedCount(skills, p.id, personnel),
        target: p.target,
      })),
    [processes, personnel, skills]
  );

  // ── 초기화 ──────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    setProcesses(SAMPLE.processes);
    setPersonnel(SAMPLE.personnel);
    setSkills(SAMPLE.skills);
    setMatrixTitle("다기능도 (Skill Matrix)");
  }, []);

  // ── 엑셀 다운로드 ──────────────────────────────────────────────────────

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      await exportSkillMatrix(processes, personnel, skills, matrixTitle);
    } finally {
      setExporting(false);
    }
  }, [processes, personnel, skills, matrixTitle]);

  // ─── 렌더 ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* 상단 컨트롤 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <input
          value={matrixTitle}
          onChange={(e) => setMatrixTitle(e.target.value)}
          className="flex-1 text-lg font-bold text-brand-navy border-b border-border bg-transparent focus:outline-none focus:border-brand-orange px-1 py-0.5"
        />
        <div className="flex gap-2 shrink-0">
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground border border-border rounded-xl hover:bg-muted transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            샘플 데이터
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-brand-orange text-white rounded-xl hover:bg-brand-orange-hover transition-colors disabled:opacity-60"
          >
            <Download className="h-3.5 w-3.5" />
            {exporting ? "생성 중..." : "Excel 다운로드"}
          </button>
        </div>
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap items-center gap-3">
        {LEVELS.map((lv) => (
          <div key={lv.value} className="flex items-center gap-1.5">
            <SkillIcon level={lv.value} size={28} />
            <span className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{lv.value}</span>
              {" "}
              {lv.label}
            </span>
          </div>
        ))}
        <span className="text-xs text-muted-foreground border-l border-border pl-3 ml-1">
          셀 클릭 → 레벨 변경
        </span>
      </div>

      {/* 매트릭스 테이블 */}
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-sm border-collapse">
          <thead>
            {/* 헤더 행 1: 공정명 */}
            <tr>
              <th
                className="bg-brand-navy text-white text-left px-3 py-2 font-semibold text-xs w-28 min-w-[7rem] sticky left-0 z-10"
                rowSpan={2}
              >
                성명
              </th>
              <th
                className="bg-brand-navy text-white text-center px-2 py-1 font-semibold text-xs w-20 min-w-[5rem]"
                rowSpan={2}
              >
                인원별<br />목표
              </th>
              {processes.map((p) => (
                <th
                  key={p.id}
                  className="bg-brand-navy text-white text-center px-1 py-1 font-semibold text-xs min-w-[6rem] relative group"
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <input
                      value={p.name.replace(/\n/g, " ")}
                      onChange={(e) => updateProcess(p.id, "name", e.target.value)}
                      className="w-full bg-transparent text-white text-center text-xs focus:outline-none focus:bg-white/10 rounded px-1"
                    />
                    <button
                      onClick={() => removeProcess(p.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-red-300"
                      title="공정 삭제"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </th>
              ))}
              <th className="bg-brand-navy text-white text-center px-2 py-2 font-semibold text-xs min-w-[5rem]">
                인원별<br />현황
              </th>
              <th className="bg-brand-navy/80 px-1 py-2 w-8">
                <button
                  onClick={addProcess}
                  className="flex items-center justify-center w-6 h-6 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors mx-auto"
                  title="공정 추가"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </th>
            </tr>
            {/* 헤더 행 2: 공정별 목표 */}
            <tr>
              {processes.map((p) => (
                <td key={p.id} className="bg-brand-orange/10 text-center px-1 py-1 border-t border-border">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-muted-foreground">목표</span>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={p.target}
                      onChange={(e) =>
                        updateProcess(p.id, "target", Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-10 text-center text-xs font-bold text-brand-navy bg-transparent focus:outline-none focus:bg-brand-orange/10 rounded"
                    />
                  </div>
                </td>
              ))}
              <td className="bg-brand-orange/10 border-t border-border" />
              <td className="bg-brand-navy/80 border-t border-border" />
            </tr>
          </thead>

          <tbody>
            {personnel.map((person, rowIdx) => {
              const summary = personSummary[rowIdx];
              const met = summary.current >= summary.target;
              return (
                <tr key={person.id} className="group/row hover:bg-muted/30 transition-colors">
                  {/* 성명 */}
                  <td className="bg-muted/50 px-2 py-1.5 border-b border-border sticky left-0 z-10">
                    <div className="flex items-center gap-1">
                      <input
                        value={person.name}
                        onChange={(e) => updatePerson(person.id, "name", e.target.value)}
                        className="flex-1 text-xs font-medium text-foreground bg-transparent focus:outline-none focus:bg-white rounded px-1"
                      />
                      <button
                        onClick={() => removePerson(person.id)}
                        className="opacity-0 group-hover/row:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                  {/* 인원별 목표 */}
                  <td className="bg-muted/30 text-center px-1 py-1.5 border-b border-l border-border">
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={person.target}
                      onChange={(e) =>
                        updatePerson(person.id, "target", Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-10 text-center text-xs font-bold text-brand-navy bg-transparent focus:outline-none focus:bg-brand-orange/10 rounded"
                    />
                  </td>
                  {/* 스킬 셀 */}
                  {processes.map((proc) => {
                    const lv = (skills[person.id]?.[proc.id] ?? 0) as SkillLevel;
                    const label = LEVELS[lv].label;
                    return (
                      <td
                        key={proc.id}
                        className="text-center px-1 py-2 border-b border-l border-border cursor-pointer select-none hover:bg-muted/40 transition-colors"
                        onClick={() => cycleSkill(person.id, proc.id)}
                        title={`${label} → 클릭하여 변경`}
                      >
                        <div className="flex flex-col items-center gap-0.5">
                          <SkillIcon level={lv} size={32} />
                          <span className="text-[10px] text-muted-foreground leading-none">
                            {label}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                  {/* 인원별 현황 */}
                  <td className={`text-center px-2 py-1.5 border-b border-l border-border font-bold text-xs ${met ? "text-green-700 bg-green-50" : "text-red-600 bg-red-50"}`}>
                    {summary.current} / {summary.target}
                    <span className="ml-1">{met ? "✓" : "✗"}</span>
                  </td>
                  <td className="border-b border-l border-border bg-muted/20" />
                </tr>
              );
            })}

            {/* 인원 추가 행 */}
            <tr>
              <td colSpan={processes.length + 4} className="px-3 py-1.5 border-b border-border bg-muted/20">
                <button
                  onClick={addPerson}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-brand-orange transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  인원 추가
                </button>
              </td>
            </tr>

            {/* 공정별 현황 */}
            <tr className="bg-brand-orange/5">
              <td className="px-3 py-2 text-xs font-bold text-brand-orange border-t-2 border-brand-orange/20 sticky left-0 bg-brand-orange/5">
                공정별 현황
              </td>
              <td className="border-t-2 border-brand-orange/20 border-l border-border" />
              {processSummary.map((ps) => (
                <td
                  key={ps.id}
                  className="text-center px-1 py-2 text-xs font-bold text-brand-navy border-t-2 border-brand-orange/20 border-l border-border"
                >
                  {ps.current}명
                </td>
              ))}
              <td className="border-t-2 border-brand-orange/20 border-l border-border" />
              <td className="border-t-2 border-brand-orange/20 border-l border-border" />
            </tr>

            {/* 목표 대비 */}
            <tr>
              <td className="px-3 py-2 text-xs font-bold text-foreground border-b border-border sticky left-0 bg-white">
                목표 대비
              </td>
              <td className="border-b border-l border-border bg-muted/20" />
              {processSummary.map((ps) => {
                const met = ps.current >= ps.target;
                return (
                  <td
                    key={ps.id}
                    className={`text-center px-1 py-2 text-xs font-bold border-b border-l border-border ${met ? "text-green-700 bg-green-50" : "text-red-600 bg-red-50"}`}
                  >
                    {met ? "✓ 충족" : `✗ ${ps.current - ps.target}명`}
                  </td>
                );
              })}
              <td className="border-b border-l border-border bg-muted/20" />
              <td className="border-b border-l border-border bg-muted/20" />
            </tr>
          </tbody>
        </table>
      </div>

      {/* 하단 안내 */}
      <div className="rounded-2xl border border-border bg-background-soft p-4 text-xs text-muted-foreground space-y-1">
        <p><strong className="text-foreground">셀 클릭</strong> → 스킬 레벨 순환 (없음 → 교육중 → 보조 → 단독 → 지도가능 → 없음)</p>
        <p><strong className="text-foreground">공정명·성명</strong> → 클릭 후 직접 수정 가능</p>
        <p><strong className="text-foreground">목표 숫자</strong> → 클릭 후 직접 수정 가능</p>
        <p><strong className="text-foreground">인원별 현황</strong>: 레벨 3(단독) 이상인 공정 수 / 인원별 목표</p>
        <p><strong className="text-foreground">공정별 현황</strong>: 레벨 3 이상인 인원 수 / 공정별 목표</p>
      </div>
    </div>
  );
}
