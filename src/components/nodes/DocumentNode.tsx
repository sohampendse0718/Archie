import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { FileText, Heading1, Heading2, Heading3 } from 'lucide-react';

export type DocumentNodeData = {
  label: string;
  description?: string;
  level: number; // 1 = top-level section, 2 = sub-section, 3 = detail
};

const handleStyle = {
  width: 10,
  height: 10,
  background: 'var(--surface-2)',
  border: '2px solid var(--border-c)',
  transition: 'all 0.2s',
};

const levelConfig = {
  1: {
    icon: Heading1,
    width: 'w-[280px]',
    headerBg: 'bg-gradient-to-r from-slate-500/15 via-slate-400/10 to-slate-500/5',
    border: 'border-slate-400/30',
    glow: 'shadow-[0_0_15px_rgba(148,163,184,0.12)]',
    selectedGlow: 'shadow-[0_0_25px_rgba(148,163,184,0.25)]',
    ringColor: 'ring-slate-400/40',
    accent: 'text-slate-300',
    tagBg: 'bg-slate-500/15 border-slate-500/20',
    tag: 'Section',
    textSize: 'text-base',
  },
  2: {
    icon: Heading2,
    width: 'w-[250px]',
    headerBg: 'bg-gradient-to-r from-stone-500/12 via-stone-400/8 to-stone-500/4',
    border: 'border-stone-400/25',
    glow: 'shadow-[0_0_12px_rgba(168,162,158,0.1)]',
    selectedGlow: 'shadow-[0_0_20px_rgba(168,162,158,0.22)]',
    ringColor: 'ring-stone-400/35',
    accent: 'text-stone-400',
    tagBg: 'bg-stone-500/12 border-stone-500/18',
    tag: 'Sub-section',
    textSize: 'text-sm',
  },
  3: {
    icon: Heading3,
    width: 'w-[220px]',
    headerBg: 'bg-gradient-to-r from-zinc-500/10 via-zinc-400/6 to-zinc-500/3',
    border: 'border-zinc-500/20',
    glow: 'shadow-[0_0_8px_rgba(113,113,122,0.08)]',
    selectedGlow: 'shadow-[0_0_15px_rgba(113,113,122,0.18)]',
    ringColor: 'ring-zinc-400/30',
    accent: 'text-zinc-400',
    tagBg: 'bg-zinc-500/10 border-zinc-500/15',
    tag: 'Detail',
    textSize: 'text-xs',
  },
};

function DocumentNode({ data, selected }: { data: DocumentNodeData; selected?: boolean }) {
  const level = Math.max(1, Math.min(3, data.level || 1)) as 1 | 2 | 3;
  const config = levelConfig[level];
  const Icon = config.icon;

  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} style={handleStyle}
        className="hover:!border-accent hover:!bg-accent" />
      <Handle type="target" id="left" position={Position.Left} style={handleStyle}
        className="hover:!border-accent hover:!bg-accent" />

      <div
        className={cn(
          "bg-surface/95 border rounded-xl overflow-hidden transition-all duration-200",
          config.width, config.border, config.glow,
          selected && `ring-2 ${config.ringColor} ${config.selectedGlow}`,
        )}
      >
        {/* Header */}
        <div className={cn("px-4 py-3 flex items-center gap-3", config.headerBg)}>
          <div className={cn("p-1.5 rounded-lg border", config.tagBg)}>
            <Icon className={cn("w-4 h-4", config.accent)} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={cn("font-bold text-fg tracking-tight truncate", config.textSize)}>
              {data.label}
            </h3>
            <span className={cn(
              "text-[8px] font-bold uppercase tracking-[0.15em] mt-0.5 inline-block",
              config.accent,
            )}>
              {config.tag}
            </span>
          </div>
          <FileText className={cn("w-4 h-4 shrink-0 opacity-30", config.accent)} />
        </div>

        {/* Content */}
        {data.description && (
          <div className="px-4 py-3 border-t border-border-c/20">
            <p className="text-[11px] text-muted leading-relaxed line-clamp-3">
              {data.description}
            </p>
          </div>
        )}

        {/* Page-curl decoration */}
        <div className="absolute bottom-0 right-0 w-4 h-4 overflow-hidden">
          <div className={cn(
            "absolute -bottom-2 -right-2 w-6 h-6 rotate-45 border-t",
            config.border, "bg-surface-2/50",
          )} />
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} style={handleStyle}
        className="hover:!border-accent hover:!bg-accent" />
      <Handle type="source" id="right" position={Position.Right} style={handleStyle}
        className="hover:!border-accent hover:!bg-accent" />
    </div>
  );
}

export default memo(DocumentNode);
