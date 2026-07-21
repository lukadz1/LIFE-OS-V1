import { Plus } from "lucide-react";
import {
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AddFoodSheet } from "../components/calories/AddFoodSheet";
import { CalorieSummary } from "../components/calories/CalorieSummary";
import { FoodLogList } from "../components/calories/FoodLogList";
import { MacroBreakdown } from "../components/calories/MacroBreakdown";
import { WeekStrip } from "../components/calories/WeekStrip";
import { WeightHeader } from "../components/calories/WeightHeader";
import { WeightHistoryChart } from "../components/calories/WeightHistoryChart";
import { useCalories } from "../hooks/useCalories";
import { useWeightTracker } from "../hooks/useWeightTracker";
import { isSameDay } from "../utils/date";

const PAGES = ["tracker", "progress"] as const;
type PageId = (typeof PAGES)[number];
const PAGE_LABELS: Record<PageId, string> = {
  tracker: "tracker",
  progress: "progress",
};

const SWIPE_THRESHOLD_PX = 12;

export function CaloriesView() {
  const calories = useCalories();
  const weight = useWeightTracker();
  const [page, setPage] = useState<PageId>("tracker");
  const [sheetOpen, setSheetOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    startX: number;
    startY: number;
    horizontal: boolean | null;
  } | null>(null);
  const [dragPx, setDragPx] = useState(0);
  const [dragging, setDragging] = useState(false);

  const pageIndex = PAGES.indexOf(page);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragState.current = { startX: e.clientX, startY: e.clientY, horizontal: null };
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const state = dragState.current;
    if (!state) return;
    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;

    if (state.horizontal === null) {
      if (Math.abs(dx) < SWIPE_THRESHOLD_PX && Math.abs(dy) < SWIPE_THRESHOLD_PX) return;
      state.horizontal = Math.abs(dx) > Math.abs(dy);
      if (state.horizontal) {
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          /* pointer capture is best-effort */
        }
        setDragging(true);
      }
    }
    if (state.horizontal) setDragPx(dx);
  };

  const endDrag = () => {
    const state = dragState.current;
    dragState.current = null;
    if (!state?.horizontal) {
      setDragging(false);
      setDragPx(0);
      return;
    }
    const width = containerRef.current?.clientWidth || 1;
    const threshold = width * 0.18;
    if (dragPx < -threshold && pageIndex < PAGES.length - 1) {
      setPage(PAGES[pageIndex + 1]);
    } else if (dragPx > threshold && pageIndex > 0) {
      setPage(PAGES[pageIndex - 1]);
    }
    setDragging(false);
    setDragPx(0);
  };

  const trackTransform = `translateX(calc(${-(100 / PAGES.length) * pageIndex}% + ${dragPx}px))`;

  const loading = calories.loading || weight.loading;

  return (
    <div className="animate-view-in-right motion-reduce:animate-none">
      <div className="mb-5 inline-flex rounded-full border border-border p-1">
        {PAGES.map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`rounded-full px-5 py-2 font-serif text-[18px] lowercase italic transition-colors ${
              page === p ? "bg-white/10 text-text" : "text-text-dim"
            }`}
          >
            {PAGE_LABELS[p]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-text-dim">
          Loading your calorie tracker…
        </div>
      ) : (
        <div ref={containerRef} className="overflow-clip">
          <div
            className="flex touch-pan-y select-none"
            style={{
              width: `${PAGES.length * 100}%`,
              transform: trackTransform,
              transition: dragging
                ? "none"
                : "transform 320ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            <div style={{ width: `${100 / PAGES.length}%` }} className="shrink-0 pr-1">
              <TrackerPage
                calories={calories}
                onAddFood={() => setSheetOpen(true)}
              />
            </div>
            <div style={{ width: `${100 / PAGES.length}%` }} className="shrink-0 pl-1">
              <ProgressPage weight={weight} />
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-center gap-1.5">
        {PAGES.map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            aria-label={`Go to ${PAGE_LABELS[p]} page`}
            className={`h-1.5 rounded-full transition-all ${
              page === p ? "w-5 bg-accent" : "w-1.5 bg-border"
            }`}
          />
        ))}
      </div>

      {sheetOpen && (
        <AddFoodSheet
          onClose={() => setSheetOpen(false)}
          onSave={(entry) => {
            calories.addEntry(entry);
            setSheetOpen(false);
          }}
        />
      )}
    </div>
  );
}

function TrackerPage({
  calories,
  onAddFood,
}: {
  calories: ReturnType<typeof useCalories>;
  onAddFood: () => void;
}) {
  const { goals, selectedDate, setSelectedDate, entriesForDay, totals, deleteEntry, setGoals } =
    calories;
  if (!goals) return null;

  return (
    <div className="panel-card flex flex-col gap-6 rounded-[22px] bg-surface p-5">
      <WeekStrip
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
        hasEntries={(d) => calories.entries.some((e) => isSameDay(new Date(e.at), d))}
      />

      <div className="border-t border-border pt-5">
        <CalorieSummary
          eaten={totals.kcal}
          goal={goals.kcalGoal}
          onGoalChange={(v) => setGoals({ ...goals, kcalGoal: Math.max(0, v) })}
        />
      </div>

      <div className="border-t border-border pt-5">
        <MacroBreakdown
          protein={totals.proteinG}
          carbs={totals.carbsG}
          fat={totals.fatG}
          proteinGoal={goals.proteinGoal}
          carbsGoal={goals.carbsGoal}
          fatGoal={goals.fatGoal}
          onProteinGoalChange={(v) => setGoals({ ...goals, proteinGoal: v })}
          onCarbsGoalChange={(v) => setGoals({ ...goals, carbsGoal: v })}
          onFatGoalChange={(v) => setGoals({ ...goals, fatGoal: v })}
        />
      </div>

      <div className="border-t border-border pt-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-serif text-[19px] text-text italic">Food log</h3>
          <button
            onClick={onAddFood}
            className="flex items-center gap-1 rounded-full bg-accent/15 px-3 py-1.5 text-[13px] font-medium text-accent transition-colors hover:bg-accent/25"
          >
            <Plus size={14} strokeWidth={2.5} />
            Add food
          </button>
        </div>
        <FoodLogList entries={entriesForDay} onDelete={deleteEntry} />
      </div>
    </div>
  );
}

function ProgressPage({ weight }: { weight: ReturnType<typeof useWeightTracker> }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="panel-card rounded-[22px] bg-surface p-5">
        <WeightHeader
          latestKg={weight.latest?.weightKg ?? null}
          deltaKg={weight.delta}
          onLog={weight.logWeight}
        />
      </div>
      <WeightHistoryChart entries={weight.entries} />
    </div>
  );
}
