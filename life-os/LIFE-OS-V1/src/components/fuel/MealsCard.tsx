import { Plus, Trash2, UtensilsCrossed } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { FuelEntry } from "../../types";
import { formatTimeLabel } from "../../utils/date";
import { Panel } from "../layout/Panel";

interface MealsCardProps {
  meals: FuelEntry[];
  totalKcal: number;
  onAdd: (name: string, kcal?: number) => void;
  onDelete: (id: string) => void;
  className?: string;
}

export function MealsCard({
  meals,
  totalKcal,
  onAdd,
  onDelete,
  className = "",
}: MealsCardProps) {
  const [name, setName] = useState("");
  const [kcal, setKcal] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const kcalNum = kcal ? Number(kcal) : undefined;
    onAdd(name.trim(), kcalNum && !Number.isNaN(kcalNum) ? kcalNum : undefined);
    setName("");
    setKcal("");
  }

  return (
    <Panel
      title="Meals & snacks"
      subtitle={totalKcal > 0 ? `${totalKcal} kcal today` : "Today"}
      className={className}
    >
      <form onSubmit={handleSubmit} className="mb-3 flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="What did you eat?"
          className="min-w-0 flex-[1.6] rounded-[10px] bg-field px-3 py-2 text-sm text-text placeholder:text-text-dim focus:ring-2 focus:ring-accent focus:outline-none"
        />
        <input
          value={kcal}
          onChange={(e) => setKcal(e.target.value)}
          placeholder="kcal"
          inputMode="numeric"
          className="min-w-0 flex-1 rounded-[10px] bg-field px-3 py-2 text-sm text-text placeholder:text-text-dim focus:ring-2 focus:ring-accent focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Add meal"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-contrast transition-opacity hover:opacity-90"
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
      </form>

      {meals.length === 0 ? (
        <p className="flex items-center justify-center gap-2 py-6 text-center text-sm text-text-dim">
          <UtensilsCrossed size={14} />
          Nothing logged yet today.
        </p>
      ) : (
        <div className="flex flex-col gap-0.5">
          {meals.map((m) => (
            <div
              key={m.id}
              className="group flex items-center justify-between gap-2 rounded-[10px] px-1 py-1.5 transition-colors hover:bg-hover"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-text">{m.label}</p>
                <p className="font-mono text-[11px] text-text-dim">
                  {formatTimeLabel(m.at)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {m.kcal != null && (
                  <span className="font-mono text-[13px] text-text-dim">
                    {m.kcal} kcal
                  </span>
                )}
                <button
                  onClick={() => onDelete(m.id)}
                  aria-label={`Delete ${m.label}`}
                  className="rounded-lg p-1 text-text-dim opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[#ff453a]/10 hover:text-[#ff453a] focus-visible:opacity-100"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
