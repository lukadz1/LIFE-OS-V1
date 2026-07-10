import { useState, type FormEvent } from "react";
import type { TaskInput } from "../../hooks/useTasks";
import type { LifeArea, LifeAreaId, Priority } from "../../types";
import { PRIORITY_STYLES } from "./priorityStyles";

interface TodoFormProps {
  areas: LifeArea[];
  initial?: TaskInput;
  onSubmit: (input: TaskInput) => void;
  onCancel: () => void;
}

export function TodoForm({ areas, initial, onSubmit, onCancel }: TodoFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? "medium");
  const [dueDate, setDueDate] = useState(initial?.dueDate?.slice(0, 10) ?? "");
  const [areaId, setAreaId] = useState<LifeAreaId | "">(initial?.areaId ?? "");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      priority,
      dueDate: dueDate || null,
      areaId: areaId || null,
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
        placeholder="Task title"
        className="rounded-[10px] bg-field px-3 py-2 text-[15px] text-text placeholder:text-text-dim focus:ring-2 focus:ring-accent focus:outline-none"
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-[9px] bg-field p-[2px]">
          {(Object.keys(PRIORITY_STYLES) as Priority[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={`rounded-[7px] px-2.5 py-1 text-xs font-medium transition-colors ${
                priority === p
                  ? `${PRIORITY_STYLES[p].text} bg-segment shadow-sm`
                  : "text-text-dim hover:text-text"
              }`}
            >
              {PRIORITY_STYLES[p].label}
            </button>
          ))}
        </div>

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="rounded-[10px] bg-field px-2.5 py-1.5 text-xs text-text focus:ring-2 focus:ring-accent focus:outline-none"
        />

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
      </div>

      <div className="flex items-center justify-end gap-3 pt-1">
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
          {initial ? "Save" : "Add task"}
        </button>
      </div>
    </form>
  );
}
