import { Filter, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useTasks, type TaskInput } from "../../hooks/useTasks";
import type { LifeArea, LifeAreaId } from "../../types";
import { Panel } from "../layout/Panel";
import { PRIORITY_ORDER } from "./priorityStyles";
import { TodoForm } from "./TodoForm";
import { TodoItem } from "./TodoItem";

interface TodoPanelProps {
  className?: string;
  areas: LifeArea[];
  selectedAreaId: LifeAreaId | null;
  onClearAreaFilter?: () => void;
  hideAreaChip?: boolean;
}

export function TodoPanel({
  className = "",
  areas,
  selectedAreaId,
  onClearAreaFilter,
  hideAreaChip = false,
}: TodoPanelProps) {
  const { tasks, loading, addTask, updateTask, toggleComplete, deleteTask } =
    useTasks();
  const [formMode, setFormMode] = useState<string>("none");

  const areaById = useMemo(
    () => new Map(areas.map((area) => [area.id, area])),
    [areas],
  );

  const visibleTasks = useMemo(() => {
    const filtered = selectedAreaId
      ? tasks.filter((task) => task.areaId === selectedAreaId)
      : tasks;

    return [...filtered].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (a.priority !== b.priority) {
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      }
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  }, [tasks, selectedAreaId]);

  const editingTask =
    formMode !== "none" && formMode !== "add"
      ? tasks.find((task) => task.id === formMode)
      : undefined;
  const selectedArea = selectedAreaId ? areaById.get(selectedAreaId) : undefined;

  function handleSubmit(input: TaskInput) {
    if (formMode === "add") {
      addTask(input);
    } else if (editingTask) {
      updateTask(editingTask.id, input);
    }
    setFormMode("none");
  }

  const openCount = (
    selectedAreaId
      ? tasks.filter((task) => task.areaId === selectedAreaId)
      : tasks
  ).filter((task) => !task.completed).length;

  return (
    <Panel
      title="Tasks"
      subtitle={`${openCount} open`}
      className={className}
      action={
        <button
          onClick={() => setFormMode(formMode === "add" ? "none" : "add")}
          className="flex items-center gap-1 rounded-full bg-accent/15 px-3 py-1.5 text-[13px] font-medium text-accent transition-colors hover:bg-accent/25"
        >
          <Plus size={14} strokeWidth={2.5} />
          Add
        </button>
      }
    >
      {selectedArea && !hideAreaChip && (
        <div className="mb-3 flex items-center justify-between rounded-full bg-surface-raised px-3.5 py-1.5 text-xs text-text-dim">
          <span className="flex items-center gap-1.5">
            <Filter size={12} />
            Filtered to{" "}
            <span style={{ color: selectedArea.color }}>
              {selectedArea.label}
            </span>
          </span>
          {onClearAreaFilter && (
            <button
              onClick={onClearAreaFilter}
              aria-label="Clear area filter"
              className="rounded p-0.5 hover:text-text"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {formMode === "add" && (
        <TodoForm
          areas={areas}
          onSubmit={handleSubmit}
          onCancel={() => setFormMode("none")}
        />
      )}

      {loading ? (
        <div className="py-8 text-center text-sm text-text-dim">
          Loading tasks…
        </div>
      ) : visibleTasks.length === 0 ? (
        <div className="py-8 text-center text-sm text-text-dim">
          {selectedArea
            ? `No tasks for ${selectedArea.label} yet.`
            : "No tasks yet — add one to get started."}
        </div>
      ) : (
        <div className="flex flex-col gap-0.5">
          {visibleTasks.map((task) =>
            editingTask?.id === task.id ? (
              <TodoForm
                key={task.id}
                areas={areas}
                initial={{
                  title: task.title,
                  priority: task.priority,
                  dueDate: task.dueDate,
                  areaId: task.areaId,
                }}
                onSubmit={handleSubmit}
                onCancel={() => setFormMode("none")}
              />
            ) : (
              <TodoItem
                key={task.id}
                task={task}
                area={task.areaId ? areaById.get(task.areaId) : undefined}
                onToggleComplete={() => toggleComplete(task.id)}
                onEdit={() => setFormMode(task.id)}
                onDelete={() => deleteTask(task.id)}
              />
            ),
          )}
        </div>
      )}
    </Panel>
  );
}
