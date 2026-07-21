// Flexible CSV parsing for Swiss bank exports (UBS, ZKB, PostFinance, …). These
// differ in delimiter (`;` is common in CH), decimal marker, thousands marker
// ('1'234.56'), and column order — so we detect rather than hard-code, and let
// the user re-map columns in the import preview.

export interface CsvTable {
  headers: string[];
  rows: string[][];
  delimiter: string;
}

const DELIMITERS = [";", ",", "\t"] as const;

function detectDelimiter(firstLine: string): string {
  let best = ";";
  let bestCount = -1;
  for (const d of DELIMITERS) {
    const count = firstLine.split(d).length;
    if (count > bestCount) {
      bestCount = count;
      best = d;
    }
  }
  return best;
}

/** Parse one delimited line, honouring "double-quoted" fields with escaped "". */
function parseLine(line: string, delimiter: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((c) => c.trim());
}

export function parseCsv(text: string): CsvTable {
  const lines = text
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [], delimiter: ";" };
  const delimiter = detectDelimiter(lines[0]);
  const all = lines.map((l) => parseLine(l, delimiter));
  const width = Math.max(...all.map((r) => r.length));
  const norm = all.map((r) => {
    const copy = [...r];
    while (copy.length < width) copy.push("");
    return copy;
  });
  return { headers: norm[0], rows: norm.slice(1), delimiter };
}

/** Swiss numbers: "1'234.56", "1'234,56", "-45.00", "45.00-", "1.234,56". */
export function parseSwissNumber(raw: string): number | null {
  let s = raw.trim().replace(/["']/g, "").replace(/\s/g, "");
  if (!s) return null;
  let sign = 1;
  if (s.startsWith("-") || s.endsWith("-")) sign = -1;
  s = s.replace(/-/g, "").replace(/\+/g, "");
  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  // Whichever separator is rightmost is the decimal separator.
  if (lastComma > lastDot) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else {
    s = s.replace(/,/g, "");
  }
  const n = Number(s);
  return Number.isNaN(n) ? null : sign * n;
}

/** Accepts DD.MM.YYYY, DD.MM.YY, YYYY-MM-DD, DD/MM/YYYY -> ISO YYYY-MM-DD. */
export function parseFlexibleDate(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const dmy = /^(\d{1,2})[./](\d{1,2})[./](\d{2,4})/.exec(s);
  if (dmy) {
    let [, d, m, y] = dmy;
    if (y.length === 2) y = `20${y}`;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const parsed = new Date(s);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return null;
}

export interface ColumnMapping {
  dateCol: number;
  amountCol: number;
  descCol: number;
}

const DATE_HINTS = ["date", "datum", "valuta", "buchung"];
const AMOUNT_HINTS = ["amount", "betrag", "belastung", "debit", "soll", "value"];
const DESC_HINTS = [
  "description",
  "beschreibung",
  "buchungstext",
  "text",
  "details",
  "verwendung",
  "empfänger",
];

function guessCol(
  headers: string[],
  rows: string[][],
  hints: string[],
  test: (v: string) => boolean,
): number {
  const lower = headers.map((h) => h.toLowerCase());
  for (let i = 0; i < lower.length; i++) {
    if (hints.some((h) => lower[i].includes(h))) return i;
  }
  // Fall back to the column whose sample values mostly pass `test`.
  const sample = rows.slice(0, 8);
  let best = -1;
  let bestScore = 0;
  for (let c = 0; c < headers.length; c++) {
    const score = sample.filter((r) => test(r[c] ?? "")).length;
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return best >= 0 ? best : 0;
}

export function guessMapping(table: CsvTable): ColumnMapping {
  const { headers, rows } = table;
  const dateCol = guessCol(
    headers,
    rows,
    DATE_HINTS,
    (v) => parseFlexibleDate(v) !== null,
  );
  const amountCol = guessCol(
    headers,
    rows,
    AMOUNT_HINTS,
    (v) => parseSwissNumber(v) !== null && /\d/.test(v),
  );
  const descCol = guessCol(
    headers,
    rows,
    DESC_HINTS,
    (v) => v.length > 3 && /[a-zA-Z]/.test(v),
  );
  return { dateCol, amountCol, descCol };
}

export interface ParsedTx {
  date: string;
  amountChf: number;
  description: string;
}

/** Apply a column mapping, dropping rows we can't parse. Amounts become
 * positive outflow magnitudes (this tracker records spending). */
export function rowsToTransactions(
  table: CsvTable,
  mapping: ColumnMapping,
): ParsedTx[] {
  const out: ParsedTx[] = [];
  for (const row of table.rows) {
    const date = parseFlexibleDate(row[mapping.dateCol] ?? "");
    const amount = parseSwissNumber(row[mapping.amountCol] ?? "");
    const description = (row[mapping.descCol] ?? "").trim();
    if (!date || amount == null || amount === 0) continue;
    out.push({ date, amountChf: Math.abs(amount), description });
  }
  return out;
}
