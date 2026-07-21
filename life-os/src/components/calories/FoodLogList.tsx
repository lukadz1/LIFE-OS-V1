import { Trash2, UtensilsCrossed } from "lucide-react";
import type { CalorieEntry } from "../../types";
import { formatTimeLabel } from "../../utils/date";

interface FoodLogListProps {
  entries: CalorieEntry[];
  onDelete: (id: string) => void;
}

export function FoodLogList({ entries, onDelete }: FoodLogListProps) {
  if (entries.length === 0) {
    return (
      <p className="flex items-center justify-center gap-2 py-6 text-center text-sm text-text-dim">
        <UtensilsCrossed size={14} />
        Nothing logged for this day.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {entries.map((e) => (
        <div
          key={e.id}
          className="group flex items-center justify-between gap-2 rounded-[10px] px-1 py-1.5 transition-colors hover:bg-hover"
        >
          <div className="min-w-0">
            <p className="truncate text-sm text-text">{e.label}</p>
            <p className="font-mono text-[11px] text-text-dim">
              {formatTimeLabel(e.at)} · P{Math.round(e.proteinG)} C
              {Math.round(e.carbsG)} F{Math.round(e.fatG)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="font-mono text-[13px] text-text-dim">
              {Math.round(e.kcal)} kcal
            </span>
            <button
              onClick={() => onDelete(e.id)}
              aria-label={`Delete ${e.label}`}
              className="rounded-lg p-1 text-text-dim opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[#ff453a]/10 hover:text-[#ff453a] focus-visible:opacity-100"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
