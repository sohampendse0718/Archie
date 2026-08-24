"use client";

import { Layout, Server, Bot, Database, Box } from 'lucide-react';
import { cn } from '@/lib/utils';

const nodeTypes = [
  { type: 'frontend', label: 'Frontend', icon: Layout, style: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { type: 'backend', label: 'Backend', icon: Server, style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { type: 'database', label: 'Database', icon: Database, style: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { type: 'infrastructure', label: 'Infrastructure', icon: Box, style: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  { type: 'ai', label: 'AI Model', icon: Bot, style: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
];

export default function Sidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="absolute left-4 top-20 w-56 bg-surface/95 backdrop-blur-xl border border-border-c rounded-xl shadow-2xl z-20 flex flex-col overflow-hidden text-sm transition-all duration-300">
      <div className="p-4 border-b border-border-c bg-surface-2/50">
        <h2 className="text-fg font-semibold tracking-tight">Components</h2>
        <p className="text-[11px] text-muted mt-0.5">Drag and drop to build</p>
      </div>
      
      <div className="p-3 flex flex-col gap-2">
        {nodeTypes.map((nt) => {
          const Icon = nt.icon;
          return (
            <div
              key={nt.type}
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg border cursor-grab active:cursor-grabbing hover:bg-surface-2 transition-colors",
                "border-border-c hover:border-accent/50"
              )}
              onDragStart={(event) => onDragStart(event, nt.type)}
              draggable
            >
              <div className={cn("p-1.5 rounded-lg border", nt.style)}>
                <Icon size={16} />
              </div>
              <span className="font-medium text-fg text-sm">{nt.label}</span>
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-border-c/50 bg-surface-2/30">
        <p className="text-[10px] text-muted leading-tight">
          <strong className="text-zinc-300 font-semibold">Tip:</strong> Hover over a component and drag from the small dots on its edges to create wires between components.
        </p>
      </div>
    </aside>
  );
}
