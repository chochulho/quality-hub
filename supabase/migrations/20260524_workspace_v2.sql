-- =============================================================================
-- quality-hub Workspace v2 마이그레이션
-- §3 데이터 모델 (SPEC-WORKSPACE.md v2)
-- 실행 순서: plans → organizations → org_sites → org_members
--            → org_selected_tools → org_tool_overrides
--            → fmea_demo_sessions → calculator_usage
-- =============================================================================

-- ── 0. 기존 테이블 정리 (재실행 안전) ────────────────────────────────────────
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
  region         text not null default 'KR',
  source_domain  text,   -- 'quality-hub' | 'auditsay' | 'apqp' | 'gauge'
  trial_ends_at  timestamptz,
  created_at     timestamptz not null default now()
);

comment on column organizations.source_domain is '가입 경로 도메인 — 멀티 도메인 통합 (§9)';

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
  tool_key     text not null,   -- 'auditsay' | 'apqp' | 'gauge' | 'nc' | '4m'
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

-- ── 7. fmea_demo_sessions (FMEA 체험 데모 로그 — NEW v2) ─────────────────────
create table fmea_demo_sessions (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid references auth.users(id),   -- nullable (비로그인 허용)
  scenario_key          text,   -- 'brake_pedal' | 'bms_battery' | 'injection_molding' | ...
  turn_count            int not null default 0,
  completed             boolean not null default false,
  converted_to_signup   boolean not null default false,
  ip_hash               text,   -- IP rate limit용 (SHA-256 해시, 원본 IP 비저장)
  created_at            timestamptz not null default now()
);

comment on table fmea_demo_sessions is 'AI FMEA 체험 데모 사용 로그. 비로그인 가능, IP당 1일 1세션 제한 (§7.3).';

-- ── 8. calculator_usage (계산 도구 사용 로그 — 간단 통계) ───────────────────
create table calculator_usage (
  id        uuid primary key default gen_random_uuid(),
  tool_key  text not null,   -- 'spc.cpk' | 'qc7.pareto' | 'spc.xbar-r' | ...
  user_id   uuid references auth.users(id),   -- nullable (익명)
  used_at   timestamptz not null default now()
);

comment on table calculator_usage is '계산 도구 사용 통계. 익명 가능, 로그 용도만 (§7).';

-- ── 9. 인덱스 ─────────────────────────────────────────────────────────────────
create index idx_org_members_org_id   on org_members(org_id);
create index idx_org_members_user_id  on org_members(user_id);
create index idx_org_sites_org_id     on org_sites(org_id);
create index idx_fmea_demo_ip_hash    on fmea_demo_sessions(ip_hash, created_at);
create index idx_calculator_usage_key on calculator_usage(tool_key, used_at);
