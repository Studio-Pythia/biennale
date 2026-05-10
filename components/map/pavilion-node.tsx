"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { Pavilion } from "@/lib/types";
import { getVenueColor, formatBudget } from "@/lib/data";
import { useMapStore } from "@/lib/use-map-store";
import { useZoom } from "./zoom-context";

interface PavilionNodeProps {
  data: {
    pavilion: Pavilion;
  };
  selected?: boolean;
}

// Base size at zoom level 1
const BASE_SIZE = 20;
const MIN_SIZE = 10;
const MAX_SIZE = 40;

function PavilionNodeComponent({ data, selected }: PavilionNodeProps) {
  const { pavilion } = data;
  const selectedPavilionId = useMapStore((s) => s.selectedPavilionId);
  const highlightedFunder = useMapStore((s) => s.highlightedFunder);
  const { inverseZoom } = useZoom();

  const isSelected = selectedPavilionId === pavilion.id || selected;
  const venueColor = getVenueColor(pavilion.venue);
  const hasRedFlags = pavilion.red_flags.length > 0;

  const isHighlightedByFunder = highlightedFunder
    ? pavilion.private_funders.some(
        (f) => f.name.toLowerCase() === highlightedFunder.toLowerCase()
      )
    : false;

  const budget = pavilion.total_budget_amount_usd;
  const hasBudget = budget !== null && budget > 0;
  const isDimmed = highlightedFunder && !isHighlightedByFunder;

  // Calculate size based on zoom - nodes appear consistent on screen
  const nodeSize = Math.min(MAX_SIZE, Math.max(MIN_SIZE, BASE_SIZE * inverseZoom));
  const fontSize = Math.max(7, 9 * inverseZoom);
  const flagSize = Math.max(4, 6 * inverseZoom);
  const borderWidth = Math.max(1.5, 2 * inverseZoom);

  return (
    <div
      className="relative group cursor-pointer"
      style={{
        opacity: isDimmed ? 0.25 : 1,
        transition: "opacity 0.2s ease",
      }}
    >
      {/* Main node circle */}
      <div
        className="flex items-center justify-center rounded-full font-bold"
        style={{
          width: nodeSize,
          height: nodeSize,
          backgroundColor: isSelected ? venueColor : "var(--card)",
          border: `${borderWidth}px solid ${venueColor}`,
          color: isSelected ? "#fff" : venueColor,
          fontSize: `${fontSize}px`,
          boxShadow: isSelected
            ? `0 0 ${8 * inverseZoom}px ${venueColor}`
            : isHighlightedByFunder
            ? `0 0 ${6 * inverseZoom}px ${venueColor}80`
            : `0 1px 3px rgba(0,0,0,0.3)`,
          transform: isSelected ? "scale(1.15)" : "scale(1)",
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
        }}
      >
        <span className="truncate leading-none">{pavilion.id}</span>
      </div>

      {/* Red flag indicator */}
      {hasRedFlags && (
        <div
          className="absolute rounded-full"
          style={{
            backgroundColor: "var(--primary)",
            width: flagSize,
            height: flagSize,
            top: -flagSize * 0.2,
            right: -flagSize * 0.2,
          }}
          title={`${pavilion.red_flags.length} red flag(s)`}
        />
      )}

      {/* Budget indicator ring */}
      {hasBudget && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            border: `${Math.max(1, 1.5 * inverseZoom)}px solid ${venueColor}`,
            opacity: 0.4,
            transform: "scale(1.35)",
          }}
        />
      )}

      {/* Tooltip - counter-scaled for readability */}
      <div
        className="absolute left-1/2 bottom-full mb-2 px-2.5 py-1.5 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          transform: `translateX(-50%) scale(${inverseZoom})`,
          transformOrigin: "bottom center",
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

      <Handle type="target" position={Position.Top} className="invisible" />
      <Handle type="source" position={Position.Bottom} className="invisible" />
    </div>
  );
}

export const PavilionNode = memo(PavilionNodeComponent);
