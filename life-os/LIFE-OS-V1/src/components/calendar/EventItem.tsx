import type { CalendarEvent, LifeArea } from "../../types";
import { formatTimeLabel } from "../../utils/date";

interface EventItemProps {
  event: CalendarEvent;
  area?: LifeArea;
}

export function EventItem({ event, area }: EventItemProps) {
  return (
    <div className="flex items-start gap-3 rounded-[14px] px-2 py-2 transition-colors hover:bg-hover">
      <div className="w-14 shrink-0 pt-0.5 text-right font-mono text-[11px] leading-tight text-text-dim tabular-nums">
        {formatTimeLabel(event.start)}
      </div>
      <span
        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: area?.color ?? "#98989d" }}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] text-text">{event.title}</p>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-text-dim">
          {area && <span>{area.label}</span>}
          {event.location && <span>· {event.location}</span>}
        </div>
      </div>
    </div>
  );
}
