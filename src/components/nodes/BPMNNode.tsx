import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { Play, Square, Circle, X, Plus, CircleDot, User, Cog, FileCode } from 'lucide-react';

export type BPMNNodeData = {
  label: string;
  description?: string;
  shape: 'task' | 'event' | 'gateway';
  taskType?: 'user' | 'service' | 'script';
  eventType?: 'start' | 'end' | 'intermediate';
  gatewayType?: 'exclusive' | 'parallel' | 'inclusive';
};

const handleStyle = {
  width: 10,
  height: 10,
  background: 'var(--surface-2)',
  border: '2px solid var(--border-c)',
  transition: 'all 0.2s',
};

const taskIcons = { user: User, service: Cog, script: FileCode };
const eventIcons = { start: Play, end: Square, intermediate: Circle };
const gatewayIcons = { exclusive: X, parallel: Plus, inclusive: CircleDot };

function BPMNNode({ data, selected }: { data: BPMNNodeData; selected?: boolean }) {
  const isTask = data.shape === 'task';
  const isEvent = data.shape === 'event';
  const isGateway = data.shape === 'gateway';

  // Event colors
  const eventColors = {
    start: { ring: 'ring-emerald-500/40', border: 'border-emerald-500/50', accent: 'text-emerald-400', bg: 'bg-emerald-500/10', glow: 'shadow-[0_0_18px_rgba(16,185,129,0.25)]' },
    end: { ring: 'ring-rose-500/40', border: 'border-rose-500/50', accent: 'text-rose-400', bg: 'bg-rose-500/10', glow: 'shadow-[0_0_18px_rgba(244,63,94,0.25)]' },
    intermediate: { ring: 'ring-amber-500/40', border: 'border-amber-500/50', accent: 'text-amber-400', bg: 'bg-amber-500/10', glow: 'shadow-[0_0_18px_rgba(245,158,11,0.25)]' },
  };

  if (isEvent) {
    const evtType = data.eventType || 'start';
    const colors = eventColors[evtType];
    const EvtIcon = eventIcons[evtType];
    const size = evtType === 'end' ? 'w-[80px] h-[80px]' : 'w-[72px] h-[72px]';

    return (
      <div className="relative flex flex-col items-center gap-2">
        <Handle type="target" position={Position.Top} style={handleStyle}
          className="hover:!border-accent hover:!bg-accent" />
        <Handle type="target" id="left" position={Position.Left} style={handleStyle}
          className="hover:!border-accent hover:!bg-accent" />

        <div className={cn(
          "rounded-full flex items-center justify-center bg-surface/95 transition-all duration-200",
          size,
          colors.bg,
          evtType === 'end' ? 'border-[3px]' : 'border-2',
          colors.border,
          colors.glow,
          selected && `ring-2 ${colors.ring}`,
        )}>
          <EvtIcon className={cn("w-5 h-5", colors.accent)} />
        </div>

        <span className="text-xs font-semibold text-fg text-center max-w-[100px] leading-tight">
          {data.label}
        </span>

        <Handle type="source" position={Position.Bottom} style={handleStyle}
          className="hover:!border-accent hover:!bg-accent" />
        <Handle type="source" id="right" position={Position.Right} style={handleStyle}
          className="hover:!border-accent hover:!bg-accent" />
      </div>
    );
  }

  if (isGateway) {
    const gwType = data.gatewayType || 'exclusive';
    const GwIcon = gatewayIcons[gwType];

    return (
      <div className="relative flex flex-col items-center gap-2">
        <Handle type="target" position={Position.Top} style={{ ...handleStyle, zIndex: 10 }}
          className="hover:!border-accent hover:!bg-accent" />
        <Handle type="target" id="left" position={Position.Left} style={{ ...handleStyle, zIndex: 10 }}
          className="hover:!border-accent hover:!bg-accent" />

        {/* Diamond wrapper */}
        <div style={{ transform: 'rotate(45deg)' }}>
          <div className={cn(
            "w-[72px] h-[72px] bg-surface/95 border-2 border-purple-500/40 rounded-lg",
            "flex items-center justify-center transition-all duration-200",
            "shadow-[0_0_18px_rgba(168,85,247,0.2)]",
            selected && "ring-2 ring-purple-500/40 shadow-[0_0_25px_rgba(168,85,247,0.35)]",
          )}>
            <div style={{ transform: 'rotate(-45deg)' }}>
              <GwIcon className="w-5 h-5 text-purple-400" />
            </div>
          </div>
        </div>

        <span className="text-xs font-semibold text-fg text-center max-w-[120px] leading-tight mt-1">
          {data.label}
        </span>
        <span className="text-[9px] font-bold uppercase tracking-wider text-purple-400/80">
          {gwType}
        </span>

        <Handle type="source" position={Position.Bottom} style={{ ...handleStyle, zIndex: 10 }}
          className="hover:!border-accent hover:!bg-accent" />
        <Handle type="source" id="right" position={Position.Right} style={{ ...handleStyle, zIndex: 10 }}
          className="hover:!border-accent hover:!bg-accent" />
      </div>
    );
  }

  // Task (default)
  const tType = data.taskType || 'service';
  const TaskIcon = taskIcons[tType];

  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} style={handleStyle}
        className="hover:!border-accent hover:!bg-accent" />
      <Handle type="target" id="left" position={Position.Left} style={handleStyle}
        className="hover:!border-accent hover:!bg-accent" />

      <div className={cn(
        "w-[240px] bg-surface/95 border-2 border-blue-500/30 rounded-2xl overflow-hidden transition-all duration-200",
        "shadow-[0_0_15px_rgba(59,130,246,0.12)]",
        selected && "ring-2 ring-blue-500/40 shadow-[0_0_25px_rgba(59,130,246,0.3)]",
      )}>
        {/* Gradient accent bar */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500" />

        <div className="p-4 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 shrink-0">
            <TaskIcon className="w-4 h-4 text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-fg text-sm tracking-tight">{data.label}</h3>
            {data.description && (
              <p className="text-[11px] text-muted mt-1 line-clamp-2 leading-relaxed">{data.description}</p>
            )}
          </div>
        </div>

        <div className="px-4 pb-3 flex items-center justify-between">
          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-blue-400/70">
            {tType} task
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400/60" />
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} style={handleStyle}
        className="hover:!border-accent hover:!bg-accent" />
      <Handle type="source" id="right" position={Position.Right} style={handleStyle}
        className="hover:!border-accent hover:!bg-accent" />
    </div>
  );
}

export default memo(BPMNNode);
