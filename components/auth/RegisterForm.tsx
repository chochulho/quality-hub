'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle, Building2, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type MemberType = 'individual' | 'corporate'

export default function RegisterForm() {
  const router = useRouter()

  const [memberType, setMemberType] = useState<MemberType>('individual')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [orgName, setOrgName] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isCorporate, setIsCorporate] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    // 1. Supabase Auth 유저 생성
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError || !authData.user) {
      setLoading(false)
      if (signUpError?.message.includes('already registered')) {
        setError('이미 가입된 이메일입니다. 로그인을 시도해보세요.')
      } else {
        setError(signUpError?.message ?? '가입 중 오류가 발생했습니다.')
      }
      return
    }

    // 2. register_org RPC: org + primary site + owner member 원자 생성
    const finalOrgName =
      memberType === 'corporate' ? orgName : `${name}의 계정`

    const { error: rpcError } = await supabase.rpc('register_org', {
      p_user_id:  authData.user.id,
      p_org_name: finalOrgName,
      p_org_type: memberType,
    })

    setLoading(false)

    if (rpcError) {
      setError('계정 설정 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      return
    }

    setIsCorporate(memberType === 'corporate')
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="bg-white border border-border rounded-3xl p-8 shadow-sm text-center">
        <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-7 w-7 text-green-600" />
        </div>
        <h2 className="text-xl font-extrabold text-brand-navy mb-2">
          {isCorporate ? '가입 신청 완료!' : '가입 완료!'}
        </h2>
        {isCorporate ? (
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            기업 회원 신청이 접수되었습니다.
            <br />
            관리자 검토 후 이메일로 활성화 안내를 드립니다.
            <br />
            <span className="text-amber-700 font-medium">보통 1~2 영업일 내 처리됩니다.</span>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            가입 확인 이메일을 발송했습니다.
            <br />
            이메일의 링크를 클릭하면 바로 이용하실 수 있습니다.
          </p>
        )}
        <button
          onClick={() => router.push('/login')}
          className="inline-flex items-center gap-2 bg-brand-orange text-white rounded-full px-6 py-3 font-semibold hover:bg-brand-orange-hover transition-all text-sm"
        >
          로그인하러 가기
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* 회원 유형 */}
        <div>
          <p className="text-sm font-medium text-foreground mb-2">회원 유형</p>
          <div className="grid grid-cols-2 gap-3">
            {(['individual', 'corporate'] as MemberType[]).map((type) => {
              const isSelected = memberType === type
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setMemberType(type)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    isSelected
                      ? 'border-brand-orange bg-brand-orange/5 text-brand-orange'
                      : 'border-border bg-white text-muted-foreground hover:border-brand-navy/30'
                  }`}
                >
                  {type === 'individual' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Building2 className="h-4 w-4" />
                  )}
                  {type === 'individual' ? '개인' : '기업'}
                </button>
              )
            })}
          </div>
          {memberType === 'corporate' && (
            <p className="text-xs text-amber-700 mt-2 bg-amber-50 rounded-lg px-3 py-2">
              기업 회원은 관리자 검토 후 활성화됩니다 (1~2 영업일).
            </p>
          )}
        </div>

        {/* 이름 */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {memberType === 'corporate' ? '담당자 이름' : '이름'}
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="홍길동"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-colors text-sm"
          />
        </div>

        {/* 기업명 (기업 회원만) */}
        {memberType === 'corporate' && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              회사명
            </label>
            <input
              type="text"
              required
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="(주)품질기업"
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-colors text-sm"
            />
          </div>
        )}

        {/* 이메일 */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">이메일</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-colors text-sm"
          />
        </div>

        {/* 비밀번호 */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            비밀번호 <span className="text-muted-foreground font-normal">(6자 이상)</span>
          </label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              className="w-full px-4 py-3 pr-11 rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-colors text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 보기'}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* 플랜 안내 (가입 후 선택) */}
        <div className="rounded-xl bg-muted/60 border border-border px-4 py-3 text-xs text-muted-foreground">
          무료 플랜으로 시작합니다. 가입 후 대시보드에서 요금제를 업그레이드할 수 있습니다.
        </div>

        {/* 에러 */}
        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* 제출 */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-brand-orange text-white rounded-full px-6 py-3.5 font-semibold hover:bg-brand-orange-hover transition-all hover:-translate-y-0.5 duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {loading ? '가입 처리 중...' : '가입하기'}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>
    </div>
  )
}
