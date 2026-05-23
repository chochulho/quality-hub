"use client";

import { useState } from "react";
import { Plus, Trash2, Download } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import ToolShell from "../ToolShell";
import { computeCPM, type CPMTask } from "@/lib/qc7/statistics";
import { exportArrowDiagram } from "@/lib/qc7/excelExporter";

let taskSeq = 1;
interface TaskInput extends CPMTask { uid: number }
const mkTask = (): TaskInput => ({
  uid: taskSeq++,
  id: String.fromCharCode(64 + taskSeq),
  name: "",
  duration: 1,
  predecessors: [],
});

export default function ArrowDiagram() {
  const [tasks, setTasks] = useState<TaskInput[]>([
    { uid: taskSeq++, id: "A", name: "요구사항 분석", duration: 5, predecessors: [] },
    { uid: taskSeq++, id: "B", name: "설계", duration: 10, predecessors: ["A"] },
    { uid: taskSeq++, id: "C", name: "시제품 제작", duration: 7, predecessors: ["B"] },
    { uid: taskSeq++, id: "D", name: "검증 시험", duration: 5, predecessors: ["C"] },
    { uid: taskSeq++, id: "E", name: "양산 준비", duration: 3, predecessors: ["B"] },
    { uid: taskSeq++, id: "F", name: "최종 승인", duration: 2, predecessors: ["D", "E"] },
  ]);
  const [downloading, setDownloading] = useState(false);

  const addTask = () => {
    const newTask = mkTask();
    newTask.id = String(tasks.length + 1);
    setTasks((prev) => [...prev, newTask]);
  };

  const removeTask = (uid: number) => setTasks((prev) => prev.filter((t) => t.uid !== uid));

  const update = (uid: number, field: string, value: string | number | string[]) =>
    setTasks((prev) => prev.map((t) => (t.uid === uid ? { ...t, [field]: value } : t)));

  let results: ReturnType<typeof computeCPM> = [];
  let error = "";
  try {
    results = computeCPM(tasks.filter((t) => t.name.trim()));
  } catch (e) {
    error = "순환 의존성이 있거나 선행 작업 ID를 확인해 주세요.";
  }

  const maxEF = results.length ? Math.max(...results.map((r) => r.ef)) : 0;

  const ganttData = results.map((r) => ({
    name: r.name,
    start: r.es,
    duration: r.duration,
    float: r.float,
    isCritical: r.isCritical,
  }));

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await exportArrowDiagram(results);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ToolShell
      title="애로우 다이어그램 (Arrow Diagram / CPM)"
      badge="신 QC 7가지 도구 ⑦"
      description="작업별 선후관계와 기간을 입력하면 CPM(임계 경로법)으로 전체 공기와 임계 경로를 자동 계산합니다."
      downloadButton={
        <button
          onClick={handleDownload}
          disabled={downloading || results.length === 0}
          className="inline-flex items-center gap-1.5 bg-brand-navy text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-brand-navy-dark disabled:opacity-40 transition-all"
        >
          <Download className="h-4 w-4" />
          {downloading ? "처리 중..." : "Excel 다운로드"}
        </button>
      }
      practice={
        <div className="space-y-4">
          {/* Task table */}
          <div className="overflow-x-auto border border-border rounded-2xl">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="bg-muted text-xs font-semibold text-muted-foreground">
                  <th className="text-left px-3 py-2.5 w-12">ID</th>
                  <th className="text-left px-3 py-2.5">작업명</th>
                  <th className="text-center px-3 py-2.5 w-20">기간(일)</th>
                  <th className="text-left px-3 py-2.5 w-40">선행 작업 ID (쉼표 구분)</th>
                  <th className="w-8 px-2 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.uid} className="border-t border-border">
                    <td className="px-3 py-2">
                      <input
                        className="w-10 border border-border rounded-lg px-2 py-1 text-xs font-mono text-center focus:outline-none focus:border-brand-navy"
                        value={task.id}
                        onChange={(e) => update(task.uid, "id", e.target.value.toUpperCase())}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        className="w-full border border-border rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:border-brand-navy"
                        placeholder="작업명"
                        value={task.name}
                        onChange={(e) => update(task.uid, "name", e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="1"
                        className="w-full border border-border rounded-lg px-2.5 py-1.5 text-sm text-center focus:outline-none focus:border-brand-navy"
                        value={task.duration}
                        onChange={(e) => update(task.uid, "duration", Math.max(1, parseInt(e.target.value) || 1))}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        className="w-full border border-border rounded-lg px-2.5 py-1.5 text-sm font-mono focus:outline-none focus:border-brand-navy"
                        placeholder="A, B"
                        value={task.predecessors.join(", ")}
                        onChange={(e) =>
                          update(task.uid, "predecessors", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))
                        }
                      />
                    </td>
                    <td className="px-2 py-2">
                      <button onClick={() => removeTask(task.uid)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={addTask}
            className="inline-flex items-center gap-1 text-sm text-brand-navy border border-border rounded-full px-4 py-2 hover:border-brand-navy transition-all"
          >
            <Plus className="h-4 w-4" /> 작업 추가
          </button>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {results.length > 0 && (
            <>
              {/* Summary */}
              <div className="flex flex-wrap gap-3">
                <div className="bg-muted rounded-xl px-4 py-3">
                  <p className="text-xs text-muted-foreground">전체 공기</p>
                  <p className="text-2xl font-extrabold text-brand-navy">{maxEF}일</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-xs text-red-700">임계 경로 (★)</p>
                  <p className="text-sm font-bold text-red-700">
                    {results.filter((r) => r.isCritical).map((r) => r.name).join(" → ")}
                  </p>
                </div>
              </div>

              {/* Gantt chart */}
              <div className="bg-white border border-border rounded-2xl p-4">
                <p className="text-xs font-semibold text-muted-foreground mb-3">간트 차트 (빨강: 임계 경로)</p>
                <ResponsiveContainer width="100%" height={results.length * 36 + 40}>
                  <BarChart
                    layout="vertical"
                    data={ganttData}
                    margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
                    barSize={18}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DC" horizontal={false} />
                    <XAxis type="number" domain={[0, maxEF]} tick={{ fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(value, name) => [
                        name === "start" ? `시작일: ${value}` : `기간: ${value}일`,
                        "",
                      ]}
                    />
                    <Bar dataKey="start" fill="transparent" stackId="a" />
                    <Bar dataKey="duration" stackId="a" radius={[2, 2, 2, 2]}>
                      {ganttData.map((entry, i) => (
                        <Cell key={i} fill={entry.isCritical ? "#DC2626" : "#2B4B8C"} fillOpacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* CPM table */}
              <div className="overflow-x-auto border border-border rounded-2xl">
                <table className="w-full text-sm min-w-[560px]">
                  <thead>
                    <tr className="bg-muted text-xs font-semibold text-muted-foreground">
                      <th className="text-left px-3 py-2.5">작업명</th>
                      <th className="text-center px-3 py-2.5">ES</th>
                      <th className="text-center px-3 py-2.5">EF</th>
                      <th className="text-center px-3 py-2.5">LS</th>
                      <th className="text-center px-3 py-2.5">LF</th>
                      <th className="text-center px-3 py-2.5">여유</th>
                      <th className="text-center px-3 py-2.5">임계</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r) => (
                      <tr key={r.id} className={`border-t border-border ${r.isCritical ? "bg-red-50" : ""}`}>
                        <td className={`px-3 py-2 font-medium ${r.isCritical ? "text-red-700" : ""}`}>{r.name}</td>
                        <td className="px-3 py-2 text-center">{r.es}</td>
                        <td className="px-3 py-2 text-center">{r.ef}</td>
                        <td className="px-3 py-2 text-center">{r.ls}</td>
                        <td className="px-3 py-2 text-center">{r.lf}</td>
                        <td className="px-3 py-2 text-center">{r.float}</td>
                        <td className="px-3 py-2 text-center">{r.isCritical ? "★" : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      }
    />
  );
}
