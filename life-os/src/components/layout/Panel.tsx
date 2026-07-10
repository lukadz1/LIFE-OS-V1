import type { ReactNode } from "react";

interface PanelProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function Panel({
  title,
  subtitle,
  action,
  children,
  className = "",
  bodyClassName = "",
}: PanelProps) {
  return (
    <section
      className={`panel-card flex flex-col rounded-[22px] bg-surface ${className}`}
    >
      <header className="flex items-start justify-between gap-3 px-5 pt-4 pb-1">
        <div>
          <h2 className="font-serif text-[21px] font-normal tracking-[-0.01em] text-text italic">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 font-mono text-[11px] text-text-dim">
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </header>
      <div className={`flex-1 overflow-auto px-5 pt-2 pb-4 ${bodyClassName}`}>
        {children}
      </div>
    </section>
  );
}
