import { create } from 'zustand';
import { getLayoutedElements } from '@/lib/layoutUtils';
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

const initialNodes: ArchNode[] = [];
const initialEdges: Edge[] = [];

type DiagramState = {
  nodes: ArchNode[];
  edges: Edge[];
  selectedNode: ArchNode | null;
  onNodesChange: OnNodesChange<ArchNode>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: ArchNode[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNode: (node: ArchNode | null) => void;
  applyAutoLayout: (direction?: string) => void;
};

export const useDiagramStore = create<DiagramState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  selectedNode: null,
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
  setSelectedNode: (node: ArchNode | null) => set({ selectedNode: node }),
  applyAutoLayout: (direction = 'TB') => {
    const { nodes, edges } = getLayoutedElements(get().nodes, get().edges, direction);
    set({ nodes, edges });
  },
}));