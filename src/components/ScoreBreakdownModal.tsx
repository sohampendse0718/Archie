"use client";

import { useDiagramStore } from '@/store/useDiagramStore';
import { X, CheckCircle2, AlertTriangle, GitCompare } from 'lucide-react';

export default function ScoreBreakdownModal() {
  const {
    isScoreModalOpen,
    setIsScoreModalOpen,
    architectureScore,
    scoreReasoning,
    strengths,
    weaknesses,
    tradeoffs,
  } = useDiagramStore();

  if (!isScoreModalOpen || architectureScore === null) return null;

  let scoreColor = 'text-zinc-100';
  if (architectureScore >= 90) scoreColor = 'text-green-400';
  else if (architectureScore >= 75) scoreColor = 'text-yellow-400';
  else scoreColor = 'text-red-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setIsScoreModalOpen(false)}>
      <div 
        className="relative w-full max-w-2xl bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-800/60 flex items-start justify-between bg-zinc-800/30">
          <div className="flex gap-6 items-center">
            <div className={`text-6xl font-bold tracking-tighter ${scoreColor}`}>
              {architectureScore}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-zinc-100 mb-1">Architecture Health</h2>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-md">{scoreReasoning}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsScoreModalOpen(false)}
            className="text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700/50 p-2 rounded-xl transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex flex-col gap-8">
          
          {strengths.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Strengths
              </h3>
              <ul className="space-y-3">
                {strengths.map((s, i) => (
                  <li key={i} className="flex gap-3 text-zinc-300 text-sm leading-relaxed bg-green-500/5 border border-green-500/10 p-3 rounded-lg">
                    <span className="text-green-500/50 mt-0.5 shrink-0">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {weaknesses.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                Vulnerabilities & Missing Layers
              </h3>
              <ul className="space-y-3">
                {weaknesses.map((w, i) => (
                  <li key={i} className="flex gap-3 text-zinc-300 text-sm leading-relaxed bg-yellow-500/5 border border-yellow-500/10 p-3 rounded-lg">
                    <span className="text-yellow-500/50 mt-0.5 shrink-0">•</span>
                    {w}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {tradeoffs.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4">
                <GitCompare className="w-4 h-4 text-cyan-500" />
                Engineering Trade-offs
              </h3>
              <ul className="space-y-3">
                {tradeoffs.map((t, i) => (
                  <li key={i} className="flex gap-3 text-zinc-300 text-sm leading-relaxed bg-cyan-500/5 border border-cyan-500/10 p-3 rounded-lg">
                    <span className="text-cyan-500/50 mt-0.5 shrink-0">•</span>
                    {t}
                  </li>
                ))}
              </ul>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}
