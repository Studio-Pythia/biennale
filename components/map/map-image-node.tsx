"use client";

import { memo } from "react";
import type { NodeProps } from "@xyflow/react";
import Image from "next/image";

interface MapImageData {
  src: string;
  width: number;
  height: number;
}

function MapImageNodeComponent({ data }: NodeProps) {
  const { src, width, height } = data as MapImageData;

  return (
    <div
      style={{
        width,
        height,
        pointerEvents: "none",
      }}
    >
      <Image
        src={src}
        alt="Venice Biennale Map"
        width={width}
        height={height}
        priority
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />
    </div>
  );
}

export const MapImageNode = memo(MapImageNodeComponent);
