import { Coffee } from "lucide-react";
import { formatTimeLabel } from "../../utils/date";
import { Panel } from "../layout/Panel";

const SOFT_LIMIT = 3;
const CUTOFF_HOUR = 14;

interface CaffeineCardProps {
  count: number;
  lastAt: string | null;
  onLog: (label: string) => void;
  className?: string;
}

export function CaffeineCard({
  count,
  lastAt,
  onLog,
  className = "",
}: CaffeineCardProps) {
  const lastHour = lastAt ? new Date(lastAt).getHours() : null;
  const showWarning =
    count > SOFT_LIMIT || (lastHour != null && lastHour >= CUTOFF_HOUR);

  return (
    <Panel title="Caffeine" subtitle="Intake & timing" className={className}>
      <div className="flex flex-col items-center gap-3">
        <div className="text-center">
          <p className="font-mono text-[40px] leading-none font-semibold text-text">
            {count}
          </p>
          <p className="mt-1.5 text-xs text-text-dim">
            {lastAt ? `Last at ${formatTimeLabel(lastAt)}` : "None yet today"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onLog("Coffee")}
            className="flex items-center gap-1.5 rounded-full bg-accent/15 px-3.5 py-1.5 text-[13px] font-medium text-accent transition-colors hover:bg-accent/25"
          >
            <Coffee size={14} />
            Coffee
          </button>
          <button
            onClick={() => onLog("Tea")}
            className="rounded-full bg-field px-3.5 py-1.5 text-[13px] font-medium text-text-dim transition-colors hover:text-text"
          >
            Tea
          </button>
        </div>
        {showWarning && (
          <p className="text-center text-[11px] text-[#ff9f0a]">
            Might affect your sleep tonight
          </p>
        )}
      </div>
    </Panel>
  );
}
