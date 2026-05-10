import type { FunderType } from "./types";

export const FUNDER_TYPE_COLORS: Record<FunderType, string> = {
  individual: "#a78bfa",
  foundation: "#60a5fa",
  corporate: "#fbbf24",
  gallery: "#f472b6",
};

export const FUNDER_TYPE_LABELS: Record<FunderType, string> = {
  individual: "Individual",
  foundation: "Foundation",
  corporate: "Corporate",
  gallery: "Gallery",
};

export const FUNDER_TYPES: FunderType[] = [
  "individual",
  "foundation",
  "corporate",
  "gallery",
];
