"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMapStore } from "@/lib/use-map-store";
import { formatBudget, getVenueColor, getSelectionMethodLabel } from "@/lib/data";
import type { Pavilion } from "@/lib/types";
import { getFlagEmoji } from "@/lib/country-flags";
import { analyzePavilion } from "@/lib/pavilion-analysis";

function FunderCard({
  funder,
  onHighlight,
}: {
  funder: Pavilion["private_funders"][0];
  onHighlight: (name: string) => void;
}) {
  const typeColors: Record<string, string> = {
    individual: "#a78bfa",
    foundation: "#60a5fa",
    corporate: "#fbbf24",
    gallery: "#f472b6",
  };

  return (
    <button
      onClick={() => onHighlight(funder.name)}
      className="w-full text-left p-3 rounded-lg transition-colors hover:bg-[var(--muted)]"
      style={{ border: "1px solid var(--border)" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-medium text-sm" style={{ color: "var(--foreground)" }}>
            {funder.name}
          </div>
          <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            {funder.sector}
          </div>
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded-full capitalize"
          style={{
            backgroundColor: `${typeColors[funder.type] || "#6b7280"}20`,
            color: typeColors[funder.type] || "#6b7280",
          }}
        >
          {funder.type}
        </span>
      </div>
      {funder.amount_usd && (
        <div className="mt-1 text-xs" style={{ color: "var(--accent-green)" }}>
          {formatBudget(funder.amount_usd)}
        </div>
      )}
      {funder.notes && (
        <div className="mt-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
          {funder.notes}
        </div>
      )}
    </button>
  );
}

function RedFlagBadge({ flag }: { flag: string }) {
  return (
    <div
      className="p-3 rounded-lg text-sm"
      style={{
        backgroundColor: "rgba(225, 29, 72, 0.1)",
        border: "1px solid rgba(225, 29, 72, 0.3)",
        color: "var(--primary)",
      }}
    >
      {flag}
    </div>
  );
}

interface DetailPanelProps {
  pavilion: Pavilion | null;
}

export function DetailPanel({ pavilion }: DetailPanelProps) {
  const { selectPavilion, highlightFunder, highlightedFunder } = useMapStore();
  const analysis = pavilion ? analyzePavilion(pavilion) : null;

  const handleFunderHighlight = (funderName: string) => {
    if (highlightedFunder === funderName) {
      highlightFunder(null);
    } else {
      highlightFunder(funderName);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {pavilion ? (
        <motion.div
          key={pavilion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.2 }}
          className="h-full flex flex-col overflow-hidden"
          style={{
            backgroundColor: "var(--card)",
            borderLeft: "1px solid var(--border)",
          }}
        >
          {/* Header */}
          <div
            className="p-4 flex items-start justify-between"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div className="flex items-start gap-3">
              {/* Large flag emoji */}
              <span className="text-4xl leading-none" role="img" aria-label={pavilion.country}>
                {getFlagEmoji(pavilion.id)}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getVenueColor(pavilion.venue) }}
                  />
                  <span
                    className="text-xs uppercase tracking-wider"
                    style={{ color: getVenueColor(pavilion.venue) }}
                  >
                    {pavilion.venue}
                  </span>
                </div>
                <h2
                  className="text-xl font-bold mt-1"
                  style={{ color: "var(--foreground)" }}
                >
                  {pavilion.country}
                </h2>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  {pavilion.grid_ref}
                </p>
              </div>
            </div>
            <button
              onClick={() => selectPavilion(null)}
              className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
              aria-label="Close panel"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Artist & Show */}
            <section>
              <h3
                className="text-xs uppercase tracking-wider mb-2"
                style={{ color: "var(--muted-foreground)" }}
              >
                Exhibition
              </h3>
              <div
                className="text-lg font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                {pavilion.show_title}
              </div>
              <div className="mt-2" style={{ color: "var(--foreground)" }}>
                <span className="font-medium">{pavilion.artist_name}</span>
              </div>
              <div className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                {pavilion.artist_born}
              </div>
              {pavilion.artist_gallery && (
                <div className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
                  Gallery: {pavilion.artist_gallery}
                </div>
              )}
            </section>

            {/* Curator */}
            <section>
              <h3
                className="text-xs uppercase tracking-wider mb-2"
                style={{ color: "var(--muted-foreground)" }}
              >
                Curator
              </h3>
              <div style={{ color: "var(--foreground)" }}>
                {pavilion.curator_name}
              </div>
              <div className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                {pavilion.curator_affiliation}
              </div>
            </section>

            {/* Selection & Budget */}
            <section className="flex gap-4">
              <div className="flex-1">
                <h3
                  className="text-xs uppercase tracking-wider mb-2"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Selection
                </h3>
                <span
                  className="inline-block px-2 py-1 text-xs rounded-full"
                  style={{
                    backgroundColor: "var(--muted)",
                    color: "var(--foreground)",
                  }}
                >
                  {getSelectionMethodLabel(pavilion.selection_method)}
                </span>
              </div>
              <div className="flex-1">
                <h3
                  className="text-xs uppercase tracking-wider mb-2"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Budget
                </h3>
                <div
                  className="text-lg font-semibold"
                  style={{ color: "var(--accent-green)" }}
                >
                  {formatBudget(pavilion.total_budget_amount_usd)}
                </div>
              </div>
            </section>

            {/* Commissioning Body */}
            <section>
              <h3
                className="text-xs uppercase tracking-wider mb-2"
                style={{ color: "var(--muted-foreground)" }}
              >
                Commissioner
              </h3>
              <div className="text-sm" style={{ color: "var(--foreground)" }}>
                {pavilion.commissioning_body}
              </div>
            </section>

            {/* Public Funding */}
            {pavilion.public_funding_sources.length > 0 && (
              <section>
                <h3
                  className="text-xs uppercase tracking-wider mb-2"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Public Funding
                </h3>
                <ul className="space-y-1">
                  {pavilion.public_funding_sources.map((source, i) => (
                    <li
                      key={i}
                      className="text-sm"
                      style={{ color: "var(--foreground)" }}
                    >
                      {source}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Private Funders */}
            {pavilion.private_funders.length > 0 && (
              <section>
                <h3
                  className="text-xs uppercase tracking-wider mb-2"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Private Funders
                  {highlightedFunder && (
                    <button
                      onClick={() => highlightFunder(null)}
                      className="ml-2 text-xs underline"
                      style={{ color: "var(--primary)" }}
                    >
                      Clear highlight
                    </button>
                  )}
                </h3>
                <div className="space-y-2">
                  {pavilion.private_funders.map((funder, i) => (
                    <FunderCard
                      key={i}
                      funder={funder}
                      onHighlight={handleFunderHighlight}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Funding & Selection Analysis */}
            {analysis && (
              <section>
                <h3
                  className="text-xs uppercase tracking-wider mb-2"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Funding & Selection Analysis
                </h3>
                <div className="mb-3 p-3 rounded-lg" style={{ border: "1px solid var(--border)", backgroundColor: "var(--muted)" }}>
                  <div className="flex items-center justify-between text-xs mb-2" style={{ color: "var(--muted-foreground)" }}>
                    <span>Transparency Score</span>
                    <span>{analysis.dataProfile.transparencyScore}/100</span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${analysis.dataProfile.transparencyScore}%`,
                        backgroundColor: analysis.dataProfile.transparencyScore >= 70 ? "rgb(34,197,94)" : analysis.dataProfile.transparencyScore >= 45 ? "rgb(250,204,21)" : "rgb(244,63,94)",
                      }}
                    />
                  </div>
                  <div className="mt-2 text-xs" style={{ color: "var(--foreground)" }}>
                    Evidence: <strong>{analysis.dataProfile.evidenceStrength}</strong> · Funding mix: <strong>{analysis.dataProfile.fundingMix.replace("_", " ")}</strong> · Selection risk: <strong>{analysis.dataProfile.selectionRisk}</strong> · Sources: <strong>{analysis.dataProfile.sourceCount}</strong>
                  </div>
                </div>
                <ul className="space-y-1">
                  {[...analysis.fundingSummary, ...analysis.selectionSummary].map((line) => (
                    <li key={line} className="text-sm" style={{ color: "var(--foreground)" }}>
                      • {line}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {analysis && analysis.greenFlags.length > 0 && (
              <section>
                <h3 className="text-xs uppercase tracking-wider mb-2" style={{ color: "rgb(34, 197, 94)" }}>
                  Green Flags
                </h3>
                <div className="space-y-2">
                  {analysis.greenFlags.map((flag, i) => (
                    <div
                      key={`${flag}-${i}`}
                      className="p-3 rounded-lg text-sm"
                      style={{
                        backgroundColor: "rgba(34, 197, 94, 0.12)",
                        border: "1px solid rgba(34, 197, 94, 0.3)",
                        color: "rgb(22, 163, 74)",
                      }}
                    >
                      {flag}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {analysis && analysis.yellowFlags.length > 0 && (
              <section>
                <h3 className="text-xs uppercase tracking-wider mb-2" style={{ color: "rgb(202, 138, 4)" }}>
                  Yellow Flags
                </h3>
                <div className="space-y-2">
                  {analysis.yellowFlags.map((flag, i) => (
                    <div
                      key={`${flag}-${i}`}
                      className="p-3 rounded-lg text-sm"
                      style={{
                        backgroundColor: "rgba(250, 204, 21, 0.12)",
                        border: "1px solid rgba(250, 204, 21, 0.3)",
                        color: "rgb(161, 98, 7)",
                      }}
                    >
                      {flag}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Red Flags */}
            {analysis && analysis.redFlags.length > 0 && (
              <section>
                <h3
                  className="text-xs uppercase tracking-wider mb-2 flex items-center gap-2"
                  style={{ color: "var(--primary)" }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: "var(--primary)" }}
                  />
                  Red Flags
                </h3>
                <div className="space-y-2">
                  {analysis.redFlags.map((flag, i) => (
                    <RedFlagBadge key={i} flag={flag} />
                  ))}
                </div>
              </section>
            )}

            {/* Reception */}
            {pavilion.reception_summary && (
              <section>
                <h3
                  className="text-xs uppercase tracking-wider mb-2"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Reception
                </h3>
                <p className="text-sm" style={{ color: "var(--foreground)" }}>
                  {pavilion.reception_summary}
                </p>
              </section>
            )}

            {/* Sources */}
            {pavilion.sources.length > 0 && (
              <section>
                <h3
                  className="text-xs uppercase tracking-wider mb-2"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Sources
                </h3>
                <ul className="space-y-1">
                  {pavilion.sources.map((source, i) => (
                    <li key={i}>
                      <a
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs break-all hover:underline"
                        style={{ color: "var(--secondary)" }}
                      >
                        {source}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-full flex items-center justify-center p-8"
          style={{
            backgroundColor: "var(--card)",
            borderLeft: "1px solid var(--border)",
          }}
        >
          <div className="text-center">
            <div
              className="text-4xl mb-4"
              style={{ color: "var(--muted-foreground)" }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="mx-auto"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </div>
            <p style={{ color: "var(--muted-foreground)" }}>
              Click a pavilion on the map to view details
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
