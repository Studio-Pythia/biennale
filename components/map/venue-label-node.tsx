"use client";

import { memo } from "react";
import { getVenueColor } from "@/lib/data";

interface VenueLabelNodeProps {
  data: {
    label: string;
    venue: string;
    count: number;
  };
}

function VenueLabelNodeComponent({ data }: VenueLabelNodeProps) {
  const { label, venue, count } = data;
  const color = getVenueColor(venue);

  return (
    <div
      className="px-4 py-2 rounded-lg text-sm font-semibold"
      style={{
        backgroundColor: `${color}20`,
        border: `1px solid ${color}40`,
        color: color,
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span>{label}</span>
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${color}30` }}
        >
          {count}
        </span>
      </div>
    </div>
  );
}

export const VenueLabelNode = memo(VenueLabelNodeComponent);
