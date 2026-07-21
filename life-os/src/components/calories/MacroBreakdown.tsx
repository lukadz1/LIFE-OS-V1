import { Minus, Plus } from "lucide-react";

export const MACRO_COLORS = {
  protein: "#ff375f",
  carbs: "#0a84ff",
  fat: "#ffd60a",
} as const;

interface MacroRowProps {
  label: string;
  color: string;
  grams: number;
  goal: number;
  onGoalChange: (value: number) => void;
}

function MacroRow({ label, color, grams, goal, onGoalChange }: MacroRowProps) {
  const pct = goal > 0 ? Math.min(1, grams / goal) : 0;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[13px] font-medium text-text">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          />
          {label}
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[12px] text-text-dim">
          <b className="text-text">{Math.round(grams)}</b>
          <span className="flex items-center gap-1">
            /
            <button
              onClick={() => onGoalChange(Math.max(0, goal - 5))}
              aria-label={`Decrease ${label} goal`}
              className="rounded p-0.5 hover:text-text"
            >
              <Minus size={10} />
            </button>
            {goal}g
            <button
              onClick={() => onGoalChange(goal + 5)}
              aria-label={`Increase ${label} goal`}
              className="rounded p-0.5 hover:text-text"
            >
              <Plus size={10} />
            </button>
          </span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-field">
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${pct * 100}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

interface MacroBreakdownProps {
  protein: number;
  carbs: number;
  fat: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  onProteinGoalChange: (v: number) => void;
  onCarbsGoalChange: (v: number) => void;
  onFatGoalChange: (v: number) => void;
}

export function MacroBreakdown({
  protein,
  carbs,
  fat,
  proteinGoal,
  carbsGoal,
  fatGoal,
  onProteinGoalChange,
  onCarbsGoalChange,
  onFatGoalChange,
}: MacroBreakdownProps) {
  return (
    <div className="flex flex-col gap-4">
      <MacroRow
        label="Protein"
        color={MACRO_COLORS.protein}
        grams={protein}
        goal={proteinGoal}
        onGoalChange={onProteinGoalChange}
      />
      <MacroRow
        label="Carbs"
        color={MACRO_COLORS.carbs}
        grams={carbs}
        goal={carbsGoal}
        onGoalChange={onCarbsGoalChange}
      />
      <MacroRow
        label="Fat"
        color={MACRO_COLORS.fat}
        grams={fat}
        goal={fatGoal}
        onGoalChange={onFatGoalChange}
      />
    </div>
  );
}
