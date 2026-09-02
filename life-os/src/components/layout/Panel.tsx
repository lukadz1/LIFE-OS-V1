import type { ReactNode } from "react";

interface PanelProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  /** Opts out of the ambient accent-tinted edge + corner glow. The glow reads
   * fine on the short stat-card-sized panels it was designed for, but on a
   * very tall panel (e.g. the full calendar) it stretches into a long,
   * distracting stripe down the side — so tall panels can drop it. */
  noGlow?: boolean;
}

export function Panel({
  title,
  subtitle,
  action,
  children,
  className = "",
  bodyClassName = "",
  noGlow = false,
}: PanelProps) {
  return (
    <section
      className={`${noGlow ? "" : "panel-card"} flex flex-col rounded-[22px] bg-surface ${className}`}
    >
      <header className="flex items-start justify-between gap-3 px-5 pt-4 pb-1">
        <div>
          <h2 className="font-sans text-[21px] font-normal tracking-[-0.01em] text-text">
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
