import type { ReactNode } from "react";

interface Props {
  title: string;
  description: string;
  iatfClause?: string;
  badge?: string;
  practice: ReactNode;
  downloadButton?: ReactNode;
}

export default function ToolShell({ title, description, iatfClause, badge, practice, downloadButton }: Props) {
  return (
    <div>
      {/* Header */}
      <div className="mb-6 pb-5 border-b border-border">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            {badge && (
              <span className="inline-block text-[10px] font-semibold bg-brand-orange/10 text-brand-orange rounded-full px-2.5 py-1 mb-2">
                {badge}
              </span>
            )}
            <h2 className="text-2xl font-extrabold text-brand-navy">{title}</h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">{description}</p>
          </div>
          {downloadButton && <div className="shrink-0">{downloadButton}</div>}
        </div>
        {iatfClause && (
          <p className="text-xs text-muted-foreground mt-2">
            관련 IATF 16949 조항: <span className="font-medium text-foreground">{iatfClause}</span>
          </p>
        )}
      </div>

      {/* Practice area */}
      <div>{practice}</div>
    </div>
  );
}
