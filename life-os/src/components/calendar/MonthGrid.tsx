import type { CalendarEvent } from "../../types";
import { getMonthMatrix, getWeekDates, isSameDay, isSameMonth } from "../../utils/date";
import { occurrencesOnDay } from "./recurrence";

const WEEKDAY_LABELS = getWeekDates(new Date()).map((d) =>
  d.toLocaleDateString(undefined, { weekday: "short" }),
);
const MAX_VISIBLE = 3;

interface MonthGridProps {
  monthAnchor: Date;
  events: CalendarEvent[];
  onSelectDay: (day: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

export function MonthGrid({
  monthAnchor,
  events,
  onSelectDay,
  onEventClick,
}: MonthGridProps) {
  const weeks = getMonthMatrix(monthAnchor);
  const now = new Date();

  return (
    <div className="overflow-hidden rounded-[16px] bg-field">
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="py-2 text-center font-mono text-[10px] tracking-wide text-text-dim uppercase"
          >
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {weeks.flat().map((day) => {
          const inMonth = isSameMonth(day, monthAnchor);
          const today = isSameDay(day, now);
          const dayEvents = occurrencesOnDay(events, day).sort((a, b) =>
            a.start.localeCompare(b.start),
          );
          const overflow = dayEvents.length - MAX_VISIBLE;

          return (
            <button
              type="button"
              key={day.toDateString()}
              onClick={() => onSelectDay(day)}
              className={`flex min-h-[92px] flex-col items-stretch gap-1 border-t border-l border-border p-1.5 text-left transition-colors last:border-r hover:bg-hover ${
                inMonth ? "" : "opacity-40"
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[12.5px] ${
                  today ? "bg-accent font-semibold text-accent-contrast" : "text-text"
                }`}
              >
                {day.getDate()}
              </span>
              <div className="flex flex-col gap-[3px]">
                {dayEvents.slice(0, MAX_VISIBLE).map((ev) => (
                  <span
                    key={ev.id}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(ev);
                    }}
                    className="truncate rounded-[5px] border border-accent/40 bg-accent/25 px-1 py-[1px] text-[10px] font-medium text-text"
                  >
                    {ev.title}
                  </span>
                ))}
                {overflow > 0 && (
                  <span className="px-1 font-mono text-[9.5px] text-text-dim">
                    +{overflow} more
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
