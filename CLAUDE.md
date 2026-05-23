# CLAUDE.md

이 파일은 Claude Code가 매 세션 시작 시 자동으로 읽는 프로젝트 영구 지침서입니다.
사용자가 별도로 언급하지 않아도 항상 이 규칙을 따르세요.

---

## 1. 프로젝트 정체성

**프로젝트 코드명**: `quality-hub` (정식 회사명 확정 후 변경 예정)
**유형**: 다중 SaaS 프로젝트의 허브/포트폴리오 사이트 + 품질 학습 위키 + 블로그
**소유자**: 1인 운영 (개발 + 콘텐츠)

### 무엇이 아닌가
- 단순 블로그가 아님 — 허브 역할이 메인
- 단순 랜딩페이지가 아님 — 학습 콘텐츠가 핵심 자산
- 단순 위키가 아님 — 자체 SaaS 제품들의 진입점

### 핵심 가치 제안
"품질 실무자가 IATF 16949·품질기술사 시험·실무 도구를 한 곳에서 만난다."

---

## 2. 연결될 자매 사이트 (디자인/톤 통일 대상)

| 도메인 | 역할 | 디자인 톤 |
|---|---|---|
| `auditsay.com` | 심사 SaaS | **이 사이트의 디자인 기준점** (아래 섹션 4 참조) |
| `apqpmanager.com` | APQP 문서 관리 SaaS | 공감형 페인포인트 헤드라인 + 기능 그리드 |
| `gaugemanager.com` | 게이지 관리 SaaS | 동일 톤 계열 추정 |
| (이 프로젝트) | 허브 + 학습 + 블로그 | auditsay.com 톤 계승 + "지식 베이스" 색채 |

**중요**: 이 사이트는 위 사이트들의 "모회사/지식 베이스"처럼 느껴져야 합니다.
자매 사이트로의 링크는 광고가 아닌 자연스러운 "관련 도구" 안내처럼 배치하세요.

---

## 3. 기술 스택 (변경 금지)

- **프레임워크**: Next.js 15 (App Router, Server Components 우선)
- **언어**: TypeScript (strict mode)
- **스타일**: Tailwind CSS v4 + shadcn/ui
- **콘텐츠**: MDX (`@next/mdx` + gray-matter)
- **검색**: 처음엔 클라이언트 사이드 (Fuse.js), 나중에 필요 시 Algolia
- **배포**: Vercel
- **분석**: Vercel Analytics (무료 티어)
- **폰트**: Pretendard Variable (한글) + Inter (영문 숫자)
- **아이콘**: Lucide React

### 절대 추가하지 말 것
- 데이터베이스 / 인증 / CMS (정적 사이트로 시작)
- jQuery, Bootstrap 등 레거시 라이브러리
- framer-motion 외의 무거운 애니메이션 라이브러리

---

## 4. 디자인 시스템 (auditsay.com 기준)

### 4-1. 색상 — Tailwind 커스텀 토큰
```css
/* globals.css의 @theme 또는 :root */

/* 베이스 */
--background: #FFFFFF;
--background-soft: #FDFBF7;     /* 살짝 따뜻한 크림 베이스 */
--foreground: #1A1F2E;          /* 거의 검정, 푸른빛 살짝 */

/* 브랜드 */
--brand-orange: #F26B3A;        /* 메인 액센트, CTA, 강조 숫자 */
--brand-orange-hover: #E55A28;
--brand-navy: #2B4B8C;          /* 메인 헤드라인 컬러 */
--brand-navy-dark: #1E3666;     /* 호버, 강조 */

/* 보조 */
--muted: #F5F4F0;               /* 카드 배경, 신뢰 배지 영역 */
--muted-foreground: #6B7280;
--border: #E8E4DC;              /* 살짝 베이지 톤 보더 */

/* 시스템 */
--success: #16A34A;
--warning: #CA8A04;
--destructive: #DC2626;
```

다크 모드는 v1에서 보류.

### 4-2. 타이포그래피
- 헤드라인 한글: **Pretendard 800 (ExtraBold)**, 줄간격 1.15, `letter-spacing: -0.02em`
- 본문 한글: **Pretendard 400/500**, 줄간격 1.7, **`word-break: keep-all` 필수**
- 숫자/영문: **Inter** (헤드라인 800, 본문 400/500)
- **숫자 강조 패턴**: 헤드라인 중 핵심 숫자는 `text-brand-orange`로 색만 변경
  - 예: `심사 준비 <span class="text-brand-orange">3일</span>을 <span class="text-brand-orange">3시간</span>으로`
- **오버라인 (Eyebrow)**: 헤드라인 위 작은 텍스트, `text-brand-orange text-sm font-medium`
  - 예: "품질을 향한 오디세이"

### 4-3. 헤더 — 떠 있는 알약(Pill) 디자인 ⭐ 핵심
```
- position: sticky, top-4 또는 top-6
- max-width: 약 max-w-5xl (1024px)
- 좌우 가운데 정렬
- background: 흰색 또는 흰색/90 + backdrop-blur
- border: 1px solid var(--border)
- border-radius: rounded-full (9999px)
- padding: px-6 py-3
- box-shadow: 매우 옅게 (shadow-sm)
- 스크롤 시 그림자 살짝 강해짐
```
**일반적인 풀폭 헤더가 아닙니다.** 페이지 위에 떠 있는 캡슐 네비게이션.
모바일에서는 알약 유지하되 햄버거로 축소.

### 4-4. Hero 배경 — Mesh Gradient
Hero 섹션 배경에 **부드러운 mesh gradient** 적용:
- 우상단: 따뜻한 노랑/오렌지 빛 (`#FFE8C2`)
- 우하단: 옅은 푸른빛 (`#DCE7F5`)
- 베이스: 흰색 또는 `--background-soft`
- CSS 예시:
  ```css
  background:
    radial-gradient(ellipse at 85% 15%, rgba(255, 232, 194, 0.6), transparent 50%),
    radial-gradient(ellipse at 95% 85%, rgba(220, 231, 245, 0.7), transparent 55%),
    var(--background);
  ```

### 4-5. 일러스트레이션
- **평면 벡터(flat vector) 일러스트** 사용
- 사진이나 3D 렌더 금지
- 톤: 친근하고 따뜻함, 채도 중간
- 모티프 예시: 돛단배(여정), 등대(가이드), 지도, 나침반, 책, 체크리스트
- 자리: Hero 우측, 카드 일러스트 등
- **v1에서는 placeholder SVG로 시작**, 나중에 실제 일러스트 교체

### 4-6. 신뢰 배지 카드 (Trust Cards)
```
┌──────────────────────────────┐
│ ✓  베타 파트너사 모집 중      │  ← 굵게, ✓는 초록
│    한정 20개사 무료 제공      │  ← 회색, 한 줄 부연
└──────────────────────────────┘
```
- 배경: 흰색
- 보더: `var(--border)` 1px
- 라운드: `rounded-2xl`
- 패딩: `p-5`
- 그림자 없음 (보더로만 구분)

### 4-7. CTA 버튼
- **Primary**: `bg-brand-orange text-white rounded-full px-8 py-4 font-semibold`
- 우측에 화살표 아이콘 (`ArrowRight` from lucide)
- 호버: `bg-brand-orange-hover`, 살짝 위로 떠오름 (`-translate-y-0.5`)
- **Secondary**: `bg-white border border-border text-foreground rounded-full px-8 py-4`

### 4-8. 일반 레이아웃
- 최대 너비: `max-w-6xl` (콘텐츠 컨테이너), `max-w-3xl` (글 본문)
- 모바일 우선
- 섹션 패딩: `py-24 md:py-32` (랜딩), `py-12 md:py-16` (콘텐츠)
- 카드 라운드: `rounded-2xl` 기본, `rounded-3xl` 큰 카드
- 호버: `transition-all duration-200`, 과한 변환 금지

---

## 5. 디렉토리 구조

```
/
├── app/
│   ├── (marketing)/              # 허브 페이지 그룹
│   │   ├── page.tsx              # 홈 (허브)
│   │   ├── tools/page.tsx
│   │   └── about/page.tsx
│   ├── learn/
│   │   ├── page.tsx
│   │   ├── [...slug]/page.tsx
│   │   └── layout.tsx
│   ├── blog/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── layout.tsx
│   └── globals.css
├── content/                      # MDX 콘텐츠
│   ├── learn/
│   │   ├── iatf-16949/
│   │   ├── iso-9001/
│   │   ├── spc/
│   │   ├── msa/
│   │   ├── fmea/
│   │   └── qe-exam/
│   └── blog/
├── components/
│   ├── ui/                       # shadcn
│   ├── layout/
│   │   ├── PillHeader.tsx        # ⭐ 떠 있는 알약 헤더
│   │   ├── Footer.tsx
│   │   └── MobileNav.tsx
│   ├── sections/
│   │   ├── Hero.tsx              # Mesh gradient 배경 포함
│   │   ├── TrustCards.tsx
│   │   ├── ToolGrid.tsx
│   │   └── LearnPreview.tsx
│   ├── mdx/
│   └── illustrations/            # SVG 일러스트
├── lib/
│   ├── content.ts
│   └── utils.ts
└── public/
```

---

## 6. 콘텐츠 작성 규칙

### MDX frontmatter 표준
```yaml
---
title: 공정능력지수 Cp/Cpk
description: SPC의 핵심 지표인 공정능력지수의 정의, 계산, 해석을 정리합니다.
category: spc
tags: [SPC, Cp, Cpk, 통계적공정관리]
exam_topic: true              # 품질기술사 시험 출제 영역
iatf_clause: "8.3.5"          # 관련 IATF 16949 조항
related_tool: apqpmanager     # 자매 사이트 자연 연결 (선택)
updated: 2026-05-16
---
```

### 자매 사이트 연결 패턴
학습 노트 끝에 "관련 도구" 섹션을 자연스럽게:
```mdx
## 관련 도구
실무에서 PFMEA와 Control Plan을 연동 관리해야 한다면
[APQP Manager](https://apqpmanager.com)가 5문서 자동 연동을 지원합니다.
```
광고 톤 금지. 학습 맥락의 자연스러운 다음 단계로만.

---

## 7. 코딩 컨벤션

- 컴포넌트: PascalCase, 파일명도 PascalCase (`PillHeader.tsx`)
- 유틸 함수: camelCase
- 상수: UPPER_SNAKE_CASE
- Server Component 기본, `"use client"`는 상호작용 필요할 때만
- import 순서: 외부 라이브러리 → `@/` 절대경로 → 상대경로 → 타입
- 코드 주석은 영어, UI 텍스트는 한국어
- **디자인 토큰을 직접 색상값으로 우회 금지** — `bg-brand-orange` ✓, `bg-[#F26B3A]` ✗

---

## 8. 작업 시 행동 규칙

### 항상
- 사용자에게 한국어로 응답
- 변경 전 영향 받는 파일 먼저 확인
- 새 패키지 설치 전 사용자 확인
- 빌드 에러는 즉시 수정

### 절대
- `node_modules`, `.next`, `.env*` 커밋 금지
- 사용자 명시 없이 디자인 시스템 변경 금지
- 자매 사이트 URL을 임의로 만들지 말 것
- placeholder를 진짜처럼 작성 금지 — `[TODO: ...]` 표시

### 모호할 때
질문하세요. 특히:
- 새 페이지 구조를 만들 때
- 자매 사이트와의 연결 방식을 정할 때
- 콘텐츠 카테고리 분류 기준을 정할 때

---

## 9. 현재 단계

**Phase**: 초기 구축 (v0.1)
**도메인**: 미정 (회사명 확정 후)
**배포**: Vercel preview URL로 시작
**Git**: 사용자 GitHub repo 연결 예정

다음 단계는 `SPEC.md` 참조.
