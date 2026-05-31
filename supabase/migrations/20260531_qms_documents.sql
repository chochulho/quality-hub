-- =============================================================================
-- QMS 문서 라이브러리 — qms_documents 테이블
-- spec: QMS_WIZARD_SPEC_FINAL.md §8-4
-- 의존: organizations (20260524_workspace_v2.sql), auth_org_id() (20260524_rls_policies.sql)
-- =============================================================================

-- ── 재실행 안전 정리 ──────────────────────────────────────────────────────────
drop table if exists qms_documents cascade;

-- ── 1. 테이블 ─────────────────────────────────────────────────────────────────
create table qms_documents (
  id               uuid        primary key default gen_random_uuid(),
  org_id           uuid        not null references organizations(id) on delete cascade,
  doc_no           text        not null,
  type             text        not null,
  title            text        not null,
  content          text        not null default '',
  version          text        not null default 'Rev.00',
  status           text        not null default 'draft'
                               check (status in ('draft', 'issued', 'obsolete')),
  standard_clauses text[]      not null default '{}',
  layer            text        not null default 'iso9001',
  revision_history jsonb       not null default '[]',
  revised_at       text        not null default '',
  revised_by       text        not null default '',
  approved_by      text        not null default '',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  unique (org_id, doc_no)
);

-- ── 2. updated_at 자동 갱신 ───────────────────────────────────────────────────
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger qms_documents_updated_at
  before update on qms_documents
  for each row execute function touch_updated_at();

-- ── 3. RLS ───────────────────────────────────────────────────────────────────
alter table qms_documents enable row level security;

-- 같은 org 멤버는 모두 읽기 가능
create policy "qms_documents: org read"
  on qms_documents for select
  using (org_id = auth_org_id());

-- INSERT 시 자신의 org_id로만 저장 가능
create policy "qms_documents: org insert"
  on qms_documents for insert
  with check (org_id = auth_org_id());

-- 같은 org 멤버라면 수정 가능 (편집 권한 세분화는 향후)
create policy "qms_documents: org update"
  on qms_documents for update
  using (org_id = auth_org_id());

-- 삭제는 owner/admin만 (향후 역할 세분화)
create policy "qms_documents: org delete"
  on qms_documents for delete
  using (org_id = auth_org_id() and auth_org_role() in ('owner', 'admin'));

-- ── 4. 인덱스 ─────────────────────────────────────────────────────────────────
create index qms_documents_org_id_idx on qms_documents (org_id);
create index qms_documents_status_idx on qms_documents (org_id, status);
create index qms_documents_type_idx   on qms_documents (org_id, type);
