"use client";

import { memo } from "react";
import { getVenueColor } from "@/lib/data";
import { useZoom } from "./zoom-context";

interface VenueLabelNodeProps {
  data: {
    label: string;
    venue: string;
    count?: number;
    isPositionNumber?: boolean;
    isMainLabel?: boolean;
  };
}

function VenueLabelNodeComponent({ data }: VenueLabelNodeProps) {
  const { label, venue, count, isPositionNumber, isMainLabel } = data;
  const color = getVenueColor(venue);
  const { inverseZoom } = useZoom();

  // Position numbers (Giardini 1-29)
  if (isPositionNumber) {
    const size = 20 * inverseZoom;
    return (
      <div
        className="rounded-full flex items-center justify-center font-bold opacity-40"
        style={{
          width: size,
          height: size,
          fontSize: `${10 * inverseZoom}px`,
          backgroundColor: `${color}30`,
          color: color,
        }}
      >
        {label}
      </div>
    );
  }

  // Main venue area labels
  if (isMainLabel) {
    return (
      <div
        className="rounded-xl font-bold tracking-wider uppercase opacity-80"
        style={{
          padding: `${10 * inverseZoom}px ${20 * inverseZoom}px`,
          fontSize: `${18 * inverseZoom}px`,
          backgroundColor: `${color}15`,
          border: `${2 * inverseZoom}px solid ${color}30`,
          color: color,
        }}
      >
        {label}
      </div>
    );
  }

  // Zone labels
  return (
    <div
      className="rounded-lg font-semibold"
      style={{
        padding: `${5 * inverseZoom}px ${10 * inverseZoom}px`,
        fontSize: `${11 * inverseZoom}px`,
        backgroundColor: `${color}20`,
        border: `${1 * inverseZoom}px solid ${color}40`,
        color: color,
      }}
    >
      <div className="flex items-center" style={{ gap: `${6 * inverseZoom}px` }}>
        <span>{label}</span>
        {count !== undefined && count > 0 && (
          <span
            className="rounded-full"
            style={{
              backgroundColor: `${color}30`,
              padding: `${2 * inverseZoom}px ${5 * inverseZoom}px`,
              fontSize: `${9 * inverseZoom}px`,
            }}
          >
            {count}
          </span>
        )}
      </div>
    </div>
  );
}

export const VenueLabelNode = memo(VenueLabelNodeComponent);
