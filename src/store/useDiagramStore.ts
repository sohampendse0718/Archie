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
  architectureScore: number | null;
  scoreReasoning: string | null;
  strengths: string[];
  weaknesses: string[];
  tradeoffs: string[];
  isScoreModalOpen: boolean;
  currentArchitectureId: string | null;
  currentArchitectureTitle: string;
  onNodesChange: OnNodesChange<ArchNode>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: ArchNode[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNode: (node: ArchNode | null) => void;
  setArchitectureScore: (score: number | null) => void;
  setScoreReasoning: (reasoning: string | null) => void;
  setAnalysisDetails: (details: { strengths?: string[]; weaknesses?: string[]; tradeoffs?: string[] }) => void;
  setIsScoreModalOpen: (open: boolean) => void;
  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;
  applyAutoLayout: (direction?: string) => void;
  failedNodes: string[];
  degradedNodes: string[];
  toggleNodeOutage: (nodeId: string) => void;
  setCurrentArchitectureId: (id: string | null) => void;
  setCurrentArchitectureTitle: (title: string) => void;
  resetDiagram: () => void;
};

export const useDiagramStore = create<DiagramState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  selectedNode: null,
  architectureScore: null,
  scoreReasoning: null,
  strengths: [],
  weaknesses: [],
  tradeoffs: [],
  isScoreModalOpen: false,
  isExportModalOpen: false,
  failedNodes: [],
  degradedNodes: [],
  currentArchitectureId: null,
  currentArchitectureTitle: 'Untitled Architecture',
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
  setArchitectureScore: (score: number | null) => set({ architectureScore: score }),
  setScoreReasoning: (reasoning: string | null) => set({ scoreReasoning: reasoning }),
  setAnalysisDetails: (details) => set((state) => ({ 
    strengths: details.strengths || state.strengths,
    weaknesses: details.weaknesses || state.weaknesses,
    tradeoffs: details.tradeoffs || state.tradeoffs
  })),
  setIsScoreModalOpen: (open: boolean) => set({ isScoreModalOpen: open }),
  setIsExportModalOpen: (open: boolean) => set({ isExportModalOpen: open }),
  setCurrentArchitectureId: (id: string | null) => set({ currentArchitectureId: id }),
  setCurrentArchitectureTitle: (title: string) => set({ currentArchitectureTitle: title }),
  resetDiagram: () => set({
    nodes: [],
    edges: [],
    selectedNode: null,
    architectureScore: null,
    scoreReasoning: null,
    strengths: [],
    weaknesses: [],
    tradeoffs: [],
    failedNodes: [],
    degradedNodes: [],
    currentArchitectureId: null,
    currentArchitectureTitle: 'Untitled Architecture',
  }),
  applyAutoLayout: (direction = 'TB') => {
    const { nodes, edges } = getLayoutedElements(get().nodes, get().edges, direction);
    set({ nodes, edges });
  },
  toggleNodeOutage: (nodeId: string) => set((state) => {
    const isFailed = state.failedNodes.includes(nodeId);
    let newFailedNodes: string[];
    
    if (isFailed) {
      newFailedNodes = state.failedNodes.filter(id => id !== nodeId);
    } else {
      newFailedNodes = [...state.failedNodes, nodeId];
    }

    // Recalculate degraded nodes (Blast Radius)
    const newDegradedNodes = new Set<string>();
    let changed = true;
    while (changed) {
      changed = false;
      for (const edge of state.edges) {
        if (newFailedNodes.includes(edge.target) || newDegradedNodes.has(edge.target)) {
          if (!newFailedNodes.includes(edge.source) && !newDegradedNodes.has(edge.source)) {
            newDegradedNodes.add(edge.source);
            changed = true;
          }
        }
      }
    }

    return {
      failedNodes: newFailedNodes,
      degradedNodes: Array.from(newDegradedNodes),
    };
  }),
}));