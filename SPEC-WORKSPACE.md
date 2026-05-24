# SPEC-WORKSPACE.md (v2)

quality-hub 프로젝트의 워크스페이스 분리 / 멀티테넌트 / 요금제 / 별도 도메인 통합 / 도구 카테고리 스펙.
기존 `CLAUDE.md`와 `SPEC.md`(Steps 0–8)를 보완한다. 충돌 시 본 문서가 우선한다.

> **상태:** 회원가입 정식 오픈 전 (D-30 기준). 회사명·도메인 미정.
> 본 스펙은 오픈 전까지 코드 구조·데이터 모델·도구 포지셔닝을 완성도 있게 잡는 것이 목표.

> **v2 변경점 요약:**
> - 도구를 **3개 카테고리**로 재정렬 (유료 SaaS / 무료 계산 도구 / 시험 학습 코너).
> - FMEA를 APQP Manager의 핵심 차별화 자산으로 명시 + 체험 데모 추가.
> - VSM/Kanban은 시험 학습 코너로 분리, 베타 기간 일부 숨김.
> - 라우트 구조에 `/calculators`, `/learn/exam` 추가.
> - 블로그 콘텐츠 캘린더 (FMEA 5편 우선) 추가.

---

## 0. 핵심 원칙

1. **하나의 사이트, 두 개의 경험.** 비로그인/둘러보기 사용자(마케팅)와 로그인한 기업 회원(워크스페이스)은 완전히 다른 레이아웃·네비게이션·정보 구조를 가진다.
2. **단일 백엔드, 다중 프론트 도어.** auditsay.com / apqpmanager.com / gaugemanager.com 같은 별도 도메인은 마케팅 사이트 + 가입 게이트웨이일 뿐, 인증·결제·테넌트 데이터는 quality-hub 백엔드 하나로 통합한다.
3. **권한은 미들웨어에서 결정한다.** 도구별 접근 가능 여부는 `organization.plan.tool_entitlements`로만 판단하고, 라우트 컴포넌트 안에서 분기하지 않는다.
4. **Free 등급이 영업한다.** 가입 장벽은 0원. 무료 계산 도구·위키·블로그가 검색 유입을 받아 유료 전환으로 연결한다.
5. **가격은 한국 중소기업 시장 기준선에 맞춘다.** 이카운트(₩40,000)와 영림원(₩300,000~) 사이가 quality-hub의 가격대.
6. **도구는 3개 카테고리로 분리.** 유료 SaaS / 무료 계산 도구 / 시험 학습 코너. 정체성이 다른 도구를 한 위계에 두지 않는다.
7. **미완성 도구는 숨긴다.** 베타 기간 동안 완성도 부족한 학습 도구는 "준비 중" 처리. 어정쩡한 노출은 전체 신뢰를 떨어뜨린다.

---

## 1. 도구 카테고리 (v2 핵심)

| 카테고리 | 도구 | 위치 | 성격 | 가입 필요 |
|---|---|---|---|---|
| **유료 SaaS** | AuditSay, NC Manager, APQP Manager, Gauge Manager, 4M Change Manager | `/tools/*` (소개) → 워크스페이스 | 운영 시스템 | 유료 플랜 |
| **무료 계산 도구** | SPC 분석기, QC 7가지 도구, FMEA 체험 데모 | `/calculators/*` | 매일 쓰는 실무 도구 / SEO 미끼 | 불필요 (일부 게이트) |
| **시험 학습 코너** | 신QC 7가지, QFD, VSM 시뮬레이터, Kanban 시뮬레이터 | `/learn/exam/*` | 품질기술사·품질기사 시험 대비 | 불필요 |

**APQP Manager의 차별화 — AI 대화형 FMEA (AIAG-VDA):**
- APQP Manager는 단순 양식 도구가 아니라 **AI 챗봇과 대화하면서 AIAG-VDA FMEA를 작성**하는 도구.
- 이게 quality-hub의 가장 강력한 차별화 포인트. 마케팅 전반에 명시.
- 무료 계산 도구의 "FMEA 체험 데모"가 이 SaaS로 가는 핵심 진입로.

**시험 학습 코너 정체성:**
- 품질기술사·품질기사 시험 준비생 대상.
- 실무 도구가 아님을 명시 (기대 수준 맞춤).
- 베타 기간 동안 VSM/Kanban은 "준비 중" 처리. 완성도 가다듬은 후 단계적 공개.
- 시험 콘텐츠는 검색 유입의 댐 역할 (직접 수익 없지만 브랜드 친밀도·미래 의사결정자 확보).

---

## 2. Next.js 15 라우트 구조 (App Router + Route Groups)

```
app/
├── (marketing)/                      # 비로그인 + 둘러보기
│   ├── layout.tsx                    # pill-shaped sticky header, blog/pricing/qna 노출
│   ├── page.tsx                      # 랜딩 (히어로 + 도구 소개 + CTA)
│   │
│   ├── blog/                         # 블로그 (MDX)
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   │
│   ├── wiki/                         # IATF 16949 / 품질 학습 위키
│   │   ├── page.tsx
│   │   └── [...slug]/page.tsx
│   │
│   ├── calculators/                  # 무료 계산 도구 (NEW v2)
│   │   ├── page.tsx                  # 계산 도구 허브
│   │   ├── spc/                      # SPC 분석기
│   │   │   ├── page.tsx              # /calculators/spc (랜딩)
│   │   │   ├── cpk/page.tsx          # /calculators/spc/cpk
│   │   │   ├── xbar-r/page.tsx       # X-bar R 관리도
│   │   │   ├── i-mr/page.tsx
│   │   │   └── p-chart/page.tsx
│   │   └── qc7/                      # QC 7가지 도구
│   │       ├── page.tsx
│   │       ├── pareto/page.tsx       # 파레토
│   │       ├── histogram/page.tsx
│   │       ├── fishbone/page.tsx     # 특성요인도
│   │       ├── check-sheet/page.tsx
│   │       ├── scatter/page.tsx
│   │       └── stratification/page.tsx
│   │
│   ├── learn/                        # 학습 코너 (NEW v2)
│   │   ├── page.tsx
│   │   └── exam/
│   │       ├── pqe/                  # 품질기술사
│   │       │   ├── page.tsx
│   │       │   ├── lean/             # Lean 시뮬레이터 (베타 기간 일부 숨김)
│   │       │   │   ├── vsm/page.tsx
│   │       │   │   └── kanban/page.tsx
│   │       │   ├── n7qc/page.tsx     # 신QC 7가지
│   │       │   └── qfd/page.tsx
│   │       └── pqi/                  # 품질기사
│   │           └── page.tsx
│   │
│   ├── tools/                        # SaaS 도구 소개 (마케팅)
│   │   ├── auditsay/page.tsx
│   │   ├── apqp/                     # APQP Manager 소개
│   │   │   ├── page.tsx              # AI 대화형 FMEA 강조
│   │   │   └── fmea-demo/page.tsx    # FMEA 체험 데모 (NEW v2)
│   │   ├── gauge/page.tsx
│   │   ├── nc/page.tsx
│   │   └── 4m/page.tsx
│   │
│   ├── pricing/page.tsx              # 요금제 비교 테이블
│   ├── compare/page.tsx              # "자체 구축 vs 구독" 비교
│   ├── qna/page.tsx                  # 공개 Q&A
│   ├── login/page.tsx
│   └── signup/page.tsx
│
├── (workspace)/                      # 로그인한 기업 회원 (organizationId 필수)
│   ├── layout.tsx                    # 회사 로고 + 도구 네비, blog/pricing/qna 링크 없음
│   ├── dashboard/page.tsx            # 가입한 도구 카드 + 미가입 도구 잠금 카드(업셀)
│   ├── tools/
│   │   ├── auditsay/...
│   │   ├── apqp/...                  # AI 대화형 FMEA 풀버전 포함
│   │   ├── gauge/...
│   │   ├── nc/...
│   │   └── 4m/...
│   ├── members/                      # 인원 관리 (admin/owner만)
│   ├── sites/                        # 사업장 관리 (admin/owner만)
│   ├── billing/                      # 결제·요금제 (owner만)
│   │   └── upgrade/page.tsx          # 권한 없는 도구 접근 시 도착
│   ├── reference/                    # 워크스페이스 내 참고 자료
│   │   ├── wiki/                     # 위키 재노출
│   │   └── calculators/              # 계산 도구 재노출
│   └── settings/
│
└── (admin)/                          # 슈퍼관리자 (운영자 콘솔)
    └── ...
```

**규칙:**

- `(workspace)/layout.tsx`에는 마케팅 링크(블로그·요금제·Q&A·외부 위키)를 **절대 노출하지 않는다.**
- 워크스페이스 헤더: 회사명/로고, 현재 사용 가능한 도구 메뉴, 관리자 영역, 알림, 사용자 메뉴.
- 마케팅 헤더와 워크스페이스 헤더는 **별도 컴포넌트**로 구현. 같은 컴포넌트에서 prop으로 분기하지 않는다.
- 로그인한 사용자가 `/`에 접근하면 `/dashboard`로 자동 리다이렉트.
- 단 `/blog`, `/wiki`, `/qna`, `/calculators`, `/learn`은 로그인 상태여도 마케팅 레이아웃으로 보여줄 수 있음. 워크스페이스에서 다시 들어오면 `/reference/*`로 재노출.
- 계산 도구는 **로그인 없이 즉시 사용 가능**. 단, 결과 PDF 다운로드·이력 저장 등 일부 기능은 회원 게이트.

---

## 3. 데이터 모델 (Supabase / Postgres)

```sql
-- 조직(테넌트)
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan_id text references plans(id) default 'free',
  region text default 'KR',
  source_domain text,                        -- 'quality-hub' | 'auditsay' | 'apqp' | 'gauge'
  trial_ends_at timestamptz,
  created_at timestamptz default now()
);

-- 요금제
create table plans (
  id text primary key,                       -- 'free' | 'starter' | 'team' | 'business' | 'enterprise'
  name text,
  price_krw_monthly int,
  price_krw_yearly int,
  tool_entitlements jsonb,
  selectable_tool_count int,
  max_members int,
  max_sites int,
  features jsonb,
  is_public boolean default true,
  sort_order int
);

-- 조직별 선택한 도구
create table org_selected_tools (
  org_id uuid references organizations(id) on delete cascade,
  tool_key text,
  selected_at timestamptz default now(),
  primary key (org_id, tool_key)
);

-- 도구 활성화 오버라이드
create table org_tool_overrides (
  org_id uuid references organizations(id) on delete cascade,
  tool_key text,
  enabled boolean,
  expires_at timestamptz,
  reason text,
  primary key (org_id, tool_key)
);

-- 조직 멤버
create table org_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text default 'member',
  site_id uuid references org_sites(id),
  invited_email text,
  status text default 'active',
  created_at timestamptz default now(),
  unique(org_id, user_id)
);

-- 사업장
create table org_sites (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade,
  name text,
  country text default 'KR',
  timezone text default 'Asia/Seoul',
  is_primary boolean default false,
  created_at timestamptz default now()
);

-- FMEA 체험 데모 사용 로그 (NEW v2)
create table fmea_demo_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),    -- nullable (비로그인 가능)
  scenario_key text,                         -- 'brake_pedal' | 'bms_battery' | ...
  turn_count int default 0,
  completed boolean default false,
  converted_to_signup boolean default false,
  ip_hash text,                              -- IP rate limit용 (해시)
  created_at timestamptz default now()
);

-- 계산 도구 사용 로그 (간단 통계, 익명)
create table calculator_usage (
  id uuid primary key default gen_random_uuid(),
  tool_key text,                             -- 'spc.cpk' | 'qc7.pareto' | ...
  user_id uuid references auth.users(id),
  used_at timestamptz default now()
);

-- 도구별 데이터: auditsay_*, apqp_*, gauge_*, nc_*, fourm_*
-- 모든 도구 테이블은 org_id 컬럼 필수 + RLS 적용.
```

**RLS 정책:**
- 모든 워크스페이스 테이블: `org_id = (auth.jwt() ->> 'org_id')::uuid`.
- 관리자 전용 작업: `role in ('owner','admin')` 추가.
- `billing/*`: `role = 'owner'`만.
- `fmea_demo_sessions`, `calculator_usage`: 익명 INSERT 허용, SELECT는 본인 또는 운영자.

---

## 4. 요금제 (시드 데이터)

| Plan | 포함 도구 | Seats | Sites | 월 ₩ | 연납 ₩ |
|---|---|---|---|---|---|
| **Free** | 계산 도구 전체 + 위키 + 블로그 + 학습 코너 + AuditSay 체험 + FMEA 데모 | 3 | 1 | 0 | 0 |
| **Starter** | 도구 1개 선택 | 10 | 1 | 49,000 | 490,000 |
| **Team** | 도구 3개 선택 | 30 | 2 | 149,000 | 1,490,000 |
| **Business** | 전체 5개 도구 | 80 | 3 | 390,000 | 3,900,000 |
| **Enterprise** | 전체 + SSO + 감사로그 + 전담 지원 | 무제한 | 무제한 | 견적 | 견적 |

**Add-on:**
- 추가 seat: +₩5,000/seat/월
- 추가 site: +₩30,000/site/월
- SSO/SAML: Business +₩200,000/월 (Enterprise 포함)
- 감사로그/장기 보존: Enterprise 포함

**시드 데이터:**

```sql
insert into plans (id, name, price_krw_monthly, price_krw_yearly, tool_entitlements, selectable_tool_count, max_members, max_sites, features, is_public, sort_order) values
('free',       'Free',       0,      0,       '{"auditsay":"readonly","calculators":true,"wiki":true,"blog":true,"learn":true,"fmea_demo":true}'::jsonb, 0, 3,    1,  '{"sso":false,"audit_log":false}'::jsonb, true, 1),
('starter',    'Starter',    49000,  490000,  '{"selectable":true,"calculators":true}'::jsonb,                                                                1, 10,   1,  '{"sso":false,"audit_log":false}'::jsonb, true, 2),
('team',       'Team',       149000, 1490000, '{"selectable":true,"calculators":true}'::jsonb,                                                                3, 30,   2,  '{"sso":false,"audit_log":false}'::jsonb, true, 3),
('business',   'Business',   390000, 3900000, '{"auditsay":true,"apqp":true,"gauge":true,"nc":true,"4m":true,"calculators":true}'::jsonb,                      5, 80,   3,  '{"sso":"addon","audit_log":false}'::jsonb, true, 4),
('enterprise', 'Enterprise', null,   null,    '{"auditsay":true,"apqp":true,"gauge":true,"nc":true,"4m":true,"calculators":true}'::jsonb,                      5, -1,   -1, '{"sso":true,"audit_log":true,"dedicated_support":true}'::jsonb, false, 5);
```

**연납 할인:** 월 × 10 (2개월 무료).

**베타 가격:**
- 오픈 후 6개월간 유료 플랜 50% 할인.
- 베타 가입자는 정가 전환 후 12개월간 베타 가격 유지.

---

## 5. 도구 접근 권한 체크 (미들웨어)

```ts
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { hasToolAccess } from '@/lib/entitlements'

const TOOL_ROUTES: Record<string, string> = {
  '/tools/auditsay': 'auditsay',
  '/tools/apqp':     'apqp',
  '/tools/gauge':    'gauge',
  '/tools/nc':       'nc',
  '/tools/4m':       '4m',
}

const WORKSPACE_PREFIXES = ['/dashboard', '/members', '/sites', '/billing', '/settings', '/reference']

// 비로그인 허용 경로 (계산 도구·학습·콘텐츠)
const PUBLIC_PREFIXES = ['/calculators', '/learn', '/blog', '/wiki', '/qna', '/pricing', '/compare', '/tools']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1. 퍼블릭 경로 통과 (단, /tools/*는 마케팅 소개 페이지만 퍼블릭)
  if (PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // 2. 워크스페이스 경로면 세션 필수
  if (WORKSPACE_PREFIXES.some(p => pathname.startsWith(p))) {
    const session = await getSession(req)
    if (!session) {
      const url = new URL('/login', req.url)
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }

    // 3. 워크스페이스 도구 entitlement 체크
    // /dashboard/tools/[tool] 경로에서만 권한 체크
    for (const [prefix, toolKey] of Object.entries(TOOL_ROUTES)) {
      const wsPrefix = `/dashboard${prefix}` // 예: /dashboard/tools/apqp
      if (pathname.startsWith(wsPrefix)) {
        const allowed = await hasToolAccess(session.orgId, toolKey)
        if (!allowed) {
          const url = new URL('/billing/upgrade', req.url)
          url.searchParams.set('tool', toolKey)
          return NextResponse.redirect(url)
        }
      }
    }
  }

  // 4. 로그인 상태에서 / 또는 /pricing 진입 시 dashboard로
  if (pathname === '/' || pathname === '/pricing') {
    const session = await getSession(req)
    if (session) return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|.*\\.).*)'],
}
```

**`hasToolAccess` 구현:**

```ts
// lib/entitlements.ts
export async function hasToolAccess(orgId: string, toolKey: string): Promise<boolean> {
  // 1. override 우선
  const override = await db.org_tool_overrides.findUnique({
    where: { org_id_tool_key: { org_id: orgId, tool_key: toolKey } }
  })
  if (override && (!override.expires_at || override.expires_at > new Date())) {
    return override.enabled
  }

  // 2. plan의 tool_entitlements
  const org = await db.organizations.findUnique({
    where: { id: orgId },
    include: { plan: true }
  })
  if (!org) return false

  const entitlements = org.plan.tool_entitlements
  if (entitlements[toolKey] === true) return true
  if (entitlements[toolKey] === 'readonly') return true

  // 3. selectable 플랜이면 org_selected_tools 확인
  if (entitlements.selectable === true) {
    const selected = await db.org_selected_tools.findUnique({
      where: { org_id_tool_key: { org_id: orgId, tool_key: toolKey } }
    })
    return !!selected
  }

  return false
}
```

---

## 6. 마케팅 vs 워크스페이스 헤더

**MarketingHeader** (`(marketing)/_components/marketing-header.tsx`):
- 로고 (Quality Hub)
- 네비 (v2): **학습 / 계산 도구 / 도구(SaaS) / 블로그 / 요금제 / 지원**
  - "학습" 드롭다운: 위키 + 시험 학습 코너
  - "계산 도구" 드롭다운: SPC, QC 7가지, FMEA 데모
  - "도구(SaaS)" 드롭다운: 5개 SaaS 소개 페이지
- 우측: 로그인 / 무료 시작하기
- pill-shaped sticky, 메시 그라디언트 배경 위에 floating
- 브랜드 컬러: orange `#F26B3A` + navy `#2B4B8C`

**WorkspaceHeader** (`(workspace)/_components/workspace-header.tsx`):
- 회사 로고 (없으면 회사명 텍스트)
- 네비: 대시보드 / 가입한 도구 (동적) / 인원(admin+) / 사업장(admin+) / 결제(owner) / 참고자료
- 우측: 알림 / 사용자 메뉴
- 단색 배경 (navy 라인 액센트), 마케팅 톤 제거

**금지:**
- 워크스페이스에 마케팅 헤더 노출 금지. 반대도.
- 워크스페이스 컴포넌트에서 메시 그라디언트·따뜻한 오렌지 자제.

---

## 7. 무료 계산 도구 명세 (NEW v2)

### 7.1 SPC 분석기 (`/calculators/spc/*`)

**최우선 자산.** 매일 쓰이고 SEO 강력.

**기능:**
- 데이터 입력: 붙여넣기 / CSV 업로드 / 직접 입력
- 공정능력: Cp, Cpk, Pp, Ppk, Cpm
- 관리도: X-bar R, X-bar S, I-MR (계량형) / p, np, c, u (계수형) — 최소 5종
- 결과: 차트(PNG 다운로드) + 통계 요약 + 공정 능력 등급 판정
- **회원 게이트:** PDF 리포트, 데이터 이력 저장

**별도 URL (SEO):**
- `/calculators/spc` — 허브
- `/calculators/spc/cpk` — "Cp Cpk 계산기"
- `/calculators/spc/xbar-r` — "X-bar R 관리도"
- `/calculators/spc/i-mr` — "I-MR 관리도"
- `/calculators/spc/p-chart` — "p 관리도 부적합품률"

**SEO 키워드:** "공정능력지수 계산", "Cp Cpk 계산기", "관리도 작성", "SPC 엑셀 대체"

**전환 동선:**
- 결과 화면 우측: "이 데이터를 회사 표준으로 추적하려면 → Gauge Manager / APQP Manager로 자동 이관" CTA.

### 7.2 QC 7가지 도구 (`/calculators/qc7/*`)

**SEO 광폭.** 품질기사 시험 + 사내 교육 수요.

**7개 별도 페이지:**
- `/calculators/qc7/pareto` — 파레토 차트
- `/calculators/qc7/histogram` — 히스토그램
- `/calculators/qc7/fishbone` — 특성요인도 (인터랙티브 작성 UI, 강력)
- `/calculators/qc7/check-sheet` — 체크시트
- `/calculators/qc7/scatter` — 산점도
- `/calculators/qc7/stratification` — 층별
- 관리도는 SPC 분석기로 통합 링크

**공통 패턴:** 도구 설명(상단) + 인터랙티브 도구(중앙) + 사용 예시(하단) + 위키 학습 링크 + 관련 SaaS CTA.

### 7.3 FMEA 체험 데모 (`/tools/apqp/fmea-demo`) — v2 핵심 신규

**전략적 위치:** APQP Manager의 AI 대화형 FMEA를 짧게 체험하게 하는 미끼.

**동작:**
1. 미리 정의된 시나리오 선택 (3-5개):
   - "브레이크 페달 어셈블리 PFMEA"
   - "전기차 BMS 배터리 DFMEA"
   - "사출 성형 공정 PFMEA"
   - "PCB 어셈블리 PFMEA"
2. AI 챗봇과 3-5턴 대화 (Function/Failure Mode/Effect/Cause/Control)
3. AIAG-VDA 양식으로 결과 표시 (Severity/Occurrence/Detection 추천 + AP 판정)
4. **결과 PDF 1장 다운로드 (게이트):** 이메일 입력 → Free 가입 자동 처리
5. 완료 후 CTA: "내 회사 FMEA를 전체 작성하려면 → APQP Manager (Team 플랜)"

**로깅:** `fmea_demo_sessions`에 turn_count, completed, converted_to_signup, ip_hash 기록.

**비용 관리:**
- AI 호출 토큰 비용 발생 → 시나리오 응답 부분 캐싱 + 저비용 모델(Haiku 등) 우선.
- 비로그인 IP당 1일 1세션 제한 (ip_hash 기반).

**우선순위:** §14에서 3-4주차 작업. 베타 오픈 이후도 OK.

---

## 8. 시험 학습 코너 (`/learn/exam/*`) — NEW v2

### 8.1 정체성

- **품질기술사·품질기사 시험 대비** 명확히 표방.
- 실무 도구가 아님을 안내 (기대 수준 맞춤).
- 검색 유입의 댐 — 직접 수익 없지만 브랜드 친밀도 + 미래 의사결정자 확보.

### 8.2 구조

```
/learn/                              # 학습 허브
├── /learn/exam/pqe                  # 품질기술사
│   ├── /learn/exam/pqe/lean         # Lean 시뮬레이터
│   │   ├── /vsm                     # VSM (베타 기간 "준비 중")
│   │   └── /kanban                  # Kanban (베타 기간 "준비 중")
│   ├── /learn/exam/pqe/n7qc         # 신QC 7가지
│   └── /learn/exam/pqe/qfd          # QFD / HOQ
└── /learn/exam/pqi                  # 품질기사
    └── ...
```

### 8.3 베타 기간 정책

- **VSM/Kanban은 "준비 중" 처리.** 완성도 부족 = 노출 손해. 가다듬은 후 단계적 공개.
- 신QC 7가지·QFD는 학습 자료 + 가벼운 도구로 가능하면 베타에 포함.
- 위키와 연결: 각 항목에서 "관련 위키 학습" 링크.

### 8.4 콘텐츠 패턴

각 학습 도구 페이지:
1. 도구 개요 (학습 목표)
2. 시험 출제 빈도 / 난이도
3. 인터랙티브 시뮬레이터 (가능한 경우)
4. 예제 문제 1-2개
5. 위키 심화 학습 링크

### 8.5 "준비 중" 컴포넌트

```tsx
// components/coming-soon-page.tsx
<ComingSoonPage 
  feature="VSM 시뮬레이터"
  description="가치흐름지도 학습 시뮬레이터를 가다듬고 있습니다."
  expectedDate="2026년 Q3 공개 예정"
  notifyEmail={true}
/>
```

이메일 등록 시 Free 가입으로 자동 처리. 공개 시 알림.

---

## 9. 멀티 도메인 운영 (auditsay / apqpmanager / gaugemanager)

| 도메인 | 역할 |
|---|---|
| (메인 quality-hub 도메인, 미정) | 마케팅 + 워크스페이스 호스트 |
| auditsay.com | AuditSay 마케팅 + 가입 게이트웨이 |
| apqpmanager.com | APQP Manager 마케팅 + 가입 게이트웨이 (**FMEA AI 강조**) |
| gaugemanager.com | Gauge Manager 마케팅 + 가입 게이트웨이 |

**동작:**
1. 별도 도메인 사이트는 마케팅 + Starter 단일 도구 가입 폼만 제공.
2. 가입 폼은 모두 `POST /api/signup`로 전송, `source_domain` 함께 전달.
3. 가입 즉시 백엔드는 동일한 `organizations` 레코드 생성:
   - `plan_id = 'starter'`
   - `source_domain = 'apqp'` (또는 해당 도메인)
   - `org_selected_tools`에 해당 도구 1개 자동 INSERT
4. 로그인은 메인 서브도메인에서 처리. 별도 도메인의 "로그인" 클릭 시 메인으로 리다이렉트.
5. 로그인 후 워크스페이스 대시보드: "다른 도구 추가하기 → Team으로 업그레이드" 업셀.

**가격 정합성:** 어느 입구든 Starter ₩49,000/월 (도구 1개). 충돌 없음.

**apqpmanager.com 특화:**
- 메인 랜딩에 **"AI와 대화하면서 AIAG-VDA FMEA 작성"** 메시지 전면 배치.
- FMEA 데모(`/fmea-demo`)를 메인 CTA로.
- 별도 도메인이라서 더 깊게 강조 가능 — quality-hub 전체의 가장 강력한 차별화.

---

## 10. 콘텐츠 전략 (블로그 + 위키)

### 10.1 블로그 — FMEA 시리즈 우선 5편

quality-hub의 차별화는 AI 대화형 FMEA. 블로그 첫 5편은 FMEA로 검색 키워드를 잡는다.

**우선 5편:**

| 우선 | 제목 | 타겟 키워드 | CTA |
|---|---|---|---|
| 1 | AIAG-VDA FMEA 작성법 — 7단계 완전 가이드 | "AIAG VDA FMEA", "FMEA 작성법" | FMEA 데모 |
| 2 | DFMEA vs PFMEA — 차이와 사용 시점 | "DFMEA PFMEA 차이" | FMEA 데모 |
| 3 | AP(Action Priority) 판정 기준 — RPN과 무엇이 다른가 | "Action Priority RPN", "AP FMEA" | FMEA 데모 |
| 4 | FMEA Severity 점수 매기는 실무 기준 | "FMEA Severity 점수" | FMEA 데모 |
| 5 | 고객 클레임 → FMEA 반영 방법 | "고객 클레임 FMEA" | NC Manager + APQP Manager |

**공통 CTA:** 글 하단에 `<RelatedToolCTA>` MDX 컴포넌트. "AI와 대화로 FMEA 자동 작성 → 14일 무료 체험".

### 10.2 사례 분석 시리즈 (2차)

- "브레이크 호스 어셈블리 PFMEA 작성 사례" (가상 시나리오 명시)
- "전기차 BMS 배터리 DFMEA 핵심 포인트"
- "사출 성형 공정 PFMEA 흔한 실수 5가지"

**중요:** 실제 회사 사례 금지. 가상 시나리오 명시. 신뢰도 + 법적 안전.

### 10.3 비교 글 (3차)

- "AIAG-VDA FMEA 도구 비교 — APIS IQ-FMEA / PLATO SCIO / quality-hub APQP Manager"
- 객관적 사실 기반. 한국 SaaS 대부분 안 하는 영역.

### 10.4 위키 — 핵심 30개 항목

IATF 16949 핵심 절(節) + 품질기사 출제 빈도 높은 주제 우선.

---

## 11. 가격 부담 완화 페이지 (`/compare`)

| 항목 | 자체 구축 | quality-hub Business |
|---|---|---|
| 초기 비용 | ₩30,000,000~ | ₩0 |
| 구축 기간 | 6개월~1년 | 1주일 |
| 연간 운영비 | ₩15,000,000~ | ₩4,680,000 |
| 유지보수 인력 | 전담 1명 필요 | 없음 |
| 표준 업데이트 | 별도 비용 | 자동 |
| IATF 개정 대응 | 자체 분석 필요 | 즉시 반영 |
| AIAG-VDA FMEA AI 작성 | **불가능** | **포함** |

마지막 행이 차별화 강조. `/pricing` 페이지에서 "왜 이 가격인가?" 링크로 연결.

---

## 12. 워크스페이스 대시보드

- **상단 위젯:** 회사명 / 현재 플랜 / seats 사용량 / sites 사용량.
- **가입한 도구 카드:** 클릭 시 도구로 이동, 최근 활동/통계 미리보기.
- **미가입 도구 카드:** 잠금 아이콘 + "Team으로 업그레이드하면 사용 가능" CTA.
- **하단:** "참고 자료" — 위키, 계산 도구, 학습 코너 링크.

---

## 13. 랜딩 페이지 카피 수정 사항

### 히어로 카피
- 현재: "QMS, 직접 만들지 않아도 됩니다."
- 제안 A: "**6개월** QMS 구축을 **1주일**로." (숫자는 brand orange `#F26B3A`)
- 제안 B: "**AI와 대화로** FMEA·APQP·심사·게이지·변경관리. **5분** 만에 시작하세요."

### 도구 뱃지 / 카피 매핑 수정
- 현재 카피: "심사·APQP·게이지·SPC·교육"
- 현재 뱃지: AuditSay / NC Manager / APQP Manager / Gauge Manager / 4M Change Manager
- 불일치: "SPC"·"교육"이 어느 도구인지 불명확.
- **정합 안:** 카피를 "심사·APQP·게이지·**부적합**·**변경관리**"로 변경 → 뱃지와 1:1 매핑.
- SPC는 무료 계산 도구로 별도 노출 ("Bonus: 무료 SPC 분석기 포함").
- 교육은 학습 코너로 별도 노출.

### "내장 도구 (무료)" 영역 재디자인
- 카테고리 명칭: "**무료 계산 도구 — 회원가입 없이 즉시 사용**"
- 회색 도트 제거. 각 도구에 brand 컬러 아이콘.
- 카드 형식:

```
[SPC]  공정능력 분석 (Cp/Cpk)
       엑셀 없이 1분 만에. 데이터 붙여넣기만 하세요.
       → 바로 사용하기 →

[QC7]  QC 7가지 도구
       파레토·히스토그램·피쉬본 인터랙티브 작성
       → 도구 선택하기 →

[FMEA] FMEA 체험 (AI 대화형, AIAG-VDA)
       AI와 대화하면서 FMEA 자동 작성. 3분 체험.
       → 데모 시작하기 →
```

- 학습 도구는 "더 알아보기 → 학습 코너" 링크 하나로 정리.

### 비자동차 회사 메시지
- 랜딩 스크롤 하단: "**자동차가 아닌 회사도** AuditSay·Gauge·APQP를 단독으로 사용할 수 있습니다."

### 신뢰 요소
- 도입사 로고 / 후기 / 보안 정책.
- "중소벤처기업부 클라우드 바우처 지원 사업 신청 가능" 배지.

---

## 14. 회원가입 정식 오픈까지 D-30 우선순위

| 우선 | 작업 | 이유 |
|---|---|---|
| 🔥 즉시 | VSM·Kanban을 메인에서 숨기고 `/learn/exam/pqe/lean/`(준비 중) 이동 | 미완성 노출 = 신뢰 손실 |
| 🔥 즉시 | "내장 도구(무료)" → "무료 계산 도구"로 명칭 변경, 회색 도트 제거 | 가치 시각화 |
| 🔥 즉시 | SPC 분석기 / QC 7가지 도구 별도 URL 분할 (`/calculators/*`) | SEO 즉효 |
| 🔥 즉시 | Route group 분리 — `(marketing)` / `(workspace)` | 구조 기초 |
| 🔥 1주차 | WorkspaceHeader / MarketingHeader 분리 | 정체성 분리 |
| 🔥 1주차 | DB 마이그레이션 (8개 테이블) | 인프라 |
| 🔥 1주차 | RLS 정책 적용 | 보안 |
| 🟠 2주차 | 미들웨어 entitlement 체크 | 권한 분기 |
| 🟠 2주차 | `/pricing` 페이지 (DB plans에서 렌더) | 가격 노출 |
| 🟠 2주차 | `/compare` 페이지 | 가격 부담 완화 |
| 🟠 2주차 | `/billing/upgrade?tool=xxx` 페이지 | 업셀 동선 |
| 🟠 2주차 | 랜딩 히어로 카피 + 도구 뱃지 매핑 수정 (§13) | 메시지 일관성 |
| 🟠 2-3주차 | 블로그 FMEA 시리즈 5편 작성 (§10.1) | 콘텐츠 자산 |
| 🟠 3주차 | `/tools/apqp` 도구 소개 페이지 — AI FMEA 강조 | 차별화 명시 |
| 🟠 3주차 | `<RelatedToolCTA>` MDX 컴포넌트 | 전환 동선 |
| 🟡 3-4주차 | FMEA 체험 데모 MVP (`/tools/apqp/fmea-demo`) | 강력한 진입로 |
| 🟡 3-4주차 | 워크스페이스 대시보드 (가입/미가입 도구 카드) | 업셀 |
| 🟡 4주차 | 인원/사업장 관리 페이지 | 운영 |
| 🟡 4주차 | 가입 API 단일화 (`/api/signup`, source_domain) | 멀티 도메인 통합 |
| 🟢 베타 이후 | 시험 학습 코너 가다듬기, VSM/Kanban 단계 공개 | 트래픽 보면서 |
| 🟢 베타 이후 | 사례 분석 / 비교 블로그 | 콘텐츠 확장 |

---

## 15. Claude Code 작업 시 톤

- 새 페이지: marketing/workspace/admin 중 어디인지 명시.
- 새 도구 추가: `plans.tool_entitlements`에 키 + `TOOL_ROUTES` 매핑 업데이트.
- 워크스페이스 컴포넌트: 메시 그라디언트·따뜻한 오렌지 자제. navy 기반 차분한 톤.
- 가격: §4 시드 데이터를 단일 진실 공급원으로. 하드코딩 금지. `/pricing`은 DB에서 읽어 렌더.
- 회사명/도메인 미정 → `process.env.NEXT_PUBLIC_BRAND_NAME`, `NEXT_PUBLIC_APP_DOMAIN`. 코드에 "Quality Hub" 직접 박지 말 것.
- 가격 표시는 `formatKRW(amount)` 헬퍼로 통일.
- 계산 도구는 **로그인 없이 즉시 사용 가능**. 미들웨어에서 `/calculators` 퍼블릭 확인.
- FMEA 데모는 **AI 비용 관리**: 비로그인 IP당 1일 1세션, 저비용 모델 우선.
- "준비 중" 페이지는 `<ComingSoonPage>` 컴포넌트로 일관성.
- 도구 카테고리 추가/이동 시 §1 표를 함께 업데이트.

---

## 16. 미해결 / 향후 결정 사항

- [ ] 회사명 / 메인 도메인 확정 (D-30 내).
- [ ] 결제 PG 선택 (Toss Payments 우선 검토).
- [ ] 정부 클라우드 바우처 등록 진행 여부.
- [ ] 베타 가격 검증 인터뷰 5건 (자동차 부품 회사 품질팀장).
- [ ] Free 등급 콘텐츠 (위키 30개 + 블로그 FMEA 5편).
- [ ] AuditSay 등 별도 도메인 기존 인증·결제 유무 → 마이그레이션 계획.
- [ ] FMEA 데모 시나리오 3-5개 컨텐츠 작성 (실무 검토 필요).
- [ ] AI 모델 비용 시뮬레이션 (FMEA 데모 월 예상 사용량).
- [ ] 카피 일치: "심사·APQP·게이지·SPC·교육" → "심사·APQP·게이지·부적합·변경관리" 최종 확정.
- [ ] 시험 학습 코너 VSM/Kanban 완성도 기준선 ("준비 중" → 공개 시점).

---

## 17. v1 → v2 변경 이력

- 도구 카테고리 3분류 도입 (§1, §13).
- `/calculators/*`, `/learn/exam/*` 라우트 추가 (§2).
- FMEA 체험 데모 신설 (§7.3).
- 시험 학습 코너 명시 + 베타 숨김 정책 (§8).
- 블로그 콘텐츠 전략 (§10).
- 미들웨어 퍼블릭 경로 분기 추가 (§5).
- `fmea_demo_sessions`, `calculator_usage` 테이블 추가 (§3).
- APQP Manager의 AI 대화형 FMEA를 전략 자산으로 전면 명시 (§1, §9, §11, §13).
- "내장 도구(무료)" 디자인 재구성 (§13).
- D-30 우선순위 재정렬 (§14).
