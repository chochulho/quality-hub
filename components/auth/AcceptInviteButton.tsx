'use client'

import { useState, useTransition } from 'react'
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { acceptInviteForCurrentUser } from '@/app/(auth)/invite/actions'

export default function AcceptInviteButton({ token }: { token: string }) {
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    setError('')
    startTransition(async () => {
      const result = await acceptInviteForCurrentUser(token)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div>
      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      <button
        onClick={handleClick}
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 bg-brand-orange text-white rounded-full px-6 py-3.5 font-semibold hover:bg-brand-orange-hover transition-all hover:-translate-y-0.5 duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isPending ? '참여 처리 중...' : '참여하기'}
        {!isPending && <ArrowRight className="h-4 w-4" />}
      </button>
    </div>
  )
}
