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

  let scoreColor = 'text-fg';
  if (architectureScore >= 90) scoreColor = 'text-green-400';
  else if (architectureScore >= 75) scoreColor = 'text-yellow-400';
  else scoreColor = 'text-red-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setIsScoreModalOpen(false)}>
      <div 
        className="relative w-full max-w-2xl bg-surface/90 backdrop-blur-md border border-border-c rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border-c flex items-start justify-between bg-surface-2/50">
          <div className="flex gap-6 items-center">
            <div className={`text-6xl font-bold tracking-tighter ${scoreColor}`}>
              {architectureScore}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-fg mb-1">Architecture Health</h2>
              <p className="text-sm text-muted leading-relaxed max-w-md">{scoreReasoning}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsScoreModalOpen(false)}
            className="text-muted hover:text-fg hover:bg-surface-2 p-2 rounded-xl transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex flex-col gap-8">
          
          {strengths.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-fg uppercase tracking-wider mb-4">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Strengths
              </h3>
              <ul className="space-y-3">
                {strengths.map((s, i) => (
                  <li key={i} className="flex gap-3 text-fg text-sm leading-relaxed bg-green-500/5 border border-green-500/10 p-3 rounded-lg">
                    <span className="text-green-500/50 mt-0.5 shrink-0">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {weaknesses.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-fg uppercase tracking-wider mb-4">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                Vulnerabilities & Missing Layers
              </h3>
              <ul className="space-y-3">
                {weaknesses.map((w, i) => (
                  <li key={i} className="flex gap-3 text-fg text-sm leading-relaxed bg-yellow-500/5 border border-yellow-500/10 p-3 rounded-lg">
                    <span className="text-yellow-500/50 mt-0.5 shrink-0">•</span>
                    {w}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {tradeoffs.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-fg uppercase tracking-wider mb-4">
                <GitCompare className="w-4 h-4 text-cyan-500" />
                Engineering Trade-offs
              </h3>
              <ul className="space-y-3">
                {tradeoffs.map((t, i) => (
                  <li key={i} className="flex gap-3 text-fg text-sm leading-relaxed bg-cyan-500/5 border border-cyan-500/10 p-3 rounded-lg">
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
