import type { Metadata } from "next";
import { Bell } from "lucide-react";

export const metadata: Metadata = {
  title: "공지사항",
  description: "QmIntel 공지사항 및 업데이트 소식",
};

const NOTICES = [
  {
    id: 1,
    badge: "업데이트",
    badgeColor: "bg-brand-navy text-white",
    title: "회원 가입 및 등급별 도구 접근 기능 출시",
    date: "2026-05-23",
    content:
      "Silver·Gold·Platinum 등급에 따라 5개 자매 SaaS 도구에 접근할 수 있는 구독 시스템이 출시되었습니다. 기업 회원 가입 시 관리자 승인 후 활성화됩니다.",
  },
  {
    id: 2,
    badge: "안내",
    badgeColor: "bg-muted text-muted-foreground",
    title: "Quality Hub 베타 서비스 시작",
    date: "2026-05-20",
    content:
      "Quality Hub가 베타 서비스를 시작합니다. 품질 학습 위키, SPC·QC7·QFD·VSM·Kanban 내장 도구를 무료로 제공합니다. 피드백은 서비스 요청으로 보내주세요.",
  },
];

export default function NoticePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-12">
        <p className="text-sm font-medium text-brand-orange mb-3">지원</p>
        <h1 className="text-4xl font-extrabold text-brand-navy mb-4">공지사항</h1>
        <p className="text-muted-foreground">업데이트 소식과 서비스 안내를 전달합니다.</p>
      </div>

      {NOTICES.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Bell className="h-10 w-10 mx-auto mb-4 opacity-30" />
          <p>등록된 공지사항이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {NOTICES.map((notice) => (
            <article
              key={notice.id}
              className="bg-white border border-border rounded-2xl p-6 hover:border-brand-navy transition-colors"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${notice.badgeColor}`}>
                  {notice.badge}
                </span>
                <time className="text-xs text-muted-foreground">{notice.date}</time>
              </div>
              <h2 className="text-base font-semibold text-foreground mb-2">{notice.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed" style={{ wordBreak: "keep-all" }}>
                {notice.content}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
