import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { CalendarPanel } from "../components/calendar/CalendarPanel";
import { LifeGraphPanel } from "../components/graph/LifeGraph";
import { LauncherCard } from "../components/home/LauncherCard";
import { GreetingHero } from "../components/home/GreetingHero";
import { DashboardGrid } from "../components/layout/DashboardGrid";
import type { ViewId } from "../components/layout/NavBar";
import { ScoresPanel } from "../components/scores/ScoresPanel";
import { TodoPanel } from "../components/todo/TodoPanel";
import type { LifeArea, LifeAreaId } from "../types";

type HomeSub = "launcher" | "dashboard";

interface HomeViewProps {
  areas: LifeArea[];
  areasLoading: boolean;
  onNavigate: (view: ViewId) => void;
}

export function HomeView({ areas, areasLoading, onNavigate }: HomeViewProps) {
  const [sub, setSub] = useState<HomeSub>("launcher");
  const [selectedAreaId, setSelectedAreaId] = useState<LifeAreaId | null>(null);

  if (sub === "launcher") {
    return (
      <div>
        <GreetingHero name="Luka" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <LauncherCard
          index={1}
          title="Main"
          subtitle="Goals & daily plan"
          emoji="🏠"
          tint="#9a9a9e"
          className="min-h-[220px] lg:col-span-5 lg:row-span-2"
          onOpen={() => setSub("dashboard")}
        />
        <LauncherCard
          index={2}
          title="ToDos"
          subtitle="Tasks & priorities"
          emoji="✅"
          tint="#9a9a9e"
          className="min-h-[180px] lg:col-span-7"
          onOpen={() => onNavigate("todos")}
        />
        <LauncherCard
          index={3}
          title="Kalender"
          subtitle="Events & schedule"
          emoji="📅"
          tint="#9a9a9e"
          className="min-h-[180px] lg:col-span-4"
          onOpen={() => onNavigate("calendar")}
        />
        <LauncherCard
          index={4}
          title="Finance"
          subtitle="Net worth & spending"
          emoji="📊"
          tint="#9a9a9e"
          className="min-h-[180px] lg:col-span-5"
          onOpen={() => onNavigate("finance")}
        />
        <LauncherCard
          index={5}
          title="Fitness"
          subtitle="Lifts & progression"
          emoji="💪"
          tint="#9a9a9e"
          className="min-h-[180px] lg:col-span-3"
          onOpen={() => onNavigate("fitness")}
        />
        <LauncherCard
          index={6}
          title="Habits"
          subtitle="Streaks & routines"
          emoji="🔥"
          tint="#9a9a9e"
          className="min-h-[180px] lg:col-span-4"
          onOpen={() => onNavigate("habits")}
        />
        <LauncherCard
          index={7}
          title="Todays fuel"
          subtitle="Water, caffeine & meals"
          emoji="🍽️"
          tint="#9a9a9e"
          className="min-h-[180px] lg:col-span-4"
          onOpen={() => onNavigate("fuel")}
        />
        <LauncherCard
          index={8}
          title="Peak Tracker"
          subtitle="Today's energy curve"
          emoji="⚡"
          tint="#9a9a9e"
          className="min-h-[180px] lg:col-span-4"
          onOpen={() => onNavigate("peak")}
        />
        <LauncherCard
          index={9}
          title="Goals"
          subtitle="Progress & targets"
          emoji="🎯"
          tint="#9a9a9e"
          className="min-h-[180px] lg:col-span-4"
          onOpen={() => onNavigate("goals")}
        />
        </div>
      </div>
    );
  }

  return (
    <div key={sub} className="animate-view-in-right motion-reduce:animate-none">
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => setSub("launcher")}
          className="flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1.5 text-[13px] font-medium text-text-dim transition-colors hover:text-text"
        >
          <ChevronLeft size={14} />
          Home
        </button>
        <span className="font-serif text-[19px] text-text italic">
          Main — Goals & daily plan
        </span>
      </div>

      <DashboardGrid>
        <LifeGraphPanel
          className="lg:col-span-7 lg:row-span-2"
          areas={areas}
          loading={areasLoading}
          selectedAreaId={selectedAreaId}
          onSelectArea={setSelectedAreaId}
        />
        <TodoPanel
          className="lg:col-span-5 lg:row-span-2"
          areas={areas}
          selectedAreaId={selectedAreaId}
          onClearAreaFilter={() => setSelectedAreaId(null)}
        />
        <CalendarPanel
          className="lg:col-span-5"
          areas={areas}
          selectedAreaId={selectedAreaId}
        />
        <ScoresPanel className="lg:col-span-7" />
      </DashboardGrid>
    </div>
  );
}
