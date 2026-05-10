"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { PavilionNode } from "./pavilion-node";
import { VenueZoneNode } from "./venue-zone-node";
import { MapImageNode } from "./map-image-node";
import {
  useMapStore,
  getPavilionsByFunder,
} from "@/lib/use-map-store";
import type { Pavilion } from "@/lib/types";
import { getVenueColor } from "@/lib/data";

const nodeTypes = {
  pavilion: PavilionNode,
  venueZone: VenueZoneNode,
  mapImage: MapImageNode,
};

// The map image dimensions
const MAP_WIDTH = 1566;
const MAP_HEIGHT = 890;

// Grid coordinates on the map image (measured from the PNG)
// Columns A-H: A starts at x=62, each column ~187px wide
// Rows 1-6: Row 1 starts at y=30, each row ~143px tall
const GRID = {
  colStart: 62,
  colWidth: 187,
  rowStart: 45,
  rowHeight: 140,
};

// Convert grid reference (e.g., "E3") to map coordinates
function gridToCoords(col: string, row: number): { x: number; y: number } {
  const colIndex = col.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
  return {
    x: GRID.colStart + colIndex * GRID.colWidth + GRID.colWidth / 2,
    y: GRID.rowStart + (row - 1) * GRID.rowHeight + GRID.rowHeight / 2,
  };
}

// Parse various grid reference formats
function parseGridRef(gridRef: string): { x: number; y: number } | null {
  if (!gridRef) return null;
  
  // Skip Giardini/Arsenale venues - they go in sub-maps
  if (gridRef.toLowerCase().includes("giardini")) return null;
  if (gridRef.toLowerCase().includes("arsenale")) return null;
  
  // Match patterns like "42 E2", "5 C5", "20 H4"
  const match = gridRef.match(/(\d+)\s*([A-H])(\d)/i);
  if (match) {
    const [, , col, row] = match;
    return gridToCoords(col, parseInt(row));
  }
  
  // Match simple patterns like "E3", "C5"
  const simpleMatch = gridRef.match(/^([A-H])(\d)$/i);
  if (simpleMatch) {
    const [, col, row] = simpleMatch;
    return gridToCoords(col, parseInt(row));
  }
  
  // Off the map venues (San Servolo island - bottom left area)
  if (gridRef.toLowerCase().includes("off the map") || 
      gridRef.toLowerCase().includes("san servolo")) {
    return { x: 100, y: 800 };
  }
  
  return null;
}

// Arsenale zone - measured from map image (orange outlined L-shaped area)
// Located at approximately G3-H3 on the grid, east of Castello
// The orange shape on the map is at roughly x:1180-1380, y:330-450
const ARSENALE_ZONE = {
  x: 1180,  // Left edge of the Arsenale outline
  y: 340,   // Top edge
  width: 200,
  height: 120,
};

// Giardini zone - measured from map image (orange outlined pentagon area)  
// Located at approximately G4-H5 on the grid, southeast of Arsenale
// The orange shape on the map is at roughly x:1280-1480, y:540-700
const GIARDINI_ZONE = {
  x: 1280,
  y: 540,
  width: 200,
  height: 160,
};

function createNodesFromPavilions(
  pavilions: Pavilion[],
  currentView: "main" | "arsenale" | "giardini"
): Node[] {
  const nodes: Node[] = [];

  if (currentView === "main") {
    // Add map image as background node (not draggable)
    nodes.push({
      id: "map-background",
      type: "mapImage",
      position: { x: 0, y: 0 },
      data: {
        src: "/images/venice-main-map.png",
        width: MAP_WIDTH,
        height: MAP_HEIGHT,
      },
      draggable: false,
      selectable: false,
      zIndex: 0,
    });

    // Get pavilions for each venue to display flags
    const arsenalePavilions = pavilions.filter(p => p.venue === "Arsenale");
    const giardiniPavilions = pavilions.filter(p => p.venue === "Giardini");

    // Add Arsenale clickable zone
    nodes.push({
      id: "zone-arsenale",
      type: "venueZone",
      position: { x: ARSENALE_ZONE.x, y: ARSENALE_ZONE.y },
      data: {
        venue: "Arsenale",
        width: ARSENALE_ZONE.width,
        height: ARSENALE_ZONE.height,
        count: arsenalePavilions.length,
        pavilions: arsenalePavilions,
      },
      draggable: false,
      zIndex: 10,
    });

    // Add Giardini clickable zone
    nodes.push({
      id: "zone-giardini",
      type: "venueZone",
      position: { x: GIARDINI_ZONE.x, y: GIARDINI_ZONE.y },
      data: {
        venue: "Giardini",
        width: GIARDINI_ZONE.width,
        height: GIARDINI_ZONE.height,
        count: giardiniPavilions.length,
        pavilions: giardiniPavilions,
      },
      draggable: false,
      zIndex: 10,
    });

    // Add only off-site pavilions to the main map
    const offsitePavilions = pavilions.filter(p => p.venue === "Off-site");
    
    offsitePavilions.forEach((pavilion) => {
      const coords = parseGridRef(pavilion.grid_ref || "");
      
      if (coords) {
        nodes.push({
          id: pavilion.id,
          type: "pavilion",
          position: coords,
          data: { pavilion },
          draggable: false,
          zIndex: 20,
        });
      }
    });
  }
  // TODO: Add arsenale and giardini sub-map views when images are uploaded

  return nodes;
}

function createFunderEdges(funderName: string, pavilions: Pavilion[]): Edge[] {
  const connectedPavilions = getPavilionsByFunder(funderName, pavilions);
  const edges: Edge[] = [];

  for (let i = 0; i < connectedPavilions.length; i++) {
    for (let j = i + 1; j < connectedPavilions.length; j++) {
      edges.push({
        id: `${connectedPavilions[i].id}-${connectedPavilions[j].id}`,
        source: connectedPavilions[i].id,
        target: connectedPavilions[j].id,
        style: {
          stroke: "var(--primary)",
          strokeWidth: 2,
          opacity: 0.6,
        },
        animated: true,
      });
    }
  }

  return edges;
}

interface VeniceMapProps {
  pavilions: Pavilion[];
}

export function VeniceMap({ pavilions: allPavilions }: VeniceMapProps) {
  const selectPavilion = useMapStore((s) => s.selectPavilion);
  const highlightedFunder = useMapStore((s) => s.highlightedFunder);
  const setPavilions = useMapStore((s) => s.setPavilions);
  const filters = useMapStore((s) => s.filters);
  const pavilionsInStore = useMapStore((s) => s.pavilions);
  
  const [currentView, setCurrentView] = useState<"main" | "arsenale" | "giardini">("main");
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && allPavilions.length > 0) {
      setPavilions(allPavilions);
      initialized.current = true;
    }
  }, [allPavilions, setPavilions]);

  // Filter pavilions
  const filteredPavilions = useMemo(() => {
    const source = pavilionsInStore.length > 0 ? pavilionsInStore : allPavilions;
    
    return source.filter((p) => {
      if (filters.venue !== "all" && p.venue !== filters.venue) return false;
      if (filters.selectionMethod !== "all" && p.selection_method !== filters.selectionMethod) return false;
      if (filters.redFlagsOnly && (!p.red_flags || p.red_flags.length === 0)) return false;

      const budget = p.total_budget_amount_usd || 0;
      if (budget < filters.budgetRange[0] || budget > filters.budgetRange[1]) return false;

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const searchableText = [
          p.country,
          p.artist_name,
          p.curator_name,
          p.show_title,
          ...(p.private_funders || []).map((f) => f.name),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!searchableText.includes(searchLower)) return false;
      }

      return true;
    });
  }, [pavilionsInStore, allPavilions, filters]);

  const filteredIds = useMemo(
    () => filteredPavilions.map((p) => p.id).join(","),
    [filteredPavilions]
  );

  const initialNodes = useMemo(
    () => createNodesFromPavilions(filteredPavilions, currentView),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filteredIds, currentView]
  );

  const initialEdges = useMemo(() => {
    if (highlightedFunder) {
      return createFunderEdges(highlightedFunder, allPavilions);
    }
    return [];
  }, [highlightedFunder, allPavilions]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(createNodesFromPavilions(filteredPavilions, currentView));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredIds, currentView, setNodes]);

  useEffect(() => {
    if (highlightedFunder) {
      setEdges(createFunderEdges(highlightedFunder, allPavilions));
    } else {
      setEdges([]);
    }
  }, [highlightedFunder, allPavilions, setEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.type === "pavilion") {
        selectPavilion(node.id);
      } else if (node.type === "venueZone") {
        const venue = (node.data as { venue: string }).venue;
        if (venue === "Arsenale") {
          setCurrentView("arsenale");
        } else if (venue === "Giardini") {
          setCurrentView("giardini");
        }
      }
    },
    [selectPavilion]
  );

  const onPaneClick = useCallback(() => {
    selectPavilion(null);
  }, [selectPavilion]);

  return (
    <div className="w-full h-full relative" style={{ backgroundColor: "#87CEEB" }}>
      {/* Back button when in sub-view */}
      {currentView !== "main" && (
        <button
          onClick={() => setCurrentView("main")}
          className="absolute top-4 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{
            backgroundColor: "var(--card)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Venice
        </button>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nodeTypes={nodeTypes as any}
        fitView
        fitViewOptions={{ 
          padding: 0.02,
          minZoom: 0.5,
          maxZoom: 1,
        }}
        minZoom={0.3}
        maxZoom={4}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          type: "smoothstep",
        }}
      >
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === "mapImage") return "transparent";
            if (node.type === "venueZone") {
              const venue = (node.data as { venue: string }).venue;
              return getVenueColor(venue as "Giardini" | "Arsenale" | "Off-site");
            }
            if (node.type === "pavilion") {
              const pavilion = (node.data as { pavilion: Pavilion }).pavilion;
              return getVenueColor(pavilion.venue);
            }
            return "transparent";
          }}
          maskColor="rgba(0, 0, 0, 0.8)"
          style={{ backgroundColor: "var(--card)" }}
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}
