"use client";

import { useDiagramStore } from '@/store/useDiagramStore';
import { X, AlertTriangle, Edit2, Sparkles, Check, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function InspectorPanel() {
  const selectedNode = useDiagramStore(state => state.selectedNode);
  const setSelectedNode = useDiagramStore(state => state.setSelectedNode);
  const failedNodes = useDiagramStore(state => state.failedNodes);
  const toggleNodeOutage = useDiagramStore(state => state.toggleNodeOutage);
  const updateNodeData = useDiagramStore(state => state.updateNodeData);
  
  const nodes = useDiagramStore(state => state.nodes);
  const edges = useDiagramStore(state => state.edges);
  const setNodes = useDiagramStore(state => state.setNodes);
  const setEdges = useDiagramStore(state => state.setEdges);
  const setArchitectureScore = useDiagramStore(state => state.setArchitectureScore);
  const setScoreReasoning = useDiagramStore(state => state.setScoreReasoning);
  const setAnalysisDetails = useDiagramStore(state => state.setAnalysisDetails);
  const applyAutoLayout = useDiagramStore(state => state.applyAutoLayout);

  const [editMode, setEditMode] = useState<'view' | 'manual' | 'ai'>('view');
  
  // Manual edit states
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState('backend');
  const [description, setDescription] = useState('');
  const [purpose, setPurpose] = useState('');
  const [bottleneckRisk, setBottleneckRisk] = useState('');

  // AI edit states
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Sync state when selectedNode changes
  useEffect(() => {
    setEditMode('view');
    setAiPrompt('');
    setAiError(null);
    if (selectedNode) {
      setLabel(selectedNode.data.label || '');
      setCategory(selectedNode.data.category || 'backend');
      setDescription(selectedNode.data.description || '');
      setPurpose(selectedNode.data.purpose || '');
      setBottleneckRisk(selectedNode.data.bottleneckRisk || '');
    }
  }, [selectedNode?.id]);

  if (!selectedNode) return null;

  const isFailed = failedNodes.includes(selectedNode.id);

  const handleManualSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateNodeData(selectedNode.id, {
      label,
      category,
      description,
      purpose,
      bottleneckRisk: bottleneckRisk.trim() || undefined,
    });
    setEditMode('view');
  };

  const handleAiRefine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setAiError(null);

    try {
      const response = await fetch('/api/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes,
          edges,
          focusedNodeId: selectedNode.id,
          instruction: aiPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refine architecture');
      }

      const data = await response.json();

      const reactFlowNodes = data.nodes.map((node: any) => ({
        id: node.id,
        type: 'customArch',
        position: { x: 0, y: 0 },
        data: {
          label: node.label,
          category: node.category,
          description: node.description,
          icon: node.icon,
          purpose: node.purpose,
          bottleneckRisk: node.bottleneckRisk,
        },
      }));

      const reactFlowEdges = data.edges.map((edge: any) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        animated: edge.animated !== undefined ? edge.animated : true,
        label: edge.label,
      }));

      // Update state
      setNodes(reactFlowNodes);
      setEdges(reactFlowEdges);
      setArchitectureScore(data.architectureScore);
      setScoreReasoning(data.scoreReasoning);
      setAnalysisDetails({
        strengths: data.strengths,
        weaknesses: data.weaknesses,
        tradeoffs: data.tradeoffs,
      });

      // Apply auto layout to position newly generated nodes
      applyAutoLayout('TB');

      // Check if our currently selected node still exists in updated list
      const updatedNode = reactFlowNodes.find((n: any) => n.id === selectedNode.id);
      if (updatedNode) {
        setSelectedNode(updatedNode);
      } else {
        setSelectedNode(null);
      }
      setEditMode('view');
      setAiPrompt('');
    } catch (err: unknown) {
      console.error(err);
      setAiError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="absolute right-4 top-20 w-80 bg-surface/95 backdrop-blur-xl border border-border-c rounded-xl shadow-2xl z-20 flex flex-col overflow-hidden text-sm transition-all duration-300">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between p-4 border-b border-border-c bg-surface-2/50">
        {editMode === 'view' ? (
          <div>
            <h2 className="text-fg font-semibold tracking-tight leading-snug">{selectedNode.data.label}</h2>
            <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mt-1.5 inline-block capitalize">
              {selectedNode.data.category}
            </span>
          </div>
        ) : (
          <div>
            <h2 className="text-fg font-semibold tracking-tight">
              {editMode === 'manual' ? 'Edit Details' : 'Refine with AI'}
            </h2>
            <p className="text-[11px] text-muted mt-0.5">
              {editMode === 'manual' ? 'Modify this component manually' : 'AI will rewrite the diagram based on your prompt'}
            </p>
          </div>
        )}
        <button 
          onClick={() => {
            if (!isGenerating) setSelectedNode(null);
          }}
          disabled={isGenerating}
          className="text-muted hover:text-fg hover:bg-surface-2 p-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* ── CONTENT BODY ── */}
      <div className="p-4 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-16rem)]">
        {editMode === 'view' && (
          <>
            {selectedNode.data.description && (
              <div>
                <h3 className="text-[10px] font-bold text-dim uppercase tracking-wider mb-1">Description</h3>
                <p className="text-muted leading-relaxed">{selectedNode.data.description}</p>
              </div>
            )}
            
            {selectedNode.data.purpose && (
              <div>
                <h3 className="text-[10px] font-bold text-dim uppercase tracking-wider mb-1">Purpose</h3>
                <p className="text-muted leading-relaxed">{selectedNode.data.purpose}</p>
              </div>
            )}
            
            {selectedNode.data.bottleneckRisk && (
              <div>
                <h3 className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">Bottleneck Risk</h3>
                <p className="text-red-400/90 leading-relaxed bg-red-500/5 border border-red-500/10 p-2.5 rounded-lg mt-1 text-xs">
                  {selectedNode.data.bottleneckRisk}
                </p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex gap-2 pt-2 border-t border-border-c/50 mt-2">
              <button
                onClick={() => setEditMode('manual')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/60 rounded-lg text-zinc-300 hover:text-zinc-100 font-medium text-xs transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                onClick={() => setEditMode('ai')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-650/10 hover:bg-indigo-650/20 border border-indigo-500/20 hover:border-indigo-500/45 rounded-lg text-indigo-400 hover:text-indigo-300 font-medium text-xs transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI Fix
              </button>
            </div>
          </>
        )}

        {editMode === 'manual' && (
          <form id="node-edit-form" onSubmit={handleManualSave} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Component Name</label>
              <input
                type="text"
                required
                value={label}
                onChange={e => setLabel(e.target.value)}
                className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-accent rounded-lg p-2.5 text-fg outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-accent rounded-lg p-2.5 text-fg outline-none transition-colors capitalize"
              >
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
                <option value="database">Database</option>
                <option value="ai">AI</option>
                <option value="infrastructure">Infrastructure</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Description</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-accent rounded-lg p-2.5 text-fg outline-none transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Purpose</label>
              <textarea
                required
                rows={2}
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
                className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-accent rounded-lg p-2.5 text-fg outline-none transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Bottleneck Risk (Optional)</label>
              <textarea
                rows={2}
                value={bottleneckRisk}
                onChange={e => setBottleneckRisk(e.target.value)}
                placeholder="No serious bottleneck risk"
                className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-accent rounded-lg p-2.5 text-fg outline-none transition-colors resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditMode('view')}
                className="flex-1 py-2 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors flex items-center justify-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                Save
              </button>
            </div>
          </form>
        )}

        {editMode === 'ai' && (
          <form onSubmit={handleAiRefine} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Instruction for AI
              </label>
              <textarea
                required
                rows={4}
                disabled={isGenerating}
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="e.g. Add an ElastiCache layer in front of this, or convert this MySQL db into an RDS Aurora Multi-AZ setup."
                className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-accent rounded-lg p-2.5 text-fg outline-none transition-colors resize-none disabled:opacity-50"
              />
            </div>

            {aiError && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-2.5 rounded-lg text-xs">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{aiError}</span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                disabled={isGenerating}
                onClick={() => setEditMode('view')}
                className="flex-1 py-2 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-55"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isGenerating || !aiPrompt.trim()}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors flex items-center justify-center gap-1.5 disabled:opacity-55"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Refining...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Ask AI
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── FOOTER ACTIONS (Outage Simulation) ── */}
      {editMode === 'view' && (
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
      )}
    </div>
  );
}

