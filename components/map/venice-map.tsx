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
import { getVenueColor, getPavilionCoords, getGiardiniPositions, getArsenaleZones } from "@/lib/data";

const nodeTypes = {
  pavilion: PavilionNode,
  venueLabel: VenueLabelNode,
};

// Scaling factor to spread nodes across the canvas
const SCALE = 1.5;
const OFFSET_X = -200;
const OFFSET_Y = -100;

function createNodesFromPavilions(pavilions: Pavilion[]): Node[] {
  const nodes: Node[] = [];

  // Add Giardini position labels
  const giardiniPositions = getGiardiniPositions();
  Object.entries(giardiniPositions).forEach(([num, pos]) => {
    nodes.push({
      id: `giardini-pos-${num}`,
      type: "venueLabel",
      position: {
        x: pos.x * SCALE + OFFSET_X - 10,
        y: pos.y * SCALE + OFFSET_Y - 40,
      },
      data: {
        label: num,
        venue: "Giardini",
        isPositionNumber: true,
      },
      draggable: false,
      selectable: false,
    });
  });

  // Add Arsenale zone labels
  const arsenaleZones = getArsenaleZones();
  Object.entries(arsenaleZones).forEach(([num, zone]) => {
    nodes.push({
      id: `arsenale-zone-${num}`,
      type: "venueLabel",
      position: {
        x: zone.x * SCALE + OFFSET_X,
        y: zone.y * SCALE + OFFSET_Y - 50,
      },
      data: {
        label: zone.label,
        venue: "Arsenale",
        count: zone.countries.length,
      },
      draggable: false,
      selectable: false,
    });
  });

  // Add main venue area labels
  const venueLabels = [
    { id: "venue-giardini", label: "GIARDINI", x: 1100, y: 300, venue: "Giardini" },
    { id: "venue-arsenale", label: "ARSENALE", x: 850, y: 450, venue: "Arsenale" },
    { id: "venue-offsite", label: "OFF-SITE VENUES", x: 400, y: 300, venue: "Off-site" },
  ];

  venueLabels.forEach((v) => {
    nodes.push({
      id: v.id,
      type: "venueLabel",
      position: {
        x: v.x * SCALE + OFFSET_X,
        y: v.y * SCALE + OFFSET_Y,
      },
      data: {
        label: v.label,
        venue: v.venue,
        isMainLabel: true,
      },
      draggable: false,
      selectable: false,
    });
  });

  // Add pavilion nodes using accurate coordinates
  pavilions.forEach((pavilion) => {
    const coords = getPavilionCoords(pavilion);
    
    // Add slight random offset for pavilions in same zone to prevent overlap
    const jitterX = (Math.random() - 0.5) * 30;
    const jitterY = (Math.random() - 0.5) * 30;
    
    nodes.push({
      id: pavilion.id,
      type: "pavilion",
      position: {
        x: coords.x * SCALE + OFFSET_X + jitterX,
        y: coords.y * SCALE + OFFSET_Y + jitterY,
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
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={3}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={30}
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
