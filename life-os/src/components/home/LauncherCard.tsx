import { ArrowRight } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

interface LauncherCardProps {
  index: number;
  title: string;
  subtitle: string;
  emoji?: string;
  icon?: ReactNode;
  /** Line-art visualization shown in the body of the tile. */
  viz?: ReactNode;
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
  viz,
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
      <div className="relative flex w-full shrink-0 items-start justify-between">
        <span className="font-mono text-[11px] tracking-wide text-text-dim">
          ·{String(index).padStart(2, "0")}
        </span>
        {(icon ?? emoji) && (
          <span
            aria-hidden
            className={icon ? "bento-tile-icon" : "bento-tile-emoji text-[26px] leading-none"}
            style={icon ? { color: "var(--tint)" } : undefined}
          >
            {icon ?? emoji}
          </span>
        )}
      </div>

      {viz && (
        <div
          aria-hidden
          className="relative flex min-h-0 flex-1 items-center justify-center py-4"
          style={{ color: "var(--tint)" }}
        >
          {viz}
        </div>
      )}

      <div
        className={`relative flex w-full shrink-0 items-end justify-between gap-3 ${
          viz ? "" : "mt-auto pt-6"
        }`}
      >
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
