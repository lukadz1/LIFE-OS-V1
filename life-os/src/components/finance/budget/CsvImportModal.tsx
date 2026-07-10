import { FileUp, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { TransactionInput } from "../../../hooks/useSpending";
import type { Currency, SpendCategory, Transaction } from "../../../types";
import { formatMoney } from "../../../utils/currency";
import {
  guessMapping,
  parseCsv,
  rowsToTransactions,
  type ColumnMapping,
  type CsvTable,
} from "../../../utils/csvImport";
import { isDuplicate, suggestCategoryId } from "../../../utils/spendingEngine";

interface CsvImportModalProps {
  open: boolean;
  existingTransactions: Transaction[];
  categories: SpendCategory[];
  currency: Currency;
  onClose: () => void;
  onImport: (inputs: TransactionInput[]) => void;
}

interface PreviewRow {
  date: string;
  amountChf: number;
  description: string;
  categoryId: string | null;
  duplicate: boolean;
  skip: boolean;
}

const SAMPLE_CSV = `Datum;Buchungstext;Betrag
01.07.2026;Miete Baugenossenschaft;-1'480.00
03.07.2026;Krankenkasse CSS;-312.00
05.07.2026;Migros Zürich;-92.40
06.07.2026;Spotify Premium;-13.00
09.07.2026;Restaurant Bellevue;-68.50
12.07.2026;Coop Supermarkt;-78.20
14.07.2026;Starbucks Coffee;-7.10
16.07.2026;Zalando Order;-89.00
05.07.2026;Migros Zürich;-92.40`;

export function CsvImportModal({
  open,
  existingTransactions,
  categories,
  currency,
  onClose,
  onImport,
}: CsvImportModalProps) {
  const [table, setTable] = useState<CsvTable | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping | null>(null);
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setTable(null);
      setMapping(null);
      setRows([]);
      setError(null);
    }
  }, [open]);

  function ingest(text: string) {
    const parsed = parseCsv(text);
    if (parsed.headers.length === 0 || parsed.rows.length === 0) {
      setError("Could not read any rows from that file.");
      return;
    }
    setError(null);
    setTable(parsed);
    setMapping(guessMapping(parsed));
  }

  // Rebuild preview rows whenever the table or mapping changes.
  useEffect(() => {
    if (!table || !mapping) return;
    const parsed = rowsToTransactions(table, mapping);
    const seen = new Set<string>();
    const next: PreviewRow[] = parsed.map((p) => {
      const dupExisting = isDuplicate(p, existingTransactions);
      const sig = `${p.date}|${p.amountChf.toFixed(2)}|${p.description.toLowerCase()}`;
      const dupInFile = seen.has(sig);
      seen.add(sig);
      const duplicate = dupExisting || dupInFile;
      return {
        ...p,
        categoryId: suggestCategoryId(p.description, categories),
        duplicate,
        skip: duplicate,
      };
    });
    setRows(next);
  }, [table, mapping, existingTransactions, categories]);

  const stats = useMemo(() => {
    const toImport = rows.filter((r) => !r.skip);
    return {
      total: rows.length,
      duplicates: rows.filter((r) => r.duplicate).length,
      importing: toImport.length,
    };
  }, [rows]);

  if (!open) return null;

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then(ingest);
  }

  function handleImport() {
    const inputs: TransactionInput[] = rows
      .filter((r) => !r.skip)
      .map((r) => ({
        date: r.date,
        amountChf: r.amountChf,
        description: r.description,
        categoryId: r.categoryId,
      }));
    onImport(inputs);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="panel-card flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-[22px] bg-surface"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border p-5">
          <h2 className="font-serif text-[22px] text-text italic">
            Import transactions
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text-dim transition-colors hover:text-text"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {!table ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-field text-text-dim">
                <FileUp size={22} />
              </div>
              <p className="max-w-sm text-sm text-text-dim">
                Upload a CSV export from your bank (UBS, ZKB, PostFinance…). The
                delimiter, Swiss number and date formats are detected
                automatically — you can re-map columns next.
              </p>
              {error && (
                <p className="text-[13px] text-[#ff453a]">{error}</p>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-contrast transition-opacity hover:opacity-90"
                >
                  Choose file
                </button>
                <button
                  onClick={() => ingest(SAMPLE_CSV)}
                  className="rounded-full border border-border bg-field px-4 py-2 text-sm text-text-dim transition-colors hover:text-text"
                >
                  Load sample
                </button>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv,text/plain"
                onChange={handleFile}
                className="hidden"
              />
            </div>
          ) : (
            <>
              <div className="mb-4 grid grid-cols-3 gap-2">
                <ColumnSelect
                  label="Date"
                  headers={table.headers}
                  value={mapping?.dateCol ?? 0}
                  onChange={(v) =>
                    setMapping((m) => (m ? { ...m, dateCol: v } : m))
                  }
                />
                <ColumnSelect
                  label="Amount"
                  headers={table.headers}
                  value={mapping?.amountCol ?? 0}
                  onChange={(v) =>
                    setMapping((m) => (m ? { ...m, amountCol: v } : m))
                  }
                />
                <ColumnSelect
                  label="Description"
                  headers={table.headers}
                  value={mapping?.descCol ?? 0}
                  onChange={(v) =>
                    setMapping((m) => (m ? { ...m, descCol: v } : m))
                  }
                />
              </div>

              <div className="mb-3 flex flex-wrap gap-3 font-mono text-[11px] text-text-dim">
                <span>{stats.total} rows</span>
                <span className="text-accent">{stats.importing} to import</span>
                <span className="text-[#ff8a80]">
                  {stats.duplicates} duplicate{stats.duplicates === 1 ? "" : "s"} skipped
                </span>
              </div>

              <div className="overflow-hidden rounded-[14px] border border-border">
                <div className="max-h-[38vh] overflow-y-auto">
                  {rows.map((r, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 border-b border-border/60 px-3 py-2 last:border-0 ${r.skip ? "opacity-45" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={!r.skip}
                        onChange={(e) =>
                          setRows((prev) =>
                            prev.map((row, j) =>
                              j === i ? { ...row, skip: !e.target.checked } : row,
                            ),
                          )
                        }
                        className="h-3.5 w-3.5 shrink-0 accent-[var(--color-accent)]"
                      />
                      <span className="w-14 shrink-0 font-mono text-[11px] text-text-dim">
                        {r.date.slice(5)}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[13px] text-text">
                        {r.description}
                        {r.duplicate && (
                          <span className="ml-1.5 font-mono text-[10px] text-[#ff8a80]">
                            dup
                          </span>
                        )}
                      </span>
                      <select
                        value={r.categoryId ?? ""}
                        onChange={(e) =>
                          setRows((prev) =>
                            prev.map((row, j) =>
                              j === i
                                ? { ...row, categoryId: e.target.value || null }
                                : row,
                            ),
                          )
                        }
                        className="max-w-[7rem] shrink-0 rounded-md bg-field px-1.5 py-1 text-[11px] text-text focus:ring-2 focus:ring-accent focus:outline-none"
                      >
                        <option value="">Uncategorized</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <span className="w-20 shrink-0 text-right font-mono text-[12px] text-text">
                        {formatMoney(r.amountChf, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {table && (
          <div className="flex items-center justify-between gap-2 border-t border-border p-5">
            <button
              onClick={() => {
                setTable(null);
                setMapping(null);
              }}
              className="rounded-full border border-border px-4 py-2 text-sm text-text-dim transition-colors hover:text-text"
            >
              Back
            </button>
            <button
              onClick={handleImport}
              disabled={stats.importing === 0}
              className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-contrast transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Import {stats.importing}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ColumnSelect({
  label,
  headers,
  value,
  onChange,
}: {
  label: string;
  headers: string[];
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[10px] tracking-wide text-text-dim uppercase">
        {label} column
      </label>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-[10px] bg-field px-2 py-2 text-sm text-text focus:ring-2 focus:ring-accent focus:outline-none"
      >
        {headers.map((h, i) => (
          <option key={i} value={i}>
            {h || `Column ${i + 1}`}
          </option>
        ))}
      </select>
    </div>
  );
}
