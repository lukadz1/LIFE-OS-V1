import {
  defaultSpendCategories,
  lifeAreas,
  mockEvents,
  mockGoals,
  mockRecurringRules,
  mockSavingsGoals,
  mockSchoolExams,
  mockSchoolSubjects,
  mockScores,
  mockTasks,
  mockTransactions,
} from "../data/mockData";
import { readStorage, writeStorage } from "../data/storage";
import type {
  BillDebt,
  CalendarEvent,
  FinanceAccount,
  Goal,
  LifeArea,
  NetWorthSnapshot,
  RecurringRule,
  SavingsGoal,
  SchoolExam,
  SchoolSubject,
  ScoreMetric,
  SpendCategory,
  Task,
  Transaction,
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

// ---- Bills & debts to pay ----
// Starts empty (unlike other modules) — real obligations, not a demo.

const BILLS_DEBTS_KEY = "bills-debts";

export async function getBillsDebts(): Promise<BillDebt[]> {
  return delay(readStorage<BillDebt[]>(BILLS_DEBTS_KEY, []));
}

export async function saveBillsDebts(items: BillDebt[]): Promise<BillDebt[]> {
  writeStorage(BILLS_DEBTS_KEY, items);
  return delay(items);
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

// ---- School (grade tracker) ----
// Subjects are seeded per semester and never edited by the user directly —
// only their exams are. A subject's displayed grade is the average of its
// exams, computed in useSchool rather than stored here.

const SCHOOL_SUBJECTS_KEY = "school-subjects";

export async function getSchoolSubjects(): Promise<SchoolSubject[]> {
  return delay(readStorage<SchoolSubject[]>(SCHOOL_SUBJECTS_KEY, mockSchoolSubjects));
}

const SCHOOL_EXAMS_KEY = "school-exams";

export async function getSchoolExams(): Promise<SchoolExam[]> {
  return delay(readStorage<SchoolExam[]>(SCHOOL_EXAMS_KEY, mockSchoolExams));
}

export async function saveSchoolExams(exams: SchoolExam[]): Promise<SchoolExam[]> {
  writeStorage(SCHOOL_EXAMS_KEY, exams);
  return delay(exams);
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
