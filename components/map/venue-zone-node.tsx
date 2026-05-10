"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { getVenueColor } from "@/lib/data";
import { getFlagEmoji } from "@/lib/country-flags";
import type { Pavilion } from "@/lib/types";

interface VenueZoneData {
  venue: "Arsenale" | "Giardini";
  width: number;
  height: number;
  count: number;
  pavilions: Pavilion[];
}

function VenueZoneNodeComponent({ data }: NodeProps) {
  const { venue, width, height, count, pavilions } = data as VenueZoneData;
  
  const color = getVenueColor(venue);
  const safeWidth = width || 180;
  const safeHeight = height || 120;
  
  // Get first 12 flags to display (more would be too crowded)
  const flagsToShow = (pavilions || []).slice(0, 12);
  const remainingCount = Math.max(0, (pavilions || []).length - 12);
  
  return (
    <>
      <Handle type="target" position={Position.Top} style={{ visibility: "hidden" }} />
      
      <div
        className="relative cursor-pointer transition-all duration-300 hover:scale-105 group"
        style={{
          width: safeWidth,
          height: safeHeight,
        }}
      >
        {/* Solid background with border */}
        <div
          className="absolute inset-0 rounded-xl border-3 transition-all duration-300 group-hover:shadow-lg"
          style={{
            borderColor: color,
            borderWidth: 3,
            backgroundColor: `rgba(0, 0, 0, 0.85)`,
            boxShadow: `0 0 20px ${color}40`,
          }}
        />
        
        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
          {/* Venue name */}
          <span
            className="text-base font-bold uppercase tracking-wider mb-1"
            style={{ color }}
          >
            {venue}
          </span>
          
          {/* Flags grid */}
          <div className="flex flex-wrap justify-center gap-0.5 max-w-full px-1">
            {flagsToShow.map((p) => (
              <span
                key={p.id}
                className="text-sm leading-none"
                title={p.country}
              >
                {getFlagEmoji(p.id)}
              </span>
            ))}
            {remainingCount > 0 && (
              <span
                className="text-xs font-medium ml-1"
                style={{ color: "var(--muted-foreground)" }}
              >
                +{remainingCount}
              </span>
            )}
          </div>
          
          {/* Pavilion count */}
          <span
            className="text-xs mt-1 opacity-80"
            style={{ color }}
          >
            {count} pavilions
          </span>
          
          {/* Click prompt */}
          <span
            className="text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity font-medium"
            style={{ color }}
          >
            Click to explore →
          </span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ visibility: "hidden" }} />
    </>
  );
}

export const VenueZoneNode = memo(VenueZoneNodeComponent);
