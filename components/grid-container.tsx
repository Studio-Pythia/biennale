"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CardsGrid } from "@/components/cards/cards-grid";
import { FilterBar } from "@/components/cards/filter-bar";
import { DetailPanel } from "@/components/panels/detail-panel";
import { usePavilionStore, useFilteredPavilions } from "@/lib/use-pavilion-store";
import type { Pavilion } from "@/lib/types";

interface GridContainerProps {
  pavilions: Pavilion[];
  initialSelectedId: string | null;
  initialPavilion: Pavilion | null;
}

function GridContainerInner({
  pavilions,
  initialSelectedId,
  initialPavilion,
}: GridContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setPavilions = usePavilionStore((s) => s.setPavilions);
  const selectedPavilionId = usePavilionStore((s) => s.selectedPavilionId);
  const selectPavilion = usePavilionStore((s) => s.selectPavilion);
  const filteredPavilions = useFilteredPavilions(pavilions);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPavilions(pavilions);
  }, [pavilions, setPavilions]);

  useEffect(() => {
    if (initialSelectedId) {
      selectPavilion(initialSelectedId);
    }
    setHydrated(true);
  }, [initialSelectedId, selectPavilion]);

  useEffect(() => {
    if (!hydrated) return;
    const currentPavilion = searchParams.get("pavilion");
    if (selectedPavilionId !== currentPavilion) {
      if (selectedPavilionId) {
        router.push(`?pavilion=${selectedPavilionId}`, { scroll: false });
      } else if (currentPavilion) {
        router.push("/", { scroll: false });
      }
    }
  }, [selectedPavilionId, searchParams, router, hydrated]);

  const selectedPavilion = selectedPavilionId
    ? pavilions.find((p) => p.id === selectedPavilionId) || null
    : initialPavilion;

  const stats = useMemo(() => {
    const disclosed = pavilions.filter((p) => p.total_budget_disclosed).length;
    const privateFunderCount = pavilions.reduce(
      (sum, p) => sum + p.private_funders.length,
      0
    );
    const redFlagged = pavilions.filter((p) => p.red_flags.length > 0).length;
    return { disclosed, privateFunderCount, redFlagged };
  }, [pavilions]);

  return (
    <>
      <header
        className="grid grid-cols-[1fr_auto_1fr] items-center px-4 py-3 flex-shrink-0 gap-4"
        style={{
          backgroundColor: "var(--card)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="justify-self-start">
          <h1
            className="font-serif text-xl font-bold tracking-tight leading-none"
            style={{ color: "var(--foreground)" }}
          >
            Venice Biennale 2026
          </h1>
          <p
            className="text-[11px] uppercase tracking-[0.18em] mt-1.5"
            style={{ color: "var(--primary)" }}
          >
            Who pays · who picks · who shows
          </p>
        </div>

        <a
          href="https://russ-jones.com"
          target="_blank"
          rel="noopener noreferrer"
          className="justify-self-center flex items-center gap-2.5 px-3 py-1.5 rounded-full transition-colors hover:bg-[var(--muted)] group"
          aria-label="Russ Jones — open russ-jones.com in a new tab"
        >
          <img
            src="/pythia-logo.png"
            alt=""
            width={28}
            height={28}
            className="opacity-90 group-hover:opacity-100 transition-opacity"
          />
          <span
            className="font-serif text-sm tracking-wide group-hover:underline"
            style={{ color: "var(--foreground)" }}
          >
            Russ Jones
          </span>
        </a>

        <div className="hidden md:flex items-center gap-4 text-xs justify-self-end">
          <Stat label="Pavilions" value={pavilions.length} />
          <Stat label="Budget disclosed" value={stats.disclosed} />
          <Stat label="Private funders" value={stats.privateFunderCount} />
          <Stat
            label="Red-flagged"
            value={stats.redFlagged}
            color="var(--primary)"
          />
        </div>
      </header>

      <FilterBar total={pavilions.length} shown={filteredPavilions.length} />

      <div className="flex-1 flex overflow-hidden">
        <div
          className={`flex-1 overflow-y-auto ${selectedPavilion ? "hidden lg:block" : "block"}`}
        >
          <CardsGrid
            pavilions={filteredPavilions}
            selectedId={selectedPavilionId}
            onSelect={(id) => selectPavilion(id)}
          />
        </div>

        {selectedPavilion && (
          <div className="w-full lg:w-96 flex-shrink-0 overflow-hidden">
            <DetailPanel pavilion={selectedPavilion} />
          </div>
        )}
      </div>
    </>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span style={{ color: color ?? "var(--foreground)" }} className="font-medium">
        {value}
      </span>
      <span style={{ color: "var(--muted-foreground)" }}>{label}</span>
    </div>
  );
}

export function GridContainer(props: GridContainerProps) {
  return (
    <Suspense
      fallback={
        <div
          className="flex items-center justify-center h-screen"
          style={{ backgroundColor: "var(--background)" }}
        >
          <div style={{ color: "var(--muted-foreground)" }}>Loading…</div>
        </div>
      }
    >
      <GridContainerInner {...props} />
    </Suspense>
  );
}
