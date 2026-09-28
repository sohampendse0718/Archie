import dagre from '@dagrejs/dagre';
import { Edge } from '@xyflow/react';
import { ArchNode } from '@/store/useDiagramStore';

/** Return the correct width & height for a node so dagre spaces them properly */
function getNodeDimensions(node: ArchNode): { width: number; height: number } {
  if (node.type === 'erdNode') {
    const erdType = (node.data as any)?.erdType ?? 'entity';
    switch (erdType) {
      case 'entity':
        return { width: 220, height: 72 };
      case 'weak_entity':
        return { width: 240, height: 90 };
      case 'relationship':
        return { width: 170, height: 170 };
      case 'identifying_relationship':
        return { width: 195, height: 195 };
      // All attribute variants are ovals — much smaller than the default
      default:
        return { width: 160, height: 56 };
    }
  }
  // Default for all other node types
  return { width: 250, height: 100 };
}

export const getLayoutedElements = (nodes: ArchNode[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();

  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isERD = nodes.some((n) => n.type === 'erdNode');

  dagreGraph.setGraph({
    rankdir: direction,
    // LR-ERD: more column spacing, tight vertical node gap
    // TB-other: standard vertical spacing
    ranksep: isERD ? (direction === 'LR' ? 120 : 80) : 100,
    nodesep: isERD ? (direction === 'LR' ? 35 : 28) : 50,
    marginx: 50,
    marginy: 50,
  });

  nodes.forEach((node) => {
    const { width, height } = getNodeDimensions(node);
    dagreGraph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const { width, height } = getNodeDimensions(node);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - width / 2,
        y: nodeWithPosition.y - height / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};
