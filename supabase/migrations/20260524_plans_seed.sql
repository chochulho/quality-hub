-- =============================================================================
-- Plans 시드 데이터 (§4 요금제)
-- 단일 진실 공급원 — 코드에서 하드코딩 금지 (§15)
-- =============================================================================

insert into plans (
  id, name, price_krw_monthly, price_krw_yearly,
  tool_entitlements, selectable_tool_count,
  max_members, max_sites, features, is_public, sort_order
) values

-- Free: 계산 도구 전체 + 위키 + 블로그 + 학습 + AuditSay 체험 + FMEA 데모
(
  'free', 'Free', 0, 0,
  '{"auditsay":"readonly","calculators":true,"wiki":true,"blog":true,"learn":true,"fmea_demo":true}'::jsonb,
  0, 3, 1,
  '{"sso":false,"audit_log":false}'::jsonb,
  true, 1
),

-- Starter: 도구 1개 선택
(
  'starter', 'Starter', 49000, 490000,
  '{"selectable":true,"calculators":true}'::jsonb,
  1, 10, 1,
  '{"sso":false,"audit_log":false}'::jsonb,
  true, 2
),

-- Team: 도구 3개 선택
(
  'team', 'Team', 149000, 1490000,
  '{"selectable":true,"calculators":true}'::jsonb,
  3, 30, 2,
  '{"sso":false,"audit_log":false}'::jsonb,
  true, 3
),

-- Business: 전체 5개 도구
(
  'business', 'Business', 390000, 3900000,
  '{"auditsay":true,"apqp":true,"gauge":true,"nc":true,"4m":true,"calculators":true}'::jsonb,
  5, 80, 3,
  '{"sso":"addon","audit_log":false}'::jsonb,
  true, 4
),

-- Enterprise: 전체 + SSO + 감사로그 + 전담 지원
(
  'enterprise', 'Enterprise', null, null,
  '{"auditsay":true,"apqp":true,"gauge":true,"nc":true,"4m":true,"calculators":true}'::jsonb,
  5, -1, -1,
  '{"sso":true,"audit_log":true,"dedicated_support":true}'::jsonb,
  false, 5
)

on conflict (id) do update set
  name                  = excluded.name,
  price_krw_monthly     = excluded.price_krw_monthly,
  price_krw_yearly      = excluded.price_krw_yearly,
  tool_entitlements     = excluded.tool_entitlements,
  selectable_tool_count = excluded.selectable_tool_count,
  max_members           = excluded.max_members,
  max_sites             = excluded.max_sites,
  features              = excluded.features,
  is_public             = excluded.is_public,
  sort_order            = excluded.sort_order;

-- ── 베타 가격 검증용 뷰 ─────────────────────────────────────────────────────
-- 베타 6개월: 50% 할인. 베타 가입자는 12개월 유지.
-- 아래 뷰로 /pricing 페이지가 렌더링할 가격을 결정.
create or replace view v_public_plans as
select
  id,
  name,
  price_krw_monthly,
  price_krw_yearly,
  -- 베타 기간 50% 할인 (TODO: beta_ends_at 컬럼 추가 후 조건부 처리)
  round(price_krw_monthly * 0.5)  as beta_price_monthly,
  round(price_krw_yearly  * 0.5)  as beta_price_yearly,
  tool_entitlements,
  selectable_tool_count,
  max_members,
  max_sites,
  features,
  sort_order
from plans
where is_public = true
order by sort_order;

comment on view v_public_plans is '/pricing 페이지용. 베타 할인 포함 가격 제공.';
