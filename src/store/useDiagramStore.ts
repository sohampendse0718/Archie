import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from '@xyflow/react';

import type { ArchNodeData } from '@/components/nodes/CustomArchNode';

export type ArchNode = Node<ArchNodeData, 'customArch'>;

const initialNodes: ArchNode[] = [
  {
    id: '1',
    type: 'customArch',
    position: { x: 400, y: 100 },
    data: {
      label: 'Next.js Frontend',
      category: 'frontend',
      description: 'Web application interface & Server Components',
      icon: 'Layout',
    },
  },
  {
    id: '2',
    type: 'customArch',
    position: { x: 400, y: 350 },
    data: {
      label: 'Node.js API Router',
      category: 'backend',
      description: 'API Gateway & Authentication',
      icon: 'Server',
    },
  },
  {
    id: '3',
    type: 'customArch',
    position: { x: 150, y: 600 },
    data: {
      label: 'LLM Agent Router',
      category: 'ai',
      description: 'OpenAI orchestration & tool execution',
      icon: 'Bot',
    },
  },
  {
    id: '4',
    type: 'customArch',
    position: { x: 650, y: 600 },
    data: {
      label: 'Supabase DB',
      category: 'database',
      description: 'Postgres SQL & Vector Store',
      icon: 'Database',
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2, filter: 'drop-shadow(0 0 4px rgba(59,130,246,0.6))' },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#3b82f6',
    },
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    animated: true,
    style: { stroke: '#a855f7', strokeWidth: 2, filter: 'drop-shadow(0 0 4px rgba(168,85,247,0.6))' },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#a855f7',
    },
  },
  {
    id: 'e2-4',
    source: '2',
    target: '4',
    animated: true,
    style: { stroke: '#10b981', strokeWidth: 2, filter: 'drop-shadow(0 0 4px rgba(16,185,129,0.6))' },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#10b981',
    },
  },
];

type DiagramState = {
  nodes: ArchNode[];
  edges: Edge[];
  onNodesChange: OnNodesChange<ArchNode>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: ArchNode[]) => void;
  setEdges: (edges: Edge[]) => void;
};

export const useDiagramStore = create<DiagramState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  onNodesChange: (changes: NodeChange<ArchNode>[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge({
        ...connection,
        animated: true,
        style: { stroke: '#71717a', strokeWidth: 2, filter: 'drop-shadow(0 0 4px rgba(113,113,122,0.4))' },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#71717a',
        },
      }, get().edges),
    });
  },
  setNodes: (nodes: ArchNode[]) => set({ nodes }),
  setEdges: (edges: Edge[]) => set({ edges }),
}));
