"use client";

import { memo } from "react";
import { getVenueColor } from "@/lib/data";

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

  // Position numbers (Giardini 1-29)
  if (isPositionNumber) {
    return (
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold opacity-40"
        style={{
          backgroundColor: `${color}30`,
          color: color,
        }}
      >
        {label}
      </div>
    );
  }

  // Main venue area labels (GIARDINI, ARSENALE, OFF-SITE)
  if (isMainLabel) {
    return (
      <div
        className="px-6 py-3 rounded-xl text-xl font-bold tracking-wider uppercase opacity-80"
        style={{
          backgroundColor: `${color}15`,
          border: `2px solid ${color}30`,
          color: color,
        }}
      >
        {label}
      </div>
    );
  }

  // Zone labels (Arsenale zones, counts)
  return (
    <div
      className="px-3 py-1.5 rounded-lg text-xs font-semibold"
      style={{
        backgroundColor: `${color}20`,
        border: `1px solid ${color}40`,
        color: color,
      }}
    >
      <div className="flex items-center gap-2">
        <span>{label}</span>
        {count !== undefined && count > 0 && (
          <span
            className="text-xs px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: `${color}30` }}
          >
            {count}
          </span>
        )}
      </div>
    </div>
  );
}

export const VenueLabelNode = memo(VenueLabelNodeComponent);
