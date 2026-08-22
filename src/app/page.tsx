"use client";

import Canvas from '@/components/Canvas';
import CommandBar from '@/components/CommandBar';
import { Save, Download, Sparkles, Layout } from 'lucide-react';
import { useDiagramStore } from '@/store/useDiagramStore';

export default function Home() {
  const applyAutoLayout = useDiagramStore((state) => state.applyAutoLayout);

  return (
    <div className="flex flex-col h-screen w-full bg-[#09090b] overflow-hidden">
      {/* Floating Topbar / Header */}
      <header className="h-16 shrink-0 border-b border-zinc-800/60 bg-zinc-900/50 backdrop-blur-md px-6 flex items-center justify-between z-10 relative shadow-md">
        
        {/* Title Area */}
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-3">
            <h1 className="text-zinc-100 font-semibold tracking-tight text-lg">Archie</h1>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_8px_rgba(99,102,241,0.2)]">
              Phase 1 Canvas
            </span>
          </div>
        </div>

        {/* Actions Area */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => applyAutoLayout('TB')}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-zinc-300 bg-zinc-800/40 hover:bg-zinc-800 hover:text-zinc-100 rounded-lg border border-zinc-700/50 transition-colors shadow-sm"
          >
            <Layout className="w-4 h-4" />
            Auto Layout
          </button>
          
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-zinc-300 bg-zinc-800/40 hover:bg-zinc-800 hover:text-zinc-100 rounded-lg border border-zinc-700/50 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
          
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-zinc-300 bg-zinc-800/40 hover:bg-zinc-800 hover:text-zinc-100 rounded-lg border border-zinc-700/50 transition-colors shadow-sm">
            <Save className="w-4 h-4" />
            Save
          </button>

          <button className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-[0_0_15px_rgba(79,70,229,0.4)] hover:shadow-[0_0_20px_rgba(79,70,229,0.6)] transition-all ml-2 border border-indigo-500/50">
            <Sparkles className="w-4 h-4" />
            Generate Architecture
          </button>
        </div>
      </header>

      {/* Main Canvas Area */}
      <main className="flex-1 w-full relative">
        <Canvas />
        <CommandBar />
      </main>
    </div>
  );
}
