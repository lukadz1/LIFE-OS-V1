import { useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeightEntry } from "../../types";
import { isoDateDaysAgo } from "../../utils/date";

type RangeKey = "90T" | "6M" | "1J" | "ALL";
const RANGES: RangeKey[] = ["90T", "6M", "1J", "ALL"];
const RANGE_DAYS: Record<Exclude<RangeKey, "ALL">, number> = {
  "90T": 90,
  "6M": 182,
  "1J": 365,
};

function filterRange(entries: WeightEntry[], range: RangeKey): WeightEntry[] {
  if (range === "ALL") return entries;
  const cutoff = isoDateDaysAgo(RANGE_DAYS[range]);
  return entries.filter((e) => e.at.slice(0, 10) >= cutoff);
}

export function WeightHistoryChart({ entries }: { entries: WeightEntry[] }) {
  const [range, setRange] = useState<RangeKey>("90T");
  const data = filterRange(entries, range);
  const hasData = data.length > 1;

  return (
    <div className="panel-card flex flex-col rounded-[22px] bg-surface p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-[21px] font-normal tracking-[-0.01em] text-text italic">
            Weighthistory
          </h2>
        </div>
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

      <div className="flex h-[220px] items-center justify-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
              <defs>
                <linearGradient id="weight-history-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.35} />
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
                formatter={(value) => [`${value} kg`, "Weight"]}
                labelFormatter={(label) =>
                  new Date(String(label)).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                }
              />
              <Area
                type="monotone"
                dataKey="weightKg"
                stroke="var(--color-accent)"
                strokeWidth={2}
                fill="url(#weight-history-fill)"
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="max-w-[240px] text-center text-[13px] text-text-dim italic">
            Log a few more weigh-ins to see your history here.
          </p>
        )}
      </div>
    </div>
  );
}
