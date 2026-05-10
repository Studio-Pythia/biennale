"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Pavilion } from "@/lib/types";
import { PavilionCard } from "./pavilion-card";
import { PavilionDetail } from "./pavilion-detail";
import { analyzePavilion } from "@/lib/pavilion-analysis";

type SortOption = "country" | "venue" | "redflags" | "artist";
type FilterOption = "all" | "giardini" | "arsenale" | "offsite" | "flagged";

interface CardGridProps {
  pavilions: Pavilion[];
}

export function CardGrid({ pavilions }: CardGridProps) {
  const [selectedPavilion, setSelectedPavilion] = useState<Pavilion | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("country");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAndSorted = useMemo(() => {
    let result = [...pavilions];

    // Filter
    if (filterBy === "giardini") {
      result = result.filter(p => p.venue === "Giardini");
    } else if (filterBy === "arsenale") {
      result = result.filter(p => p.venue === "Arsenale");
    } else if (filterBy === "offsite") {
      result = result.filter(p => p.venue === "Off-site");
    } else if (filterBy === "flagged") {
      result = result.filter(p => analyzePavilion(p).redFlags.length > 0);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.country.toLowerCase().includes(q) ||
        p.artist_name?.toLowerCase().includes(q) ||
        p.curator_name?.toLowerCase().includes(q) ||
        p.show_title?.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "country":
          return a.country.localeCompare(b.country);
        case "venue":
          return a.venue.localeCompare(b.venue) || a.country.localeCompare(b.country);
        case "redflags":
          return analyzePavilion(b).redFlags.length - analyzePavilion(a).redFlags.length;
        case "artist":
          return (a.artist_name || "").localeCompare(b.artist_name || "");
        default:
          return 0;
      }
    });

    return result;
  }, [pavilions, sortBy, filterBy, searchQuery]);

  const flaggedCount = useMemo(() => 
    pavilions.filter(p => analyzePavilion(p).redFlags.length > 0).length,
    [pavilions]
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-background)" }}>
      {/* Fixed Header */}
      <header 
        className="sticky top-0 z-50 header-blur border-b"
        style={{ 
          backgroundColor: "rgba(10, 10, 10, 0.85)",
          borderColor: "var(--color-border)"
        }}
      >
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold" style={{ color: "var(--color-foreground)" }}>
            Venice Biennale 2026
          </h1>
          <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
            {filteredAndSorted.length} of {pavilions.length} pavilions
            {flaggedCount > 0 && (
              <span style={{ color: "var(--color-red-flag)" }}> · {flaggedCount} flagged</span>
            )}
          </p>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <input
            type="text"
            placeholder="Search country, artist, curator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg outline-none"
            style={{
              backgroundColor: "var(--color-muted)",
              color: "var(--color-foreground)",
              border: "1px solid var(--color-border)",
            }}
          />
        </div>

        {/* Filter Pills */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto hide-scrollbar">
          {[
            { key: "all", label: "All" },
            { key: "flagged", label: `Flagged (${flaggedCount})` },
            { key: "giardini", label: "Giardini" },
            { key: "arsenale", label: "Arsenale" },
            { key: "offsite", label: "Off-site" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterBy(key as FilterOption)}
              className="px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors"
              style={{
                backgroundColor: filterBy === key ? "var(--color-foreground)" : "var(--color-muted)",
                color: filterBy === key ? "var(--color-background)" : "var(--color-muted-foreground)",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div 
          className="px-4 py-2 flex items-center gap-2 border-t"
          style={{ borderColor: "var(--color-border)" }}
        >
          <span className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="text-xs px-2 py-1 rounded outline-none"
            style={{
              backgroundColor: "var(--color-muted)",
              color: "var(--color-foreground)",
              border: "1px solid var(--color-border)",
            }}
          >
            <option value="country">Country A-Z</option>
            <option value="venue">Venue</option>
            <option value="redflags">Red Flags</option>
            <option value="artist">Artist A-Z</option>
          </select>
        </div>
      </header>

      {/* Card Grid */}
      <main className="flex-1 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredAndSorted.map((pavilion, index) => (
            <PavilionCard
              key={pavilion.id}
              pavilion={pavilion}
              onClick={() => setSelectedPavilion(pavilion)}
              index={index}
            />
          ))}
        </div>

        {filteredAndSorted.length === 0 && (
          <div className="text-center py-12">
            <p style={{ color: "var(--color-muted-foreground)" }}>No pavilions match your search.</p>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedPavilion && (
          <PavilionDetail
            pavilion={selectedPavilion}
            onClose={() => setSelectedPavilion(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
