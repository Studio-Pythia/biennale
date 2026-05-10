"use client";

import { useState } from "react";
import { usePavilionStore } from "@/lib/use-pavilion-store";
import {
  FUNDER_TYPES,
  FUNDER_TYPE_COLORS,
  FUNDER_TYPE_LABELS,
} from "@/lib/funder-style";
import type {
  BudgetTransparencyFilter,
  ContinentFilter,
  FlagSeverityFilter,
  SelectionMethodFilter,
  SortKey,
  VenueFilter,
} from "@/lib/types";

const venueOptions: { value: VenueFilter; label: string; color: string }[] = [
  { value: "all", label: "All Venues", color: "#6b7280" },
  { value: "Giardini", label: "Giardini", color: "#22c55e" },
  { value: "Arsenale", label: "Arsenale", color: "#f97316" },
  { value: "Off-site", label: "Off-site", color: "#3b82f6" },
];

const selectionOptions: { value: SelectionMethodFilter; label: string }[] = [
  { value: "all", label: "All Methods" },
  { value: "open_call", label: "Open Call" },
  { value: "panel", label: "Panel" },
  { value: "ministerial", label: "Ministerial" },
  { value: "invitation", label: "Invitation" },
];

const transparencyOptions: { value: BudgetTransparencyFilter; label: string }[] =
  [
    { value: "all", label: "Any budget" },
    { value: "disclosed", label: "Disclosed" },
    { value: "undisclosed", label: "Undisclosed" },
  ];

const flagOptions: { value: FlagSeverityFilter; label: string }[] = [
  { value: "all", label: "All flags" },
  { value: "red", label: "Red-flagged" },
  { value: "clean", label: "Clean only" },
];

const continentOptions: { value: ContinentFilter; label: string }[] = [
  { value: "all", label: "All continents" },
  { value: "Africa", label: "Africa" },
  { value: "Asia", label: "Asia" },
  { value: "Europe", label: "Europe" },
  { value: "North America", label: "North America" },
  { value: "South America", label: "South America" },
  { value: "Oceania", label: "Oceania" },
];

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "random", label: "Shuffled" },
  { value: "country", label: "Country A–Z" },
  { value: "budget_desc", label: "Budget high → low" },
  { value: "red_flags_desc", label: "Most red flags" },
  { value: "private_funders_desc", label: "Most private funders" },
];

interface FilterBarProps {
  total: number;
  shown: number;
}

export function FilterBar({ total, shown }: FilterBarProps) {
  const filters = usePavilionStore((s) => s.filters);
  const sortKey = usePavilionStore((s) => s.sortKey);
  const setSearch = usePavilionStore((s) => s.setSearch);
  const setVenueFilter = usePavilionStore((s) => s.setVenueFilter);
  const setContinentFilter = usePavilionStore((s) => s.setContinentFilter);
  const setSelectionMethodFilter = usePavilionStore(
    (s) => s.setSelectionMethodFilter
  );
  const setBudgetTransparency = usePavilionStore((s) => s.setBudgetTransparency);
  const setFlagSeverity = usePavilionStore((s) => s.setFlagSeverity);
  const toggleFunderType = usePavilionStore((s) => s.toggleFunderType);
  const setSortKey = usePavilionStore((s) => s.setSortKey);
  const reshuffle = usePavilionStore((s) => s.reshuffle);
  const resetFilters = usePavilionStore((s) => s.resetFilters);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const activeFilterCount =
    (filters.venue !== "all" ? 1 : 0) +
    (filters.continent !== "all" ? 1 : 0) +
    (filters.selectionMethod !== "all" ? 1 : 0) +
    (filters.budgetTransparency !== "all" ? 1 : 0) +
    (filters.flagSeverity !== "all" ? 1 : 0) +
    (filters.funderTypes.length > 0 ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0 || filters.search !== "";

  return (
    <div
      className="flex flex-col flex-shrink-0"
      style={{
        backgroundColor: "var(--card)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Compact row — always visible */}
      <div className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-3">
        <div className="relative flex-1 min-w-0 md:flex-none md:w-64">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--muted-foreground)"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search…"
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-2 text-sm rounded-lg w-full"
            style={{
              backgroundColor: "var(--muted)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            }}
          />
        </div>

        {/* Mobile: filter toggle */}
        <button
          onClick={() => setMobileFiltersOpen((v) => !v)}
          className="md:hidden flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg flex-shrink-0"
          style={{
            backgroundColor: mobileFiltersOpen ? "var(--muted)" : "transparent",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
          }}
          aria-expanded={mobileFiltersOpen}
          aria-controls="filter-drawer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M6 12h12M10 18h4" />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span
              className="ml-0.5 px-1.5 rounded-full text-[10px] font-medium"
              style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Right cluster — sort + shuffle, count visible md+ */}
        <div className="ml-auto flex items-center gap-2">
          <span
            className="hidden md:inline text-xs"
            style={{ color: "var(--muted-foreground)" }}
          >
            {shown === total ? `${total} pavilions` : `Showing ${shown} of ${total}`}
          </span>

          <Select
            value={sortKey}
            onChange={(v) => setSortKey(v as SortKey)}
            options={sortOptions}
            prefix={<span className="hidden md:inline">Sort:</span>}
            srLabel="Sort"
          />

          <button
            onClick={reshuffle}
            className="px-2.5 py-1.5 text-xs rounded-lg flex items-center gap-1 transition-colors hover:bg-[var(--muted)] flex-shrink-0"
            style={{
              color: sortKey === "random" ? "var(--foreground)" : "var(--muted-foreground)",
              border: "1px solid var(--border)",
            }}
            aria-label="Shuffle pavilion order"
            title="Shuffle pavilion order"
          >
            <span aria-hidden="true">🎲</span>
            <span className="hidden md:inline">Shuffle</span>
          </button>
        </div>
      </div>

      {/* Filter controls row — always visible md+, collapsible on mobile */}
      <div
        id="filter-drawer"
        className={`${mobileFiltersOpen ? "flex" : "hidden"} md:flex items-center gap-2 px-3 pb-3 md:px-4 md:pb-3 md:pt-0 flex-wrap`}
      >
        <div className="flex gap-1 flex-wrap">
          {venueOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setVenueFilter(option.value)}
              className="px-2.5 py-1 text-xs rounded-lg transition-colors"
              style={{
                backgroundColor:
                  filters.venue === option.value ? `${option.color}20` : "transparent",
                border: `1px solid ${filters.venue === option.value ? option.color : "var(--border)"}`,
                color:
                  filters.venue === option.value
                    ? option.color
                    : "var(--muted-foreground)",
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

        <Select
          value={filters.continent}
          onChange={(v) => setContinentFilter(v as ContinentFilter)}
          options={continentOptions}
          srLabel="Continent"
        />
        <Select
          value={filters.selectionMethod}
          onChange={(v) => setSelectionMethodFilter(v as SelectionMethodFilter)}
          options={selectionOptions}
          srLabel="Selection method"
        />
        <Select
          value={filters.budgetTransparency}
          onChange={(v) => setBudgetTransparency(v as BudgetTransparencyFilter)}
          options={transparencyOptions}
          srLabel="Budget transparency"
        />
        <Select
          value={filters.flagSeverity}
          onChange={(v) => setFlagSeverity(v as FlagSeverityFilter)}
          options={flagOptions}
          srLabel="Flag severity"
        />

        <div className="flex items-center gap-1 flex-wrap">
          <span
            className="text-[10px] uppercase tracking-wider mr-1"
            style={{ color: "var(--muted-foreground)" }}
          >
            Funder
          </span>
          {FUNDER_TYPES.map((t) => {
            const active = filters.funderTypes.includes(t);
            const color = FUNDER_TYPE_COLORS[t];
            return (
              <button
                key={t}
                onClick={() => toggleFunderType(t)}
                className="px-2 py-1 text-xs rounded-full transition-colors flex items-center gap-1.5"
                style={{
                  backgroundColor: active ? `${color}25` : "transparent",
                  border: `1px solid ${active ? color : "var(--border)"}`,
                  color: active ? color : "var(--muted-foreground)",
                }}
                aria-pressed={active}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {FUNDER_TYPE_LABELS[t]}
              </button>
            );
          })}
        </div>

        <div className="md:ml-auto flex items-center gap-2">
          <span
            className="md:hidden text-xs"
            style={{ color: "var(--muted-foreground)" }}
          >
            {shown}/{total}
          </span>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-2.5 py-1 text-xs rounded-lg hover:bg-[var(--muted)] transition-colors"
              style={{
                color: "var(--muted-foreground)",
                border: "1px solid var(--border)",
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Select<T extends string>({
  value,
  onChange,
  options,
  prefix,
  srLabel,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  prefix?: React.ReactNode;
  srLabel?: string;
}) {
  return (
    <label
      className="flex items-center gap-1.5 text-xs"
      style={{ color: "var(--muted-foreground)" }}
    >
      {srLabel && <span className="sr-only">{srLabel}</span>}
      {prefix}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="px-2 py-1.5 text-xs rounded-lg"
        style={{
          backgroundColor: "var(--muted)",
          border: "1px solid var(--border)",
          color: "var(--foreground)",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
