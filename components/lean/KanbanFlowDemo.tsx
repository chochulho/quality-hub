"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, ArrowRight } from "lucide-react";

interface Step {
  title: string;
  desc: string;
  highlight: "customer" | "fg" | "transport" | "process" | "kanban" | "none";
}

const STEPS: Step[] = [
  {
    title: "① 고객이 완제품 인출",
    desc: "고객이 완제품(FG) 슈퍼마켓에서 1박스를 인출합니다. 이 순간 '인출 칸반(Withdrawal Kanban)' 카드 1매가 발생합니다.",
    highlight: "customer",
  },
  {
    title: "② 인출 칸반 → FG 슈퍼마켓 게시판",
    desc: "인출 칸반을 FG 슈퍼마켓 게시판에 부착합니다. 재고가 기준점(Order Point)에 도달했는지 확인합니다.",
    highlight: "fg",
  },
  {
    title: "③ FG 슈퍼마켓 → 고객 이송",
    desc: "자재담당이 슈퍼마켓에서 완제품을 고객 적치장으로 이송합니다. 동시에 인출 칸반을 수거합니다.",
    highlight: "transport",
  },
  {
    title: "④ 인출 칸반 → 생산 칸반 발행",
    desc: "인출 칸반을 조립 공정 게시판에 가져가면 '생산 칸반(Production Kanban)'이 발행됩니다. 이것이 생산 지시입니다.",
    highlight: "kanban",
  },
  {
    title: "⑤ 조립 공정 생산 시작",
    desc: "조립 공정이 생산 칸반 1매를 수취하고 정확히 칸반 1매 분량(1 컨테이너)만 생산합니다. 필요한 것만, 필요한 만큼 — JIT.",
    highlight: "process",
  },
  {
    title: "⑥ 생산 완료 → 슈퍼마켓 보충",
    desc: "생산이 완료된 제품을 생산 칸반과 함께 FG 슈퍼마켓에 보충합니다. 슈퍼마켓 재고가 원복됩니다.",
    highlight: "fg",
  },
  {
    title: "⑦ 생산 칸반 반환",
    desc: "제품을 슈퍼마켓에 놓은 후 생산 칸반을 칸반 포스트(게시판)로 반환합니다. 다음 사이클을 기다립니다.",
    highlight: "kanban",
  },
  {
    title: "⑧ 신호 칸반 — 생산량 조정",
    desc: "FG 재고가 0에 가까워지거나 수요가 급증하면 '신호 칸반(Signal Kanban)'으로 생산 로트 크기를 조정합니다.",
    highlight: "none",
  },
];

const H_COLOR = {
  customer: "#FDE68A",
  fg: "#BBF7D0",
  transport: "#BFDBFE",
  process: "#DDD6FE",
  kanban: "#FECACA",
  none: "#F5F4F0",
};
const H_STROKE = {
  customer: "#D97706",
  fg: "#16A34A",
  transport: "#2563EB",
  process: "#7C3AED",
  kanban: "#DC2626",
  none: "#E8E4DC",
};

export function KanbanFlowDemo() {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const hl = current.highlight;

  return (
    <div className="my-8 rounded-2xl border border-border overflow-hidden not-prose bg-white">
      {/* Step progress bar */}
      <div className="flex bg-muted/50 border-b border-border px-4 py-2.5 gap-1.5">
        {STEPS.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`flex-1 h-2 rounded-full transition-all ${
              i === step ? "bg-brand-orange" : i < step ? "bg-brand-navy/40" : "bg-border"
            }`}
          />
        ))}
      </div>

      {/* SVG diagram — full width */}
      <div className="p-4 pb-2">
        <svg viewBox="0 0 720 340" width="100%" className="rounded-xl">
          <rect width="720" height="340" fill="#FDFBF7" rx="8" />

          {/* Title */}
          <text x="360" y="26" textAnchor="middle" fontSize="14" fontWeight="700" fill="#2B4B8C">
            칸반 흐름 시뮬레이션
          </text>
          <text x="360" y="44" textAnchor="middle" fontSize="11" fill="#6B7280">
            단계 {step + 1} / {STEPS.length}
          </text>

          {/* ── Supplier ── */}
          <rect x={20} y={130} width={100} height={70} rx={6}
            fill="#F5F4F0" stroke="#E8E4DC" strokeWidth={1.5} />
          <text x={70} y={160} textAnchor="middle" fontSize={13} fontWeight="700" fill="#2B4B8C">공급자</text>
          <text x={70} y={178} textAnchor="middle" fontSize={11} fill="#6B7280">Supplier</text>

          {/* ── Assembly process ── */}
          <rect x={210} y={115} width={140} height={100} rx={8}
            fill={hl === "process" ? H_COLOR.process : "#F5F4F0"}
            stroke={hl === "process" ? H_STROKE.process : "#E8E4DC"}
            strokeWidth={hl === "process" ? 2.5 : 1.5} />
          <text x={280} y={152} textAnchor="middle" fontSize={14} fontWeight="700" fill="#2B4B8C">조립 공정</text>
          <text x={280} y={170} textAnchor="middle" fontSize={12} fill="#6B7280">Assembly</text>
          <text x={280} y={188} textAnchor="middle" fontSize={11} fill="#6B7280">CT = 50초</text>

          {/* ── FG Supermarket ── */}
          <rect x={400} y={108} width={120} height={114} rx={8}
            fill={hl === "fg" ? H_COLOR.fg : "#F5F4F0"}
            stroke={hl === "fg" ? H_STROKE.fg : "#E8E4DC"}
            strokeWidth={hl === "fg" ? 2.5 : 1.5} />
          <text x={460} y={148} textAnchor="middle" fontSize={13} fontWeight="700" fill="#2B4B8C">FG</text>
          <text x={460} y={166} textAnchor="middle" fontSize={13} fontWeight="700" fill="#2B4B8C">슈퍼마켓</text>
          <text x={460} y={187} textAnchor="middle" fontSize={11} fill="#6B7280">재고: 6박스</text>
          <text x={460} y={203} textAnchor="middle" fontSize={11} fill="#6B7280">기준점: 2박스</text>

          {/* ── Customer ── */}
          <rect x={576} y={130} width={120} height={70} rx={6}
            fill={hl === "customer" ? H_COLOR.customer : "#F5F4F0"}
            stroke={hl === "customer" ? H_STROKE.customer : "#E8E4DC"}
            strokeWidth={hl === "customer" ? 2.5 : 1.5} />
          <text x={636} y={160} textAnchor="middle" fontSize={13} fontWeight="700" fill="#2B4B8C">고객</text>
          <text x={636} y={178} textAnchor="middle" fontSize={11} fill="#6B7280">Customer</text>

          {/* ── Kanban board ── */}
          <rect x={248} y={255} width={90} height={55} rx={6}
            fill={hl === "kanban" ? H_COLOR.kanban : "#FEF2F2"}
            stroke={hl === "kanban" ? H_STROKE.kanban : "#FECACA"}
            strokeWidth={hl === "kanban" ? 2.5 : 1.5} />
          <text x={293} y={278} textAnchor="middle" fontSize={12} fontWeight="700" fill="#DC2626">생산 칸반</text>
          <text x={293} y={296} textAnchor="middle" fontSize={11} fill="#991B1B">게시판</text>

          {/* ── Transport highlight bar ── */}
          {hl === "transport" && (
            <rect x={385} y={110} width={30} height={110} rx={4}
              fill={H_COLOR.transport} opacity={0.7} />
          )}

          {/* ── Arrows ── */}
          {/* Supplier → Assembly (push, dashed) */}
          <line x1={120} y1={165} x2={208} y2={165}
            stroke="#2B4B8C" strokeWidth={2} strokeDasharray="5 4" />
          <polygon points="208,165 198,159 198,171" fill="#2B4B8C" />

          {/* Assembly → FG (push, solid) */}
          <line x1={350} y1={165} x2={398} y2={165}
            stroke="#2B4B8C" strokeWidth={2} />
          <polygon points="398,165 388,159 388,171" fill="#2B4B8C" />

          {/* Customer → FG (pull, orange) */}
          <line x1={574} y1={158} x2={522} y2={158}
            stroke="#F26B3A" strokeWidth={2.5} />
          <polygon points="522,158 532,152 532,164" fill="#F26B3A" />
          <text x={548} y={148} textAnchor="middle" fontSize={11} fill="#F26B3A" fontWeight="600">인출</text>

          {/* Process → Kanban board */}
          <path d="M280,215 Q280,240 280,255"
            stroke="#DC2626" strokeWidth={2} fill="none" strokeDasharray="4 3" />
          <polygon points="280,255 274,245 286,245" fill="#DC2626" />

          {/* Kanban board → Process */}
          <path d="M306,255 Q320,235 320,215"
            stroke="#DC2626" strokeWidth={2} fill="none" strokeDasharray="4 3" />
          <polygon points="320,215 314,225 326,225" fill="#DC2626" />

          {/* Flying kanban card (steps 4 & 5) */}
          {(hl === "kanban" || hl === "process") && (
            <g>
              <rect x={402} y={258} width={70} height={44} rx={4}
                fill="#FECACA" stroke="#DC2626" strokeWidth={2} />
              <text x={437} y={276} textAnchor="middle" fontSize={11} fontWeight="700" fill="#DC2626">인출 칸반</text>
              <text x={437} y={291} textAnchor="middle" fontSize={10} fill="#991B1B">조립 → FG</text>
            </g>
          )}

          {/* ── Legend ── */}
          <rect x={20} y={310} width={14} height={14} fill={H_COLOR.kanban} stroke={H_STROKE.kanban} strokeWidth={1} />
          <text x={38} y={321} fontSize={10} fill="#6B7280">생산 칸반</text>
          <rect x={115} y={310} width={14} height={14} fill={H_COLOR.fg} stroke={H_STROKE.fg} strokeWidth={1} />
          <text x={133} y={321} fontSize={10} fill="#6B7280">슈퍼마켓</text>
          <rect x={210} y={310} width={14} height={14} fill={H_COLOR.customer} stroke={H_STROKE.customer} strokeWidth={1} />
          <text x={228} y={321} fontSize={10} fill="#6B7280">고객 인출(풀)</text>
          <line x1={330} y1={317} x2={355} y2={317} stroke="#F26B3A" strokeWidth={2} />
          <text x={360} y={321} fontSize={10} fill="#6B7280">풀 신호</text>
          <line x1={430} y1={317} x2={455} y2={317} stroke="#2B4B8C" strokeWidth={2} />
          <text x={460} y={321} fontSize={10} fill="#6B7280">재료 흐름</text>
        </svg>
      </div>

      {/* Description + navigation */}
      <div className="px-5 py-4 border-t border-border bg-muted/20">
        <h4 className="text-base font-bold text-brand-navy mb-1.5">{current.title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{current.desc}</p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            이전
          </button>
          <span className="flex-1 text-center text-sm text-muted-foreground">
            {step + 1} / {STEPS.length}
          </span>
          <button
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            disabled={step === STEPS.length - 1}
            className="flex items-center gap-1 rounded-lg bg-brand-navy text-white px-4 py-2 text-sm font-medium hover:bg-brand-navy/90 disabled:opacity-40 transition-colors"
          >
            다음
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Link to full data-driven simulation */}
        <div className="mt-3 pt-3 border-t border-border">
          <Link
            href="/kanban"
            className="inline-flex items-center gap-2 rounded-full border border-brand-orange/40 bg-brand-orange/5 px-4 py-2 text-sm font-medium text-brand-orange hover:bg-brand-orange/10 transition-colors"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            실제 BOM 데이터로 칸반 시뮬레이션 해보기
          </Link>
        </div>
      </div>
    </div>
  );
}
