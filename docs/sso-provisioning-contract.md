# SSO 프로비저닝 계약서 (qmintel ↔ 하위 SaaS)

> **목적**: qmintel(Quality Hub)에서 멤버의 제품 사용권한을 설정하면, 접속 없이도 각
> 하위 SaaS(change-manager / gauge-manager / auditsay / apqp-manager)의 멤버 목록에
> 자동 반영되도록 하는 표준 계약.
> 이 한 문서가 (1) qmintel 담당에게 전달할 요청서이자 (2) 4개 SaaS 전부에 그대로
> 적용할 구현 명세다.

---

## 0. 핵심 원칙

- **qmintel = 신원·권한의 source of truth.** "누가 어떤 제품을 쓴다"는 데이터와 관리 UI는 qmintel만 가진다.
- **각 SaaS = 받아서 반영·강제한다.** qmintel이 정해도 SaaS에 수신 창구와 로그인 검사가 없으면 아무 일도 안 일어난다. → **양쪽 다 수정 필요.**
- **SaaS 쪽은 제품마다 다른 커스텀이 아니라 동일 규격의 복붙**이다. change-manager를 레퍼런스로 만든 뒤 나머지에 이식한다.
- **부서/사업장 배정은 각 SaaS 고유값**이라 qmintel은 관여하지 않는다. 프로비저닝은 "멤버 명단"만 채우고, 부서·사업장은 관리자가 SaaS 안에서 지정한다(현행 유지).

---

## 1. 제품 슬러그 (canonical, 양쪽 동일해야 함)

| 슬러그            | 제품             |
|-------------------|------------------|
| `change-manager`  | 4M Change Manager |
| `gauge-manager`   | Gauge Manager    |
| `auditsay`        | AuditSay         |
| `apqp-manager`    | APQP Manager     |

---

## 2. 통합 지점은 2개다

### A. 프로비저닝 Push (qmintel → SaaS)  ← "접속 없이 명단 반영"의 핵심
qmintel에서 멤버의 제품 권한을 부여/회수/탈퇴할 때, 대상 SaaS의 수신 엔드포인트를 호출한다.

### B. 로그인 Entitlement (SSO JWT claim)  ← "권한 없는 사람 차단"
기존 SSO JWT에 `products` claim을 추가하고, 각 SaaS가 로그인 시 자기 슬러그가 있는지 검사한다.

> A만 있고 B가 없으면, 유효 JWT만 있으면 누구나 로그인해 멤버가 되어버린다(현행 허점).
> B만 있고 A가 없으면, 여전히 "최초 로그인해야 멤버 생성"에 머문다(원하는 것 아님).
> **둘 다 있어야** qmintel에서 켜고 끄는 대로 명단이 자동으로 맞춰진다.

---

## 3. A. 프로비저닝 API 규격

### 엔드포인트 (각 SaaS)
```
POST /api/sso/provision
```

### 요청 헤더
| 헤더               | 값                                                        |
|--------------------|-----------------------------------------------------------|
| `Content-Type`     | `application/json`                                        |
| `X-QH-Timestamp`   | ISO-8601 UTC (예: `2026-08-07T10:00:00Z`)                 |
| `X-QH-Signature`   | `sha256=<hex>` — HMAC-SHA256(`${timestamp}.${rawBody}`)   |

- 서명 대상 문자열 = `X-QH-Timestamp` 값 + `.` + **원본 바디 그대로**(재직렬화 금지).
- 공유 비밀키: `SSO_QUALITY_HUB_SECRET` (기존 SSO 검증에 쓰는 것과 동일 키 재사용).
- **리플레이 방지**: 수신 측은 `|now - timestamp| > 300초`면 거부(401).

### 요청 바디
```jsonc
{
  "event_id": "evt_01H9XABC...",      // 고유 ID. 로깅/멱등성 추적용
  "product": "change-manager",         // 대상 제품 슬러그. 수신 측 자기 슬러그와 불일치 시 422
  "action": "grant" | "revoke",        // grant=권한부여/활성, revoke=권한회수/비활성
  "org": {
    "external_org_id": "qh_org_abc123", // → Organization.externalOrgId 로 매칭
    "name": "Poongsan"                  // 조직 최초 생성 시 이름
  },
  "member": {
    "email": "swbaek@poongsan.net",     // 매칭 기준 키(필수)
    "external_user_id": "qh_usr_xyz789",// → User.externalUserId (권장, 이메일 변경 대비)
    "name": "백선우",
    "role": "member" | "admin"          // 선택. admin이면 systemRole=ORG_ADMIN
  }
}
```

### 응답
| HTTP | 의미                                   | qmintel 동작        |
|------|----------------------------------------|---------------------|
| 200  | 처리 완료(멱등)                        | 성공                |
| 202  | 접수했으나 조직 미존재 등으로 지연 처리 | 성공으로 간주       |
| 400  | 바디/필드 오류                         | 재시도 금지, 수정   |
| 401  | 서명 불일치 / 타임스탬프 만료          | 재시도 금지         |
| 422  | `product` 슬러그가 이 SaaS와 불일치    | 재시도 금지(오배송) |
| 5xx  | 수신 측 일시 오류                      | 지수 백오프 재시도  |

### 멱등성 / 재시도
- `grant`는 upsert라 여러 번 와도 안전. `revoke`도 반복 안전.
- qmintel은 5xx/타임아웃에만 지수 백오프 재시도(예: 1m→5m→30m, 최대 24h). 4xx는 재시도하지 않는다.

---

## 4. B. 로그인 Entitlement (JWT claim)

기존 SSO JWT payload에 아래 claim을 **추가**한다.
```jsonc
{
  "email": "...",
  "name": "...",
  "org_id": "...",
  "org_name": "...",
  "products": ["change-manager", "gauge-manager"]  // ← 신규: 이 사용자가 쓸 수 있는 제품들
}
```
각 SaaS의 로그인 처리:
- `products`가 있고 **자기 슬러그가 없으면 로그인 거부**.
- **하위호환**: `products` claim이 아예 없으면 종전대로 허용(롤아웃 중 무중단). qmintel이 claim을 넣기 시작하면 자동으로 강제가 켜진다.

---

## 5. SaaS 수신 측 처리 규칙 (change-manager 기준, 나머지 동일)

1. **서명·타임스탬프 검증** → 실패 시 401.
2. **`product` 검증** → 자기 슬러그와 다르면 422.
3. **조직 해석**: `external_org_id`로 `Organization.externalOrgId` 매칭. 없으면 신규 생성
   (기존 `resolveSsoOrganization()` 재사용). 단, **프로비저닝 경로에서는 자동 관리자 승격 없음**
   — 관리자는 `member.role: "admin"` 지정 또는 실제 admin의 SSO 로그인 시점에 결정.
4. **action = `grant`**: `db.user.upsert({ where: { email } })`
   - `isActive: true`, `organizationId` 연결, `externalUserId`/`name` 갱신,
     `systemRole`은 `role`에 따라 `ORG_ADMIN` 또는 `USER`(기존 값 유지 우선).
5. **action = `revoke`**: **soft-delete** — `isActive: false`로만 변경.
   - 하드 삭제 금지: 해당 유저가 작성한 변경요청 등 이력·FK 보존 필요. 멤버 목록은
     `isActive: true` 필터로 이미 걸러지므로 명단에서 자연히 사라진다.
6. `event_id` 로깅(중복 수신 추적).

> **change-manager 재사용 포인트**: 위 3·4 로직은 이미
> `src/lib/auth/config.ts`의 `sso-jwt` authorize(96~130행)에 존재한다.
> 로그인 콜백에서 이 upsert 부분을 분리해 `/api/sso/provision`으로 재사용하면 된다.

---

## 6. 스키마 영향

- **change-manager: 마이그레이션 불필요.** 필요한 필드가 이미 있다 —
  `User.email(unique)`, `User.externalUserId(unique)`, `User.isActive`, `User.systemRole`,
  `Organization.externalOrgId(unique)`.
- 각 SaaS는 **자기 멤버만** 저장한다. "이 유저가 어떤 제품들을 쓰는지"의 전체 매트릭스는
  qmintel에만 있고 SaaS에는 두지 않는다(revoke=비활성으로 충분).

---

## 7. 보안 요약

- 전송: HTTPS 필수.
- 인증: HMAC-SHA256 서명(공유 비밀키) + 타임스탬프 만료(5분).
- 권한: 수신 측은 `product` 슬러그로 오배송 차단.
- 키 로테이션: 이중 키 허용 기간을 두고 교체(수신 측이 구·신 키 둘 다 잠시 허용).

---

## 8. 롤아웃 순서 (권장)

1. **[change-manager 먼저]** `/api/sso/provision` 수신 엔드포인트 + 로그인 `products` 검사(하위호환) 구현.
   → curl로 서명 요청을 쏴서 **qmintel 없이 단독 검증**. 이게 레퍼런스 구현이 된다.
2. qmintel에 본 계약서 전달 → 멤버별 제품 권한 데이터/관리 UI + push 발신 + JWT `products` claim 구현.
3. change-manager로 **엔드투엔드 연동 테스트**(부여→명단 반영, 회수→비활성, 미권한자 로그인 거부).
4. 검증된 수신 코드를 gauge-manager / auditsay / apqp-manager에 **이식**(슬러그만 교체).

> **왜 change-manager 먼저인가**: 수신부는 qmintel 의존 없이 서명 요청만으로 테스트 가능 → 계약을
> 실제로 굳힌 뒤 qmintel에 요청 → 나머지 3개는 복붙. 하위호환 설계라 기존 SSO 로그인은 중단 없음.

---

## 9. 체크리스트

### qmintel(허브)에 요청할 것
- [ ] 멤버별 제품 사용권한 저장(멤버 × 제품 매트릭스) + 관리 UI
- [ ] 권한 부여/회수/탈퇴 시 대상 SaaS로 `POST /api/sso/provision` 발신(HMAC 서명, 재시도)
- [ ] SSO JWT payload에 `products` claim 추가
- [ ] 제품 슬러그를 본 문서 1절과 정확히 일치시킬 것
- [ ] (선택) `member.role`로 조직 관리자 지정

### 각 SaaS에 붙일 것 (change-manager → 나머지 이식)
- [ ] `POST /api/sso/provision` 수신 엔드포인트(서명검증 → org해석 → grant/revoke upsert)
- [ ] `revoke`는 `isActive:false` soft-delete로만
- [ ] 로그인 시 `products` claim에 자기 슬러그 검사(claim 없으면 허용 — 하위호환)
- [ ] 제품 슬러그/공유 비밀키 환경변수 세팅

---

## 부록: 수신 검증 스니펫 (Node / Next.js Route Handler)

```ts
// POST /api/sso/provision
import { NextResponse } from "next/server";
import crypto from "node:crypto";

const PRODUCT_SLUG = "change-manager"; // ← 각 SaaS에서 이 값만 교체
const MAX_SKEW_MS = 5 * 60 * 1000;

export async function POST(req: Request) {
  const raw = await req.text(); // 서명 검증 위해 원본 바디 그대로
  const ts = req.headers.get("x-qh-timestamp") ?? "";
  const sig = req.headers.get("x-qh-signature") ?? "";
  const secret = process.env.SSO_QUALITY_HUB_SECRET!;

  // 1) 타임스탬프 만료
  if (Math.abs(Date.now() - Date.parse(ts)) > MAX_SKEW_MS) {
    return NextResponse.json({ error: "stale timestamp" }, { status: 401 });
  }
  // 2) 서명 검증
  const expected = "sha256=" + crypto
    .createHmac("sha256", secret)
    .update(`${ts}.${raw}`)
    .digest("hex");
  const ok = sig.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  if (!ok) return NextResponse.json({ error: "bad signature" }, { status: 401 });

  const body = JSON.parse(raw);
  // 3) 오배송 방지
  if (body.product !== PRODUCT_SLUG) {
    return NextResponse.json({ error: "wrong product" }, { status: 422 });
  }

  // 4) org 해석 + grant/revoke upsert (config.ts의 로직 재사용)
  // ... resolveSsoOrganization(body.org.external_org_id, body.org.name, body.member.email)
  // ... action === "grant" ? user.upsert({isActive:true, ...}) : user.update({isActive:false})

  return NextResponse.json({ ok: true }, { status: 200 });
}
```

```bash
# curl 단독 테스트 (qmintel 없이)
TS="2026-08-07T10:00:00Z"
BODY='{"event_id":"evt_test1","product":"change-manager","action":"grant","org":{"external_org_id":"qh_org_abc123","name":"Poongsan"},"member":{"email":"newuser@poongsan.net","name":"신규유저","role":"member"}}'
SIG="sha256=$(printf '%s.%s' "$TS" "$BODY" | openssl dgst -sha256 -hmac "$SSO_QUALITY_HUB_SECRET" -hex | sed 's/^.* //')"
curl -X POST http://localhost:3000/api/sso/provision \
  -H "Content-Type: application/json" \
  -H "X-QH-Timestamp: $TS" \
  -H "X-QH-Signature: $SIG" \
  --data "$BODY"
```
