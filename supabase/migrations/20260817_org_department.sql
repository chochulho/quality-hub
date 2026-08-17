-- =============================================================================
-- 경영관리(Management) 모듈 기반 — 멤버 부서(department) 자유 텍스트 필드
-- 부서 마스터 테이블 없이, org_members.department 텍스트만으로 부서 소유권 판단
-- (편집 권한 비교는 애플리케이션 레벨 lib/auth/management.ts에서 정규화 비교)
-- =============================================================================

alter table org_members add column if not exists department text;

comment on column org_members.department is
  '자유 텍스트 부서명. 경영관리 모듈(KPI/BSC·리스크분석 등) 항목의 담당부서와 비교해 편집 권한 판단에 사용.';

-- get_my_membership()에 department 추가 (20260606_multi_site_members.sql의 정의를 이어받음)
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
  site_ids       uuid[],
  department     text
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
      auth_accessible_site_ids(),
      m.department
    from org_members m
    join organizations o on o.id = m.org_id
    where m.user_id = auth.uid()
      and m.status in ('active', 'invited')
    limit 1;
end;
$$;

-- 멤버 부서 변경은 org_members.role 변경(updateMemberRole)과 동일하게
-- Server Action에서 createAdminClient() 직접 update로 처리 (RPC 불필요 — 단순 스칼라 컬럼).
