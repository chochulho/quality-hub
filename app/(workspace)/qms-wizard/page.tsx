"use client"

import { useState } from "react"
import type { WizardState } from "@/types/qmsWizard"
import { INITIAL_WIZARD_STATE } from "@/types/qmsWizard"
import StepIndicator from "./components/StepIndicator"
import Step1_BasicInfo from "./components/Step1_BasicInfo"
import Step2_Scope from "./components/Step2_Scope"
import Step3_OrgChart from "./components/Step3_OrgChart"
import Step4_Policy from "./components/Step4_Policy"
import Step5_Preview from "./components/Step5_Preview"

const TOTAL_STEPS = 5

export default function QmsWizardPage() {
  const [step, setStep] = useState(1)
  const [state, setState] = useState<WizardState>(INITIAL_WIZARD_STATE)

  const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS))
  const prev = () => setStep(s => Math.max(s - 1, 1))
  const update = (patch: Partial<WizardState>) => setState(s => ({ ...s, ...patch }))

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-medium text-brand-orange mb-2">QMS 문서 체계 구축 도우미</p>
        <h1 className="text-2xl font-extrabold text-brand-navy" style={{ wordBreak: "keep-all" }}>
          우리 회사 QMS 문서를 자동으로 만들어 드립니다.
        </h1>
      </div>

      <StepIndicator current={step} total={TOTAL_STEPS} />

      <div className="mt-8">
        {step === 1 && <Step1_BasicInfo state={state} onUpdate={update} onNext={next} />}
        {step === 2 && <Step2_Scope    state={state} onUpdate={update} onNext={next} onPrev={prev} />}
        {step === 3 && <Step3_OrgChart state={state} onUpdate={update} onNext={next} onPrev={prev} />}
        {step === 4 && <Step4_Policy   state={state} onUpdate={update} onNext={next} onPrev={prev} />}
        {step === 5 && <Step5_Preview  state={state} onUpdate={update} onPrev={prev} />}
      </div>
    </div>
  )
}
