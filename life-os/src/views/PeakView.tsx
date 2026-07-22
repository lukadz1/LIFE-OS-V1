import { useState } from "react";
import { EnergyCurvePanel } from "../components/peak/EnergyCurvePanel";
import { ScheduleSection } from "../components/peak/ScheduleSection";
import { StackGrid } from "../components/peak/StackGrid";
import { usePeakTracker } from "../hooks/usePeakTracker";

export function PeakView() {
  const {
    loading,
    stack,
    doseLogsToday,
    feelLogsToday,
    planToday,
    eventsToday,
    addStackItem,
    removeStackItem,
    updateStackItemMg,
    logDose,
    upsertFeel,
    addPlanItem,
    removePlanItem,
  } = usePeakTracker();
  const [setupOpen, setSetupOpen] = useState(false);

  const dateLabel = new Date()
    .toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-text-dim">
        Loading today's peak…
      </div>
    );
  }

  return (
    <div>
      <div className="pt-1 pb-2">
        <h1 className="font-serif text-[38px] leading-none font-semibold tracking-tight sm:text-[52px]">
          Your <em className="text-accent">peak</em> today
        </h1>
        <p className="mt-3.5 font-mono text-[11px] tracking-[0.1em] text-text-dim">
          {dateLabel}
        </p>
      </div>

      <div className="mt-8">
        <StackGrid
          stack={stack}
          setupOpen={setupOpen}
          onToggleSetup={() => setSetupOpen((v) => !v)}
          onLog={logDose}
          onRemove={removeStackItem}
          onUpdateMg={updateStackItemMg}
          onAdd={addStackItem}
        />
      </div>

      <EnergyCurvePanel
        stack={stack}
        doseLogsToday={doseLogsToday}
        feelLogsToday={feelLogsToday}
        planToday={planToday}
        onUpsertFeel={upsertFeel}
        onAddPlan={addPlanItem}
        onRemovePlan={removePlanItem}
      />

      <ScheduleSection events={eventsToday} />

      <p className="mt-11 text-center font-mono text-[10px] tracking-[0.08em] text-text-dim/70">
        ● LIVE · LOG A DOSE AND WATCH YOUR CURVE LIFT
      </p>
    </div>
  );
}
