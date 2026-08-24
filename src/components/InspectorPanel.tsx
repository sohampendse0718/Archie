"use client";

import { useDiagramStore } from '@/store/useDiagramStore';
import { X, AlertTriangle } from 'lucide-react';

export default function InspectorPanel() {
  const selectedNode = useDiagramStore(state => state.selectedNode);
  const setSelectedNode = useDiagramStore(state => state.setSelectedNode);
  const failedNodes = useDiagramStore(state => state.failedNodes);
  const toggleNodeOutage = useDiagramStore(state => state.toggleNodeOutage);

  if (!selectedNode) return null;

  const isFailed = failedNodes.includes(selectedNode.id);

  return (
    <div className="absolute right-4 top-20 w-80 bg-surface/90 backdrop-blur-md border border-border-c rounded-xl shadow-2xl z-20 flex flex-col overflow-hidden text-sm">
      <div className="flex items-center justify-between p-4 border-b border-border-c bg-surface-2/50">
        <div>
          <h2 className="text-fg font-semibold">{selectedNode.data.label}</h2>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mt-1 inline-block capitalize">
            {selectedNode.data.category}
          </span>
        </div>
        <button 
          onClick={() => setSelectedNode(null)}
          className="text-muted hover:text-fg hover:bg-surface-2 p-1.5 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-4 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-12rem)]">
        {selectedNode.data.description && (
          <div>
            <h3 className="text-xs font-medium text-dim uppercase tracking-wider mb-1">Description</h3>
            <p className="text-muted leading-relaxed">{selectedNode.data.description}</p>
          </div>
        )}
        
        {selectedNode.data.purpose && (
          <div>
            <h3 className="text-xs font-medium text-dim uppercase tracking-wider mb-1">Purpose</h3>
            <p className="text-muted leading-relaxed">{selectedNode.data.purpose}</p>
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

      <div className="p-4 border-t border-border-c bg-surface-2/50">
        <button
          onClick={() => toggleNodeOutage(selectedNode.id)}
          className={`w-full py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
            isFailed
              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-rose-500/10 text-rose-500 border border-rose-500/30 hover:bg-rose-500/20 hover:shadow-[0_0_15px_rgba(244,63,94,0.15)]'
          }`}
        >
          {!isFailed && <AlertTriangle className="w-4 h-4" />}
          {isFailed ? 'Restore Service' : 'Simulate Outage'}
        </button>
      </div>
    </div>
  );
}
