"use client";

import { useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { VeniceMap } from "@/components/map/venice-map";
import { FilterBar } from "@/components/map/filter-bar";
import { DetailPanel } from "@/components/panels/detail-panel";
import { useMapStore, useFilteredPavilions } from "@/lib/use-map-store";
import type { Pavilion } from "@/lib/types";

interface MapContainerProps {
  pavilions: Pavilion[];
  initialSelectedId: string | null;
  initialPavilion: Pavilion | null;
}

function MapContainerInner({
  pavilions,
  initialSelectedId,
  initialPavilion,
}: MapContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedPavilionId, selectPavilion } = useMapStore();
  const filteredPavilions = useFilteredPavilions();

  // Calculate stats
  const stats = useMemo(() => {
    const redFlagCount = pavilions.filter((p) => p.red_flags.length > 0).length;
    const giardiniCount = pavilions.filter((p) => p.venue === "Giardini").length;
    const arsenaleCount = pavilions.filter((p) => p.venue === "Arsenale").length;
    const offSiteCount = pavilions.filter((p) => p.venue === "Off-site").length;
    return { redFlagCount, giardiniCount, arsenaleCount, offSiteCount };
  }, [pavilions]);

  // Set initial selection from URL
  useEffect(() => {
    if (initialSelectedId) {
      selectPavilion(initialSelectedId);
    }
  }, [initialSelectedId, selectPavilion]);

  // Update URL when selection changes
  useEffect(() => {
    const currentPavilion = searchParams.get("pavilion");
    if (selectedPavilionId !== currentPavilion) {
      if (selectedPavilionId) {
        router.push(`?pavilion=${selectedPavilionId}`, { scroll: false });
      } else if (currentPavilion) {
        router.push("/", { scroll: false });
      }
    }
  }, [selectedPavilionId, searchParams, router]);

  // Get the selected pavilion data
  const selectedPavilion = selectedPavilionId
    ? pavilions.find((p) => p.id === selectedPavilionId) || null
    : initialPavilion;

  return (
    <>
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 py-3"
        style={{
          backgroundColor: "var(--card)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div>
          <h1
            className="text-lg font-bold tracking-tight"
            style={{ color: "var(--foreground)" }}
          >
            Venice Biennale 2026
          </h1>
          <p className="text-xs" style={{ color: "var(--primary)" }}>
            Every Pavilion is a State Op
          </p>
        </div>
        <div className="flex items-center gap-6">
          {/* Stats */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: "var(--accent-green)" }}
              />
              <span style={{ color: "var(--muted-foreground)" }}>
                Giardini ({stats.giardiniCount})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: "var(--accent-orange)" }}
              />
              <span style={{ color: "var(--muted-foreground)" }}>
                Arsenale ({stats.arsenaleCount})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: "var(--accent-blue)" }}
              />
              <span style={{ color: "var(--muted-foreground)" }}>
                Off-site ({stats.offSiteCount})
              </span>
            </div>
            <div
              className="flex items-center gap-1.5 pl-3"
              style={{ borderLeft: "1px solid var(--border)" }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: "var(--primary)" }}
              />
              <span style={{ color: "var(--primary)" }}>
                {stats.redFlagCount} Red Flags
              </span>
            </div>
          </div>
          {/* Filter count badge */}
          {filteredPavilions.length !== pavilions.length && (
            <div
              className="px-2 py-1 rounded text-xs font-medium"
              style={{
                backgroundColor: "var(--muted)",
                color: "var(--foreground)",
              }}
            >
              Showing {filteredPavilions.length} of {pavilions.length}
            </div>
          )}
        </div>
      </header>

      {/* Filter Bar */}
      <FilterBar />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          <VeniceMap pavilions={pavilions} />
        </div>

        {/* Detail Panel */}
        <div className="w-96 flex-shrink-0 overflow-hidden">
          <DetailPanel pavilion={selectedPavilion} />
        </div>
      </div>
    </>
  );
}

export function MapContainer(props: MapContainerProps) {
  return (
    <Suspense
      fallback={
        <div
          className="flex items-center justify-center h-screen"
          style={{ backgroundColor: "var(--background)" }}
        >
          <div style={{ color: "var(--muted-foreground)" }}>Loading map...</div>
        </div>
      }
    >
      <MapContainerInner {...props} />
    </Suspense>
  );
}
