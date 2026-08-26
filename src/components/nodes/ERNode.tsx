import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { KeyRound, Link2 } from 'lucide-react';

export type ERAttribute = {
  name: string;
  type: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
};

export type ERNodeData = {
  label: string;
  description?: string;
  attributes: ERAttribute[];
};

const handleStyle = {
  width: 10,
  height: 10,
  background: 'var(--surface-2)',
  border: '2px solid var(--border-c)',
  transition: 'all 0.2s',
};

function ERNode({ data, selected }: { data: ERNodeData; selected?: boolean }) {
  return (
    <div
      className={cn(
        "relative w-[280px] bg-surface/95 border rounded-xl overflow-hidden transition-all duration-200",
        "shadow-xl",
        selected
          ? "border-violet-500/70 ring-2 ring-violet-500/30 shadow-[0_0_25px_rgba(139,92,246,0.3)]"
          : "border-border-c hover:border-violet-500/40 hover:shadow-[0_0_15px_rgba(139,92,246,0.15)]",
      )}
    >
      <Handle type="target" position={Position.Top} style={handleStyle}
        className="hover:!border-violet-500 hover:!bg-violet-500" />
      <Handle type="target" id="left" position={Position.Left} style={handleStyle}
        className="hover:!border-violet-500 hover:!bg-violet-500" />

      {/* Entity Header */}
      <div className="bg-gradient-to-r from-violet-600/20 via-purple-600/15 to-fuchsia-600/10 px-4 py-3 border-b border-violet-500/20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_6px_rgba(139,92,246,0.6)]" />
          <h3 className="font-bold text-fg text-sm tracking-tight">{data.label}</h3>
        </div>
        {data.description && (
          <p className="text-[10px] text-muted mt-1 line-clamp-1">{data.description}</p>
        )}
      </div>

      {/* Attributes Table */}
      <div className="flex flex-col">
        {(data.attributes || []).map((attr, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-xs border-b border-border-c/30 last:border-b-0",
              i % 2 === 0 ? 'bg-transparent' : 'bg-surface-2/20',
              attr.isPrimaryKey && 'bg-amber-500/5',
            )}
          >
            {/* PK / FK icon */}
            <div className="w-4 flex items-center justify-center shrink-0">
              {attr.isPrimaryKey ? (
                <KeyRound className="w-3 h-3 text-amber-400" />
              ) : attr.isForeignKey ? (
                <Link2 className="w-3 h-3 text-violet-400" />
              ) : (
                <span className="w-1 h-1 rounded-full bg-muted/30" />
              )}
            </div>

            {/* Column name */}
            <span className={cn(
              "font-medium flex-1 truncate",
              attr.isPrimaryKey ? 'text-amber-300' : 'text-fg',
            )}>
              {attr.name}
            </span>

            {/* Data type */}
            <span className="text-muted font-mono text-[10px] bg-surface-2/50 px-1.5 py-0.5 rounded">
              {attr.type}
            </span>

            {/* Badge */}
            {attr.isPrimaryKey && (
              <span className="text-[8px] font-bold text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded-full border border-amber-500/20">
                PK
              </span>
            )}
            {attr.isForeignKey && (
              <span className="text-[8px] font-bold text-violet-400 bg-violet-500/15 px-1.5 py-0.5 rounded-full border border-violet-500/20">
                FK
              </span>
            )}
          </div>
        ))}
        {(!data.attributes || data.attributes.length === 0) && (
          <div className="px-4 py-3 text-xs text-muted italic">No attributes defined</div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} style={handleStyle}
        className="hover:!border-violet-500 hover:!bg-violet-500" />
      <Handle type="source" id="right" position={Position.Right} style={handleStyle}
        className="hover:!border-violet-500 hover:!bg-violet-500" />
    </div>
  );
}

export default memo(ERNode);
