"use client";

import { useEffect, useRef, useCallback } from 'react';
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
import { useTheme } from '@/components/ThemeProvider';

const defaultEdgeOptions = {
  type: 'smoothstep',
  animated: true,
  style: {
    stroke: 'var(--accent)',
    strokeWidth: 2,
    filter: 'drop-shadow(0 0 5px rgba(99, 102, 241, 0.4))',
  },
};

function CanvasInner() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setSelectedNode, failedNodes, degradedNodes, setNodes } = useDiagramStore();
  const { zoomIn, zoomOut, fitView, screenToFlowPosition } = useReactFlow();
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  const styledEdges = edges.map(edge => {
    let newEdge = { ...edge };
    let isAnimated = edge.animated !== false; // true by default

    if (failedNodes.includes(edge.target)) {
      newEdge = {
        ...newEdge,
        animated: false,
        style: { ...newEdge.style, stroke: '#ef4444', filter: 'drop-shadow(0 0 5px rgba(239, 68, 68, 0.4))' }
      };
      isAnimated = false;
    } else if (degradedNodes.includes(edge.target)) {
      newEdge = {
        ...newEdge,
        style: { ...newEdge.style, stroke: '#f59e0b', filter: 'drop-shadow(0 0 5px rgba(245, 158, 11, 0.4))' }
      };
    }
    
    return {
      ...newEdge,
      style: {
        stroke: 'var(--accent)',
        ...newEdge.style,
        strokeWidth: 2,
        ...(isAnimated ? { strokeDasharray: '6,6' } : {})
      },
      labelStyle: { fill: 'var(--muted)', fontWeight: 600 },
      labelBgStyle: { fill: 'var(--bg)', fillOpacity: 1 },
      labelBgBorderRadius: 0
    };
  });

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: ArchNode = {
        id: crypto.randomUUID(),
        type: 'customArch',
        position,
        data: {
          label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
          category: type,
          description: 'Double click to edit or use the inspector panel.',
        },
      };

      setNodes([...nodes, newNode]);
    },
    [screenToFlowPosition, nodes, setNodes],
  );

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
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        minZoom={0.1}
        maxZoom={4}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
        colorMode={theme === 'dark' ? 'dark' : 'light'}
        className="bg-transparent"
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1.5} 
          color={theme === 'dark' ? '#27272a' : '#d4d4d8'} 
        />
        

        
        <MiniMap 
          className="!bg-surface/90 !border !border-border-c !shadow-xl backdrop-blur-xl !rounded-xl !overflow-hidden"
          nodeColor={(n) => {
            if (n.type === 'customArch') {
              const cat = (n.data as { category?: string })?.category;
              if (cat === 'frontend') return '#3b82f6';
              if (cat === 'backend') return '#10b981';
              if (cat === 'ai') return '#a855f7';
              if (cat === 'database') return '#f59e0b';
            }
            return theme === 'dark' ? '#3f3f46' : '#d4d4d8';
          }}
          maskColor={theme === 'dark' ? 'rgba(9, 9, 11, 0.85)' : 'rgba(244, 244, 245, 0.85)'}
          position="bottom-right"
        />
      </ReactFlow>
    </div>
  );
}

export default function Canvas() {
  return (
    <>
      <CanvasInner />
      <ExportModal />
    </>
  );
}