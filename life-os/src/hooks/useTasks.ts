import { useCallback, useEffect, useState } from "react";
import { getTasks, saveTasks } from "../services/dataService";
import type { LifeAreaId, Priority, Task } from "../types";
import { createId } from "../utils/id";

export interface TaskInput {
  title: string;
  priority: Priority;
  dueDate: string | null;
  areaId: LifeAreaId | null;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getTasks().then((data) => {
      if (!active) return;
      setTasks(data);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  // Persist whenever tasks change, but never before the initial load resolves —
  // otherwise a remount could flush the empty initial state over saved data.
  useEffect(() => {
    if (loading) return;
    void saveTasks(tasks);
  }, [tasks, loading]);

  const addTask = useCallback((input: TaskInput) => {
    const newTask: Task = {
      id: createId(),
      completed: false,
      createdAt: new Date().toISOString(),
      ...input,
    };
    setTasks((prev) => [newTask, ...prev]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<TaskInput>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates } : task)),
    );
  }, []);

  const toggleComplete = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  return { tasks, loading, addTask, updateTask, toggleComplete, deleteTask };
}
