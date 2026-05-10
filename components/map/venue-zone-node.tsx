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
  const { venue, width, height, pavilions } = data as VenueZoneData;
  
  const color = getVenueColor(venue);
  const safeWidth = width || 200;
  const safeHeight = height || 140;
  
  // Get flags to display - show all in a grid
  const flagsToShow = (pavilions || []).slice(0, 28); // 7 columns x 4 rows max
  const remainingCount = Math.max(0, (pavilions || []).length - 28);
  
  return (
    <>
      <Handle type="target" position={Position.Top} style={{ visibility: "hidden" }} />
      
      <div
        className="relative cursor-pointer transition-all duration-200 hover:scale-[1.02] group"
        style={{
          width: safeWidth,
          height: safeHeight,
        }}
      >
        {/* Semi-transparent background matching the map's orange outline style */}
        <div
          className="absolute inset-0 rounded-lg transition-all duration-200"
          style={{
            border: `3px solid ${color}`,
            backgroundColor: `${color}20`,
            boxShadow: `0 0 30px ${color}50`,
          }}
        />
        
        {/* Hover overlay */}
        <div
          className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{
            backgroundColor: `${color}30`,
          }}
        />
        
        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
          {/* Venue name - large and bold */}
          <span
            className="text-xl font-black uppercase tracking-wide mb-2 drop-shadow-lg"
            style={{ 
              color,
              textShadow: "0 2px 4px rgba(0,0,0,0.8)",
            }}
          >
            {venue}
          </span>
          
          {/* Flags grid - larger and more visible */}
          <div 
            className="flex flex-wrap justify-center items-center gap-1 px-2"
            style={{ maxWidth: safeWidth - 20 }}
          >
            {flagsToShow.map((p) => (
              <span
                key={p.id}
                className="text-lg leading-none drop-shadow"
                title={p.country}
                style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))" }}
              >
                {getFlagEmoji(p.id)}
              </span>
            ))}
            {remainingCount > 0 && (
              <span
                className="text-sm font-bold px-1.5 py-0.5 rounded"
                style={{ 
                  backgroundColor: color,
                  color: "#000",
                }}
              >
                +{remainingCount}
              </span>
            )}
          </div>
          
          {/* Click prompt - always visible, more prominent on hover */}
          <span
            className="text-sm mt-2 font-semibold transition-all duration-200 group-hover:scale-110"
            style={{ 
              color,
              textShadow: "0 1px 3px rgba(0,0,0,0.8)",
            }}
          >
            Click to explore
          </span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ visibility: "hidden" }} />
    </>
  );
}

export const VenueZoneNode = memo(VenueZoneNodeComponent);
