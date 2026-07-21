import { ScanLine } from "lucide-react";
import { useRef, useState } from "react";
import type { Currency } from "../../types";
import { formatMoney } from "../../utils/currency";

interface NetWorthHeaderProps {
  netWorthChf: number;
  currency: Currency;
  hasAccounts: boolean;
}

export function NetWorthHeader({
  netWorthChf,
  currency,
  hasAccounts,
}: NetWorthHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState(false);

  function handleFileChosen() {
    setNotice(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <p className="font-mono text-[11px] tracking-[0.14em] text-text-dim uppercase">
          Total net worth
        </p>
        <p className="mt-1 font-serif text-[44px] leading-none font-normal text-text italic sm:text-[52px]">
          {formatMoney(netWorthChf, currency)}
        </p>
        <p className="mt-2 max-w-md text-[13px] text-text-dim">
          {hasAccounts
            ? "Add or edit an asset below to keep your net worth current."
            : "Import a statement screenshot, or add an account manually below to start tracking."}
        </p>
      </div>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="group relative flex items-center gap-3.5 overflow-hidden rounded-[20px] border border-border bg-surface p-4 text-left transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-xl lg:col-span-5"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 140% at 15% 0%, color-mix(in srgb, var(--color-accent) 12%, transparent), transparent 60%)",
          }}
        />
        <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-contrast">
          <ScanLine size={18} />
        </span>
        <span className="relative min-w-0">
          <span className="block text-[15px] font-semibold text-text">
            Import from screenshot
          </span>
          <span className="block truncate text-[13px] text-text-dim">
            {notice
              ? "Needs a vision-capable backend — add accounts manually for now."
              : "fastest way to get started"}
          </span>
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChosen}
          className="hidden"
        />
      </button>
    </div>
  );
}
