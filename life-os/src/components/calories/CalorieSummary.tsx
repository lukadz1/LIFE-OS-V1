import { Minus, Plus } from "lucide-react";

interface CalorieSummaryProps {
  eaten: number;
  goal: number;
  onGoalChange: (value: number) => void;
}

export function CalorieSummary({ eaten, goal, onGoalChange }: CalorieSummaryProps) {
  const remaining = goal - eaten;
  const pct = goal > 0 ? Math.min(1, eaten / goal) : 0;

  return (
    <div>
      <div className="flex items-stretch justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] tracking-[0.14em] text-text-dim uppercase">
            Eaten
          </p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-[52px] leading-none font-semibold tracking-tight text-text tabular-nums sm:text-[64px]">
              {Math.round(eaten)}
            </span>
            <span className="text-sm font-medium text-text-dim">kcal</span>
          </div>
        </div>
        <div className="w-px shrink-0 bg-border" />
        <div className="min-w-0 flex-1 text-right">
          <p className="font-mono text-[11px] tracking-[0.14em] text-text-dim uppercase">
            Remaining
          </p>
          <div className="mt-1 flex items-baseline justify-end gap-1.5">
            <span
              className={`font-mono text-[52px] leading-none font-semibold tracking-tight tabular-nums sm:text-[64px] ${
                remaining < 0 ? "text-[#ff453a]" : "text-accent"
              }`}
            >
              {Math.round(Math.abs(remaining))}
            </span>
            <span className="text-sm font-medium text-text-dim">kcal</span>
          </div>
        </div>
      </div>

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-field">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ease-out ${
            remaining < 0 ? "bg-[#ff453a]" : "bg-accent"
          }`}
          style={{ width: `${pct * 100}%` }}
        />
      </div>

      <div className="mt-2.5 flex items-center justify-center gap-2.5 text-xs text-text-dim">
        Daily goal
        <button
          onClick={() => onGoalChange(goal - 50)}
          aria-label="Decrease calorie goal"
          className="rounded-md p-0.5 hover:text-text"
        >
          <Minus size={12} />
        </button>
        <span className="min-w-[3.5ch] text-center font-mono text-text">
          {goal}
        </span>
        <button
          onClick={() => onGoalChange(goal + 50)}
          aria-label="Increase calorie goal"
          className="rounded-md p-0.5 hover:text-text"
        >
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
}
