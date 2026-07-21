import { Plus, Trash2 } from "lucide-react";
import type { Exercise } from "../../types";

interface ExercisePickerProps {
  exercises: Exercise[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: () => void;
}

export function ExercisePicker({
  exercises,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
}: ExercisePickerProps) {
  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedId ?? ""}
        onChange={(e) => onSelect(e.target.value)}
        disabled={exercises.length === 0}
        className="min-w-0 flex-1 rounded-[10px] bg-field px-3 py-2.5 text-sm text-text focus:ring-2 focus:ring-accent focus:outline-none disabled:opacity-50"
      >
        {exercises.length === 0 && (
          <option value="">No exercises for this filter</option>
        )}
        {exercises.map((ex) => (
          <option key={ex.id} value={ex.id}>
            {ex.name}
          </option>
        ))}
      </select>
      <button
        onClick={onAdd}
        aria-label="Add exercise"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-accent/15 text-accent transition-colors hover:bg-accent/25"
      >
        <Plus size={16} strokeWidth={2.5} />
      </button>
      <button
        onClick={onDelete}
        disabled={!selectedId}
        aria-label="Delete exercise"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-text-dim transition-colors hover:bg-[#ff453a]/10 hover:text-[#ff453a] disabled:opacity-30"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
