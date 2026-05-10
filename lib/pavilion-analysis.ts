import type { Pavilion } from "./types";

export interface PavilionAnalysis {
  greenFlags: string[];
  yellowFlags: string[];
  redFlags: string[];
  fundingSummary: string[];
  selectionSummary: string[];
}

export function analyzePavilion(pavilion: Pavilion): PavilionAnalysis {
  const greenFlags: string[] = [];
  const yellowFlags: string[] = [];
  const redFlags = [...pavilion.red_flags];
  const fundingSummary: string[] = [];
  const selectionSummary: string[] = [];

  const privateCount = pavilion.private_funders.length;
  const publicCount = pavilion.public_funding_sources.length;

  if (pavilion.total_budget_disclosed && pavilion.total_budget_amount_usd !== null) {
    greenFlags.push("Total budget disclosed.");
    fundingSummary.push(`Total budget: disclosed at ${pavilion.total_budget_amount_usd.toLocaleString("en-US")} USD.`);
  } else {
    yellowFlags.push("Total budget not publicly disclosed.");
    fundingSummary.push("Total budget: undisclosed.");
  }

  if (publicCount > 0) {
    greenFlags.push("Public funding sources are listed.");
    fundingSummary.push(`Public funding: ${publicCount} named source${publicCount > 1 ? "s" : ""}.`);
  } else {
    yellowFlags.push("No public funding sources listed.");
  }

  if (privateCount > 0) {
    fundingSummary.push(`Private funders: ${privateCount} named funder${privateCount > 1 ? "s" : ""}.`);
  } else {
    yellowFlags.push("No private funders listed.");
    fundingSummary.push("Private funding: no named private funders.");
  }

  if (pavilion.selection_method === "open_call" || pavilion.selection_method === "panel") {
    greenFlags.push("Selection process uses a structured process (open call or panel).");
  }
  if (pavilion.selection_method === "ministerial" || pavilion.selection_method === "invitation") {
    yellowFlags.push("Selection process relies on direct appointment or invitation.");
  }
  if (pavilion.selection_method === "unknown") {
    yellowFlags.push("Selection process is unknown.");
  }

  selectionSummary.push(`Selection method: ${pavilion.selection_method.replace("_", " ")}.`);
  if (pavilion.selection_method_notes) {
    selectionSummary.push(`Selection notes: ${pavilion.selection_method_notes}`);
  }

  return {
    greenFlags,
    yellowFlags,
    redFlags,
    fundingSummary,
    selectionSummary,
  };
}
