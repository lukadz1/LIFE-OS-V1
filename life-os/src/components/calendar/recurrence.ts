import type { CalendarEvent } from "../../types";
import { isSameDay } from "../../utils/date";

/** All occurrences of `events` that fall on `day` — one-off events matched by
 * date, recurring events matched by weekday and projected onto `day`'s date
 * using their start/end as a time-of-day template. */
export function occurrencesOnDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  const result: CalendarEvent[] = [];
  for (const ev of events) {
    if (ev.recurringDays && ev.recurringDays.length > 0) {
      if (!ev.recurringDays.includes(day.getDay())) continue;
      result.push({
        ...ev,
        start: projectTime(ev.start, day),
        end: projectTime(ev.end, day),
      });
    } else if (isSameDay(new Date(ev.start), day)) {
      result.push(ev);
    }
  }
  return result;
}

/** True if any occurrence of `events` falls on `day` — cheaper than
 * `occurrencesOnDay(...).length > 0` for dot-indicator use cases. */
export function hasOccurrenceOnDay(events: CalendarEvent[], day: Date): boolean {
  return events.some((ev) =>
    ev.recurringDays && ev.recurringDays.length > 0
      ? ev.recurringDays.includes(day.getDay())
      : isSameDay(new Date(ev.start), day),
  );
}

function projectTime(templateIso: string, day: Date): string {
  const t = new Date(templateIso);
  const projected = new Date(day);
  projected.setHours(t.getHours(), t.getMinutes(), 0, 0);
  return projected.toISOString();
}
