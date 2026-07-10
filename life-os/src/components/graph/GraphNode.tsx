interface GraphNodeProps {
  x: number;
  y: number;
  r: number;
  color: string;
  label: string;
  selected?: boolean;
  dimmed?: boolean;
  onClick?: () => void;
}

export function GraphNode({
  x,
  y,
  r,
  color,
  label,
  selected = false,
  dimmed = false,
  onClick,
}: GraphNodeProps) {
  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`cursor-pointer transition-opacity duration-300 outline-none ${
        dimmed ? "opacity-30" : "opacity-100"
      }`}
    >
      <title>{label}</title>
      <circle
        r={r}
        fill={selected ? `${color}40` : `${color}26`}
        stroke={color}
        strokeWidth={selected ? 2 : 1.25}
        style={{
          filter: selected ? `drop-shadow(0 2px 10px ${color}55)` : "none",
          transition: "filter 300ms, stroke-width 300ms, fill 300ms",
        }}
      />
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={selected ? 700 : 600}
        style={{
          pointerEvents: "none",
          letterSpacing: "-0.01em",
          fill: "var(--color-text)",
        }}
      >
        {label}
      </text>
    </g>
  );
}
