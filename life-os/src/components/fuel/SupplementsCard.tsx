import { Plus, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Panel } from "../layout/Panel";

interface SupplementsCardProps {
  list: string[];
  checkedToday: Set<string>;
  onToggle: (name: string) => void;
  onAdd: (name: string) => void;
  onRemove: (name: string) => void;
  className?: string;
}

export function SupplementsCard({
  list,
  checkedToday,
  onToggle,
  onAdd,
  onRemove,
  className = "",
}: SupplementsCardProps) {
  const [name, setName] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim());
    setName("");
  }

  return (
    <Panel
      title="Supplements"
      subtitle={`${checkedToday.size} of ${list.length} today`}
      className={className}
    >
      <form onSubmit={handleSubmit} className="mb-3 flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add supplement"
          className="min-w-0 flex-1 rounded-[10px] bg-field px-3 py-2 text-sm text-text placeholder:text-text-dim focus:ring-2 focus:ring-accent focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Add supplement"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-contrast transition-opacity hover:opacity-90"
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
      </form>

      {list.length === 0 ? (
        <p className="py-4 text-center text-sm text-text-dim">
          Add a supplement to start tracking.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2.5 pt-1">
          {list.map((item) => {
            const checked = checkedToday.has(item);
            return (
              <div key={item} className="group relative">
                <button
                  onClick={() => onToggle(item)}
                  className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                    checked
                      ? "bg-accent text-accent-contrast"
                      : "bg-field text-text-dim hover:text-text"
                  }`}
                >
                  {item}
                </button>
                <button
                  onClick={() => onRemove(item)}
                  aria-label={`Remove ${item} from list`}
                  className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-surface-raised text-text-dim opacity-0 transition-opacity group-hover:opacity-100 hover:text-[#ff453a] focus-visible:opacity-100"
                >
                  <X size={10} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
