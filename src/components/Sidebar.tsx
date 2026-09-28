"use client";

import {
  Layout, Server, Bot, Database, Box,
  GitBranch, Diamond, Circle, ArrowRightLeft,
  Table2, User, Globe, Network,
  PlayCircle, StopCircle, CheckSquare, Cog, GitMerge,
  Square, Copy, KeyRound, Disc, HelpCircle, Component,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Palette definitions per diagram type ─────────────────────────────────────

type PaletteItem = {
  /** The value stored in dataTransfer — encodes both node type and initial data */
  transferData: string;
  label: string;
  icon: React.ElementType;
  style: string;
};

const PALETTES: Record<string, PaletteItem[]> = {
  architecture: [
    { transferData: 'arch::frontend',       label: 'Frontend',       icon: Layout,   style: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { transferData: 'arch::backend',        label: 'Backend',        icon: Server,   style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { transferData: 'arch::database',       label: 'Database',       icon: Database, style: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { transferData: 'arch::infrastructure', label: 'Infrastructure', icon: Box,      style: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
    { transferData: 'arch::ai',             label: 'AI Model',       icon: Bot,      style: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  ],
  flowchart: [
    { transferData: 'flowchart::terminal', label: 'Start / End',  icon: Circle,           style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { transferData: 'flowchart::process',  label: 'Process',      icon: CheckSquare,      style: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { transferData: 'flowchart::decision', label: 'Decision',     icon: Diamond,          style: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { transferData: 'flowchart::io',       label: 'Input / Output', icon: ArrowRightLeft, style: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  ],
  er: [
    { transferData: 'erEntity::entity', label: 'Entity',  icon: Table2, style: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  ],
  sequence: [
    { transferData: 'sequence::actor',    label: 'Actor',    icon: User,    style: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { transferData: 'sequence::service',  label: 'Service',  icon: Server,  style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { transferData: 'sequence::database', label: 'Database', icon: Database,style: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { transferData: 'sequence::external', label: 'External', icon: Globe,   style: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  ],
  bpmn: [
    { transferData: 'bpmn::event::start',       label: 'Start Event',     icon: PlayCircle,  style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { transferData: 'bpmn::event::end',         label: 'End Event',       icon: StopCircle,  style: 'bg-red-500/10 text-red-400 border-red-500/20' },
    { transferData: 'bpmn::task::user',         label: 'User Task',       icon: User,        style: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { transferData: 'bpmn::task::service',      label: 'Service Task',    icon: Cog,         style: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { transferData: 'bpmn::gateway::exclusive', label: 'Excl. Gateway',   icon: GitBranch,   style: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    { transferData: 'bpmn::gateway::parallel',  label: 'Par. Gateway',    icon: GitMerge,    style: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  ],
  erd: [
    { transferData: 'erd::entity',                   label: 'Entity',            icon: Square,     style: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { transferData: 'erd::weak_entity',              label: 'Weak Entity',       icon: Copy,       style: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    { transferData: 'erd::relationship',             label: 'Relationship',      icon: Diamond,    style: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    { transferData: 'erd::identifying_relationship', label: 'Identifying Rel.',  icon: Component,  style: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20' },
    { transferData: 'erd::attribute',                label: 'Attribute',         icon: Circle,     style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { transferData: 'erd::key_attribute',            label: 'Key Attribute',     icon: KeyRound,   style: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { transferData: 'erd::multivalued_attribute',    label: 'Multivalued Attr.', icon: Disc,       style: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
    { transferData: 'erd::derived_attribute',        label: 'Derived Attr.',     icon: HelpCircle, style: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  ],
};

const PALETTE_LABELS: Record<string, string> = {
  architecture: 'Components',
  flowchart: 'Shapes',
  er: 'Entities',
  sequence: 'Participants',
  bpmn: 'Elements',
  erd: 'ER Elements',
};

// ─── Component ────────────────────────────────────────────────────────────────

interface SidebarProps {
  diagramType: string | null;
}

export default function Sidebar({ diagramType }: SidebarProps) {
  // Hide sidebar until a diagram type is selected
  if (!diagramType) return null;

  const items = PALETTES[diagramType] ?? PALETTES['architecture'];
  const heading = PALETTE_LABELS[diagramType] ?? 'Components';

  const onDragStart = (event: React.DragEvent, transferData: string) => {
    event.dataTransfer.setData('application/reactflow', transferData);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-56 bg-surface/95 backdrop-blur-xl border border-border-c rounded-xl shadow-2xl flex flex-col overflow-hidden text-sm transition-all duration-300">
      <div className="p-4 border-b border-border-c bg-surface-2/50">
        <h2 className="text-fg font-semibold tracking-tight">{heading}</h2>
        <p className="text-[11px] text-muted mt-0.5">Drag and drop to build</p>
      </div>

      <div className="p-3 flex flex-col gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.transferData}
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg border cursor-grab active:cursor-grabbing hover:bg-surface-2 transition-colors",
                "border-border-c hover:border-accent/50"
              )}
              onDragStart={(event) => onDragStart(event, item.transferData)}
              draggable
            >
              <div className={cn("p-1.5 rounded-lg border", item.style)}>
                <Icon size={16} />
              </div>
              <span className="font-medium text-fg text-sm">{item.label}</span>
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-border-c/50 bg-surface-2/30">
        <p className="text-[10px] text-muted leading-tight">
          <strong className="text-fg font-semibold">Tip:</strong> Hover over a component and drag from the small dots on its edges to create connections.
        </p>
      </div>
    </aside>
  );
}
