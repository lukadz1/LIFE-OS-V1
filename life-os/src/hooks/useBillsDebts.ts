import { useCallback, useEffect, useState } from "react";
import { getBillsDebts, saveBillsDebts } from "../services/dataService";
import type { BillDebt, BillDebtKind } from "../types";
import { createId } from "../utils/id";

export interface BillDebtInput {
  kind: BillDebtKind;
  name: string;
  amountChf: number;
  dueDate: string | null;
  recurring: boolean;
}

export function useBillsDebts() {
  const [items, setItems] = useState<BillDebt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const loaded = await getBillsDebts();
      if (!active) return;
      setItems(loaded);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const addItem = useCallback((input: BillDebtInput) => {
    const item: BillDebt = {
      id: createId(),
      kind: input.kind,
      name: input.name.trim(),
      amountChf: input.amountChf,
      dueDate: input.dueDate,
      recurring: input.recurring,
      paid: false,
      createdAt: new Date().toISOString(),
    };
    setItems((prev) => {
      const next = [...prev, item];
      void saveBillsDebts(next);
      return next;
    });
  }, []);

  const togglePaid = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.map((i) =>
        i.id === id ? { ...i, paid: !i.paid } : i,
      );
      void saveBillsDebts(next);
      return next;
    });
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      void saveBillsDebts(next);
      return next;
    });
  }, []);

  return { loading, items, addItem, togglePaid, deleteItem };
}
