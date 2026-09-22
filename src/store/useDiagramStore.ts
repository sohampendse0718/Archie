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
import type { FlowchartNodeData } from '@/components/nodes/FlowchartNode';
import type { ERNodeData } from '@/components/nodes/ERNode';
import type { SequenceNodeData } from '@/components/nodes/SequenceNode';
import type { BPMNNodeData } from '@/components/nodes/BPMNNode';
import type { DocumentNodeData } from '@/components/nodes/DocumentNode';

// Union of all possible node data types
type AnyNodeData = ArchNodeData | FlowchartNodeData | ERNodeData | SequenceNodeData | BPMNNodeData | DocumentNodeData;

// A diagram node can be any registered node type
export type ArchNode = Node<AnyNodeData>;

const initialNodes: ArchNode[] = [];
const initialEdges: Edge[] = [];

type DiagramState = {
  nodes: ArchNode[];
  edges: Edge[];
  selectedNode: ArchNode | null;
  selectedEdge: Edge | null;
  architectureScore: number | null;
  scoreReasoning: string | null;
  strengths: string[];
  weaknesses: string[];
  tradeoffs: string[];
  isScoreModalOpen: boolean;
  diagramType: string;
  currentArchitectureId: string | null;
  currentArchitectureTitle: string;
  onNodesChange: OnNodesChange<ArchNode>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: ArchNode[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNode: (node: ArchNode | null) => void;
  setSelectedEdge: (edge: Edge | null) => void;
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
  setDiagramType: (type: string) => void;
  resetDiagram: () => void;
  updateNodeData: (id: string, data: Partial<AnyNodeData>) => void;
  deleteNode: (nodeId: string) => void;
  updateEdge: (id: string, data: Partial<Edge>) => void;
  deleteEdge: (edgeId: string) => void;
  lastGeneratedAt: number | null;
  setLastGeneratedAt: (val: number) => void;
};

export const useDiagramStore = create<DiagramState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  selectedNode: null,
  selectedEdge: null,
  architectureScore: null,
  scoreReasoning: null,
  strengths: [],
  weaknesses: [],
  tradeoffs: [],
  isScoreModalOpen: false,
  diagramType: 'architecture',
  isExportModalOpen: false,
  failedNodes: [],
  degradedNodes: [],
  currentArchitectureId: null,
  currentArchitectureTitle: 'Untitled Architecture',
  lastGeneratedAt: null,
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
  setSelectedNode: (node: ArchNode | null) => set({ selectedNode: node, selectedEdge: null }),
  setSelectedEdge: (edge: Edge | null) => set({ selectedEdge: edge, selectedNode: null }),
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
  setDiagramType: (type: string) => set({ diagramType: type }),
  resetDiagram: () => set({
    nodes: [],
    edges: [],
    selectedNode: null,
    selectedEdge: null,
    architectureScore: null,
    scoreReasoning: null,
    strengths: [],
    weaknesses: [],
    tradeoffs: [],
    failedNodes: [],
    degradedNodes: [],
    currentArchitectureId: null,
    currentArchitectureTitle: 'Untitled Architecture',
    diagramType: 'architecture',
    lastGeneratedAt: null,
  }),
  updateNodeData: (id, data) => set((state) => {
    const updatedNodes = state.nodes.map((node) => 
      node.id === id 
        ? { ...node, data: { ...node.data, ...data } } 
        : node
    );
    const updatedSelectedNode = state.selectedNode && state.selectedNode.id === id
      ? { ...state.selectedNode, data: { ...state.selectedNode.data, ...data } }
      : state.selectedNode;
    
    return {
      nodes: updatedNodes,
      selectedNode: updatedSelectedNode,
    };
  }),
  deleteNode: (nodeId) => set((state) => {
    const newNodes = state.nodes.filter(n => n.id !== nodeId);
    const newEdges = state.edges.filter(e => e.source !== nodeId && e.target !== nodeId);
    const edgeDeleted = state.selectedEdge && (state.selectedEdge.source === nodeId || state.selectedEdge.target === nodeId);
    
    return {
      nodes: newNodes,
      edges: newEdges,
      selectedNode: state.selectedNode?.id === nodeId ? null : state.selectedNode,
      selectedEdge: edgeDeleted ? null : state.selectedEdge,
    };
  }),
  updateEdge: (id, data) => set((state) => {
    const updatedEdges = state.edges.map((edge) => 
      edge.id === id 
        ? { ...edge, ...data } 
        : edge
    );
    const updatedSelectedEdge = state.selectedEdge && state.selectedEdge.id === id
      ? { ...state.selectedEdge, ...data }
      : state.selectedEdge;
    
    return {
      edges: updatedEdges,
      selectedEdge: updatedSelectedEdge,
    };
  }),
  deleteEdge: (edgeId) => set((state) => ({
    edges: state.edges.filter(e => e.id !== edgeId),
    selectedEdge: state.selectedEdge?.id === edgeId ? null : state.selectedEdge,
  })),
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
  setLastGeneratedAt: (val: number) => set({ lastGeneratedAt: val }),
}));