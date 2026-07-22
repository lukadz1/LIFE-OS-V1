export type LifeAreaId =
  | "health"
  | "finance"
  | "career"
  | "relationships"
  | "projects";

export interface LifeArea {
  id: LifeAreaId;
  label: string;
  color: string;
  description: string;
}

export type Priority = "high" | "medium" | "low";

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  dueDate: string | null;
  completed: boolean;
  areaId: LifeAreaId | null;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  areaId: LifeAreaId | null;
  location?: string;
}

export interface Habit {
  id: string;
  name: string;
  areaId: LifeAreaId | null;
  completedDates: string[];
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  areaId: LifeAreaId | null;
  targetDate: string | null;
  progress: number;
  createdAt: string;
}

export interface UserProfile {
  heightCm: number | null;
  heightUnit: "cm" | "ft";
  weightKg: number | null;
  weightUnit: "kg" | "lb";
  age: number | null;
  sex: "m" | "f" | null;
  activityHrsPerWeek: number | null;
}

export type FuelKind = "water" | "caffeine" | "meal" | "supplement";

export interface FuelEntry {
  id: string;
  kind: FuelKind;
  label: string;
  kcal?: number;
  at: string;
}

export type Currency = "CHF" | "USD" | "EUR" | "GBP";

export type AssetCategory = "bank" | "sparkonto" | "stocks" | "crypto" | "other";

export interface FinanceAccount {
  id: string;
  category: AssetCategory;
  name: string;
  quantity?: number;
  manualValueChf?: number;
  createdAt: string;
}

export interface NetWorthSnapshot {
  date: string;
  valueChf: number;
}

// ---- Bills & debts to pay ----

export type BillDebtKind = "bill" | "debt";

export interface BillDebt {
  id: string;
  kind: BillDebtKind;
  name: string;
  amountChf: number;
  dueDate: string | null;
  recurring: boolean;
  paid: boolean;
  createdAt: string;
}

// ---- Spending / budget tracker (50/30/20) ----

export type TxBucket = "fixed" | "variable" | "savings";

export interface SpendCategory {
  id: string;
  name: string;
  bucket: TxBucket;
  /** Monthly budget (Soll) in CHF; null = untracked. */
  monthlyBudgetChf: number | null;
  /** Substrings used to auto-assign this category on CSV import. */
  keywords: string[];
  createdAt: string;
}

export interface Transaction {
  id: string;
  date: string; // ISO YYYY-MM-DD
  amountChf: number; // positive outflow
  description: string;
  categoryId: string | null;
  /** Set when generated from a confirmed recurring draft. */
  recurringId?: string;
  createdAt: string;
}

export type RecurrenceInterval = "weekly" | "monthly" | "yearly";

export interface RecurringRule {
  id: string;
  description: string;
  amountChf: number;
  categoryId: string | null;
  interval: RecurrenceInterval;
  /** ISO date of the next occurrence proposed as a draft. */
  nextDue: string;
  active: boolean;
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetChf: number;
  targetDate: string | null;
  /** Sum of manual deposits toward the goal. */
  manualSavedChf: number;
  /** Count every savings-bucket transaction toward this goal. */
  linkSavingsBucket: boolean;
  /** Or count only one specific category (takes precedence). */
  linkedCategoryId: string | null;
  createdAt: string;
}

export interface Gym {
  id: string;
  name: string;
}

export interface TrainingDay {
  id: string;
  name: string;
}

export interface Exercise {
  id: string;
  name: string;
  gymId: string | "both";
  dayId: string;
  repMin: number;
  repMax: number;
  step: number;
  startWeight: number;
  bodyweight: boolean;
  restSeconds: number;
}

export interface SetLog {
  id: string;
  exerciseId: string;
  weight: number;
  reps: number;
  at: string;
}

export interface WeightEntry {
  id: string;
  weightKg: number;
  at: string;
}

export interface ProgressPhoto {
  id: string;
  dataUrl: string;
  weightKg: number | null;
  at: string;
}

export interface CalorieEntry {
  id: string;
  label: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  at: string;
}

export interface CalorieGoals {
  kcalGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
}

// ---- School (grade tracker) ----

export interface SchoolSubject {
  id: string;
  semesterId: number; // 0-5
  name: string;
}

export interface SchoolExam {
  id: string;
  semesterId: number;
  subjectId: string;
  grade: number; // 1.0 (worst) – 6.0 (best)
  date: string; // ISO
  fileName: string;
  fileDataUrl: string | null;
}

// ---- Peak tracker (caffeine/energy curve) ----

export interface PeakStackItem {
  id: string;
  name: string;
  mg: number;
}

export interface PeakDoseLog {
  id: string;
  itemId: string;
  mg: number;
  at: string; // full ISO timestamp of the "Log now" tap
}

export interface PeakFeelLog {
  id: string;
  hour: number; // fractional hour of day, bucketed to the nearest half hour
  value: number; // 0-100
  date: string; // ISO YYYY-MM-DD this point belongs to
}

export interface PeakPlanItem {
  id: string;
  text: string;
  date: string; // ISO YYYY-MM-DD
}

export type ScoreId = "financial" | "wellness";

export interface ScoreHistoryPoint {
  date: string;
  value: number;
}

export interface ScoreMetric {
  id: ScoreId;
  label: string;
  value: number;
  max: number;
  unit?: string;
  history: ScoreHistoryPoint[];
}
