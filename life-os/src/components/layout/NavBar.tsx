import { useLayoutEffect, useRef, useState } from "react";

export const VIEWS = [
  { id: "home", label: "Home" },
  { id: "fitness", label: "Fitness" },
  { id: "school", label: "School" },
  { id: "finance", label: "Finance" },
  { id: "calories", label: "KCAL Tracker" },
  { id: "fuel", label: "Todays fuel" },
  { id: "peak", label: "Peak Tracker" },
  { id: "todos", label: "ToDos" },
  { id: "habits", label: "Habits" },
  { id: "goals", label: "Goals" },
] as const;

export type ViewId = (typeof VIEWS)[number]["id"];

interface NavBarProps {
  active: ViewId;
  onChange: (view: ViewId) => void;
}

export function NavBar({ active, onChange }: NavBarProps) {
  const buttonRefs = useRef(new Map<ViewId, HTMLButtonElement>());
  const [pill, setPill] = useState<{ left: number; width: number } | null>(
    null,
  );

  useLayoutEffect(() => {
    const measure = () => {
      const btn = buttonRefs.current.get(active);
      if (btn) setPill({ left: btn.offsetLeft, width: btn.offsetWidth });
    };
    measure();
    // Re-measure when the viewport or loaded fonts change button widths.
    window.addEventListener("resize", measure);
    void document.fonts?.ready.then(measure);
    return () => window.removeEventListener("resize", measure);
  }, [active]);

  return (
    <nav className="sticky top-0 z-20 -mx-4 mb-5 border-b border-border bg-bg/60 px-4 py-2.5 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
      <div className="relative flex w-fit max-w-full gap-[2px] overflow-x-auto rounded-[11px] bg-field p-[2px]">
        {pill && (
          <span
            aria-hidden
            className="absolute top-[2px] bottom-[2px] left-0 rounded-[9px] bg-segment shadow-sm transition-[transform,width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
            style={{
              transform: `translateX(${pill.left}px)`,
              width: pill.width,
            }}
          />
        )}
        {VIEWS.map((view) => (
          <button
            key={view.id}
            ref={(el) => {
              if (el) buttonRefs.current.set(view.id, el);
              else buttonRefs.current.delete(view.id);
            }}
            onClick={() => onChange(view.id)}
            aria-current={active === view.id ? "page" : undefined}
            className={`relative z-10 rounded-[9px] px-3.5 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors ${
              active === view.id
                ? "text-text"
                : "text-text-dim hover:text-text"
            }`}
          >
            {view.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
