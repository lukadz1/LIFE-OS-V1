import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getRecurringRules,
  getSavingsGoals,
  getSpendCategories,
  getTransactions,
  saveRecurringRules,
  saveSavingsGoals,
  saveSpendCategories,
  saveTransactions,
} from "../services/dataService";
import type {
  RecurringRule,
  SavingsGoal,
  SpendCategory,
  Transaction,
  TxBucket,
} from "../types";
import { todayISO } from "../utils/date";
import { createId } from "../utils/id";
import { advanceDate } from "../utils/spendingEngine";

export interface CategoryInput {
  name: string;
  bucket: TxBucket;
  monthlyBudgetChf: number | null;
  keywords: string[];
}

export interface TransactionInput {
  date: string;
  amountChf: number;
  description: string;
  categoryId: string | null;
  recurringId?: string;
}

export interface RecurringInput {
  description: string;
  amountChf: number;
  categoryId: string | null;
  interval: RecurringRule["interval"];
  nextDue: string;
}

export interface SavingsGoalInput {
  name: string;
  targetChf: number;
  targetDate: string | null;
  linkedCategoryId: string | null;
}

export function useSpending() {
  const [categories, setCategories] = useState<SpendCategory[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurring, setRecurring] = useState<RecurringRule[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  // Mirror of `recurring` for reads that must be synchronous (confirmRecurring
  // books a transaction from a rule and can't wait for a state-updater closure).
  const recurringRef = useRef<RecurringRule[]>([]);
  useEffect(() => {
    recurringRef.current = recurring;
  }, [recurring]);

  useEffect(() => {
    let active = true;
    (async () => {
      const [cats, txs, rules, savingsGoals] = await Promise.all([
        getSpendCategories(),
        getTransactions(),
        getRecurringRules(),
        getSavingsGoals(),
      ]);
      if (!active) return;
      setCategories(cats);
      setTransactions(txs);
      setRecurring(rules);
      setGoals(savingsGoals);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  // Every mutation persists inside the state updater, using the array it just
  // computed — matching useFinance, so a load resolving can never race a save.

  // ---- Categories ----
  const addCategory = useCallback((input: CategoryInput) => {
    const cat: SpendCategory = {
      id: createId(),
      name: input.name.trim(),
      bucket: input.bucket,
      monthlyBudgetChf: input.monthlyBudgetChf,
      keywords: input.keywords,
      createdAt: new Date().toISOString(),
    };
    setCategories((prev) => {
      const next = [...prev, cat];
      void saveSpendCategories(next);
      return next;
    });
  }, []);

  const updateCategory = useCallback(
    (id: string, patch: Partial<CategoryInput>) => {
      setCategories((prev) => {
        const next = prev.map((c) =>
          c.id === id
            ? {
                ...c,
                ...patch,
                name: patch.name?.trim() ?? c.name,
              }
            : c,
        );
        void saveSpendCategories(next);
        return next;
      });
    },
    [],
  );

  const deleteCategory = useCallback((id: string) => {
    setCategories((prev) => {
      const next = prev.filter((c) => c.id !== id);
      void saveSpendCategories(next);
      return next;
    });
    // Orphan the transactions rather than delete them.
    setTransactions((prev) => {
      const next = prev.map((t) =>
        t.categoryId === id ? { ...t, categoryId: null } : t,
      );
      void saveTransactions(next);
      return next;
    });
  }, []);

  // ---- Transactions ----
  const addTransaction = useCallback((input: TransactionInput) => {
    const tx: Transaction = {
      id: createId(),
      date: input.date,
      amountChf: input.amountChf,
      description: input.description.trim(),
      categoryId: input.categoryId,
      recurringId: input.recurringId,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => {
      const next = [tx, ...prev].sort((a, b) => b.date.localeCompare(a.date));
      void saveTransactions(next);
      return next;
    });
  }, []);

  const addTransactions = useCallback((inputs: TransactionInput[]) => {
    if (inputs.length === 0) return;
    const now = new Date().toISOString();
    const created: Transaction[] = inputs.map((input) => ({
      id: createId(),
      date: input.date,
      amountChf: input.amountChf,
      description: input.description.trim(),
      categoryId: input.categoryId,
      recurringId: input.recurringId,
      createdAt: now,
    }));
    setTransactions((prev) => {
      const next = [...created, ...prev].sort((a, b) =>
        b.date.localeCompare(a.date),
      );
      void saveTransactions(next);
      return next;
    });
  }, []);

  const updateTransactionCategory = useCallback(
    (id: string, categoryId: string | null) => {
      setTransactions((prev) => {
        const next = prev.map((t) =>
          t.id === id ? { ...t, categoryId } : t,
        );
        void saveTransactions(next);
        return next;
      });
    },
    [],
  );

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => {
      const next = prev.filter((t) => t.id !== id);
      void saveTransactions(next);
      return next;
    });
  }, []);

  // ---- Recurring rules ----
  const addRecurring = useCallback((input: RecurringInput) => {
    const rule: RecurringRule = {
      id: createId(),
      description: input.description.trim(),
      amountChf: input.amountChf,
      categoryId: input.categoryId,
      interval: input.interval,
      nextDue: input.nextDue,
      active: true,
      createdAt: new Date().toISOString(),
    };
    setRecurring((prev) => {
      const next = [...prev, rule];
      void saveRecurringRules(next);
      return next;
    });
  }, []);

  const toggleRecurring = useCallback((id: string) => {
    setRecurring((prev) => {
      const next = prev.map((r) =>
        r.id === id ? { ...r, active: !r.active } : r,
      );
      void saveRecurringRules(next);
      return next;
    });
  }, []);

  const deleteRecurring = useCallback((id: string) => {
    setRecurring((prev) => {
      const next = prev.filter((r) => r.id !== id);
      void saveRecurringRules(next);
      return next;
    });
  }, []);

  /** Confirm a due draft: book a transaction and roll nextDue forward. */
  const confirmRecurring = useCallback((id: string) => {
    const rule = recurringRef.current.find((r) => r.id === id);
    if (!rule) return;
    const booked: Transaction = {
      id: createId(),
      date: rule.nextDue,
      amountChf: rule.amountChf,
      description: rule.description,
      categoryId: rule.categoryId,
      recurringId: rule.id,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => {
      const next = [booked, ...prev].sort((a, b) =>
        b.date.localeCompare(a.date),
      );
      void saveTransactions(next);
      return next;
    });
    setRecurring((prev) => {
      const next = prev.map((r) =>
        r.id === id ? { ...r, nextDue: advanceDate(r.nextDue, r.interval) } : r,
      );
      void saveRecurringRules(next);
      return next;
    });
  }, []);

  /** Skip a due draft without booking: just advance the schedule. */
  const skipRecurring = useCallback((id: string) => {
    setRecurring((prev) => {
      const next = prev.map((r) =>
        r.id === id ? { ...r, nextDue: advanceDate(r.nextDue, r.interval) } : r,
      );
      void saveRecurringRules(next);
      return next;
    });
  }, []);

  // ---- Savings goals ----
  const addGoal = useCallback((input: SavingsGoalInput) => {
    const goal: SavingsGoal = {
      id: createId(),
      name: input.name.trim(),
      targetChf: input.targetChf,
      targetDate: input.targetDate,
      manualSavedChf: 0,
      linkSavingsBucket: input.linkedCategoryId === null,
      linkedCategoryId: input.linkedCategoryId,
      createdAt: new Date().toISOString(),
    };
    setGoals((prev) => {
      const next = [...prev, goal];
      void saveSavingsGoals(next);
      return next;
    });
  }, []);

  const depositGoal = useCallback((id: string, amountChf: number) => {
    setGoals((prev) => {
      const next = prev.map((g) =>
        g.id === id
          ? { ...g, manualSavedChf: g.manualSavedChf + amountChf }
          : g,
      );
      void saveSavingsGoals(next);
      return next;
    });
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => {
      const next = prev.filter((g) => g.id !== id);
      void saveSavingsGoals(next);
      return next;
    });
  }, []);

  const dueDraftCount = useMemo(() => {
    const today = todayISO();
    return recurring.filter((r) => r.active && r.nextDue <= today).length;
  }, [recurring]);

  return {
    loading,
    categories,
    transactions,
    recurring,
    goals,
    dueDraftCount,
    addCategory,
    updateCategory,
    deleteCategory,
    addTransaction,
    addTransactions,
    updateTransactionCategory,
    deleteTransaction,
    addRecurring,
    toggleRecurring,
    deleteRecurring,
    confirmRecurring,
    skipRecurring,
    addGoal,
    depositGoal,
    deleteGoal,
  };
}
