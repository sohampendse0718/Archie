import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { User, Server, Database, Globe } from 'lucide-react';

export type SequenceNodeData = {
  label: string;
  description?: string;
  participantType: 'actor' | 'service' | 'database' | 'external';
};

const handleStyle = {
  width: 10,
  height: 10,
  background: 'var(--surface-2)',
  border: '2px solid var(--border-c)',
  transition: 'all 0.2s',
};

const participantConfig = {
  actor: {
    icon: User,
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    accent: 'text-sky-400',
    glow: 'shadow-[0_0_12px_rgba(14,165,233,0.15)]',
    selectedGlow: 'shadow-[0_0_20px_rgba(14,165,233,0.35)]',
    ringColor: 'ring-sky-500/40',
    iconBg: 'bg-sky-500/15 border-sky-500/25',
    gradient: 'from-sky-600/20 to-sky-600/5',
  },
  service: {
    icon: Server,
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    accent: 'text-emerald-400',
    glow: 'shadow-[0_0_12px_rgba(16,185,129,0.15)]',
    selectedGlow: 'shadow-[0_0_20px_rgba(16,185,129,0.35)]',
    ringColor: 'ring-emerald-500/40',
    iconBg: 'bg-emerald-500/15 border-emerald-500/25',
    gradient: 'from-emerald-600/20 to-emerald-600/5',
  },
  database: {
    icon: Database,
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    accent: 'text-amber-400',
    glow: 'shadow-[0_0_12px_rgba(245,158,11,0.15)]',
    selectedGlow: 'shadow-[0_0_20px_rgba(245,158,11,0.35)]',
    ringColor: 'ring-amber-500/40',
    iconBg: 'bg-amber-500/15 border-amber-500/25',
    gradient: 'from-amber-600/20 to-amber-600/5',
  },
  external: {
    icon: Globe,
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    accent: 'text-rose-400',
    glow: 'shadow-[0_0_12px_rgba(244,63,94,0.15)]',
    selectedGlow: 'shadow-[0_0_20px_rgba(244,63,94,0.35)]',
    ringColor: 'ring-rose-500/40',
    iconBg: 'bg-rose-500/15 border-rose-500/25',
    gradient: 'from-rose-600/20 to-rose-600/5',
  },
};

function SequenceNode({ data, selected }: { data: SequenceNodeData; selected?: boolean }) {
  const config = participantConfig[data.participantType] || participantConfig.service;
  const Icon = config.icon;

  return (
    <div className="relative flex flex-col items-center">
      <Handle type="target" position={Position.Top} style={handleStyle}
        className="hover:!border-accent hover:!bg-accent" />
      <Handle type="target" id="left" position={Position.Left} style={handleStyle}
        className="hover:!border-accent hover:!bg-accent" />

      {/* Participant Box */}
      <div
        className={cn(
          "w-[180px] bg-surface/95 border-2 rounded-xl overflow-hidden transition-all duration-200",
          config.border, config.glow,
          selected && `ring-2 ${config.ringColor} ${config.selectedGlow}`,
        )}
      >
        {/* Gradient header */}
        <div className={cn("bg-gradient-to-b py-4 flex flex-col items-center gap-2", config.gradient)}>
          <div className={cn("p-2.5 rounded-xl border", config.iconBg)}>
            <Icon className={cn("w-5 h-5", config.accent)} />
          </div>
          <h3 className="font-bold text-fg text-sm tracking-tight text-center px-3">
            {data.label}
          </h3>
          <span className={cn(
            "text-[9px] font-bold uppercase tracking-[0.15em] px-2.5 py-0.5 rounded-full border",
            config.iconBg, config.accent,
          )}>
            {data.participantType}
          </span>
        </div>

        {data.description && (
          <div className="px-3 py-2 border-t border-border-c/30">
            <p className="text-[10px] text-muted line-clamp-2 text-center leading-relaxed">
              {data.description}
            </p>
          </div>
        )}
      </div>

      {/* Lifeline dashed line */}
      <div className={cn(
        "w-[2px] h-16 border-l-2 border-dashed mt-0",
        data.participantType === 'actor' ? 'border-sky-500/30'
          : data.participantType === 'database' ? 'border-amber-500/30'
          : data.participantType === 'external' ? 'border-rose-500/30'
          : 'border-emerald-500/30',
      )} />

      <Handle type="source" position={Position.Bottom} style={{ ...handleStyle, bottom: -4 }}
        className="hover:!border-accent hover:!bg-accent" />
      <Handle type="source" id="right" position={Position.Right} style={handleStyle}
        className="hover:!border-accent hover:!bg-accent" />
    </div>
  );
}

export default memo(SequenceNode);
