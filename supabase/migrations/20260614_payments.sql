-- =============================================================================
-- payments 테이블: 결제 이력 원장
-- organizations.plan_expires_at: 구독 만료일
-- =============================================================================

-- ── 1. organizations에 만료일 컬럼 추가 ──────────────────────────────────────
alter table organizations
  add column if not exists plan_expires_at timestamptz;

comment on column organizations.plan_expires_at is
  '현재 플랜 만료 시각. null = 무기한(Free/관리자 수동). 결제 성공 시 갱신.';

-- ── 2. payments 테이블 ────────────────────────────────────────────────────────
create table if not exists payments (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references organizations(id) on delete cascade,
  user_id         uuid not null references auth.users(id),
  plan_id         text not null references plans(id),

  -- 결제 유형
  billing_type    text not null check (billing_type in ('monthly', 'yearly')),

  -- 금액 (원 단위, VAT 포함)
  amount          int  not null,   -- 실결제 총액 (공급가 + VAT)
  amount_supply   int  not null,   -- 공급가액 (VAT 제외)
  amount_vat      int  not null,   -- VAT = amount - amount_supply

  -- 상태
  status          text not null default 'pending'
                  check (status in ('pending', 'paid', 'failed', 'cancelled', 'refunded')),

  -- Toss Payments 정보
  order_id        text not null unique,   -- 우리가 생성한 주문 ID
  payment_key     text,                   -- Toss가 부여한 결제 키
  payment_method  text,                   -- 결제 수단 (카드, 가상계좌 등)
  receipt_url     text,                   -- Toss 영수증 URL

  -- 구독 기간
  period_start    date,
  period_end      date,

  -- 타임스탬프
  paid_at         timestamptz,
  failed_at       timestamptz,
  created_at      timestamptz not null default now()
);

comment on table payments is '결제 이력 원장. 삭제 금지 — 취소/환불도 status 변경으로 처리.';

-- ── 3. 인덱스 ────────────────────────────────────────────────────────────────
create index if not exists payments_org_id_idx   on payments(org_id);
create index if not exists payments_order_id_idx on payments(order_id);
create index if not exists payments_status_idx   on payments(status);
create index if not exists payments_paid_at_idx  on payments(paid_at desc);

-- ── 4. RLS ───────────────────────────────────────────────────────────────────
alter table payments enable row level security;

-- 조직 멤버: 본인 조직 결제 이력 조회만 허용
create policy "payments: org member select"
  on payments for select
  using (
    org_id in (
      select org_id from org_members
      where user_id = auth.uid() and status = 'active'
    )
  );

-- INSERT / UPDATE: service_role 전용 (API Route에서 admin client 사용)
-- RLS상 일반 사용자에게 쓰기 권한 없음 → 명시적 deny 정책 불필요
