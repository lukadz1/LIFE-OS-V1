export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isoDateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function weekdayNarrow(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { weekday: "narrow" });
}

export function getTimeGreeting(): string {
  // Europe/Berlin tracks MESZ in summer and MEZ in winter automatically.
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: "Europe/Berlin",
    }).format(new Date()),
  );
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  return "Good evening";
}

export function formatTargetDate(iso: string | null): string {
  if (!iso) return "No target date";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function isoDaysFromNow(days: number, hour = 9, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export function formatDateLabel(iso: string | null): string {
  if (!iso) return "No due date";
  const date = new Date(iso);
  const today = new Date();
  const diffDays = Math.round(
    (startOfDay(date).getTime() - startOfDay(today).getTime()) / 86400000,
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays < 7) return date.toLocaleDateString(undefined, { weekday: "short" });

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatPastDate(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const diffDays = Math.round(
    (startOfDay(today).getTime() - startOfDay(date).getTime()) / 86400000,
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7)
    return date.toLocaleDateString(undefined, { weekday: "short" });
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatTimeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function isToday(iso: string): boolean {
  return isSameDay(new Date(iso), new Date());
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isWithinNextDays(iso: string, days: number): boolean {
  const target = new Date(iso);
  const now = new Date();
  const end = new Date();
  end.setDate(end.getDate() + days);
  end.setHours(23, 59, 59, 999);
  return target >= startOfDay(now) && target <= end;
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}
