import { ArrowRight } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

interface LauncherCardProps {
  index: number;
  title: string;
  subtitle: string;
  emoji?: string;
  icon?: ReactNode;
  tint: string;
  className?: string;
  onOpen: () => void;
}

export function LauncherCard({
  index,
  title,
  subtitle,
  emoji,
  icon,
  tint,
  className = "",
  onOpen,
}: LauncherCardProps) {
  return (
    <button
      onClick={onOpen}
      style={{ "--tint": tint } as CSSProperties}
      className={`bento-tile group flex flex-col rounded-[18px] p-5 text-left ${className}`}
    >
      <span aria-hidden className="bento-tile-glow" />
      <div className="relative flex w-full items-start justify-between">
        <span className="font-mono text-[11px] tracking-wide text-text-dim">
          ·{String(index).padStart(2, "0")}
        </span>
        <span
          className={icon ? "" : "bento-tile-emoji text-[26px] leading-none"}
        >
          {icon ?? emoji}
        </span>
      </div>
      <div className="relative mt-auto flex w-full items-end justify-between gap-3 pt-6">
        <div className="min-w-0">
          <h3 className="font-serif text-[26px] font-normal tracking-tight text-text italic">
            {title}
          </h3>
          <p className="mt-0.5 truncate text-[13px] text-text-dim">
            {subtitle}
          </p>
        </div>
        <ArrowRight
          size={16}
          className="bento-tile-arrow mb-1.5 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
        />
      </div>
    </button>
  );
}
