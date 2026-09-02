import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { EventForm } from "../components/calendar/EventForm";
import { MonthGrid } from "../components/calendar/MonthGrid";
import { RangeSwitch, type CalendarRange } from "../components/calendar/RangeSwitch";
import { TimeGrid } from "../components/calendar/TimeGrid";
import { YearGrid } from "../components/calendar/YearGrid";
import { DashboardGrid } from "../components/layout/DashboardGrid";
import { Panel } from "../components/layout/Panel";
import { useEvents, type EventInput } from "../hooks/useEvents";
import type { CalendarEvent, LifeArea } from "../types";
import {
  addDays,
  addMonths,
  addYears,
  getWeekDates,
  isSameDay,
} from "../utils/date";

type FormState =
  | { mode: "add"; day: Date; minutes: number }
  | { mode: "edit"; event: CalendarEvent }
  | null;

function rangeLabel(range: CalendarRange, cursor: Date): string {
  if (range === "day") {
    return cursor.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }
  if (range === "week") {
    const [start, end] = [getWeekDates(cursor)[0], getWeekDates(cursor)[6]];
    const sameMonth = start.getMonth() === end.getMonth();
    const startLabel = start.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    const endLabel = end.toLocaleDateString(undefined, {
      month: sameMonth ? undefined : "short",
      day: "numeric",
      year: "numeric",
    });
    return `${startLabel} – ${endLabel}`;
  }
  if (range === "month") {
    return cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  }
  return String(cursor.getFullYear());
}

function stepRange(range: CalendarRange, cursor: Date, dir: 1 | -1): Date {
  switch (range) {
    case "day":
      return addDays(cursor, dir);
    case "week":
      return addDays(cursor, dir * 7);
    case "month":
      return addMonths(cursor, dir);
    case "year":
      return addYears(cursor, dir);
  }
}

function nextHalfHour(): number {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  return Math.ceil(minutes / 30) * 30;
}

export function CalendarView({ areas }: { areas: LifeArea[] }) {
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  const [range, setRange] = useState<CalendarRange>("week");
  const [cursor, setCursor] = useState(() => new Date());
  const [formState, setFormState] = useState<FormState>(null);

  const areaById = useMemo(
    () => new Map(areas.map((area) => [area.id, area])),
    [areas],
  );

  const days = useMemo(() => {
    if (range === "day") return [cursor];
    if (range === "week") return getWeekDates(cursor);
    return [];
  }, [range, cursor]);

  const isToday = isSameDay(cursor, new Date());

  function handleSubmit(input: EventInput) {
    if (formState?.mode === "edit") {
      updateEvent(formState.event.id, input);
    } else {
      addEvent(input);
    }
    setFormState(null);
  }

  return (
    <DashboardGrid>
      <Panel
        className="lg:col-span-12"
        noGlow
        title="Calendar"
        subtitle={rangeLabel(range, cursor)}
        action={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex items-center gap-1 rounded-full border border-border bg-surface px-1 py-1">
              <button
                onClick={() => setCursor((c) => stepRange(range, c, -1))}
                aria-label="Previous"
                className="flex h-7 w-7 items-center justify-center rounded-full text-text-dim transition-colors hover:text-text"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                onClick={() => setCursor(new Date())}
                disabled={isToday}
                className="rounded-full px-2.5 py-1 text-[12.5px] font-medium text-text-dim transition-colors hover:text-text disabled:opacity-40"
              >
                Today
              </button>
              <button
                onClick={() => setCursor((c) => stepRange(range, c, 1))}
                aria-label="Next"
                className="flex h-7 w-7 items-center justify-center rounded-full text-text-dim transition-colors hover:text-text"
              >
                <ChevronRight size={15} />
              </button>
            </div>
            <RangeSwitch value={range} onChange={setRange} />
            <button
              onClick={() =>
                setFormState({ mode: "add", day: cursor, minutes: nextHalfHour() })
              }
              aria-label="Add event"
              className="flex items-center gap-1 rounded-full bg-accent/15 px-3 py-1.5 text-[13px] font-medium text-accent transition-colors hover:bg-accent/25"
            >
              <Plus size={15} />
              Add
            </button>
          </div>
        }
      >
        {formState && (
          <EventForm
            areas={areas}
            editing={formState.mode === "edit" ? formState.event : undefined}
            defaultDay={formState.mode === "add" ? formState.day : undefined}
            defaultMinutes={formState.mode === "add" ? formState.minutes : undefined}
            onSubmit={handleSubmit}
            onCancel={() => setFormState(null)}
            onDelete={
              formState.mode === "edit"
                ? () => {
                    deleteEvent(formState.event.id);
                    setFormState(null);
                  }
                : undefined
            }
          />
        )}

        {(range === "day" || range === "week") && (
          <TimeGrid
            days={days}
            events={events}
            areaById={areaById}
            onSlotClick={(day, minutes) => setFormState({ mode: "add", day, minutes })}
            onEventClick={(event) => setFormState({ mode: "edit", event })}
          />
        )}

        {range === "month" && (
          <MonthGrid
            monthAnchor={cursor}
            events={events}
            onSelectDay={(day) => {
              setCursor(day);
              setRange("day");
            }}
            onEventClick={(event) => setFormState({ mode: "edit", event })}
          />
        )}

        {range === "year" && (
          <YearGrid
            yearAnchor={cursor}
            events={events}
            onSelectMonth={(month) => {
              setCursor(month);
              setRange("month");
            }}
          />
        )}
      </Panel>
    </DashboardGrid>
  );
}
