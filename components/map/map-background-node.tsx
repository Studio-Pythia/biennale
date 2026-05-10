"use client";

import { memo } from "react";
import Image from "next/image";

interface MapBackgroundNodeProps {
  data: {
    imageUrl: string;
    width: number;
    height: number;
    label?: string;
  };
}

function MapBackgroundNodeComponent({ data }: MapBackgroundNodeProps) {
  const { imageUrl, width, height, label } = data;

  return (
    <div
      className="relative pointer-events-none"
      style={{
        width,
        height,
      }}
    >
      <Image
        src={imageUrl}
        alt={label || "Venice Biennale Map"}
        fill
        className="object-contain opacity-30"
        priority
      />
      {label && (
        <div
          className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-semibold"
          style={{
            backgroundColor: "var(--card)",
            color: "var(--muted-foreground)",
            opacity: 0.8,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

export const MapBackgroundNode = memo(MapBackgroundNodeComponent);
