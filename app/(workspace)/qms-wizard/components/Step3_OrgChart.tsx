"use client"

import { useState } from "react"
import type { WizardState, Department, DeptRole } from "@/types/qmsWizard"
import { ArrowLeft, ArrowRight, Plus, X } from "lucide-react"

interface Props {
  state: WizardState
  onUpdate: (patch: Partial<WizardState>) => void
  onNext: () => void
  onPrev: () => void
}

const ROLE_LABELS: Record<DeptRole, string> = {
  management:  '경영진',
  quality:     '품질',
  production:  '생산',
  sales:       '영업',
  engineering: '개발/설계',
  purchasing:  '구매',
  hr:          '인사/총무',
}

const ALL_ROLES = Object.keys(ROLE_LABELS) as DeptRole[]

const DEFAULT_DEPTS: Omit<Department, 'id'>[] = [
  { name: '경영진',  roles: ['management'] },
  { name: '품질팀',  roles: ['quality'] },
  { name: '생산팀',  roles: ['production'] },
  { name: '개발팀',  roles: ['engineering'] },
  { name: '구매팀',  roles: ['purchasing'] },
  { name: '영업팀',  roles: ['sales'] },
]

let nextId = 1
function makeId() { return `dept-${nextId++}` }

export default function Step3_OrgChart({ state, onUpdate, onNext, onPrev }: Props) {
  const [newName, setNewName] = useState('')

  function loadDefaults() {
    onUpdate({
      departments: DEFAULT_DEPTS.map(d => ({ ...d, id: makeId() })),
    })
  }

  function addDept() {
    if (!newName.trim()) return
    onUpdate({
      departments: [
        ...state.departments,
        { id: makeId(), name: newName.trim(), roles: [] },
      ],
    })
    setNewName('')
  }

  function removeDept(id: string) {
    onUpdate({ departments: state.departments.filter(d => d.id !== id) })
  }

  function toggleRole(deptId: string, role: DeptRole) {
    onUpdate({
      departments: state.departments.map(d =>
        d.id !== deptId ? d : {
          ...d,
          roles: d.roles.includes(role)
            ? d.roles.filter(r => r !== role)
            : [...d.roles, role],
        }
      ),
    })
  }

  return (
    <div className="space-y-6">

      {/* 기본 불러오기 */}
      {state.departments.length === 0 && (
        <button
          type="button"
          onClick={loadDefaults}
          className="w-full rounded-xl border border-dashed border-brand-navy/40 py-3 text-sm text-brand-navy font-medium hover:bg-brand-navy/5 transition-colors"
        >
          + 기본 부서 불러오기 (경영진·품질·생산·개발·구매·영업)
        </button>
      )}

      {/* 부서 목록 */}
      <div className="space-y-3">
        {state.departments.map(dept => (
          <div key={dept.id} className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-sm text-foreground">{dept.name}</span>
              <button type="button" onClick={() => removeDept(dept.id)}>
                <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ALL_ROLES.map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(dept.id, role)}
                  className={[
                    'text-[11px] rounded-full px-2.5 py-1 border font-medium transition-all',
                    dept.roles.includes(role)
                      ? 'bg-brand-navy text-white border-brand-navy'
                      : 'bg-white text-muted-foreground border-border hover:border-brand-navy/40',
                  ].join(' ')}
                >
                  {ROLE_LABELS[role]}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 부서 추가 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addDept()}
          placeholder="부서명 입력 후 Enter"
          className="flex-1 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-navy transition-colors"
        />
        <button
          type="button"
          onClick={addDept}
          className="bg-brand-navy text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-brand-navy-dark transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* 내비게이션 */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onPrev}
          className="flex-1 inline-flex items-center justify-center gap-2 border border-border rounded-full px-6 py-3 text-sm font-semibold hover:border-brand-navy transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />이전
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-orange text-white rounded-full px-6 py-3 text-sm font-semibold hover:bg-brand-orange-hover transition-colors"
        >
          다음<ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
