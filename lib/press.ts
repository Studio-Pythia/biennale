import pressData from "@/data/press_coverage.json";

export type PressSentiment =
  | "positive"
  | "mixed"
  | "negative"
  | "neutral"
  | "unknown";

export interface PressEntry {
  outlet: string;
  outlet_label: string;
  url: string;
  headline: string;
  published_at: string | null;
  snippet: string;
  sentiment: PressSentiment;
  key_phrases: string[];
  validated: boolean;
  validation_notes: string;
}

export interface PavilionPress {
  id: string;
  country: string;
  scraped_at: string;
  entries: PressEntry[];
}

const PRESS: Record<string, PavilionPress> =
  pressData as Record<string, PavilionPress>;

const ALL_OUTLETS = [
  "art_newspaper",
  "artnews",
  "frieze",
  "hyperallergic",
  "e_flux",
  "artforum",
] as const;

export const PRESS_OUTLET_COUNT = ALL_OUTLETS.length;

export function getPress(id: string): PavilionPress | null {
  return PRESS[id] ?? null;
}

export function getValidatedEntries(id: string): PressEntry[] {
  return getPress(id)?.entries.filter((e) => e.validated && e.url) ?? [];
}

export function getOutletCoverageCount(id: string): number {
  const entries = getValidatedEntries(id);
  return new Set(entries.map((e) => e.outlet)).size;
}

export const SENTIMENT_COLORS: Record<PressSentiment, string> = {
  positive: "#22c55e",
  mixed: "#fbbf24",
  negative: "#e11d48",
  neutral: "#a1a1aa",
  unknown: "#6b7280",
};

export const SENTIMENT_LABELS: Record<PressSentiment, string> = {
  positive: "Positive",
  mixed: "Mixed",
  negative: "Negative",
  neutral: "Neutral",
  unknown: "Unknown",
};
