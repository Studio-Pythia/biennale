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
  const sourceCount = pavilion.sources.length;

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

  const hasPublic = publicCount > 0;
  const hasPrivate = privateCount > 0;
  const fundingMix: PavilionAnalysis["dataProfile"]["fundingMix"] = hasPublic && hasPrivate
    ? "mixed"
    : hasPublic
      ? "public_only"
      : hasPrivate
        ? "private_only"
        : "undisclosed";

  const selectionRisk: PavilionAnalysis["dataProfile"]["selectionRisk"] =
    pavilion.selection_method === "open_call" || pavilion.selection_method === "panel"
      ? "low"
      : pavilion.selection_method === "unknown"
        ? "high"
        : "medium";

  let transparencyScore = 0;
  if (pavilion.total_budget_disclosed && pavilion.total_budget_amount_usd !== null) transparencyScore += 30;
  if (hasPublic) transparencyScore += 20;
  if (hasPrivate) transparencyScore += 20;
  transparencyScore += Math.min(30, sourceCount * 10);
  const evidenceStrength: PavilionAnalysis["dataProfile"]["evidenceStrength"] =
    sourceCount >= 3 ? "strong" : sourceCount >= 2 ? "moderate" : "weak";

  return {
    greenFlags,
    yellowFlags,
    redFlags,
    fundingSummary,
    selectionSummary,
    dataProfile: {
      transparencyScore,
      evidenceStrength,
      fundingMix,
      selectionRisk,
      sourceCount,
    },
  };
}
