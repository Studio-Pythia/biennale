"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMapStore } from "@/lib/use-map-store";
import { getVenueColor } from "@/lib/data";
import { getFlagEmoji } from "@/lib/country-flags";
import type { Pavilion } from "@/lib/types";

type ListTab = "nations" | "artists" | "curators";

interface ListViewProps {
  pavilions: Pavilion[];
  isOpen: boolean;
  onClose: () => void;
}

// Parse artist_born to extract origin location
function parseArtistOrigin(artistBorn: string): string {
  if (!artistBorn) return "Unknown";
  // Format is usually "YEAR, Location" or "YEAR, City, Country"
  const parts = artistBorn.split(",").slice(1).map(s => s.trim());
  if (parts.length === 0) return "Unknown";
  // Return the last part which is usually the country/region
  return parts.join(", ");
}

// Parse curator_affiliation to get their institution
function parseCuratorInstitution(affiliation: string): string {
  if (!affiliation) return "Independent";
  return affiliation;
}

export function ListView({ pavilions, isOpen, onClose }: ListViewProps) {
  const [activeTab, setActiveTab] = useState<ListTab>("nations");
  const [searchQuery, setSearchQuery] = useState("");
  const { selectPavilion } = useMapStore();

  // Build lists from pavilions data
  const lists = useMemo(() => {
    // Nations list - one entry per pavilion
    const nations = pavilions
      .map((p) => ({
        id: p.id,
        name: p.country,
        flag: getFlagEmoji(p.id),
        venue: p.venue,
        artist: p.artist_name || "TBA",
        curator: p.curator_name || "TBA",
        showTitle: p.show_title || "Untitled",
        hasRedFlags: p.red_flags?.length > 0,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // Artists list - can have multiple artists per pavilion (split by &, and, /)
    const artistsMap = new Map<string, { name: string; origin: string; pavilions: { id: string; country: string; flag: string; venue: string }[] }>();
    
    pavilions.forEach((p) => {
      if (!p.artist_name) return; // Skip if no artist
      
      // Split artist names (some pavilions have multiple artists)
      const artistNames = p.artist_name
        .split(/\s*(?:&|and|,|\+)\s*/i)
        .map(n => n.trim())
        .filter(n => n.length > 0);
      
      artistNames.forEach((artistName) => {
        const key = artistName.toLowerCase();
        if (!artistsMap.has(key)) {
          artistsMap.set(key, {
            name: artistName,
            origin: parseArtistOrigin(p.artist_born),
            pavilions: [],
          });
        }
        artistsMap.get(key)!.pavilions.push({
          id: p.id,
          country: p.country,
          flag: getFlagEmoji(p.id),
          venue: p.venue,
        });
      });
    });
    
    const artists = Array.from(artistsMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    );

    // Curators list
    const curatorsMap = new Map<string, { name: string; affiliation: string; pavilions: { id: string; country: string; flag: string; venue: string }[] }>();
    
    pavilions.forEach((p) => {
      if (!p.curator_name) return; // Skip if no curator
      
      // Split curator names - be careful not to split on commas in institution names
      const curatorNames = p.curator_name
        .split(/\s*(?:&|and)\s*/i)
        .map(n => n.trim())
        .filter(n => n.length > 0);
      
      curatorNames.forEach((curatorName) => {
        const key = curatorName.toLowerCase();
        if (!curatorsMap.has(key)) {
          curatorsMap.set(key, {
            name: curatorName,
            affiliation: parseCuratorInstitution(p.curator_affiliation),
            pavilions: [],
          });
        }
        curatorsMap.get(key)!.pavilions.push({
          id: p.id,
          country: p.country,
          flag: getFlagEmoji(p.id),
          venue: p.venue,
        });
      });
    });
    
    const curators = Array.from(curatorsMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    );

    return { nations, artists, curators };
  }, [pavilions]);

  // Filter based on search
  const filteredLists = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return lists;

    return {
      nations: lists.nations.filter(
        (n) =>
          n.name.toLowerCase().includes(query) ||
          n.artist.toLowerCase().includes(query) ||
          n.curator.toLowerCase().includes(query)
      ),
      artists: lists.artists.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.origin.toLowerCase().includes(query)
      ),
      curators: lists.curators.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.affiliation.toLowerCase().includes(query)
      ),
    };
  }, [lists, searchQuery]);

  const handleSelectPavilion = (id: string) => {
    selectPavilion(id);
    onClose();
  };

  const tabs: { id: ListTab; label: string; count: number }[] = [
    { id: "nations", label: "Nations", count: filteredLists.nations.length },
    { id: "artists", label: "Artists", count: filteredLists.artists.length },
    { id: "curators", label: "Curators", count: filteredLists.curators.length },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-[480px] z-50 flex flex-col"
            style={{
              backgroundColor: "var(--card)",
              borderRight: "1px solid var(--border)",
            }}
          >
            {/* Header */}
            <div
              className="p-4 flex items-center justify-between"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <h2 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>
                Directory
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded hover:bg-[var(--muted)] transition-colors"
                style={{ color: "var(--muted-foreground)" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search */}
            <div className="p-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <input
                type="text"
                placeholder="Search names, countries, institutions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: "var(--muted)",
                  color: "var(--foreground)",
                  border: "1px solid var(--border)",
                }}
              />
            </div>

            {/* Tabs */}
            <div
              className="flex"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex-1 px-4 py-3 text-sm font-medium transition-colors relative"
                  style={{
                    color: activeTab === tab.id ? "var(--foreground)" : "var(--muted-foreground)",
                    backgroundColor: activeTab === tab.id ? "var(--muted)" : "transparent",
                  }}
                >
                  {tab.label}
                  <span
                    className="ml-1.5 text-xs px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: activeTab === tab.id ? "var(--primary)" : "var(--border)",
                      color: activeTab === tab.id ? "var(--primary-foreground)" : "var(--muted-foreground)",
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === "nations" && (
                <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                  {filteredLists.nations.map((nation) => (
                    <button
                      key={nation.id}
                      onClick={() => handleSelectPavilion(nation.id)}
                      className="w-full p-4 text-left hover:bg-[var(--muted)] transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{nation.flag}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium" style={{ color: "var(--foreground)" }}>
                              {nation.name}
                            </span>
                            <span
                              className="text-xs px-1.5 py-0.5 rounded"
                              style={{
                                backgroundColor: getVenueColor(nation.venue),
                                color: "#000",
                              }}
                            >
                              {nation.venue}
                            </span>
                            {nation.hasRedFlags && (
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: "var(--primary)" }}
                              />
                            )}
                          </div>
                          <p className="text-sm truncate" style={{ color: "var(--muted-foreground)" }}>
                            {nation.showTitle}
                          </p>
                          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                            {nation.artist} | Curated by {nation.curator}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {activeTab === "artists" && (
                <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                  {filteredLists.artists.map((artist, index) => (
                    <div key={index} className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-medium" style={{ color: "var(--foreground)" }}>
                            {artist.name}
                          </span>
                          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                            From: {artist.origin}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {artist.pavilions.map((pav) => (
                          <button
                            key={pav.id}
                            onClick={() => handleSelectPavilion(pav.id)}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs hover:opacity-80 transition-opacity"
                            style={{
                              backgroundColor: getVenueColor(pav.venue),
                              color: "#000",
                            }}
                          >
                            <span>{pav.flag}</span>
                            <span>{pav.country}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "curators" && (
                <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                  {filteredLists.curators.map((curator, index) => (
                    <div key={index} className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-medium" style={{ color: "var(--foreground)" }}>
                            {curator.name}
                          </span>
                          <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                            {curator.affiliation}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {curator.pavilions.map((pav) => (
                          <button
                            key={pav.id}
                            onClick={() => handleSelectPavilion(pav.id)}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs hover:opacity-80 transition-opacity"
                            style={{
                              backgroundColor: getVenueColor(pav.venue),
                              color: "#000",
                            }}
                          >
                            <span>{pav.flag}</span>
                            <span>{pav.country}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
