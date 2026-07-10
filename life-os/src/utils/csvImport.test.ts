import { describe, expect, it } from "vitest";
import {
  guessMapping,
  parseCsv,
  parseFlexibleDate,
  parseSwissNumber,
  rowsToTransactions,
} from "./csvImport";

describe("parseSwissNumber", () => {
  it("handles apostrophe thousands separators", () => {
    expect(parseSwissNumber("1'234.56")).toBe(1234.56);
    expect(parseSwissNumber("-1'480.00")).toBe(-1480);
  });

  it("handles comma decimals (1'234,56 and 1.234,56)", () => {
    expect(parseSwissNumber("1'234,56")).toBe(1234.56);
    expect(parseSwissNumber("1.234,56")).toBe(1234.56);
  });

  it("handles a trailing minus sign", () => {
    expect(parseSwissNumber("45.00-")).toBe(-45);
  });

  it("returns null for non-numeric input", () => {
    expect(parseSwissNumber("abc")).toBeNull();
    expect(parseSwissNumber("")).toBeNull();
  });
});

describe("parseFlexibleDate", () => {
  it("parses DD.MM.YYYY", () => {
    expect(parseFlexibleDate("01.07.2026")).toBe("2026-07-01");
  });

  it("parses DD.MM.YY, expanding the century", () => {
    expect(parseFlexibleDate("09.03.26")).toBe("2026-03-09");
  });

  it("passes through ISO dates", () => {
    expect(parseFlexibleDate("2026-07-05")).toBe("2026-07-05");
  });

  it("returns null for junk", () => {
    expect(parseFlexibleDate("not a date")).toBeNull();
  });
});

describe("parseCsv + guessMapping + rowsToTransactions", () => {
  const csv = `Datum;Buchungstext;Betrag
01.07.2026;Miete Baugenossenschaft;-1'480.00
05.07.2026;Migros Zürich;-92.40
06.07.2026;Lohn Arbeitgeber;3'500.00`;

  it("detects the delimiter and header", () => {
    const table = parseCsv(csv);
    expect(table.delimiter).toBe(";");
    expect(table.headers).toEqual(["Datum", "Buchungstext", "Betrag"]);
    expect(table.rows).toHaveLength(3);
  });

  it("guesses date/amount/description columns by header name", () => {
    const table = parseCsv(csv);
    const mapping = guessMapping(table);
    expect(mapping.dateCol).toBe(0);
    expect(mapping.descCol).toBe(1);
    expect(mapping.amountCol).toBe(2);
  });

  it("converts rows to positive-outflow transactions", () => {
    const table = parseCsv(csv);
    const txs = rowsToTransactions(table, guessMapping(table));
    expect(txs).toHaveLength(3);
    expect(txs[0]).toEqual({
      date: "2026-07-01",
      amountChf: 1480,
      description: "Miete Baugenossenschaft",
    });
    // A positive credit (Lohn) is stored as a magnitude too.
    expect(txs[2].amountChf).toBe(3500);
  });

  it("drops rows with an unparseable amount or date", () => {
    const messy = `Datum;Text;Betrag
01.07.2026;Ok;-10.00
;Missing date;-5.00
02.07.2026;Missing amount;`;
    const table = parseCsv(messy);
    const txs = rowsToTransactions(table, { dateCol: 0, descCol: 1, amountCol: 2 });
    expect(txs).toHaveLength(1);
    expect(txs[0].description).toBe("Ok");
  });
});
