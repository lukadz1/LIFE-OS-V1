import { useMemo, useState } from "react";
import type { PeakDoseLog, PeakFeelLog, PeakPlanItem, PeakStackItem } from "../../types";
import { clockLabel, curveValue, currentHour, moodLabel } from "../../utils/peakCurve";
import { EnergyChart, type ScrubInfo, type StackGroup } from "./EnergyChart";
import { TodaysPlan } from "./TodaysPlan";

type ChartView = "line" | "bars" | "stack";

const VIEWS: { id: ChartView; label: string }[] = [
  { id: "line", label: "LINE" },
  { id: "bars", label: "BARS" },
  { id: "stack", label: "STACK" },
];

const STACK_COLORS = [
  "rgba(240,170,90,0.85)",
  "rgba(126,200,232,0.8)",
  "rgba(200,180,232,0.8)",
  "rgba(232,200,140,0.8)",
  "rgba(232,140,160,0.8)",
];

interface EnergyCurvePanelProps {
  stack: PeakStackItem[];
  doseLogsToday: PeakDoseLog[];
  feelLogsToday: PeakFeelLog[];
  planToday: PeakPlanItem[];
  onUpsertFeel: (hour: number, value: number) => void;
  onAddPlan: (text: string) => void;
  onRemovePlan: (id: string) => void;
}

function doseHour(at: string): number {
  const d = new Date(at);
  return d.getHours() + d.getMinutes() / 60;
}

export function EnergyCurvePanel({
  stack,
  doseLogsToday,
  feelLogsToday,
  planToday,
  onUpsertFeel,
  onAddPlan,
  onRemovePlan,
}: EnergyCurvePanelProps) {
  const [view, setView] = useState<ChartView>("line");
  const [scrub, setScrub] = useState<ScrubInfo | null>(null);
  const [dragging, setDragging] = useState(false);

  const doses = useMemo(
    () => doseLogsToday.map((d) => ({ hour: doseHour(d.at), mg: d.mg })),
    [doseLogsToday],
  );

  const stackGroups: StackGroup[] = useMemo(
    () =>
      stack.map((item, i) => ({
        color: STACK_COLORS[i % STACK_COLORS.length],
        doses: doseLogsToday
          .filter((d) => d.itemId === item.id)
          .map((d) => ({ hour: doseHour(d.at), mg: d.mg })),
      })),
    [stack, doseLogsToday],
  );

  const liveScore = Math.round(curveValue(currentHour(), doses));
  const score = scrub ? Math.round(scrub.value) : liveScore;
  const mood = moodLabel(score);
  const timeLabel = scrub ? `AT ${clockLabel(scrub.hour)}` : "RIGHT NOW";
  const statusLabel = dragging ? "Logging feel" : scrub ? "Scrubbing" : "Live";
  const r = 46;
  const circ = 2 * Math.PI * r;
  const ringDash = `${((score / 100) * circ).toFixed(1)} ${circ.toFixed(1)}`;

  return (
    <div className="panel-card mt-6 rounded-[18px] bg-surface p-[22px] sm:p-[28px_30px]">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative h-[100px] w-[100px] shrink-0">
            <svg width={100} height={100} viewBox="0 0 100 100" className="-rotate-90">
              <circle cx={50} cy={50} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={7} />
              <circle
                cx={50}
                cy={50}
                r={r}
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth={7}
                strokeLinecap="round"
                strokeDasharray={ringDash}
                style={{ transition: "stroke-dasharray 400ms cubic-bezier(0.16,1,0.3,1)" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-serif text-[30px] font-semibold text-text tabular-nums">
                {score}
              </div>
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] tracking-[0.1em] text-text-dim">PEAK</div>
            <div className="font-serif text-[16px] leading-tight text-text italic">{mood}</div>
            <div className="mt-0.5 font-mono text-[10px] tracking-[0.06em] text-accent">
              {timeLabel}
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 font-mono text-[9.5px] text-text-dim">
              <span className="animate-status-pulse h-1.5 w-1.5 rounded-full bg-[#34d399]" />
              {statusLabel}
            </div>
          </div>
        </div>

        <div className="min-w-[220px] flex-1">
          <div className="font-mono text-[11px] tracking-[0.1em] text-text">
            TODAY'S ENERGY CURVE
          </div>
          <div className="mt-1.5 max-w-[340px] text-[11px] leading-relaxed text-text-dim">
            Your predicted score, hour by hour. Hover the curve to scrub, drag to
            log how you actually feel.
          </div>
        </div>

        <div className="flex items-center gap-2">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`rounded-full px-3.5 py-1.5 font-mono text-[9.5px] font-semibold tracking-[0.05em] transition-colors ${
                view === v.id
                  ? "bg-accent text-accent-contrast"
                  : "border border-white/12 text-text-dim hover:text-text"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <EnergyChart
        doses={doses}
        stackGroups={stackGroups}
        feelPoints={feelLogsToday}
        view={view}
        onLogFeel={onUpsertFeel}
        onScrub={setScrub}
        onDragStateChange={setDragging}
      />

      <TodaysPlan items={planToday} onAdd={onAddPlan} onRemove={onRemovePlan} />
    </div>
  );
}
