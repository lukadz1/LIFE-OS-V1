import { Check, Pencil, Trash2 } from "lucide-react";
import type { LifeArea, Task } from "../../types";
import { formatDateLabel } from "../../utils/date";
import { PRIORITY_STYLES } from "./priorityStyles";

interface TodoItemProps {
  task: Task;
  area?: LifeArea;
  onToggleComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function TodoItem({
  task,
  area,
  onToggleComplete,
  onEdit,
  onDelete,
}: TodoItemProps) {
  const overdue =
    !task.completed &&
    !!task.dueDate &&
    new Date(task.dueDate) < new Date(new Date().toDateString());
  const style = PRIORITY_STYLES[task.priority];

  return (
    <div className="group flex items-center gap-3 rounded-[14px] px-2 py-2 transition-colors hover:bg-hover">
      <button
        onClick={onToggleComplete}
        aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
        className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors ${
          task.completed
            ? "border-accent bg-accent text-accent-contrast"
            : "border-check text-transparent hover:border-accent"
        }`}
      >
        <Check size={13} strokeWidth={3} />
      </button>

      <span
        className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`}
        title={`${style.label} priority`}
      />

      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-[15px] ${
            task.completed ? "text-text-dim line-through" : "text-text"
          }`}
        >
          {task.title}
        </p>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-text-dim">
          {area && (
            <span className="flex items-center gap-1">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: area.color }}
              />
              {area.label}
            </span>
          )}
          <span className={overdue ? "font-medium text-[#ff453a]" : ""}>
            {formatDateLabel(task.dueDate)}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 opacity-60 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <button
          onClick={onEdit}
          aria-label="Edit task"
          className="rounded-lg p-1.5 text-text-dim transition-colors hover:bg-hover hover:text-text"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={onDelete}
          aria-label="Delete task"
          className="rounded-lg p-1.5 text-text-dim transition-colors hover:bg-[#ff453a]/10 hover:text-[#ff453a]"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
