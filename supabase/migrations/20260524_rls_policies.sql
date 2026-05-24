-- =============================================================================
-- RLS (Row Level Security) 정책 (§3)
-- 모든 워크스페이스 테이블에 적용.
-- =============================================================================

-- ── 0. RLS 활성화 ─────────────────────────────────────────────────────────────
alter table organizations        enable row level security;
alter table org_sites            enable row level security;
alter table org_members          enable row level security;
alter table org_selected_tools   enable row level security;
alter table org_tool_overrides   enable row level security;
alter table fmea_demo_sessions   enable row level security;
alter table calculator_usage     enable row level security;

-- plans는 공개 읽기 (RLS 불필요 — 읽기만 허용)
alter table plans                enable row level security;
create policy "plans: public read"
  on plans for select using (is_public = true);

-- ── 헬퍼: 현재 사용자의 org_id 조회 ─────────────────────────────────────────
-- JWT claim 'org_id'가 있으면 사용, 없으면 org_members에서 조회
-- (향후 JWT에 org_id를 포함시켜 성능 최적화 가능)
create or replace function auth_org_id()
returns uuid language sql stable security definer as $$
  select org_id from org_members
  where user_id = auth.uid()
    and status = 'active'
  limit 1
$$;

create or replace function auth_org_role()
returns text language sql stable security definer as $$
  select role from org_members
  where user_id = auth.uid()
    and org_id = auth_org_id()
    and status = 'active'
  limit 1
$$;

-- ── 1. organizations ──────────────────────────────────────────────────────────
-- 소속 org만 조회/수정 가능. 생성은 /api/signup이 service_role로 처리.
create policy "org: select own"
  on organizations for select
  using (id = auth_org_id());

create policy "org: update by admin"
  on organizations for update
  using (id = auth_org_id() and auth_org_role() in ('owner', 'admin'));

-- ── 2. org_sites ─────────────────────────────────────────────────────────────
create policy "sites: select own org"
  on org_sites for select
  using (org_id = auth_org_id());

create policy "sites: insert by admin"
  on org_sites for insert
  with check (org_id = auth_org_id() and auth_org_role() in ('owner', 'admin'));

create policy "sites: update by admin"
  on org_sites for update
  using (org_id = auth_org_id() and auth_org_role() in ('owner', 'admin'));

create policy "sites: delete by admin"
  on org_sites for delete
  using (org_id = auth_org_id() and auth_org_role() in ('owner', 'admin'));

-- ── 3. org_members ────────────────────────────────────────────────────────────
-- 같은 org 멤버 목록 조회. 인원 추가/삭제는 admin+만.
create policy "members: select own org"
  on org_members for select
  using (org_id = auth_org_id());

create policy "members: insert by admin"
  on org_members for insert
  with check (org_id = auth_org_id() and auth_org_role() in ('owner', 'admin'));

create policy "members: update by admin"
  on org_members for update
  using (org_id = auth_org_id() and auth_org_role() in ('owner', 'admin'));

create policy "members: delete by admin"
  on org_members for delete
  using (org_id = auth_org_id() and auth_org_role() in ('owner', 'admin'));

-- ── 4. org_selected_tools ────────────────────────────────────────────────────
create policy "tools: select own org"
  on org_selected_tools for select
  using (org_id = auth_org_id());

create policy "tools: insert by admin"
  on org_selected_tools for insert
  with check (org_id = auth_org_id() and auth_org_role() in ('owner', 'admin'));

create policy "tools: delete by admin"
  on org_selected_tools for delete
  using (org_id = auth_org_id() and auth_org_role() in ('owner', 'admin'));

-- ── 5. org_tool_overrides ─────────────────────────────────────────────────────
-- 운영자(service_role)만 조작. 일반 사용자는 SELECT만.
create policy "overrides: select own org"
  on org_tool_overrides for select
  using (org_id = auth_org_id());

-- INSERT/UPDATE/DELETE는 service_role(운영자 콘솔)만 — RLS 적용 대상 아님
-- (service_role은 RLS 우회)

-- ── 6. fmea_demo_sessions ────────────────────────────────────────────────────
-- 비로그인도 INSERT 가능 (IP rate limit은 앱 레이어에서 처리).
-- SELECT는 본인 세션만.
create policy "fmea_demo: anonymous insert"
  on fmea_demo_sessions for insert
  with check (true);  -- 비로그인 허용; IP rate limit은 앱에서

create policy "fmea_demo: select own"
  on fmea_demo_sessions for select
  using (user_id = auth.uid() or user_id is null);

create policy "fmea_demo: update own"
  on fmea_demo_sessions for update
  using (user_id = auth.uid() or user_id is null);

-- ── 7. calculator_usage ──────────────────────────────────────────────────────
-- 익명 INSERT 허용 (통계 용도).
-- SELECT는 본인 기록만.
create policy "calc_usage: anonymous insert"
  on calculator_usage for insert
  with check (true);

create policy "calc_usage: select own"
  on calculator_usage for select
  using (user_id = auth.uid() or user_id is null);

-- ── 8. billing (미래) ────────────────────────────────────────────────────────
-- billing 관련 작업은 owner만: auth_org_role() = 'owner'
-- 현재 별도 테이블 없음 — 결제 연동(Toss Payments) 후 추가 예정.
-- TODO: add billing_history table with policy: auth_org_role() = 'owner'
