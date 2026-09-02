import type { Currency, SpendCategory, Transaction } from "../../../types";
import { formatMoney } from "../../../utils/currency";
import { currentMonthKey, monthKey } from "../../../utils/spendingEngine";

const PALETTE = ["#fb5607", "#60a5fa", "#34d399", "#a78bfa", "#f59e0b", "#ff375f"];
const OTHER_COLOR = "#3f3f46";
const MAX_SLICES = 5;

interface TopCategoriesCardProps {
  categories: SpendCategory[];
  transactions: Transaction[];
  currency: Currency;
  className?: string;
}

export function TopCategoriesCard({
  categories,
  transactions,
  currency,
  className = "",
}: TopCategoriesCardProps) {
  const month = currentMonthKey();
  const byId = new Map(categories.map((c) => [c.id, c]));

  const totals = new Map<string, number>();
  for (const t of transactions) {
    if (monthKey(t.date) !== month) continue;
    const key = t.categoryId ?? "uncategorized";
    totals.set(key, (totals.get(key) ?? 0) + t.amountChf);
  }

  const rows = [...totals.entries()]
    .map(([id, value]) => ({
      id,
      name: id === "uncategorized" ? "Uncategorized" : (byId.get(id)?.name ?? "Uncategorized"),
      value,
    }))
    .sort((a, b) => b.value - a.value);

  const top = rows.slice(0, MAX_SLICES);
  const rest = rows.slice(MAX_SLICES);
  const restTotal = rest.reduce((sum, r) => sum + r.value, 0);
  const slices = restTotal > 0 ? [...top, { id: "other", name: "Other", value: restTotal }] : top;

  const grandTotal = slices.reduce((sum, s) => sum + s.value, 0);
  const hasData = grandTotal > 0;

  const size = 168;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  return (
    <div className={`panel-card flex flex-col rounded-[22px] bg-surface p-5 ${className}`}>
      <p className="font-mono text-[11px] tracking-[0.14em] text-text-dim uppercase">
        Top Spending Categories
      </p>
      <p className="mt-0.5 mb-4 text-[12.5px] text-text-dim">This month</p>

      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Top spending categories">
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              strokeWidth={strokeWidth}
              style={{ stroke: "var(--color-gauge-track)" }}
            />
            {slices.map((s, i) => {
              const pct = grandTotal > 0 ? s.value / grandTotal : 0;
              const dash = pct * circumference;
              const offset = -cumulative;
              cumulative += dash;
              const color = s.id === "other" ? OTHER_COLOR : PALETTE[i % PALETTE.length];
              return (
                <circle
                  key={s.id}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={color}
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
            style={{ fill: "var(--color-text)", fontFamily: "var(--font-mono)" }}
          >
            {hasData ? formatMoney(grandTotal, currency) : "-"}
          </text>
          <text
            x={size / 2}
            y={size / 2 + 14}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={10}
            style={{ fill: "var(--color-text-dim)", fontFamily: "var(--font-mono)" }}
          >
            spent
          </text>
        </svg>

        {hasData ? (
          <div className="flex w-full flex-col gap-1.5">
            {slices.map((s, i) => (
              <div key={s.id} className="flex items-center justify-between gap-2 text-[13px]">
                <span className="flex min-w-0 items-center gap-1.5 truncate text-text-dim">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{
                      backgroundColor: s.id === "other" ? OTHER_COLOR : PALETTE[i % PALETTE.length],
                    }}
                  />
                  <span className="truncate">{s.name}</span>
                </span>
                <span className="shrink-0 font-mono text-text">
                  {formatMoney(s.value, currency)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="max-w-[200px] text-center text-[13px] text-text-dim italic">
            No spending logged yet this month
          </p>
        )}
      </div>
    </div>
  );
}
