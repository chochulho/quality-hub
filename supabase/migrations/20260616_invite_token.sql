-- 팀원 초대 토큰: 초대 이메일 링크 + 가입 시 조직 연결에 사용
-- 기존 'invited' 행도 gen_random_uuid() 기본값이 행마다 개별 계산되어 즉시 유효한 토큰을 가짐

alter table org_members add column if not exists invite_token uuid not null default gen_random_uuid();
alter table org_members add column if not exists invited_at timestamptz not null default now();

create unique index if not exists org_members_invite_token_idx on org_members(invite_token);
