import { getWeekDates, isSameDay } from "../../utils/date";

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

interface WeekStripProps {
  selectedDate: Date;
  onSelect: (date: Date) => void;
  hasEntries: (date: Date) => boolean;
}

export function WeekStrip({ selectedDate, onSelect, hasEntries }: WeekStripProps) {
  const week = getWeekDates(new Date());
  const today = new Date();

  return (
    <div className="flex items-center justify-between gap-1.5">
      {week.map((date, i) => {
        const selected = isSameDay(date, selectedDate);
        const isToday = isSameDay(date, today);
        const logged = hasEntries(date);
        return (
          <button
            key={date.toISOString()}
            onClick={() => onSelect(date)}
            aria-current={selected ? "date" : undefined}
            aria-label={date.toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
            className="flex flex-1 flex-col items-center gap-1.5 py-1"
          >
            <span className="font-mono text-[10px] tracking-wide text-text-dim">
              {WEEKDAY_LABELS[i]}
            </span>
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full text-[14px] font-semibold transition-colors ${
                selected
                  ? "bg-accent text-accent-contrast"
                  : isToday
                    ? "border border-accent/50 text-text"
                    : "text-text-dim"
              }`}
            >
              {date.getDate()}
            </span>
            <span
              className={`h-1 w-1 rounded-full transition-colors ${
                logged && !selected ? "bg-accent/60" : "bg-transparent"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
