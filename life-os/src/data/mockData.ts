import type {
  CalendarEvent,
  Goal,
  LifeArea,
  RecurringRule,
  SavingsGoal,
  SchoolExam,
  SchoolSubject,
  ScoreMetric,
  SpendCategory,
  Task,
  Transaction,
} from "../types";
import { isoDaysFromNow, todayISO } from "../utils/date";

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
  // Recurring weekly schedule — start/end only serve as the time-of-day
  // template here; `recurringDays` (0=Sun..6=Sat) is what actually places them.
  {
    id: "event-school",
    title: "School",
    start: isoDaysFromNow(0, 8, 0),
    end: isoDaysFromNow(0, 17, 20),
    areaId: "career",
    recurringDays: [5, 6], // Fri, Sat
  },
  {
    id: "event-gym",
    title: "Gym",
    start: isoDaysFromNow(0, 18, 0),
    end: isoDaysFromNow(0, 19, 0),
    areaId: "health",
    recurringDays: [0, 2, 4], // Sun, Tue, Thu
  },
  {
    id: "event-work",
    title: "Work",
    start: isoDaysFromNow(0, 7, 30),
    end: isoDaysFromNow(0, 16, 30),
    areaId: "career",
    recurringDays: [1, 2, 3, 4], // Mon-Thu
  },
  {
    id: "event-study",
    title: "Study session",
    start: isoDaysFromNow(0, 19, 0),
    end: isoDaysFromNow(0, 20, 30),
    areaId: "career",
    recurringDays: [0, 1, 2, 3, 4, 5, 6], // every day
  },
];

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
  { id: "cat-rent", name: "Rent", bucket: "fixed", emoji: "🏠", monthlyBudgetChf: 1500, keywords: ["miete", "rent", "wohnung"], createdAt: "2020-01-01T00:00:00.000Z" },
  { id: "cat-insurance", name: "Insurance", bucket: "fixed", emoji: "🛡️", monthlyBudgetChf: 320, keywords: ["versicherung", "insurance", "krankenkasse", "css", "helsana"], createdAt: "2020-01-01T00:00:00.000Z" },
  { id: "cat-transport", name: "Transport", bucket: "fixed", emoji: "🚌", monthlyBudgetChf: 120, keywords: ["sbb", "zvv", "ga", "transport", "mobility"], createdAt: "2020-01-01T00:00:00.000Z" },
  { id: "cat-subs", name: "Subscriptions", bucket: "fixed", emoji: "📺", monthlyBudgetChf: 70, keywords: ["netflix", "spotify", "abo", "subscription", "icloud", "youtube"], createdAt: "2020-01-01T00:00:00.000Z" },
  { id: "cat-groceries", name: "Groceries", bucket: "variable", emoji: "🛒", monthlyBudgetChf: 500, keywords: ["migros", "coop", "aldi", "lidl", "denner", "grocery"], createdAt: "2020-01-01T00:00:00.000Z" },
  { id: "cat-dining", name: "Dining out", bucket: "variable", emoji: "🍔", monthlyBudgetChf: 220, keywords: ["restaurant", "cafe", "coffee", "starbucks", "mcdonald", "uber eats", "bar"], createdAt: "2020-01-01T00:00:00.000Z" },
  { id: "cat-shopping", name: "Shopping", bucket: "variable", emoji: "🛍️", monthlyBudgetChf: 180, keywords: ["zalando", "galaxus", "digitec", "amazon", "shop", "zara"], createdAt: "2020-01-01T00:00:00.000Z" },
  { id: "cat-savings", name: "Savings transfer", bucket: "savings", emoji: "💰", monthlyBudgetChf: 800, keywords: ["sparen", "savings", "transfer sparkonto"], createdAt: "2020-01-01T00:00:00.000Z" },
  { id: "cat-3a", name: "Säule 3a", bucket: "savings", emoji: "🏦", monthlyBudgetChf: 588, keywords: ["3a", "vorsorge", "viac", "frankly"], createdAt: "2020-01-01T00:00:00.000Z" },
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

// ---- School (grade tracker) seed ----
// Six subjects across six semesters. Each subject gets one seeded exam whose
// grade becomes that subject's initial average — semesters closer to index 5
// are dated more recently so the standing chart reads left-to-right in time.

export const SCHOOL_SEMESTER_LABELS = [
  "Semester 1",
  "Semester 2",
  "Semester 3",
  "Semester 4",
  "Semester 5",
  "Semester 6",
];

const SCHOOL_SUBJECT_NAMES = [
  "Mathematics",
  "English",
  "Physics",
  "History",
  "Biology",
  "Computer Science",
];

const SCHOOL_SUBJECT_FILE_SLUGS = ["math", "english", "physics", "history", "biology", "cs"];

// [semesterId][subjectIndex]
const SCHOOL_SEED_GRADES = [
  [3.2, 4.8, 2.9, 5.1, 4.0, 5.6],
  [4.5, 3.6, 4.9, 3.0, 5.0, 4.2],
  [2.8, 4.4, 3.9, 4.7, 3.5, 5.3],
  [4.9, 4.1, 3.3, 4.0, 4.6, 3.9],
  [5.2, 3.8, 4.4, 2.7, 4.9, 5.0],
  [4.6, 4.9, 4.2, 4.4, 3.4, 5.5],
];

const SCHOOL_SEMESTER_END_DAYS_AGO = [640, 500, 360, 220, 90, 5];
const SCHOOL_SUBJECT_DAY_SPREAD = [75, 60, 45, 30, 15, 0];

function schoolSubjectId(semesterId: number, subjectIndex: number): string {
  return `sub-${semesterId}-${SCHOOL_SUBJECT_FILE_SLUGS[subjectIndex]}`;
}

export const mockSchoolSubjects: SchoolSubject[] = SCHOOL_SEMESTER_LABELS.flatMap(
  (_, semesterId) =>
    SCHOOL_SUBJECT_NAMES.map((name, subjectIndex) => ({
      id: schoolSubjectId(semesterId, subjectIndex),
      semesterId,
      name,
    })),
);

export const mockSchoolExams: SchoolExam[] = SCHOOL_SEMESTER_LABELS.flatMap(
  (_, semesterId) =>
    SCHOOL_SUBJECT_NAMES.map((_, subjectIndex) => ({
      id: `exam-${semesterId}-${SCHOOL_SUBJECT_FILE_SLUGS[subjectIndex]}`,
      semesterId,
      subjectId: schoolSubjectId(semesterId, subjectIndex),
      grade: SCHOOL_SEED_GRADES[semesterId][subjectIndex],
      date: isoDaysFromNow(
        -(SCHOOL_SEMESTER_END_DAYS_AGO[semesterId] + SCHOOL_SUBJECT_DAY_SPREAD[subjectIndex]),
        9,
      ),
      fileName: `${SCHOOL_SUBJECT_FILE_SLUGS[subjectIndex]}_exam.pdf`,
      fileDataUrl: null,
    })),
);
