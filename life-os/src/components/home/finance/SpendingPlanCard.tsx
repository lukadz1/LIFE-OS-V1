import type { Currency, Transaction } from "../../../types";
import { formatMoney } from "../../../utils/currency";
import { currentMonthKey, monthKey } from "../../../utils/spendingEngine";

const SPENT_COLOR = "#fb5607"; // accent
const AVAILABLE_COLOR = "#34d399";
const OVER_COLOR = "#ff453a";

interface SpendingPlanCardProps {
  transactions: Transaction[];
  currency: Currency;
  /** The single monthly budget set in Finance; null = not set yet. */
  budgetChf: number | null;
  className?: string;
}

/** Home summary of the one-number budget: what's left of the monthly budget
 * after everything spent so far. */
export function SpendingPlanCard({
  transactions,
  currency,
  budgetChf,
  className = "",
}: SpendingPlanCardProps) {
  const month = currentMonthKey();
  const now = new Date();
  const monthLabel = now
    .toLocaleDateString(undefined, { month: "long", year: "numeric" })
    .toUpperCase();

  const spentChf = transactions
    .filter((t) => monthKey(t.date) === month)
    .reduce((sum, t) => sum + t.amountChf, 0);

  const hasBudget = budgetChf != null && budgetChf > 0;
  const leftChf = hasBudget ? budgetChf - spentChf : 0;
  const over = hasBudget && leftChf < 0;
  const availableChf = Math.max(0, leftChf);

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - now.getDate() + 1;
  const perDayChf = daysLeft > 0 ? availableChf / daysLeft : availableChf;

  const size = 156;
  const strokeWidth = 19;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const ringTotal = hasBudget ? Math.max(budgetChf, spentChf) : 0;
  const segments = hasBudget
    ? [
        {
          key: "spent",
          label: "Spent",
          value: spentChf,
          color: over ? OVER_COLOR : SPENT_COLOR,
        },
        { key: "available", label: "Available", value: availableChf, color: AVAILABLE_COLOR },
      ].filter((s) => s.value > 0)
    : [];

  let cumulative = 0;

  return (
    <div className={`panel-card flex flex-col rounded-[22px] bg-surface p-5 ${className}`}>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-sans text-[22px] text-text">Spending Plan</h3>
        <span className="font-mono text-[11px] tracking-[0.14em] text-text-dim uppercase">
          {monthLabel}
        </span>
      </div>

      {!hasBudget ? (
        <p className="max-w-[32ch] py-6 text-[13px] text-text-dim">
          Set your monthly budget in Finance to see what's left to spend here.
        </p>
      ) : (
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex shrink-0 flex-col items-center gap-3">
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              role="img"
              aria-label="Monthly budget progress"
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
                  const pct = ringTotal > 0 ? s.value / ringTotal : 0;
                  const dash = pct * circumference;
                  const offset = -cumulative;
                  cumulative += dash;
                  return (
                    <circle
                      key={s.key}
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      fill="none"
                      stroke={s.color}
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
                fontSize={16}
                fontWeight={600}
                style={{ fill: "var(--color-text)", fontFamily: "var(--font-mono)" }}
              >
                {formatMoney(availableChf, currency)}
              </text>
              <text
                x={size / 2}
                y={size / 2 + 14}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={10}
                style={{ fill: "var(--color-text-dim)", fontFamily: "var(--font-mono)" }}
              >
                available
              </text>
            </svg>

            <div className="flex w-full flex-col gap-1.5">
              {segments.map((s) => (
                <div key={s.key} className="flex items-center justify-between gap-3 text-[12px]">
                  <span className="flex items-center gap-1.5 text-text-dim">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    {s.label}
                  </span>
                  <span className="shrink-0 font-mono text-text">
                    {formatMoney(s.value, currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-mono text-[11px] tracking-[0.14em] text-text-dim uppercase">
              {over ? "Over budget" : "Available to spend"}
            </p>
            <p
              className="mt-0.5 font-sans text-[36px] leading-none"
              style={{ color: over ? OVER_COLOR : "var(--color-text)" }}
            >
              {formatMoney(over ? Math.abs(leftChf) : availableChf, currency)}
            </p>
            <p className="mt-2 text-[12.5px] text-text-dim">
              {over
                ? `${formatMoney(spentChf, currency)} spent of your ${formatMoney(budgetChf, currency)} budget`
                : daysLeft > 0
                  ? `${formatMoney(perDayChf, currency)} per day for the rest of the month`
                  : "Month closed out"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
