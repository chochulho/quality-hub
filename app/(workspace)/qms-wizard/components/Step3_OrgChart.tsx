"use client"

import { useEffect, useState } from "react"
import type { WizardState, Department, DeptRole } from "@/types/qmsWizard"
import {
  BIZ_FUNCTIONS, FUNCTION_GROUPS,
  DEFAULT_DEPT_NAMES, DEFAULT_MATRIX_BY_NAME,
  getActiveFunctions, cycleCell,
  type BizFunction,
} from "@/lib/qms/orgFunctions"
import { ArrowLeft, ArrowRight, Plus, X, RotateCcw } from "lucide-react"

interface Props {
  state: WizardState
  onUpdate: (patch: Partial<WizardState>) => void
  onNext: () => void
  onPrev: () => void
}

let _uid = 100
const uid = () => `d${_uid++}`

const CELL_STYLE: Record<'●' | '○' | '', string> = {
  '●': 'bg-brand-navy text-white font-bold text-sm cursor-pointer select-none',
  '○': 'bg-brand-navy/10 text-brand-navy font-semibold text-xs cursor-pointer select-none',
  '':  'text-transparent cursor-pointer select-none hover:bg-muted/50',
}

export default function Step3_OrgChart({ state, onUpdate, onNext, onPrev }: Props) {
  const activeFns = getActiveFunctions(state)

  // 부서명 편집 상태
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName]   = useState('')

  // 초기화: departments + orgMatrix 기본값 적용
  useEffect(() => {
    if (state.departments.length === 0) {
      initDefaults()
    }
  }, [])

  function initDefaults() {
    const depts: Department[] = DEFAULT_DEPT_NAMES.map(name => ({
      id: uid(), name, roles: [] as DeptRole[],
    }))
    const matrix = buildMatrixFromNames(depts, DEFAULT_MATRIX_BY_NAME)
    onUpdate({ departments: depts, orgMatrix: matrix })
  }

  function buildMatrixFromNames(
    depts: Department[],
    byName: Record<string, Record<string, '●' | '○' | ''>>,
  ): WizardState['orgMatrix'] {
    const m: WizardState['orgMatrix'] = {}
    for (const fn of BIZ_FUNCTIONS) {
      m[fn.id] = {}
      for (const d of depts) {
        m[fn.id][d.id] = byName[fn.id]?.[d.name] ?? ''
      }
    }
    return m
  }

  // ● 기준으로 departments.roles 자동 갱신 (template 치환용)
  function derivedDepts(depts: Department[], matrix: WizardState['orgMatrix']): Department[] {
    const fnById = Object.fromEntries(BIZ_FUNCTIONS.map(f => [f.id, f]))
    return depts.map(d => {
      const roles = new Set<DeptRole>()
      for (const [fnId, cells] of Object.entries(matrix)) {
        if (cells[d.id] === '●') {
          const role = fnById[fnId]?.primaryRole
          if (role) roles.add(role)
        }
      }
      return { ...d, roles: Array.from(roles) }
    })
  }

  function setCell(fnId: string, deptId: string) {
    const cur = state.orgMatrix?.[fnId]?.[deptId] ?? ''
    const next = cycleCell(cur)
    const newMatrix = {
      ...state.orgMatrix,
      [fnId]: { ...(state.orgMatrix?.[fnId] ?? {}), [deptId]: next },
    }
    const updatedDepts = derivedDepts(state.departments, newMatrix)
    onUpdate({ orgMatrix: newMatrix, departments: updatedDepts })
  }

  function addDept() {
    const name = '새 부서'
    const d: Department = { id: uid(), name, roles: [] }
    const newDepts = [...state.departments, d]
    const newMatrix = { ...state.orgMatrix }
    for (const fn of BIZ_FUNCTIONS) {
      newMatrix[fn.id] = { ...(newMatrix[fn.id] ?? {}), [d.id]: '' }
    }
    onUpdate({ departments: newDepts, orgMatrix: newMatrix })
    // 바로 편집 모드
    setEditingId(d.id)
    setEditName(name)
  }

  function removeDept(id: string) {
    const newDepts = state.departments.filter(d => d.id !== id)
    const newMatrix = { ...state.orgMatrix }
    for (const fn of BIZ_FUNCTIONS) {
      const { [id]: _, ...rest } = newMatrix[fn.id] ?? {}
      newMatrix[fn.id] = rest
    }
    const updatedDepts = derivedDepts(newDepts, newMatrix)
    onUpdate({ departments: updatedDepts, orgMatrix: newMatrix })
  }

  function commitName(id: string) {
    const trimmed = editName.trim()
    if (!trimmed) { setEditingId(null); return }
    const newDepts = state.departments.map(d => d.id === id ? { ...d, name: trimmed } : d)
    setEditingId(null)
    onUpdate({ departments: newDepts })
  }

  const groups = FUNCTION_GROUPS.map(g => ({
    ...g,
    fns: g.fnIds.map(id => activeFns.find(f => f.id === id)).filter(Boolean) as BizFunction[],
  })).filter(g => g.fns.length > 0)

  const depts = state.departments

  if (depts.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-sm text-muted-foreground">일반 제조업 기준 기본 조직도를 불러옵니다.</p>
        <button type="button" onClick={initDefaults}
          className="inline-flex items-center gap-2 bg-brand-navy text-white rounded-full px-6 py-3 text-sm font-semibold hover:bg-brand-navy-dark transition-colors">
          <RotateCcw className="h-4 w-4" />기본 조직도 불러오기
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* 범례 + 리셋 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="w-5 h-5 rounded bg-brand-navy text-white flex items-center justify-center text-[10px] font-bold">●</span>주관
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-5 h-5 rounded bg-brand-navy/10 text-brand-navy flex items-center justify-center text-[10px] font-semibold">○</span>협조
          </span>
          <span className="text-[11px]">셀 클릭: 빈칸→주관→협조→빈칸</span>
        </div>
        <button type="button" onClick={initDefaults}
          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
          <RotateCcw className="h-3 w-3" />기본값 복원
        </button>
      </div>

      {/* 매트릭스 테이블 */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-muted/40">
              {/* 왼쪽 고정: 조항 + 업무 기능 */}
              <th className="text-left px-3 py-2 font-semibold text-[11px] text-muted-foreground w-28 border-b border-r border-border whitespace-nowrap">
                조항
              </th>
              <th className="text-left px-3 py-2 font-semibold text-[11px] text-muted-foreground border-b border-r border-border min-w-[140px]">
                업무 기능
              </th>
              {/* 부서 열 헤더 */}
              {depts.map(d => (
                <th key={d.id} className="px-2 py-2 border-b border-r border-border last:border-r-0 text-center min-w-[68px]">
                  {editingId === d.id ? (
                    <input
                      autoFocus
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onBlur={() => commitName(d.id)}
                      onKeyDown={e => { if (e.key === 'Enter') commitName(d.id) }}
                      className="w-full text-center text-[11px] bg-transparent border-b border-brand-navy outline-none"
                    />
                  ) : (
                    <div className="flex items-center justify-center gap-1">
                      <button type="button" onClick={() => { setEditingId(d.id); setEditName(d.name) }}
                        className="font-semibold text-foreground hover:text-brand-navy truncate max-w-[52px]">
                        {d.name}
                      </button>
                      <button type="button" onClick={() => removeDept(d.id)}
                        className="opacity-0 group-hover:opacity-100 hover:opacity-100">
                        <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  )}
                </th>
              ))}
              {/* 부서 추가 버튼 열 */}
              <th className="px-2 py-2 border-b border-border">
                <button type="button" onClick={addDept}
                  className="w-full flex items-center justify-center text-muted-foreground hover:text-brand-navy transition-colors">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {groups.map(group => (
              <>
                {/* 그룹 헤더 행 */}
                <tr key={`g-${group.label}`} className="bg-brand-navy/5">
                  <td colSpan={2 + depts.length + 1}
                    className="px-3 py-1.5 text-[10px] font-bold text-brand-navy uppercase tracking-wider border-b border-border">
                    {group.label}
                  </td>
                </tr>
                {/* 업무 기능 행 */}
                {group.fns.map((fn, idx) => {
                  const isLast = idx === group.fns.length - 1
                  return (
                    <tr key={fn.id} className={`hover:bg-muted/20 transition-colors ${isLast ? '' : ''}`}>
                      <td className="px-3 py-2 text-[10px] text-muted-foreground border-b border-r border-border whitespace-nowrap">
                        {fn.clause}
                      </td>
                      <td className="px-3 py-2 font-medium text-foreground border-b border-r border-border" style={{ wordBreak: 'keep-all' }}>
                        {fn.label}
                      </td>
                      {depts.map(d => {
                        const val = state.orgMatrix?.[fn.id]?.[d.id] ?? ''
                        return (
                          <td key={d.id}
                            className="border-b border-r border-border last:border-r-0 text-center p-0">
                            <button
                              type="button"
                              onClick={() => setCell(fn.id, d.id)}
                              className={`w-full h-8 flex items-center justify-center rounded-none transition-colors ${CELL_STYLE[val]}`}
                              title={val === '●' ? '주관' : val === '○' ? '협조' : '해당없음'}
                            >
                              {val || '·'}
                            </button>
                          </td>
                        )
                      })}
                      <td className="border-b border-border" />
                    </tr>
                  )
                })}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* 내비게이션 */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onPrev}
          className="flex-1 inline-flex items-center justify-center gap-2 border border-border rounded-full px-6 py-3 text-sm font-semibold hover:border-brand-navy transition-colors">
          <ArrowLeft className="h-4 w-4" />이전
        </button>
        <button type="button" onClick={onNext}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-orange text-white rounded-full px-6 py-3 text-sm font-semibold hover:bg-brand-orange-hover transition-colors">
          다음<ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
