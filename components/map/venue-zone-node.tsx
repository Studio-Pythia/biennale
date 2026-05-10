"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { getVenueColor } from "@/lib/data";
import { useZoom } from "./zoom-context";

interface VenueZoneData {
  venue: "Arsenale" | "Giardini";
  width: number;
  height: number;
  count: number;
}

function VenueZoneNodeComponent({ data }: NodeProps) {
  const { venue, width, height, count } = data as VenueZoneData;
  const zoom = useZoom();
  
  // Scale inversely with zoom to maintain visual size
  // Default to 1 if zoom is undefined or NaN
  const safeZoom = Number.isFinite(zoom) && zoom > 0 ? zoom : 1;
  const scale = 1 / Math.max(safeZoom, 0.3);
  const scaledWidth = (width || 120) * scale;
  const scaledHeight = (height || 100) * scale;
  
  const color = getVenueColor(venue);
  
  return (
    <>
      <Handle type="target" position={Position.Top} style={{ visibility: "hidden" }} />
      
      <div
        className="relative cursor-pointer transition-all duration-200 hover:scale-105 group"
        style={{
          width: scaledWidth,
          height: scaledHeight,
        }}
      >
        {/* Zone outline */}
        <div
          className="absolute inset-0 rounded-lg border-2 border-dashed opacity-60 group-hover:opacity-100 transition-opacity"
          style={{
            borderColor: color,
            backgroundColor: `${color}15`,
          }}
        />
        
        {/* Zone label */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          <span
            className="text-lg font-bold uppercase tracking-wider"
            style={{ color }}
          >
            {venue}
          </span>
          <span
            className="text-sm mt-1 opacity-80"
            style={{ color }}
          >
            {count} pavilions
          </span>
          <span
            className="text-xs mt-2 opacity-60 group-hover:opacity-100 transition-opacity"
            style={{ color }}
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
