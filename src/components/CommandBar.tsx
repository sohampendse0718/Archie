"use client";

import { SendHorizontal, Loader2, Paperclip, X } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { useDiagramStore } from '@/store/useDiagramStore';

export default function CommandBar() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

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
      setFiles([]);
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
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`bg-surface/90 backdrop-blur-md border ${isDragging ? 'border-purple-500 bg-purple-500/5' : 'border-border-c'} rounded-2xl p-2 shadow-2xl flex flex-col gap-2 focus-within:border-accent transition-colors`}
      >
        {/* File Previews */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 px-2 pt-1">
            {files.map((file, idx) => (
              <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-2 border border-border-c rounded-full text-xs text-muted">
                <span className="truncate max-w-[120px]">{file.name}</span>
                <button type="button" onClick={() => removeFile(idx)} className="hover:text-fg transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 mb-0.5 ml-0.5 text-muted hover:text-fg hover:bg-surface-2 rounded-xl transition-colors shrink-0"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input 
            type="file" 
            multiple 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
          />
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
            placeholder="Design a microservices backend..."
            className="w-full bg-transparent text-fg placeholder:text-muted resize-none outline-none py-3 px-2 min-h-[48px] max-h-[200px] overflow-y-auto leading-relaxed [&::-webkit-scrollbar]:hidden disabled:opacity-50"
            rows={1}
            style={{ scrollbarWidth: 'none' }}
          />
          <button 
            type="submit"
            disabled={(!inputValue.trim() && files.length === 0) || isGenerating}
            className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white rounded-xl shadow-lg hover:shadow-[0_0_15px_rgba(79,70,229,0.5)] transition-all shrink-0 flex items-center justify-center mb-0.5 mr-0.5 group"
            title="Generate"
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <SendHorizontal className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
