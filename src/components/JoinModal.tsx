'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Link2, Loader2, Check, LayoutGrid, Activity, ArrowRight, AlertCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';

interface ProjectPreview {
  id: string;
  title: string;
  score: number | null;
  nodes: unknown[];
  edges: unknown[];
  diagram_type: string | null;
}

interface JoinModalProps {
  initialCode?: string;
  onClose: () => void;
}

function getScoreBadge(score: number | null) {
  if (score === null) return { label: 'Unscored', color: 'text-muted bg-surface-2 border-border-c', dot: 'bg-muted' };
  if (score >= 90) return { label: `Score: ${score}`, color: 'text-green-600 bg-green-50 border-green-100 dark:text-green-400 dark:bg-green-500/10 dark:border-green-500/20', dot: 'bg-green-500' };
  if (score >= 70) return { label: `Score: ${score}`, color: 'text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20', dot: 'bg-amber-500' };
  return { label: `Score: ${score}`, color: 'text-red-600 bg-red-50 border-red-100 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20', dot: 'bg-red-500' };
}

function formatCode(raw: string): string {
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleaned.length <= 3) return cleaned;
  return cleaned.slice(0, 3) + '-' + cleaned.slice(3, 7);
}

export default function JoinModal({ initialCode = '', onClose }: JoinModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [codeInput, setCodeInput] = useState(initialCode ? formatCode(initialCode) : '');
  const [looking, setLooking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<ProjectPreview | null>(null);
  const [permission, setPermission] = useState<string>('view');
  const [saved, setSaved] = useState(false);

  const handleCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCode(e.target.value);
    // Don't exceed ARC-XXXX length (7 chars with hyphen)
    if (formatted.length <= 7) setCodeInput(formatted);
  };

  const handleLookup = async () => {
    const code = codeInput.trim();
    if (code.length < 3) return;
    setLooking(true);
    setError(null);
    setProject(null);

    try {
      const res = await fetch(`/api/join?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid or expired share code');
      setProject(data.project);
      setPermission(data.permission);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLooking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleLookup();
  };

  const handleSave = async () => {
    if (!user || !project) return;
    setSaving(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from('architectures')
        .insert({
          user_id: user.id,
          title: `${project.title} (Shared)`,
          nodes: project.nodes,
          edges: project.edges,
          diagram_type: project.diagram_type,
          score: project.score,
        })
        .select('id')
        .single();

      if (insertError || !data) throw new Error(insertError?.message || 'Failed to save project');

      setSaved(true);
      setTimeout(() => {
        onClose();
        router.push(`/editor/${data.id}`);
      }, 800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSaving(false);
    }
  };

  const badge = getScoreBadge(project?.score ?? null);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.93, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.93, opacity: 0, y: 16 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          className="bg-surface border border-border-c rounded-2xl shadow-2xl w-full max-w-md mx-auto overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border-c">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
                <Link2 size={17} className="text-purple-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-fg">Join a Project</h2>
                <p className="text-xs text-muted">Enter a share code to load a workspace</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted hover:text-fg hover:bg-surface-2 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="px-6 py-5 space-y-4">
            {/* Code input */}
            <div>
              <p className="text-xs font-medium text-muted mb-2 uppercase tracking-wider">Share Code</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={codeInput}
                  onChange={handleCodeInput}
                  onKeyDown={handleKeyDown}
                  placeholder="ARC-XXXX"
                  maxLength={7}
                  spellCheck={false}
                  className="flex-1 bg-surface-2 border border-border-c rounded-xl px-4 py-2.5 font-mono text-lg font-bold tracking-[0.15em] text-fg placeholder:text-muted/40 placeholder:font-normal placeholder:tracking-normal outline-none focus:border-accent transition-colors uppercase"
                />
                <button
                  onClick={handleLookup}
                  disabled={looking || codeInput.trim().length < 3}
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-[0_0_15px_rgba(79,70,229,0.4)] shrink-0"
                >
                  {looking ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
                  Look up
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400"
              >
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Project preview */}
            <AnimatePresence>
              {project && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="rounded-xl border border-border-c bg-surface-2 p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-fg text-base leading-tight line-clamp-2">
                      {project.title}
                    </h3>
                    <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      {badge.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted">
                    <span className="flex items-center gap-1.5">
                      <LayoutGrid size={12} />
                      {Array.isArray(project.nodes) ? project.nodes.length : 0} nodes
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Activity size={12} />
                      {permission === 'view' ? 'View & Copy only' : 'Editable copy'}
                    </span>
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={saving || saved}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md ${
                      saved
                        ? 'bg-green-500/15 border border-green-500/30 text-green-400'
                        : 'bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white hover:shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                    }`}
                  >
                    {saving ? (
                      <><Loader2 size={15} className="animate-spin" /> Saving...</>
                    ) : saved ? (
                      <><Check size={15} /> Saved! Opening editor...</>
                    ) : (
                      <>Save to My Workspace</>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
