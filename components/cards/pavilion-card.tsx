"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { FunderType, Pavilion } from "@/lib/types";
import {
  formatBudget,
  getSelectionMethodLabel,
  getVenueColor,
} from "@/lib/data";
import { getFlagEmoji } from "@/lib/country-flags";
import { FUNDER_TYPE_COLORS } from "@/lib/funder-style";
import { getOutletCoverageCount, PRESS_OUTLET_COUNT } from "@/lib/press";

interface PavilionCardProps {
  pavilion: Pavilion;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function PavilionCard({ pavilion, selected, onSelect }: PavilionCardProps) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (selected && ref.current) {
      ref.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selected]);

  const venueColor = getVenueColor(pavilion.venue);
  const privateTypes = uniqueFunderTypes(pavilion.private_funders.map((f) => f.type));
  const redFlagCount = pavilion.red_flags.length;
  const budgetLabel = formatBudget(pavilion.total_budget_amount_usd);
  const budgetMuted = !pavilion.total_budget_disclosed;
  const pressCount = getOutletCoverageCount(pavilion.id);

  return (
    <motion.button
      ref={ref}
      layout
      onClick={() => onSelect(pavilion.id)}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="text-left p-4 rounded-[var(--radius)] flex flex-col gap-3 h-full transition-all hover:bg-[var(--card-hover)]"
      style={{
        backgroundColor: "var(--card)",
        border: `1px solid ${selected ? "var(--primary)" : "var(--border)"}`,
        boxShadow: selected
          ? "0 0 0 1px rgba(225, 29, 72, 0.5), 0 8px 24px -8px rgba(225, 29, 72, 0.25)"
          : "0 1px 0 rgba(255,255,255,0.02) inset",
      }}
      aria-pressed={selected}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span
            className="text-[34px] leading-none flex-shrink-0"
            role="img"
            aria-label={pavilion.country}
          >
            {getFlagEmoji(pavilion.id)}
          </span>
          <div className="min-w-0">
            <div
              className="font-serif text-lg leading-tight font-semibold truncate"
              style={{ color: "var(--foreground)" }}
            >
              {pavilion.country}
            </div>
            <div
              className="text-[10px] uppercase tracking-[0.12em] mt-1"
              style={{ color: "var(--muted-foreground)" }}
            >
              {pavilion.id} · {pavilion.grid_ref}
            </div>
          </div>
        </div>

        {redFlagCount > 0 && (
          <span
            className="text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0"
            style={{
              backgroundColor: "rgba(225, 29, 72, 0.15)",
              color: "var(--primary)",
              border: "1px solid rgba(225, 29, 72, 0.3)",
            }}
            title={`${redFlagCount} red flag${redFlagCount === 1 ? "" : "s"}`}
          >
            ! {redFlagCount}
          </span>
        )}
      </div>

      <div className="text-xs flex flex-wrap items-center gap-2">
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: `${venueColor}20`,
            color: venueColor,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: venueColor }}
          />
          {pavilion.venue}
        </span>
        <span style={{ color: "var(--muted-foreground)" }}>
          {getSelectionMethodLabel(pavilion.selection_method)}
        </span>
      </div>

      <div className="text-sm" style={{ color: "var(--foreground)" }}>
        <div className="font-medium truncate">{pavilion.artist_name || "—"}</div>
        {pavilion.show_title && (
          <div
            className="text-xs italic mt-0.5 line-clamp-2"
            style={{ color: "var(--muted-foreground)" }}
          >
            {pavilion.show_title}
          </div>
        )}
      </div>

      <div
        className="mt-auto pt-3 grid grid-cols-4 gap-2 text-xs"
        style={{ borderTop: "1px dashed var(--border)" }}
      >
        <Cell label="Budget">
          <span
            className="font-semibold"
            style={{
              color: budgetMuted
                ? "var(--muted-foreground)"
                : "var(--accent-green)",
            }}
          >
            {budgetLabel}
          </span>
        </Cell>
        <Cell label="Public">
          <span style={{ color: "var(--foreground)" }} className="font-semibold">
            {pavilion.public_funding_sources.length}
          </span>
        </Cell>
        <Cell label="Private">
          <div className="flex items-center gap-1.5">
            <span
              style={{ color: "var(--foreground)" }}
              className="font-semibold"
            >
              {pavilion.private_funders.length}
            </span>
            {privateTypes.length > 0 && (
              <span className="flex items-center gap-0.5">
                {privateTypes.map((t) => (
                  <span
                    key={t}
                    title={t}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: FUNDER_TYPE_COLORS[t] }}
                  />
                ))}
              </span>
            )}
          </div>
        </Cell>
        <Cell label="Press">
          <span
            className="font-semibold"
            style={{
              color:
                pressCount === 0
                  ? "var(--muted-foreground)"
                  : "var(--foreground)",
            }}
            title={`Covered by ${pressCount} of ${PRESS_OUTLET_COUNT} outlets`}
          >
            {pressCount}/{PRESS_OUTLET_COUNT}
          </span>
        </Cell>
      </div>
    </motion.button>
  );
}

function Cell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className="uppercase tracking-wider text-[10px]"
        style={{ color: "var(--muted-foreground)" }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

function uniqueFunderTypes(types: FunderType[]): FunderType[] {
  return Array.from(new Set(types));
}
