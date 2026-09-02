import type { CalendarEvent } from "../../types";
import { getMonthMatrix, isSameDay, isSameMonth } from "../../utils/date";
import { hasOccurrenceOnDay } from "./recurrence";

interface YearGridProps {
  yearAnchor: Date;
  events: CalendarEvent[];
  onSelectMonth: (month: Date) => void;
}

function MiniMonth({
  monthAnchor,
  events,
  onSelectMonth,
}: {
  monthAnchor: Date;
  events: CalendarEvent[];
  onSelectMonth: (month: Date) => void;
}) {
  const weeks = getMonthMatrix(monthAnchor);
  const now = new Date();

  return (
    <button
      type="button"
      onClick={() => onSelectMonth(monthAnchor)}
      className="rounded-[14px] border border-border bg-surface-raised p-3 text-left transition-colors hover:border-accent/40"
    >
      <p className="mb-2 font-sans text-[14px] text-text">
        {monthAnchor.toLocaleDateString(undefined, { month: "long" })}
      </p>
      <div className="grid grid-cols-7 gap-y-[3px]">
        {weeks.flat().map((day) => {
          const inMonth = isSameMonth(day, monthAnchor);
          const today = isSameDay(day, now);
          const hasEvent = inMonth && hasOccurrenceOnDay(events, day);
          return (
            <div
              key={day.toDateString()}
              className="flex flex-col items-center gap-[1px]"
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full text-[8.5px] ${
                  !inMonth
                    ? "text-text-dim/40"
                    : today
                      ? "bg-accent font-semibold text-accent-contrast"
                      : "text-text-dim"
                }`}
              >
                {day.getDate()}
              </span>
              <span
                className={`h-[3px] w-[3px] rounded-full ${
                  hasEvent && !today ? "bg-accent/70" : "bg-transparent"
                }`}
              />
            </div>
          );
        })}
      </div>
    </button>
  );
}

export function YearGrid({ yearAnchor, events, onSelectMonth }: YearGridProps) {
  const months = Array.from(
    { length: 12 },
    (_, i) => new Date(yearAnchor.getFullYear(), i, 1),
  );

  return (
    <div className="rounded-[16px] bg-field p-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {months.map((month) => (
          <MiniMonth
            key={month.toISOString()}
            monthAnchor={month}
            events={events}
            onSelectMonth={onSelectMonth}
          />
        ))}
      </div>
    </div>
  );
}
