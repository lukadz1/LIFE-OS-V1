import type {
  RecurrenceInterval,
  RecurringRule,
  SavingsGoal,
  SpendCategory,
  Transaction,
  TxBucket,
} from "../types";

// Pure, side-effect-free spending logic. Everything the Budget tab derives lives
// here so it can be unit-tested without React or localStorage (see
// spendingEngine.test.ts). Amounts are always CHF and always positive outflows —
// this module tracks spending + savings contributions, not income.

export const BUCKETS: TxBucket[] = ["fixed", "variable", "savings"];

export const BUCKET_META: Record<
  TxBucket,
  { label: string; hint: string; targetPct: number; color: string }
> = {
  fixed: { label: "Fixed", hint: "Needs · 50%", targetPct: 50, color: "#0a84ff" },
  variable: {
    label: "Variable",
    hint: "Wants · 30%",
    targetPct: 30,
    color: "#fb5607",
  },
  savings: {
    label: "Savings",
    hint: "Save · 20%",
    targetPct: 20,
    color: "#30d158",
  },
};

export type BucketTotals = Record<TxBucket, number>;

export function emptyBucketTotals(): BucketTotals {
  return { fixed: 0, variable: 0, savings: 0 };
}

/** "2026-07-09" -> "2026-07" */
export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function currentMonthKey(today = new Date()): string {
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
}

/** Newest-last list of the last `n` month keys, e.g. ["2026-02", …, "2026-07"]. */
export function lastNMonthKeys(n: number, today = new Date()): string[] {
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    keys.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    );
  }
  return keys;
}

export function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, {
    month: "short",
  });
}

export function categoryBucket(
  categoryId: string | null,
  categories: SpendCategory[],
): TxBucket | null {
  if (!categoryId) return null;
  return categories.find((c) => c.id === categoryId)?.bucket ?? null;
}

/** Sum per bucket, optionally scoped to a single month key. */
export function bucketTotals(
  txs: Transaction[],
  categories: SpendCategory[],
  month?: string,
): BucketTotals {
  const totals = emptyBucketTotals();
  for (const t of txs) {
    if (month && monthKey(t.date) !== month) continue;
    const b = categoryBucket(t.categoryId, categories);
    if (b) totals[b] += t.amountChf;
  }
  return totals;
}

export interface TrendPoint extends BucketTotals {
  month: string;
  label: string;
  total: number;
}

export function monthlyTrend(
  txs: Transaction[],
  categories: SpendCategory[],
  months: number,
  today = new Date(),
): TrendPoint[] {
  return lastNMonthKeys(months, today).map((month) => {
    const t = bucketTotals(txs, categories, month);
    return {
      month,
      label: monthLabel(month),
      ...t,
      total: t.fixed + t.variable + t.savings,
    };
  });
}

/** Average total spend over the `months` months *before* the current one. */
export function trailingAverageTotal(
  txs: Transaction[],
  categories: SpendCategory[],
  months: number,
  today = new Date(),
): number {
  const keys = lastNMonthKeys(months + 1, today).slice(0, months); // exclude current
  if (keys.length === 0) return 0;
  const sum = keys.reduce((acc, m) => {
    const t = bucketTotals(txs, categories, m);
    return acc + t.fixed + t.variable + t.savings;
  }, 0);
  return sum / keys.length;
}

export function categorySpent(
  categoryId: string,
  txs: Transaction[],
  month: string,
): number {
  let sum = 0;
  for (const t of txs) {
    if (t.categoryId === categoryId && monthKey(t.date) === month) {
      sum += t.amountChf;
    }
  }
  return sum;
}

export interface BudgetStatus {
  categoryId: string;
  spentChf: number;
  budgetChf: number | null;
  remainingChf: number | null;
  /** spent / budget; null when no budget set. Can exceed 1 when over. */
  pct: number | null;
  over: boolean;
}

export function budgetStatus(
  category: SpendCategory,
  txs: Transaction[],
  month: string,
): BudgetStatus {
  const spentChf = categorySpent(category.id, txs, month);
  const budgetChf = category.monthlyBudgetChf;
  if (budgetChf == null || budgetChf <= 0) {
    return {
      categoryId: category.id,
      spentChf,
      budgetChf,
      remainingChf: null,
      pct: null,
      over: false,
    };
  }
  return {
    categoryId: category.id,
    spentChf,
    budgetChf,
    remainingChf: budgetChf - spentChf,
    pct: spentChf / budgetChf,
    over: spentChf > budgetChf,
  };
}

// ---- Duplicate detection (CSV import) ----

function normalizeText(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Identity of a transaction for dedupe purposes: date + amount + text. */
export function txSignature(
  date: string,
  amountChf: number,
  description: string,
): string {
  return `${date}|${amountChf.toFixed(2)}|${normalizeText(description)}`;
}

export function isDuplicate(
  candidate: { date: string; amountChf: number; description: string },
  existing: Pick<Transaction, "date" | "amountChf" | "description">[],
): boolean {
  const sig = txSignature(
    candidate.date,
    candidate.amountChf,
    candidate.description,
  );
  return existing.some(
    (t) => txSignature(t.date, t.amountChf, t.description) === sig,
  );
}

/** First category whose keyword appears in the description, else null. */
export function suggestCategoryId(
  description: string,
  categories: SpendCategory[],
): string | null {
  const text = description.toLowerCase();
  for (const c of categories) {
    for (const kw of c.keywords) {
      if (kw && text.includes(kw.toLowerCase())) return c.id;
    }
  }
  return null;
}

// ---- Recurring bookings ----

export function advanceDate(iso: string, interval: RecurrenceInterval): string {
  const d = new Date(`${iso}T00:00:00`);
  if (interval === "weekly") d.setDate(d.getDate() + 7);
  else if (interval === "monthly") d.setMonth(d.getMonth() + 1);
  else d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

export function dueRecurring(
  rules: RecurringRule[],
  today: string,
): RecurringRule[] {
  return rules.filter((r) => r.active && r.nextDue <= today);
}

export const INTERVAL_LABEL: Record<RecurrenceInterval, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

// ---- Savings goals ----

function goalContributes(
  t: Transaction,
  goal: SavingsGoal,
  categories: SpendCategory[],
): boolean {
  if (goal.linkedCategoryId) return t.categoryId === goal.linkedCategoryId;
  if (goal.linkSavingsBucket) {
    return categoryBucket(t.categoryId, categories) === "savings";
  }
  return false;
}

export function savingsSaved(
  goal: SavingsGoal,
  txs: Transaction[],
  categories: SpendCategory[],
): number {
  let sum = goal.manualSavedChf;
  for (const t of txs) {
    if (goalContributes(t, goal, categories)) sum += t.amountChf;
  }
  return sum;
}

/** Average monthly contribution over the last `months` months. */
export function savingsMonthlyRate(
  goal: SavingsGoal,
  txs: Transaction[],
  categories: SpendCategory[],
  months = 3,
  today = new Date(),
): number {
  const keys = new Set(lastNMonthKeys(months, today));
  let sum = 0;
  for (const t of txs) {
    if (keys.has(monthKey(t.date)) && goalContributes(t, goal, categories)) {
      sum += t.amountChf;
    }
  }
  return sum / months;
}

export interface SavingsProgress {
  savedChf: number;
  pct: number;
  monthlyRate: number;
  etaLabel: string | null;
}

export function savingsProgress(
  goal: SavingsGoal,
  txs: Transaction[],
  categories: SpendCategory[],
  today = new Date(),
): SavingsProgress {
  const savedChf = savingsSaved(goal, txs, categories);
  const pct = goal.targetChf > 0 ? savedChf / goal.targetChf : 0;
  const monthlyRate = savingsMonthlyRate(goal, txs, categories, 3, today);
  const remaining = goal.targetChf - savedChf;

  let etaLabel: string | null = null;
  if (remaining <= 0) {
    etaLabel = "Reached";
  } else if (monthlyRate > 0) {
    const monthsLeft = Math.ceil(remaining / monthlyRate);
    const eta = new Date(today.getFullYear(), today.getMonth() + monthsLeft, 1);
    etaLabel = eta.toLocaleDateString(undefined, {
      month: "short",
      year: "numeric",
    });
  }

  return { savedChf, pct, monthlyRate, etaLabel };
}
