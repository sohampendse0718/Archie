import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Layout, Server, Bot, Database, Sparkles, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ArchNodeData = {
  label: string;
  category: string; 
  description: string;
  icon?: string;
  purpose?: string;
  bottleneckRisk?: string;
};

const iconMap: Record<string, LucideIcon> = {
  Layout,
  Server,
  Bot,
  Database,
  Sparkles,
};

const categoryStyles: Record<string, string> = {
  frontend: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  backend: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  ai: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  database: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  infrastructure: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
};

const handleStyle = {
  width: 12,
  height: 12,
  background: '#27272a',
  border: '2px solid #52525b',
  transition: 'all 0.2s',
};

function CustomArchNode({ data, selected }: { data: ArchNodeData; selected?: boolean }) {
  const Icon = (data.icon && iconMap[data.icon]) || Server;
  const catStyle = categoryStyles[data.category] || categoryStyles.backend;

  return (
    <div
      className={cn(
        "group relative w-[300px] bg-zinc-900/90 border backdrop-blur-md rounded-xl p-4 shadow-xl transition-all duration-200",
        selected
          ? "border-blue-500 ring-2 ring-blue-500/40 shadow-[0_0_25px_rgba(59,130,246,0.35)] scale-[1.02]"
          : "border-zinc-800 hover:border-zinc-600 hover:shadow-2xl hover:shadow-zinc-500/10"
      )}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        style={handleStyle} 
        className="hover:!border-zinc-300 hover:!bg-zinc-100 hover:shadow-[0_0_12px_rgba(255,255,255,0.6)]"
      />
      <Handle 
        type="target" 
        id="left" 
        position={Position.Left} 
        style={handleStyle} 
        className="hover:!border-zinc-300 hover:!bg-zinc-100 hover:shadow-[0_0_12px_rgba(255,255,255,0.6)]"
      />
      
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={cn("p-2.5 rounded-xl border shadow-sm", catStyle)}>
            <Icon size={22} className="opacity-90" />
          </div>
          <div>
            <h3 className="font-semibold text-zinc-100 text-sm tracking-tight">{data.label}</h3>
            <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{data.description}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-zinc-800/60 pt-3">
        <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-500">
          {data.category}
        </span>
        <div className="flex items-center gap-2 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span className="text-[10px] font-medium text-emerald-400 tracking-wide">Active</span>
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        style={handleStyle} 
        className="hover:!border-zinc-300 hover:!bg-zinc-100 hover:shadow-[0_0_12px_rgba(255,255,255,0.6)]"
      />
      <Handle 
        type="source" 
        id="right" 
        position={Position.Right} 
        style={handleStyle} 
        className="hover:!border-zinc-300 hover:!bg-zinc-100 hover:shadow-[0_0_12px_rgba(255,255,255,0.6)]"
      />
    </div>
  );
}

export default memo(CustomArchNode);