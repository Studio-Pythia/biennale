import type { Pavilion } from "./types";
import pavilionsData from "@/data/pavilions.json";

export function getPavilions(): Pavilion[] {
  return pavilionsData as Pavilion[];
}

export function getPavilionById(id: string): Pavilion | undefined {
  return getPavilions().find((p) => p.id === id);
}

export function getAllFunders(): { name: string; count: number; type: string }[] {
  const funderMap = new Map<string, { count: number; type: string }>();

  getPavilions().forEach((p) => {
    p.private_funders.forEach((f) => {
      const existing = funderMap.get(f.name);
      if (existing) {
        existing.count++;
      } else {
        funderMap.set(f.name, { count: 1, type: f.type });
      }
    });
  });

  return Array.from(funderMap.entries())
    .map(([name, { count, type }]) => ({ name, count, type }))
    .sort((a, b) => b.count - a.count);
}

export function formatBudget(amount: number | null): string {
  if (amount === null) return "Undisclosed";
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount}`;
}

export function getVenueColor(venue: string): string {
  switch (venue) {
    case "Giardini":
      return "#22c55e"; // green
    case "Arsenale":
      return "#f97316"; // orange
    case "Off-site":
      return "#3b82f6"; // blue
    default:
      return "#6b7280"; // gray
  }
}

export function getSelectionMethodLabel(method: string): string {
  switch (method) {
    case "open_call":
      return "Open Call";
    case "panel":
      return "Panel Selection";
    case "ministerial":
      return "Ministerial Appointment";
    case "invitation":
      return "Invitation";
    default:
      return "Unknown";
  }
}
