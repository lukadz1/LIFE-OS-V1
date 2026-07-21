import {
  defaultSpendCategories,
  defaultSupplementList,
  lifeAreas,
  mockEvents,
  mockExercises,
  mockFuelEntries,
  mockGoals,
  mockHabits,
  mockRecurringRules,
  mockSavingsGoals,
  mockScores,
  mockSetLogs,
  mockTasks,
  mockTransactions,
  mockWeightEntries,
} from "../data/mockData";
import { readStorage, writeStorage } from "../data/storage";
import type {
  CalendarEvent,
  Exercise,
  FinanceAccount,
  FuelEntry,
  Goal,
  Habit,
  LifeArea,
  NetWorthSnapshot,
  ProgressPhoto,
  RecurringRule,
  SavingsGoal,
  ScoreMetric,
  SetLog,
  SpendCategory,
  Task,
  Transaction,
  WeightEntry,
} from "../types";

// This module is the only place the app talks to for data. Every call is async
// and returns plain data, even though today it's backed by localStorage + seed
// data. Swapping in a real backend (Supabase, Express, etc.) later means
// rewriting the bodies below only — hooks and components never change.

const LATENCY_MS = 120;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));
}

// ---- Life Areas ----

export async function getLifeAreas(): Promise<LifeArea[]> {
  return delay(lifeAreas);
}

// ---- Tasks ----

const TASKS_KEY = "tasks";

export async function getTasks(): Promise<Task[]> {
  return delay(readStorage<Task[]>(TASKS_KEY, mockTasks));
}

export async function saveTasks(tasks: Task[]): Promise<Task[]> {
  writeStorage(TASKS_KEY, tasks);
  return delay(tasks);
}

// ---- Calendar Events ----

const EVENTS_KEY = "events";

export async function getEvents(): Promise<CalendarEvent[]> {
  return delay(readStorage<CalendarEvent[]>(EVENTS_KEY, mockEvents));
}

export async function saveEvents(events: CalendarEvent[]): Promise<CalendarEvent[]> {
  writeStorage(EVENTS_KEY, events);
  return delay(events);
}

// ---- Habits ----

const HABITS_KEY = "habits";

export async function getHabits(): Promise<Habit[]> {
  return delay(readStorage<Habit[]>(HABITS_KEY, mockHabits));
}

export async function saveHabits(habits: Habit[]): Promise<Habit[]> {
  writeStorage(HABITS_KEY, habits);
  return delay(habits);
}

// ---- Goals ----

const GOALS_KEY = "goals";

export async function getGoals(): Promise<Goal[]> {
  return delay(readStorage<Goal[]>(GOALS_KEY, mockGoals));
}

export async function saveGoals(goals: Goal[]): Promise<Goal[]> {
  writeStorage(GOALS_KEY, goals);
  return delay(goals);
}

// ---- Finance accounts ----
// Starts empty (unlike other modules) — net worth is real personal data, not a demo.

const FINANCE_ACCOUNTS_KEY = "finance-accounts";

export async function getFinanceAccounts(): Promise<FinanceAccount[]> {
  return delay(readStorage<FinanceAccount[]>(FINANCE_ACCOUNTS_KEY, []));
}

export async function saveFinanceAccounts(
  accounts: FinanceAccount[],
): Promise<FinanceAccount[]> {
  writeStorage(FINANCE_ACCOUNTS_KEY, accounts);
  return delay(accounts);
}

// ---- Net worth history ----

const NET_WORTH_HISTORY_KEY = "net-worth-history";

export async function getNetWorthHistory(): Promise<NetWorthSnapshot[]> {
  return delay(readStorage<NetWorthSnapshot[]>(NET_WORTH_HISTORY_KEY, []));
}

export async function saveNetWorthHistory(
  history: NetWorthSnapshot[],
): Promise<NetWorthSnapshot[]> {
  writeStorage(NET_WORTH_HISTORY_KEY, history);
  return delay(history);
}

// ---- Spending: categories / transactions / recurring / savings goals ----

const SPEND_CATEGORIES_KEY = "spend-categories";

export async function getSpendCategories(): Promise<SpendCategory[]> {
  return delay(
    readStorage<SpendCategory[]>(SPEND_CATEGORIES_KEY, defaultSpendCategories),
  );
}

export async function saveSpendCategories(
  categories: SpendCategory[],
): Promise<SpendCategory[]> {
  writeStorage(SPEND_CATEGORIES_KEY, categories);
  return delay(categories);
}

const TRANSACTIONS_KEY = "transactions";

export async function getTransactions(): Promise<Transaction[]> {
  return delay(readStorage<Transaction[]>(TRANSACTIONS_KEY, mockTransactions));
}

export async function saveTransactions(
  txs: Transaction[],
): Promise<Transaction[]> {
  writeStorage(TRANSACTIONS_KEY, txs);
  return delay(txs);
}

const RECURRING_RULES_KEY = "recurring-rules";

export async function getRecurringRules(): Promise<RecurringRule[]> {
  return delay(
    readStorage<RecurringRule[]>(RECURRING_RULES_KEY, mockRecurringRules),
  );
}

export async function saveRecurringRules(
  rules: RecurringRule[],
): Promise<RecurringRule[]> {
  writeStorage(RECURRING_RULES_KEY, rules);
  return delay(rules);
}

const SAVINGS_GOALS_KEY = "savings-goals";

export async function getSavingsGoals(): Promise<SavingsGoal[]> {
  return delay(readStorage<SavingsGoal[]>(SAVINGS_GOALS_KEY, mockSavingsGoals));
}

export async function saveSavingsGoals(
  goals: SavingsGoal[],
): Promise<SavingsGoal[]> {
  writeStorage(SAVINGS_GOALS_KEY, goals);
  return delay(goals);
}

// ---- Fuel (water / caffeine / meals / supplements) ----

const FUEL_ENTRIES_KEY = "fuel-entries";

export async function getFuelEntries(): Promise<FuelEntry[]> {
  return delay(readStorage<FuelEntry[]>(FUEL_ENTRIES_KEY, mockFuelEntries));
}

export async function saveFuelEntries(
  entries: FuelEntry[],
): Promise<FuelEntry[]> {
  writeStorage(FUEL_ENTRIES_KEY, entries);
  return delay(entries);
}

const SUPPLEMENT_LIST_KEY = "supplement-list";

export async function getSupplementList(): Promise<string[]> {
  return delay(readStorage<string[]>(SUPPLEMENT_LIST_KEY, defaultSupplementList));
}

export async function saveSupplementList(list: string[]): Promise<string[]> {
  writeStorage(SUPPLEMENT_LIST_KEY, list);
  return delay(list);
}

// ---- Exercises + set logs ----

const EXERCISES_KEY = "exercises";

export async function getExercises(): Promise<Exercise[]> {
  return delay(readStorage<Exercise[]>(EXERCISES_KEY, mockExercises));
}

export async function saveExercises(exercises: Exercise[]): Promise<Exercise[]> {
  writeStorage(EXERCISES_KEY, exercises);
  return delay(exercises);
}

const SET_LOGS_KEY = "set-logs";

export async function getSetLogs(): Promise<SetLog[]> {
  return delay(readStorage<SetLog[]>(SET_LOGS_KEY, mockSetLogs));
}

export async function saveSetLogs(logs: SetLog[]): Promise<SetLog[]> {
  writeStorage(SET_LOGS_KEY, logs);
  return delay(logs);
}

// ---- Bodyweight ----

const WEIGHT_ENTRIES_KEY = "weight-entries";

export async function getWeightEntries(): Promise<WeightEntry[]> {
  return delay(readStorage<WeightEntry[]>(WEIGHT_ENTRIES_KEY, mockWeightEntries));
}

export async function saveWeightEntries(
  entries: WeightEntry[],
): Promise<WeightEntry[]> {
  writeStorage(WEIGHT_ENTRIES_KEY, entries);
  return delay(entries);
}

// ---- Progress photos ----
// Starts empty — can't seed a personal photo.

const PROGRESS_PHOTOS_KEY = "progress-photos";

export async function getProgressPhotos(): Promise<ProgressPhoto[]> {
  return delay(readStorage<ProgressPhoto[]>(PROGRESS_PHOTOS_KEY, []));
}

export async function saveProgressPhotos(
  photos: ProgressPhoto[],
): Promise<ProgressPhoto[]> {
  writeStorage(PROGRESS_PHOTOS_KEY, photos);
  return delay(photos);
}

// ---- Scores ----

const SCORES_KEY = "scores";

export async function getScores(): Promise<ScoreMetric[]> {
  return delay(readStorage<ScoreMetric[]>(SCORES_KEY, mockScores));
}

export async function saveScores(scores: ScoreMetric[]): Promise<ScoreMetric[]> {
  writeStorage(SCORES_KEY, scores);
  return delay(scores);
}
