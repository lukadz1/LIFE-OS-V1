import type { Currency } from "../../../types";
import { formatMoney } from "../../../utils/currency";
import { BUCKETS, BUCKET_META, type BucketTotals } from "../../../utils/spendingEngine";

interface BucketSummaryProps {
  totals: BucketTotals;
  currency: Currency;
}

export function BucketSummary({ totals, currency }: BucketSummaryProps) {
  const grand = totals.fixed + totals.variable + totals.savings;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {BUCKETS.map((bucket) => {
        const meta = BUCKET_META[bucket];
        const value = totals[bucket];
        const actualPct = grand > 0 ? (value / grand) * 100 : 0;
        const barPct = Math.min(100, actualPct);
        return (
          <div
            key={bucket}
            className="panel-card rounded-[22px] bg-surface p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: meta.color }}
                />
                <h3 className="font-serif text-[19px] text-text italic">
                  {meta.label}
                </h3>
              </div>
              <span className="font-mono text-[10px] tracking-wide text-text-dim uppercase">
                {meta.hint}
              </span>
            </div>

            <p className="mt-3 font-mono text-[22px] text-text">
              {formatMoney(value, currency)}
            </p>

            <div className="mt-3">
              <div className="h-2 overflow-hidden rounded-full bg-gauge-track">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${barPct}%`, backgroundColor: meta.color }}
                />
              </div>
              <div className="mt-1.5 flex justify-between font-mono text-[11px] text-text-dim">
                <span className="text-text">{Math.round(actualPct)}% actual</span>
                <span>target {meta.targetPct}%</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
