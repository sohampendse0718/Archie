"use client";

import { SendHorizontal, Loader2 } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { useDiagramStore } from '@/store/useDiagramStore';

export default function CommandBar() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      // Restrict max height to 200px, otherwise allow scroll
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [inputValue]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isGenerating) return;

    setIsGenerating(true);
    useDiagramStore.getState().setArchitectureScore(null);
    useDiagramStore.getState().setScoreReasoning(null);
    useDiagramStore.getState().setAnalysisDetails({ strengths: [], weaknesses: [], tradeoffs: [] });
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: inputValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate architecture');
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
      
      useDiagramStore.getState().setNodes(reactFlowNodes);
      useDiagramStore.getState().setEdges(reactFlowEdges);
      useDiagramStore.getState().setArchitectureScore(data.architectureScore);
      useDiagramStore.getState().setScoreReasoning(data.scoreReasoning);
      useDiagramStore.getState().setAnalysisDetails({
        strengths: data.strengths,
        weaknesses: data.weaknesses,
        tradeoffs: data.tradeoffs,
      });
      useDiagramStore.getState().applyAutoLayout('TB');
      
      setInputValue('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl z-20 px-4">
      <form 
        onSubmit={handleSubmit}
        className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-2 shadow-2xl flex items-end gap-2 focus-within:border-zinc-700/80 transition-colors"
      >
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isGenerating}
          placeholder="Design a microservices backend..."
          className="w-full bg-transparent text-zinc-100 placeholder:text-zinc-500 resize-none outline-none py-3 px-4 min-h-[48px] max-h-[200px] overflow-y-auto leading-relaxed [&::-webkit-scrollbar]:hidden disabled:opacity-50"
          rows={1}
          style={{ scrollbarWidth: 'none' }}
        />
        <button 
          type="submit"
          disabled={!inputValue.trim() || isGenerating}
          className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white rounded-xl shadow-lg hover:shadow-[0_0_15px_rgba(79,70,229,0.5)] transition-all shrink-0 flex items-center justify-center mb-0.5 mr-0.5 group"
          title="Generate"
        >
          {isGenerating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <SendHorizontal className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          )}
        </button>
      </form>
    </div>
  );
}
