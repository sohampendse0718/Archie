"use client";

import { useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import { useDiagramStore, ArchNode } from '@/store/useDiagramStore';
import { nodeTypes } from './nodes';
import ExportModal from '@/components/ExportModal';

const defaultEdgeOptions = {
  type: 'smoothstep',
  animated: true,
  style: {
    stroke: '#8b5cf6',
    strokeWidth: 2,
    filter: 'drop-shadow(0 0 5px rgba(139, 92, 246, 0.6))',
  },
};

function CanvasInner() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setSelectedNode, failedNodes, degradedNodes } = useDiagramStore();
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const containerRef = useRef<HTMLDivElement>(null);

  const styledEdges = edges.map(edge => {
    let newEdge = { ...edge };
    let isAnimated = edge.animated !== false; // true by default

    if (failedNodes.includes(edge.target)) {
      newEdge = {
        ...newEdge,
        animated: false,
        style: { ...newEdge.style, stroke: '#ef4444', filter: 'drop-shadow(0 0 5px rgba(239, 68, 68, 0.6))' }
      };
      isAnimated = false;
    } else if (degradedNodes.includes(edge.target)) {
      newEdge = {
        ...newEdge,
        style: { ...newEdge.style, stroke: '#f59e0b', filter: 'drop-shadow(0 0 5px rgba(245, 158, 11, 0.6))' }
      };
    }
    
    return {
      ...newEdge,
      style: {
        stroke: '#a855f7', // Default purple fallback
        ...newEdge.style,  // Preserves red/amber if set above
        strokeWidth: 2,
        ...(isAnimated ? { strokeDasharray: '6,6' } : {})
      },
      labelStyle: { fill: '#a1a1aa', fontWeight: 600 },
      labelBgStyle: { fill: '#09090b', fillOpacity: 1 },
      labelBgBorderRadius: 0
    };
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          zoomIn({ duration: 300 });
        } else if (e.key === '-') {
          e.preventDefault();
          zoomOut({ duration: 300 });
        } else if (e.key === '0') {
          e.preventDefault();
          fitView({ duration: 300 });
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [zoomIn, zoomOut, fitView]);

  return (
    <div ref={containerRef} className="w-full h-full relative z-0">
      <ReactFlow
        nodes={nodes}
        edges={styledEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => setSelectedNode(node as ArchNode)}
        onPaneClick={() => setSelectedNode(null)}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        minZoom={0.1}
        maxZoom={4}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
        colorMode="dark"
        className="bg-transparent"
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1.5} 
          color="#27272a" 
        />
        
        <Controls 
          className="!bg-zinc-900/80 !border-zinc-800 !shadow-xl backdrop-blur-md !rounded-xl !overflow-hidden [&>button]:!bg-transparent [&>button]:!border-zinc-800/50 [&>button]:!border-b [&>button]:last:!border-b-0 [&>button]:!text-zinc-400 hover:[&>button]:!text-zinc-100 hover:[&>button]:!bg-zinc-800/50 [&>button]:!transition-colors"
          showInteractive={false}
          position="bottom-left"
        />
        
        <MiniMap 
          className="!bg-zinc-900/90 !border !border-zinc-800 !shadow-2xl backdrop-blur-xl !rounded-xl !overflow-hidden"
          nodeColor={(n) => {
            if (n.type === 'customArch') {
              const cat = (n.data as { category?: string })?.category;
              if (cat === 'frontend') return '#3b82f6';
              if (cat === 'backend') return '#10b981';
              if (cat === 'ai') return '#a855f7';
              if (cat === 'database') return '#f59e0b';
            }
            return '#3f3f46';
          }}
          maskColor="rgba(9, 9, 11, 0.85)"
          position="bottom-right"
        />
      </ReactFlow>
    </div>
  );
}

export default function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
      <ExportModal />
    </ReactFlowProvider>
  );
}