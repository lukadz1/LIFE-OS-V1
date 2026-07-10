import {
  Area,
  AreaChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface EnergyGraphProps {
  curve: number[];
  focusStartHour: number;
  focusEndHour: number;
  breakHour: number;
}

export function EnergyGraph({
  curve,
  focusStartHour,
  focusEndHour,
  breakHour,
}: EnergyGraphProps) {
  const data = curve.map((value, hour) => ({ hour, value }));
  const currentHour = new Date().getHours();

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
        <defs>
          <linearGradient id="energy-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="hour"
          ticks={[0, 6, 12, 18, 23]}
          tickFormatter={(h) => `${h}:00`}
          tick={{
            fill: "var(--color-text-dim)",
            fontSize: 10,
            fontFamily: "var(--font-mono)",
          }}
          axisLine={{ stroke: "var(--color-border)" }}
          tickLine={false}
        />
        <YAxis domain={[0, 100]} hide />
        <ReferenceArea
          x1={focusStartHour}
          x2={focusEndHour}
          fill="var(--color-accent)"
          fillOpacity={0.12}
          strokeOpacity={0}
        />
        <ReferenceLine x={breakHour} stroke="#ff9f0a" strokeDasharray="3 3" />
        <ReferenceLine x={currentHour} stroke="var(--color-text-dim)" />
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
          formatter={(value) => [value, "Energy"]}
          labelFormatter={(label) => `${label}:00`}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="var(--color-accent)"
          strokeWidth={2}
          fill="url(#energy-fill)"
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
