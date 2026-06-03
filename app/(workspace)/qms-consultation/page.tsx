"use client"

import { useState } from "react"
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"

interface FormData {
  companyName: string
  contactName: string
  email: string
  phone: string
  companySize: string
  qmsStatus: string
  certGoals: string[]
  preferredTime: string
  message: string
}

const INITIAL: FormData = {
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  companySize: '',
  qmsStatus: '',
  certGoals: [],
  preferredTime: '',
  message: '',
}

export default function QmsConsultationPage() {
  const [form, setForm] = useState<FormData>(INITIAL)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function handleCheckbox(value: string) {
    setForm(prev => ({
      ...prev,
      certGoals: prev.certGoals.includes(value)
        ? prev.certGoals.filter(v => v !== value)
        : [...prev.certGoals, value],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/qms-consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setDone(true)
    } catch {
      setError('전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-background-soft flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-success" />
          </div>
          <h1 className="text-2xl font-extrabold text-brand-navy">
            상담 신청이 접수되었습니다
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            영업일 기준 <strong>1~2일 내</strong>에 담당자가 연락드립니다.<br />
            신청 내역은 입력하신 이메일로도 전송됩니다.
          </p>
          <div className="rounded-2xl border border-border bg-white p-5 text-sm text-left space-y-1">
            <p className="text-muted-foreground">급한 문의</p>
            <a href="mailto:chulhocho@daum.net" className="font-semibold text-brand-navy hover:underline">
              chulhocho@daum.net
            </a>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  const isValid = form.companyName && form.contactName && form.email && form.phone
    && form.companySize && form.qmsStatus

  return (
    <div className="min-h-screen bg-background-soft">
      <div className="max-w-2xl mx-auto px-4 py-12">

        {/* 헤더 */}
        <div className="mb-8 space-y-2">
          <p className="text-brand-orange text-sm font-medium">무료 30분 화상 상담</p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-brand-navy leading-tight">
            QMS 구축 상담 신청
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            AI 위자드 결과를 자동차 부품 품질 30년 경력 전문가와 함께 검토합니다.<br />
            회사 상황에 맞는 진행 방식을 제안해 드립니다.
          </p>
        </div>

        {/* 혜택 요약 */}
        <div className="rounded-2xl border border-border bg-white p-5 mb-8 space-y-2">
          {[
            'AI 자동 생성된 매뉴얼·절차서 초안',
            '자동차 부품 품질 30년 경력 전문가 직접 상담 (무료 30분 화상)',
            '회사 상황에 맞는 맞춤 패키지 제안',
            'IATF 16949 인증 준비 단계별 가이드',
          ].map(item => (
            <div key={item} className="flex items-start gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-success mt-0.5 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* 회사명 */}
          <div>
            <label className="block text-sm font-semibold mb-1.5">
              회사명 <span className="text-destructive">*</span>
            </label>
            <input
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              placeholder="(주)한국자동차부품"
              className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-colors"
              required
            />
          </div>

          {/* 담당자 / 이메일 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">
                담당자 이름 <span className="text-destructive">*</span>
              </label>
              <input
                name="contactName"
                value={form.contactName}
                onChange={handleChange}
                placeholder="홍길동"
                className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">
                이메일 <span className="text-destructive">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="hong@company.com"
                className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-colors"
                required
              />
            </div>
          </div>

          {/* 전화번호 */}
          <div>
            <label className="block text-sm font-semibold mb-1.5">
              전화번호 <span className="text-destructive">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="010-0000-0000"
              className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-colors"
              required
            />
          </div>

          {/* 회사 규모 */}
          <div>
            <label className="block text-sm font-semibold mb-1.5">
              회사 인원 규모 <span className="text-destructive">*</span>
            </label>
            <select
              name="companySize"
              value={form.companySize}
              onChange={handleChange}
              className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-colors bg-white"
              required
            >
              <option value="">선택해주세요</option>
              <option value="50인 이하">50인 이하</option>
              <option value="51~200인">51~200인</option>
              <option value="200인 초과">200인 초과</option>
            </select>
          </div>

          {/* QMS 상태 */}
          <div>
            <label className="block text-sm font-semibold mb-1.5">
              현재 QMS 상태 <span className="text-destructive">*</span>
            </label>
            <select
              name="qmsStatus"
              value={form.qmsStatus}
              onChange={handleChange}
              className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-colors bg-white"
              required
            >
              <option value="">선택해주세요</option>
              <option value="없음">QMS 없음 (처음 구축)</option>
              <option value="일부 구축">일부 구축되어 있음</option>
              <option value="다른 시스템 사용">다른 시스템 사용 중</option>
            </select>
          </div>

          {/* 인증 목표 (선택) */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              인증 목표 <span className="text-muted-foreground font-normal text-xs">(선택)</span>
            </label>
            <div className="flex gap-4">
              {['ISO 9001', 'IATF 16949'].map(cert => (
                <label key={cert} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.certGoals.includes(cert)}
                    onChange={() => handleCheckbox(cert)}
                    className="rounded border-border w-4 h-4 accent-brand-navy"
                  />
                  <span className="text-sm">{cert}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 희망 상담 시간대 (선택) */}
          <div>
            <label className="block text-sm font-semibold mb-1.5">
              희망 상담 시간대 <span className="text-muted-foreground font-normal text-xs">(선택)</span>
            </label>
            <input
              name="preferredTime"
              value={form.preferredTime}
              onChange={handleChange}
              placeholder="예: 평일 오전 10시 이후, 주중 아무 때나"
              className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-colors"
            />
          </div>

          {/* 추가 문의 (선택) */}
          <div>
            <label className="block text-sm font-semibold mb-1.5">
              추가 문의 <span className="text-muted-foreground font-normal text-xs">(선택)</span>
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={4}
              placeholder="궁금한 사항이나 특이 사항을 자유롭게 적어주세요."
              className="w-full rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-colors resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <button
            type="submit"
            disabled={!isValid || submitting}
            className="w-full inline-flex items-center justify-center gap-2 bg-brand-orange text-white rounded-full px-8 py-4 font-semibold disabled:opacity-50 hover:bg-brand-orange-hover transition-all hover:-translate-y-0.5"
          >
            {submitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> 신청 중…</>
            ) : (
              <>무료 상담 신청 <ArrowRight className="h-4 w-4" /></>
            )}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            입력하신 정보는 상담 목적으로만 사용되며 외부에 공유되지 않습니다.
          </p>
        </form>
      </div>
    </div>
  )
}
