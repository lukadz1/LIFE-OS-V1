import { GreetingHero } from "../components/home/GreetingHero";
import { LauncherCard } from "../components/home/LauncherCard";
import type { ViewId } from "../components/layout/NavBar";

interface HomeViewProps {
  onNavigate: (view: ViewId) => void;
}

const ACCENT = "var(--color-accent)";

export function HomeView({ onNavigate }: HomeViewProps) {
  return (
    <div>
      <GreetingHero name="Luka" />
      <div className="home-bento">
        <LauncherCard
          index={5}
          title="Todays fuel"
          subtitle="Water, caffeine & meals"
          tint={ACCENT}
          className="area-fuel min-h-[200px]"
          onOpen={() => onNavigate("fuel")}
        />
        <LauncherCard
          index={6}
          title="Peak Tracker"
          subtitle="Today's energy curve"
          tint={ACCENT}
          className="area-peak min-h-[180px]"
          onOpen={() => onNavigate("peak")}
        />
        <LauncherCard
          index={8}
          title="Calories"
          subtitle="KCAL, macros & weight"
          tint={ACCENT}
          className="area-calories min-h-[180px]"
          onOpen={() => onNavigate("calories")}
        />
        <LauncherCard
          index={1}
          title="ToDos"
          subtitle="Tasks & priorities"
          tint={ACCENT}
          className="area-todos min-h-[180px]"
          onOpen={() => onNavigate("todos")}
        />
        <LauncherCard
          index={2}
          title="Finance"
          subtitle="Net worth & spending"
          tint={ACCENT}
          className="area-finance min-h-[180px]"
          onOpen={() => onNavigate("finance")}
        />
        <LauncherCard
          index={7}
          title="Goals"
          subtitle="Progress & targets"
          tint={ACCENT}
          className="area-goals min-h-[200px]"
          onOpen={() => onNavigate("goals")}
        />
        <LauncherCard
          index={3}
          title="Fitness"
          subtitle="Lifts & progression"
          tint={ACCENT}
          className="area-fitness min-h-[180px]"
          onOpen={() => onNavigate("fitness")}
        />
        <LauncherCard
          index={4}
          title="Habits"
          subtitle="Streaks & routines"
          tint={ACCENT}
          className="area-habits min-h-[180px]"
          onOpen={() => onNavigate("habits")}
        />
      </div>
    </div>
  );
}
