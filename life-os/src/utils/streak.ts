import { todayISO } from "./date";

export function habitStreak(dates: string[]): number {
  const set = new Set(dates);
  let count = 0;
  const cursor = new Date();
  // Today still pending doesn't break the streak — start counting from yesterday.
  if (!set.has(todayISO())) cursor.setDate(cursor.getDate() - 1);
  while (set.has(cursor.toISOString().slice(0, 10))) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}
