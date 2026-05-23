import { ReactNode } from "react";

interface ExamCaseProps {
  children?: ReactNode;
  number?: number;
  title?: string;
}

export function ExamCase({ children, number, title }: ExamCaseProps) {
  return (
    <div className="mt-10 rounded-t-xl overflow-hidden not-prose">
      <div className="flex items-center gap-3 bg-slate-700 px-4 py-2.5 text-white">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
          계산 사례{number != null ? ` ${number}` : ""}
        </span>
        {title && <span className="text-sm font-semibold">{title}</span>}
      </div>
      {children && (
        <div className="prose max-w-none p-5 bg-slate-50 border border-t-0 border-slate-200 text-sm leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}
