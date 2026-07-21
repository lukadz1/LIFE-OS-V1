import type { VitalsToday } from "../../types";
import { Panel } from "../layout/Panel";

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 last:border-0">
      <span className="text-sm text-text-dim">{label}</span>
      <span className="text-right">
        <span className="font-mono text-[15px] font-medium text-text">
          {value}
        </span>
        {sub && (
          <span className="ml-1.5 font-mono text-xs text-text-dim">{sub}</span>
        )}
      </span>
    </div>
  );
}

export function VitalsCard({
  vitals,
  className = "",
}: {
  vitals: VitalsToday;
  className?: string;
}) {
  return (
    <Panel title="Vitals" subtitle="From today's sync" className={className}>
      <div>
        <Stat
          label="Body Battery"
          value={`${vitals.bodyBatteryWake}`}
          sub="/ 100 at wake"
        />
        <Stat
          label="HRV"
          value={`${vitals.hrv} ms`}
          sub={`baseline ${vitals.hrvBaseline}`}
        />
        <Stat
          label="Sleep"
          value={`${vitals.sleepHours}h`}
          sub={`${vitals.sleepQuality}/100`}
        />
        <Stat label="Resting HR" value={`${vitals.restingHr} bpm`} />
        <Stat label="Stress" value={`${vitals.stressLevel}/100`} />
      </div>
    </Panel>
  );
}
