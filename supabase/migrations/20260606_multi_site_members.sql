-- =============================================================================
-- 멤버-사업장 다대다 관계 (member가 여러 사업장 접근 가능)
-- =============================================================================

-- 1. 진열 테이블
create table if not exists org_member_sites (
  member_id uuid not null references org_members(id) on delete cascade,
  site_id   uuid not null references org_sites(id)   on delete cascade,
  primary key (member_id, site_id)
);

-- 2. RLS
alter table org_member_sites enable row level security;

create policy "member_sites: select own org"
  on org_member_sites for select
  using (
    exists (
      select 1 from org_members m
      where m.user_id = auth.uid()
        and m.status in ('active', 'invited')
        and m.org_id = (select org_id from org_members where id = org_member_sites.member_id)
    )
  );

create policy "member_sites: manage by admin"
  on org_member_sites for all
  using (
    exists (
      select 1 from org_members m
      where m.user_id = auth.uid()
        and m.role in ('owner', 'admin')
        and m.status = 'active'
        and m.org_id = (select org_id from org_members where id = org_member_sites.member_id)
    )
  );

-- 3. 기존 org_members.site_id 데이터 이전
insert into org_member_sites (member_id, site_id)
select id, site_id
from org_members
where site_id is not null
on conflict do nothing;

-- 4. 헬퍼: 현재 사용자의 접근 가능한 사업장 ID 배열
create or replace function auth_accessible_site_ids()
returns uuid[] language sql stable security definer as $$
  select case
    when (
      select role from org_members
      where user_id = auth.uid()
        and org_id = auth_org_id()
        and status in ('active', 'invited')
      limit 1
    ) in ('owner', 'admin')
    then coalesce(array(select id from org_sites where org_id = auth_org_id()), '{}')
    else coalesce(array(
      select oms.site_id
      from org_member_sites oms
      join org_members m on m.id = oms.member_id
      where m.user_id = auth.uid()
        and m.org_id = auth_org_id()
        and m.status in ('active', 'invited')
    ), '{}')
  end
$$;

-- 5. RPC: org 전체 멤버-사업장 매핑 (관리자용)
create or replace function get_org_member_sites(p_org_id uuid)
returns table(member_id uuid, site_ids uuid[])
language sql security definer as $$
  select
    m.id as member_id,
    coalesce(array_agg(oms.site_id) filter (where oms.site_id is not null), '{}')
  from org_members m
  left join org_member_sites oms on oms.member_id = m.id
  where m.org_id = p_org_id
  group by m.id;
$$;

-- 6. RPC: 멤버 사업장 배정 업데이트 (admin only)
create or replace function set_member_sites(p_member_id uuid, p_site_ids uuid[])
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

  delete from org_member_sites where member_id = p_member_id;

  if p_site_ids is not null and array_length(p_site_ids, 1) > 0 then
    insert into org_member_sites (member_id, site_id)
    select p_member_id, unnest(p_site_ids);
  end if;
end;
$$;

-- 7. get_my_membership: site_ids 추가
drop function if exists get_my_membership();
create or replace function get_my_membership()
returns table(
  member_role    text,
  member_status  text,
  org_id         uuid,
  org_name       text,
  plan_id        text,
  org_status     text,
  org_type       text,
  logo_url       text,
  site_ids       uuid[]
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
      o.org_type,
      o.logo_url,
      auth_accessible_site_ids()
    from org_members m
    join organizations o on o.id = m.org_id
    where m.user_id = auth.uid()
      and m.status in ('active', 'invited')
    limit 1;
end;
$$;
