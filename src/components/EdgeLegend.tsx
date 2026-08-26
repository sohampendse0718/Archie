import React from 'react';
import { useDiagramStore } from '@/store/useDiagramStore';

export default function EdgeLegend() {
  const nodes = useDiagramStore(state => state.nodes);

  if (!nodes || nodes.length === 0) {
    return null;
  }

  return (
    <div className="w-64 bg-surface-2/90 border border-border-c rounded-xl p-3 shadow-xl backdrop-blur-sm">
      <h3 className="text-sm font-semibold text-fg mb-3">Connection Types</h3>
      <div className="flex flex-col gap-3">
        {/* Row 1: Solid Line */}
        <div className="flex items-center">
          <div className="w-8 h-[2px] bg-purple-500 rounded-full mr-3 shrink-0"></div>
          <div className="text-xs text-muted">Synchronous / Direct</div>
        </div>
        {/* Row 2: Dotted Line */}
        <div className="flex items-center">
          <div className="w-8 h-[2px] border-b-2 border-dashed border-purple-500 mr-3 shrink-0"></div>
          <div className="text-xs text-muted">Asynchronous / Stream</div>
        </div>
      </div>
    </div>
  );
}
