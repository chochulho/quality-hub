"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";

const REQUEST_TYPES = [
  { value: "bug",     label: "버그 신고" },
  { value: "feature", label: "기능 제안" },
  { value: "inquiry", label: "요금제 문의" },
  { value: "etc",     label: "기타 문의" },
];

export default function RequestPage() {
  const [type,    setType]    = useState("inquiry");
  const [title,   setTitle]   = useState("");
  const [content, setContent] = useState("");
  const [email,   setEmail]   = useState("");
  const [sent,    setSent]    = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Supabase 또는 이메일 API 연동
    // 현재는 mailto 폴백
    const subject = encodeURIComponent(`[Quality Hub ${REQUEST_TYPES.find(t => t.value === type)?.label}] ${title}`);
    const body = encodeURIComponent(`이메일: ${email}\n\n내용:\n${content}`);
    window.open(`mailto:chulhocho@daum.net?subject=${subject}&body=${body}`);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-5" />
        <h2 className="text-2xl font-extrabold text-brand-navy mb-3">요청이 접수되었습니다</h2>
        <p className="text-muted-foreground mb-8">
          빠른 시일 내에 입력하신 이메일로 답변드리겠습니다.
        </p>
        <button
          onClick={() => { setSent(false); setTitle(""); setContent(""); }}
          className="text-sm text-brand-orange hover:underline"
        >
          추가 문의하기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16 md:py-24">
      <div className="text-center mb-10">
        <p className="text-sm font-medium text-brand-orange mb-3">지원</p>
        <h1 className="text-4xl font-extrabold text-brand-navy mb-4">서비스 요청</h1>
        <p className="text-muted-foreground" style={{ wordBreak: "keep-all" }}>
          버그 신고, 기능 제안, 요금제 문의 등 자유롭게 남겨주세요.
          <br />
          보통 <strong className="text-foreground">1~2 영업일</strong> 내에 답변드립니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-border rounded-3xl p-8 space-y-5">
        {/* 요청 유형 */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">요청 유형</label>
          <div className="flex flex-wrap gap-2">
            {REQUEST_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  type === t.value
                    ? "bg-brand-navy text-white border-brand-navy"
                    : "bg-white text-muted-foreground border-border hover:border-brand-navy"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 이메일 */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            답변받을 이메일 <span className="text-brand-orange">*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@company.com"
            className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-colors"
          />
        </div>

        {/* 제목 */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
            제목 <span className="text-brand-orange">*</span>
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="요청 내용을 한 줄로 요약해 주세요"
            className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-colors"
          />
        </div>

        {/* 내용 */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-foreground mb-2">
            내용 <span className="text-brand-orange">*</span>
          </label>
          <textarea
            id="content"
            required
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="자세한 내용을 입력해 주세요. 버그의 경우 재현 방법을 함께 알려주시면 빠른 처리에 도움이 됩니다."
            className="w-full border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-colors resize-none"
            style={{ wordBreak: "keep-all" }}
          />
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-brand-orange text-white rounded-full px-6 py-3.5 font-semibold hover:bg-brand-orange-hover hover:-translate-y-0.5 transition-all duration-200"
        >
          <Send className="h-4 w-4" />
          요청 보내기
        </button>
      </form>
    </div>
  );
}
