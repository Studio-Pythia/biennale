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

// Fixed size for all nodes - consistent since most budgets are unknown
const NODE_SIZE = 28;

function PavilionNodeComponent({ data, selected }: PavilionNodeProps) {
  const { pavilion } = data;
  const selectedPavilionId = useMapStore((s) => s.selectedPavilionId);
  const highlightedFunder = useMapStore((s) => s.highlightedFunder);

  const isSelected = selectedPavilionId === pavilion.id || selected;
  const venueColor = getVenueColor(pavilion.venue);
  const hasRedFlags = pavilion.red_flags.length > 0;

  // Check if this pavilion is connected to the highlighted funder
  const isHighlightedByFunder = highlightedFunder
    ? pavilion.private_funders.some(
        (f) => f.name.toLowerCase() === highlightedFunder.toLowerCase()
      )
    : false;

  const budget = pavilion.total_budget_amount_usd;
  const hasBudget = budget !== null && budget > 0;
  const isDimmed = highlightedFunder && !isHighlightedByFunder;

  return (
    <div
      className="relative group cursor-pointer"
      style={{
        opacity: isDimmed ? 0.25 : 1,
        transition: "opacity 0.2s ease, transform 0.15s ease",
        transform: isSelected ? "scale(1.3)" : "scale(1)",
      }}
    >
      {/* Main node circle */}
      <div
        className="flex items-center justify-center rounded-full border-2 font-bold transition-shadow duration-150"
        style={{
          width: NODE_SIZE,
          height: NODE_SIZE,
          backgroundColor: isSelected ? venueColor : "var(--card)",
          borderColor: venueColor,
          color: isSelected ? "#fff" : venueColor,
          fontSize: "9px",
          boxShadow: isSelected
            ? `0 0 12px ${venueColor}`
            : isHighlightedByFunder
            ? `0 0 8px ${venueColor}80`
            : `0 1px 3px rgba(0,0,0,0.3)`,
        }}
      >
        <span className="truncate leading-none">{pavilion.id}</span>
      </div>

      {/* Red flag indicator */}
      {hasRedFlags && (
        <div
          className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
          style={{ backgroundColor: "var(--primary)" }}
          title={`${pavilion.red_flags.length} red flag(s)`}
        />
      )}

      {/* Budget indicator ring for pavilions with known budgets */}
      {hasBudget && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            border: `1.5px solid ${venueColor}`,
            opacity: 0.4,
            transform: "scale(1.4)",
          }}
        />
      )}

      {/* Hover tooltip */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2.5 py-1.5 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        <div className="font-semibold" style={{ color: "var(--foreground)" }}>
          {pavilion.country}
        </div>
        <div style={{ color: "var(--muted-foreground)" }}>
          {pavilion.artist_name}
        </div>
        <div className="mt-0.5" style={{ color: "var(--muted-foreground)", opacity: 0.7 }}>
          {pavilion.venue} {pavilion.grid_ref && `| ${pavilion.grid_ref}`}
        </div>
        {hasBudget && (
          <div className="font-medium" style={{ color: venueColor }}>
            {formatBudget(budget)}
          </div>
        )}
      </div>

      {/* Hidden handles for edges */}
      <Handle type="target" position={Position.Top} className="invisible" />
      <Handle type="source" position={Position.Bottom} className="invisible" />
    </div>
  );
}

export const PavilionNode = memo(PavilionNodeComponent);
