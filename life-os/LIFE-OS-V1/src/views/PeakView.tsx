import { DashboardGrid } from "../components/layout/DashboardGrid";
import { Panel } from "../components/layout/Panel";
import { EnergyGraph } from "../components/peak/EnergyGraph";
import { PeakAdviceCard } from "../components/peak/PeakAdviceCard";
import { VitalsCard } from "../components/peak/VitalsCard";
import { usePeakTracker } from "../hooks/usePeakTracker";
import { formatHourLabel } from "../utils/peakEngine";

export function PeakView() {
  const { loading, vitals, result } = usePeakTracker();

  if (loading || !vitals || !result) {
    return (
      <div className="py-16 text-center text-sm text-text-dim">
        Syncing today's vitals…
      </div>
    );
  }

  return (
    <DashboardGrid>
      <Panel
        title="Peak Tracker"
        subtitle="Today's energy curve"
        className="lg:col-span-8"
      >
        <EnergyGraph
          curve={result.curve}
          focusStartHour={result.focusStartHour}
          focusEndHour={result.focusEndHour}
          breakHour={result.breakHour}
        />
        <div className="mt-2 grid grid-cols-2 gap-3 border-t border-border pt-3">
          <div>
            <p className="font-mono text-[10px] tracking-wide text-text-dim uppercase">
              Best focus window
            </p>
            <p className="mt-0.5 font-mono text-[13px] font-medium text-accent">
              {formatHourLabel(result.focusStartHour)}–
              {formatHourLabel(result.focusEndHour)}
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-wide text-text-dim uppercase">
              Suggested break
            </p>
            <p className="mt-0.5 font-mono text-[13px] font-medium text-[#ff9f0a]">
              {formatHourLabel(result.breakHour)}
            </p>
          </div>
        </div>
      </Panel>
      <VitalsCard vitals={vitals} className="lg:col-span-4" />
      <PeakAdviceCard advice={result.advice} className="lg:col-span-12" />
    </DashboardGrid>
  );
}
