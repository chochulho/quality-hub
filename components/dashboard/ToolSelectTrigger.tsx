'use client'

import { useState } from 'react'
import { Settings2 } from 'lucide-react'
import ToolSelectModal from './ToolSelectModal'
import type { ToolId } from '@/lib/auth/grades'

interface Props {
  planId: string
  currentSelected: ToolId[]
  /** 'default': 오렌지 버튼 / 'ghost': 텍스트 링크 */
  variant?: 'default' | 'ghost'
}

export default function ToolSelectTrigger({
  planId,
  currentSelected,
  variant = 'default',
}: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          variant === 'ghost'
            ? 'inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors'
            : 'inline-flex items-center gap-2 bg-brand-orange text-white rounded-full px-5 py-2.5 text-sm font-semibold hover:bg-brand-orange-hover transition-all hover:-translate-y-0.5 duration-200'
        }
      >
        <Settings2 className="h-4 w-4" />
        {variant === 'ghost' ? '도구 변경' : '도구 선택하기'}
      </button>

      {open && (
        <ToolSelectModal
          planId={planId}
          currentSelected={currentSelected}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
