import { describe, expect, it } from "vitest";
import type { SpendCategory, Transaction } from "../types";
import {
  budgetStatus,
  bucketTotals,
  categorySpent,
  isDuplicate,
  suggestCategoryId,
  txSignature,
} from "./spendingEngine";

const categories: SpendCategory[] = [
  { id: "rent", name: "Rent", bucket: "fixed", monthlyBudgetChf: 1500, keywords: ["miete", "rent"], createdAt: "" },
  { id: "food", name: "Groceries", bucket: "variable", monthlyBudgetChf: 500, keywords: ["migros", "coop"], createdAt: "" },
  { id: "save", name: "Savings", bucket: "savings", monthlyBudgetChf: null, keywords: [], createdAt: "" },
];

function tx(partial: Partial<Transaction>): Transaction {
  return {
    id: partial.id ?? Math.random().toString(36),
    date: partial.date ?? "2026-07-05",
    amountChf: partial.amountChf ?? 10,
    description: partial.description ?? "Test",
    categoryId: partial.categoryId ?? null,
    createdAt: "",
  };
}

describe("txSignature", () => {
  it("is stable regardless of case and whitespace", () => {
    expect(txSignature("2026-07-05", 92.4, "  Migros   ZÜRICH ")).toBe(
      txSignature("2026-07-05", 92.4, "migros zürich"),
    );
  });

  it("rounds amounts to 2 decimals", () => {
    expect(txSignature("2026-07-05", 92.401, "x")).toBe(
      txSignature("2026-07-05", 92.399, "x"),
    );
  });
});

describe("isDuplicate", () => {
  const existing = [
    tx({ date: "2026-07-05", amountChf: 92.4, description: "Migros Zürich" }),
    tx({ date: "2026-07-03", amountChf: 312, description: "Krankenkasse CSS" }),
  ];

  it("flags an identical transaction (case/space-insensitive)", () => {
    expect(
      isDuplicate(
        { date: "2026-07-05", amountChf: 92.4, description: "MIGROS  zürich" },
        existing,
      ),
    ).toBe(true);
  });

  it("does not flag a different amount", () => {
    expect(
      isDuplicate(
        { date: "2026-07-05", amountChf: 91.4, description: "Migros Zürich" },
        existing,
      ),
    ).toBe(false);
  });

  it("does not flag a different date", () => {
    expect(
      isDuplicate(
        { date: "2026-07-06", amountChf: 92.4, description: "Migros Zürich" },
        existing,
      ),
    ).toBe(false);
  });

  it("does not flag a different description", () => {
    expect(
      isDuplicate(
        { date: "2026-07-05", amountChf: 92.4, description: "Coop" },
        existing,
      ),
    ).toBe(false);
  });

  it("returns false against an empty ledger", () => {
    expect(
      isDuplicate(
        { date: "2026-07-05", amountChf: 92.4, description: "Migros" },
        [],
      ),
    ).toBe(false);
  });
});

describe("categorySpent", () => {
  const txs = [
    tx({ categoryId: "food", date: "2026-07-05", amountChf: 92 }),
    tx({ categoryId: "food", date: "2026-07-19", amountChf: 58 }),
    tx({ categoryId: "food", date: "2026-06-19", amountChf: 40 }), // other month
    tx({ categoryId: "rent", date: "2026-07-01", amountChf: 1480 }), // other category
  ];

  it("sums only the given category within the given month", () => {
    expect(categorySpent("food", txs, "2026-07")).toBe(150);
  });
});

describe("budgetStatus", () => {
  const txs = [
    tx({ categoryId: "rent", date: "2026-07-01", amountChf: 1480 }),
    tx({ categoryId: "food", date: "2026-07-05", amountChf: 620 }),
  ];

  it("reports remaining budget when under", () => {
    const s = budgetStatus(categories[0], txs, "2026-07");
    expect(s.spentChf).toBe(1480);
    expect(s.remainingChf).toBe(20);
    expect(s.over).toBe(false);
    expect(s.pct).toBeCloseTo(1480 / 1500);
  });

  it("flags over budget with a negative remainder", () => {
    const s = budgetStatus(categories[1], txs, "2026-07");
    expect(s.spentChf).toBe(620);
    expect(s.over).toBe(true);
    expect(s.remainingChf).toBe(-120);
    expect(s.pct).toBeGreaterThan(1);
  });

  it("returns null budget fields when no budget is set", () => {
    const s = budgetStatus(categories[2], txs, "2026-07");
    expect(s.budgetChf).toBeNull();
    expect(s.remainingChf).toBeNull();
    expect(s.pct).toBeNull();
    expect(s.over).toBe(false);
  });
});

describe("bucketTotals", () => {
  it("groups spend into 50/30/20 buckets for the month", () => {
    const txs = [
      tx({ categoryId: "rent", date: "2026-07-01", amountChf: 1480 }),
      tx({ categoryId: "food", date: "2026-07-05", amountChf: 200 }),
      tx({ categoryId: "save", date: "2026-07-25", amountChf: 800 }),
      tx({ categoryId: "food", date: "2026-06-05", amountChf: 999 }), // other month ignored
      tx({ categoryId: null, date: "2026-07-05", amountChf: 50 }), // uncategorized ignored
    ];
    expect(bucketTotals(txs, categories, "2026-07")).toEqual({
      fixed: 1480,
      variable: 200,
      savings: 800,
    });
  });
});

describe("suggestCategoryId", () => {
  it("matches a keyword substring case-insensitively", () => {
    expect(suggestCategoryId("MIGROS Zürich Filiale", categories)).toBe("food");
    expect(suggestCategoryId("Miete Juli", categories)).toBe("rent");
  });

  it("returns null when nothing matches", () => {
    expect(suggestCategoryId("Unknown vendor", categories)).toBeNull();
  });
});
