# SPEC.md — 초기 빌드 명세서

`CLAUDE.md`의 지침을 따라 아래 단계를 **순서대로** 실행하세요.
각 단계 끝에 사용자 확인을 받고 다음으로 넘어갑니다.

---

## Step 0: 프로젝트 셋업

```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir=false --import-alias "@/*" --eslint
```

추가 설치:
```bash
# MDX
npm install @next/mdx @mdx-js/loader @mdx-js/react gray-matter
npm install -D @types/mdx

# UI
npx shadcn@latest init
npx shadcn@latest add button card badge separator

# 유틸
npm install lucide-react clsx tailwind-merge
npm install date-fns
```

`next.config.mjs`에 MDX 설정 추가, `tsconfig.json` strict 확인.

폰트는 `app/layout.tsx`에서 `next/font/local`로 Pretendard 로드, Inter는 `next/font/google`.

**완료 기준**: `npm run dev` 실행 시 기본 페이지가 뜨고, MDX 파일 하나가 렌더링됨.

---

## Step 1: 글로벌 레이아웃 (Header / Footer)

### Header — ⭐ 떠 있는 알약 디자인 (PillHeader.tsx)
**일반 풀폭 헤더 금지.** auditsay.com처럼 페이지 위에 떠 있는 캡슐형 네비게이션.

- `position: sticky`, `top-4 md:top-6`
- 좌우 가운데 정렬, `max-w-5xl` 폭
- 흰 배경 + `backdrop-blur` + 옅은 보더 + `rounded-full`
- 좌측: 로고 (텍스트 "Quality Hub" 또는 회사명 + 작은 아이콘)
- 중앙: 네비 링크 `학습`, `블로그`, `도구`, `소개`
- 우측: 언어 토글 (`KO`/`EN`, v1은 KO만), `시작하기` 버튼 (작은 오렌지 알약)
- 모바일: 알약 유지하되 햄버거로 축소, 탭 시 풀스크린 슬라이드인 메뉴
- 스크롤 시 그림자 강도 살짝 증가 (`shadow-sm` → `shadow-md`)

상세 스펙은 `CLAUDE.md` 섹션 4-3 참조.

### Footer
- 3컬럼 (모바일 1컬럼)
  - **이 사이트**: 학습, 블로그, 소개
  - **품질 도구**: AuditSay, APQP Manager, Gauge Manager (외부 링크, `target="_blank"` + `rel="noopener"`)
  - **연락**: 이메일, GitHub
- 하단 카피라이트
- 자매 사이트 링크는 도메인 그대로 노출 (신뢰감)

**완료 기준**: 모든 페이지에서 Header/Footer가 뜨고 모바일 메뉴 동작함.

---

## Step 2: 홈 (허브 페이지)

스크롤 시 다음 섹션 순서:

### 2-1. Hero
**디자인**: `CLAUDE.md` 섹션 4-4의 mesh gradient 배경 적용. 우측에는
평면 벡터 일러스트 (책 + 나침반 또는 등대 모티프 권장, v1은 placeholder SVG).

- 오버라인 (eyebrow, 오렌지):
  > 품질 실무자를 위한 지식 베이스
- 헤드라인 (시안 — 사용자 최종 결정, 숫자 강조 패턴 활용):
  > **IATF부터 품질기술사까지,**
  > **하나의 사이트에서.**

  또는 auditsay 톤에 더 가깝게:
  > **품질 공부 <span class="text-brand-orange">3년</span>치 정리,**
  > **<span class="text-brand-orange">한 곳</span>에서.**

- 서브카피 (네이비/회색):
  > IATF 16949·ISO 9001·SPC·MSA부터 품질기술사 시험까지.
  > 정리된 지식과 실무 도구를 함께 제공합니다.
- 메타 라인 (가는 회색 한 줄):
  > IATF 16949 · ISO 9001 · SPC · MSA · FMEA · 품질기술사
- CTA 2개:
  - Primary (오렌지, 알약, 화살표): `학습 시작하기`
  - Secondary (흰 배경 + 보더): `도구 둘러보기`
- 일러스트 아래 또는 옆: 자매 사이트 로고 3개 가로 배열 (작게, 회색 톤)

### 2-2. 신뢰 배지 카드 (Trust Cards) — Hero 바로 아래
auditsay.com처럼 Hero 아래 3개 카드를 가로로:

```
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ ✓ 매주 업데이트  │ │ ✓ 실무 기반 정리 │ │ ✓ 시험·실무 통합 │
│   품질 최신 동향 │ │   30년 현장 경험 │ │   기술사 + IATF  │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```
- 위 카피는 시안. 사용자 결정에 따라 교체.
- 카드 디자인: `CLAUDE.md` 섹션 4-6 참조

### 2-3. 도구 카드 그리드 (Tools)
자매 사이트 3개를 카드로:
```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ AuditSay        │ │ APQP Manager    │ │ Gauge Manager   │
│ 심사 SaaS       │ │ APQP 문서 관리  │ │ 게이지 관리     │
│ IATF·ISO·VDA    │ │ PFMEA → PPAP    │ │ MSA·검교정      │
│ [방문하기 →]    │ │ [방문하기 →]    │ │ [방문하기 →]    │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```
각 카드는 호버 시 살짝 border 강조. 외부 링크 아이콘.

### 2-4. 학습 콘텐츠 미리보기
- 섹션 제목: "지금 배우기"
- 카테고리 4개 카드: IATF 16949, SPC, MSA, 품질기술사 시험
- 각 카드에 글 개수 표시 ("12개 노트")
- "전체 보기 →" 링크

### 2-5. 최근 블로그
- 최근 글 3개 가로 카드
- 썸네일 자리 (없으면 카테고리 색상 배경)
- 제목, 발행일, 카테고리 배지

### 2-6. CTA 푸터 섹션
- "품질 실무를 더 빠르게."
- 뉴스레터 구독 자리 (v1은 입력칸만, 동작 X — placeholder)

**완료 기준**: 홈 페이지 전 섹션이 모바일/데스크탑에서 정상 렌더링.

---

## Step 3: 학습 위키 (`/learn`)

### 3-1. 인덱스 페이지 (`/learn`)
- 좌측 사이드바: 카테고리 트리
  - IATF 16949
  - ISO 9001
  - SPC (통계적 공정관리)
  - MSA (측정시스템분석)
  - FMEA
  - 품질기술사 시험
- 메인: 카테고리별 글 카드 그리드

### 3-2. 동적 라우팅 (`/learn/[...slug]`)
- `content/learn/<category>/<slug>.mdx` 파일을 자동 라우팅
- 페이지 구성:
  - 상단: 카테고리 배지, 제목, 설명, 최종 수정일
  - 우측 사이드바 (데스크탑): 목차 (TOC) 자동 생성, 스크롤 추적
  - 본문: MDX 렌더링 (`prose` 스타일링)
  - 하단: 이전/다음 노트, "관련 도구" 섹션
- 시험 출제 영역(`exam_topic: true`)이면 배지 표시
- IATF 조항 매핑(`iatf_clause`)이 있으면 우측 메타에 표시

### 3-3. 샘플 콘텐츠
v1에 최소 3개 작성:
- `iatf-16949/overview.mdx` — IATF 16949 개요
- `spc/cp-cpk.mdx` — 공정능력지수 Cp/Cpk
- `qe-exam/syllabus.mdx` — 품질기술사 시험 출제 범위 정리

**중요**: 콘텐츠 내용은 placeholder로 표시하되 구조는 진짜처럼:
```mdx
---
title: 공정능력지수 Cp/Cpk
...
---

## 정의

[TODO: Cp와 Cpk의 정의 작성]

## 계산식

[TODO: 수식 — KaTeX 사용 예정]

## 해석 기준

[TODO: 1.33, 1.67 기준 설명]

## 관련 도구
실무에서 SPC 데이터 분석은 [Gauge Manager](https://gaugemanager.com)에서 가능합니다.
```

**완료 기준**: 3개 샘플이 라우팅되어 렌더링되고, 사이드바/TOC가 동작.

---

## Step 4: 블로그 (`/blog`)

### 4-1. 목록 (`/blog`)
- 글 카드 리스트 (세로 스택)
- 상단: 카테고리 필터 (선택 사항, v1 생략 가능)
- 페이지네이션 (10개씩)

### 4-2. 상세 (`/blog/[slug]`)
- 학습 노트와 유사한 레이아웃이되 TOC 없음
- 상단: 카테고리, 제목, 발행일, 읽기 시간
- 본문: MDX
- 하단: 관련 글 2-3개

### 4-3. 샘플 콘텐츠
- `blog/hello-world.mdx` — 첫 글 (사이트 소개)
- `blog/why-quality-hub.mdx` — 왜 이 사이트를 만들었는가

**완료 기준**: 블로그 목록/상세가 동작, RSS는 v2로 미룸.

---

## Step 5: 도구 페이지 (`/tools`)

- 자매 사이트 3개의 자세한 소개
- 각 도구별 섹션:
  - 한 줄 소개
  - 주요 기능 3-5개
  - 스크린샷 자리 (placeholder)
  - "사이트 방문" 버튼
- 하단: "어떤 도구가 필요한지 모르겠다면" 가이드 (간단한 질문 3개로 추천)

**완료 기준**: 페이지가 렌더링되고 외부 링크가 모두 동작.

---

## Step 6: 소개 페이지 (`/about`)

간단하게:
- 운영자 소개 (placeholder: `[TODO: 작성자 소개]`)
- 이 사이트의 미션
- 자매 도구들의 관계 설명 (왜 만들었는가)
- 연락처

**완료 기준**: 페이지 렌더링.

---

## Step 7: SEO 및 메타데이터

- `app/layout.tsx`에 기본 메타데이터 (제목, 설명, OG 이미지)
- 각 페이지 별 `generateMetadata` 함수
- `sitemap.ts` 자동 생성
- `robots.ts`
- 구조화 데이터 (Article, BreadcrumbList) — 학습/블로그 페이지

---

## Step 8: 배포 준비

- `.env.example` 작성 (v1은 환경변수 거의 없음)
- `README.md` 작성:
  - 프로젝트 소개
  - 로컬 실행 방법
  - 콘텐츠 추가 방법 (MDX 파일 추가하는 법)
  - 배포 방법
- Vercel 배포 가이드 별도 안내

---

## 사용자 결정 대기 항목

다음은 **사용자가 결정해야 진행 가능**한 항목들입니다. 만나면 멈추고 질문:

1. **회사명 / 도메인** — 정해지면 메타데이터, README, 푸터 업데이트
2. **로고** — 텍스트로 시작, 이미지 받으면 교체
3. **운영자 프로필 정보** — `/about`에 들어갈 내용
4. **자매 사이트 정확한 URL과 한 줄 설명** — 현재 추정으로 작성됨
5. **블로그/학습 첫 콘텐츠 톤** — 1편 작성하면 그 톤을 기준으로 함

---

## 작업 순서 요약

Step 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

각 Step 완료 후 `git commit`. 메시지는 `feat: step N — <설명>` 형식.

질문 있으면 진행 멈추고 물어보세요.
