import { ArrowRight } from "lucide-react";
import type { Currency, SpendCategory, Transaction } from "../../../types";
import { formatMoney } from "../../../utils/currency";
import { formatPastDate, isoDateDaysAgo } from "../../../utils/date";

const WINDOW_DAYS = 6; // "since <weekday>" spans a 7-day window incl. today
const MAX_ROWS = 6;

interface RecentActivityCardProps {
  transactions: Transaction[];
  categories: SpendCategory[];
  currency: Currency;
  onViewAll: () => void;
  className?: string;
}

export function RecentActivityCard({
  transactions,
  categories,
  currency,
  onViewAll,
  className = "",
}: RecentActivityCardProps) {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const cutoff = isoDateDaysAgo(WINDOW_DAYS);
  const recent = transactions
    .filter((t) => t.date >= cutoff)
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  const total = recent.reduce((sum, t) => sum + t.amountChf, 0);
  const rangeStart = new Date(`${cutoff}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
  });

  return (
    <div className={`panel-card flex flex-col rounded-[22px] bg-surface p-5 ${className}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-sans text-[26px] leading-none text-text">
            {formatMoney(total, currency)} spent
          </h3>
          <p className="mt-1.5 text-[12.5px] text-text-dim">since {rangeStart}</p>
        </div>
        <button
          onClick={onViewAll}
          className="flex shrink-0 items-center gap-1 font-mono text-[11px] tracking-wide text-text-dim uppercase transition-colors hover:text-text"
        >
          View all
          <ArrowRight size={12} />
        </button>
      </div>

      {recent.length === 0 ? (
        <p className="py-6 text-[13px] text-text-dim">
          No transactions logged this week.
        </p>
      ) : (
        <div className="flex flex-col border-t border-border">
          {recent.slice(0, MAX_ROWS).map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between gap-3 border-b border-border py-2.5 last:border-0"
            >
              <div className="min-w-0">
                <p className="truncate text-[14.5px] text-text">{t.description}</p>
                <p className="mt-0.5 truncate text-xs text-text-dim">
                  {t.categoryId ? (byId.get(t.categoryId)?.name ?? "Uncategorized") : "Uncategorized"}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-mono text-[13.5px] text-text">
                  {formatMoney(t.amountChf, currency)}
                </p>
                <p className="mt-0.5 text-xs text-text-dim">{formatPastDate(t.date)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
