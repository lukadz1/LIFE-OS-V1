import { Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { EventInput } from "../../hooks/useEvents";
import type { CalendarEvent, LifeArea, LifeAreaId } from "../../types";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toDateValue(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toTimeValue(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function combine(dateStr: string, timeStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0).toISOString();
}

function addMinutes(dateStr: string, timeStr: string, minutes: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0);
  dt.setMinutes(dt.getMinutes() + minutes);
  return toTimeValue(dt);
}

// Monday-first display, mapped to JS's Sun=0..Sat=6 for storage.
const WEEKDAYS: readonly [number, string][] = [
  [1, "M"],
  [2, "T"],
  [3, "W"],
  [4, "T"],
  [5, "F"],
  [6, "S"],
  [0, "S"],
];

interface EventFormProps {
  areas: LifeArea[];
  editing?: CalendarEvent;
  defaultDay?: Date;
  defaultMinutes?: number;
  onSubmit: (input: EventInput) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

/** Inline add/edit form for a calendar event — same shape as the ToDos
 * quick-add, opened either from the header "+" or by clicking a grid slot. */
export function EventForm({
  areas,
  editing,
  defaultDay,
  defaultMinutes = 9 * 60,
  onSubmit,
  onDelete,
  onCancel,
}: EventFormProps) {
  const startSeed = editing ? new Date(editing.start) : (defaultDay ?? new Date());
  const endSeed = editing ? new Date(editing.end) : undefined;
  const seedMinutes = editing
    ? startSeed.getHours() * 60 + startSeed.getMinutes()
    : defaultMinutes;

  const [title, setTitle] = useState(editing?.title ?? "");
  const [date, setDate] = useState(toDateValue(startSeed));
  const [startTime, setStartTime] = useState(
    editing
      ? toTimeValue(startSeed)
      : `${pad(Math.floor(seedMinutes / 60))}:${pad(seedMinutes % 60)}`,
  );
  const [endTime, setEndTime] = useState(
    endSeed ? toTimeValue(endSeed) : addMinutes(toDateValue(startSeed), startTime, 60),
  );
  const [areaId, setAreaId] = useState<LifeAreaId | "">(editing?.areaId ?? "");
  const [location, setLocation] = useState(editing?.location ?? "");
  const [repeatDays, setRepeatDays] = useState<number[]>(editing?.recurringDays ?? []);

  function toggleRepeatDay(dow: number) {
    setRepeatDays((prev) =>
      prev.includes(dow) ? prev.filter((d) => d !== dow) : [...prev, dow],
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    let start = combine(date, startTime);
    let end = combine(date, endTime);
    if (end <= start) end = combine(date, addMinutes(date, startTime, 30));
    onSubmit({
      title: title.trim(),
      start,
      end,
      areaId: areaId || null,
      location: location.trim() || undefined,
      recurringDays: repeatDays.length > 0 ? repeatDays : undefined,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-3 flex flex-col gap-2.5 rounded-2xl bg-surface-raised p-3"
    >
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Event title"
        className="rounded-[10px] bg-field px-3 py-2 text-[15px] text-text placeholder:text-text-dim focus:ring-2 focus:ring-accent focus:outline-none"
      />

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-[10px] bg-field px-2.5 py-1.5 text-xs text-text focus:ring-2 focus:ring-accent focus:outline-none"
        />
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="rounded-[10px] bg-field px-2.5 py-1.5 text-xs text-text focus:ring-2 focus:ring-accent focus:outline-none"
        />
        <span className="text-xs text-text-dim">to</span>
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="rounded-[10px] bg-field px-2.5 py-1.5 text-xs text-text focus:ring-2 focus:ring-accent focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] tracking-wide text-text-dim uppercase">
          Repeat
        </span>
        <div className="flex rounded-[9px] bg-field p-[2px]">
          {WEEKDAYS.map(([dow, label]) => (
            <button
              key={dow}
              type="button"
              onClick={() => toggleRepeatDay(dow)}
              className={`h-6 w-6 rounded-[7px] text-[11px] font-medium transition-colors ${
                repeatDays.includes(dow)
                  ? "bg-segment text-accent shadow-sm"
                  : "text-text-dim hover:text-text"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {repeatDays.length > 0 && (
          <span className="text-xs text-text-dim">every week</span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={areaId}
          onChange={(e) => setAreaId(e.target.value as LifeAreaId | "")}
          className="rounded-[10px] bg-field px-2.5 py-1.5 text-xs text-text focus:ring-2 focus:ring-accent focus:outline-none"
        >
          <option value="">No area</option>
          {areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.label}
            </option>
          ))}
        </select>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location (optional)"
          className="min-w-0 flex-1 rounded-[10px] bg-field px-2.5 py-1.5 text-xs text-text placeholder:text-text-dim focus:ring-2 focus:ring-accent focus:outline-none"
        />
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        {editing && onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete event"
            className="flex items-center gap-1 text-[13px] font-medium text-text-dim hover:text-text"
          >
            <Trash2 size={14} />
            Delete
          </button>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="text-[13px] font-medium text-accent hover:opacity-80"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-full bg-accent px-4 py-1.5 text-[13px] font-semibold text-accent-contrast hover:opacity-90"
          >
            {editing ? "Save" : "Add event"}
          </button>
        </div>
      </div>
    </form>
  );
}
