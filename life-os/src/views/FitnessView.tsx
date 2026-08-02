import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Dumbbell,
  History as HistoryIcon,
  Info,
  LayoutGrid,
  MoreHorizontal,
  Pencil,
  Plus,
  Repeat,
  Search,
  Settings,
  SlidersHorizontal,
  Star,
  Undo2,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { getExerciseInfo } from "../data/exerciseInfo";
import { useExercises } from "../hooks/useExercises";
import type { Exercise, SetLog, SplitDay } from "../types";
import { createId } from "../utils/id";

const MINT = "#34d399";
const AMBER = "#f59e0b";
const MISS = "#ff6b5b";
// Every prescribed exercise card asks for this many working sets — a fixed
// scheme (not a real progression program), just enough to drive the
// hit-it/miss checklist shown while a session is live.
const TARGET_SET_COUNT = 4;

// ---------- small helpers ----------
const ROMAN: [string, number][] = [
  ["x", 10],
  ["ix", 9],
  ["v", 5],
  ["iv", 4],
  ["i", 1],
];
function toRoman(n: number): string {
  let out = "";
  for (const [sym, val] of ROMAN) {
    while (n >= val) {
      out += sym;
      n -= val;
    }
  }
  return out || "i";
}
function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, "");
}
const epley = (w: number, r: number) => w * (1 + r / 30);
function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function setsFor(logs: SetLog[], id: string): SetLog[] {
  return logs
    .filter((s) => s.exerciseId === id)
    .sort((a, b) => +new Date(a.at) - +new Date(b.at));
}
function best1RM(sets: SetLog[]): number {
  return sets.reduce((m, s) => Math.max(m, epley(s.weight, s.reps)), 0);
}
function bestSet(sets: SetLog[]): SetLog | null {
  if (!sets.length) return null;
  return sets.reduce((b, s) =>
    epley(s.weight, s.reps) > epley(b.weight, b.reps) ? s : b,
  );
}
interface SessionPoint {
  ts: number;
  value: number;
  set: SetLog;
}
// One point per day: that session's top set (highest estimated 1RM).
function perDayTop(sets: SetLog[]): SessionPoint[] {
  const map: Record<string, SessionPoint> = {};
  for (const s of sets) {
    const k = dayKey(s.at);
    const v = epley(s.weight, s.reps);
    if (!map[k] || v > map[k].value) map[k] = { ts: +new Date(s.at), value: v, set: s };
  }
  return Object.values(map).sort((a, b) => a.ts - b.ts);
}
// How many of the most recent consecutive sessions each beat the one before it.
function beatStreak(series: SessionPoint[]): number {
  let streak = 0;
  for (let i = series.length - 1; i > 0; i--) {
    if (series[i].value > series[i - 1].value + 0.001) streak++;
    else break;
  }
  return streak;
}

// ---------- session grading ----------
type Grade = "pr" | "beat" | "below" | "first";

interface Baseline {
  all: number; // best estimated 1RM ever, before this session
  last: number; // best estimated 1RM of the most recent past session
  has: boolean;
}
function baselineFor(history: SetLog[]): Baseline {
  if (!history.length) return { all: 0, last: 0, has: false };
  const days = perDayTop(history);
  return { all: best1RM(history), last: days[days.length - 1].value, has: true };
}
function gradeValue(v: number, base: Baseline): Grade {
  if (!base.has) return "first";
  if (v > base.all + 0.01) return "pr";
  if (v > base.last + 0.01) return "beat";
  return "below";
}
const gradeRank: Record<Grade, number> = { pr: 3, beat: 2, below: 1, first: 0 };

// A draft session: exercises with the sets logged under each, before "finish".
interface SessionSet {
  id: string;
  weight: number;
  reps: number;
}
interface SessionEntry {
  exerciseId: string;
  sets: SessionSet[];
}

const DRAFT_KEY = "life-os:fitness:draft-session";
function loadDraft(): SessionEntry[] {
  try {
    const raw = JSON.parse(localStorage.getItem(DRAFT_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

interface CelebrationItem {
  name: string;
  setCount: number;
  top: SessionSet;
  grade: Grade;
}
interface Celebration {
  items: CelebrationItem[];
  beats: number;
  prs: number;
  totalSets: number;
}

const SUGGESTIONS = [
  "Back Squat",
  "Bench Press",
  "Deadlift",
  "Overhead Press",
  "Pull-up",
];
const UNIT = "kg";

// Curated exercise catalog, grouped by muscle. The classics, useful from minute one.
const LIBRARY: { group: string; items: string[] }[] = [
  {
    group: "Chest",
    items: [
      "Bench Press",
      "Incline Bench Press",
      "Dumbbell Bench Press",
      "Chest Fly",
      "Cable Crossover",
      "Push-up",
      "Dip",
    ],
  },
  {
    group: "Back",
    items: [
      "Deadlift",
      "Barbell Row",
      "Pull-up",
      "Chin-up",
      "Lat Pulldown",
      "Seated Cable Row",
      "T-Bar Row",
    ],
  },
  {
    group: "Legs",
    items: [
      "Back Squat",
      "Front Squat",
      "Romanian Deadlift",
      "Leg Press",
      "Walking Lunge",
      "Leg Extension",
      "Leg Curl",
      "Calf Raise",
    ],
  },
  {
    group: "Shoulders",
    items: [
      "Overhead Press",
      "Dumbbell Shoulder Press",
      "Arnold Press",
      "Lateral Raise",
      "Rear Delt Fly",
      "Upright Row",
      "Face Pull",
    ],
  },
  {
    group: "Arms",
    items: [
      "Barbell Curl",
      "Dumbbell Curl",
      "Hammer Curl",
      "Preacher Curl",
      "Tricep Pushdown",
      "Skull Crusher",
      "Close-Grip Bench Press",
    ],
  },
  {
    group: "Core",
    items: [
      "Plank",
      "Hanging Leg Raise",
      "Cable Crunch",
      "Ab Wheel Rollout",
      "Russian Twist",
    ],
  },
];

// Rough heuristic so a fresh lift gets a sensible rest of its own straight
// away: big barbell/compound moves default to a longer rest than accessories.
const LONG_REST_HINTS = [
  "squat",
  "deadlift",
  "press",
  "row",
  "pull-up",
  "pullup",
  "chin-up",
];
function defaultRestSeconds(name: string): number {
  const n = name.toLowerCase();
  return LONG_REST_HINTS.some((hint) => n.includes(hint)) ? 120 : 75;
}

// Defaults for the fields the editorial UI doesn't expose.
function newExercise(name: string): Omit<Exercise, "id"> {
  return {
    name,
    gymId: "both",
    dayId: "push",
    repMin: 5,
    repMax: 8,
    step: 2.5,
    startWeight: 20,
    bodyweight: false,
    restSeconds: defaultRestSeconds(name),
  };
}

type Screen =
  | { name: "days" }
  | { name: "day"; dayId: string }
  | { name: "list" }
  | { name: "library"; dayId: string }
  | { name: "celebrate" }
  | { name: "chart" | "history"; id: string };
type Sheet =
  | { mode: "log"; id: string }
  | { mode: "add" }
  | { mode: "swap"; id: string }
  | { mode: "tune"; id: string }
  | { mode: "add-day"; editId?: string }
  | { mode: "info"; name: string }
  | null;
type ToastKind = "mint" | "amber" | "neutral";

interface RestTimerState {
  exerciseId: string;
  exerciseName: string;
  endsAt: number;
}

export function FitnessView() {
  const {
    loading,
    exercises,
    setLogs,
    splitDays,
    addExercise,
    renameExercise,
    updateExercise,
    deleteExercise,
    logSet,
    deleteSet,
    addSplitDay,
    renameSplitDay,
    deleteSplitDay,
    setDayExercise,
    reorderDayExercises,
  } = useExercises();

  const [screen, setScreen] = useState<Screen>({ name: "days" });
  // Where "back" on the chart/history screens should land — the list, or
  // whichever day session opened them.
  const [historyReturn, setHistoryReturn] = useState<Screen>({ name: "list" });
  const [sheet, setSheet] = useState<Sheet>(null);
  const [toast, setToast] = useState<{ msg: string; kind: ToastKind } | null>(
    null,
  );
  const toastTimer = useRef<number | undefined>(undefined);
  // Which exercise just beat its best — lights its "best" badge up in mint.
  const [celebrateId, setCelebrateId] = useState<string | null>(null);
  const celebrateTimer = useRef<number | undefined>(undefined);
  // Today's in-progress session (drafts until "finish"), persisted across reloads.
  const [session, setSession] = useState<SessionEntry[]>(loadDraft);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  // Rest timer for the lift most recently logged — arms itself on every set,
  // ticks live, and floats above whichever fitness screen is open.
  const [restTimer, setRestTimer] = useState<RestTimerState | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(session));
    } catch {
      /* storage best-effort */
    }
  }, [session]);

  const showToast = (msg: string, kind: ToastKind = "neutral") => {
    setToast({ msg, kind });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 1900);
  };

  const byId = useMemo(
    () => Object.fromEntries(exercises.map((e) => [e.id, e])) as Record<
      string,
      Exercise
    >,
    [exercises],
  );

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-text-dim">
        Loading your training log…
      </div>
    );
  }

  // Rest timer arms itself the instant a set lands — using that lift's own
  // rest length — and replaces whatever timer was already running.
  const armRest = (exerciseId: string) => {
    const ex = byId[exerciseId];
    if (!ex) return;
    const seconds = ex.restSeconds ?? defaultRestSeconds(ex.name);
    setRestTimer({
      exerciseId,
      exerciseName: ex.name,
      endsAt: Date.now() + seconds * 1000,
    });
  };

  // ---------- library actions ----------
  const doAdd = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addExercise(newExercise(trimmed));
    setSheet(null);
    showToast("added");
  };
  const doLog = (id: string, w: number, r: number) => {
    const prev = best1RM(setsFor(setLogs, id));
    logSet(id, w, r);
    setSheet(null);
    armRest(id);
    const isPR = setsFor(setLogs, id).length > 0 && epley(w, r) > prev + 0.01;
    try {
      navigator.vibrate?.(isPR ? [10, 40, 20] : 12);
    } catch {
      /* no haptics */
    }
    if (isPR) {
      setCelebrateId(id);
      window.clearTimeout(celebrateTimer.current);
      celebrateTimer.current = window.setTimeout(() => setCelebrateId(null), 4200);
    }
    showToast(
      isPR ? `new best · ${Math.round(epley(w, r))}${UNIT}` : "logged",
      isPR ? "mint" : "neutral",
    );
  };
  const doSwap = (id: string, name: string) => {
    if (!name.trim()) return;
    renameExercise(id, name.trim());
    setSheet(null);
    showToast("swapped");
  };
  const doRemoveExercise = (id: string) => {
    deleteExercise(id);
    setSheet(null);
    setSession((prev) => prev.filter((e) => e.exerciseId !== id));
    if (screen.name === "chart" || screen.name === "history") {
      setScreen({ name: "list" });
    }
    showToast("retired");
  };

  // ---------- session actions ----------
  const logIntoSession = (exId: string, w: number, r: number) => {
    const grade = gradeValue(epley(w, r), baselineFor(setsFor(setLogs, exId)));
    setSession((prev) => {
      const set: SessionSet = { id: createId(), weight: w, reps: r };
      const i = prev.findIndex((e) => e.exerciseId === exId);
      if (i === -1) return [...prev, { exerciseId: exId, sets: [set] }];
      return prev.map((e, j) =>
        j === i ? { ...e, sets: [...e.sets, set] } : e,
      );
    });
    armRest(exId);
    try {
      navigator.vibrate?.(
        grade === "pr" ? [12, 40, 24] : grade === "beat" ? [10, 30] : 10,
      );
    } catch {
      /* no haptics */
    }
    if (grade === "pr") showToast("personal record", "amber");
    else if (grade === "beat") showToast("beat last time", "mint");
    else showToast("logged");
  };
  const removeSessionEntry = (exId: string) =>
    setSession((prev) => prev.filter((e) => e.exerciseId !== exId));

  // ---------- training day actions ----------
  // Adds a lift to a day by name — reuse an existing lift, or create it.
  const addExerciseToDay = (dayId: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const existing = exercises.find(
      (e) => e.name.toLowerCase() === trimmed.toLowerCase(),
    );
    const id = existing ? existing.id : addExercise(newExercise(trimmed));
    setDayExercise(dayId, id, true);
  };
  const removeExerciseFromDay = (dayId: string, exId: string) => {
    setDayExercise(dayId, exId, false);
    removeSessionEntry(exId);
  };
  // Finishes only the sets logged for one day's exercises, leaving any other
  // day's in-progress draft untouched.
  const doFinishDay = (dayId: string) => {
    const day = splitDays.find((d) => d.id === dayId);
    if (!day) return;
    const dayIds = new Set(day.exerciseIds);
    const items: CelebrationItem[] = [];
    let beats = 0;
    let prs = 0;
    let totalSets = 0;
    for (const entry of session) {
      if (!dayIds.has(entry.exerciseId)) continue;
      const ex = byId[entry.exerciseId];
      if (!ex || entry.sets.length === 0) continue;
      const base = baselineFor(setsFor(setLogs, entry.exerciseId));
      let best: Grade = "first";
      let top = entry.sets[0];
      for (const s of entry.sets) {
        const g = gradeValue(epley(s.weight, s.reps), base);
        if (gradeRank[g] > gradeRank[best]) best = g;
        if (epley(s.weight, s.reps) > epley(top.weight, top.reps)) top = s;
      }
      if (best === "pr") prs++;
      else if (best === "beat") beats++;
      totalSets += entry.sets.length;
      items.push({ name: ex.name, setCount: entry.sets.length, top, grade: best });
    }
    if (totalSets === 0) return;
    for (const entry of session) {
      if (!dayIds.has(entry.exerciseId)) continue;
      for (const s of entry.sets) logSet(entry.exerciseId, s.weight, s.reps);
    }
    setCelebration({ items, beats, prs, totalSets });
    setSession((prev) => prev.filter((e) => !dayIds.has(e.exerciseId)));
    setScreen({ name: "celebrate" });
  };

  // ---------- screens ----------
  let body: ReactNode;
  if (screen.name === "celebrate" && celebration) {
    body = (
      <CelebrateScreen
        data={celebration}
        onDone={() => setScreen({ name: "days" })}
      />
    );
  } else if (screen.name === "chart" && byId[screen.id]) {
    body = (
      <ChartScreen
        exercise={byId[screen.id]}
        sets={setsFor(setLogs, screen.id)}
        onBack={() => setScreen(historyReturn)}
        onLog={() => setSheet({ mode: "log", id: screen.id })}
      />
    );
  } else if (screen.name === "history" && byId[screen.id]) {
    body = (
      <HistoryScreen
        exercise={byId[screen.id]}
        sets={setsFor(setLogs, screen.id)}
        onBack={() => setScreen(historyReturn)}
        onLog={() => setSheet({ mode: "log", id: screen.id })}
        onRemove={(sid) => {
          deleteSet(sid);
          showToast("removed");
        }}
      />
    );
  } else if (screen.name === "list") {
    body = (
      <ListScreen
        exercises={exercises}
        setLogs={setLogs}
        celebrateId={celebrateId}
        onAdd={() => setSheet({ mode: "add" })}
        onQuick={(name) => addExercise(newExercise(name))}
        onLog={(id) => setSheet({ mode: "log", id })}
        onSwap={(id) => setSheet({ mode: "swap", id })}
        onChart={(id) => {
          setHistoryReturn({ name: "list" });
          setScreen({ name: "chart", id });
        }}
        onHistory={(id) => {
          setHistoryReturn({ name: "list" });
          setScreen({ name: "history", id });
        }}
      />
    );
  } else if (screen.name === "library") {
    const day = splitDays.find((d) => d.id === screen.dayId);
    body = day ? (
      <LibraryScreen
        exercises={exercises}
        dayName={day.name}
        dayExerciseIds={new Set(day.exerciseIds)}
        onToggle={(name, included) =>
          included
            ? addExerciseToDay(day.id, name)
            : (() => {
                const ex = exercises.find(
                  (e) => e.name.toLowerCase() === name.toLowerCase(),
                );
                if (ex) removeExerciseFromDay(day.id, ex.id);
              })()
        }
        onInfo={(name) => setSheet({ mode: "info", name })}
        onBack={() => setScreen({ name: "day", dayId: day.id })}
      />
    ) : null;
  } else if (screen.name === "day") {
    const day = splitDays.find((d) => d.id === screen.dayId);
    body = day ? (
      <DaySessionScreen
        day={day}
        days={splitDays}
        session={session}
        byId={byId}
        setLogs={setLogs}
        onBack={() => setScreen({ name: "days" })}
        onSwitchDay={(id) => setScreen({ name: "day", dayId: id })}
        onRenameDay={() => setSheet({ mode: "add-day", editId: day.id })}
        onDeleteDay={() => {
          deleteSplitDay(day.id);
          setScreen({ name: "days" });
        }}
        onAddExercise={() => setScreen({ name: "library", dayId: day.id })}
        onLogSet={logIntoSession}
        onRemoveEntry={(exId) => removeExerciseFromDay(day.id, exId)}
        onSwapEntry={(exId) => setSheet({ mode: "swap", id: exId })}
        onTuneEntry={(exId) => setSheet({ mode: "tune", id: exId })}
        onHistoryEntry={(exId) => {
          setHistoryReturn({ name: "day", dayId: day.id });
          setScreen({ name: "history", id: exId });
        }}
        onToggleStar={(exId) =>
          updateExercise(exId, { starred: !byId[exId]?.starred })
        }
        onReorder={(exId, dir) => reorderDayExercises(day.id, exId, dir)}
        onFinish={() => doFinishDay(day.id)}
      />
    ) : null;
  } else {
    body = (
      <DaysScreen
        days={splitDays}
        session={session}
        onOpenDay={(id) => setScreen({ name: "day", dayId: id })}
        onAddDay={() => setSheet({ mode: "add-day" })}
        onRenameDay={(id) => setSheet({ mode: "add-day", editId: id })}
        onDeleteDay={(id) => deleteSplitDay(id)}
        onOpenList={() => setScreen({ name: "list" })}
      />
    );
  }

  return (
    <div className="animate-view-in-right motion-reduce:animate-none">
      {screen.name === "list" && (
        <BackLink onClick={() => setScreen({ name: "days" })} />
      )}
      {body}

      {sheet?.mode === "log" && byId[sheet.id] && (
        <LogSheet
          exercise={byId[sheet.id]}
          lastSet={setsFor(setLogs, sheet.id).slice(-1)[0] ?? null}
          onClose={() => setSheet(null)}
          onSave={(w, r) => doLog(sheet.id, w, r)}
        />
      )}
      {sheet?.mode === "add" && (
        <AddSheet onClose={() => setSheet(null)} onSave={doAdd} />
      )}
      {sheet?.mode === "swap" && byId[sheet.id] && (
        <SwapSheet
          exercise={byId[sheet.id]}
          onClose={() => setSheet(null)}
          onSave={(name) => doSwap(sheet.id, name)}
          onRemove={() => doRemoveExercise(sheet.id)}
        />
      )}
      {sheet?.mode === "tune" && byId[sheet.id] && (
        <TuneSheet
          exercise={byId[sheet.id]}
          onClose={() => setSheet(null)}
          onSave={(patch) => {
            updateExercise(sheet.id, patch);
            setSheet(null);
            showToast("tuned");
          }}
        />
      )}
      {sheet?.mode === "add-day" && (
        <AddDaySheet
          editingDay={
            sheet.editId ? (splitDays.find((d) => d.id === sheet.editId) ?? null) : null
          }
          onClose={() => setSheet(null)}
          onCreate={(name) => {
            if (sheet.editId) {
              renameSplitDay(sheet.editId, name);
              setSheet(null);
            } else {
              const id = addSplitDay(name);
              setSheet(null);
              setScreen({ name: "day", dayId: id });
            }
          }}
        />
      )}
      {sheet?.mode === "info" && (
        <ExerciseInfoSheet name={sheet.name} onClose={() => setSheet(null)} />
      )}

      {toast && (
        <div
          className={`fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] left-1/2 z-[60] -translate-x-1/2 rounded-full border px-5 py-2.5 font-serif text-[19px] italic whitespace-nowrap ${
            toast.kind === "amber"
              ? "border-[#f59e0b]/45 text-[#f59e0b]"
              : toast.kind === "mint"
                ? "border-[#34d399]/45 text-[#34d399]"
                : "border-white/15 text-text"
          }`}
          style={{ background: "#0c0c0c" }}
        >
          {toast.msg}
        </div>
      )}

      {restTimer && (
        <RestTimerBar
          state={restTimer}
          onAdjust={(delta) =>
            setRestTimer((t) =>
              t ? { ...t, endsAt: Math.max(Date.now(), t.endsAt + delta * 1000) } : t,
            )
          }
          onReset={() => setRestTimer(null)}
        />
      )}
    </div>
  );
}

// ---------- rest timer ----------
function RestTimerBar(props: {
  state: RestTimerState;
  onAdjust: (deltaSeconds: number) => void;
  onReset: () => void;
}) {
  const { endsAt, exerciseName } = props.state;
  const [now, setNow] = useState(() => Date.now());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const iv = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(iv);
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const remainingMs = Math.max(0, endsAt - now);
  const remaining = Math.ceil(remainingMs / 1000);
  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;
  const label = `${mm}:${String(ss).padStart(2, "0")}`;
  const done = remainingMs === 0;

  // Once rest is up, clear the bar on its own after a short grace period —
  // logging the next set (or a manual ×) can still dismiss it sooner.
  useEffect(() => {
    if (!done) return;
    const t = window.setTimeout(() => props.onReset(), 3000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  return (
    <div
      className={`fixed inset-x-0 bottom-[calc(2rem+env(safe-area-inset-bottom))] z-[55] flex flex-col items-center gap-2 px-4 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
        mounted ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      <div
        className={`flex items-center gap-1 rounded-full border border-white/10 py-2.5 pr-2.5 pl-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.45)] ${
          done ? "animate-win-pulse motion-reduce:animate-none" : ""
        }`}
        style={{ background: "#0c0c0c" }}
      >
        <button
          onClick={() => props.onAdjust(-15)}
          aria-label="subtract 15 seconds"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 font-mono text-[11px] text-text-dim transition-colors active:border-[#34d399] active:text-[#34d399]"
        >
          -15
        </button>
        <div className="flex min-w-[152px] flex-col items-center px-3">
          <span className="font-mono text-[26px] leading-none font-semibold tracking-tight text-[#34d399] tabular-nums">
            {label}
          </span>
          <span className="mt-1 max-w-[180px] truncate text-[10px] font-semibold tracking-[0.14em] text-text-dim/70 uppercase">
            {exerciseName}
          </span>
        </div>
        <button
          onClick={() => props.onAdjust(15)}
          aria-label="add 15 seconds"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 font-mono text-[11px] text-text-dim transition-colors active:border-[#34d399] active:text-[#34d399]"
        >
          +15
        </button>
        <button
          onClick={props.onReset}
          aria-label="dismiss rest timer"
          className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center text-lg text-text-dim/50 transition-colors active:text-[#ff6b5b]"
        >
          ×
        </button>
      </div>
      <div className="text-[10px] tracking-[0.12em] text-text-dim/45 uppercase">
        live · -15 and +15 adjust · × resets
      </div>
    </div>
  );
}

// ---------- list ----------
function ListScreen(props: {
  exercises: Exercise[];
  setLogs: SetLog[];
  celebrateId: string | null;
  onAdd: () => void;
  onQuick: (name: string) => void;
  onLog: (id: string) => void;
  onSwap: (id: string) => void;
  onChart: (id: string) => void;
  onHistory: (id: string) => void;
}) {
  if (props.exercises.length === 0) {
    return (
      <div className="py-6">
        <p className="mb-7 max-w-[20ch] font-serif text-[26px] leading-snug italic">
          Let’s begin. Add the first lift you want to track.
        </p>
        <button
          onClick={props.onAdd}
          className="rounded-full bg-accent px-7 py-3.5 font-serif text-[20px] text-black italic"
        >
          add a lift
        </button>
        <div className="mt-6 flex flex-wrap gap-2">
          {SUGGESTIONS.map((n) => (
            <button
              key={n}
              onClick={() => props.onQuick(n)}
              className="rounded-full border border-border px-4 py-2 font-serif text-[18px] text-text-dim italic"
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3.5 ml-0.5 text-[11px] font-semibold tracking-[0.16em] text-text-dim/60 uppercase">
        Your lifts
      </div>
      {props.exercises.map((e, i) => (
        <LiftCard
          key={e.id}
          index={i}
          exercise={e}
          sets={setsFor(props.setLogs, e.id)}
          celebrating={props.celebrateId === e.id}
          onLog={() => props.onLog(e.id)}
          onSwap={() => props.onSwap(e.id)}
          onChart={() => props.onChart(e.id)}
          onHistory={() => props.onHistory(e.id)}
        />
      ))}
      <button
        onClick={props.onAdd}
        className="mt-2 w-full rounded-full bg-accent px-7 py-3.5 text-center font-serif text-[20px] text-black italic shadow-[0_10px_30px_rgba(251,86,7,0.28)]"
      >
        add a lift
      </button>
    </div>
  );
}

function LiftCard(props: {
  index: number;
  exercise: Exercise;
  sets: SetLog[];
  celebrating: boolean;
  onLog: () => void;
  onSwap: () => void;
  onChart: () => void;
  onHistory: () => void;
}) {
  const last = props.sets[props.sets.length - 1] ?? null;
  const rm = best1RM(props.sets);
  const best = bestSet(props.sets);
  return (
    <article className="glass-card mb-3.5 rounded-[18px] px-5 pt-5 pb-3.5">
      <div className="flex items-center gap-3">
        <span className="min-w-[22px] font-serif text-[17px] text-text-dim/50 italic">
          {toRoman(props.index + 1)}
        </span>
        <h3 className="min-w-0 flex-1 truncate font-serif text-[26px] leading-tight italic">
          {props.exercise.name}
        </h3>
        {best && <BestBadge set={best} celebrating={props.celebrating} />}
      </div>

      <div className="my-4.5 flex items-end justify-between gap-4 pl-[34px]">
        {last ? (
          <>
            <div>
              <div className="flex items-baseline gap-1">
                <b className="text-[32px] font-bold tracking-tight">
                  {fmt(last.weight)}
                </b>
                <span className="text-[15px] font-medium text-text-dim">
                  {UNIT}
                </span>
              </div>
              <div className="mt-1 text-xs text-text-dim">
                last set · {last.reps} reps
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-baseline justify-end gap-1">
                <b className="text-[32px] font-bold tracking-tight text-accent">
                  {Math.round(rm)}
                </b>
                <span className="text-[15px] font-medium text-accent/70">
                  {UNIT}
                </span>
              </div>
              <div className="mt-1 text-xs text-accent/80">est. max</div>
            </div>
          </>
        ) : (
          <div>
            <b className="text-[32px] font-medium text-text-dim">—</b>
            <div className="mt-1 text-xs text-text-dim">no sets yet</div>
          </div>
        )}
      </div>

      <div className="mt-1 flex gap-2 border-t border-border pt-3">
        <ActionWord label="log" lead onClick={props.onLog} />
        <ActionWord label="swap" onClick={props.onSwap} />
        <ActionWord label="chart" onClick={props.onChart} />
        <ActionWord label="history" onClick={props.onHistory} />
      </div>
    </article>
  );
}

function BestBadge(props: { set: SetLog; celebrating: boolean }) {
  return (
    <span
      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 whitespace-nowrap transition-colors duration-300 ${
        props.celebrating
          ? "animate-win-pulse border-[#34d399] bg-[#34d399]/12 text-[#34d399]"
          : "border-border text-text-dim"
      }`}
    >
      <span className="font-serif text-[15px] italic">best</span>
      <b className="text-[15px] font-semibold">
        {fmt(props.set.weight)}
        <span className="text-[11px] font-normal opacity-70"> {UNIT}</span> ×{" "}
        {props.set.reps}
      </b>
    </span>
  );
}

function ActionWord(props: { label: string; lead?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={props.onClick}
      className={`min-h-13 flex-1 py-3 font-serif text-[23px] lowercase italic transition-colors active:text-accent ${
        props.lead ? "text-text" : "text-text-dim"
      }`}
    >
      {props.label}
    </button>
  );
}

// ---------- back link ----------
function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mb-4 flex items-center gap-1.5 font-serif text-[20px] text-text-dim italic"
    >
      <ChevronLeft size={16} /> back
    </button>
  );
}

// ---------- chart ----------
function ChartScreen(props: {
  exercise: Exercise;
  sets: SetLog[];
  onBack: () => void;
  onLog: () => void;
}) {
  const series = perDayTop(props.sets);
  const [focus, setFocus] = useState<number | null>(null);
  const active =
    focus == null ? series.length - 1 : Math.min(focus, series.length - 1);
  const cur = series[active];
  const record = bestSet(props.sets);
  const streak = beatStreak(series);

  return (
    <div>
      <BackLink onClick={props.onBack} />
      <div className="text-[11px] font-semibold tracking-[0.16em] text-text-dim/60 uppercase">
        Progress
      </div>
      <h2 className="mt-1.5 font-serif text-[42px] leading-none italic">
        {props.exercise.name}
      </h2>

      {series.length === 0 ? (
        <div className="py-8">
          <p className="mb-6 max-w-[22ch] font-serif text-[24px] leading-snug italic">
            Log a few sessions and your curve will draw itself here.
          </p>
          <button
            onClick={props.onLog}
            className="rounded-full bg-accent px-7 py-3.5 font-serif text-[20px] text-black italic"
          >
            log a set
          </button>
        </div>
      ) : (
        <>
          <div className="glass-card mt-6 rounded-[18px] p-4">
            {/* readout that follows the scrubber */}
            <div className="mb-3 flex items-end justify-between">
              <div>
                <div className="text-[11px] tracking-[0.14em] text-text-dim/60 uppercase">
                  {active === series.length - 1 ? "latest top set" : "top set"}
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <b className="text-[30px] font-bold tracking-tight">
                    {fmt(cur.set.weight)}
                  </b>
                  <span className="text-[14px] font-medium text-text-dim">
                    {UNIT}
                  </span>
                  <span className="text-[18px] text-text-dim">
                    &nbsp;× {cur.set.reps}
                  </span>
                </div>
              </div>
              <div className="text-right text-sm text-text-dim">
                {new Date(cur.ts).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>

            <ProgressChart
              series={series}
              activeIndex={active}
              onScrub={setFocus}
            />

            <div className="mt-2 text-center text-[11px] tracking-[0.1em] text-text-dim/50 uppercase">
              drag across to scrub sessions
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <StatTile label="best ever" mint>
              {record ? (
                <>
                  {fmt(record.weight)}
                  <span className="ml-0.5 text-[13px] font-medium text-[#34d399]/70">
                    {UNIT}
                  </span>
                  <span className="text-text-dim"> × {record.reps}</span>
                </>
              ) : (
                "—"
              )}
            </StatTile>
            <StatTile label="beat-last-time streak" mint={streak > 0}>
              {streak}
              <span className="ml-1 text-[13px] font-medium text-text-dim">
                {streak === 1 ? "session" : "sessions"}
              </span>
            </StatTile>
          </div>

          <button
            onClick={props.onLog}
            className="mt-6 w-full rounded-full bg-accent px-7 py-3.5 font-serif text-[20px] text-black italic"
          >
            log a set
          </button>
        </>
      )}
    </div>
  );
}

function StatTile(props: { label: string; mint?: boolean; children: ReactNode }) {
  return (
    <div className="glass-card flex-1 rounded-2xl px-3.5 py-4">
      <div
        className={`text-2xl font-bold tracking-tight ${props.mint ? "text-[#34d399]" : ""}`}
      >
        {props.children}
      </div>
      <div className="mt-1.5 text-[11px] text-text-dim">{props.label}</div>
    </div>
  );
}

function ProgressChart(props: {
  series: SessionPoint[];
  activeIndex: number;
  onScrub: (i: number) => void;
}) {
  const { series, activeIndex, onScrub } = props;
  const ref = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const areaRef = useRef<SVGPathElement>(null);
  const [w, setW] = useState(0);
  const pressing = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) =>
      setW(entries[0].contentRect.width),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const W = w || 320;
  const H = 168;
  const padX = 8;
  const padTop = 16;
  const padBot = 14;
  const n = series.length;
  const vals = series.map((p) => p.value);
  let min = Math.min(...vals);
  let max = Math.max(...vals);
  if (max - min < 1) {
    max += 1;
    min = Math.max(0, min - 1);
  }
  const X = (i: number) =>
    n === 1 ? W / 2 : padX + (W - padX * 2) * (i / (n - 1));
  const Y = (v: number) =>
    padTop + (H - padTop - padBot) * (1 - (v - min) / (max - min));

  let line = "";
  series.forEach((p, i) => {
    line += `${i ? "L" : "M"}${X(i).toFixed(1)} ${Y(p.value).toFixed(1)} `;
  });
  const area = `${line}L${X(n - 1).toFixed(1)} ${H - padBot} L${X(0).toFixed(1)} ${H - padBot} Z`;

  // Draw-in reveal: the line strokes itself in and the area fades up whenever
  // the plotted path changes shape (new exercise, new session). Respects
  // prefers-reduced-motion by snapping straight to the settled state.
  useEffect(() => {
    const path = lineRef.current;
    const fill = areaRef.current;
    if (!path) return;
    const length = path.getTotalLength();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      path.style.transition = "none";
      path.style.strokeDasharray = "none";
      path.style.strokeDashoffset = "0";
      if (fill) {
        fill.style.transition = "none";
        fill.style.opacity = "1";
      }
      return;
    }

    path.style.transition = "none";
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;
    if (fill) {
      fill.style.transition = "none";
      fill.style.opacity = "0";
    }
    // Force a reflow so the browser registers the hidden state before the
    // transition below is allowed to animate it.
    path.getBoundingClientRect();

    let settle: number | undefined;
    const raf = requestAnimationFrame(() => {
      path.style.transition = "stroke-dashoffset 900ms cubic-bezier(0.16, 1, 0.3, 1)";
      path.style.strokeDashoffset = "0";
      if (fill) {
        fill.style.transition = "opacity 700ms ease 250ms";
        fill.style.opacity = "1";
      }
      // Once drawn, drop the dash pattern so a later container resize can't
      // clip the line against a now-stale total length.
      settle = window.setTimeout(() => {
        path.style.transition = "none";
        path.style.strokeDasharray = "none";
      }, 950);
    });
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(settle);
    };
  }, [line]);

  const scrub = (clientX: number) => {
    const el = ref.current;
    if (!el || n < 2) return;
    const rect = el.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    onScrub(Math.round(frac * (n - 1)));
  };
  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
    pressing.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer capture is best-effort */
    }
    scrub(e.clientX);
  };
  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (pressing.current) scrub(e.clientX);
  };
  const up = () => {
    pressing.current = false;
  };

  const ax = X(activeIndex);
  const ay = Y(series[activeIndex].value);

  return (
    <div
      ref={ref}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      className="touch-none cursor-ew-resize select-none"
    >
      <svg width={W} height={H} className="block">
        <path
          ref={areaRef}
          d={area}
          fill="#34d399"
          style={{ fillOpacity: 0.08 }}
        />
        <path
          ref={lineRef}
          d={line}
          fill="none"
          stroke="#34d399"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {n > 1 && (
          <line
            x1={ax}
            y1={padTop - 6}
            x2={ax}
            y2={H - padBot}
            stroke="#34d399"
            strokeWidth={1}
            strokeOpacity={0.4}
          />
        )}
        {series.map((p, i) => (
          <circle
            key={i}
            cx={X(i)}
            cy={Y(p.value)}
            r={2.4}
            fill="#000"
            stroke="#34d399"
            strokeWidth={1.5}
            strokeOpacity={0.55}
          />
        ))}
        <circle cx={ax} cy={ay} r={9} fill="#34d399" fillOpacity={0.18} />
        <circle cx={ax} cy={ay} r={5} fill="#34d399" />
      </svg>
    </div>
  );
}

// ---------- history ----------
function HistoryScreen(props: {
  exercise: Exercise;
  sets: SetLog[];
  onBack: () => void;
  onLog: () => void;
  onRemove: (id: string) => void;
}) {
  // groups by day, newest first; mark PR progression
  let running = 0;
  const prSet: Record<string, boolean> = {};
  props.sets.forEach((s) => {
    const v = epley(s.weight, s.reps);
    if (v > running + 0.01) {
      running = v;
      prSet[s.id] = true;
    }
  });

  const groups: Record<string, SetLog[]> = {};
  props.sets.forEach((s) => {
    (groups[dayKey(s.at)] ||= []).push(s);
  });
  const keys = Object.keys(groups).sort(
    (a, b) => +new Date(groups[b][0].at) - +new Date(groups[a][0].at),
  );

  return (
    <div>
      <BackLink onClick={props.onBack} />
      <div className="text-[11px] font-semibold tracking-[0.16em] text-text-dim/60 uppercase">
        History
      </div>
      <h2 className="mt-1.5 font-serif text-[42px] leading-none italic">
        {props.exercise.name}
      </h2>

      {props.sets.length === 0 ? (
        <div className="py-8">
          <p className="mb-6 max-w-[24ch] font-serif text-[24px] leading-snug italic">
            Nothing logged yet. Your first set is the story’s first line.
          </p>
          <button
            onClick={props.onLog}
            className="rounded-full bg-accent px-7 py-3.5 font-serif text-[20px] text-black italic"
          >
            log a set
          </button>
        </div>
      ) : (
        <div className="mt-6">
          {keys.map((k) => {
            const daySets = groups[k];
            const label = new Date(daySets[0].at).toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            });
            return (
              <div key={k} className="mb-6">
                <div className="mb-2 text-[11px] font-semibold tracking-[0.14em] text-text-dim/60 uppercase">
                  {label}
                </div>
                {daySets.map((s, idx) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3.5 border-b border-border py-3"
                  >
                    <span className="min-w-[26px] font-serif text-[15px] text-text-dim/50 italic">
                      {toRoman(idx + 1)}
                    </span>
                    <span className="flex-1 text-[17px] font-semibold">
                      {fmt(s.weight)}{" "}
                      <span className="text-sm font-normal text-text-dim">
                        {UNIT}
                      </span>{" "}
                      × {s.reps}
                    </span>
                    {prSet[s.id] && (
                      <span className="text-xs tracking-[0.1em] text-[#34d399] uppercase">
                        best
                      </span>
                    )}
                    <span className="text-xs text-text-dim/50">
                      {new Date(s.at).toLocaleTimeString(undefined, {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                    <button
                      onClick={() => props.onRemove(s.id)}
                      className="min-h-10 px-1.5 py-1 font-serif text-base text-text-dim/50 italic active:text-[#ff6b5b]"
                    >
                      remove
                    </button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------- sheets ----------
function Sheet(props: { children: ReactNode; onClose: () => void }) {
  return (
    <>
      <div
        onClick={props.onClose}
        className="fixed inset-0 z-[40] bg-black/60 backdrop-blur-[2px]"
      />
      <div
        className="fixed inset-x-0 bottom-0 z-[41] mx-auto max-w-[460px] rounded-t-[26px] border-x border-t border-white/10 px-5.5 pt-2.5 pb-[calc(2rem+env(safe-area-inset-bottom))]"
        style={{ background: "#000" }}
      >
        <div className="mx-auto mt-2 mb-4.5 h-1 w-9 rounded-full bg-white/15" />
        {props.children}
      </div>
    </>
  );
}

function Stepper(props: {
  label: string;
  value: number;
  unit: string;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="my-2 mb-5.5">
      <div className="mb-2.5 text-xs tracking-[0.14em] text-text-dim/60 uppercase">
        {props.label}
      </div>
      <div className="flex items-center gap-3.5">
        <button
          onClick={() => props.onChange(Math.max(0, props.value - props.step))}
          className="h-14 w-14 flex-none rounded-full border border-white/15 text-2xl active:border-accent active:text-accent"
        >
          −
        </button>
        <div className="flex-1 text-center">
          <input
            type="number"
            inputMode="decimal"
            value={props.value}
            onChange={(e) => props.onChange(Number(e.target.value) || 0)}
            className="w-full bg-transparent text-center text-[46px] font-bold tracking-tight outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="block text-xs tracking-[0.14em] text-text-dim uppercase">
            {props.unit}
          </span>
        </div>
        <button
          onClick={() => props.onChange(props.value + props.step)}
          className="h-14 w-14 flex-none rounded-full border border-white/15 text-2xl active:border-accent active:text-accent"
        >
          +
        </button>
      </div>
    </div>
  );
}

function LogSheet(props: {
  exercise: Exercise;
  lastSet: SetLog | null;
  onClose: () => void;
  onSave: (w: number, r: number) => void;
}) {
  const [weight, setWeight] = useState(
    props.lastSet?.weight ?? props.exercise.startWeight ?? 20,
  );
  const [reps, setReps] = useState(props.lastSet?.reps ?? props.exercise.repMin ?? 5);

  return (
    <Sheet onClose={props.onClose}>
      <h3 className="font-serif text-[30px]">log</h3>
      <div className="mb-4 font-serif text-sm text-text-dim italic">
        {props.exercise.name}
      </div>
      {props.lastSet && (
        <p className="mb-5 text-[13px] text-text-dim">
          last time ·{" "}
          <b className="font-semibold text-text">
            {fmt(props.lastSet.weight)} {UNIT} × {props.lastSet.reps}
          </b>{" "}
          —{" "}
          <button
            className="text-accent"
            onClick={() => {
              setWeight(props.lastSet!.weight);
              setReps(props.lastSet!.reps);
            }}
          >
            repeat
          </button>
        </p>
      )}
      <Stepper
        label="weight"
        value={weight}
        unit={UNIT}
        step={props.exercise.step || 2.5}
        onChange={setWeight}
      />
      <Stepper label="reps" value={reps} unit="reps" step={1} onChange={setReps} />
      <div className="mt-1.5 flex gap-2.5">
        <PillGhost onClick={props.onClose}>cancel</PillGhost>
        <PillPrimary
          onClick={() => {
            if (reps <= 0) return;
            props.onSave(weight, reps);
          }}
        >
          save
        </PillPrimary>
      </div>
    </Sheet>
  );
}

function AddSheet(props: { onClose: () => void; onSave: (name: string) => void }) {
  const [name, setName] = useState("");
  return (
    <Sheet onClose={props.onClose}>
      <h3 className="font-serif text-[30px]">new lift</h3>
      <div className="mb-5 text-sm text-text-dim">
        Name it however you say it in the gym.
      </div>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && props.onSave(name)}
        placeholder="e.g. Front Squat"
        className="mb-4.5 w-full border-b border-white/15 bg-transparent px-0.5 pt-2 pb-3 font-serif text-[30px] italic outline-none placeholder:text-text-dim/40"
      />
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((n) => (
          <button
            key={n}
            onClick={() => setName(n)}
            className="rounded-full border border-border px-4 py-2 font-serif text-[18px] text-text-dim italic"
          >
            {n}
          </button>
        ))}
      </div>
      <div className="mt-5 flex gap-2.5">
        <PillGhost onClick={props.onClose}>cancel</PillGhost>
        <PillPrimary onClick={() => props.onSave(name)}>add</PillPrimary>
      </div>
    </Sheet>
  );
}

function SwapSheet(props: {
  exercise: Exercise;
  onClose: () => void;
  onSave: (name: string) => void;
  onRemove: () => void;
}) {
  const [name, setName] = useState(props.exercise.name);
  return (
    <Sheet onClose={props.onClose}>
      <h3 className="font-serif text-[30px]">swap</h3>
      <div className="mb-5 text-sm text-text-dim">Rename this lift, or retire it.</div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && props.onSave(name)}
        className="mb-4.5 w-full border-b border-white/15 bg-transparent px-0.5 pt-2 pb-3 font-serif text-[30px] italic outline-none"
      />
      <div className="flex gap-2.5">
        <PillGhost onClick={props.onClose}>cancel</PillGhost>
        <PillPrimary onClick={() => props.onSave(name)}>save</PillPrimary>
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-border pt-4.5">
        <span className="text-sm text-text-dim">Remove all of its history</span>
        <button
          onClick={props.onRemove}
          className="rounded-full border border-[#ff6b5b]/35 px-5 py-2.5 font-serif text-[18px] text-[#ff6b5b] italic"
        >
          remove
        </button>
      </div>
    </Sheet>
  );
}

function TuneSheet(props: {
  exercise: Exercise;
  onClose: () => void;
  onSave: (patch: { step: number; restSeconds: number; repMin: number }) => void;
}) {
  const [step, setStep] = useState(props.exercise.step || 2.5);
  const [restSeconds, setRestSeconds] = useState(props.exercise.restSeconds || 90);
  const [repMin, setRepMin] = useState(props.exercise.repMin || 5);
  return (
    <Sheet onClose={props.onClose}>
      <h3 className="font-serif text-[30px]">tune</h3>
      <div className="mb-4 font-serif text-sm text-text-dim italic">
        {props.exercise.name}
      </div>
      <div className="flex gap-3">
        <CompactStepper label={`weight step · ${UNIT}`} value={step} step={0.5} onChange={setStep} />
        <CompactStepper label="target reps" value={repMin} step={1} onChange={setRepMin} />
      </div>
      <div className="mt-4">
        <CompactStepper label="rest · seconds" value={restSeconds} step={15} onChange={setRestSeconds} />
      </div>
      <div className="mt-5 flex gap-2.5">
        <PillGhost onClick={props.onClose}>cancel</PillGhost>
        <PillPrimary onClick={() => props.onSave({ step, restSeconds, repMin })}>
          save
        </PillPrimary>
      </div>
    </Sheet>
  );
}

function PillPrimary(props: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={props.onClick}
      className="flex-1 rounded-full bg-accent px-6 py-3.5 text-center font-serif text-[20px] text-black italic"
    >
      {props.children}
    </button>
  );
}
function PillGhost(props: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={props.onClick}
      className="flex-1 rounded-full border border-white/15 px-6 py-3.5 text-center font-serif text-[20px] text-text-dim italic"
    >
      {props.children}
    </button>
  );
}

// ================= PART 2 — a training day's session =================

function DaySessionScreen(props: {
  day: SplitDay;
  days: SplitDay[];
  session: SessionEntry[];
  byId: Record<string, Exercise>;
  setLogs: SetLog[];
  onBack: () => void;
  onSwitchDay: (id: string) => void;
  onRenameDay: () => void;
  onDeleteDay: () => void;
  onAddExercise: () => void;
  onLogSet: (exId: string, w: number, r: number) => void;
  onRemoveEntry: (exId: string) => void;
  onSwapEntry: (exId: string) => void;
  onTuneEntry: (exId: string) => void;
  onHistoryEntry: (exId: string) => void;
  onToggleStar: (exId: string) => void;
  onReorder: (exId: string, direction: "up" | "down") => void;
  onFinish: () => void;
}) {
  const [reorderMode, setReorderMode] = useState(false);
  const [dayMenuOpen, setDayMenuOpen] = useState(false);

  const bySession = new Map(props.session.map((e) => [e.exerciseId, e]));
  // Every exercise assigned to the day gets a card — even before its first
  // set is logged today — so "add exercise" always shows up immediately.
  const live: SessionEntry[] = props.day.exerciseIds
    .filter((id) => props.byId[id])
    .map((id) => bySession.get(id) ?? { exerciseId: id, sets: [] });
  const totalSets = live.reduce((a, e) => a + e.sets.length, 0);
  const totalTarget = live.length * TARGET_SET_COUNT;

  return (
    <div className="pb-4">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={props.onBack}
          className="flex items-center gap-1.5 font-serif text-[19px] text-text-dim italic"
        >
          <ChevronLeft size={16} /> Today’s session
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setReorderMode((v) => !v)}
            className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 font-serif text-[15px] italic transition-colors ${
              reorderMode ? "border-accent text-accent" : "border-white/15 text-text-dim"
            }`}
          >
            <Repeat size={13} /> reorder
          </button>
          <div className="relative">
            <button
              onClick={() => setDayMenuOpen((v) => !v)}
              aria-label="day settings"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-text-dim active:text-text"
            >
              <Settings size={15} />
            </button>
            {dayMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDayMenuOpen(false)}
                />
                <div className="absolute top-11 right-0 z-20 overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
                  <button
                    onClick={() => {
                      setDayMenuOpen(false);
                      props.onRenameDay();
                    }}
                    className="block w-full px-4 py-2.5 text-left text-sm whitespace-nowrap text-text active:bg-white/5"
                  >
                    rename day
                  </button>
                  <button
                    onClick={() => {
                      setDayMenuOpen(false);
                      props.onDeleteDay();
                    }}
                    className="block w-full px-4 py-2.5 text-left text-sm whitespace-nowrap text-[#ff6b5b] active:bg-white/5"
                  >
                    delete day
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <h2 className="font-serif text-[32px] leading-none font-semibold not-italic">
          {props.day.name}
        </h2>
        <button
          onClick={props.onRenameDay}
          aria-label="rename day"
          className="text-text-dim/50 active:text-accent"
        >
          <Pencil size={15} />
        </button>
      </div>

      {props.days.length > 1 && (
        <DayTabs days={props.days} activeId={props.day.id} onSwitch={props.onSwitchDay} />
      )}

      {live.length > 0 && (
        <div className="mb-4 text-right text-[13px] font-medium text-text-dim">
          {totalSets} of {totalTarget} logged
        </div>
      )}

      {live.length === 0 ? (
        <div className="py-6">
          <p className="mb-7 max-w-[22ch] font-serif text-[26px] leading-snug italic">
            Nothing assigned yet. Add the lifts you train this day.
          </p>
          <button
            onClick={props.onAddExercise}
            className="rounded-full bg-accent px-7 py-3.5 font-serif text-[20px] text-black italic"
          >
            add an exercise
          </button>
        </div>
      ) : (
        <>
          {live.map((entry, i) => {
            const ex = props.byId[entry.exerciseId];
            return (
              <SessionCard
                key={entry.exerciseId}
                exercise={ex}
                entry={entry}
                setLogs={props.setLogs}
                reorderMode={reorderMode}
                canMoveUp={i > 0}
                canMoveDown={i < live.length - 1}
                onMove={(direction) => props.onReorder(entry.exerciseId, direction)}
                onLog={(w, r) => props.onLogSet(entry.exerciseId, w, r)}
                onSwap={() => props.onSwapEntry(entry.exerciseId)}
                onTune={() => props.onTuneEntry(entry.exerciseId)}
                onHistory={() => props.onHistoryEntry(entry.exerciseId)}
                onToggleStar={() => props.onToggleStar(entry.exerciseId)}
                onRemove={() => props.onRemoveEntry(entry.exerciseId)}
              />
            );
          })}
          <button
            onClick={props.onAddExercise}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-full border border-white/15 px-7 py-3 font-serif text-[19px] text-text-dim italic"
          >
            <LayoutGrid size={16} /> Add a lift
          </button>

          <button
            onClick={props.onFinish}
            disabled={totalSets === 0}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border px-7 py-4 font-serif text-[22px] italic transition-opacity disabled:opacity-45"
            style={{ borderColor: `${MINT}55`, background: `${MINT}22`, color: MINT }}
          >
            <Check size={20} /> Finish session
          </button>
          {totalSets === 0 && (
            <p className="mt-2.5 text-center font-serif text-[14px] text-text-dim/60 italic">
              Log a set to finish your session
            </p>
          )}

          <p className="mt-8 text-center text-[12px] text-text-dim/40 italic">
            Saved on this device. Log a set, close the tab, it is still here.
          </p>
        </>
      )}
    </div>
  );
}

function DayTabs(props: {
  days: SplitDay[];
  activeId: string;
  onSwitch: (id: string) => void;
}) {
  return (
    <div className="mb-4 flex gap-5 border-b border-border">
      {props.days.map((d) => {
        const active = d.id === props.activeId;
        return (
          <button
            key={d.id}
            onClick={() => props.onSwitch(d.id)}
            className={`-mb-px border-b-[3px] pb-2.5 text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors ${
              active ? "text-text" : "border-transparent text-text-dim/50"
            }`}
            style={
              active
                ? { borderBottomColor: MINT, borderBottomStyle: "dotted" }
                : undefined
            }
          >
            {d.name}
          </button>
        );
      })}
    </div>
  );
}

function SessionCard(props: {
  exercise: Exercise;
  entry: SessionEntry;
  setLogs: SetLog[];
  reorderMode: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMove: (direction: "up" | "down") => void;
  onLog: (w: number, r: number) => void;
  onSwap: () => void;
  onTune: () => void;
  onHistory: () => void;
  onToggleStar: () => void;
  onRemove: () => void;
}) {
  const history = setsFor(props.setLogs, props.exercise.id);
  const firstTime = history.length === 0;
  const lastHist = history[history.length - 1];
  // The prescribed weight×reps for every slot this session — a fixed target,
  // not something that adapts set-to-set.
  const target = lastHist
    ? { weight: lastHist.weight, reps: lastHist.reps }
    : { weight: props.exercise.startWeight || 20, reps: props.exercise.repMin || 5 };

  // One status per prescribed slot. Hitting a slot also logs a real set;
  // missing one stays local — a failed attempt was never actually lifted.
  const [slots, setSlots] = useState<("pending" | "hit" | "missed")[]>(() =>
    Array.from({ length: TARGET_SET_COUNT }, (_, i) =>
      i < props.entry.sets.length ? "hit" : "pending",
    ),
  );

  const hit = (i: number) => {
    if (slots[i] !== "pending") return;
    setSlots((prev) => prev.map((s, j) => (j === i ? "hit" : s)));
    props.onLog(target.weight, target.reps);
  };
  const miss = (i: number) => {
    if (slots[i] !== "pending") return;
    setSlots((prev) => prev.map((s, j) => (j === i ? "missed" : s)));
  };
  const undo = (i: number) => {
    setSlots((prev) => prev.map((s, j) => (j === i ? "pending" : s)));
  };

  return (
    <article className="glass-card mb-3.5 rounded-[18px] px-5 pt-5 pb-4">
      <div className="flex items-center gap-2.5">
        {props.reorderMode ? (
          <div className="flex flex-col">
            <button
              onClick={() => props.onMove("up")}
              disabled={!props.canMoveUp}
              aria-label="move up"
              className="text-text-dim disabled:opacity-25 active:text-accent"
            >
              <ChevronUp size={16} />
            </button>
            <button
              onClick={() => props.onMove("down")}
              disabled={!props.canMoveDown}
              aria-label="move down"
              className="text-text-dim disabled:opacity-25 active:text-accent"
            >
              <ChevronDown size={16} />
            </button>
          </div>
        ) : (
          <Dumbbell size={16} className="shrink-0 text-accent/70" />
        )}
        <h3 className="min-w-0 flex-1 truncate font-serif text-[24px] leading-tight font-semibold not-italic">
          {props.exercise.name}
        </h3>
        <button
          onClick={props.onHistory}
          aria-label="exercise info"
          className="text-text-dim/50 active:text-accent"
        >
          <Info size={16} />
        </button>
        <button
          onClick={props.onRemove}
          aria-label="remove from today"
          className="text-text-dim/50 active:text-[#ff6b5b]"
        >
          <X size={17} />
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] tracking-[0.1em] text-text-dim/60 uppercase">
        <span className="rounded-full border border-border px-2 py-0.5">Tier 1</span>
        <span>
          · {TARGET_SET_COUNT} × {target.reps}
        </span>
        {firstTime && <span>· First time · Set the mark</span>}
      </div>

      <div className="mt-3 flex items-center gap-1 border-t border-border pt-2.5">
        <IconWord label="swap" icon={Repeat} onClick={props.onSwap} />
        <IconWord label="history" icon={HistoryIcon} onClick={props.onHistory} />
        <IconWord label="tune" icon={SlidersHorizontal} onClick={props.onTune} />
        <button
          onClick={props.onSwap}
          aria-label="more"
          className="flex h-8 w-8 shrink-0 items-center justify-center text-text-dim/50 active:text-text"
        >
          <MoreHorizontal size={17} />
        </button>
        <button
          onClick={props.onToggleStar}
          aria-label={props.exercise.starred ? "unstar" : "star"}
          className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center"
        >
          <Star
            size={18}
            className={props.exercise.starred ? "text-[#34d399]" : "text-text-dim/40"}
            fill={props.exercise.starred ? MINT : "none"}
          />
        </button>
      </div>

      <div className="mt-1">
        {slots.map((status, i) => (
          <TargetSetRow
            key={i}
            index={i}
            weight={target.weight}
            reps={target.reps}
            status={status}
            onHit={() => hit(i)}
            onMiss={() => miss(i)}
            onUndo={() => undo(i)}
          />
        ))}
      </div>
    </article>
  );
}

function IconWord(props: { label: string; icon: LucideIcon; onClick: () => void }) {
  const Icon = props.icon;
  return (
    <button
      onClick={props.onClick}
      className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 font-serif text-[15px] text-text-dim italic active:text-accent"
    >
      <Icon size={14} />
      {props.label}
    </button>
  );
}

function TargetSetRow(props: {
  index: number;
  weight: number;
  reps: number;
  status: "pending" | "hit" | "missed";
  onHit: () => void;
  onMiss: () => void;
  onUndo: () => void;
}) {
  const missed = props.status === "missed";
  return (
    <div
      className={`mt-2 flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
        missed ? "bg-[#ff6b5b]/[0.07]" : "border-transparent"
      }`}
      style={missed ? { borderColor: `${MISS}55` } : undefined}
    >
      <span className="min-w-[20px] font-serif text-[14px] text-text-dim/50 italic">
        {toRoman(props.index + 1)}
      </span>
      <span
        className={`flex-1 text-[17px] font-semibold ${
          missed ? "text-text-dim/50 line-through decoration-2" : ""
        }`}
      >
        {fmt(props.weight)}
        <span className="text-sm font-normal text-text-dim"> {UNIT}</span> ×{" "}
        {props.reps}
      </span>

      {props.status === "pending" && (
        <div className="flex items-center gap-3.5">
          <button
            onClick={props.onHit}
            className="flex items-center gap-1 font-serif text-[16px] italic"
            style={{ color: MINT }}
          >
            hit it <ArrowRight size={14} />
          </button>
          <button
            onClick={props.onMiss}
            className="font-serif text-[16px] text-text-dim/50 italic"
          >
            miss
          </button>
        </div>
      )}
      {props.status === "hit" && (
        <div className="flex items-center gap-1.5" style={{ color: MINT }}>
          <Check size={15} />
          <span className="text-[13px] tracking-[0.08em] uppercase">logged</span>
        </div>
      )}
      {missed && (
        <div className="flex items-center gap-2.5">
          <span className="font-serif text-[16px] italic" style={{ color: MISS }}>
            missed
          </span>
          <button
            onClick={props.onUndo}
            aria-label="undo miss"
            className="text-text-dim/50 active:text-text"
          >
            <Undo2 size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

function GradeBadge({ grade }: { grade: Grade }) {
  if (grade === "pr")
    return (
      <span
        className="rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-[0.12em] uppercase"
        style={{ color: AMBER, borderColor: `${AMBER}66`, background: `${AMBER}1f` }}
      >
        PR
      </span>
    );
  if (grade === "beat")
    return (
      <span
        className="rounded-full border px-2.5 py-0.5 font-serif text-[14px] italic"
        style={{ color: MINT, borderColor: `${MINT}55`, background: `${MINT}1a` }}
      >
        beat
      </span>
    );
  return (
    <span className="font-serif text-[14px] text-text-dim/45 italic">
      {grade === "first" ? "first" : "—"}
    </span>
  );
}

function CompactStepper(props: {
  label: string;
  value: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex-1">
      <div className="mb-1.5 text-[10px] tracking-[0.14em] text-text-dim/60 uppercase">
        {props.label}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => props.onChange(Math.max(0, props.value - props.step))}
          className="h-10 w-10 flex-none rounded-full border border-white/15 text-xl active:border-accent active:text-accent"
        >
          −
        </button>
        <input
          type="number"
          inputMode="decimal"
          value={props.value}
          onChange={(e) => props.onChange(Number(e.target.value) || 0)}
          className="w-full min-w-0 bg-transparent text-center text-[26px] font-bold tracking-tight outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          onClick={() => props.onChange(props.value + props.step)}
          className="h-10 w-10 flex-none rounded-full border border-white/15 text-xl active:border-accent active:text-accent"
        >
          +
        </button>
      </div>
    </div>
  );
}


// ================= PART 3 — the day split (landing screen) =================

function DaysScreen(props: {
  days: SplitDay[];
  session: SessionEntry[];
  onOpenDay: (id: string) => void;
  onAddDay: () => void;
  onRenameDay: (id: string) => void;
  onDeleteDay: (id: string) => void;
  onOpenList: () => void;
}) {
  const setsToday = new Map(props.session.map((e) => [e.exerciseId, e.sets.length]));

  return (
    <div>
      <div className="mb-1 flex items-start justify-between gap-3">
        <h1 className="font-serif text-[34px] leading-none">Today’s session</h1>
        <button
          onClick={props.onOpenList}
          className="mt-1.5 shrink-0 font-serif text-[15px] text-text-dim italic active:text-accent"
        >
          your lifts
        </button>
      </div>
      <p className="mb-6 text-[14px] text-text-dim italic">
        Your split. Build it however you train.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {props.days.map((day, i) => {
          const target = day.exerciseIds.length * TARGET_SET_COUNT;
          const logged = day.exerciseIds.reduce(
            (a, id) => a + (setsToday.get(id) ?? 0),
            0,
          );
          const pct = target > 0 ? Math.min(100, Math.round((logged / target) * 100)) : 0;
          return (
            <DayCard
              key={day.id}
              index={i}
              day={day}
              logged={logged}
              target={target}
              pct={pct}
              onOpen={() => props.onOpenDay(day.id)}
              onRename={() => props.onRenameDay(day.id)}
              onDelete={() => props.onDeleteDay(day.id)}
            />
          );
        })}
        <button
          onClick={props.onAddDay}
          className="flex min-h-[148px] flex-col items-center justify-center gap-1.5 rounded-[18px] border border-dashed border-white/20 text-accent transition-colors active:border-accent/60"
        >
          <Plus size={20} />
          <span className="font-serif text-[16px] italic">Add a day</span>
        </button>
      </div>
    </div>
  );
}

function DayCard(props: {
  index: number;
  day: SplitDay;
  logged: number;
  target: number;
  pct: number;
  onOpen: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const hasExercises = props.day.exerciseIds.length > 0;

  return (
    <div className="glass-card relative min-h-[148px] rounded-[18px] p-4">
      <div className="mb-2 flex items-start justify-between">
        <span className="font-mono text-[11px] text-text-dim/50">
          ·{String(props.index + 1).padStart(2, "0")}
        </span>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="day options"
          className="px-1 text-text-dim/50 active:text-text-dim"
        >
          ···
        </button>
      </div>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-9 right-3 z-20 overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
            <button
              onClick={() => {
                setMenuOpen(false);
                props.onRename();
              }}
              className="block w-full px-4 py-2.5 text-left text-sm whitespace-nowrap text-text active:bg-white/5"
            >
              rename
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                props.onDelete();
              }}
              className="block w-full px-4 py-2.5 text-left text-sm whitespace-nowrap text-[#ff6b5b] active:bg-white/5"
            >
              delete
            </button>
          </div>
        </>
      )}

      <button onClick={props.onOpen} className="block w-full text-left">
        <h3 className="mb-3 truncate font-serif text-[22px] font-semibold">
          {props.day.name}
        </h3>

        {hasExercises ? (
          <>
            <div className="mb-1 text-[15px] font-semibold">
              {props.logged} of {props.target} logged
            </div>
            <div className="mb-2 text-[10px] tracking-[0.1em] text-text-dim/60 uppercase">
              {props.day.exerciseIds.length}{" "}
              {props.day.exerciseIds.length === 1 ? "exercise" : "exercises"}
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${props.pct}%` }}
              />
            </div>
          </>
        ) : (
          <div className="text-[13px] text-text-dim italic">empty · tap to add lifts</div>
        )}
      </button>
    </div>
  );
}

const DAY_PRESETS = ["Push", "Pull", "Legs", "Upper", "Lower", "Full Body", "Arms", "Rest"];

function AddDaySheet(props: {
  editingDay: SplitDay | null;
  onClose: () => void;
  onCreate: (name: string) => void;
}) {
  const [name, setName] = useState(props.editingDay?.name ?? "");
  const isEdit = Boolean(props.editingDay);
  const submit = () => {
    if (name.trim()) props.onCreate(name.trim());
  };

  return (
    <Sheet onClose={props.onClose}>
      <div className="mb-1 text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">
        {isEdit ? "rename day" : "new day"}
      </div>
      <h3 className="mb-2 font-serif text-[28px]">
        {isEdit ? "Rename your day" : "Name your day"}
      </h3>
      <p className="mb-4 text-sm text-text-dim">
        Tap a name or type your own. You can rename it any time.
      </p>
      <div className="mb-4 flex flex-wrap gap-2">
        {DAY_PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => setName(p)}
            className={`rounded-full border px-4 py-2 text-[13px] font-medium tracking-wide uppercase transition-colors ${
              name === p
                ? "border-accent text-accent"
                : "border-border text-text-dim active:border-white/35"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Or type a name"
        className="mb-5 w-full rounded-full border border-white/15 bg-transparent px-4 py-3 text-[16px] outline-none placeholder:text-text-dim/50"
      />
      <button
        onClick={submit}
        disabled={!name.trim()}
        className="w-full rounded-full bg-accent px-7 py-3.5 text-center font-serif text-[20px] text-black italic disabled:opacity-40"
      >
        {isEdit ? "save" : "create the day"}
      </button>
    </Sheet>
  );
}

// ================= PART 4 — the exercise library =================

function LibraryScreen(props: {
  exercises: Exercise[];
  dayName: string;
  dayExerciseIds: Set<string>;
  onToggle: (name: string, included: boolean) => void;
  onInfo: (name: string) => void;
  onBack: () => void;
}) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();

  // Any of the user's own lifts that aren't already in the catalog get their
  // own "Your lifts" group at the top, so nothing they track goes missing.
  const catalogNames = new Set(
    LIBRARY.flatMap((g) => g.items.map((i) => i.toLowerCase())),
  );
  const custom = props.exercises
    .map((e) => e.name)
    .filter((n) => !catalogNames.has(n.toLowerCase()));
  const groups = custom.length
    ? [{ group: "Your lifts", items: custom }, ...LIBRARY]
    : LIBRARY;

  const shown = query
    ? groups
        .map((g) => ({
          group: g.group,
          items: g.items.filter((i) => i.toLowerCase().includes(query)),
        }))
        .filter((g) => g.items.length > 0)
    : groups;
  const exact = groups.some((g) => g.items.some((i) => i.toLowerCase() === query));

  const isIncluded = (name: string) =>
    props.exercises.some(
      (e) =>
        e.name.toLowerCase() === name.toLowerCase() && props.dayExerciseIds.has(e.id),
    );

  return (
    <div className="pb-6">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={props.onBack}
          className="flex items-center gap-1 font-serif text-[16px] text-text-dim italic"
        >
          <ChevronLeft size={14} /> session
        </button>
        <span className="text-xs text-text-dim">
          {props.dayExerciseIds.size} in your session
        </span>
      </div>
      <h2 className="mb-4 font-serif text-[36px] leading-none">Library</h2>

      <div className="mb-5 flex items-center gap-2 rounded-full border border-border px-4 py-3">
        <Search size={16} className="shrink-0 text-text-dim" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search any exercise…"
          className="w-full bg-transparent text-[16px] outline-none placeholder:text-text-dim/50"
        />
        {q && (
          <button
            onClick={() => setQ("")}
            aria-label="clear search"
            className="shrink-0 px-1 text-lg text-text-dim/60"
          >
            ×
          </button>
        )}
      </div>

      {shown.map((g) => (
        <div key={g.group} className="mb-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-[0.16em] text-text-dim/60 uppercase">
              {g.group}
            </span>
            <span className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-text-dim">
              {g.items.length}
            </span>
          </div>
          <div className="glass-card rounded-[18px]">
            {g.items.map((name, i) => {
              const included = isIncluded(name);
              return (
                <div
                  key={name}
                  className={`flex items-center gap-3 px-4 py-3.5 ${
                    i > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <button
                    onClick={() => props.onToggle(name, !included)}
                    aria-label={included ? `remove ${name}` : `add ${name}`}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border transition-colors ${
                      included
                        ? "border-accent bg-accent text-black"
                        : "border-white/25 text-transparent"
                    }`}
                  >
                    <Check size={13} strokeWidth={3} />
                  </button>
                  <button
                    onClick={() => props.onToggle(name, !included)}
                    className="min-w-0 flex-1 truncate text-left text-[16px] font-medium"
                  >
                    {name}
                  </button>
                  <button
                    onClick={() => props.onInfo(name)}
                    aria-label={`${name} form info`}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-text-dim transition-colors active:border-accent active:text-accent"
                  >
                    <Info size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {query && !exact && (
        <button
          onClick={() => props.onToggle(q.trim(), true)}
          className="mt-1 w-full rounded-full border border-white/15 px-4 py-3 text-left font-serif text-[18px] italic"
        >
          add “{q.trim()}” as a new lift
        </button>
      )}
    </div>
  );
}

function ExerciseInfoSheet(props: { name: string; onClose: () => void }) {
  const info = getExerciseInfo(props.name);
  return (
    <Sheet onClose={props.onClose}>
      <div className="mb-1 flex items-start justify-between">
        <div className="text-[11px] font-semibold tracking-[0.18em] text-accent uppercase">
          form
        </div>
        <button
          onClick={props.onClose}
          aria-label="close"
          className="text-text-dim/60 active:text-text"
        >
          <X size={20} />
        </button>
      </div>
      <h3 className="mb-2 font-serif text-[32px] italic">{props.name}</h3>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-[12px] text-text-dim">
        <span className="tracking-wide uppercase">{info.muscles.join(" · ")}</span>
        <span className="rounded-full border border-accent/40 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-accent uppercase">
          Tier {info.tier}
        </span>
        <span className="tracking-wide uppercase">{info.equipment}</span>
      </div>
      <p className="mb-4 font-serif text-[19px] italic">{info.tagline}</p>

      <div className="mb-5 flex gap-2.5">
        <div className="flex h-24 flex-1 items-center justify-center rounded-2xl border border-border bg-field">
          <Dumbbell size={26} className="text-text-dim/40" />
        </div>
        <div className="flex h-24 flex-1 items-center justify-center rounded-2xl border border-accent/30 bg-field">
          <Dumbbell size={26} className="text-accent/70" />
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3">
        {info.cues.map((cue, i) => (
          <div key={cue} className="flex items-start gap-3">
            <span className="mt-0.5 font-serif text-[15px] text-accent italic">
              {toRoman(i + 1)}
            </span>
            <span className="text-[15px]">{cue}</span>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {info.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-border px-3.5 py-1.5 text-[13px] text-text-dim"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-4 text-[14px] leading-relaxed text-text-dim">
        {info.coaching}
      </div>
    </Sheet>
  );
}

function CelebrateScreen(props: { data: Celebration; onDone: () => void }) {
  const { items, beats, prs, totalSets } = props.data;
  const headline =
    prs > 0
      ? "New ground."
      : beats > 0
        ? "Stronger than last time."
        : "Session in the books.";
  const beaten = items.filter((it) => it.grade === "pr" || it.grade === "beat");

  return (
    <div className="py-4">
      <div className="text-[11px] font-semibold tracking-[0.18em] text-text-dim/60 uppercase">
        Today, logged
      </div>
      <h2 className="mt-2 font-serif text-[44px] leading-[1.05] italic">
        {headline}
      </h2>
      <p className="mt-3 text-[15px] text-text-dim">
        {items.length} {items.length === 1 ? "lift" : "lifts"} · {totalSets}{" "}
        {totalSets === 1 ? "set" : "sets"}
        {prs > 0 && (
          <span style={{ color: AMBER }}>
            {" · "}
            {prs} PR{prs > 1 ? "s" : ""}
          </span>
        )}
        {beats > 0 && (
          <span style={{ color: MINT }}>
            {" · "}
            {beats} beat
          </span>
        )}
      </p>

      <div className="mt-7 mb-2 text-[11px] font-semibold tracking-[0.16em] text-text-dim/60 uppercase">
        What you lifted
      </div>
      <div className="glass-card rounded-[18px]">
        {items.map((it, i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-t border-border px-5 py-3.5 first:border-t-0"
          >
            <span className="min-w-0 flex-1 truncate font-serif text-[22px] italic">
              {it.name}
            </span>
            <span className="text-right text-sm text-text-dim">
              {it.setCount} {it.setCount === 1 ? "set" : "sets"} · top{" "}
              {fmt(it.top.weight)}
              {UNIT} × {it.top.reps}
            </span>
            <GradeBadge grade={it.grade} />
          </div>
        ))}
      </div>

      {beaten.length > 0 ? (
        <>
          <div className="mt-7 mb-2 text-[11px] font-semibold tracking-[0.16em] text-text-dim/60 uppercase">
            What you beat
          </div>
          <div className="flex flex-col gap-2">
            {beaten.map((it, i) => (
              <div
                key={i}
                className="glass-card flex items-center gap-3 rounded-2xl px-5 py-3"
              >
                <GradeBadge grade={it.grade} />
                <span className="min-w-0 flex-1 truncate font-serif text-[20px] italic">
                  {it.name}
                </span>
                <span className="text-sm text-text-dim">
                  {fmt(it.top.weight)}
                  {UNIT} × {it.top.reps}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-7 font-serif text-[20px] text-text-dim italic">
          No records today — showing up is the streak that counts.
        </p>
      )}

      <button
        onClick={props.onDone}
        className="mt-8 w-full rounded-full bg-accent px-7 py-4 font-serif text-[22px] text-black italic"
      >
        done
      </button>
    </div>
  );
}
