import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Layout, Server, Bot, Database, Sparkles, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ArchNodeData = {
  label: string;
  category: 'frontend' | 'backend' | 'ai' | 'database';
  description: string;
  icon: string;
};

const iconMap: Record<string, LucideIcon> = {
  Layout,
  Server,
  Bot,
  Database,
  Sparkles,
};

const categoryStyles = {
  frontend: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  backend: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  ai: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  database: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const handleStyle = {
  width: 12,
  height: 12,
  background: '#27272a',
  border: '2px solid #52525b',
  transition: 'all 0.2s',
};

function CustomArchNode({ data }: { data: ArchNodeData }) {
  const Icon = iconMap[data.icon] || Server;
  const catStyle = categoryStyles[data.category] || categoryStyles.backend;

  return (
    <div className="group relative w-[300px] bg-zinc-900/80 border border-zinc-800 backdrop-blur-md rounded-xl p-4 shadow-xl hover:border-zinc-600 transition-all duration-300 hover:shadow-zinc-500/10 hover:shadow-2xl">
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
