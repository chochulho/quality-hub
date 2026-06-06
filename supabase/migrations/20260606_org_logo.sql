-- organizations 테이블에 로고 URL 컬럼 추가
alter table organizations add column if not exists logo_url text;

-- get_my_membership: logo_url 반환 추가
create or replace function get_my_membership()
returns table(
  member_role    text,
  member_status  text,
  org_id         uuid,
  org_name       text,
  plan_id        text,
  org_status     text,
  org_type       text,
  logo_url       text
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
      o.logo_url
    from org_members m
    join organizations o on o.id = m.org_id
    where m.user_id = auth.uid()
      and m.status in ('active', 'invited')
    limit 1;
end;
$$;
