"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import {
  GLOSSARY_TERMS,
  GLOSSARY_CATEGORIES,
  getSortedTerms,
  getInitial,
  type GlossaryTerm,
} from "@/lib/glossary";

const KOREAN_INITIALS = ["ㄱ","ㄴ","ㄷ","ㄹ","ㅁ","ㅂ","ㅅ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
const ALPHA_INITIALS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function GlossaryClient() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeInitial, setActiveInitial] = useState<string | null>(null);

  const sorted = useMemo(() => getSortedTerms(GLOSSARY_TERMS), []);

  const filtered = useMemo(() => {
    return sorted.filter((t) => {
      const matchCategory =
        activeCategory === "all" || t.category === activeCategory;
      const matchInitial =
        !activeInitial || getInitial(t.term) === activeInitial;
      const q = query.trim().toLowerCase();
      const matchQuery =
        !q ||
        t.term.toLowerCase().includes(q) ||
        (t.abbr?.toLowerCase().includes(q) ?? false) ||
        t.definition.toLowerCase().includes(q);
      return matchCategory && matchInitial && matchQuery;
    });
  }, [sorted, query, activeCategory, activeInitial]);

  // 현재 필터에서 실제 사용 중인 이니셜 목록
  const usedInitials = useMemo(() => {
    const base = sorted.filter((t) => {
      const matchCategory =
        activeCategory === "all" || t.category === activeCategory;
      return matchCategory;
    });
    return new Set(base.map((t) => getInitial(t.term)));
  }, [sorted, activeCategory]);

  const handleCategoryChange = (id: string) => {
    setActiveCategory(id);
    setActiveInitial(null);
    setQuery("");
  };

  const handleInitialClick = (initial: string) => {
    setActiveInitial((prev) => (prev === initial ? null : initial));
    setQuery("");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 검색창 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveInitial(null);
          }}
          placeholder="용어, 약어, 설명으로 검색..."
          className="w-full pl-9 pr-9 py-2.5 border border-border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 카테고리 필터 */}
      <div className="flex flex-wrap gap-1.5">
        {GLOSSARY_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              activeCategory === cat.id
                ? "bg-brand-navy text-white border-brand-navy"
                : "border-border text-muted-foreground hover:border-brand-navy hover:text-brand-navy"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 이니셜 바 */}
      {!query && (
        <div className="flex flex-wrap gap-1 text-xs">
          {/* 한글 초성 */}
          {KOREAN_INITIALS.map((ch) => {
            const active = activeInitial === ch;
            const available = usedInitials.has(ch);
            return (
              <button
                key={ch}
                onClick={() => available && handleInitialClick(ch)}
                className={`w-7 h-7 rounded font-medium transition-colors ${
                  !available
                    ? "text-muted-foreground/30 cursor-default"
                    : active
                    ? "bg-brand-orange text-white"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                {ch}
              </button>
            );
          })}
          <span className="self-center mx-1 text-border">|</span>
          {/* 영문 */}
          {ALPHA_INITIALS.map((ch) => {
            const active = activeInitial === ch;
            const available = usedInitials.has(ch);
            return (
              <button
                key={ch}
                onClick={() => available && handleInitialClick(ch)}
                className={`w-7 h-7 rounded font-medium transition-colors ${
                  !available
                    ? "text-muted-foreground/30 cursor-default"
                    : active
                    ? "bg-brand-orange text-white"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                {ch}
              </button>
            );
          })}
        </div>
      )}

      {/* 결과 수 */}
      <p className="text-sm text-muted-foreground">
        {filtered.length}개 용어
        {activeInitial && ` — ${activeInitial}`}
        {query && ` — "${query}" 검색 결과`}
      </p>

      {/* 용어 목록 */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-3xl mb-3">🔍</p>
          <p>검색 결과가 없습니다.</p>
        </div>
      ) : (
        <TermList terms={filtered} query={query} />
      )}
    </div>
  );
}

// ── 용어 목록 (이니셜별 그룹) ───────────────────────────────────
function TermList({ terms, query }: { terms: GlossaryTerm[]; query: string }) {
  // 이니셜별로 그룹
  const groups = useMemo(() => {
    const map = new Map<string, GlossaryTerm[]>();
    for (const t of terms) {
      const key = getInitial(t.term);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    // 가나다 → 알파벳 → 기타 순 정렬
    return [...map.entries()].sort(([a], [b]) => {
      if (!a || !b) return 0;
      return a.localeCompare(b, "ko", { sensitivity: "base" });
    });
  }, [terms]);

  return (
    <div className="space-y-8">
      {groups.map(([initial, groupTerms]) => (
        <section key={initial}>
          <h2 className="text-sm font-bold text-brand-navy bg-muted rounded-lg px-3 py-1.5 inline-block mb-3">
            {initial}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {groupTerms.map((term) => (
              <TermCard key={term.term} term={term} query={query} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// ── 용어 카드 ────────────────────────────────────────────────────
function TermCard({ term, query }: { term: GlossaryTerm; query: string }) {
  const [open, setOpen] = useState(false);

  return (
    <button
      onClick={() => setOpen((p) => !p)}
      className="text-left border border-border rounded-xl p-4 hover:border-brand-navy transition-colors bg-white group"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="font-semibold text-foreground group-hover:text-brand-navy transition-colors text-sm leading-snug">
            <Highlight text={term.term} query={query} />
          </span>
          {term.abbr && (
            <span className="ml-2 text-xs font-medium text-brand-orange bg-brand-orange/8 rounded-full px-2 py-0.5">
              <Highlight text={term.abbr} query={query} />
            </span>
          )}
        </div>
        <span className="text-muted-foreground text-xs shrink-0 mt-0.5">
          {open ? "▲" : "▼"}
        </span>
      </div>

      {/* 항상 표시: 설명 첫 줄 */}
      <p
        className={`text-xs text-muted-foreground mt-1.5 leading-relaxed ${
          open ? "" : "line-clamp-2"
        }`}
      >
        <Highlight text={term.definition} query={query} />
      </p>

      {/* 펼쳤을 때: 연관 용어 */}
      {open && term.related && term.related.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {term.related.map((r) => (
            <span
              key={r}
              className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5"
            >
              → {r}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}

// ── 검색어 하이라이트 ────────────────────────────────────────────
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const q = query.trim();
  const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-brand-orange/20 text-brand-navy rounded px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}
