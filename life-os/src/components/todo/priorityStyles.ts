import type { Priority } from "../../types";

export const PRIORITY_ORDER: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export const PRIORITY_STYLES: Record<
  Priority,
  { label: string; dot: string; text: string }
> = {
  high: { label: "High", dot: "bg-[#ff453a]", text: "text-[#ff453a]" },
  medium: { label: "Medium", dot: "bg-[#ff9f0a]", text: "text-[#ff9f0a]" },
  low: { label: "Low", dot: "bg-[#30d158]", text: "text-[#30d158]" },
};
