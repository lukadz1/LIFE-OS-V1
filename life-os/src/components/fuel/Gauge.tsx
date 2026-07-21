interface GaugeProps {
  value: number;
  max: number;
  color: string;
  size?: number;
}

export function Gauge({ value, max, color, size = 96 }: GaugeProps) {
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(1, max === 0 ? 0 : value / max));
  const dashOffset = circumference * (1 - pct);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`Score ${value} out of ${max}`}
    >
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          style={{ stroke: "var(--color-gauge-track)" }}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 600ms ease" }}
        />
      </g>
      <text
        x={size / 2}
        y={size / 2 - 3}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={21}
        fontWeight={700}
        style={{
          letterSpacing: "-0.02em",
          fill: "var(--color-text)",
          fontFamily: "var(--font-mono)",
        }}
      >
        {value}
      </text>
      <text
        x={size / 2}
        y={size / 2 + 15}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={9}
        style={{ fill: "var(--color-text-dim)", fontFamily: "var(--font-mono)" }}
      >
        / {max}
      </text>
    </svg>
  );
}
