import { Check, Minus, Plus, Trash2 } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { useGoals } from "../../hooks/useGoals";
import type { LifeArea, LifeAreaId } from "../../types";
import { formatTargetDate } from "../../utils/date";
import { Panel } from "../layout/Panel";

export function GoalsPanel({
  className = "",
  areas,
}: {
  className?: string;
  areas: LifeArea[];
}) {
  const { goals, loading, addGoal, adjustProgress, deleteGoal } = useGoals();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [areaId, setAreaId] = useState<LifeAreaId | "">("");
  const [targetDate, setTargetDate] = useState("");

  const areaById = useMemo(
    () => new Map(areas.map((area) => [area.id, area])),
    [areas],
  );

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    addGoal({
      title: title.trim(),
      areaId: areaId || null,
      targetDate: targetDate || null,
    });
    setTitle("");
    setAreaId("");
    setTargetDate("");
    setShowForm(false);
  }

  return (
    <Panel
      title="Goals"
      subtitle={`${goals.filter((g) => g.progress >= 100).length} of ${goals.length} completed`}
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Goal title"
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
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="rounded-[10px] bg-field px-2.5 py-2 text-xs text-text focus:ring-2 focus:ring-accent focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-full bg-accent px-4 py-1.5 text-[13px] font-semibold text-accent-contrast hover:opacity-90"
          >
            Add goal
          </button>
        </form>
      )}

      {loading ? (
        <div className="py-8 text-center text-sm text-text-dim">
          Loading goals…
        </div>
      ) : goals.length === 0 ? (
        <div className="py-8 text-center text-sm text-text-dim">
          No goals yet — add one to get started.
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {goals.map((goal) => {
            const area = goal.areaId ? areaById.get(goal.areaId) : undefined;
            const color = area?.color ?? "var(--color-accent)";
            const done = goal.progress >= 100;

            return (
              <div
                key={goal.id}
                className="group rounded-[14px] px-2 py-2.5 transition-colors hover:bg-hover"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="flex min-w-0 items-center gap-1.5 truncate text-[15px] text-text">
                    {done && (
                      <Check
                        size={14}
                        strokeWidth={3}
                        className="shrink-0 text-[#30d158]"
                      />
                    )}
                    <span className={done ? "text-text-dim line-through" : ""}>
                      {goal.title}
                    </span>
                  </p>
                  <div className="flex shrink-0 items-center gap-1 opacity-60 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    <button
                      onClick={() => adjustProgress(goal.id, -10)}
                      aria-label="Decrease progress"
                      className="rounded-lg p-1.5 text-text-dim transition-colors hover:bg-hover hover:text-text"
                    >
                      <Minus size={14} />
                    </button>
                    <button
                      onClick={() => adjustProgress(goal.id, 10)}
                      aria-label="Increase progress"
                      className="rounded-lg p-1.5 text-text-dim transition-colors hover:bg-hover hover:text-text"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      aria-label={`Delete goal ${goal.title}`}
                      className="rounded-lg p-1.5 text-text-dim transition-colors hover:bg-[#ff453a]/10 hover:text-[#ff453a]"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

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
                  <span>{formatTargetDate(goal.targetDate)}</span>
                  <span className="ml-auto font-mono font-medium tabular-nums">
                    {goal.progress}%
                  </span>
                </div>

                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-field">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${goal.progress}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
