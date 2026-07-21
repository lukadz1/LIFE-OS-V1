import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import type { ScoreHistoryPoint } from "../../types";

interface TrendChartProps {
  data: ScoreHistoryPoint[];
  color: string;
}

export function TrendChart({ data, color }: TrendChartProps) {
  const gradientId = `score-trend-${color.replace("#", "")}`;

  return (
    <ResponsiveContainer width="100%" height={64}>
      <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis domain={[0, 100]} hide />
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
          formatter={(value) => [value, "Score"]}
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
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
