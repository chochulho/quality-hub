-- =============================================================================
-- quality-hub Workspace v2 마이그레이션
-- §3 데이터 모델 (SPEC-WORKSPACE.md v2)
-- 실행 순서: plans → organizations → org_sites → org_members
--            → org_selected_tools → org_tool_overrides
--            → fmea_demo_sessions → calculator_usage
-- =============================================================================

-- ── 0-A. v1 (qh_*) 정리 ───────────────────────────────────────────────────────
drop function if exists qh_get_my_profile()                              cascade;
drop function if exists qh_register_user(uuid,text,text,text,text,text)  cascade;
drop function if exists qh_get_all_companies()                           cascade;
drop function if exists qh_approve_company(uuid,text)                    cascade;
drop function if exists qh_reject_company(uuid)                          cascade;
drop function if exists qh_set_company_grade(uuid,text)                  cascade;
drop function if exists qh_get_my_company_id()                           cascade;
drop function if exists qh_is_superadmin()                               cascade;
drop table if exists qh_profiles  cascade;
drop table if exists qh_companies cascade;

-- ── 0-B. v2 재실행 안전 정리 ─────────────────────────────────────────────────
drop function if exists register_org(uuid,text,text,text)                cascade;
drop function if exists get_my_membership()                              cascade;
drop function if exists get_all_organizations()                          cascade;
drop function if exists approve_org(uuid,text)                           cascade;
drop function if exists reject_org(uuid)                                 cascade;
drop function if exists set_org_plan(uuid,text)                          cascade;
drop table if exists calculator_usage      cascade;
drop table if exists fmea_demo_sessions    cascade;
drop table if exists org_tool_overrides    cascade;
drop table if exists org_selected_tools    cascade;
drop table if exists org_members           cascade;
drop table if exists org_sites             cascade;
drop table if exists organizations         cascade;
drop table if exists plans                 cascade;

-- ── 1. plans (요금제) ─────────────────────────────────────────────────────────
create table plans (
  id                     text primary key,           -- 'free' | 'starter' | 'team' | 'business' | 'enterprise'
  name                   text not null,
  price_krw_monthly      int,                        -- null = 견적
  price_krw_yearly       int,
  tool_entitlements      jsonb not null default '{}',
  selectable_tool_count  int not null default 0,     -- Starter·Team: 선택 가능 도구 수
  max_members            int not null default 3,     -- -1 = 무제한
  max_sites              int not null default 1,     -- -1 = 무제한
  features               jsonb not null default '{}',
  is_public              boolean not null default true,
  sort_order             int not null default 99,
  created_at             timestamptz not null default now()
);

comment on table plans is '요금제 정의 — 단일 진실 공급원. 하드코딩 금지 (§15).';

-- ── 2. organizations (테넌트) ─────────────────────────────────────────────────
create table organizations (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  plan_id        text not null references plans(id) default 'free',
  org_type       text not null default 'individual'
                   check (org_type in ('individual', 'corporate')),
  status         text not null default 'active'
                   check (status in ('pending', 'active', 'suspended')),
  region         text not null default 'KR',
  source_domain  text,   -- 'quality-hub' | 'auditsay' | 'apqp' | 'gauge'
  trial_ends_at  timestamptz,
  created_at     timestamptz not null default now()
);

comment on column organizations.source_domain is '가입 경로 도메인 — 멀티 도메인 통합 (§9)';
comment on column organizations.org_type is 'individual | corporate — 기업은 관리자 승인 필요';
comment on column organizations.status is 'pending(승인대기) | active | suspended';

-- ── 3. org_sites (사업장) ─────────────────────────────────────────────────────
create table org_sites (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations(id) on delete cascade,
  name        text not null,
  country     text not null default 'KR',
  timezone    text not null default 'Asia/Seoul',
  is_primary  boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ── 4. org_members (조직 멤버) ────────────────────────────────────────────────
create table org_members (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null references organizations(id) on delete cascade,
  user_id        uuid references auth.users(id) on delete cascade,
  role           text not null default 'member',   -- 'owner' | 'admin' | 'member'
  site_id        uuid references org_sites(id),
  invited_email  text,                              -- 초대장 발송 중 (user_id 없을 때)
  status         text not null default 'active',   -- 'invited' | 'active' | 'suspended'
  created_at     timestamptz not null default now(),
  unique(org_id, user_id)
);

-- ── 5. org_selected_tools (플랜에서 선택한 도구) ──────────────────────────────
create table org_selected_tools (
  org_id       uuid not null references organizations(id) on delete cascade,
  tool_key     text not null,   -- 'auditsay' | 'apqp-manager' | 'gauge-manager' | 'nc-manager' | '4m-change-manager'
  selected_at  timestamptz not null default now(),
  primary key (org_id, tool_key)
);

-- ── 6. org_tool_overrides (도구 접근 오버라이드 — 운영자 전용) ───────────────
create table org_tool_overrides (
  org_id      uuid not null references organizations(id) on delete cascade,
  tool_key    text not null,
  enabled     boolean not null,
  expires_at  timestamptz,     -- null = 영구
  reason      text,
  created_at  timestamptz not null default now(),
  primary key (org_id, tool_key)
);

-- ── 7. fmea_demo_sessions ─────────────────────────────────────────────────────
create table fmea_demo_sessions (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid references auth.users(id),
  scenario_key          text,
  turn_count            int not null default 0,
  completed             boolean not null default false,
  converted_to_signup   boolean not null default false,
  ip_hash               text,
  created_at            timestamptz not null default now()
);

comment on table fmea_demo_sessions is 'AI FMEA 체험 데모 사용 로그. 비로그인 가능, IP당 1일 1세션 제한 (§7.3).';

-- ── 8. calculator_usage ──────────────────────────────────────────────────────
create table calculator_usage (
  id        uuid primary key default gen_random_uuid(),
  tool_key  text not null,
  user_id   uuid references auth.users(id),
  used_at   timestamptz not null default now()
);

comment on table calculator_usage is '계산 도구 사용 통계. 익명 가능, 로그 용도만 (§7).';

-- ── 9. 인덱스 ─────────────────────────────────────────────────────────────────
create index idx_org_members_org_id    on org_members(org_id);
create index idx_org_members_user_id   on org_members(user_id);
create index idx_org_sites_org_id      on org_sites(org_id);
create index idx_fmea_demo_ip_hash     on fmea_demo_sessions(ip_hash, created_at);
create index idx_calculator_usage_key  on calculator_usage(tool_key, used_at);
create index idx_organizations_status  on organizations(status);

-- ── 10. RPC 함수 ──────────────────────────────────────────────────────────────

-- 슈퍼관리자 확인 헬퍼
create or replace function is_superadmin()
returns boolean language sql security definer stable as $$
  select email = 'chulhocho@daum.net'
  from auth.users where id = auth.uid();
$$;

-- 회원가입: org + primary site + owner member 원자 생성
create or replace function register_org(
  p_user_id   uuid,
  p_org_name  text,
  p_org_type  text default 'individual'
)
returns uuid language plpgsql security definer
set search_path = public as $$
declare
  v_org_id    uuid;
  v_site_id   uuid;
  v_org_status  text;
  v_mbr_status  text;
begin
  -- 기업은 pending, 개인은 바로 active
  v_org_status := case when p_org_type = 'corporate' then 'pending' else 'active' end;
  v_mbr_status := case when p_org_type = 'corporate' then 'invited' else 'active' end;

  insert into organizations (name, plan_id, org_type, status, source_domain)
  values (p_org_name, 'free', p_org_type, v_org_status, 'quality-hub')
  returning id into v_org_id;

  insert into org_sites (org_id, name, is_primary)
  values (v_org_id, p_org_name, true)
  returning id into v_site_id;

  insert into org_members (org_id, user_id, role, site_id, status)
  values (v_org_id, p_user_id, 'owner', v_site_id, v_mbr_status);

  return v_org_id;
end;
$$;

-- 세션 조회: 현재 사용자의 org + plan 정보
create or replace function get_my_membership()
returns table(
  member_role    text,
  member_status  text,
  org_id         uuid,
  org_name       text,
  plan_id        text,
  org_status     text,
  org_type       text
)
language plpgsql security definer as $$
begin
  return query
    select
      m.role,
      m.status,
      o.id,
      o.name,
      o.plan_id,
      o.status,
      o.org_type
    from org_members m
    join organizations o on o.id = m.org_id
    where m.user_id = auth.uid()
      and m.status = 'active'
    limit 1;
end;
$$;

-- 슈퍼관리자: 전체 조직 목록
create or replace function get_all_organizations()
returns table(
  id          uuid,
  name        text,
  plan_id     text,
  org_type    text,
  status      text,
  created_at  timestamptz,
  owner_email text
)
language plpgsql security definer as $$
begin
  if not is_superadmin() then raise exception 'Unauthorized'; end if;
  return query
    select
      o.id, o.name, o.plan_id, o.org_type, o.status, o.created_at,
      u.email as owner_email
    from organizations o
    left join org_members m on m.org_id = o.id and m.role = 'owner'
    left join auth.users u on u.id = m.user_id
    order by o.created_at desc;
end;
$$;

-- 슈퍼관리자: 기업 승인 + 플랜 설정
create or replace function approve_org(
  p_org_id  uuid,
  p_plan_id text default 'starter'
)
returns void language plpgsql security definer as $$
begin
  if not is_superadmin() then raise exception 'Unauthorized'; end if;
  update organizations set status = 'active', plan_id = p_plan_id
  where id = p_org_id;
  update org_members set status = 'active'
  where org_id = p_org_id and role = 'owner';
end;
$$;

-- 슈퍼관리자: 기업 거절 (삭제)
create or replace function reject_org(p_org_id uuid)
returns void language plpgsql security definer as $$
begin
  if not is_superadmin() then raise exception 'Unauthorized'; end if;
  delete from organizations where id = p_org_id;
end;
$$;

-- 슈퍼관리자: 플랜 변경
create or replace function set_org_plan(p_org_id uuid, p_plan_id text)
returns void language plpgsql security definer as $$
begin
  if not is_superadmin() then raise exception 'Unauthorized'; end if;
  update organizations set plan_id = p_plan_id where id = p_org_id;
end;
$$;
