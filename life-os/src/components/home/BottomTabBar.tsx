import {
  CalendarDays,
  GraduationCap,
  SquareCheck,
  Target,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { createPortal } from "react-dom";
import type { ViewId } from "../layout/NavBar";

interface TabItem {
  id: ViewId;
  label: string;
  icon: LucideIcon;
}

const TABS: TabItem[] = [
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "school", label: "School", icon: GraduationCap },
  { id: "finance", label: "Finance", icon: Wallet },
  { id: "todos", label: "ToDos", icon: SquareCheck },
  { id: "goals", label: "Goals", icon: Target },
];

interface BottomTabBarProps {
  onSelect: (id: ViewId) => void;
}

// Portaled to <body> — the Home view it would otherwise render inside is
// CSS-animated (transform on enter/exit), and a transformed ancestor becomes
// the containing block for `position: fixed`, which would drag this bar
// along with the page instead of pinning it to the viewport.
export function BottomTabBar({ onSelect }: BottomTabBarProps) {
  return createPortal(
    <nav
      className="fixed bottom-[max(0.9rem,env(safe-area-inset-bottom))] left-1/2 z-30 w-[min(92vw,600px)] -translate-x-1/2"
      aria-label="Jump to area"
    >
      <div className="glass-card flex items-center gap-0.5 overflow-x-auto rounded-[22px] p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className="group flex shrink-0 flex-col items-center gap-1 rounded-2xl px-3 py-1.5 transition-colors hover:bg-hover"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full text-text-dim transition-colors group-hover:text-accent">
              <Icon size={18} strokeWidth={2} />
            </span>
            <span className="font-mono text-[9px] tracking-wide text-text-dim uppercase transition-colors group-hover:text-text">
              {label}
            </span>
          </button>
        ))}
      </div>
    </nav>,
    document.body,
  );
}
