"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { Pavilion } from "@/lib/types";
import { getVenueColor, formatBudget } from "@/lib/data";
import { useMapStore } from "@/lib/use-map-store";
import { useZoom } from "./zoom-context";
import { getFlagEmoji } from "@/lib/country-flags";

interface PavilionNodeProps {
  data: {
    pavilion: Pavilion;
  };
  selected?: boolean;
}

// Much larger base size for better visibility when zoomed out
const BASE_SIZE = 48;
const MIN_SIZE = 24;
const MAX_SIZE = 80;

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

  // Get flag emoji for the country
  const flagEmoji = getFlagEmoji(pavilion.id);

  // Calculate size based on zoom - nodes appear consistent on screen
  // inverseZoom is 1/zoom, so at zoom=0.5, inverseZoom=2, making nodes appear 2x bigger
  const nodeSize = Math.min(MAX_SIZE, Math.max(MIN_SIZE, BASE_SIZE * inverseZoom));
  const flagFontSize = Math.max(14, 24 * inverseZoom);
  const codeFontSize = Math.max(6, 8 * inverseZoom);
  const flagIndicatorSize = Math.max(8, 12 * inverseZoom);
  const borderWidth = Math.max(2, 3 * inverseZoom);

  return (
    <div
      className="relative group cursor-pointer"
      style={{
        opacity: isDimmed ? 0.25 : 1,
        transition: "opacity 0.2s ease",
      }}
    >
      {/* Main node circle with flag emoji */}
      <div
        className="flex flex-col items-center justify-center rounded-full"
        style={{
          width: nodeSize,
          height: nodeSize,
          backgroundColor: isSelected ? venueColor : "var(--card)",
          border: `${borderWidth}px solid ${venueColor}`,
          boxShadow: isSelected
            ? `0 0 ${12 * inverseZoom}px ${venueColor}`
            : isHighlightedByFunder
            ? `0 0 ${8 * inverseZoom}px ${venueColor}80`
            : `0 2px 6px rgba(0,0,0,0.4)`,
          transform: isSelected ? "scale(1.15)" : "scale(1)",
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
        }}
      >
        {/* Flag emoji */}
        <span
          style={{
            fontSize: `${flagFontSize}px`,
            lineHeight: 1,
          }}
          role="img"
          aria-label={pavilion.country}
        >
          {flagEmoji}
        </span>
        {/* Country code below flag when large enough */}
        {nodeSize > 35 && (
          <span
            className="font-bold uppercase tracking-tight"
            style={{
              fontSize: `${codeFontSize}px`,
              lineHeight: 1,
              marginTop: 1,
              color: isSelected ? "#fff" : venueColor,
            }}
          >
            {pavilion.id}
          </span>
        )}
      </div>

      {/* Red flag indicator */}
      {hasRedFlags && (
        <div
          className="absolute rounded-full flex items-center justify-center"
          style={{
            backgroundColor: "var(--primary)",
            width: flagIndicatorSize,
            height: flagIndicatorSize,
            top: -flagIndicatorSize * 0.15,
            right: -flagIndicatorSize * 0.15,
            border: `${Math.max(1, 1.5 * inverseZoom)}px solid var(--card)`,
          }}
          title={`${pavilion.red_flags.length} red flag(s)`}
        >
          <span style={{ fontSize: `${flagIndicatorSize * 0.6}px`, color: "#fff" }}>!</span>
        </div>
      )}

      {/* Budget indicator ring */}
      {hasBudget && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            border: `${Math.max(1.5, 2.5 * inverseZoom)}px solid ${venueColor}`,
            opacity: 0.4,
            transform: "scale(1.3)",
          }}
        />
      )}

      {/* Tooltip - counter-scaled for readability */}
      <div
        className="absolute left-1/2 bottom-full mb-2 px-3 py-2 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          transform: `translateX(-50%) scale(${inverseZoom})`,
          transformOrigin: "bottom center",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{flagEmoji}</span>
          <span className="font-semibold" style={{ color: "var(--foreground)" }}>
            {pavilion.country}
          </span>
        </div>
        <div style={{ color: "var(--muted-foreground)" }}>
          {pavilion.artist_name}
        </div>
        <div className="mt-1 text-[10px]" style={{ color: "var(--muted-foreground)", opacity: 0.7 }}>
          {pavilion.venue} {pavilion.grid_ref && `| ${pavilion.grid_ref}`}
        </div>
        {hasBudget && (
          <div className="font-medium mt-1" style={{ color: venueColor }}>
            {formatBudget(budget)}
          </div>
        )}
        {hasRedFlags && (
          <div className="mt-1 text-[10px]" style={{ color: "var(--primary)" }}>
            {pavilion.red_flags.length} red flag{pavilion.red_flags.length > 1 ? "s" : ""}
          </div>
        )}
      </div>

      <Handle type="target" position={Position.Top} className="invisible" />
      <Handle type="source" position={Position.Bottom} className="invisible" />
    </div>
  );
}

export const PavilionNode = memo(PavilionNodeComponent);
