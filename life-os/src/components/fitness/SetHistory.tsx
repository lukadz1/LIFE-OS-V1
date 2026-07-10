import { Trash2 } from "lucide-react";
import type { Exercise, SetLog } from "../../types";
import { formatPastDate } from "../../utils/date";

interface SetHistoryProps {
  exercise: Exercise;
  sets: SetLog[];
  onDelete: (id: string) => void;
}

export function SetHistory({ exercise, sets, onDelete }: SetHistoryProps) {
  const reversed = [...sets].reverse();

  if (reversed.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-text-dim italic">
        No sets logged yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {reversed.map((s) => (
        <div
          key={s.id}
          className="group flex items-center justify-between gap-2 rounded-[10px] px-1 py-1.5 transition-colors hover:bg-hover"
        >
          <span className="font-mono text-xs text-text-dim">
            {formatPastDate(s.at)}
          </span>
          <span className="flex-1 text-right text-sm text-text">
            {exercise.bodyweight ? `${s.reps} reps` : `${s.weight}kg × ${s.reps}`}
          </span>
          <button
            onClick={() => onDelete(s.id)}
            aria-label="Delete set"
            className="rounded-lg p-1 text-text-dim opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[#ff453a]/10 hover:text-[#ff453a] focus-visible:opacity-100"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
