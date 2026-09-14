'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Canvas from '@/components/Canvas';
import CommandBar from '@/components/CommandBar';
import InspectorPanel from '@/components/InspectorPanel';
import Sidebar from '@/components/Sidebar';
import ScoreBreakdownModal from '@/components/ScoreBreakdownModal';
import ProfileButton from '@/components/ProfileButton';
import EdgeLegend from '@/components/EdgeLegend';
import { Save, Download, Sparkles, Layout, Activity, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { useDiagramStore } from '@/store/useDiagramStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { createClient } from '@/lib/supabase/client';
import { ReactFlowProvider, Controls } from '@xyflow/react';

export default function EditorPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const supabase = createClient();
  const { isAutosaveEnabled } = useSettingsStore();

  const {
    applyAutoLayout,
    architectureScore,
    setIsScoreModalOpen,
    setIsExportModalOpen,
    nodes,
    edges,
    setNodes,
    setEdges,
    setArchitectureScore,
    setScoreReasoning,
    setAnalysisDetails,
    currentArchitectureTitle,
    setCurrentArchitectureId,
    setCurrentArchitectureTitle,
    resetDiagram,
  } = useDiagramStore();

  const [loadingArch, setLoadingArch] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialLoad = useRef(true);

  // Load architecture on mount
  useEffect(() => {
    if (!id) return;
    resetDiagram();
    isInitialLoad.current = true;

    async function load() {
      const { data, error } = await supabase
        .from('architectures')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        router.push('/dashboard');
        return;
      }

      setCurrentArchitectureId(data.id);
      setCurrentArchitectureTitle(data.title);
      setTitleInput(data.title);

      if (Array.isArray(data.nodes) && data.nodes.length > 0) {
        setNodes(data.nodes as Parameters<typeof setNodes>[0]);
      }
      if (Array.isArray(data.edges) && data.edges.length > 0) {
        setEdges(data.edges as Parameters<typeof setEdges>[0]);
      }
      if (data.score !== null && data.score !== undefined) {
        setArchitectureScore(data.score);
      }
      if (data.score_reasoning) setScoreReasoning(data.score_reasoning);
      if (data.strengths || data.weaknesses || data.tradeoffs) {
        setAnalysisDetails({
          strengths: data.strengths || [],
          weaknesses: data.weaknesses || [],
          tradeoffs: data.tradeoffs || [],
        });
      }

      setLoadingArch(false);
      // Allow auto-save to kick in after brief delay
      setTimeout(() => { isInitialLoad.current = false; }, 500);
    }

    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Auto-save (debounced 2s) when nodes/edges/score change
  useEffect(() => {
    if (isInitialLoad.current || !id) return;
    if (!isAutosaveEnabled) return;

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      await saveToDb(false);
    }, 2000);

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, architectureScore, isAutosaveEnabled]);

  const saveToDb = useCallback(async (manual = false) => {
    if (!id) return;
    if (manual) setSaving(true);

    const store = useDiagramStore.getState();
    await supabase
      .from('architectures')
      .update({
        nodes: store.nodes,
        edges: store.edges,
        score: store.architectureScore,
        title: store.currentArchitectureTitle,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (manual) {
      setSaving(false);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleTitleSave = async () => {
    setEditingTitle(false);
    setCurrentArchitectureTitle(titleInput);
    await supabase
      .from('architectures')
      .update({ title: titleInput })
      .eq('id', id);
  };

  let scoreColor = 'text-muted border-border-c bg-surface-2/40';
  if (architectureScore !== null) {
    if (architectureScore >= 90) scoreColor = 'text-green-400 border-green-500/30 bg-green-500/10 shadow-[0_0_10px_rgba(34,197,94,0.2)]';
    else if (architectureScore >= 75) scoreColor = 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10 shadow-[0_0_10px_rgba(234,179,8,0.2)]';
    else scoreColor = 'text-red-400 border-red-500/30 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
  }

  return (
    <div className="flex flex-col h-screen w-full bg-bg overflow-hidden text-fg">
      {/* Header */}
      <header className="h-16 shrink-0 border-b border-border-c bg-surface/80 backdrop-blur-md px-4 flex items-center justify-between z-10 relative shadow-sm gap-3">

        {/* Left — Back + Logo */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            id="btn-back-dashboard"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-muted hover:text-fg hover:bg-surface-2 rounded-lg border border-transparent hover:border-border-c transition-all text-sm font-medium shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          <div className="w-px h-5 bg-border-c shrink-0" />

          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)] shrink-0">
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>

          {/* Editable Title */}
          {editingTitle ? (
            <input
              autoFocus
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => { if (e.key === 'Enter') handleTitleSave(); if (e.key === 'Escape') { setEditingTitle(false); setTitleInput(currentArchitectureTitle); } }}
              className="bg-surface-2 border border-border-c text-fg text-sm font-semibold px-2 py-1 rounded-lg outline-none focus:border-accent min-w-0 max-w-[200px]"
            />
          ) : (
            <button
              onClick={() => { setEditingTitle(true); setTitleInput(currentArchitectureTitle); }}
              className="text-fg font-semibold tracking-tight text-base hover:text-accent transition-colors truncate max-w-[160px] sm:max-w-[280px] text-left"
              title="Click to rename"
            >
              {currentArchitectureTitle}
            </button>
          )}
        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => applyAutoLayout('TB')}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted bg-surface-2 hover:bg-surface hover:text-fg rounded-lg border border-border-c transition-colors shadow-sm"
          >
            <Layout className="w-4 h-4" />
            Auto Layout
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted bg-surface-2 hover:bg-surface hover:text-fg rounded-lg border border-border-c transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {!isAutosaveEnabled && (
            <button
              onClick={() => saveToDb(true)}
              disabled={saving}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border transition-all shadow-sm ${
                saveStatus === 'saved'
                  ? 'text-green-500 border-green-500/30 bg-green-500/10'
                  : 'text-muted bg-surface-2 hover:bg-surface hover:text-fg border-border-c'
              }`}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saveStatus === 'saved' ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{saveStatus === 'saved' ? 'Saved' : 'Save'}</span>
            </button>
          )}

          {architectureScore !== null && (
            <div
              onClick={() => setIsScoreModalOpen(true)}
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border cursor-pointer hover:scale-105 active:scale-95 transition-all ${scoreColor}`}
            >
              <Activity className="w-4 h-4" />
              {architectureScore}/100
            </div>
          )}

          <div className="w-px h-5 bg-border-c" />
          <ProfileButton />
        </div>
      </header>

      {/* Canvas */}
      <main className="flex-1 w-full relative bg-bg">
        {loadingArch ? (
          <div className="flex items-center justify-center w-full h-full">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
              <p className="text-muted text-sm">Loading architecture...</p>
            </div>
          </div>
        ) : (
          <ReactFlowProvider>
            <Canvas />
            <div className="absolute top-20 left-6 flex flex-col gap-4 z-10">
              <Sidebar />
              <EdgeLegend />
              <Controls 
                orientation="horizontal" 
                showInteractive={false} 
                className="!static !m-0 !shadow-xl !w-fit !self-start !bg-surface/80 !border-border-c backdrop-blur-md !rounded-xl !overflow-hidden [&>button]:!bg-transparent [&>button]:!border-border-c [&>button]:!border-r [&>button]:last:!border-r-0 [&>button]:!text-muted hover:[&>button]:!text-fg hover:[&>button]:!bg-surface-2 [&>button]:!transition-colors" 
              />
            </div>
            <CommandBar />
            <InspectorPanel />
            <ScoreBreakdownModal />
          </ReactFlowProvider>
        )}
      </main>
    </div>
  );
}
