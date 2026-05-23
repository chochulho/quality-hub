-- ============================================================
-- quality-hub — Supabase Schema
-- auditsay 프로젝트에 추가 실행 (SQL Editor)
-- 테이블명 qh_ 접두사로 기존 auditsay 테이블과 분리
-- auth.users는 auditsay와 공유 → Phase 2 SSO 기반
-- ============================================================

-- ── QH Companies ─────────────────────────────────────────────
CREATE TABLE qh_companies (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  type        TEXT DEFAULT 'individual' CHECK (type IN ('individual', 'corporate')),
  grade       TEXT DEFAULT 'free'       CHECK (grade IN ('free', 'silver', 'gold', 'platinum')),
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active')),
  sso_token   TEXT,           -- Phase 2: 자매 사이트 SSO 핸드셰이크 시크릿
  sso_enabled BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── QH Profiles (auth.users 확장) ────────────────────────────
CREATE TABLE qh_profiles (
  id          UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name        TEXT NOT NULL,
  department  TEXT DEFAULT '',
  role        TEXT DEFAULT 'company_admin'
              CHECK (role IN ('superadmin', 'company_admin', 'member')),
  company_id  UUID REFERENCES qh_companies(id) ON DELETE SET NULL,
  external_id TEXT,           -- Phase 2: auditsay/NC Manager 계정 연동 UUID
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE qh_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE qh_profiles  ENABLE ROW LEVEL SECURITY;

-- 현재 유저의 qh company_id 헬퍼
CREATE OR REPLACE FUNCTION qh_get_my_company_id()
RETURNS UUID LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT company_id FROM qh_profiles WHERE id = auth.uid();
$$;

-- 슈퍼어드민 체크 헬퍼
CREATE OR REPLACE FUNCTION qh_is_superadmin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT email = 'chulhocho@daum.net'
  FROM auth.users WHERE id = auth.uid();
$$;

-- Companies 정책
CREATE POLICY "qh_own_company_select" ON qh_companies
  FOR SELECT USING (id = qh_get_my_company_id() OR qh_is_superadmin());
CREATE POLICY "qh_own_company_update" ON qh_companies
  FOR UPDATE USING (id = qh_get_my_company_id());
CREATE POLICY "qh_own_company_insert" ON qh_companies
  FOR INSERT WITH CHECK (true); -- SECURITY DEFINER RPC 에서만 처리

-- Profiles 정책
CREATE POLICY "qh_own_profile_select" ON qh_profiles
  FOR SELECT USING (company_id = qh_get_my_company_id() OR qh_is_superadmin());
CREATE POLICY "qh_own_profile_insert" ON qh_profiles
  FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "qh_own_profile_update" ON qh_profiles
  FOR UPDATE USING (id = auth.uid());

-- ── 가입 RPC ─────────────────────────────────────────────────
-- 개인 → status='active', 기업 → status='pending' (슈퍼관리자 승인 필요)
CREATE OR REPLACE FUNCTION qh_register_user(
  p_user_id      UUID,
  p_name         TEXT,
  p_company_name TEXT,
  p_type         TEXT DEFAULT 'individual',
  p_grade        TEXT DEFAULT 'free',
  p_department   TEXT DEFAULT ''
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_company_id UUID;
  v_status     TEXT;
BEGIN
  v_status := CASE WHEN p_type = 'corporate' THEN 'pending' ELSE 'active' END;

  INSERT INTO qh_companies (name, type, grade, status)
  VALUES (p_company_name, p_type, p_grade, v_status)
  RETURNING id INTO v_company_id;

  INSERT INTO qh_profiles (id, name, department, role, company_id)
  VALUES (p_user_id, p_name, p_department, 'company_admin', v_company_id);
END;
$$;

-- ── 슈퍼관리자 RPC ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION qh_get_all_companies()
RETURNS TABLE(
  id uuid, name text, type text, grade text, status text,
  created_at timestamptz, admin_name text, admin_email text
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT qh_is_superadmin() THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  RETURN QUERY
    SELECT c.id, c.name, c.type, c.grade, c.status, c.created_at,
           p.name AS admin_name, u.email AS admin_email
    FROM qh_companies c
    LEFT JOIN qh_profiles p ON p.company_id = c.id AND p.role = 'company_admin'
    LEFT JOIN auth.users u ON u.id = p.id
    ORDER BY c.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION qh_approve_company(
  p_company_id UUID,
  p_grade      TEXT DEFAULT 'silver'
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT qh_is_superadmin() THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  UPDATE qh_companies SET status = 'active', grade = p_grade
  WHERE id = p_company_id;
END;
$$;

CREATE OR REPLACE FUNCTION qh_reject_company(p_company_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT qh_is_superadmin() THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  DELETE FROM qh_companies WHERE id = p_company_id;
END;
$$;

CREATE OR REPLACE FUNCTION qh_set_company_grade(p_company_id UUID, p_grade TEXT)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT qh_is_superadmin() THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  UPDATE qh_companies SET grade = p_grade WHERE id = p_company_id;
END;
$$;

-- ── 세션 조회 RPC ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION qh_get_my_profile()
RETURNS TABLE(
  prof_name      text,
  department     text,
  role           text,
  company_id     uuid,
  company_name   text,
  company_grade  text,
  company_status text,
  company_type   text
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
    SELECT p.name, p.department, p.role, p.company_id,
           c.name, c.grade, c.status, c.type
    FROM qh_profiles p
    LEFT JOIN qh_companies c ON c.id = p.company_id
    WHERE p.id = auth.uid();
END;
$$;
