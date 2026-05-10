"use client";

import { motion } from "framer-motion";
import type { Pavilion } from "@/lib/types";
import { getFlagEmoji } from "@/lib/country-flags";
import { analyzePavilion } from "@/lib/pavilion-analysis";

interface PavilionDetailProps {
  pavilion: Pavilion;
  onClose: () => void;
}

export function PavilionDetail({ pavilion, onClose }: PavilionDetailProps) {
  const analysis = analyzePavilion(pavilion);
  const flag = getFlagEmoji(pavilion.id);
  
  const venueColor = 
    pavilion.venue === "Giardini" ? "var(--color-giardini)" :
    pavilion.venue === "Arsenale" ? "var(--color-arsenale)" :
    "var(--color-offsite)";

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-2xl"
        style={{ backgroundColor: "var(--color-card)" }}
      >
        {/* Handle */}
        <div className="sticky top-0 z-10 flex justify-center py-3" style={{ backgroundColor: "var(--color-card)" }}>
          <div 
            className="w-10 h-1 rounded-full"
            style={{ backgroundColor: "var(--color-border)" }}
          />
        </div>

        <div className="px-5 pb-8">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <span className="text-5xl" role="img" aria-label={pavilion.country}>
              {flag}
            </span>
            <div className="flex-1">
              <h2 className="text-xl font-bold" style={{ color: "var(--color-foreground)" }}>
                {pavilion.country}
              </h2>
              <p className="text-sm mt-1" style={{ color: "var(--color-muted-foreground)" }}>
                {pavilion.venue_label || pavilion.venue}
              </p>
              <span
                className="inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded"
                style={{ backgroundColor: `${venueColor}20`, color: venueColor }}
              >
                {pavilion.venue}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full"
              style={{ backgroundColor: "var(--color-muted)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Red Flags */}
          {analysis.redFlags.length > 0 && (
            <div 
              className="mb-6 p-4 rounded-lg border"
              style={{ 
                backgroundColor: "rgba(220, 38, 38, 0.1)",
                borderColor: "var(--color-red-flag)"
              }}
            >
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: "var(--color-red-flag)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Red Flags
              </h3>
              <ul className="space-y-2">
                {analysis.redFlags.map((flag, i) => (
                  <li key={i} className="text-sm" style={{ color: "var(--color-foreground)" }}>
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Artist & Curator */}
          <Section title="Artist">
            <p className="font-medium" style={{ color: "var(--color-foreground)" }}>
              {pavilion.artist_name || "TBA"}
            </p>
            {pavilion.artist_born && (
              <p className="text-sm mt-1" style={{ color: "var(--color-muted-foreground)" }}>
                Born {pavilion.artist_born}
              </p>
            )}
            {pavilion.artist_based && (
              <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
                Based in {pavilion.artist_based}
              </p>
            )}
            {pavilion.artist_gallery && (
              <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
                Represented by {pavilion.artist_gallery}
              </p>
            )}
          </Section>

          <Section title="Show">
            <p className="font-medium italic" style={{ color: "var(--color-foreground)" }}>
              {pavilion.show_title || "Untitled"}
            </p>
            {pavilion.reception_summary && (
              <p className="text-sm mt-2" style={{ color: "var(--color-muted-foreground)" }}>
                {pavilion.reception_summary}
              </p>
            )}
          </Section>

          <Section title="Curator">
            <p className="font-medium" style={{ color: "var(--color-foreground)" }}>
              {pavilion.curator_name || "TBA"}
            </p>
            {pavilion.curator_affiliation && (
              <p className="text-sm mt-1" style={{ color: "var(--color-muted-foreground)" }}>
                {pavilion.curator_affiliation}
              </p>
            )}
          </Section>

          {/* Selection Method */}
          <Section title="Selection Process">
            <p className="font-medium capitalize" style={{ color: "var(--color-foreground)" }}>
              {pavilion.selection_method.replace("_", " ")}
            </p>
            {pavilion.selection_method_notes && (
              <p className="text-sm mt-1" style={{ color: "var(--color-muted-foreground)" }}>
                {pavilion.selection_method_notes}
              </p>
            )}
          </Section>

          {/* Funding */}
          <Section title="Funding">
            {pavilion.total_budget_disclosed && pavilion.total_budget_amount_usd ? (
              <p className="font-medium" style={{ color: "var(--color-green-flag)" }}>
                Budget: ${pavilion.total_budget_amount_usd.toLocaleString()} USD (disclosed)
              </p>
            ) : (
              <p className="font-medium" style={{ color: "var(--color-yellow-flag)" }}>
                Budget not disclosed
              </p>
            )}

            {pavilion.public_funding_sources.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--color-muted-foreground)" }}>
                  Public Funding
                </p>
                <ul className="space-y-1">
                  {pavilion.public_funding_sources.map((source, i) => (
                    <li key={i} className="text-sm" style={{ color: "var(--color-foreground)" }}>
                      {source}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {pavilion.private_funders.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--color-muted-foreground)" }}>
                  Private Funders
                </p>
                <ul className="space-y-2">
                  {pavilion.private_funders.map((funder, i) => (
                    <li key={i} className="text-sm" style={{ color: "var(--color-foreground)" }}>
                      <span className="font-medium">{funder.name}</span>
                      {funder.type && (
                        <span className="text-xs ml-1" style={{ color: "var(--color-muted-foreground)" }}>
                          ({funder.type})
                        </span>
                      )}
                      {funder.notes && (
                        <p className="text-xs mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
                          {funder.notes}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Section>

          {/* Sources */}
          {pavilion.sources && pavilion.sources.length > 0 && (
            <Section title="Sources">
              <ul className="space-y-1">
                {pavilion.sources.map((source, i) => (
                  <li key={i}>
                    <a
                      href={source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm underline truncate block"
                      style={{ color: "var(--color-muted-foreground)" }}
                    >
                      {new URL(source).hostname}
                    </a>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      </motion.div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h3 
        className="text-xs font-semibold uppercase tracking-wide mb-2"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}
