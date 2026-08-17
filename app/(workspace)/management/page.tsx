import Link from "next/link";
import {
  Target, FileCheck2, ShieldAlert, LifeBuoy, Users2, CalendarDays,
} from "lucide-react";

const AREAS = [
  {
    href: "/management/kpi",
    Icon: Target,
    title: "KPI/BSC",
    description: "조직 목표·실적·조치내용을 월별로 주관부문이 기록하고 경영자에게 보고합니다.",
  },
  {
    href: "/management/review",
    Icon: FileCheck2,
    title: "경영검토",
    description: "IATF 16949 요구사항에 맞는 입력사항을 기록해 경영검토 회의 자료로 사용합니다.",
  },
  {
    href: "/management/risk",
    Icon: ShieldAlert,
    title: "리스크분석",
    description: "이해관계자를 파악하고 리스크 분석 템플릿으로 평가한 뒤, 조치·일정·담당을 기록해 재평가합니다.",
  },
  {
    href: "/management/contingency",
    Icon: LifeBuoy,
    title: "비상계획",
    description: "자연재해·사이버공격 등 비상상황별 리스크를 평가하고, 시나리오와 훈련 실적을 관리합니다.",
  },
  {
    href: "/management/tft",
    Icon: Users2,
    title: "TFT활동",
    description: "부서 간 TFT 활동을 기록하고 추적합니다.",
  },
  {
    href: "/management/meetings",
    Icon: CalendarDays,
    title: "회의",
    description: "경영 관련 회의 안건과 결과를 기록합니다.",
  },
];

export default function ManagementOverviewPage() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {AREAS.map(({ href, Icon, title, description }) => (
        <Link
          key={href}
          href={href}
          className="border border-border rounded-2xl p-6 bg-white hover:border-brand-navy transition-colors duration-200 group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-brand-navy/5 flex items-center justify-center shrink-0">
              <Icon className="h-5 w-5 text-brand-navy" />
            </div>
            <h2 className="font-bold text-foreground group-hover:text-brand-navy transition-colors">
              {title}
            </h2>
            <span className="ml-auto text-[11px] font-semibold text-muted-foreground bg-muted rounded-full px-2.5 py-0.5">
              준비 중
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </Link>
      ))}
    </div>
  );
}
