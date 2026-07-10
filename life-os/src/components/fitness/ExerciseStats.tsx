import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import type { Exercise, SetLog } from "../../types";
import { estimateOneRepMax } from "../../utils/fitnessEngine";

interface ExerciseStatsProps {
  exercise: Exercise;
  sets: SetLog[];
}

export function ExerciseStats({ exercise, sets }: ExerciseStatsProps) {
  const last = sets[sets.length - 1] ?? null;
  const gradientId = `fitness-spark-${exercise.id}`;
  const chartData = sets.slice(-12).map((s) => ({
    at: s.at,
    value: exercise.bodyweight ? s.reps : estimateOneRepMax(s.weight, s.reps),
  }));
  const hasData = chartData.length > 1;

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        <StatBox
          label={exercise.bodyweight ? "Last reps" : "Last weight"}
          value={last ? String(exercise.bodyweight ? last.reps : last.weight) : "-"}
          unit={exercise.bodyweight ? "reps" : "kg"}
        />
        <StatBox
          label={exercise.bodyweight ? "Best reps" : "Est. 1RM"}
          value={
            last
              ? exercise.bodyweight
                ? String(Math.max(...sets.map((s) => s.reps)))
                : String(estimateOneRepMax(last.weight, last.reps))
              : "-"
          }
          unit={exercise.bodyweight ? "reps" : "kg"}
        />
        <StatBox label="Sets logged" value={String(sets.length)} />
      </div>

      <div className="mt-3 h-[64px]">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--color-accent)"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--color-accent)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <YAxis domain={["dataMin - 2", "dataMax + 2"]} hide />
              <Tooltip
                contentStyle={{
                  background: "var(--color-surface-raised)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 10,
                  fontSize: 12,
                  padding: "6px 10px",
                }}
                labelStyle={{ color: "var(--color-text-dim)" }}
                itemStyle={{ color: "var(--color-text)" }}
                formatter={(value) => [
                  value,
                  exercise.bodyweight ? "Reps" : "Est. 1RM",
                ]}
                labelFormatter={(label) =>
                  new Date(String(label)).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--color-accent)"
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-text-dim">
            Log a few sets to see your trend.
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="rounded-[12px] bg-field px-2 py-2.5 text-center">
      <p className="font-mono text-[9px] tracking-wide text-text-dim uppercase">
        {label}
      </p>
      <p className="mt-1 font-mono text-lg font-bold text-text">
        {value}
        {unit && (
          <span className="ml-1 text-xs font-normal text-text-dim">
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}
