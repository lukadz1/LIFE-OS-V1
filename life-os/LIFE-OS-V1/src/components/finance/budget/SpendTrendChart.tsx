import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Currency, SpendCategory, Transaction } from "../../../types";
import { chfToCurrency, formatMoney } from "../../../utils/currency";
import {
  BUCKETS,
  BUCKET_META,
  bucketTotals,
  currentMonthKey,
  monthlyTrend,
  trailingAverageTotal,
} from "../../../utils/spendingEngine";

interface SpendTrendChartProps {
  transactions: Transaction[];
  categories: SpendCategory[];
  currency: Currency;
  className?: string;
}

export function SpendTrendChart({
  transactions,
  categories,
  currency,
  className = "",
}: SpendTrendChartProps) {
  const trend = monthlyTrend(transactions, categories, 6);
  const data = trend.map((point) => ({
    label: point.label,
    fixed: chfToCurrency(point.fixed, currency),
    variable: chfToCurrency(point.variable, currency),
    savings: chfToCurrency(point.savings, currency),
  }));
  const hasData = trend.some((p) => p.total > 0);

  const month = currentMonthKey();
  const current = bucketTotals(transactions, categories, month);
  const currentTotal = current.fixed + current.variable + current.savings;
  const avg3 = trailingAverageTotal(transactions, categories, 3);
  const deltaPct = avg3 > 0 ? ((currentTotal - avg3) / avg3) * 100 : null;

  return (
    <div className={`panel-card flex flex-col rounded-[22px] bg-surface p-5 ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] tracking-[0.14em] text-text-dim uppercase">
          Spending trend · 6 months
        </p>
        <div className="flex items-center gap-3 font-mono text-[10px]">
          {BUCKETS.map((b) => (
            <span key={b} className="flex items-center gap-1 text-text-dim">
              <span
                className="h-2 w-2 rounded-[3px]"
                style={{ backgroundColor: BUCKET_META[b].color }}
              />
              {BUCKET_META[b].label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex h-[190px] items-center justify-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--color-text-dim)", fontSize: 11 }}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: "var(--color-hover)" }}
                contentStyle={{
                  background: "var(--color-surface-raised)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 10,
                  fontSize: 12,
                  padding: "6px 10px",
                }}
                labelStyle={{ color: "var(--color-text-dim)" }}
                itemStyle={{ color: "var(--color-text)" }}
                formatter={(value, name) => [
                  Math.round(Number(value)).toLocaleString(),
                  String(name),
                ]}
              />
              {BUCKETS.map((b, i) => (
                <Bar
                  key={b}
                  dataKey={b}
                  stackId="spend"
                  fill={BUCKET_META[b].color}
                  radius={i === BUCKETS.length - 1 ? [4, 4, 0, 0] : undefined}
                  isAnimationActive={false}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="max-w-[240px] text-center text-[13px] text-text-dim italic">
            Log transactions to see your monthly spending trend.
          </p>
        )}
      </div>

      <div className="mt-2 grid grid-cols-2 gap-3 border-t border-border pt-3">
        <div className="min-w-0">
          <p className="truncate font-mono text-[10px] tracking-wide text-text-dim uppercase">
            This month
          </p>
          <p className="mt-0.5 font-mono text-[13px] font-medium text-text">
            {formatMoney(currentTotal, currency)}
          </p>
        </div>
        <div className="min-w-0">
          <p className="truncate font-mono text-[10px] tracking-wide text-text-dim uppercase">
            vs 3-month avg
          </p>
          <p
            className="mt-0.5 font-mono text-[13px] font-medium"
            style={{
              color:
                deltaPct == null
                  ? "var(--color-text)"
                  : deltaPct > 0
                    ? "#ff453a"
                    : "#30d158",
            }}
          >
            {deltaPct == null
              ? "—"
              : `${deltaPct > 0 ? "+" : ""}${Math.round(deltaPct)}%`}
          </p>
        </div>
      </div>
    </div>
  );
}
