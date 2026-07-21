import { useMemo, useState } from "react";
import { useEvents } from "../../hooks/useEvents";
import type { LifeArea, LifeAreaId } from "../../types";
import { isSameDay, isWithinNextDays } from "../../utils/date";
import { Panel } from "../layout/Panel";
import { EventItem } from "./EventItem";

type RangeMode = "day" | "week";

interface CalendarPanelProps {
  className?: string;
  areas: LifeArea[];
  selectedAreaId: LifeAreaId | null;
}

export function CalendarPanel({
  className = "",
  areas,
  selectedAreaId,
}: CalendarPanelProps) {
  const { events, loading } = useEvents();
  const [mode, setMode] = useState<RangeMode>("week");

  const areaById = useMemo(
    () => new Map(areas.map((area) => [area.id, area])),
    [areas],
  );

  const visibleEvents = useMemo(() => {
    const now = new Date();
    const inRange = events.filter((event) => {
      const start = new Date(event.start);
      return mode === "day"
        ? isSameDay(start, now)
        : isWithinNextDays(event.start, 7);
    });
    const filtered = selectedAreaId
      ? inRange.filter((event) => event.areaId === selectedAreaId)
      : inRange;
    return [...filtered].sort((a, b) => a.start.localeCompare(b.start));
  }, [events, mode, selectedAreaId]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof visibleEvents>();
    for (const event of visibleEvents) {
      const key = new Date(event.start).toDateString();
      const list = map.get(key) ?? [];
      list.push(event);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [visibleEvents]);

  const selectedArea = selectedAreaId
    ? areaById.get(selectedAreaId)
    : undefined;

  return (
    <Panel
      title="Calendar"
      subtitle={mode === "day" ? "Today" : "Next 7 days"}
      className={className}
      action={
        <div className="flex rounded-[9px] bg-field p-[2px] text-xs">
          {(["day", "week"] as RangeMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-[7px] px-2.5 py-1 font-medium capitalize transition-colors ${
                mode === m
                  ? "bg-segment text-text shadow-sm"
                  : "text-text-dim hover:text-text"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      }
    >
      {loading ? (
        <div className="py-8 text-center text-sm text-text-dim">
          Loading events…
        </div>
      ) : visibleEvents.length === 0 ? (
        <div className="py-8 text-center text-sm text-text-dim">
          {selectedArea
            ? `No ${selectedArea.label} events ${mode === "day" ? "today" : "this week"}.`
            : `Nothing on the calendar ${mode === "day" ? "today" : "this week"}.`}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {groups.map(([dateKey, dayEvents]) => (
            <div key={dateKey}>
              {mode === "week" && (
                <p className="mb-1 px-2 text-[11px] font-medium tracking-wide text-text-dim uppercase">
                  {new Date(dateKey).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              )}
              <div className="flex flex-col gap-0.5">
                {dayEvents.map((event) => (
                  <EventItem
                    key={event.id}
                    event={event}
                    area={event.areaId ? areaById.get(event.areaId) : undefined}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
