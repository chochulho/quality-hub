"use client";

interface SpecFormProps {
  characteristicName: string;
  lsl: string;
  target: string;
  usl: string;
  onChangeName: (v: string) => void;
  onChangeLsl: (v: string) => void;
  onChangeTarget: (v: string) => void;
  onChangeUsl: (v: string) => void;
}

function InputField({
  label,
  sublabel,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  sublabel?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1">
        {label}
        {sublabel && (
          <span className="ml-1 font-normal text-[10px] text-muted-foreground/70">{sublabel}</span>
        )}
      </label>
      <input
        type="number"
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-navy transition-colors bg-white"
      />
    </div>
  );
}

export default function SpecForm({
  characteristicName,
  lsl,
  target,
  usl,
  onChangeName,
  onChangeLsl,
  onChangeTarget,
  onChangeUsl,
}: SpecFormProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1">
          특성명
        </label>
        <input
          type="text"
          value={characteristicName}
          onChange={(e) => onChangeName(e.target.value)}
          placeholder="예: 외경 (mm)"
          className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-navy transition-colors bg-white"
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <InputField
          label="LSL (규격 하한)"
          sublabel="단측 규격 시 생략 가능"
          value={lsl}
          onChange={onChangeLsl}
          placeholder="예: 29.95"
        />
        <InputField
          label="Target (목표값)"
          sublabel="선택"
          value={target}
          onChange={onChangeTarget}
          placeholder="선택"
        />
        <InputField
          label="USL (규격 상한)"
          sublabel="단측 규격 시 생략 가능"
          value={usl}
          onChange={onChangeUsl}
          placeholder="예: 30.05"
        />
      </div>
      <p className="text-[11px] text-muted-foreground">
        <span className="font-semibold">*</span> LSL / USL 중 하나 이상 필수 · 단측 규격(하한만 or 상한만)도 지원합니다
      </p>
    </div>
  );
}
