"use client";

import { motion } from "framer-motion";
import type { Pavilion } from "@/lib/types";
import { getFlagEmoji } from "@/lib/country-flags";
import { analyzePavilion } from "@/lib/pavilion-analysis";

interface PavilionCardProps {
  pavilion: Pavilion;
  onClick: () => void;
  index: number;
}

export function PavilionCard({ pavilion, onClick, index }: PavilionCardProps) {
  const analysis = analyzePavilion(pavilion);
  const flag = getFlagEmoji(pavilion.id);
  
  const hasRedFlags = analysis.redFlags.length > 0;
  const hasYellowFlags = analysis.yellowFlags.length > 0;
  const hasGreenFlags = analysis.greenFlags.length > 0;
  
  const venueColor = 
    pavilion.venue === "Giardini" ? "var(--color-giardini)" :
    pavilion.venue === "Arsenale" ? "var(--color-arsenale)" :
    "var(--color-offsite)";

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.02 }}
      onClick={onClick}
      className="card-hover w-full text-left rounded-xl overflow-hidden"
      style={{
        backgroundColor: "var(--color-card)",
        border: hasRedFlags ? "1px solid var(--color-red-flag)" : "1px solid var(--color-border)",
      }}
    >
      {/* Flag and Country Header */}
      <div className="p-4 flex items-center gap-3">
        <span className="text-4xl leading-none" role="img" aria-label={pavilion.country}>
          {flag}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base truncate" style={{ color: "var(--color-foreground)" }}>
            {pavilion.country}
          </h3>
          <p className="text-sm truncate" style={{ color: "var(--color-muted-foreground)" }}>
            {pavilion.artist_name || "Artist TBA"}
          </p>
        </div>
        
        {/* Status Indicators */}
        <div className="flex flex-col items-end gap-1">
          {hasRedFlags && (
            <span 
              className="pulse-subtle px-2 py-0.5 text-xs font-medium rounded"
              style={{ backgroundColor: "rgba(220, 38, 38, 0.15)", color: "var(--color-red-flag)" }}
            >
              {analysis.redFlags.length} flag{analysis.redFlags.length > 1 ? "s" : ""}
            </span>
          )}
          <span
            className="px-2 py-0.5 text-xs font-medium rounded"
            style={{ backgroundColor: `${venueColor}20`, color: venueColor }}
          >
            {pavilion.venue}
          </span>
        </div>
      </div>

      {/* Quick Info Row */}
      <div 
        className="px-4 py-2 flex items-center gap-4 text-xs border-t"
        style={{ 
          backgroundColor: "var(--color-muted)", 
          borderColor: "var(--color-border)",
          color: "var(--color-muted-foreground)"
        }}
      >
        <span className="truncate flex-1">
          {pavilion.show_title || "Untitled"}
        </span>
        
        {/* Traffic Light Indicators */}
        <div className="flex items-center gap-1">
          {hasGreenFlags && (
            <span 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: "var(--color-green-flag)" }}
              title={`${analysis.greenFlags.length} green flags`}
            />
          )}
          {hasYellowFlags && (
            <span 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: "var(--color-yellow-flag)" }}
              title={`${analysis.yellowFlags.length} yellow flags`}
            />
          )}
          {hasRedFlags && (
            <span 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: "var(--color-red-flag)" }}
              title={`${analysis.redFlags.length} red flags`}
            />
          )}
        </div>
      </div>
    </motion.button>
  );
}
