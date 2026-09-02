import type { SpendCategory } from "../types";

// Categories created before emojis existed (or imported ones) get a best-guess
// icon from their name, so the simplified finance UI never shows a bare label.
const NAME_RULES: [RegExp, string][] = [
  [/rent|miete|wohn/i, "🏠"],
  [/insur|versicher|kranken/i, "🛡️"],
  [/transport|sbb|zvv|zug|bus|bahn/i, "🚌"],
  [/subs|abo|netflix|spotify/i, "📺"],
  [/grocer|lebensmittel|einkauf|migros|coop/i, "🛒"],
  [/dining|restaurant|essen|food|caf|coffee|kaffee/i, "🍔"],
  [/shop|kleid/i, "🛍️"],
  [/3a|vorsorge/i, "🏦"],
  [/sav|spar/i, "💰"],
  [/health|arzt|fitness|gym|sport/i, "❤️"],
  [/fun|party|ausgang|entertain|kino|game/i, "🎉"],
  [/travel|reise|ferien|flug/i, "✈️"],
  [/school|schule|studium|buch/i, "📚"],
];

const FALLBACK = "💸";

export function categoryEmoji(
  category: Pick<SpendCategory, "name" | "emoji"> | null | undefined,
): string {
  if (!category) return "✨";
  if (category.emoji) return category.emoji;
  for (const [pattern, emoji] of NAME_RULES) {
    if (pattern.test(category.name)) return emoji;
  }
  return FALLBACK;
}

/** Palette offered when creating a new category. */
export const EMOJI_CHOICES = [
  "🛒",
  "🍔",
  "☕",
  "🚌",
  "🏠",
  "📺",
  "🛍️",
  "🎉",
  "❤️",
  "✈️",
  "🎮",
  "📚",
  "💰",
  "🎁",
  "🐾",
  "💸",
];
