import dagre from '@dagrejs/dagre';
import { Edge } from '@xyflow/react';
import { ArchNode } from '@/store/useDiagramStore';

export const getLayoutedElements = (nodes: ArchNode[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 250, height: 100 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 250 / 2,
        y: nodeWithPosition.y - 100 / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};
