import { ChevronLeft, Moon, Settings, Sun } from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";
import { NavBar, VIEWS, type ViewId } from "./components/layout/NavBar";
import { SettingsModal } from "./components/settings/SettingsModal";
import { readStorage, writeStorage } from "./data/storage";
import { useLifeAreas } from "./hooks/useLifeAreas";
import { useProfile } from "./hooks/useProfile";
import { getTimeGreeting } from "./utils/date";
import { CalendarView } from "./views/CalendarView";
import { FinanceView } from "./views/FinanceView";
import { FitnessView } from "./views/FitnessView";
import { FuelView } from "./views/FuelView";
import { GoalsView } from "./views/GoalsView";
import { HabitsView } from "./views/HabitsView";
import { HomeView } from "./views/HomeView";
import { PeakView } from "./views/PeakView";
import { TodosView } from "./views/TodosView";

type Theme = "dark" | "light";

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  /** On the Home view we drop the "Life OS" title block and lead with the
   * greeting hero, keeping only the controls in a slim right-aligned row. */
  minimal?: boolean;
}

function HeaderControls({
  theme,
  onToggleTheme,
  onOpenSettings,
}: Omit<HeaderProps, "minimal">) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 font-mono text-xs text-text-dim">
        <span
          className="animate-status-pulse h-2 w-2 rounded-full"
          style={{ backgroundColor: "#34d399", "--color-accent": "#34d399" } as CSSProperties}
        />
        On track
      </div>
      <button
        onClick={onToggleTheme}
        aria-label={
          theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
        }
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-text-dim transition-colors hover:text-text"
      >
        {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
      </button>
      <button
        onClick={onOpenSettings}
        aria-label="Your data settings"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface text-text-dim transition-colors hover:text-text"
      >
        <Settings size={15} />
      </button>
    </div>
  );
}

function Header({ theme, onToggleTheme, onOpenSettings, minimal }: HeaderProps) {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  if (minimal) {
    return (
      <header className="mb-4 flex justify-end">
        <HeaderControls
          theme={theme}
          onToggleTheme={onToggleTheme}
          onOpenSettings={onOpenSettings}
        />
      </header>
    );
  }

  return (
    <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="font-mono text-[11px] tracking-[0.14em] text-text-dim uppercase">
          {today}
        </p>
        <h1 className="gradient-title mt-0.5 font-serif text-[38px] font-normal tracking-tight italic sm:text-[46px]">
          Life OS
        </h1>
        <p className="mt-1 text-[15px] text-text-dim italic">
          {getTimeGreeting()}, Luka
        </p>
      </div>
      <div className="mb-1">
        <HeaderControls
          theme={theme}
          onToggleTheme={onToggleTheme}
          onOpenSettings={onOpenSettings}
        />
      </div>
    </header>
  );
}

function App() {
  const { areas, loading: areasLoading } = useLifeAreas();
  const [view, setView] = useState<ViewId>("home");
  const [slideDir, setSlideDir] = useState<"left" | "right">("right");
  const [theme, setTheme] = useState<Theme>(() =>
    readStorage<Theme>("theme", "dark"),
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { profile, saveProfile } = useProfile();

  const handleViewChange = (next: ViewId) => {
    if (next === view) return;
    const order: readonly ViewId[] = VIEWS.map((v) => v.id);
    setSlideDir(order.indexOf(next) > order.indexOf(view) ? "right" : "left");
    setView(next);
  };

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    writeStorage("theme", theme);
  }, [theme]);

  const isHome = view === "home";

  return (
    <div className="mx-auto min-h-screen max-w-[1600px] px-4 py-6 sm:px-6 lg:px-10">
      <Header
        theme={theme}
        onToggleTheme={() =>
          setTheme((t) => (t === "dark" ? "light" : "dark"))
        }
        onOpenSettings={() => setSettingsOpen(true)}
        minimal={isHome}
      />
      <SettingsModal
        open={settingsOpen}
        profile={profile}
        onClose={() => setSettingsOpen(false)}
        onSave={(next) => {
          saveProfile(next);
          setSettingsOpen(false);
        }}
      />
      {!isHome && (
        <div className="mb-3">
          <button
            onClick={() => handleViewChange("home")}
            className="flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1.5 text-[13px] font-medium text-text-dim transition-colors hover:text-text"
          >
            <ChevronLeft size={14} />
            Back
          </button>
        </div>
      )}
      {!isHome && <NavBar active={view} onChange={handleViewChange} />}
      <main
        key={view}
        className={`motion-reduce:animate-none ${
          slideDir === "right"
            ? "animate-view-in-right"
            : "animate-view-in-left"
        }`}
      >
        {view === "home" && (
          <HomeView
            areas={areas}
            areasLoading={areasLoading}
            onNavigate={handleViewChange}
          />
        )}
        {view === "todos" && <TodosView areas={areas} />}
        {view === "calendar" && <CalendarView areas={areas} />}
        {view === "finance" && <FinanceView />}
        {view === "fitness" && <FitnessView />}
        {view === "habits" && <HabitsView areas={areas} />}
        {view === "fuel" && <FuelView />}
        {view === "peak" && <PeakView />}
        {view === "goals" && <GoalsView areas={areas} />}
      </main>
    </div>
  );
}

export default App;
