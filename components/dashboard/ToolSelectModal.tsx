'use client'

import { useState, useTransition } from 'react'
import { X, Check, Loader2 } from 'lucide-react'
import { TOOLS, ALL_TOOL_IDS, type ToolId } from '@/lib/auth/grades'
import { updateSelectedTools } from '@/app/(workspace)/dashboard/actions'

interface Props {
  planId: string          // 'starter' | 'team'
  currentSelected: ToolId[]
  onClose: () => void
}

const MAX_BY_PLAN: Record<string, number> = { starter: 1, team: 3 }

export default function ToolSelectModal({ planId, currentSelected, onClose }: Props) {
  const maxTools = MAX_BY_PLAN[planId] ?? 1
  const [selected, setSelected] = useState<ToolId[]>(currentSelected)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function toggle(id: ToolId) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((t) => t !== id)
      if (prev.length >= maxTools) {
        // 최대치 초과 시 가장 오래된 것 교체 (Starter: 하나씩만)
        return [...prev.slice(1), id]
      }
      return [...prev, id]
    })
    setError('')
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateSelectedTools(selected)
      if (result.error) {
        setError(result.error)
      } else {
        onClose()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 백드롭 */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* 모달 */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-7">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* 헤더 */}
        <div className="mb-6">
          <p className="text-sm font-medium text-brand-orange mb-1">도구 선택</p>
          <h2 className="text-xl font-extrabold text-brand-navy">
            {maxTools}개 도구를 선택하세요
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            선택한 도구만 워크스페이스에서 이용할 수 있습니다.
            언제든지 변경 가능합니다.
          </p>
        </div>

        {/* 도구 목록 */}
        <div className="space-y-3 mb-6">
          {ALL_TOOL_IDS.map((id) => {
            const tool = TOOLS[id]
            const isSelected = selected.includes(id)
            return (
              <button
                key={id}
                onClick={() => toggle(id)}
                className={`w-full text-left rounded-2xl border p-4 transition-all duration-150 ${
                  isSelected
                    ? 'border-brand-orange bg-brand-orange/5'
                    : 'border-border bg-white hover:border-brand-navy/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* 색상 도트 */}
                  <div className={`shrink-0 w-8 h-8 rounded-xl ${tool.color} flex items-center justify-center`}>
                    <span className="text-xs font-bold text-white">
                      {tool.name.charAt(0)}
                    </span>
                  </div>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-brand-navy">{tool.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{tool.tagline}</p>
                  </div>

                  {/* 체크 */}
                  <div className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-brand-orange border-brand-orange'
                      : 'border-border'
                  }`}>
                    {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* 선택 카운터 */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            <span className={`font-bold ${selected.length === maxTools ? 'text-brand-orange' : 'text-foreground'}`}>
              {selected.length}
            </span>
            {' '}/ {maxTools}개 선택됨
          </span>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-border px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isPending || selected.length === 0}
            className="flex-1 flex items-center justify-center gap-2 rounded-full bg-brand-orange text-white px-4 py-3 text-sm font-semibold hover:bg-brand-orange-hover transition-all disabled:opacity-50"
          >
            {isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> 저장 중…</>
            ) : (
              '도구 저장하기'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
