import { Check, ChevronLeft, Search } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { useExercises } from "../hooks/useExercises";
import type { Exercise, SetLog } from "../types";
import { createId } from "../utils/id";

const MINT = "#34d399";
const AMBER = "#f59e0b";

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
  };
}

type Screen =
  | { name: "today" }
  | { name: "list" }
  | { name: "celebrate" }
  | { name: "chart" | "history"; id: string };
type Sheet =
  | { mode: "log"; id: string }
  | { mode: "add" }
  | { mode: "session-add" }
  | { mode: "session-swap"; exId: string }
  | { mode: "swap"; id: string }
  | null;
type ToastKind = "mint" | "amber" | "neutral";

export function FitnessView() {
  const {
    loading,
    exercises,
    setLogs,
    addExercise,
    renameExercise,
    deleteExercise,
    logSet,
    deleteSet,
  } = useExercises();

  const [screen, setScreen] = useState<Screen>({ name: "today" });
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
  // Add a lift to the session by name — reuse an existing lift, or create it.
  // Keeps the library open so several can be added in a row.
  const addExerciseByName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const existing = exercises.find(
      (e) => e.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (existing) {
      setSession((prev) =>
        prev.some((e) => e.exerciseId === existing.id)
          ? prev
          : [...prev, { exerciseId: existing.id, sets: [] }],
      );
    } else {
      const id = addExercise(newExercise(trimmed));
      setSession((prev) => [...prev, { exerciseId: id, sets: [] }]);
    }
  };
  // Replace one exercise in the session with another, carrying the sets already
  // logged under it. No persistent history is touched — only the draft moves.
  const swapSessionExercise = (fromExId: string, toName: string) => {
    const trimmed = toName.trim();
    if (!trimmed) return;
    const existing = exercises.find(
      (e) => e.name.toLowerCase() === trimmed.toLowerCase(),
    );
    const toId = existing ? existing.id : addExercise(newExercise(trimmed));
    setSheet(null);
    if (toId === fromExId) return;
    setSession((prev) => {
      const src = prev.find((e) => e.exerciseId === fromExId);
      if (!src) return prev;
      const targetExists = prev.some((e) => e.exerciseId === toId);
      if (!targetExists) {
        return prev.map((e) =>
          e.exerciseId === fromExId ? { ...e, exerciseId: toId } : e,
        );
      }
      // Target already in the session — merge the moved sets into it.
      return prev
        .map((e) =>
          e.exerciseId === toId ? { ...e, sets: [...e.sets, ...src.sets] } : e,
        )
        .filter((e) => e.exerciseId !== fromExId);
    });
    showToast("swapped");
  };
  const removeSessionEntry = (exId: string) =>
    setSession((prev) => prev.filter((e) => e.exerciseId !== exId));
  const removeSessionSet = (exId: string, setId: string) =>
    setSession((prev) =>
      prev.map((e) =>
        e.exerciseId === exId
          ? { ...e, sets: e.sets.filter((s) => s.id !== setId) }
          : e,
      ),
    );
  const doFinish = () => {
    const items: CelebrationItem[] = [];
    let beats = 0;
    let prs = 0;
    let totalSets = 0;
    for (const entry of session) {
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
    for (const entry of session)
      for (const s of entry.sets) logSet(entry.exerciseId, s.weight, s.reps);
    setCelebration({ items, beats, prs, totalSets });
    setSession([]);
    setScreen({ name: "celebrate" });
  };

  // ---------- screens ----------
  let body: ReactNode;
  if (screen.name === "celebrate" && celebration) {
    body = (
      <CelebrateScreen
        data={celebration}
        onDone={() => setScreen({ name: "today" })}
      />
    );
  } else if (screen.name === "chart" && byId[screen.id]) {
    body = (
      <ChartScreen
        exercise={byId[screen.id]}
        sets={setsFor(setLogs, screen.id)}
        onBack={() => setScreen({ name: "list" })}
        onLog={() => setSheet({ mode: "log", id: screen.id })}
      />
    );
  } else if (screen.name === "history" && byId[screen.id]) {
    body = (
      <HistoryScreen
        exercise={byId[screen.id]}
        sets={setsFor(setLogs, screen.id)}
        onBack={() => setScreen({ name: "list" })}
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
        onChart={(id) => setScreen({ name: "chart", id })}
        onHistory={(id) => setScreen({ name: "history", id })}
      />
    );
  } else {
    body = (
      <TodayScreen
        session={session}
        byId={byId}
        setLogs={setLogs}
        onAddExercise={() => setSheet({ mode: "session-add" })}
        onLogSet={logIntoSession}
        onRemoveSet={removeSessionSet}
        onRemoveEntry={removeSessionEntry}
        onSwapEntry={(exId) => setSheet({ mode: "session-swap", exId })}
        onFinish={doFinish}
      />
    );
  }

  const showTabs = screen.name === "today" || screen.name === "list";

  return (
    <div className="animate-view-in-right motion-reduce:animate-none">
      {showTabs && (
        <Tabs
          active={screen.name === "today" ? "today" : "lifts"}
          onToday={() => setScreen({ name: "today" })}
          onLifts={() => setScreen({ name: "list" })}
        />
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
      {sheet?.mode === "session-add" && (
        <LibrarySheet
          exercises={exercises}
          heading="exercise library"
          subtitle="Search or browse by muscle — tap to add."
          closeLabel="done"
          markAdded
          inSessionNames={
            new Set(
              session
                .map((e) => byId[e.exerciseId]?.name.toLowerCase())
                .filter((n): n is string => Boolean(n)),
            )
          }
          onPick={addExerciseByName}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet?.mode === "session-swap" && (
        <LibrarySheet
          exercises={exercises}
          heading="swap exercise"
          subtitle="Pick a replacement — your logged sets come with it."
          closeLabel="cancel"
          markAdded={false}
          inSessionNames={new Set()}
          onPick={(name) => swapSessionExercise(sheet.exId, name)}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet?.mode === "swap" && byId[sheet.id] && (
        <SwapSheet
          exercise={byId[sheet.id]}
          onClose={() => setSheet(null)}
          onSave={(name) => doSwap(sheet.id, name)}
          onRemove={() => doRemoveExercise(sheet.id)}
        />
      )}

      {toast && (
        <div
          className={`fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-full border px-5 py-2.5 font-serif text-[19px] italic whitespace-nowrap ${
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
    </div>
  );
}

// ---------- tabs ----------
function Tabs(props: {
  active: "today" | "lifts";
  onToday: () => void;
  onLifts: () => void;
}) {
  const pill = (on: boolean) =>
    `rounded-full px-5 py-2 font-serif text-[18px] lowercase italic transition-colors ${
      on ? "bg-white/10 text-text" : "text-text-dim"
    }`;
  return (
    <div className="mb-5 inline-flex rounded-full border border-border p-1">
      <button className={pill(props.active === "today")} onClick={props.onToday}>
        today
      </button>
      <button className={pill(props.active === "lifts")} onClick={props.onLifts}>
        lifts
      </button>
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
    <article className="mb-3.5 rounded-[18px] border border-border px-5 pt-5 pb-3.5">
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
      className={`min-h-11 flex-1 py-2 font-serif text-[19px] lowercase italic transition-colors active:text-accent ${
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
          <div className="mt-6 rounded-[18px] border border-border p-4">
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
    <div className="flex-1 rounded-2xl border border-border px-3.5 py-4">
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
        <path d={area} fill="#34d399" fillOpacity={0.08} />
        <path
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
        className="fixed inset-x-0 bottom-0 z-[41] mx-auto max-w-[460px] rounded-t-[26px] border-x border-t border-white/10 px-5.5 pt-2.5 pb-8"
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

// ================= PART 2 — today's session =================

function TodayScreen(props: {
  session: SessionEntry[];
  byId: Record<string, Exercise>;
  setLogs: SetLog[];
  onAddExercise: () => void;
  onLogSet: (exId: string, w: number, r: number) => void;
  onRemoveSet: (exId: string, setId: string) => void;
  onRemoveEntry: (exId: string) => void;
  onSwapEntry: (exId: string) => void;
  onFinish: () => void;
}) {
  const live = props.session.filter((e) => props.byId[e.exerciseId]);
  const totalSets = live.reduce((a, e) => a + e.sets.length, 0);

  if (live.length === 0) {
    return (
      <div className="py-6">
        <p className="mb-7 max-w-[22ch] font-serif text-[26px] leading-snug italic">
          A fresh session. Add a lift and log your first set.
        </p>
        <button
          onClick={props.onAddExercise}
          className="rounded-full bg-accent px-7 py-3.5 font-serif text-[20px] text-black italic"
        >
          add an exercise
        </button>
      </div>
    );
  }

  return (
    <div className="pb-4">
      <div className="mb-3.5 ml-0.5 text-[11px] font-semibold tracking-[0.16em] text-text-dim/60 uppercase">
        Today’s session · {totalSets} {totalSets === 1 ? "set" : "sets"}
      </div>
      {live.map((entry, i) => {
        const ex = props.byId[entry.exerciseId];
        return (
          <SessionCard
            key={entry.exerciseId}
            index={i}
            exercise={ex}
            entry={entry}
            setLogs={props.setLogs}
            onLog={(w, r) => props.onLogSet(entry.exerciseId, w, r)}
            onRemoveSet={(sid) => props.onRemoveSet(entry.exerciseId, sid)}
            onSwap={() => props.onSwapEntry(entry.exerciseId)}
            onRemove={() => props.onRemoveEntry(entry.exerciseId)}
          />
        );
      })}
      <button
        onClick={props.onAddExercise}
        className="mt-1 w-full rounded-full border border-white/15 px-7 py-3 font-serif text-[19px] text-text-dim italic"
      >
        add an exercise
      </button>
      {totalSets > 0 && (
        <button
          onClick={props.onFinish}
          className="mt-4 w-full rounded-full bg-accent px-7 py-4 font-serif text-[22px] text-black italic shadow-[0_10px_30px_rgba(251,86,7,0.28)]"
        >
          finish session
        </button>
      )}
    </div>
  );
}

function SessionCard(props: {
  index: number;
  exercise: Exercise;
  entry: SessionEntry;
  setLogs: SetLog[];
  onLog: (w: number, r: number) => void;
  onRemoveSet: (setId: string) => void;
  onSwap: () => void;
  onRemove: () => void;
}) {
  const history = setsFor(props.setLogs, props.exercise.id);
  const base = baselineFor(history);
  const lastSess = props.entry.sets[props.entry.sets.length - 1];
  const lastHist = history[history.length - 1];
  const initial = lastSess
    ? { weight: lastSess.weight, reps: lastSess.reps }
    : lastHist
      ? { weight: lastHist.weight, reps: lastHist.reps }
      : {
          weight: props.exercise.startWeight || 20,
          reps: props.exercise.repMin || 5,
        };

  return (
    <article className="mb-3.5 rounded-[18px] border border-border px-5 pt-5 pb-4">
      <div className="flex items-center gap-3">
        <span className="min-w-[22px] font-serif text-[17px] text-text-dim/50 italic">
          {toRoman(props.index + 1)}
        </span>
        <h3 className="min-w-0 flex-1 truncate font-serif text-[25px] leading-tight italic">
          {props.exercise.name}
        </h3>
        <button
          onClick={props.onSwap}
          className="font-serif text-[16px] text-text-dim/50 italic active:text-accent"
        >
          swap
        </button>
        <button
          onClick={props.onRemove}
          className="font-serif text-[16px] text-text-dim/50 italic active:text-[#ff6b5b]"
        >
          remove
        </button>
      </div>

      {props.entry.sets.length > 0 ? (
        <div className="mt-3">
          {props.entry.sets.map((s, i) => (
            <div
              key={s.id}
              className="flex items-center gap-3 border-t border-border py-2.5 first:border-t-0"
            >
              <span className="min-w-[24px] font-serif text-[14px] text-text-dim/50 italic">
                {toRoman(i + 1)}
              </span>
              <span className="flex-1 text-[17px] font-semibold">
                {fmt(s.weight)}
                <span className="text-sm font-normal text-text-dim"> {UNIT}</span>{" "}
                × {s.reps}
              </span>
              <GradeBadge grade={gradeValue(epley(s.weight, s.reps), base)} />
              <button
                onClick={() => props.onRemoveSet(s.id)}
                aria-label="remove set"
                className="ml-1 px-1 text-lg text-text-dim/40 active:text-[#ff6b5b]"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-text-dim/70">
          No sets yet — log your first below.
        </p>
      )}

      <InlineLogger
        exercise={props.exercise}
        initial={initial}
        onLog={props.onLog}
      />
    </article>
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

function InlineLogger(props: {
  exercise: Exercise;
  initial: { weight: number; reps: number };
  onLog: (w: number, r: number) => void;
}) {
  const [w, setW] = useState(props.initial.weight);
  const [r, setR] = useState(props.initial.reps);
  return (
    <div className="mt-3 rounded-2xl border border-border p-3">
      <div className="flex gap-3">
        <CompactStepper
          label={`weight · ${UNIT}`}
          value={w}
          step={props.exercise.step || 2.5}
          onChange={setW}
        />
        <CompactStepper label="reps" value={r} step={1} onChange={setR} />
      </div>
      <button
        onClick={() => {
          if (r > 0) props.onLog(w, r);
        }}
        className="mt-3 w-full rounded-full border border-white/15 py-2.5 font-serif text-[18px] text-text italic active:border-accent active:text-accent"
      >
        log set
      </button>
    </div>
  );
}

function LibrarySheet(props: {
  exercises: Exercise[];
  inSessionNames: Set<string>;
  heading: string;
  subtitle: string;
  closeLabel: string;
  markAdded: boolean;
  onPick: (name: string) => void;
  onClose: () => void;
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
  const exact = groups.some((g) =>
    g.items.some((i) => i.toLowerCase() === query),
  );

  return (
    <Sheet onClose={props.onClose}>
      <h3 className="font-serif text-[30px]">{props.heading}</h3>
      <div className="mb-3 text-sm text-text-dim">{props.subtitle}</div>

      <div className="mb-3 flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5">
        <Search size={16} className="shrink-0 text-text-dim" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search exercises…"
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

      <div className="max-h-[46vh] overflow-y-auto pr-1">
        {shown.map((g) => (
          <div key={g.group} className="mb-4">
            <div className="mb-2 text-[11px] font-semibold tracking-[0.16em] text-text-dim/60 uppercase">
              {g.group}
            </div>
            <div className="flex flex-wrap gap-2">
              {g.items.map((name) => {
                const added =
                  props.markAdded && props.inSessionNames.has(name.toLowerCase());
                return (
                  <button
                    key={name}
                    disabled={added}
                    onClick={() => props.onPick(name)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 font-serif text-[17px] italic ${
                      added
                        ? "border-[#34d399]/50 text-[#34d399]"
                        : "border-border text-text active:border-white/35"
                    }`}
                  >
                    {name}
                    {added && <Check size={14} />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {query && !exact && (
          <button
            onClick={() => props.onPick(q.trim())}
            className="mt-1 mb-2 w-full rounded-full border border-white/15 px-4 py-3 text-left font-serif text-[18px] italic"
          >
            add “{q.trim()}” as a new lift
          </button>
        )}
      </div>

      <button
        onClick={props.onClose}
        className="mt-4 w-full rounded-full bg-accent px-7 py-3.5 font-serif text-[20px] text-black italic"
      >
        {props.closeLabel}
      </button>
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
      <div className="rounded-[18px] border border-border">
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
                className="flex items-center gap-3 rounded-2xl border border-border px-5 py-3"
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
