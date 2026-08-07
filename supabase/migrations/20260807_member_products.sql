-- =============================================================================
-- 멤버 × 제품 사용권한 매트릭스 (SSO 프로비저닝 계약 §9)
-- qmintel = 신원·권한의 source of truth. 멤버별 제품 grant/revoke를 저장하고
-- 하위 SaaS로 프로비저닝 push + JWT products claim의 근거가 된다.
-- 참조: docs/sso-provisioning-contract.md
-- =============================================================================

-- ── 1. org_member_products (멤버별 제품 grant) ────────────────────────────────
create table if not exists org_member_products (
  member_id     uuid not null references org_members(id) on delete cascade,
  product_slug  text not null,   -- canonical 슬러그 (계약 §1): 'change-manager' | 'gauge-manager' | 'apqp-manager' | 'auditsay' | 'nc-manager'
  granted_at    timestamptz not null default now(),
  primary key (member_id, product_slug)
);

alter table org_member_products enable row level security;

create policy "member_products: select own org"
  on org_member_products for select
  using (
    exists (
      select 1 from org_members m
      where m.user_id = auth.uid()
        and m.status in ('active', 'invited')
        and m.org_id = (select org_id from org_members where id = org_member_products.member_id)
    )
  );

create policy "member_products: manage by admin"
  on org_member_products for all
  using (
    exists (
      select 1 from org_members m
      where m.user_id = auth.uid()
        and m.role in ('owner', 'admin')
        and m.status = 'active'
        and m.org_id = (select org_id from org_members where id = org_member_products.member_id)
    )
  );

-- ── 2. sso_provision_log (프로비저닝 push 감사·수동 재시도) ────────────────────
create table if not exists sso_provision_log (
  id            uuid primary key default gen_random_uuid(),
  event_id      text not null,
  product_slug  text not null,
  action        text not null check (action in ('grant', 'revoke')),
  member_email  text not null,
  org_id        uuid,
  http_status   int,
  ok            boolean not null default false,
  attempts      int not null default 0,
  error         text,
  created_at    timestamptz not null default now()
);

create index if not exists idx_sso_provision_log_created on sso_provision_log(created_at desc);
create index if not exists idx_sso_provision_log_event   on sso_provision_log(event_id);

alter table sso_provision_log enable row level security;

-- 슈퍼관리자만 조회. 쓰기는 service_role(발신 액션)만 → 정책 없음(RLS로 차단, service_role 우회).
create policy "provision_log: superadmin read"
  on sso_provision_log for select
  using (is_superadmin());

-- ── 3. RPC: org 전체 멤버-제품 매핑 (관리자용) ────────────────────────────────
create or replace function get_org_member_products(p_org_id uuid)
returns table(member_id uuid, slugs text[])
language sql security definer as $$
  select
    m.id as member_id,
    coalesce(array_agg(omp.product_slug) filter (where omp.product_slug is not null), '{}')
  from org_members m
  left join org_member_products omp on omp.member_id = m.id
  where m.org_id = p_org_id
  group by m.id;
$$;

-- ── 4. RPC: 멤버 제품 배정 업데이트 (admin only, replace) ──────────────────────
create or replace function set_member_products(p_member_id uuid, p_slugs text[])
returns void language plpgsql security definer as $$
declare
  v_org_id uuid;
begin
  select org_id into v_org_id from org_members where id = p_member_id;

  if not is_superadmin() and not exists (
    select 1 from org_members
    where user_id = auth.uid()
      and org_id = v_org_id
      and role in ('owner', 'admin')
      and status = 'active'
  ) then
    raise exception 'Unauthorized';
  end if;

  delete from org_member_products where member_id = p_member_id;

  if p_slugs is not null and array_length(p_slugs, 1) > 0 then
    insert into org_member_products (member_id, product_slug)
    select p_member_id, unnest(p_slugs)
    on conflict do nothing;
  end if;
end;
$$;

-- ── 5. RPC: 현재 사용자의 grant된 제품 슬러그 (클릭 라우트 게이팅 + JWT claim) ──
create or replace function get_my_product_slugs()
returns text[] language sql security definer stable as $$
  select coalesce(array_agg(omp.product_slug), '{}')
  from org_member_products omp
  join org_members m on m.id = omp.member_id
  where m.user_id = auth.uid()
    and m.status in ('active', 'invited');
$$;
