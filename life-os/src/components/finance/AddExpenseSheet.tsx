import { Check, Pencil, Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Currency, SpendCategory } from "../../types";
import { categoryEmoji, EMOJI_CHOICES } from "../../utils/categoryEmoji";
import { CURRENCY_SYMBOLS } from "../../utils/currency";

export interface ExpenseEntry {
  amountChf: number;
  description: string;
  categoryId: string | null;
}

interface AddExpenseSheetProps {
  categories: SpendCategory[];
  currency: Currency;
  onClose: () => void;
  onSave: (entry: ExpenseEntry) => void;
  onAddCategory: (input: { name: string; emoji: string }) => SpendCategory;
  onDeleteCategory: (id: string) => void;
}

/** Bottom sheet for logging an expense in seconds: amount → tap a category →
 * save. Everything else (note, new categories) is optional and stays out of
 * the way. */
export function AddExpenseSheet({
  categories,
  currency,
  onClose,
  onSave,
  onAddCategory,
  onDeleteCategory,
}: AddExpenseSheetProps) {
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [editingCats, setEditingCats] = useState(false);
  const [newCatOpen, setNewCatOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatEmoji, setNewCatEmoji] = useState(EMOJI_CHOICES[0]);
  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const amountChf = Number(amount.replace(",", "."));
  const valid = Number.isFinite(amountChf) && amountChf > 0;
  const selected = categories.find((c) => c.id === categoryId) ?? null;

  function handleSave() {
    if (!valid) return;
    onSave({
      amountChf,
      description: note.trim() || selected?.name || "Expense",
      categoryId,
    });
  }

  function handleAddCategory() {
    const name = newCatName.trim();
    if (!name) return;
    const cat = onAddCategory({ name, emoji: newCatEmoji });
    setCategoryId(cat.id);
    setNewCatName("");
    setNewCatOpen(false);
  }

  function handleDeleteCategory(id: string) {
    onDeleteCategory(id);
    if (categoryId === id) setCategoryId(null);
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-label="Add expense"
        className="animate-sheet-in absolute inset-x-0 bottom-0 mx-auto w-full max-w-[540px] rounded-t-[26px] border-x border-t border-border bg-surface px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] motion-reduce:animate-none"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />

        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-sans text-[21px] text-text">Add expense</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-text-dim transition-colors hover:text-text"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 flex items-baseline gap-2 rounded-2xl bg-field px-4 py-3">
          <span className="shrink-0 font-mono text-[15px] text-text-dim">
            {CURRENCY_SYMBOLS[currency]}
          </span>
          <input
            ref={amountRef}
            autoFocus
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
            }}
            aria-label="Amount"
            className="w-full bg-transparent font-sans text-[40px] leading-none text-text placeholder:text-text-dim/40 focus:outline-none"
          />
        </div>

        <div className="mb-2 flex items-center justify-between">
          <p className="font-mono text-[11px] tracking-[0.14em] text-text-dim uppercase">
            Category
          </p>
          <button
            onClick={() => setEditingCats((v) => !v)}
            className={`flex items-center gap-1 font-mono text-[11px] tracking-wide uppercase transition-colors ${
              editingCats ? "text-accent" : "text-text-dim hover:text-text"
            }`}
          >
            {editingCats ? <Check size={11} /> : <Pencil size={11} />}
            {editingCats ? "Done" : "Edit"}
          </button>
        </div>

        <div className="mb-3 flex max-h-[128px] flex-wrap gap-2 overflow-y-auto">
          {categories.map((c) => {
            const active = c.id === categoryId;
            return (
              <button
                key={c.id}
                onClick={() =>
                  editingCats
                    ? handleDeleteCategory(c.id)
                    : setCategoryId(active ? null : c.id)
                }
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] transition-colors ${
                  active && !editingCats
                    ? "bg-accent font-medium text-accent-contrast"
                    : "bg-field text-text-dim hover:text-text"
                }`}
              >
                <span>{categoryEmoji(c)}</span>
                {c.name}
                {editingCats && <X size={12} className="text-[#ff453a]" />}
              </button>
            );
          })}
          <button
            onClick={() => setNewCatOpen((v) => !v)}
            className="flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1.5 text-[13px] text-text-dim transition-colors hover:text-text"
          >
            <Plus size={13} />
            New
          </button>
        </div>

        {newCatOpen && (
          <div className="mb-3 rounded-2xl bg-field p-3">
            <div className="mb-2 flex gap-1 overflow-x-auto pb-1">
              {EMOJI_CHOICES.map((e) => (
                <button
                  key={e}
                  onClick={() => setNewCatEmoji(e)}
                  aria-label={`Emoji ${e}`}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[16px] transition-colors ${
                    newCatEmoji === e ? "bg-accent/25 ring-1 ring-accent" : "hover:bg-hover"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Category name"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddCategory();
                }}
                className="w-full rounded-[10px] bg-surface px-3 py-2 text-sm text-text focus:ring-2 focus:ring-accent focus:outline-none"
              />
              <button
                onClick={handleAddCategory}
                disabled={!newCatName.trim()}
                className="shrink-0 rounded-full bg-accent px-4 text-[13px] font-medium text-accent-contrast transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                Add
              </button>
            </div>
          </div>
        )}

        <input
          type="text"
          placeholder="Note (optional), e.g. Migros"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
          }}
          className="mb-4 w-full rounded-[10px] bg-field px-3 py-2.5 text-sm text-text focus:ring-2 focus:ring-accent focus:outline-none"
        />

        <button
          onClick={handleSave}
          disabled={!valid}
          className="w-full rounded-full bg-accent py-3 text-[15px] font-semibold text-accent-contrast transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {valid
            ? `Save ${CURRENCY_SYMBOLS[currency]} ${amount.replace(",", ".")}`
            : "Save"}
        </button>
      </div>
    </div>,
    document.body,
  );
}
