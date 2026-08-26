import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '@/lib/utils';

export type FlowchartNodeData = {
  label: string;
  description?: string;
  shape: 'process' | 'decision' | 'terminal' | 'io';
};

const handleStyle = {
  width: 10,
  height: 10,
  background: 'var(--surface-2)',
  border: '2px solid var(--border-c)',
  transition: 'all 0.2s',
};

const shapeConfig = {
  process: {
    bg: 'bg-blue-500/8',
    border: 'border-blue-500/30',
    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]',
    selectedGlow: 'shadow-[0_0_25px_rgba(59,130,246,0.35)]',
    accent: 'text-blue-400',
    accentBg: 'bg-blue-500/15',
    labelColor: 'text-blue-100',
    tag: 'Process',
    rounded: 'rounded-xl',
  },
  decision: {
    bg: 'bg-amber-500/8',
    border: 'border-amber-500/30',
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    selectedGlow: 'shadow-[0_0_25px_rgba(245,158,11,0.35)]',
    accent: 'text-amber-400',
    accentBg: 'bg-amber-500/15',
    labelColor: 'text-amber-100',
    tag: 'Decision',
    rounded: 'rounded-xl',
  },
  terminal: {
    bg: 'bg-emerald-500/8',
    border: 'border-emerald-500/30',
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]',
    selectedGlow: 'shadow-[0_0_25px_rgba(16,185,129,0.35)]',
    accent: 'text-emerald-400',
    accentBg: 'bg-emerald-500/15',
    labelColor: 'text-emerald-100',
    tag: 'Start / End',
    rounded: 'rounded-full',
  },
  io: {
    bg: 'bg-cyan-500/8',
    border: 'border-cyan-500/30',
    glow: 'shadow-[0_0_15px_rgba(6,182,212,0.15)]',
    selectedGlow: 'shadow-[0_0_25px_rgba(6,182,212,0.35)]',
    accent: 'text-cyan-400',
    accentBg: 'bg-cyan-500/15',
    labelColor: 'text-cyan-100',
    tag: 'Input / Output',
    rounded: 'rounded-xl',
  },
};

function FlowchartNode({ data, selected }: { data: FlowchartNodeData; selected?: boolean }) {
  const config = shapeConfig[data.shape] || shapeConfig.process;
  const isDiamond = data.shape === 'decision';
  const isIO = data.shape === 'io';
  const isTerminal = data.shape === 'terminal';

  return (
    <div className="relative">
      {/* Handles — always axis-aligned regardless of shape transform */}
      <Handle type="target" position={Position.Top} style={{ ...handleStyle, zIndex: 10 }}
        className="hover:!border-accent hover:!bg-accent" />
      <Handle type="target" id="left" position={Position.Left} style={{ ...handleStyle, zIndex: 10 }}
        className="hover:!border-accent hover:!bg-accent" />

      {/* Outer wrapper for diamond rotation */}
      <div
        className={cn("transition-transform duration-200")}
        style={isDiamond ? { transform: 'rotate(45deg)' } : isIO ? { transform: 'skewX(-12deg)' } : undefined}
      >
        <div
          className={cn(
            "relative bg-surface/90 border-2 transition-all duration-200 overflow-hidden",
            config.border,
            config.glow,
            isDiamond ? 'rounded-xl w-[160px] h-[160px] flex items-center justify-center'
              : isTerminal ? 'rounded-full px-8 py-5 min-w-[200px] flex items-center justify-center'
              : 'rounded-xl px-5 py-4 min-w-[220px]',
            selected && `ring-2 ring-offset-1 ring-offset-transparent ${config.selectedGlow}`,
            selected && (data.shape === 'decision' ? 'ring-amber-500/50' : data.shape === 'terminal' ? 'ring-emerald-500/50' : data.shape === 'io' ? 'ring-cyan-500/50' : 'ring-blue-500/50'),
          )}
        >
          {/* Gradient top accent line */}
          <div className={cn(
            "absolute top-0 left-0 right-0 h-[2px]",
            data.shape === 'decision' ? 'bg-gradient-to-r from-amber-500/0 via-amber-500/80 to-amber-500/0'
              : data.shape === 'terminal' ? 'bg-gradient-to-r from-emerald-500/0 via-emerald-500/80 to-emerald-500/0'
              : data.shape === 'io' ? 'bg-gradient-to-r from-cyan-500/0 via-cyan-500/80 to-cyan-500/0'
              : 'bg-gradient-to-r from-blue-500/0 via-blue-500/80 to-blue-500/0',
          )} />

          {/* Inner content — counter-rotate for diamond, counter-skew for IO */}
          <div
            className={cn(
              "flex flex-col items-center text-center gap-1",
              isDiamond && "p-2",
            )}
            style={isDiamond ? { transform: 'rotate(-45deg)' } : isIO ? { transform: 'skewX(12deg)' } : undefined}
          >
            {/* Shape tag */}
            <span className={cn(
              "text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full border mb-1",
              config.accentBg, config.accent,
              data.shape === 'decision' ? 'border-amber-500/25'
                : data.shape === 'terminal' ? 'border-emerald-500/25'
                : data.shape === 'io' ? 'border-cyan-500/25'
                : 'border-blue-500/25',
            )}>
              {config.tag}
            </span>

            <h3 className={cn("font-semibold text-fg text-sm tracking-tight leading-snug", isDiamond && "text-xs")}>
              {data.label}
            </h3>
            {data.description && !isDiamond && (
              <p className="text-[11px] text-muted mt-0.5 line-clamp-2 leading-relaxed max-w-[180px]">
                {data.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ ...handleStyle, zIndex: 10 }}
        className="hover:!border-accent hover:!bg-accent" />
      <Handle type="source" id="right" position={Position.Right} style={{ ...handleStyle, zIndex: 10 }}
        className="hover:!border-accent hover:!bg-accent" />
    </div>
  );
}

export default memo(FlowchartNode);
