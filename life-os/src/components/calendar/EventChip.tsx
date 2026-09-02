import type { CSSProperties } from "react";
import type { CalendarEvent, LifeArea } from "../../types";

interface EventChipProps {
  event: CalendarEvent;
  area?: LifeArea;
  style: CSSProperties;
  compact?: boolean;
  onClick: () => void;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** A scheduled task/event block — the "lighter orange" fill the accent
 * current-time stripe is meant to stand out against. */
export function EventChip({ event, area, style, compact, onClick }: EventChipProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={style}
      className="absolute overflow-hidden rounded-[8px] border border-accent/40 bg-accent/25 px-1.5 py-1 text-left transition-colors hover:bg-accent/35"
    >
      <span className="block truncate text-[11.5px] leading-tight font-medium text-text">
        {event.title}
      </span>
      {!compact && (
        <span className="mt-0.5 flex items-center gap-1 truncate font-mono text-[9.5px] text-text-dim">
          {formatTime(event.start)}
          {area && (
            <>
              <span aria-hidden>·</span>
              {area.label}
            </>
          )}
        </span>
      )}
    </button>
  );
}
