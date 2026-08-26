"use client";

import { Server, GitBranch, Database, GitCommit, LayoutTemplate, FileText } from 'lucide-react';

export type DiagramType = {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  systemPromptHint: string;
};

export const DIAGRAM_TYPES: DiagramType[] = [
  {
    id: 'architecture',
    label: 'Architecture Diagram',
    icon: Server,
    description: 'Cloud & system architecture',
    systemPromptHint: 'Create a detailed system architecture diagram with services, APIs, databases, and infrastructure components.',
  },
  {
    id: 'flowchart',
    label: 'Flow Chart',
    icon: GitBranch,
    description: 'Process & decision flows',
    systemPromptHint: 'Create a flowchart showing the process steps, decision points, and flow of control.',
  },
  {
    id: 'er',
    label: 'Entity Relationship',
    icon: Database,
    description: 'Database schema & relations',
    systemPromptHint: 'Create an Entity-Relationship diagram showing database tables, columns, primary keys, foreign keys, and relationships (one-to-many, many-to-many).',
  },
  {
    id: 'sequence',
    label: 'Sequence Diagram',
    icon: GitCommit,
    description: 'Time-ordered interactions',
    systemPromptHint: 'Create a sequence diagram showing the time-ordered interactions and message passing between system components and actors.',
  },
  {
    id: 'bpmn',
    label: 'BPMN Diagram',
    icon: LayoutTemplate,
    description: 'Business process modeling',
    systemPromptHint: 'Create a BPMN (Business Process Model and Notation) diagram showing the business process flow, tasks, gateways, and participants.',
  },
  {
    id: 'document',
    label: 'Document',
    icon: FileText,
    description: 'Technical documentation',
    systemPromptHint: 'Create a structured technical document diagram showing the components, modules, and their documentation structure.',
  },
];

interface DiagramTypeSelectorProps {
  selectedType: string | null;
  onSelect: (type: DiagramType) => void;
}

export default function DiagramTypeSelector({ selectedType, onSelect }: DiagramTypeSelectorProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
      <div className="pointer-events-auto flex flex-col items-center">
        <h2 className="text-2xl font-bold text-fg mb-2 text-center">
          What would you like to create?
        </h2>
        <p className="text-muted text-sm mb-8 text-center">
          Select a diagram type, then describe what you want below
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto px-4">
          {DIAGRAM_TYPES.map((dt) => {
            const Icon = dt.icon;
            const isSelected = selectedType === dt.id;
            return (
              <button
                key={dt.id}
                onClick={() => onSelect(dt)}
                className={`
                  flex flex-col items-center justify-center p-6 rounded-xl cursor-pointer
                  transition-all duration-200 group
                  backdrop-blur-sm border
                  ${isSelected
                    ? 'bg-indigo-600/15 border-indigo-500/70 shadow-[0_0_20px_rgba(99,102,241,0.25)] -translate-y-1'
                    : 'bg-surface-2/40 border-white/5 hover:bg-surface-2/60 hover:border-purple-500/50 hover:-translate-y-1'
                  }
                `}
              >
                <div className={`mb-4 transition-colors ${isSelected ? 'text-indigo-400' : 'text-muted group-hover:text-fg'}`}>
                  <Icon className="w-8 h-8" />
                </div>
                <span className={`text-sm font-semibold text-center leading-snug transition-colors ${isSelected ? 'text-indigo-300' : 'text-fg'}`}>
                  {dt.label}
                </span>
                <span className={`text-[11px] mt-1 text-center transition-colors ${isSelected ? 'text-indigo-400/80' : 'text-muted/60'}`}>
                  {dt.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
