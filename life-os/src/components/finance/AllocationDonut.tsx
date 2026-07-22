import type { AssetCategory, Currency } from "../../types";
import { formatMoney } from "../../utils/currency";

const CATEGORY_META: Record<AssetCategory, { label: string; color: string }> = {
  bank: { label: "Bank accounts", color: "#fb5607" },
  sparkonto: { label: "Sparkonto", color: "#34d399" },
  stocks: { label: "Stocks · investments", color: "#60a5fa" },
  crypto: { label: "Crypto · live", color: "#f59e0b" },
  other: { label: "Other assets", color: "#a78bfa" },
};

interface AllocationDonutProps {
  totalsByCategory: Record<AssetCategory, number>;
  netWorthChf: number;
  currency: Currency;
  className?: string;
}

export function AllocationDonut({
  totalsByCategory,
  netWorthChf,
  currency,
  className = "",
}: AllocationDonutProps) {
  const size = 168;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const hasData = netWorthChf > 0;

  const segments = (Object.keys(CATEGORY_META) as AssetCategory[])
    .map((category) => ({
      category,
      value: totalsByCategory[category],
      pct: hasData ? totalsByCategory[category] / netWorthChf : 0,
    }))
    .filter((s) => s.value > 0);

  let cumulative = 0;

  return (
    <div
      className={`panel-card flex flex-col rounded-[22px] bg-surface p-5 ${className}`}
    >
      <p className="mb-4 font-mono text-[11px] tracking-[0.14em] text-text-dim uppercase">
        Allocation
      </p>

      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label="Asset allocation"
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
            {segments.map((s) => {
              const dash = s.pct * circumference;
              const offset = -cumulative;
              cumulative += dash;
              return (
                <circle
                  key={s.category}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={CATEGORY_META[s.category].color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={offset}
                  style={{ transition: "stroke-dasharray 500ms ease" }}
                />
              );
            })}
          </g>
          <text
            x={size / 2}
            y={size / 2 - 6}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={17}
            fontWeight={600}
            style={{
              fill: "var(--color-text)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {hasData ? formatMoney(netWorthChf, currency) : "-"}
          </text>
          <text
            x={size / 2}
            y={size / 2 + 14}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={10}
            style={{
              fill: "var(--color-text-dim)",
              fontFamily: "var(--font-mono)",
            }}
          >
            total
          </text>
        </svg>

        {hasData ? (
          <div className="flex w-full flex-col gap-1.5">
            {segments.map((s) => (
              <div
                key={s.category}
                className="flex items-center justify-between gap-2 text-[13px]"
              >
                <span className="flex min-w-0 items-center gap-1.5 truncate text-text-dim">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: CATEGORY_META[s.category].color }}
                  />
                  <span className="truncate">
                    {CATEGORY_META[s.category].label}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-text">
                  {Math.round(s.pct * 100)}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="max-w-[200px] text-center text-[13px] text-text-dim italic">
            Add an account to see your breakdown
          </p>
        )}
      </div>
    </div>
  );
}
