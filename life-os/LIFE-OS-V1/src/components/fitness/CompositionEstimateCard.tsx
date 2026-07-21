import type { CompositionEstimate } from "../../utils/fitnessEngine";

const TONE_COLOR = {
  good: "text-[#30d158]",
  warn: "text-[#ff9f0a]",
  bad: "text-[#ff453a]",
} as const;

export function CompositionEstimateCard({
  estimate,
}: {
  estimate: CompositionEstimate | null;
}) {
  if (!estimate) {
    return (
      <p className="py-4 text-center text-sm text-text-dim italic">
        Log weight for a few more days to estimate composition.
      </p>
    );
  }

  return (
    <div className="rounded-[14px] bg-field p-4">
      <p className="mb-2 font-mono text-[10px] tracking-wide text-text-dim uppercase">
        30-day composition estimate
      </p>
      <p className={`mb-3 text-[15px] font-medium ${TONE_COLOR[estimate.tone]}`}>
        {estimate.headline}
      </p>
      <div className="mb-2 flex h-2.5 overflow-hidden rounded-full bg-black/20">
        <div
          className="h-full bg-[#30d158]"
          style={{ width: `${estimate.musclePct}%` }}
        />
        <div
          className="h-full bg-[#ff9f0a]"
          style={{ width: `${estimate.fatPct}%` }}
        />
      </div>
      <div className="flex items-center justify-between font-mono text-xs text-text-dim">
        <span>~{estimate.musclePct}% muscle</span>
        <span>~{estimate.fatPct}% fat</span>
      </div>
    </div>
  );
}
