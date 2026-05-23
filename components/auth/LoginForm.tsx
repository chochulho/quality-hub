'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface LoginFormProps {
  next?: string
}

export default function LoginForm({ next }: LoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (authError) {
      if (authError.message.toLowerCase().includes('email not confirmed')) {
        setError('이메일 인증이 완료되지 않았습니다. 받은 편지함을 확인해주세요.')
      } else if (authError.message.toLowerCase().includes('invalid')) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      } else {
        setError(authError.message)
      }
      return
    }

    // Server Component 캐시 초기화 후 이동
    router.push(next ?? '/dashboard')
    router.refresh()
  }

  return (
    <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 이메일 */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            이메일
          </label>
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
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-foreground">
              비밀번호
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-brand-orange transition-colors"
            >
              비밀번호 찾기
            </Link>
          </div>
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

        {/* 에러 메시지 */}
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
          {loading ? '로그인 중...' : '로그인'}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>
    </div>
  )
}
