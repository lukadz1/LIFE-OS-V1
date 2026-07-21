import { Flame } from "lucide-react";
import { useState } from "react";
import { readStorage, writeStorage } from "../../data/storage";

const AMBER = "#f59e0b";

interface StreakState {
  count: number;
  /** Local day of the most recent check-in, "YYYY-MM-DD"; "" if never lit. */
  lastDay: string;
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}
function shiftDay(d: Date, delta: number): string {
  const c = new Date(d);
  c.setDate(c.getDate() + delta);
  return dayKey(c);
}

// A streak that rides on top of every screen. Show up and it stays lit; tap it
// once a day to count another day in a row. Miss a day and the flame goes cold
// until the next tap starts it over. Persisted on-device like the rest of the app.
export function StreakChip() {
  const [state, setState] = useState<StreakState>(() =>
    readStorage<StreakState>("streak", { count: 0, lastDay: "" }),
  );
  const [pop, setPop] = useState(false);
  const [nudge, setNudge] = useState(false);

  const now = new Date();
  const today = dayKey(now);
  const yesterday = shiftDay(now, -1);
  const keptToday = state.lastDay === today;
  const alive = state.lastDay === today || state.lastDay === yesterday;
  // A cold flame (missed a day) reads as zero until the next tap revives it.
  const displayCount = alive ? state.count : 0;

  const persist = (next: StreakState) => {
    setState(next);
    writeStorage("streak", next);
  };

  const tap = () => {
    if (keptToday) {
      // Already counted today — a small acknowledging shake, no double count.
      setNudge(true);
      window.setTimeout(() => setNudge(false), 420);
      try {
        navigator.vibrate?.(8);
      } catch {
        /* no haptics */
      }
      return;
    }
    // Continuing yesterday's streak adds a day; anything older starts fresh at 1.
    const nextCount = state.lastDay === yesterday ? state.count + 1 : 1;
    persist({ count: nextCount, lastDay: today });
    setPop(true);
    window.setTimeout(() => setPop(false), 520);
    try {
      navigator.vibrate?.([10, 30, 12]);
    } catch {
      /* no haptics */
    }
  };

  return (
    <div className="group relative">
      <button
        onClick={tap}
        aria-label={
          keptToday
            ? `Day streak: ${displayCount}. Kept today.`
            : `Day streak: ${displayCount}. Tap to keep the flame.`
        }
        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs transition-colors ${
          keptToday
            ? "border-[#f59e0b]/45 text-[#f59e0b]"
            : "border-border text-text-dim hover:text-text"
        } ${nudge ? "animate-streak-nudge motion-reduce:animate-none" : ""}`}
      >
        <Flame
          size={14}
          className={pop ? "animate-flame-pop motion-reduce:animate-none" : ""}
          style={{ color: keptToday ? AMBER : undefined, opacity: keptToday ? 1 : 0.75 }}
          fill={keptToday ? AMBER : "none"}
          strokeWidth={keptToday ? 1.5 : 2}
        />
        <b className="font-semibold tabular-nums">{displayCount}</b>
      </button>

      {/* The reference caption — revealed on hover (desktop) or focus (tap). */}
      <div
        className="pointer-events-none absolute top-full right-0 z-[60] mt-2 whitespace-nowrap rounded-xl border border-border px-3.5 py-2.5 text-right opacity-0 shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none"
        style={{ background: "#0c0c0c" }}
      >
        <div className="font-mono text-[10px] tracking-[0.16em] text-text-dim/70 uppercase">
          {alive ? "Day streak" : "Streak reset"}
        </div>
        <div className="mt-0.5 text-[11px] text-text-dim">
          {keptToday ? "Kept today — see you tomorrow" : "Tap it · keep the flame"}
        </div>
      </div>
    </div>
  );
}
