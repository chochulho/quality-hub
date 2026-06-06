-- get_my_membership: 기업 가입 후 관리자 승인 대기 중인 사용자(invited)도 세션을 받을 수 있도록 수정
-- 문제: register_org()가 기업 owner를 'invited' 상태로 생성하는데, 기존 함수는 'active'만 반환해
--       pending 기업 회원이 로그인 후 대시보드 ↔ 로그인 무한 리디렉트 루프에 빠짐
-- 해결: m.status in ('active', 'invited')로 확장 — org_status='pending'인 경우 대시보드에서 배너로 안내

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
      and m.status in ('active', 'invited')
    limit 1;
end;
$$;
