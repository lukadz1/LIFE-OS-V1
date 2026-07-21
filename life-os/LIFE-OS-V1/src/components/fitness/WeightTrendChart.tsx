import {
  Area,
  AreaChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeightEntry } from "../../types";

export function WeightTrendChart({ entries }: { entries: WeightEntry[] }) {
  const data = entries.map((e, i, arr) => {
    const windowStart = Math.max(0, i - 6);
    const window = arr.slice(windowStart, i + 1);
    const avg = window.reduce((s, w) => s + w.weightKg, 0) / window.length;
    return { at: e.at, weight: e.weightKg, avg: Math.round(avg * 10) / 10 };
  });

  if (data.length < 2) {
    return (
      <div className="flex h-[140px] items-center justify-center text-center text-sm text-text-dim">
        Log a few more days to see your trend.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={140}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
        <defs>
          <linearGradient id="weight-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="at" hide />
        <YAxis domain={["dataMin - 1", "dataMax + 1"]} hide />
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
          labelFormatter={(label) =>
            new Date(String(label)).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })
          }
        />
        <Area
          type="monotone"
          dataKey="weight"
          stroke="var(--color-accent)"
          strokeWidth={2}
          fill="url(#weight-fill)"
          dot={false}
          isAnimationActive={false}
          name="Weight"
        />
        <Line
          type="monotone"
          dataKey="avg"
          stroke="var(--color-accent)"
          strokeOpacity={0.5}
          strokeWidth={1.5}
          strokeDasharray="4 3"
          dot={false}
          isAnimationActive={false}
          name="7-day avg"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
