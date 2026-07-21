import { Droplets, Minus, Plus } from "lucide-react";
import { Gauge } from "../scores/Gauge";
import { Panel } from "../layout/Panel";

interface WaterCardProps {
  count: number;
  goal: number;
  onLog: () => void;
  onGoalChange: (value: number) => void;
  className?: string;
}

export function WaterCard({
  count,
  goal,
  onLog,
  onGoalChange,
  className = "",
}: WaterCardProps) {
  return (
    <Panel title="Water" subtitle="Hydration today" className={className}>
      <div className="flex flex-col items-center gap-3">
        <Gauge value={count} max={goal} color="#64d2ff" />
        <button
          onClick={onLog}
          className="flex items-center gap-1.5 rounded-full bg-accent/15 px-4 py-1.5 text-[13px] font-medium text-accent transition-colors hover:bg-accent/25"
        >
          <Droplets size={14} />
          Add glass
        </button>
        <div className="flex items-center gap-2 text-xs text-text-dim">
          Goal
          <button
            onClick={() => onGoalChange(goal - 1)}
            aria-label="Decrease water goal"
            className="rounded-md p-0.5 hover:text-text"
          >
            <Minus size={12} />
          </button>
          <span className="w-4 text-center font-mono text-text">{goal}</span>
          <button
            onClick={() => onGoalChange(goal + 1)}
            aria-label="Increase water goal"
            className="rounded-md p-0.5 hover:text-text"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>
    </Panel>
  );
}
