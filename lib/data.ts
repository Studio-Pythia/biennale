import type { Pavilion } from "./types";
import pavilionsData from "@/data/pavilions.json";
import { GIARDINI_POSITIONS, ARSENALE_ZONES, parseGridRef, getVenueType } from "./venue-coordinates";

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

/**
 * Get accurate coordinates for a pavilion based on its grid_ref or venue
 * Uses the official Biennale map numbering system
 */
export function getPavilionCoords(pavilion: Pavilion): { x: number; y: number } {
  // First try to use grid_ref if available
  if (pavilion.grid_ref) {
    const coords = parseGridRef(pavilion.grid_ref);
    if (coords) return coords;
  }
  
  // Fall back to existing coords if they exist
  if (pavilion.coords) {
    return pavilion.coords;
  }
  
  // Default position based on venue
  const venueType = getVenueType(pavilion.grid_ref || pavilion.venue);
  switch (venueType) {
    case "giardini":
      return { x: 1100, y: 500 };
    case "arsenale":
      return { x: 850, y: 550 };
    default:
      return { x: 400, y: 400 };
  }
}

/**
 * Get all Giardini pavilion positions for map labeling
 */
export function getGiardiniPositions() {
  return GIARDINI_POSITIONS;
}

/**
 * Get all Arsenale zones for map labeling
 */
export function getArsenaleZones() {
  return ARSENALE_ZONES;
}
