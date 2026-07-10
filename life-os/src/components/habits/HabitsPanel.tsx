import { Flame, Plus, Trash2 } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { useHabits } from "../../hooks/useHabits";
import type { LifeArea, LifeAreaId } from "../../types";
import { isoDateDaysAgo, todayISO, weekdayNarrow } from "../../utils/date";
import { habitStreak } from "../../utils/streak";
import { Panel } from "../layout/Panel";

export function HabitsPanel({
  className = "",
  areas,
}: {
  className?: string;
  areas: LifeArea[];
}) {
  const { habits, loading, addHabit, toggleDate, deleteHabit } = useHabits();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [areaId, setAreaId] = useState<LifeAreaId | "">("");

  const last7Days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => isoDateDaysAgo(6 - i)),
    [],
  );
  const areaById = useMemo(
    () => new Map(areas.map((area) => [area.id, area])),
    [areas],
  );

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    addHabit({ name: name.trim(), areaId: areaId || null });
    setName("");
    setAreaId("");
    setShowForm(false);
  }

  return (
    <Panel
      title="Habits"
      subtitle="Last 7 days"
      className={className}
      action={
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1 rounded-full bg-accent/15 px-3 py-1.5 text-[13px] font-medium text-accent transition-colors hover:bg-accent/25"
        >
          <Plus size={14} strokeWidth={2.5} />
          Add
        </button>
      }
    >
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-3 flex flex-wrap items-center gap-2 rounded-2xl bg-surface-raised p-3"
        >
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Habit name"
            className="min-w-40 flex-1 rounded-[10px] bg-field px-3 py-2 text-[15px] text-text placeholder:text-text-dim focus:ring-2 focus:ring-accent focus:outline-none"
          />
          <select
            value={areaId}
            onChange={(e) => setAreaId(e.target.value as LifeAreaId | "")}
            className="rounded-[10px] bg-field px-2.5 py-2 text-xs text-text focus:ring-2 focus:ring-accent focus:outline-none"
          >
            <option value="">No area</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-full bg-accent px-4 py-1.5 text-[13px] font-semibold text-accent-contrast hover:opacity-90"
          >
            Add habit
          </button>
        </form>
      )}

      {loading ? (
        <div className="py-8 text-center text-sm text-text-dim">
          Loading habits…
        </div>
      ) : habits.length === 0 ? (
        <div className="py-8 text-center text-sm text-text-dim">
          No habits yet — add one to start tracking.
        </div>
      ) : (
        <div className="flex flex-col gap-0.5">
          {habits.map((habit) => {
            const area = habit.areaId ? areaById.get(habit.areaId) : undefined;
            const color = area?.color ?? "var(--color-accent)";
            const doneSet = new Set(habit.completedDates);
            const streak = habitStreak(habit.completedDates);

            return (
              <div
                key={habit.id}
                className="group flex items-center gap-3 rounded-[14px] px-2 py-2.5 transition-colors hover:bg-hover"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] text-text">{habit.name}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-text-dim">
                    {area && (
                      <span className="flex items-center gap-1">
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: area.color }}
                        />
                        {area.label}
                      </span>
                    )}
                    <span
                      className={`flex items-center gap-0.5 ${
                        streak > 0 ? "text-[#ff9f0a]" : ""
                      }`}
                    >
                      <Flame size={11} />
                      {streak} day{streak === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 gap-1">
                  {last7Days.map((date) => {
                    const done = doneSet.has(date);
                    const isToday = date === todayISO();
                    return (
                      <button
                        key={date}
                        onClick={() => toggleDate(habit.id, date)}
                        title={date}
                        aria-label={`${habit.name} on ${date}: ${done ? "done" : "not done"}`}
                        className="flex flex-col items-center gap-1"
                      >
                        <span className="font-mono text-[9px] leading-none text-text-dim">
                          {weekdayNarrow(date)}
                        </span>
                        <span
                          className={`block h-5 w-5 rounded-full border-[1.5px] transition-colors ${
                            done
                              ? "border-transparent"
                              : isToday
                                ? "border-accent"
                                : "border-check"
                          }`}
                          style={done ? { backgroundColor: color } : undefined}
                        />
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => deleteHabit(habit.id)}
                  aria-label={`Delete habit ${habit.name}`}
                  className="shrink-0 rounded-lg p-1.5 text-text-dim opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[#ff453a]/10 hover:text-[#ff453a] focus-visible:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
