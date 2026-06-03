# TASK-LANDING-PRICING.md

QMintel 사이트(qmintel.com)의 랜딩 페이지 + 가격 페이지 정비 작업.

> **이번 작업 범위:** 랜딩 페이지 + 가격 페이지 + 도구 링크 일관성만.
> 다른 페이지(블로그, 위키, 도구 페이지, 위자드, 계산 도구)는 절대 건드리지 말 것.

---

## 0. 사용자 확정 사항 (결정 완료)

1. **브랜드 표기:** `QMintel` (M 대문자, 통일)
2. **베타 50% 할인 정책:** **없음.** 가격 페이지에 베타 할인 표기 절대 추가하지 말 것.
3. **현재 가격 유지:** Starter ₩49,000 / Team ₩149,000 / Business ₩390,000 (정가, 변경 없음)

---

## 1. 작업 원칙

- 한 항목씩 처리하며 git diff 보여줄 것.
- 사용자 승인 받기 전 절대 실제 코드 수정하지 말 것.
- DB·환경변수·패키지 변경 필요 시 사용자 확인 먼저.
- 한 세션에 §3의 작업만 처리. 다른 영역 건드리지 말 것.

---

## 2. 작업 시작 전 — 현재 상태 보고

작업 시작 전 다음 grep 결과를 사용자에게 보고:

```bash
# 1. 브랜드 표기 잔존 위치 (QMintel 외의 모든 표기)
grep -rn "QmIntel\|Qmintel\|qmintel" app/ components/ public/ messages/ \
  --include="*.tsx" --include="*.ts" --include="*.mdx" --include="*.json" \
  | grep -v "QMintel" | grep -v "qmintel.com"

# 2. 하드코딩된 도구 URL 위치
grep -rnE "(auditsay\.com|apqpmanager\.com|gaugemanager\.com|nc-manager-chi|change-manager-self|api/sso/(nc|apqp|4m|auditsay|gauge))" app/ components/

# 3. 가격 페이지 현재 코드
find app -path "*/pricing*" -type f
```

결과 보여주고 변경 계획 제시한 후 사용자 승인 받기.

---

## 3. 작업 순서 (이 순서대로 진행)

### Step 1: 브랜드 표기 통일 — `QMintel`

**현재 사이트 상태:** "QmIntel" (M 소문자)로 통일되어 있음.
**목표:** 모든 위치를 "QMintel" (M 대문자)로 변경.

**확인 위치:**
- 헤더 로고 컴포넌트
- 메타 태그 (`title`, `og:site_name`, `og:title`, `twitter:title`, `og:description` 등)
- 환경변수 `NEXT_PUBLIC_BRAND_NAME` (있다면)
- 본문 모든 인스턴스 ("QmIntel과 함께하는" 같은 텍스트)
- 푸터 © 표기
- 블로그 글 본문 (있다면)

**예외 — 그대로 두기:**
- 도메인 `qmintel.com` (소문자 도메인은 그대로 OK)
- 이메일 `support@qmintel.com` (그대로 OK)
- URL 경로 (`/qmintel-...`이 있다면 그대로 OK, 보통은 없을 것)

**작업 방식:**
1. grep으로 모든 "QmIntel" 위치 보고
2. 일괄 sed/치환 계획 제시
3. 승인 후 치환
4. 치환 결과 재검증 (grep으로 "QmIntel" 잔존 0건 확인)

### Step 2: 도구 링크 상수화 (`lib/saas-tools.ts`)

**현재 문제:**
- 본문 카드: SSO 라우트(`/api/sso/...`) 또는 커스텀 도메인 혼재
- 푸터: 커스텀 도메인 또는 vercel 임시 도메인 혼재
- 같은 도구가 페이지마다 다른 URL로 노출됨

**목표:** 5개 도구의 정식 URL을 단일 파일에 정의하고 모든 컴포넌트에서 참조.

**확정된 정식 URL:**

| 도구 | 정식 URL | 비고 |
|---|---|---|
| AuditSay | `https://auditsay.com` | 커스텀 도메인 |
| APQP Manager | `https://apqpmanager.com` | 커스텀 도메인 |
| Gauge Manager | `https://gaugemanager.com` | 커스텀 도메인 |
| NC Manager | `/api/sso/nc-manager` | 정식 도메인 결정 전 SSO 라우트 |
| 4M Change Manager | `/api/sso/4m-change-manager` | 정식 도메인 결정 전 SSO 라우트 |

**금지 사항:**
- `nc-manager-chi.vercel.app` 노출 절대 금지
- `change-manager-self.vercel.app` 노출 절대 금지

**생성할 파일:** `lib/saas-tools.ts`

```ts
// lib/saas-tools.ts

export type ToolKey = 'auditsay' | 'apqp' | 'gauge' | 'nc' | 'fourm'

export interface SaasTool {
  key: ToolKey
  name: string           // 표시명
  url: string            // 정식 URL
  category: string       // 카테고리 라벨 (예: "심사 통합 SaaS")
  badgeColor: string     // tailwind 컬러 토큰
}

export const SAAS_TOOLS: Record<ToolKey, SaasTool> = {
  auditsay: {
    key: 'auditsay',
    name: 'AuditSay',
    url: 'https://auditsay.com',
    category: '심사 통합 SaaS',
    badgeColor: 'navy',
  },
  apqp: {
    key: 'apqp',
    name: 'APQP Manager',
    url: 'https://apqpmanager.com',
    category: 'APQP 문서 관리',
    badgeColor: 'orange',
  },
  gauge: {
    key: 'gauge',
    name: 'Gauge Manager',
    url: 'https://gaugemanager.com',
    category: '측정기기 관리',
    badgeColor: 'green',
  },
  nc: {
    key: 'nc',
    name: 'NC Manager',
    url: '/api/sso/nc-manager',
    category: '부적합·클레임·CAPA',
    badgeColor: 'red',
  },
  fourm: {
    key: 'fourm',
    name: '4M Change Manager',
    url: '/api/sso/4m-change-manager',
    category: '변경관리 (IATF 8.5.6)',
    badgeColor: 'purple',
  },
} as const

export const SAAS_TOOLS_ORDER: ToolKey[] = ['auditsay', 'apqp', 'gauge', 'nc', 'fourm']
```

**적용 위치 (모두 이 상수 참조하도록 변경):**
- 랜딩 상단 "유료 SaaS 도구" 박스 (현재 5개 컬러 뱃지)
- 랜딩 중간 5개 카드 "방문하기" 버튼
- 푸터 "품질 도구" 항목
- 가격 페이지 도구 뱃지

**작업 방식:**
1. `lib/saas-tools.ts` 신규 생성
2. 도구 링크 사용 위치 grep으로 모두 보고
3. 각 위치를 상수 import로 변경하는 계획 제시
4. 승인 후 변경
5. 검증: `grep -rnE "(auditsay\.com|apqpmanager\.com|gaugemanager\.com|nc-manager-chi|change-manager-self)" app/ components/ | grep -v "lib/saas-tools.ts"` 결과 0건 확인

### Step 3: 페이지별 메타 태그 고유화

**현재 문제:** 모든 페이지의 `<title>`이 "QmIntel — 품질 실무자를 위한 지식 베이스"로 동일.

**대상 페이지 (이번 세션 한정):**

| 경로 | title | description |
|---|---|---|
| `/` | QMintel — AI 기반 품질 관리 플랫폼 \| 자동차 부품 QMS | 30년 자동차 부품 품질 실무 + AI 도구. AuditSay 심사 통합, AI 대화형 FMEA, APQP·게이지·부적합·변경관리. 무료 SPC·QC7 계산기. IATF 16949 한국어 SaaS. |
| `/pricing` | 요금제 \| QMintel — Free·Starter·Team·Business | QMintel 요금제 비교. Free 무료부터 Business 5개 도구 전체까지. 도구 1개 선택부터 시작하는 합리적 가격. |

**Next.js App Router 방식:**

```tsx
// app/page.tsx (예시)
export const metadata: Metadata = {
  title: 'QMintel — AI 기반 품질 관리 플랫폼 | 자동차 부품 QMS',
  description: '30년 자동차 부품 품질 실무 + AI 도구. ...',
  openGraph: {
    title: 'QMintel — AI 기반 품질 관리 플랫폼',
    description: '...',
    type: 'website',
    locale: 'ko_KR',
    siteName: 'QMintel',
  },
  twitter: {
    card: 'summary',
    title: 'QMintel — AI 기반 품질 관리 플랫폼',
    description: '...',
  },
}
```

**주의:**
- 다른 페이지의 메타는 이번 세션에서 건드리지 말 것 (랜딩 + 가격만)
- 다른 페이지 메타는 다음 세션에서 별도 처리

### Step 4: "도입 문의하기" 링크 수정

**현재 문제:** 랜딩 하단 "기업회원" 섹션의 "도입 문의하기" 버튼이 `/about`으로 연결. 문의 폼이 아니라 회사 소개 페이지로 가서 어색.

**수정:** `mailto:support@qmintel.com` 으로 변경 (가장 빠르고 안전한 방법).

```tsx
// 기업회원 섹션의 CTA
<a 
  href="mailto:support@qmintel.com?subject=QMintel 도입 문의"
  className="..."
>
  도입 문의하기
</a>
```

**나중에 정식 contact 페이지 만들면 그 때 변경. 지금은 mailto로 충분.**

### Step 5: 비자동차 메시지 위치 이동

**현재 문제:** 푸터 직전 한 줄("자동차가 아닌 회사도 ... 사용할 수 있습니다.")이 묻혀 있음.

**수정:**
- 푸터 직전 한 줄은 **제거**
- "관련 도구" 섹션(5개 SaaS 카드) 직후에 배너 박스로 추가

**적용 디자인:**

```tsx
// "관련 도구" 섹션 직후 삽입

<section className="container mx-auto px-4 py-12">
  <div className="rounded-2xl bg-amber-50 dark:bg-navy-900/40 p-8 md:p-12 text-center md:text-left md:flex md:items-center md:gap-8">
    <div className="text-5xl md:text-6xl mb-4 md:mb-0 flex-shrink-0">🏭</div>
    <div className="flex-1">
      <h3 className="text-xl md:text-2xl font-bold mb-3">
        자동차가 아닌 회사도 환영합니다
      </h3>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        IATF 16949이 없어도 ISO 9001/14001 심사, 측정기기 관리, 
        APQP 문서 작성을 단독 도구로 시작할 수 있습니다.
      </p>
      <div className="flex flex-wrap gap-3 justify-center md:justify-start">
        <a href="https://auditsay.com" className="...">
          AuditSay 단독 보기 →
        </a>
        <a href="https://gaugemanager.com" className="...">
          Gauge Manager 단독 보기 →
        </a>
        <a href="https://apqpmanager.com" className="...">
          APQP Manager 단독 보기 →
        </a>
      </div>
    </div>
  </div>
</section>
```

**디자인 세부 사항은 기존 사이트 톤에 맞춰 조정 가능. 핵심은 위치 이동 + 배너화.**

### Step 6: 가격 페이지 — Business 카드 단위 표기 점검

**현재 우려:** "₩390,000 / 월"의 "/월"이 줄바꿈되어 깨질 가능성 (스크린샷에서 확인됨).

**작업:**
- 가격 카드 컴포넌트의 가격 표기 부분 CSS 점검
- 가격 숫자 + 단위 부분에 `whitespace-nowrap` 적용
- 또는 단위를 별도 줄로 분리하되 의도된 디자인으로

**예시:**

```tsx
// 가격 표기
<div className="flex items-baseline gap-1 whitespace-nowrap">
  <span className="text-4xl font-bold">₩390,000</span>
  <span className="text-gray-500">/월</span>
</div>
```

**Free 카드도 점검:**
- 다른 카드는 가격 큰 글씨인데 Free는 "무료"만 작게 → 시각 균형
- "무료" 텍스트 크기를 다른 카드 가격과 유사하게 조정

```tsx
// Free 카드
<div className="flex items-baseline gap-1 whitespace-nowrap">
  <span className="text-4xl font-bold">무료</span>
</div>
```

### Step 7: 가격 페이지 — 기능 비교 표 점검

**현재 우려:** 표 셀이 일부 비어 있을 가능성 (정확한 검사 필요).

**작업:**
1. `/pricing` 페이지의 기능 비교 표 컴포넌트 코드 보여주기
2. 모든 셀에 명시적 값이 들어가 있는지 확인
3. 비어 있는 셀이 있으면 다음 데이터로 채우기:

| 기능 | Free | Starter | Team | Business |
|---|---|---|---|---|
| 품질 학습 위키 | ✓ | ✓ | ✓ | ✓ |
| SPC · QC7 계산 도구 | ✓ | ✓ | ✓ | ✓ |
| FMEA 체험 데모 | ✓ | ✓ | ✓ | ✓ |
| SaaS 도구 선택 | — | 1개 | 3개 | 전체 5개 |
| 팀원 수 | 3명 | 10명 | 30명 | 80명 |
| 사업장 | 1개 | 1개 | 2개 | 3개 |
| SSO 자동 로그인 | — | — | — | 애드온 |
| 이메일 지원 | — | ✓ | ✓ | ✓ |
| 채팅 지원 | — | — | ✓ | ✓ |

표시 아이콘:
- 지원됨: `✓` (체크 아이콘 또는 텍스트)
- 지원 안 됨: `—` (대시) — 빈 셀로 두지 말 것
- 옵션/숫자: 그대로 텍스트

### Step 8: 가격 페이지 — 도구 뱃지 의미 설명

**현재 상태 (스크린샷 기준):**
- Starter 카드: 컬러 뱃지(AuditSay, NC Manager) + 회색 뱃지(APQP, Gauge, 4M)
- Team 카드: 컬러 뱃지 3개 + 회색 뱃지 2개

**문제:** 회색 뱃지가 무엇을 의미하는지 사용자가 모름.

**수정:** 각 카드의 뱃지 영역 위에 안내 텍스트 추가.

```
Starter 카드:
  "대표 도구 예시" 라벨 옆에 작은 텍스트:
  "5개 중 1개 선택"

Team 카드:
  "포함 도구 (3/5)" 라벨 옆에 작은 텍스트:
  "5개 중 3개 선택"

Business 카드:
  "포함 도구 (5/5)" 그대로 — 전체이므로 안내 불필요
```

또는 카드 하단 작은 글씨로:
```
* 색상 뱃지가 선택 가능한 도구 예시입니다.
  가입 시 실제 사용할 도구를 선택합니다.
```

---

## 4. 작업 범위 외 (절대 건드리지 말 것)

- 위키 페이지 (`/learn/*`)
- 블로그 페이지 (`/blog/*`)
- 도구 소개 페이지 (`/tools/*`)
- 계산 도구 페이지 (`/calculators/*`)
- QMS 위자드 페이지 (`/qms-wizard`)
- About 페이지 (`/about`)
- DB 스키마
- 로고 이미지
- 이메일 발송 시스템 (mailto만 사용)
- 다른 페이지의 메타 태그

위 영역 수정 필요해 보이는 부분 발견하면 사용자에게 보고만 하고 작업하지 말 것.

---

## 5. 완료 후 점검 명령어

작업 완료 후 다음 명령어로 회귀 점검:

```bash
# 1. 브랜드 표기 통일 확인 (QMintel 외 잔존 없어야 함, 도메인/이메일 제외)
grep -rn "QmIntel\|Qmintel" app/ components/ public/ messages/ \
  --include="*.tsx" --include="*.ts" --include="*.mdx" --include="*.json" \
  | grep -v "qmintel.com" | grep -v "support@qmintel"

# 2. 하드코딩된 도구 URL 검색 (lib/saas-tools.ts 외에는 없어야 함)
grep -rnE "(auditsay\.com|apqpmanager\.com|gaugemanager\.com|nc-manager-chi|change-manager-self)" app/ components/ \
  | grep -v "lib/saas-tools.ts"

# 3. vercel 임시 도메인 노출 점검 (0건 필수)
grep -rn "vercel.app" app/ components/

# 4. 가격 페이지 빈 셀 점검 (수동 확인)
# 브라우저에서 /pricing 열고 비교 표 확인
```

---

## 6. 작업 완료 후 보고 사항

작업 완료 후 사용자에게 다음 보고:

- [ ] 위 점검 명령어 4개 실행 결과
- [ ] git diff 요약 (파일별 변경 라인 수)
- [ ] 변경된 파일 목록
- [ ] 로컬 테스트 결과 (`npm run dev` 후 랜딩/가격 페이지 정상 작동 확인)
- [ ] 미해결로 남긴 항목 (있다면)

---

## 7. 다음 세션 미루기 (이번 세션에서는 안 함)

다음 세션에서 별도 처리할 항목:

- 위키 카테고리 정리 (1개 노트 다수)
- 위키 페이지 분할 (QMS 학습 페이지)
- NC Manager / 4M Change Manager 정식 도메인 결정
- 정식 `/contact` 페이지 생성 + 이메일 발송 API
- 로고 정식 디자인
- 블로그 글 추가 작성 (FMEA 시리즈)
- 다른 페이지의 메타 태그 고유화
