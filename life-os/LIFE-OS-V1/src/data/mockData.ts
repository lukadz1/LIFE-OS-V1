import type {
  CalendarEvent,
  Exercise,
  FuelEntry,
  Goal,
  Gym,
  Habit,
  LifeArea,
  RecurringRule,
  SavingsGoal,
  ScoreMetric,
  SetLog,
  SpendCategory,
  Task,
  TrainingDay,
  Transaction,
  WeightEntry,
} from "../types";
import { isoDateDaysAgo, isoDaysFromNow, todayISO } from "../utils/date";

function todayAt(hour: number, minute = 0): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const lifeAreas: LifeArea[] = [
  {
    id: "health",
    label: "Health",
    color: "#30d158",
    description: "Fitness, sleep, nutrition",
  },
  {
    id: "finance",
    label: "Finance",
    color: "#ffd60a",
    description: "Budget, savings, investing",
  },
  {
    id: "career",
    label: "Career",
    color: "#0a84ff",
    description: "Work, skills, growth",
  },
  {
    id: "relationships",
    label: "Relationships",
    color: "#ff375f",
    description: "Family, friends, partner",
  },
  {
    id: "projects",
    label: "Projects",
    color: "#bf5af2",
    description: "Side projects, hobbies",
  },
];

export const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Review monthly budget",
    priority: "high",
    dueDate: isoDaysFromNow(0),
    completed: false,
    areaId: "finance",
    createdAt: todayISO(),
  },
  {
    id: "task-2",
    title: "Morning run - 5k",
    priority: "medium",
    dueDate: isoDaysFromNow(0, 7),
    completed: false,
    areaId: "health",
    createdAt: todayISO(),
  },
  {
    id: "task-3",
    title: "Prep quarterly review deck",
    priority: "high",
    dueDate: isoDaysFromNow(2),
    completed: false,
    areaId: "career",
    createdAt: todayISO(),
  },
  {
    id: "task-4",
    title: "Call parents",
    priority: "medium",
    dueDate: isoDaysFromNow(1),
    completed: false,
    areaId: "relationships",
    createdAt: todayISO(),
  },
  {
    id: "task-5",
    title: "Ship Life OS dashboard v1",
    priority: "high",
    dueDate: isoDaysFromNow(4),
    completed: false,
    areaId: "projects",
    createdAt: todayISO(),
  },
  {
    id: "task-6",
    title: "Book dentist appointment",
    priority: "low",
    dueDate: isoDaysFromNow(6),
    completed: false,
    areaId: "health",
    createdAt: todayISO(),
  },
  {
    id: "task-7",
    title: "Cancel unused subscription",
    priority: "low",
    dueDate: null,
    completed: true,
    areaId: "finance",
    createdAt: todayISO(),
  },
];

export const mockEvents: CalendarEvent[] = [
  {
    id: "event-1",
    title: "Team standup",
    start: isoDaysFromNow(0, 9, 0),
    end: isoDaysFromNow(0, 9, 15),
    areaId: "career",
  },
  {
    id: "event-2",
    title: "Gym - leg day",
    start: isoDaysFromNow(0, 18, 0),
    end: isoDaysFromNow(0, 19, 0),
    areaId: "health",
  },
  {
    id: "event-3",
    title: "Dinner with Sam",
    start: isoDaysFromNow(1, 19, 30),
    end: isoDaysFromNow(1, 21, 0),
    areaId: "relationships",
    location: "Downtown",
  },
  {
    id: "event-4",
    title: "1:1 with manager",
    start: isoDaysFromNow(2, 14, 0),
    end: isoDaysFromNow(2, 14, 30),
    areaId: "career",
  },
  {
    id: "event-5",
    title: "Investment portfolio review",
    start: isoDaysFromNow(3, 11, 0),
    end: isoDaysFromNow(3, 12, 0),
    areaId: "finance",
  },
  {
    id: "event-6",
    title: "Side project work session",
    start: isoDaysFromNow(5, 10, 0),
    end: isoDaysFromNow(5, 12, 0),
    areaId: "projects",
  },
];

export const mockHabits: Habit[] = [
  {
    id: "habit-1",
    name: "Morning run",
    areaId: "health",
    completedDates: [1, 2, 3, 5, 6, 8].map(isoDateDaysAgo),
    createdAt: todayISO(),
  },
  {
    id: "habit-2",
    name: "Read 20 minutes",
    areaId: "projects",
    completedDates: [0, 1, 2, 3, 4].map(isoDateDaysAgo),
    createdAt: todayISO(),
  },
  {
    id: "habit-3",
    name: "Journal",
    areaId: "relationships",
    completedDates: [1, 3, 4].map(isoDateDaysAgo),
    createdAt: todayISO(),
  },
  {
    id: "habit-4",
    name: "No junk food",
    areaId: "health",
    completedDates: [0, 1].map(isoDateDaysAgo),
    createdAt: todayISO(),
  },
];

export const mockFuelEntries: FuelEntry[] = [
  { id: "fuel-1", kind: "water", label: "Water", at: todayAt(7, 45) },
  { id: "fuel-2", kind: "water", label: "Water", at: todayAt(9, 30) },
  { id: "fuel-3", kind: "caffeine", label: "Coffee", at: todayAt(8, 0) },
  {
    id: "fuel-4",
    kind: "meal",
    label: "Oatmeal with berries",
    kcal: 350,
    at: todayAt(8, 15),
  },
  { id: "fuel-5", kind: "supplement", label: "Vitamin D", at: todayAt(8, 20) },
];

export const defaultSupplementList = ["Vitamin D", "Omega-3", "Magnesium"];

export const mockGoals: Goal[] = [
  {
    id: "goal-1",
    title: "6-month emergency fund",
    areaId: "finance",
    targetDate: "2026-12-31",
    progress: 45,
    createdAt: todayISO(),
  },
  {
    id: "goal-2",
    title: "Run a half marathon",
    areaId: "health",
    targetDate: "2026-10-15",
    progress: 30,
    createdAt: todayISO(),
  },
  {
    id: "goal-3",
    title: "Ship Life OS v2",
    areaId: "projects",
    targetDate: "2026-09-01",
    progress: 10,
    createdAt: todayISO(),
  },
  {
    id: "goal-4",
    title: "Plan anniversary trip",
    areaId: "relationships",
    targetDate: "2026-08-20",
    progress: 20,
    createdAt: todayISO(),
  },
];

export const gyms: Gym[] = [
  { id: "home", name: "Home Gym" },
  { id: "comm", name: "Commercial Gym" },
];

export const trainingDays: TrainingDay[] = [
  { id: "push", name: "Push" },
  { id: "pull", name: "Pull" },
  { id: "legs", name: "Legs" },
];

export const mockExercises: Exercise[] = [
  {
    id: "ex-bench",
    name: "Bench press",
    gymId: "comm",
    dayId: "push",
    repMin: 5,
    repMax: 8,
    step: 2.5,
    startWeight: 60,
    bodyweight: false,
  },
  {
    id: "ex-ohp",
    name: "Overhead press",
    gymId: "comm",
    dayId: "push",
    repMin: 5,
    repMax: 8,
    step: 2.5,
    startWeight: 35,
    bodyweight: false,
  },
  {
    id: "ex-pushdown",
    name: "Tricep pushdown",
    gymId: "comm",
    dayId: "push",
    repMin: 8,
    repMax: 12,
    step: 2.5,
    startWeight: 25,
    bodyweight: false,
  },
  {
    id: "ex-pullup",
    name: "Pull-ups",
    gymId: "both",
    dayId: "pull",
    repMin: 5,
    repMax: 10,
    step: 1,
    startWeight: 0,
    bodyweight: true,
  },
  {
    id: "ex-row",
    name: "Barbell row",
    gymId: "comm",
    dayId: "pull",
    repMin: 6,
    repMax: 10,
    step: 2.5,
    startWeight: 50,
    bodyweight: false,
  },
  {
    id: "ex-curl",
    name: "Bicep curl",
    gymId: "comm",
    dayId: "pull",
    repMin: 8,
    repMax: 12,
    step: 1.25,
    startWeight: 15,
    bodyweight: false,
  },
  {
    id: "ex-squat",
    name: "Back squat",
    gymId: "comm",
    dayId: "legs",
    repMin: 5,
    repMax: 8,
    step: 5,
    startWeight: 80,
    bodyweight: false,
  },
  {
    id: "ex-rdl",
    name: "Romanian deadlift",
    gymId: "comm",
    dayId: "legs",
    repMin: 6,
    repMax: 10,
    step: 5,
    startWeight: 60,
    bodyweight: false,
  },
  {
    id: "ex-legpress",
    name: "Leg press",
    gymId: "comm",
    dayId: "legs",
    repMin: 8,
    repMax: 12,
    step: 5,
    startWeight: 100,
    bodyweight: false,
  },
];

export const mockSetLogs: SetLog[] = [
  {
    id: "set-1",
    exerciseId: "ex-bench",
    weight: 60,
    reps: 6,
    at: isoDaysFromNow(-9, 18, 0),
  },
  {
    id: "set-2",
    exerciseId: "ex-bench",
    weight: 60,
    reps: 7,
    at: isoDaysFromNow(-6, 18, 0),
  },
  {
    id: "set-3",
    exerciseId: "ex-bench",
    weight: 60,
    reps: 8,
    at: isoDaysFromNow(-3, 18, 5),
  },
  {
    id: "set-4",
    exerciseId: "ex-squat",
    weight: 80,
    reps: 5,
    at: isoDaysFromNow(-4, 19, 0),
  },
  {
    id: "set-5",
    exerciseId: "ex-pullup",
    weight: 0,
    reps: 8,
    at: isoDaysFromNow(-5, 18, 30),
  },
];

export const mockWeightEntries: WeightEntry[] = [
  { id: "wt-1", weightKg: 82.4, at: isoDaysFromNow(-6, 7, 0) },
  { id: "wt-2", weightKg: 82.1, at: isoDaysFromNow(-5, 7, 0) },
  { id: "wt-3", weightKg: 81.9, at: isoDaysFromNow(-4, 7, 5) },
  { id: "wt-4", weightKg: 81.8, at: isoDaysFromNow(-3, 7, 0) },
  { id: "wt-5", weightKg: 81.6, at: isoDaysFromNow(-2, 7, 10) },
  { id: "wt-6", weightKg: 81.5, at: isoDaysFromNow(-1, 7, 0) },
  { id: "wt-7", weightKg: 81.3, at: isoDaysFromNow(0, 7, 0) },
];

// Deterministic pseudo-random so the seeded trend looks organic but is stable across reloads.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildHistory(seed: number, start: number, drift: number) {
  const rand = mulberry32(seed);
  const points = [];
  let value = start;
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    value = Math.max(0, Math.min(100, value + (rand() - 0.5) * 6 + drift));
    points.push({ date: d.toISOString().slice(0, 10), value: Math.round(value) });
  }
  return points;
}

const baseScores: Array<Omit<ScoreMetric, "value">> = [
  {
    id: "financial",
    label: "Financial Health",
    max: 100,
    history: buildHistory(42, 58, 0.35),
  },
  {
    id: "wellness",
    label: "Fitness & Wellness",
    max: 100,
    history: buildHistory(7, 65, 0.1),
  },
];

export const mockScores: ScoreMetric[] = baseScores.map((score) => ({
  ...score,
  value: score.history[score.history.length - 1].value,
}));

// ---- Spending / budget tracker seed ----
// Categories are structural (not personal), so we seed sensible 50/30/20
// defaults with stable ids that recurring rules + goals can reference.

export const defaultSpendCategories: SpendCategory[] = [
  { id: "cat-rent", name: "Rent", bucket: "fixed", monthlyBudgetChf: 1500, keywords: ["miete", "rent", "wohnung"], createdAt: "2020-01-01T00:00:00.000Z" },
  { id: "cat-insurance", name: "Insurance", bucket: "fixed", monthlyBudgetChf: 320, keywords: ["versicherung", "insurance", "krankenkasse", "css", "helsana"], createdAt: "2020-01-01T00:00:00.000Z" },
  { id: "cat-transport", name: "Transport", bucket: "fixed", monthlyBudgetChf: 120, keywords: ["sbb", "zvv", "ga", "transport", "mobility"], createdAt: "2020-01-01T00:00:00.000Z" },
  { id: "cat-subs", name: "Subscriptions", bucket: "fixed", monthlyBudgetChf: 70, keywords: ["netflix", "spotify", "abo", "subscription", "icloud", "youtube"], createdAt: "2020-01-01T00:00:00.000Z" },
  { id: "cat-groceries", name: "Groceries", bucket: "variable", monthlyBudgetChf: 500, keywords: ["migros", "coop", "aldi", "lidl", "denner", "grocery"], createdAt: "2020-01-01T00:00:00.000Z" },
  { id: "cat-dining", name: "Dining out", bucket: "variable", monthlyBudgetChf: 220, keywords: ["restaurant", "cafe", "coffee", "starbucks", "mcdonald", "uber eats", "bar"], createdAt: "2020-01-01T00:00:00.000Z" },
  { id: "cat-shopping", name: "Shopping", bucket: "variable", monthlyBudgetChf: 180, keywords: ["zalando", "galaxus", "digitec", "amazon", "shop", "zara"], createdAt: "2020-01-01T00:00:00.000Z" },
  { id: "cat-savings", name: "Savings transfer", bucket: "savings", monthlyBudgetChf: 800, keywords: ["sparen", "savings", "transfer sparkonto"], createdAt: "2020-01-01T00:00:00.000Z" },
  { id: "cat-3a", name: "Säule 3a", bucket: "savings", monthlyBudgetChf: 588, keywords: ["3a", "vorsorge", "viac", "frankly"], createdAt: "2020-01-01T00:00:00.000Z" },
];

interface SeedSpec {
  categoryId: string;
  description: string;
  amount: number;
  day: number; // day of month
  jitter?: number; // +/- amount variation across months
}

const monthlySeeds: SeedSpec[] = [
  { categoryId: "cat-rent", description: "Monthly rent — Baugenossenschaft", amount: 1480, day: 1 },
  { categoryId: "cat-insurance", description: "Krankenkasse CSS", amount: 312, day: 3 },
  { categoryId: "cat-transport", description: "SBB GA monthly", amount: 115, day: 4 },
  { categoryId: "cat-subs", description: "Spotify Premium", amount: 13, day: 6 },
  { categoryId: "cat-subs", description: "Netflix", amount: 25, day: 8 },
  { categoryId: "cat-savings", description: "Transfer to Sparkonto", amount: 800, day: 25 },
  { categoryId: "cat-3a", description: "VIAC Säule 3a", amount: 588, day: 25 },
  { categoryId: "cat-groceries", description: "Migros", amount: 92, day: 5, jitter: 30 },
  { categoryId: "cat-groceries", description: "Coop", amount: 78, day: 12, jitter: 25 },
  { categoryId: "cat-groceries", description: "Migros", amount: 64, day: 19, jitter: 20 },
  { categoryId: "cat-groceries", description: "Denner", amount: 55, day: 26, jitter: 20 },
  { categoryId: "cat-dining", description: "Restaurant dinner", amount: 68, day: 9, jitter: 25 },
  { categoryId: "cat-dining", description: "Starbucks coffee", amount: 7, day: 14, jitter: 3 },
  { categoryId: "cat-dining", description: "Uber Eats", amount: 34, day: 21, jitter: 12 },
  { categoryId: "cat-shopping", description: "Zalando order", amount: 89, day: 16, jitter: 60 },
];

/** Local YYYY-MM-DD without the UTC shift `toISOString()` would introduce. */
function isoLocal(y: number, m: number, day: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function buildSpendTransactions(): Transaction[] {
  const txs: Transaction[] = [];
  const now = new Date();
  // Last 5 full/partial months incl. the current one.
  for (let back = 4; back >= 0; back--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - back, 1);
    const y = monthDate.getFullYear();
    const m = monthDate.getMonth();
    for (const seed of monthlySeeds) {
      const dayDate = new Date(y, m, seed.day);
      if (dayDate > now) continue; // don't seed the future within this month
      const jitter = seed.jitter
        ? Math.round(((seed.day * (back + 2)) % (seed.jitter * 2)) - seed.jitter)
        : 0;
      const amount = Math.max(1, seed.amount + jitter);
      const date = isoLocal(y, m, seed.day);
      txs.push({
        id: `seed-${seed.categoryId}-${date}`,
        date,
        amountChf: amount,
        description: seed.description,
        categoryId: seed.categoryId,
        createdAt: `${date}T09:00:00.000Z`,
      });
    }
  }
  return txs.sort((a, b) => b.date.localeCompare(a.date));
}

export const mockTransactions: Transaction[] = buildSpendTransactions();

function nextDueFor(day: number): string {
  const now = new Date();
  let due = new Date(now.getFullYear(), now.getMonth(), day);
  if (due < now) due = new Date(now.getFullYear(), now.getMonth() + 1, day);
  return isoLocal(due.getFullYear(), due.getMonth(), due.getDate());
}

function daysAgoLocal(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return isoLocal(d.getFullYear(), d.getMonth(), d.getDate());
}

export const mockRecurringRules: RecurringRule[] = [
  { id: "rec-rent", description: "Monthly rent — Baugenossenschaft", amountChf: 1480, categoryId: "cat-rent", interval: "monthly", nextDue: nextDueFor(1), active: true, createdAt: "2024-01-01T00:00:00.000Z" },
  { id: "rec-insurance", description: "Krankenkasse CSS", amountChf: 312, categoryId: "cat-insurance", interval: "monthly", nextDue: nextDueFor(3), active: true, createdAt: "2024-01-01T00:00:00.000Z" },
  // Seeded a few days overdue so the draft-confirmation flow is visible on load.
  { id: "rec-phone", description: "Phone plan — Salt", amountChf: 39, categoryId: "cat-subs", interval: "monthly", nextDue: daysAgoLocal(3), active: true, createdAt: "2024-01-01T00:00:00.000Z" },
  { id: "rec-3a", description: "VIAC Säule 3a", amountChf: 588, categoryId: "cat-3a", interval: "monthly", nextDue: nextDueFor(25), active: true, createdAt: "2024-01-01T00:00:00.000Z" },
];

export const mockSavingsGoals: SavingsGoal[] = [
  { id: "goal-emergency", name: "Notgroschen (3 months)", targetChf: 12000, targetDate: null, manualSavedChf: 4200, linkSavingsBucket: false, linkedCategoryId: "cat-savings", createdAt: "2025-01-01T00:00:00.000Z" },
  { id: "goal-3a", name: "Säule 3a limit 2026", targetChf: 7056, targetDate: `${new Date().getFullYear()}-12-31`, manualSavedChf: 0, linkSavingsBucket: false, linkedCategoryId: "cat-3a", createdAt: "2025-01-01T00:00:00.000Z" },
];
