"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { Pavilion } from "@/lib/types";
import { getVenueColor, formatBudget } from "@/lib/data";
import { useMapStore } from "@/lib/use-map-store";

interface PavilionNodeProps {
  data: {
    pavilion: Pavilion;
  };
  selected?: boolean;
}

function PavilionNodeComponent({ data, selected }: PavilionNodeProps) {
  const { pavilion } = data;
  const { selectedPavilionId, highlightedFunder } = useMapStore();

  const isSelected = selectedPavilionId === pavilion.id || selected;
  const venueColor = getVenueColor(pavilion.venue);
  const hasRedFlags = pavilion.red_flags.length > 0;

  // Check if this pavilion is connected to the highlighted funder
  const isHighlightedByFunder = highlightedFunder
    ? pavilion.private_funders.some(
        (f) => f.name.toLowerCase() === highlightedFunder.toLowerCase()
      )
    : false;

  // Calculate node size based on budget (min 40, max 80)
  const budget = pavilion.total_budget_amount_usd || 0;
  const baseSize = 40;
  const maxSize = 80;
  const nodeSize =
    budget > 0 ? Math.min(maxSize, baseSize + (budget / 100000) * 2) : baseSize;

  const isDimmed = highlightedFunder && !isHighlightedByFunder;

  return (
    <div
      className="relative group"
      style={{
        opacity: isDimmed ? 0.3 : 1,
        transition: "opacity 0.2s ease",
      }}
    >
      {/* Main node circle */}
      <div
        className="flex items-center justify-center rounded-full border-2 font-bold text-xs transition-all duration-200"
        style={{
          width: nodeSize,
          height: nodeSize,
          backgroundColor: isSelected ? venueColor : "var(--card)",
          borderColor: venueColor,
          color: isSelected ? "#fff" : venueColor,
          boxShadow: isSelected
            ? `0 0 20px ${venueColor}80`
            : isHighlightedByFunder
            ? `0 0 15px ${venueColor}60`
            : "none",
          transform: isSelected ? "scale(1.1)" : "scale(1)",
        }}
      >
        <span className="truncate px-1">{pavilion.id}</span>
      </div>

      {/* Red flag indicator */}
      {hasRedFlags && (
        <div
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
          style={{ backgroundColor: "var(--primary)" }}
          title={`${pavilion.red_flags.length} red flag(s)`}
        />
      )}

      {/* Hover tooltip */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="font-semibold" style={{ color: "var(--foreground)" }}>
          {pavilion.country}
        </div>
        <div style={{ color: "var(--muted-foreground)" }}>
          {pavilion.artist_name}
        </div>
        {pavilion.total_budget_amount_usd && (
          <div style={{ color: venueColor }}>
            {formatBudget(pavilion.total_budget_amount_usd)}
          </div>
        )}
      </div>

      {/* Hidden handles for potential edges */}
      <Handle type="target" position={Position.Top} className="invisible" />
      <Handle type="source" position={Position.Bottom} className="invisible" />
    </div>
  );
}

export const PavilionNode = memo(PavilionNodeComponent);
