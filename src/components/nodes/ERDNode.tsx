import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { KeyRound } from 'lucide-react';

export type ERDNodeType =
  | 'entity'
  | 'weak_entity'
  | 'relationship'
  | 'identifying_relationship'
  | 'attribute'
  | 'key_attribute'
  | 'multivalued_attribute'
  | 'derived_attribute';

export type ERDNodeData = {
  label: string;
  erdType: ERDNodeType;
  description?: string;
  dataType?: string;
};

// ─── Shared handle style ───────────────────────────────────────────────────────
const hs = (color: string) => ({
  width: 12,
  height: 12,
  background: '#1a1a2e',
  border: `2px solid ${color}`,
  borderRadius: '50%',
  transition: 'all 0.15s',
  zIndex: 10,
});

const Handles = ({ color }: { color: string }) => (
  <>
    <Handle type="source" position={Position.Top}    style={hs(color)} id="top" />
    <Handle type="source" position={Position.Bottom} style={hs(color)} id="bottom" />
    <Handle type="source" position={Position.Left}   style={hs(color)} id="left" />
    <Handle type="source" position={Position.Right}  style={hs(color)} id="right" />
    <Handle type="target" position={Position.Top}    style={hs(color)} id="top-t" />
    <Handle type="target" position={Position.Bottom} style={hs(color)} id="bottom-t" />
    <Handle type="target" position={Position.Left}   style={hs(color)} id="left-t" />
    <Handle type="target" position={Position.Right}  style={hs(color)} id="right-t" />
  </>
);

// ─── Entity (Strong Rectangle) ────────────────────────────────────────────────
function EntityShape({ data, selected }: { data: ERDNodeData; selected?: boolean }) {
  return (
    <div className="relative">
      <Handles color="#3b82f6" />
      <div
        className={cn(
          'w-[200px] px-6 py-4 bg-[#0d1b3e]/90 border-2 border-blue-500 rounded-lg',
          'shadow-[0_0_20px_rgba(59,130,246,0.35)] transition-all duration-200',
          selected && 'ring-2 ring-blue-400/60 shadow-[0_0_36px_rgba(59,130,246,0.6)]',
        )}
      >
        <p className="text-base font-extrabold text-blue-100 text-center tracking-wide leading-tight">
          {data.label}
        </p>
        {data.dataType && (
          <p className="text-[11px] text-blue-300/70 text-center mt-1 font-mono">{data.dataType}</p>
        )}
      </div>
    </div>
  );
}

// ─── Weak Entity (Double Rectangle) ───────────────────────────────────────────
function WeakEntityShape({ data, selected }: { data: ERDNodeData; selected?: boolean }) {
  return (
    <div className="relative">
      <Handles color="#6366f1" />
      {/* Outer border */}
      <div
        className={cn(
          'p-[5px] border-2 border-indigo-400 rounded-lg',
          'shadow-[0_0_20px_rgba(99,102,241,0.35)] transition-all duration-200',
          selected && 'ring-2 ring-indigo-400/60 shadow-[0_0_36px_rgba(99,102,241,0.6)]',
        )}
      >
        {/* Inner border */}
        <div className="w-[188px] px-5 py-3.5 bg-[#0d1131]/90 border-2 border-indigo-400/60 rounded-md">
          <p className="text-base font-extrabold text-indigo-100 text-center tracking-wide leading-tight">
            {data.label}
          </p>
          {data.dataType && (
            <p className="text-[11px] text-indigo-300/70 text-center mt-1 font-mono">{data.dataType}</p>
          )}
          <p className="text-[9px] text-indigo-400/50 text-center mt-1 font-bold uppercase tracking-widest">
            weak
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Relationship (Diamond) ────────────────────────────────────────────────────
// The diamond is a square rotated 45°. We place it inside a container whose
// side equals the diagonal of the inner square: side = size * √2 ≈ size * 1.42.
// We use the simpler approach: outer container = size + padding, handles at edges.
function RelationshipShape({ data, selected }: { data: ERDNodeData; selected?: boolean }) {
  const size = 120; // inner diamond square side
  const pad = 28;   // extra space so handles sit at diamond corners
  const outer = size + pad;
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: outer, height: outer }}
    >
      {/* Handles exactly at the 4 diamond corners */}
      <Handle type="source" position={Position.Top}    style={{ ...hs('#a855f7'), top: 0, left: '50%' }}    id="top" />
      <Handle type="source" position={Position.Bottom} style={{ ...hs('#a855f7'), bottom: 0, left: '50%' }} id="bottom" />
      <Handle type="source" position={Position.Left}   style={{ ...hs('#a855f7'), left: 0, top: '50%' }}    id="left" />
      <Handle type="source" position={Position.Right}  style={{ ...hs('#a855f7'), right: 0, top: '50%' }}   id="right" />
      <Handle type="target" position={Position.Top}    style={{ ...hs('#a855f7'), top: 0, left: '50%' }}    id="top-t" />
      <Handle type="target" position={Position.Bottom} style={{ ...hs('#a855f7'), bottom: 0, left: '50%' }} id="bottom-t" />
      <Handle type="target" position={Position.Left}   style={{ ...hs('#a855f7'), left: 0, top: '50%' }}    id="left-t" />
      <Handle type="target" position={Position.Right}  style={{ ...hs('#a855f7'), right: 0, top: '50%' }}   id="right-t" />

      {/* Rotated diamond square */}
      <div
        style={{ width: size, height: size, transform: 'rotate(45deg)' }}
        className={cn(
          'absolute bg-[#1a0a33]/90 border-2 border-purple-500 rounded-sm transition-all duration-200',
          'shadow-[0_0_24px_rgba(168,85,247,0.4)]',
          selected && 'ring-2 ring-purple-400/60 shadow-[0_0_40px_rgba(168,85,247,0.65)]',
        )}
      />
      {/* Counter-rotated label — centred in the same square */}
      <div
        className="absolute flex flex-col items-center justify-center pointer-events-none"
        style={{ width: size, height: size }}
      >
        <p className="text-[13px] font-extrabold text-purple-100 text-center leading-tight px-2 select-none">
          {data.label}
        </p>
      </div>
    </div>
  );
}

// ─── Identifying Relationship (Double Diamond) ─────────────────────────────────
function IdentifyingRelationshipShape({ data, selected }: { data: ERDNodeData; selected?: boolean }) {
  const innerSize = 112;
  const gap = 12;
  const outerSize = innerSize + gap;
  const pad = 32;
  const outer = outerSize + pad;
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: outer, height: outer }}
    >
      <Handle type="source" position={Position.Top}    style={{ ...hs('#d946ef'), top: 0, left: '50%' }}    id="top" />
      <Handle type="source" position={Position.Bottom} style={{ ...hs('#d946ef'), bottom: 0, left: '50%' }} id="bottom" />
      <Handle type="source" position={Position.Left}   style={{ ...hs('#d946ef'), left: 0, top: '50%' }}    id="left" />
      <Handle type="source" position={Position.Right}  style={{ ...hs('#d946ef'), right: 0, top: '50%' }}   id="right" />
      <Handle type="target" position={Position.Top}    style={{ ...hs('#d946ef'), top: 0, left: '50%' }}    id="top-t" />
      <Handle type="target" position={Position.Bottom} style={{ ...hs('#d946ef'), bottom: 0, left: '50%' }} id="bottom-t" />
      <Handle type="target" position={Position.Left}   style={{ ...hs('#d946ef'), left: 0, top: '50%' }}    id="left-t" />
      <Handle type="target" position={Position.Right}  style={{ ...hs('#d946ef'), right: 0, top: '50%' }}   id="right-t" />

      {/* Outer diamond */}
      <div
        style={{ width: outerSize, height: outerSize, transform: 'rotate(45deg)' }}
        className={cn(
          'absolute border-2 border-fuchsia-400/50 rounded-sm transition-all duration-200',
          selected && 'ring-2 ring-fuchsia-400/40',
        )}
      />
      {/* Inner diamond */}
      <div
        style={{ width: innerSize, height: innerSize, transform: 'rotate(45deg)' }}
        className={cn(
          'absolute bg-[#250035]/90 border-2 border-fuchsia-400 rounded-sm transition-all duration-200',
          'shadow-[0_0_24px_rgba(217,70,239,0.45)]',
          selected && 'shadow-[0_0_40px_rgba(217,70,239,0.7)]',
        )}
      />
      <div
        className="absolute flex flex-col items-center justify-center pointer-events-none"
        style={{ width: innerSize, height: innerSize }}
      >
        <p className="text-[12px] font-extrabold text-fuchsia-100 text-center leading-tight px-2 select-none">
          {data.label}
        </p>
        <p className="text-[8px] text-fuchsia-400/60 uppercase tracking-widest mt-0.5 select-none">
          identifying
        </p>
      </div>
    </div>
  );
}

// ─── Attribute (Oval) ─────────────────────────────────────────────────────────
function AttributeShape({ data, selected }: { data: ERDNodeData; selected?: boolean }) {
  return (
    <div className="relative flex items-center justify-center">
      <Handles color="#10b981" />
      <div
        className={cn(
          'min-w-[130px] px-5 py-2.5 rounded-full bg-[#001a12]/90 border-2 border-emerald-500',
          'shadow-[0_0_14px_rgba(16,185,129,0.3)] transition-all duration-200',
          selected && 'ring-2 ring-emerald-400/60 shadow-[0_0_28px_rgba(16,185,129,0.55)]',
        )}
      >
        <p className="text-[13px] font-semibold text-emerald-100 text-center whitespace-nowrap">
          {data.label}
        </p>
        {data.dataType && (
          <p className="text-[10px] text-emerald-400/70 text-center font-mono">{data.dataType}</p>
        )}
      </div>
    </div>
  );
}

// ─── Key Attribute (Underlined oval) ──────────────────────────────────────────
function KeyAttributeShape({ data, selected }: { data: ERDNodeData; selected?: boolean }) {
  return (
    <div className="relative flex items-center justify-center">
      <Handles color="#f59e0b" />
      <div
        className={cn(
          'min-w-[130px] flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full',
          'bg-[#1a1000]/90 border-2 border-amber-500',
          'shadow-[0_0_14px_rgba(245,158,11,0.35)] transition-all duration-200',
          selected && 'ring-2 ring-amber-400/60 shadow-[0_0_28px_rgba(245,158,11,0.6)]',
        )}
      >
        <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <div>
          <p className="text-[13px] font-bold text-amber-100 text-center underline underline-offset-2 whitespace-nowrap">
            {data.label}
          </p>
          {data.dataType && (
            <p className="text-[10px] text-amber-400/70 text-center font-mono">{data.dataType}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Multivalued Attribute (Double oval) ──────────────────────────────────────
function MultivaluedAttributeShape({ data, selected }: { data: ERDNodeData; selected?: boolean }) {
  return (
    <div className="relative flex items-center justify-center">
      <Handles color="#06b6d4" />
      {/* Outer oval ring */}
      <div
        className={cn(
          'p-[5px] rounded-full border-2 border-cyan-400/50 transition-all duration-200',
          selected && 'ring-2 ring-cyan-400/40',
        )}
      >
        {/* Inner oval */}
        <div
          className={cn(
            'min-w-[120px] px-4 py-2.5 rounded-full bg-[#001a20]/90 border-2 border-cyan-500',
            'shadow-[0_0_14px_rgba(6,182,212,0.3)]',
            selected && 'shadow-[0_0_28px_rgba(6,182,212,0.55)]',
          )}
        >
          <p className="text-[13px] font-semibold text-cyan-100 text-center whitespace-nowrap">
            {data.label}
          </p>
          {data.dataType && (
            <p className="text-[10px] text-cyan-400/70 text-center font-mono">{data.dataType}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Derived Attribute (Dashed oval) ──────────────────────────────────────────
function DerivedAttributeShape({ data, selected }: { data: ERDNodeData; selected?: boolean }) {
  return (
    <div className="relative flex items-center justify-center">
      <Handles color="#f43f5e" />
      <div
        className={cn(
          'min-w-[130px] px-5 py-2.5 rounded-full bg-[#1a0008]/90 transition-all duration-200',
          'shadow-[0_0_14px_rgba(244,63,94,0.25)]',
          selected && 'ring-2 ring-rose-400/40 shadow-[0_0_28px_rgba(244,63,94,0.5)]',
        )}
        style={{ border: '2.5px dashed rgba(244,63,94,0.7)' }}
      >
        <p className="text-[13px] font-semibold text-rose-100 text-center italic whitespace-nowrap">
          {data.label}
        </p>
        {data.dataType && (
          <p className="text-[10px] text-rose-400/70 text-center font-mono">{data.dataType}</p>
        )}
      </div>
    </div>
  );
}

// ─── Router ────────────────────────────────────────────────────────────────────
function ERDNode({ data, selected }: { data: ERDNodeData; selected?: boolean }) {
  switch (data.erdType) {
    case 'entity':                return <EntityShape data={data} selected={selected} />;
    case 'weak_entity':           return <WeakEntityShape data={data} selected={selected} />;
    case 'relationship':          return <RelationshipShape data={data} selected={selected} />;
    case 'identifying_relationship': return <IdentifyingRelationshipShape data={data} selected={selected} />;
    case 'key_attribute':         return <KeyAttributeShape data={data} selected={selected} />;
    case 'multivalued_attribute': return <MultivaluedAttributeShape data={data} selected={selected} />;
    case 'derived_attribute':     return <DerivedAttributeShape data={data} selected={selected} />;
    case 'attribute':
    default:                      return <AttributeShape data={data} selected={selected} />;
  }
}

export default memo(ERDNode);
