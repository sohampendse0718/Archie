"use client";

import { useDiagramStore } from '@/store/useDiagramStore';
import { X } from 'lucide-react';

export default function InspectorPanel() {
  const selectedNode = useDiagramStore(state => state.selectedNode);
  const setSelectedNode = useDiagramStore(state => state.setSelectedNode);

  if (!selectedNode) return null;

  return (
    <div className="absolute right-4 top-20 w-80 bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-xl shadow-2xl z-20 flex flex-col overflow-hidden text-sm">
      <div className="flex items-center justify-between p-4 border-b border-zinc-800/60 bg-zinc-800/30">
        <div>
          <h2 className="text-zinc-100 font-semibold">{selectedNode.data.label}</h2>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mt-1 inline-block capitalize">
            {selectedNode.data.category}
          </span>
        </div>
        <button 
          onClick={() => setSelectedNode(null)}
          className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 p-1.5 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-4 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-12rem)]">
        {selectedNode.data.description && (
          <div>
            <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Description</h3>
            <p className="text-zinc-300 leading-relaxed">{selectedNode.data.description}</p>
          </div>
        )}
        
        {selectedNode.data.purpose && (
          <div>
            <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Purpose</h3>
            <p className="text-zinc-300 leading-relaxed">{selectedNode.data.purpose}</p>
          </div>
        )}
        
        {selectedNode.data.bottleneckRisk && (
          <div>
            <h3 className="text-xs font-medium text-red-500/80 uppercase tracking-wider mb-1">Bottleneck Risk</h3>
            <p className="text-red-400/90 leading-relaxed bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
              {selectedNode.data.bottleneckRisk}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
