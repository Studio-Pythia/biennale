"use client";

import { useCallback, useEffect, useMemo } from "react";
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
import {
  useMapStore,
  useFilteredPavilions,
  getPavilionsByFunder,
} from "@/lib/use-map-store";
import type { Pavilion } from "@/lib/types";
import { getVenueColor } from "@/lib/data";

const nodeTypes = {
  pavilion: PavilionNode,
  venueLabel: VenueLabelNode,
};

// Scaling factor to spread nodes across the canvas
const SCALE_X = 3;
const SCALE_Y = 3;
const OFFSET_X = -3200;
const OFFSET_Y = -1100;

function createNodesFromPavilions(pavilions: Pavilion[]): Node[] {
  const nodes: Node[] = [];

  // Group pavilions by venue for labels
  const venueGroups = pavilions.reduce((acc, p) => {
    if (!acc[p.venue]) acc[p.venue] = [];
    acc[p.venue].push(p);
    return acc;
  }, {} as Record<string, Pavilion[]>);

  // Add venue label nodes
  const venueLabelPositions: Record<string, { x: number; y: number }> = {
    Giardini: { x: 1200 * SCALE_X + OFFSET_X, y: 400 * SCALE_Y + OFFSET_Y },
    Arsenale: { x: 1050 * SCALE_X + OFFSET_X, y: 580 * SCALE_Y + OFFSET_Y },
    "Off-site": { x: 900 * SCALE_X + OFFSET_X, y: 350 * SCALE_Y + OFFSET_Y },
  };

  Object.entries(venueGroups).forEach(([venue, venuePavilions]) => {
    const pos = venueLabelPositions[venue] || { x: 0, y: 0 };
    nodes.push({
      id: `venue-${venue}`,
      type: "venueLabel",
      position: pos,
      data: {
        label: venue,
        venue: venue,
        count: venuePavilions.length,
      },
      draggable: false,
      selectable: false,
    });
  });

  // Add pavilion nodes
  pavilions.forEach((pavilion) => {
    nodes.push({
      id: pavilion.id,
      type: "pavilion",
      position: {
        x: pavilion.coords.x * SCALE_X + OFFSET_X,
        y: pavilion.coords.y * SCALE_Y + OFFSET_Y,
      },
      data: { pavilion },
    });
  });

  return nodes;
}

function createFunderEdges(funderName: string, pavilions: Pavilion[]): Edge[] {
  const connectedPavilions = getPavilionsByFunder(funderName, pavilions);
  const edges: Edge[] = [];

  // Create edges between all connected pavilions to show the network
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
  const { selectPavilion, highlightedFunder, setPavilions } = useMapStore();
  const filteredPavilions = useFilteredPavilions();

  // Initialize store with pavilions
  useEffect(() => {
    setPavilions(allPavilions);
  }, [allPavilions, setPavilions]);

  const initialNodes = useMemo(
    () => createNodesFromPavilions(filteredPavilions),
    [filteredPavilions]
  );

  const initialEdges = useMemo(() => {
    if (highlightedFunder) {
      return createFunderEdges(highlightedFunder, allPavilions);
    }
    return [];
  }, [highlightedFunder, allPavilions]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when filtered pavilions change
  useEffect(() => {
    setNodes(createNodesFromPavilions(filteredPavilions));
  }, [filteredPavilions, setNodes]);

  // Update edges when highlighted funder changes
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
        minZoom={0.1}
        maxZoom={2}
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
            if (node.type === "venueLabel") return "transparent";
            const pavilion = (node.data as { pavilion: Pavilion }).pavilion;
            return getVenueColor(pavilion.venue);
          }}
          maskColor="rgba(0, 0, 0, 0.7)"
          style={{ backgroundColor: "var(--card)" }}
        />
      </ReactFlow>
    </div>
  );
}
