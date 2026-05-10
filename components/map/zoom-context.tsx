"use client";

import { useStore } from "@xyflow/react";

// Selector must be defined outside component to prevent re-renders
const zoomSelector = (state: { transform: [number, number, number] }) => state.transform[2];

/**
 * Custom hook to get current zoom level from React Flow store.
 * Uses a stable selector to minimize re-renders.
 */
export function useZoom() {
  const zoom = useStore(zoomSelector);
  return {
    zoom,
    inverseZoom: 1 / Math.max(0.1, zoom), // Clamp to avoid division by tiny numbers
  };
}
