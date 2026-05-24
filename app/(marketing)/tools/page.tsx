import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, ArrowRight, BarChart3, Activity, TrendingUp, ListChecks, Network, Grid3x3, Workflow, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "품질 도구",
  description:
    "AuditSay, APQP Manager, Gauge Manager — 품질 실무를 자동화하는 SaaS 도구들을 소개합니다.",
};

const tools = [
  {
    name: "AuditSay",
    tagline: "심사 SaaS",
    description:
      "IATF 16949·ISO 9001·VDA 6.3 기준 심사 체크리스트를 자동 생성하고, 심사 결과를 체계적으로 관리합니다.",
    features: [
      "IATF 16949 체크리스트 자동 생성",
      "ISO 9001 심사 관리",
      "VDA 6.3 지원",
      "심사 결과 보고서 자동 생성",
      "부적합 사항 추적 관리",
    ],
    useCase:
      "내부 심사, 2자 공급업체 심사, 인증 준비에 활용. 심사 준비 시간을 대폭 단축합니다.",
    href: "https://auditsay.com",
    color: "bg-brand-navy",
    textColor: "text-white",
  },
  {
    name: "APQP Manager",
    tagline: "APQP 문서 관리",
    description:
      "PFMEA부터 Control Plan, PPAP까지 APQP 5문서를 자동 연동하여 관리합니다.",
    features: [
      "PFMEA 작성 및 관리",
      "Control Plan 자동 연동",
      "PPAP 패키지 생성",
      "5문서 자동 매핑",
      "고객 제출 형식 자동 변환",
    ],
    useCase:
      "신차 개발 APQP 프로세스 전 과정을 하나의 플랫폼에서. 수작업 데이터 이중 입력 제거.",
    href: "https://apqpmanager.com",
    color: "bg-brand-orange",
    textColor: "text-white",
  },
  {
    name: "Gauge Manager",
    tagline: "게이지 관리",
    description:
      "측정기기 검교정 일정 관리부터 MSA 분석, IATF 8.4 대응까지 측정 시스템을 통합 관리합니다.",
    features: [
      "검교정 일정 관리 및 알림",
      "MSA (Gage R&R) 분석",
      "측정기 이력 관리",
      "IATF 16949 8.4 대응",
      "검교정 성적서 관리",
    ],
    useCase:
      "게이지 검교정 기한 초과 방지, MSA 분석 자동화. IATF 심사 대응에 필요한 측정 기록 관리.",
    href: "https://gaugemanager.com",
    color: "bg-green-700",
    textColor: "text-white",
  },
  {
    name: "NC Manager",
    tagline: "부적합·클레임·CAPA 관리 SaaS",
    description:
      "내부 부적합과 고객 클레임을 접수부터 CAPA 종결까지 한 흐름으로 관리합니다.",
    features: [
      "내부 부적합 등록·심각도 분류",
      "고객 클레임 접수 및 이력 추적",
      "CAPA 개설·진행 현황 대시보드",
      "연도·분기별 통계 분석",
      "조직 멤버 권한 관리",
    ],
    useCase:
      "부적합 발생부터 근본원인 분석, 시정조치 완결까지 추적. 고객 클레임 대응 이력을 체계적으로 관리.",
    href: "https://nc-manager-chi.vercel.app",
    color: "bg-red-700",
    textColor: "text-white",
  },
  {
    name: "4M Change Manager",
    tagline: "변경관리 SaaS (IATF 16949)",
    description:
      "Man·Machine·Material·Method 변경을 제안부터 유효성 평가까지 4단계로 관리합니다.",
    features: [
      "4M 변경 등록·위험도 분류",
      "4단계 승인 워크플로우 (제안→검토→승인→유효성)",
      "내부승인·고객통보·고객공식승인 상태 추적",
      "EO(Engineering Order) 번호 연계",
      "고객사·제품·공정별 필터링",
    ],
    useCase:
      "IATF 16949 8.5.6 변경관리 요구사항 충족. 고객 통보 이력과 EO 번호를 체계적으로 보관.",
    href: "https://change-manager-self.vercel.app",
    color: "bg-purple-700",
    textColor: "text-white",
  },
];

const guide = [
  {
    question: "IATF 심사를 준비 중이신가요?",
    answer: "→ AuditSay",
    detail: "체크리스트 자동 생성으로 심사 준비 시간을 줄이세요.",
  },
  {
    question: "신차 개발 APQP 문서를 관리해야 하나요?",
    answer: "→ APQP Manager",
    detail: "PFMEA·Control Plan·PPAP를 한 플랫폼에서.",
  },
  {
    question: "게이지 검교정과 MSA가 필요하신가요?",
    answer: "→ Gauge Manager",
    detail: "검교정 기한 관리부터 MSA 분석까지.",
  },
  {
    question: "내부 부적합이나 고객 클레임을 체계적으로 관리해야 하나요?",
    answer: "→ NC Manager",
    detail: "부적합 등록부터 CAPA 종결까지 한 흐름으로.",
  },
  {
    question: "4M 변경을 고객 통보부터 유효성 평가까지 추적해야 하나요?",
    answer: "→ 4M Change Manager",
    detail: "제안·검토·승인·유효성 평가 4단계 워크플로우.",
  },
];

// v2: /calculators/* 경로로 재정렬 (VSM/Kanban 시험 학습 코너로 이동)
const internalTools = [
  {
    href: "/calculators/spc",
    icon: BarChart3,
    label: "SPC 분석기",
    sublabel: "공정능력 (Cp/Cpk) · 관리도",
    desc: "데이터 붙여넣기만 하면 공정능력 분석과 관리도를 즉시 확인. Cp/Cpk/Pp/Ppk + X̄-R/I-MR/p 관리도.",
    status: "사용 가능",
  },
  {
    href: "/calculators/qc7",
    icon: ListChecks,
    label: "QC 7가지 도구",
    sublabel: "파레토 · 히스토그램 · 특성요인도",
    desc: "체크시트, 히스토그램, 파레토 차트, 특성요인도, 산포도, 층별. 직접 실습하고 Excel로 다운로드.",
    status: "사용 가능",
  },
  {
    href: "/new-qc7",
    icon: Network,
    label: "신 QC 7가지 도구",
    sublabel: "친화도 / 연관도 / 애로우 ...",
    desc: "친화도, 연관도, 계통도, 매트릭스도, PDPC, 애로우 다이어그램(CPM). 품질기술사 시험 대비 실습.",
    status: "사용 가능",
  },
  {
    href: "/qfd",
    icon: Grid3x3,
    label: "QFD 매트릭스",
    sublabel: "품질기능전개 / 품질의 집",
    desc: "고객 요구사항을 설계·부품·공정 특성으로 단계별 전개. 3단계 폭포 구조, 가중 점수 자동 계산.",
    status: "사용 가능",
  },
  {
    href: "/skill-matrix",
    icon: Users,
    label: "다기능도 (Skill Matrix)",
    sublabel: "적격성 관리 / 인원별·공정별 목표",
    desc: "공정별·인원별 스킬 레벨 입력, 목표 대비 GAP 파악. ISO 9001 7.2 / IATF 16949 7.2.2 대응.",
    status: "사용 가능",
  },
  {
    href: "#",
    icon: Activity,
    label: "관리도 (Control Chart)",
    sublabel: "X̄-R / X̄-S / I-MR",
    desc: "Nelson 규칙·WE 규칙 기반 이상 원인 탐지. 관리 한계선 자동 계산.",
    status: "개발 예정",
  },
  {
    href: "#",
    icon: TrendingUp,
    label: "샘플링 검사",
    sublabel: "KS Q ISO 2859 / AQL",
    desc: "수입검사·공정검사 샘플 수 및 합격 판정 개수(Ac/Re) 자동 산출.",
    status: "개발 예정",
  },
];

export default function ToolsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-16">
        <p className="text-sm font-medium text-brand-orange mb-3">도구</p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-brand-navy mb-4">
          품질 실무 도구
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          바로 사용할 수 있는 무료 분석 도구와, 실무를 자동화하는 SaaS 도구를 모았습니다.
        </p>
      </div>

      {/* 무료 계산 도구 (v2) */}
      <div className="mb-16">
        <h2 className="text-lg font-bold text-brand-navy mb-4">무료 계산 도구 — 회원가입 없이 즉시 사용</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {internalTools.map((tool) => {
            const Icon = tool.icon;
            const isAvailable = tool.status === "사용 가능";
            const card = (
              <div className={`border rounded-2xl p-5 h-full flex flex-col transition-all duration-200 ${
                isAvailable
                  ? "border-border hover:border-brand-navy hover:shadow-sm bg-white cursor-pointer"
                  : "border-border bg-background-soft cursor-default opacity-70"
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-brand-orange/10 rounded-xl p-2.5">
                    <Icon className="h-5 w-5 text-brand-orange" />
                  </div>
                  <span className={`text-[10px] font-semibold rounded-full px-2.5 py-1 ${
                    isAvailable ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"
                  }`}>
                    {tool.status}
                  </span>
                </div>
                <h3 className="font-bold text-foreground mb-0.5">{tool.label}</h3>
                <p className="text-xs font-mono text-brand-orange mb-2">{tool.sublabel}</p>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{tool.desc}</p>
                {isAvailable && (
                  <div className="flex items-center gap-1 mt-4 text-sm font-semibold text-brand-navy">
                    바로 사용하기
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
            return isAvailable ? (
              <Link key={tool.label} href={tool.href}>{card}</Link>
            ) : (
              <div key={tool.label}>{card}</div>
            );
          })}
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-lg font-bold text-brand-navy mb-6">함께하는 SaaS 도구</h2>
        <div className="space-y-10">
        {tools.map((tool) => (
          <div
            key={tool.name}
            className="border border-border rounded-3xl overflow-hidden"
          >
            <div className={`${tool.color} px-8 py-7`}>
              <p className="text-sm font-medium text-white/70 mb-1">{tool.tagline}</p>
              <h2 className="text-2xl font-extrabold text-white">{tool.name}</h2>
              <p className="text-white/80 mt-2 max-w-xl">{tool.description}</p>
            </div>
            <div className="bg-white p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">주요 기능</h3>
                  <ul className="space-y-2">
                    {tool.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-orange mt-1.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">활용 사례</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {tool.useCase}
                  </p>
                  <div className="mt-6 bg-muted rounded-xl p-4">
                    <p className="text-xs text-muted-foreground italic">
                      [TODO: 스크린샷 또는 데모 영상 자리]
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-border">
                <a
                  href={tool.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-brand-orange text-white rounded-full px-6 py-3 text-sm font-semibold hover:bg-brand-orange-hover hover:-translate-y-0.5 transition-all duration-200"
                >
                  {tool.name} 사이트 방문
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>

      {/* Guide section */}
      <div className="bg-background-soft border border-border rounded-3xl p-8 md:p-10">
        <h2 className="text-xl font-extrabold text-brand-navy mb-6">
          어떤 도구가 필요한지 모르겠다면?
        </h2>
        <div className="space-y-4">
          {guide.map((item) => (
            <div key={item.question} className="flex items-start gap-4">
              <ArrowRight className="h-5 w-5 text-brand-orange shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">{item.question}</p>
                <p className="text-sm text-brand-orange font-semibold">{item.answer}</p>
                <p className="text-sm text-muted-foreground">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
