"use client";

import { PavilionCard } from "./pavilion-card";
import { usePavilionStore } from "@/lib/use-pavilion-store";
import type { Pavilion } from "@/lib/types";

interface CardsGridProps {
  pavilions: Pavilion[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function CardsGrid({ pavilions, selectedId, onSelect }: CardsGridProps) {
  const resetFilters = usePavilionStore((s) => s.resetFilters);

  if (pavilions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <h2
            className="text-lg font-semibold mb-2"
            style={{ color: "var(--foreground)" }}
          >
            No pavilions match these filters
          </h2>
          <p
            className="text-sm mb-4"
            style={{ color: "var(--muted-foreground)" }}
          >
            Try widening the funder type, transparency or flag filters.
          </p>
          <button
            onClick={resetFilters}
            className="px-3 py-1.5 text-xs rounded-lg transition-colors hover:bg-[var(--muted)]"
            style={{
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
          >
            Clear filters
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="grid gap-4 p-4"
      style={{
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        minHeight: "100%",
      }}
    >
      {pavilions.map((p) => (
        <PavilionCard
          key={p.id}
          pavilion={p}
          selected={selectedId === p.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
