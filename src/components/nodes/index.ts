import type { NodeTypes } from '@xyflow/react';
import CustomArchNode from './CustomArchNode';
import FlowchartNode from './FlowchartNode';
import ERNode from './ERNode';
import SequenceNode from './SequenceNode';
import BPMNNode from './BPMNNode';
import ERDNode from './ERDNode';

export const nodeTypes: NodeTypes = {
  customArch: CustomArchNode,
  flowchart: FlowchartNode,
  erEntity: ERNode,
  sequence: SequenceNode,
  bpmn: BPMNNode,
  erdNode: ERDNode,
};
