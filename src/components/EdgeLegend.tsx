import React from 'react';
import { useDiagramStore } from '@/store/useDiagramStore';

export default function EdgeLegend() {
  const nodes = useDiagramStore(state => state.nodes);

  if (!nodes || nodes.length === 0) {
    return null;
  }

  return (
    <div className="w-64 bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 shadow-xl backdrop-blur-sm">
      <h3 className="text-sm font-semibold text-zinc-100 mb-3">Connection Types</h3>
      <div className="flex flex-col gap-3">
        {/* Row 1: Solid Line */}
        <div className="flex items-center">
          <div className="w-8 h-[2px] bg-purple-500 rounded-full mr-3 shrink-0"></div>
          <div className="text-xs text-zinc-300">Synchronous / Direct</div>
        </div>
        {/* Row 2: Dotted Line */}
        <div className="flex items-center">
          <div className="w-8 h-[2px] border-b-2 border-dashed border-purple-500 mr-3 shrink-0"></div>
          <div className="text-xs text-zinc-300">Asynchronous / Stream</div>
        </div>
      </div>
    </div>
  );
}
