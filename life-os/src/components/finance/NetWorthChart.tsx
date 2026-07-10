import { useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import type { FinanceStats } from "../../hooks/useFinance";
import type { Currency, NetWorthSnapshot } from "../../types";
import { chfToCurrency, formatMoney } from "../../utils/currency";
import { isoDateDaysAgo } from "../../utils/date";

type RangeKey = "1D" | "1W" | "1M" | "1Y" | "All";
const RANGES: RangeKey[] = ["1D", "1W", "1M", "1Y", "All"];
const RANGE_DAYS: Record<Exclude<RangeKey, "All">, number> = {
  "1D": 1,
  "1W": 7,
  "1M": 30,
  "1Y": 365,
};

function filterRange(
  history: NetWorthSnapshot[],
  range: RangeKey,
): NetWorthSnapshot[] {
  if (range === "All") return history;
  const cutoff = isoDateDaysAgo(RANGE_DAYS[range]);
  return history.filter((h) => h.date >= cutoff);
}

function formatPct(pct: number | null): string {
  if (pct == null) return "-";
  const rounded = Math.round(pct * 10) / 10;
  return `${rounded >= 0 ? "+" : ""}${rounded}%`;
}

interface NetWorthChartProps {
  history: NetWorthSnapshot[];
  stats: FinanceStats;
  currency: Currency;
  className?: string;
}

export function NetWorthChart({
  history,
  stats,
  currency,
  className = "",
}: NetWorthChartProps) {
  const [range, setRange] = useState<RangeKey>("All");
  const chartData = filterRange(history, range).map((h) => ({
    date: h.date,
    value: chfToCurrency(h.valueChf, currency),
  }));
  const hasData = chartData.length > 1;

  return (
    <div
      className={`panel-card flex flex-col rounded-[22px] bg-surface p-5 ${className}`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] tracking-[0.14em] text-text-dim uppercase">
          All-time
        </p>
        <div className="flex rounded-[9px] bg-field p-[2px] font-mono text-[11px]">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-[7px] px-2.5 py-1 font-medium transition-colors ${
                range === r
                  ? "bg-accent text-accent-contrast"
                  : "text-text-dim hover:text-text"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="flex h-[170px] items-center justify-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 4, bottom: 0, left: 4 }}
            >
              <defs>
                <linearGradient id="net-worth-fill" x1="0" y1="0" x2="0" y2="1">
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
              <YAxis domain={["dataMin", "dataMax"]} hide />
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
                  Math.round(Number(value)).toLocaleString(),
                  "Net worth",
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
                fill="url(#net-worth-fill)"
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="max-w-[240px] text-center text-[13px] text-text-dim italic">
            Add or edit an asset to start tracking net worth over time.
          </p>
        )}
      </div>

      <div className="mt-2 grid grid-cols-2 gap-3 border-t border-border pt-3 sm:grid-cols-4">
        <Stat label="1D change" value={formatPct(stats.oneDayChangePct)} />
        <Stat
          label="All-time high"
          value={
            stats.allTimeHigh != null
              ? formatMoney(stats.allTimeHigh, currency)
              : "-"
          }
        />
        <Stat
          label="All-time low"
          value={
            stats.allTimeLow != null
              ? formatMoney(stats.allTimeLow, currency)
              : "-"
          }
        />
        <Stat label="Snapshots" value={String(stats.snapshotCount)} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="truncate font-mono text-[10px] tracking-wide text-text-dim uppercase">
        {label}
      </p>
      <p className="mt-0.5 truncate font-mono text-[13px] font-medium text-text">
        {value}
      </p>
    </div>
  );
}
