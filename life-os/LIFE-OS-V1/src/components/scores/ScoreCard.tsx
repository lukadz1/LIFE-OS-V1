import { TrendingDown, TrendingUp } from "lucide-react";
import type { ScoreId, ScoreMetric } from "../../types";
import { Gauge } from "./Gauge";
import { TrendChart } from "./TrendChart";

export const SCORE_COLORS: Record<ScoreId, string> = {
  financial: "#ffd60a",
  wellness: "#30d158",
};

export function ScoreCard({ score }: { score: ScoreMetric }) {
  const color = SCORE_COLORS[score.id];
  const delta =
    score.history.length > 1 ? score.value - score.history[0].value : 0;

  return (
    <div className="flex items-center gap-4">
      <Gauge value={score.value} max={score.max} color={color} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[15px] font-medium text-text">
            {score.label}
          </p>
          <span
            className={`flex shrink-0 items-center gap-0.5 text-xs font-semibold ${
              delta >= 0 ? "text-[#30d158]" : "text-[#ff453a]"
            }`}
          >
            {delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {delta >= 0 ? "+" : ""}
            {delta}
          </span>
        </div>
        <TrendChart data={score.history} color={color} />
      </div>
    </div>
  );
}
