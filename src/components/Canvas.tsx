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
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setSelectedNode, setSelectedEdge, failedNodes, degradedNodes, setNodes, lastGeneratedAt } = useDiagramStore();
  const { zoomIn, zoomOut, fitView, screenToFlowPosition } = useReactFlow();
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Auto-fit viewport every time the diagram is (re)generated ────────────
  useEffect(() => {
    if (!lastGeneratedAt) return;
    // Small delay lets React flush the new nodes before measuring
    const timer = setTimeout(() => {
      fitView({ duration: 600, padding: 0.08 });
    }, 80);
    return () => clearTimeout(timer);
  }, [lastGeneratedAt, fitView]);

  const isERD = nodes.some(n => n.type === 'erdNode');

  const styledEdges = edges.map(edge => {
    let newEdge = { ...edge };
    let isAnimated = edge.animated !== false;

    if (failedNodes.includes(edge.target)) {
      newEdge = {
        ...newEdge,
        animated: false,
        style: { ...newEdge.style, stroke: '#ef4444', filter: 'drop-shadow(0 0 5px rgba(239, 68, 68, 0.4))' },
      };
      isAnimated = false;
    } else if (degradedNodes.includes(edge.target)) {
      newEdge = {
        ...newEdge,
        style: { ...newEdge.style, stroke: '#f59e0b', filter: 'drop-shadow(0 0 5px rgba(245, 158, 11, 0.4))' },
      };
    }

    // ERD edges: thinner, muted grey so shapes are the focus
    const erdEdgeStyle = isERD ? {
      stroke: 'rgba(148,163,184,0.7)',
      strokeWidth: 1.5,
      filter: 'none',
    } : {};

    return {
      ...newEdge,
      // Always use smoothstep so edges bend like hand-drawn lines
      type: newEdge.type ?? 'smoothstep',
      style: {
        stroke: 'var(--accent)',
        ...newEdge.style,
        strokeWidth: 2,
        ...(isAnimated && !isERD ? { strokeDasharray: '6,6' } : {}),
        ...erdEdgeStyle,
      },
      // ERD edges are static, not animated
      animated: isERD ? false : (newEdge.animated !== false),
      labelStyle: { fill: 'var(--muted)', fontWeight: 600, fontSize: 11 },
      labelBgStyle: { fill: 'var(--bg)', fillOpacity: 0.85 },
      labelBgPadding: [4, 3] as [number, number],
      labelBgBorderRadius: 3,
    };
  });

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const transferData = event.dataTransfer.getData('application/reactflow');
      if (!transferData) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Parse transfer data format: "nodeType::variant" or "nodeType::sub::variant"
      const parts = transferData.split('::');
      const nodeTypeKey = parts[0];

      let newNode: ArchNode;

      if (nodeTypeKey === 'arch') {
        const category = parts[1] ?? 'backend';
        newNode = {
          id: crypto.randomUUID(),
          type: 'customArch',
          position,
          data: {
            label: `New ${category.charAt(0).toUpperCase() + category.slice(1)}`,
            category,
            description: 'Double click to edit or use the inspector panel.',
          },
        };
      } else if (nodeTypeKey === 'flowchart') {
        const shape = parts[1] ?? 'process';
        const shapeLabels: Record<string, string> = {
          terminal: 'Start',
          process: 'Process',
          decision: 'Decision',
          io: 'Input / Output',
        };
        newNode = {
          id: crypto.randomUUID(),
          type: 'flowchart',
          position,
          data: { label: shapeLabels[shape] ?? shape, shape: shape as 'process' | 'decision' | 'terminal' | 'io' },
        };
      } else if (nodeTypeKey === 'erEntity') {
        newNode = {
          id: crypto.randomUUID(),
          type: 'erEntity',
          position,
          data: {
            label: 'new_entity',
            attributes: [
              { name: 'id', type: 'UUID', isPrimaryKey: true },
              { name: 'created_at', type: 'TIMESTAMP' },
            ],
          },
        };
      } else if (nodeTypeKey === 'sequence') {
        const participantType = parts[1] ?? 'service';
        const ptLabels: Record<string, string> = {
          actor: 'User', service: 'Service', database: 'Database', external: 'External',
        };
        newNode = {
          id: crypto.randomUUID(),
          type: 'sequence',
          position,
          data: { label: ptLabels[participantType] ?? participantType, participantType: participantType as 'actor' | 'service' | 'database' | 'external' },
        };
      } else if (nodeTypeKey === 'bpmn') {
        const shape = parts[1] ?? 'task';   // task | event | gateway
        const variant = parts[2];           // e.g. 'start', 'end', 'user', 'exclusive'
        const labelMap: Record<string, string> = {
          'event::start': 'Start', 'event::end': 'End', 'task::user': 'User Task',
          'task::service': 'Service Task', 'gateway::exclusive': 'Gateway', 'gateway::parallel': 'Parallel Gateway',
        };
        const key = variant ? `${shape}::${variant}` : shape;
        newNode = {
          id: crypto.randomUUID(),
          type: 'bpmn',
          position,
          data: {
            label: labelMap[key] ?? shape,
            shape: shape as 'task' | 'event' | 'gateway',
            ...(shape === 'event' ? { eventType: (variant ?? 'start') as 'start' | 'end' | 'intermediate' } : {}),
            ...(shape === 'task' ? { taskType: (variant ?? 'user') as 'user' | 'service' | 'script' } : {}),
            ...(shape === 'gateway' ? { gatewayType: (variant ?? 'exclusive') as 'exclusive' | 'parallel' | 'inclusive' } : {}),
          },
        };
      } else if (nodeTypeKey === 'erd') {
        const erdType = parts[1] ?? 'entity';
        const labelDefaults: Record<string, string> = {
          entity: 'Entity',
          weak_entity: 'Weak Entity',
          relationship: 'Relationship',
          identifying_relationship: 'Identifying Rel.',
          attribute: 'attribute',
          key_attribute: 'id (PK)',
          multivalued_attribute: 'phones',
          derived_attribute: 'age',
        };
        newNode = {
          id: crypto.randomUUID(),
          type: 'erdNode',
          position,
          data: {
            label: labelDefaults[erdType] ?? 'Node',
            erdType: erdType as
              | 'entity' | 'weak_entity' | 'relationship' | 'identifying_relationship'
              | 'attribute' | 'key_attribute' | 'multivalued_attribute' | 'derived_attribute',
          },
        };
      } else {
        // Fallback — legacy plain type string
        newNode = {
          id: crypto.randomUUID(),
          type: 'customArch',
          position,
          data: {
            label: `New ${transferData.charAt(0).toUpperCase() + transferData.slice(1)}`,
            category: transferData,
            description: 'Double click to edit or use the inspector panel.',
          },
        };
      }

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
        onEdgeClick={(_, edge) => setSelectedEdge(edge)}
        onPaneClick={() => {
          setSelectedNode(null);
          setSelectedEdge(null);
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        minZoom={0.05}
        maxZoom={4}
        fitView
        fitViewOptions={{ padding: 0.08 }}
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