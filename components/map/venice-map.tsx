"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { PavilionNode } from "./pavilion-node";
import { VenueLabelNode } from "./venue-label-node";
import { MapBackgroundNode } from "./map-background-node";
import {
  useMapStore,
  getPavilionsByFunder,
} from "@/lib/use-map-store";
import type { Pavilion } from "@/lib/types";
import { getVenueColor, getPavilionCoords } from "@/lib/data";

const nodeTypes = {
  pavilion: PavilionNode,
  venueLabel: VenueLabelNode,
  mapBackground: MapBackgroundNode,
};

// Layout configuration for the three venue areas
const LAYOUT = {
  // Giardini area (bottom right) - matches the official numbered map
  giardini: {
    x: 900,
    y: 400,
    width: 600,
    height: 400,
  },
  // Arsenale area (center right)
  arsenale: {
    x: 600,
    y: 350,
    width: 400,
    height: 300,
  },
  // Off-site venues (left side - Venice city)
  offsite: {
    x: 50,
    y: 100,
    width: 500,
    height: 600,
  },
};

// Pre-compute stable jitter values per pavilion ID
function getStableJitter(id: string, maxSpread: number = 30): { x: number; y: number } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return {
    x: ((hash % (maxSpread * 2)) - maxSpread),
    y: (((hash >> 8) % (maxSpread * 2)) - maxSpread),
  };
}

function createNodesFromPavilions(pavilions: Pavilion[]): Node[] {
  const nodes: Node[] = [];

  // Add background map images
  nodes.push({
    id: "bg-venice",
    type: "mapBackground",
    position: { x: LAYOUT.offsite.x - 20, y: LAYOUT.offsite.y - 50 },
    data: {
      imageUrl: "/images/venice-map.jpg",
      width: LAYOUT.offsite.width + 100,
      height: LAYOUT.offsite.height + 100,
      label: "Venice City",
    },
    draggable: false,
    selectable: false,
    zIndex: -10,
  });

  nodes.push({
    id: "bg-giardini",
    type: "mapBackground",
    position: { x: LAYOUT.giardini.x - 50, y: LAYOUT.giardini.y - 80 },
    data: {
      imageUrl: "/images/giardini-map.jpg",
      width: LAYOUT.giardini.width + 100,
      height: LAYOUT.giardini.height + 160,
      label: "Giardini della Biennale",
    },
    draggable: false,
    selectable: false,
    zIndex: -10,
  });

  nodes.push({
    id: "bg-arsenale",
    type: "mapBackground",
    position: { x: LAYOUT.arsenale.x - 30, y: LAYOUT.arsenale.y - 50 },
    data: {
      imageUrl: "/images/arsenale-map.jpg",
      width: LAYOUT.arsenale.width + 60,
      height: LAYOUT.arsenale.height + 100,
      label: "Arsenale",
    },
    draggable: false,
    selectable: false,
    zIndex: -10,
  });

  // Add main venue area labels
  const venueLabels = [
    { id: "venue-giardini", label: "GIARDINI", x: LAYOUT.giardini.x + 200, y: LAYOUT.giardini.y - 40, venue: "Giardini" as const },
    { id: "venue-arsenale", label: "ARSENALE", x: LAYOUT.arsenale.x + 150, y: LAYOUT.arsenale.y - 20, venue: "Arsenale" as const },
    { id: "venue-offsite", label: "OFF-SITE VENUES", x: LAYOUT.offsite.x + 180, y: LAYOUT.offsite.y, venue: "Off-site" as const },
  ];

  venueLabels.forEach((v) => {
    nodes.push({
      id: v.id,
      type: "venueLabel",
      position: { x: v.x, y: v.y },
      data: {
        label: v.label,
        venue: v.venue,
        isMainLabel: true,
      },
      draggable: false,
      selectable: false,
      zIndex: 5,
    });
  });

  // Group pavilions by venue for positioning
  const giardiniPavilions = pavilions.filter(p => p.venue === "Giardini");
  const arsenalePavilions = pavilions.filter(p => p.venue === "Arsenale");
  const offsitePavilions = pavilions.filter(p => p.venue === "Off-site");

  // Position Giardini pavilions in a grid layout
  giardiniPavilions.forEach((pavilion, index) => {
    const cols = 6;
    const row = Math.floor(index / cols);
    const col = index % cols;
    const jitter = getStableJitter(pavilion.id, 15);
    
    nodes.push({
      id: pavilion.id,
      type: "pavilion",
      position: {
        x: LAYOUT.giardini.x + col * 80 + jitter.x,
        y: LAYOUT.giardini.y + row * 70 + jitter.y,
      },
      data: { pavilion },
      zIndex: 10,
    });
  });

  // Position Arsenale pavilions in rows
  arsenalePavilions.forEach((pavilion, index) => {
    const cols = 5;
    const row = Math.floor(index / cols);
    const col = index % cols;
    const jitter = getStableJitter(pavilion.id, 12);
    
    nodes.push({
      id: pavilion.id,
      type: "pavilion",
      position: {
        x: LAYOUT.arsenale.x + col * 70 + jitter.x,
        y: LAYOUT.arsenale.y + row * 60 + jitter.y,
      },
      data: { pavilion },
      zIndex: 10,
    });
  });

  // Position off-site pavilions scattered across the city area
  offsitePavilions.forEach((pavilion, index) => {
    // Try to use grid_ref coordinates, fall back to spread layout
    const coords = getPavilionCoords(pavilion);
    const jitter = getStableJitter(pavilion.id, 20);
    
    // If coords came from grid_ref, use them; otherwise spread in the offsite area
    let x: number, y: number;
    if (pavilion.grid_ref && !pavilion.grid_ref.toLowerCase().includes("off the map")) {
      // Scale grid coordinates to fit in offsite area
      x = LAYOUT.offsite.x + (coords.x * 0.8);
      y = LAYOUT.offsite.y + (coords.y * 0.6);
    } else {
      // Spread across the offsite area
      const cols = 6;
      const row = Math.floor(index / cols);
      const col = index % cols;
      x = LAYOUT.offsite.x + col * 75 + jitter.x;
      y = LAYOUT.offsite.y + 80 + row * 65 + jitter.y;
    }
    
    nodes.push({
      id: pavilion.id,
      type: "pavilion",
      position: { x, y },
      data: { pavilion },
      zIndex: 10,
    });
  });

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
      if (filters.redFlagsOnly && p.red_flags.length === 0) return false;

      const budget = p.total_budget_amount_usd || 0;
      if (budget < filters.budgetRange[0] || budget > filters.budgetRange[1]) return false;

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const searchableText = [
          p.country,
          p.artist_name,
          p.curator_name,
          p.show_title,
          ...p.private_funders.map((f) => f.name),
        ]
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
    () => createNodesFromPavilions(filteredPavilions),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filteredIds]
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
    setNodes(createNodesFromPavilions(filteredPavilions));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredIds, setNodes]);

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
      }
    },
    [selectPavilion]
  );

  const onPaneClick = useCallback(() => {
    selectPavilion(null);
  }, [selectPavilion]);

  return (
    <div className="w-full h-full">
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
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={4}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={40}
          size={1}
          color="var(--border)"
        />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === "venueLabel" || node.type === "mapBackground") return "transparent";
            const pavilion = (node.data as { pavilion: Pavilion }).pavilion;
            return getVenueColor(pavilion.venue);
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
