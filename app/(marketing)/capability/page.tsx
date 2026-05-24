import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import SpcAnalyzer from "@/components/spc/SpcAnalyzer";

export const metadata: Metadata = {
  title: "공정능력 분석기 (Cp/Cpk)",
  description:
    "Cp, Cpk, Pp, Ppk 공정능력 지수를 미니텝(Minitab) 스타일로 분석합니다. Excel 붙여넣기, 일괄 분석, PDF·Excel 내보내기 지원.",
};

export default function CapabilityPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-brand-orange/10 rounded-xl p-2">
            <BarChart3 className="h-6 w-6 text-brand-orange" />
          </div>
          <span className="text-sm font-medium text-brand-orange">공정능력 분석기</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-brand-navy mb-3">
          공정능력 분석 (Cp/Cpk)
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          규격값(LSL/Target/USL)과 측정 데이터를 입력하면 미니텝(Minitab) 스타일의
          공정능력 분석 결과를 즉시 확인할 수 있습니다.
          <br />
          비싼 미니텝 구독 없이도 Cp, Cpk, PPM 분석과 Excel·PDF 내보내기를 무료로 사용하세요.
        </p>

        {/* Feature badges */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            "Excel 붙여넣기",
            "히스토그램 + 정규곡선",
            "Cp/Cpk/Pp/Ppk",
            "PPM 분석",
            "일괄 분석",
            "Excel 내보내기",
            "PDF 저장",
          ].map((f) => (
            <span
              key={f}
              className="text-xs bg-muted text-muted-foreground rounded-full px-3 py-1"
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Main tool */}
      <SpcAnalyzer />

      {/* Info section */}
      <div className="mt-16 pt-8 border-t border-border">
        <h2 className="text-lg font-bold text-brand-navy mb-4">공정능력 지수 해석 기준</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { range: "Cpk ≥ 1.67", label: "우수", desc: "IATF 신규 공정 기준 충족", color: "border-green-300 bg-green-50 text-green-800" },
            { range: "Cpk ≥ 1.33", label: "합격", desc: "일반 양산 기준 충족", color: "border-blue-300 bg-blue-50 text-blue-800" },
            { range: "Cpk ≥ 1.00", label: "주의", desc: "조건부 합격 — 개선 필요", color: "border-yellow-300 bg-yellow-50 text-yellow-800" },
            { range: "Cpk < 1.00", label: "불합격", desc: "즉시 공정 개선 필요", color: "border-red-300 bg-red-50 text-red-800" },
          ].map((item) => (
            <div key={item.range} className={`border rounded-xl p-3 ${item.color}`}>
              <p className="text-sm font-bold font-mono">{item.range}</p>
              <p className="text-base font-extrabold mt-1">{item.label}</p>
              <p className="text-xs mt-1 opacity-80">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-background-soft border border-border rounded-xl p-4 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground mb-1">계산 방식 안내</p>
          <ul className="space-y-1 text-xs">
            <li>• <strong>Cp/Cpk</strong>: 표본 표준편차(ddof=1) 사용. 미니텝의 <em>Within</em> 추정과 근사 동일 (v1)</li>
            <li>• <strong>Pp/Ppk</strong>: v1에서는 Cp/Cpk와 동일 계산 (Moving Range 방식은 향후 지원 예정)</li>
            <li>• <strong>PPM</strong>: 정규분포 가정 기반 추정값. Abramowitz & Stegun 근사 사용</li>
            <li>• <strong>Cpm</strong>: Target 입력 시만 계산됨 (Taguchi 공정능력지수)</li>
          </ul>
        </div>
      </div>

      {/* ── Cp vs Cpk 진단 가이드 ── */}
      <div className="mt-12 pt-8 border-t border-border">
        <h2 className="text-lg font-bold text-brand-navy mb-1">Cp가 낮을 때 vs Cpk가 낮을 때</h2>
        <p className="text-sm text-muted-foreground mb-6">
          두 지수의 차이를 이해하면 공정 문제의 원인을 빠르게 진단할 수 있습니다.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Cp 낮음 */}
          <div className="border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-700 font-extrabold text-sm">Cp</span>
              <p className="font-bold text-foreground">Cp가 낮다 → 산포(변동)가 크다</p>
            </div>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              규격 폭(USL − LSL) 대비 공정 산포(6σ)가 넓어 규격 안에 들어갈 여유가 없는 상태.
              평균이 중앙에 있어도 불량이 발생할 수 있습니다.
            </p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">접근 방법</p>
            <ul className="space-y-1.5">
              {[
                "4M 변동 원인 조사 — 작업자·기계·재료·방법 중 산포 유발 요인 식별",
                "설비 정밀도 점검 — 마모, 가공 조건(절삭속도·압력·온도) 최적화",
                "원자재 입고 품질 관리 강화 — 원재료 산포가 공정 산포로 이어질 수 있음",
                "게이지 R&R 실시 — 측정 시스템 산포가 Cp를 낮추는지 확인",
                "규격 재검토 — 기술적으로 달성 불가한 규격인지 고객사와 협의",
              ].map((item) => (
                <li key={item} className="flex gap-2 text-xs text-foreground">
                  <span className="shrink-0 text-brand-orange font-bold">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cpk 낮음 (Cp는 괜찮음) */}
          <div className="border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 font-extrabold text-sm">Cpk</span>
              <p className="font-bold text-foreground">Cpk가 낮다 (Cp는 양호) → 평균이 치우쳐 있다</p>
            </div>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              공정 산포 자체는 규격을 만족할 수 있는 수준이지만,
              공정 평균이 목표값(Target)에서 벗어나 한쪽 규격 한계에 가깝습니다.
            </p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">접근 방법</p>
            <ul className="space-y-1.5">
              {[
                "치우침 방향 확인 — 히스토그램에서 LSL/USL 중 어느 쪽으로 편향됐는지 파악",
                "공정 조건 재설정 — 가공 기준값(오프셋, 세팅값)을 Target 방향으로 조정",
                "드리프트 모니터링 — 시간에 따른 평균 이동 패턴(관리도)으로 원인 추적",
                "공구 마모 주기 검토 — 마모에 의한 점진적 치우침이라면 교체 주기 단축",
                "작업 표준 재교육 — 셋업 작업자별 편차가 원인인지 확인",
              ].map((item) => (
                <li key={item} className="flex gap-2 text-xs text-foreground">
                  <span className="shrink-0 text-brand-orange font-bold">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Cp ≈ Cpk 비교 표 */}
        <div className="mt-5 bg-background-soft border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">빠른 진단표</p>
          <div className="overflow-x-auto">
            <table className="text-xs w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left pb-2 font-semibold text-muted-foreground pr-4">상황</th>
                  <th className="pb-2 font-semibold text-muted-foreground px-3">Cp</th>
                  <th className="pb-2 font-semibold text-muted-foreground px-3">Cpk</th>
                  <th className="text-left pb-2 font-semibold text-muted-foreground pl-4">주요 원인</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { situation: "이상적인 공정", cp: "≥ 1.33", cpk: "≈ Cp", cause: "산포 작음 + 중앙 집중" },
                  { situation: "치우침만 있음", cp: "≥ 1.33", cpk: "< Cp", cause: "평균 편차 → 조건 재설정" },
                  { situation: "산포만 큼", cp: "< 1.33", cpk: "≈ Cp", cause: "변동 큼 → 원인 분석 필요" },
                  { situation: "산포 크고 치우침도", cp: "< 1.33", cpk: "< Cp", cause: "복합 문제 → 우선 산포 감소" },
                ].map((row) => (
                  <tr key={row.situation} className="py-1">
                    <td className="py-1.5 pr-4 font-medium">{row.situation}</td>
                    <td className="py-1.5 px-3 font-mono text-center">{row.cp}</td>
                    <td className="py-1.5 px-3 font-mono text-center">{row.cpk}</td>
                    <td className="py-1.5 pl-4 text-muted-foreground">{row.cause}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── 단기 vs 장기 공정능력 ── */}
      <div className="mt-12 pt-8 border-t border-border">
        <h2 className="text-lg font-bold text-brand-navy mb-1">단기 vs 장기 공정능력</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Cp/Cpk는 단기(Within) 능력, Pp/Ppk는 장기(Overall) 능력을 나타냅니다.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-brand-navy">단기 공정능력 (Cp / Cpk)</p>
              <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 rounded-full px-2.5 py-1">Within</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              공정이 통계적으로 관리 상태에 있을 때 달성 가능한 <strong>최상의 능력</strong>.
              단기간(단일 셋업, 단일 배치)의 데이터로 계산하거나,
              서브그룹 내 변동(σ_within)을 사용합니다.
            </p>
            <ul className="space-y-1 text-xs text-foreground">
              <li className="flex gap-2"><span className="text-brand-orange font-bold shrink-0">•</span>IATF 16949 초기 공정 승인(PPAP) 기준: <strong>Cpk ≥ 1.67</strong></li>
              <li className="flex gap-2"><span className="text-brand-orange font-bold shrink-0">•</span>양산 중 관리 기준: <strong>Cpk ≥ 1.33</strong></li>
              <li className="flex gap-2"><span className="text-brand-orange font-bold shrink-0">•</span>이상 원인(특별 원인) 제거 후의 잠재 능력을 반영</li>
              <li className="flex gap-2"><span className="text-brand-orange font-bold shrink-0">•</span>관리도(X̄-R, I-MR)를 함께 사용하여 공정 안정성 확인 권장</li>
            </ul>
          </div>
          <div className="border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-brand-navy">장기 공정능력 (Pp / Ppk)</p>
              <span className="text-[10px] font-semibold bg-purple-100 text-purple-700 rounded-full px-2.5 py-1">Overall</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              장기간(여러 배치, 여러 셋업, 여러 작업자)에 걸친 <strong>실제 성과</strong>.
              전체 표준편차(σ_total)를 사용하며,
              드리프트·셋업 변동 등 모든 변동 원인이 포함됩니다.
            </p>
            <ul className="space-y-1 text-xs text-foreground">
              <li className="flex gap-2"><span className="text-brand-orange font-bold shrink-0">•</span>일반적으로 <strong>Ppk ≤ Cpk</strong> — 차이가 클수록 특별 원인 변동 큼</li>
              <li className="flex gap-2"><span className="text-brand-orange font-bold shrink-0">•</span>장기 데이터(최소 25 서브그룹 또는 100개 이상) 필요</li>
              <li className="flex gap-2"><span className="text-brand-orange font-bold shrink-0">•</span>양산 실적 리뷰, 고객사 보고 시 Ppk 사용 권장</li>
              <li className="flex gap-2"><span className="text-brand-orange font-bold shrink-0">•</span>Cpk − Ppk 차이가 0.2 이상이면 공정 안정성 재검토 필요</li>
            </ul>
          </div>
        </div>

        <div className="mt-5 bg-background-soft border border-border rounded-xl p-4 text-xs text-muted-foreground leading-relaxed">
          <p className="font-semibold text-foreground mb-2">단기·장기 능력 차이(Cpk − Ppk)가 크다면?</p>
          <p>
            Cpk와 Ppk의 차이는 공정에 <strong>특별 원인 변동</strong>(배치 간 차이, 셋업 편차, 시간 드리프트 등)이 있다는 신호입니다.
            이 경우 관리도를 통해 어느 시점·어느 조건에서 이상이 발생했는지 추적하고,
            Nelson 규칙 또는 Western Electric 규칙 위반 패턴을 분석하세요.
            근본 원인 제거 없이 공정 조건을 조정하면 일시적 개선에 그칩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
