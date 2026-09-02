import { useEffect, useMemo, useRef } from "react";
import type { CalendarEvent, LifeArea } from "../../types";
import { isSameDay } from "../../utils/date";
import { useNow } from "../../hooks/useNow";
import { EventChip } from "./EventChip";
import { layoutOverlaps } from "./overlapLayout";
import { occurrencesOnDay } from "./recurrence";

const ROW_H = 56; // px per hour
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function minutesSinceMidnight(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

function hourLabel(h: number): string {
  const d = new Date();
  d.setHours(h, 0, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: "numeric" });
}

interface TimeGridProps {
  days: Date[];
  events: CalendarEvent[];
  areaById: Map<string, LifeArea>;
  onSlotClick: (day: Date, minutes: number) => void;
  onEventClick: (event: CalendarEvent) => void;
}

/** The shared day/week "graph" — a scrollable hour-by-hour grid with an
 * accent stripe pinned to the current time and events laid out as chips. */
export function TimeGrid({
  days,
  events,
  areaById,
  onSlotClick,
  onEventClick,
}: TimeGridProps) {
  const now = useNow();
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayIndex = days.findIndex((d) => isSameDay(d, now));
  const showNowLine = todayIndex !== -1;
  const nowTop = (minutesSinceMidnight(now) / 60) * ROW_H;

  const dayKey = days.map((d) => d.toDateString()).join("|");
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const anchorHour = todayIndex !== -1 ? now.getHours() : 8;
    el.scrollTop = Math.max(0, anchorHour - 2) * ROW_H;
    // Only re-anchor when the visible date range changes, not on every tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayKey]);

  const eventsByDay = useMemo(() => {
    return days.map((day) => {
      const dayEvents = occurrencesOnDay(events, day);
      const layout = layoutOverlaps(
        dayEvents.map((ev) => ({
          id: ev.id,
          startMin: minutesSinceMidnight(new Date(ev.start)),
          endMin: Math.max(
            minutesSinceMidnight(new Date(ev.start)) + 15,
            minutesSinceMidnight(new Date(ev.end)),
          ),
        })),
      );
      return { day, dayEvents, layout };
    });
  }, [days, events]);

  return (
    <div className="overflow-hidden rounded-[16px] bg-field">
      {/* Sticky day-of-week header, column widths matching the body grid below. */}
      <div
        className="grid border-b border-border"
        style={{ gridTemplateColumns: `44px repeat(${days.length}, 1fr)` }}
      >
        <div />
        {days.map((day) => {
          const today = isSameDay(day, now);
          return (
            <div
              key={day.toDateString()}
              className="flex flex-col items-center gap-0.5 py-2"
            >
              <span className="font-mono text-[10px] tracking-wide text-text-dim uppercase">
                {day.toLocaleDateString(undefined, { weekday: "short" })}
              </span>
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[13px] ${
                  today ? "bg-accent font-semibold text-accent-contrast" : "text-text"
                }`}
              >
                {day.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      <div ref={scrollRef} className="max-h-[560px] overflow-y-auto">
        <div
          className="relative grid"
          style={{ gridTemplateColumns: `44px repeat(${days.length}, 1fr)` }}
        >
          {/* Hour gutter */}
          <div className="relative" style={{ height: ROW_H * 24 }}>
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute right-1.5 -translate-y-1/2 font-mono text-[9.5px] text-text-dim"
                style={{ top: h * ROW_H }}
              >
                {h === 0 ? "" : hourLabel(h)}
              </div>
            ))}
            {showNowLine && (
              <div
                className="absolute right-1 z-10 -translate-y-1/2 rounded-full bg-accent px-1.5 py-[1px] font-mono text-[9.5px] font-semibold text-accent-contrast"
                style={{ top: nowTop }}
              >
                {now.toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </div>
            )}
          </div>

          {eventsByDay.map(({ day, dayEvents, layout }) => (
            <div
              key={day.toDateString()}
              className="relative border-l border-border"
              style={{ height: ROW_H * 24 }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const y = e.clientY - rect.top;
                const rawMinutes = (y / ROW_H) * 60;
                const minutes = Math.max(0, Math.round(rawMinutes / 30) * 30);
                onSlotClick(day, minutes);
              }}
            >
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="absolute inset-x-0 border-t border-border"
                  style={{ top: h * ROW_H }}
                />
              ))}

              {dayEvents.map((ev) => {
                const slot = layout.get(ev.id)!;
                const startMin = minutesSinceMidnight(new Date(ev.start));
                const endMin = Math.max(
                  startMin + 15,
                  minutesSinceMidnight(new Date(ev.end)),
                );
                const top = (startMin / 60) * ROW_H;
                const height = ((endMin - startMin) / 60) * ROW_H;
                const width = 100 / slot.laneCount;
                const left = slot.lane * width;
                return (
                  <EventChip
                    key={ev.id}
                    event={ev}
                    area={ev.areaId ? areaById.get(ev.areaId) : undefined}
                    compact={height < 34}
                    onClick={() => onEventClick(ev)}
                    style={{
                      top,
                      height: Math.max(height - 2, 18),
                      left: `calc(${left}% + 2px)`,
                      width: `calc(${width}% - 4px)`,
                    }}
                  />
                );
              })}
            </div>
          ))}

          {showNowLine && (
            <div
              className="pointer-events-none absolute inset-x-0 z-10 h-[2px] bg-accent"
              style={{ top: nowTop, left: 44, right: 0 }}
            >
              <span className="absolute -top-[3px] -left-[3px] h-2 w-2 rounded-full bg-accent" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
