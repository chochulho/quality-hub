# Quality Hub

품질 실무자가 IATF 16949·품질기술사 시험·실무 도구를 한 곳에서 만나는 지식 베이스.

## 기술 스택

- **Next.js 15** (App Router, Server Components)
- **TypeScript** (strict mode)
- **Tailwind CSS v4** + shadcn/ui
- **MDX** (`@next/mdx` + `next-mdx-remote`)
- **Vercel** 배포

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 확인.

## 콘텐츠 추가

### 학습 노트 추가

`content/learn/<카테고리>/<슬러그>.mdx` 파일 생성:

```yaml
---
title: 제목
description: 한 줄 설명
category: spc          # iatf-16949 | iso-9001 | spc | msa | fmea | qe-exam
tags: [태그1, 태그2]
exam_topic: true       # 품질기술사 시험 출제 영역이면 true
iatf_clause: "8.3.5"  # 관련 IATF 조항 (선택)
updated: 2026-05-16
---

본문을 Markdown/MDX 형식으로 작성하세요.
```

파일 저장 시 자동으로 `/learn/<카테고리>/<슬러그>` 라우팅됩니다.

### 블로그 글 추가

`content/blog/<슬러그>.mdx` 파일 생성:

```yaml
---
title: 글 제목
description: 설명
category: 품질일반
date: 2026-05-16
tags: [태그]
---

본문
```

## 배포

Vercel에 GitHub 저장소를 연결하면 자동 배포됩니다.

1. [Vercel](https://vercel.com)에서 프로젝트 Import
2. GitHub 저장소 연결
3. 기본 설정으로 Deploy

## 자매 사이트

| 사이트 | 역할 |
|---|---|
| [auditsay.com](https://auditsay.com) | IATF·ISO 심사 SaaS |
| [apqpmanager.com](https://apqpmanager.com) | APQP 5문서 관리 SaaS |
| [gaugemanager.com](https://gaugemanager.com) | 게이지 관리 SaaS |
