'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Loader2, AlertCircle, LayoutGrid, Activity, Check, ArrowLeft,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import ArchieLogo from '@/components/Logo';

interface ProjectPreview {
  id: string;
  title: string;
  score: number | null;
  nodes: unknown[];
  edges: unknown[];
  diagram_type: string | null;
}

function getScoreBadge(score: number | null) {
  if (score === null) return { label: 'Unscored', color: 'text-muted bg-surface-2 border-border-c', dot: 'bg-muted' };
  if (score >= 90) return { label: `Score: ${score}`, color: 'text-green-600 bg-green-50 border-green-100 dark:text-green-400 dark:bg-green-500/10 dark:border-green-500/20', dot: 'bg-green-500' };
  if (score >= 70) return { label: `Score: ${score}`, color: 'text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20', dot: 'bg-amber-500' };
  return { label: `Score: ${score}`, color: 'text-red-600 bg-red-50 border-red-100 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20', dot: 'bg-red-500' };
}

function JoinPageContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code')?.toUpperCase() ?? '';

  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<ProjectPreview | null>(null);
  const [permission, setPermission] = useState<string>('view');

  const supabase = createClient();

  useEffect(() => {
    if (!code) {
      setError('No share code provided. Check your link and try again.');
      setFetching(false);
      return;
    }

    const fetchProject = async () => {
      setFetching(true);
      try {
        const res = await fetch(`/api/join?code=${encodeURIComponent(code)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Invalid or expired share code');
        setProject(data.project);
        setPermission(data.permission);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setFetching(false);
      }
    };

    fetchProject();
  }, [code]);

  const handleSave = async () => {
    if (!user) {
      // Redirect to login with a return URL
      router.push(`/login?next=/join?code=${code}`);
      return;
    }
    if (!project) return;

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
      setTimeout(() => router.push(`/editor/${data.id}`), 900);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSaving(false);
    }
  };

  const badge = getScoreBadge(project?.score ?? null);

  return (
    <div className="relative min-h-screen bg-bg text-fg flex flex-col font-sans overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0d_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0d_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
        <div className="absolute top-0 -left-1/4 w-[700px] h-[700px] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-0 -right-1/4 w-[700px] h-[700px] rounded-full bg-blue-600/20 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 h-16 px-6 bg-surface/80 backdrop-blur-xl border-b border-border-c flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-muted hover:text-fg hover:bg-surface-2 rounded-lg border border-transparent hover:border-border-c transition-all"
          >
            <ArrowLeft size={15} />
            Dashboard
          </button>
          <div className="w-px h-5 bg-border-c" />
          <ArchieLogo size="sm" />
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Loading */}
          {(fetching || authLoading) && (
            <div className="bg-surface border border-border-c rounded-2xl p-10 flex flex-col items-center gap-4 shadow-2xl">
              <Loader2 size={32} className="animate-spin text-accent" />
              <p className="text-muted text-sm">Loading shared project...</p>
            </div>
          )}

          {/* Error */}
          {!fetching && !authLoading && error && (
            <div className="bg-surface border border-border-c rounded-2xl p-8 shadow-2xl space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                <AlertCircle size={22} className="text-red-400" />
              </div>
              <div className="text-center">
                <h2 className="text-lg font-bold text-fg mb-1">Invalid Share Code</h2>
                <p className="text-sm text-muted">{error}</p>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border-c text-sm text-muted hover:text-fg hover:bg-surface-2 transition-all"
              >
                <ArrowLeft size={14} /> Back to Dashboard
              </button>
            </div>
          )}

          {/* Project preview */}
          {!fetching && !authLoading && project && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-surface border border-border-c rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Top banner */}
              <div className="px-6 pt-6 pb-4 border-b border-border-c">
                <p className="text-xs font-mono text-muted mb-2 uppercase tracking-widest">
                  Shared Project · {code}
                </p>
                <h1 className="text-2xl font-bold text-fg leading-tight">{project.title}</h1>
              </div>

              {/* Stats */}
              <div className="px-6 py-4 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                    {badge.label}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted">
                    <LayoutGrid size={12} />
                    {Array.isArray(project.nodes) ? project.nodes.length : 0} nodes
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted">
                    <Activity size={12} />
                    {permission === 'edit' ? 'Editable copy' : 'View & Copy'}
                  </span>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400"
                  >
                    <AlertCircle size={14} className="shrink-0" />
                    {error}
                  </motion.div>
                )}

                <button
                  onClick={handleSave}
                  disabled={saving || saved}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all shadow-md mt-1 ${
                    saved
                      ? 'bg-green-500/15 border border-green-500/30 text-green-400'
                      : 'bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white hover:shadow-[0_0_20px_rgba(79,70,229,0.5)]'
                  }`}
                >
                  {saving ? (
                    <><Loader2 size={15} className="animate-spin" /> Saving to workspace...</>
                  ) : saved ? (
                    <><Check size={15} /> Saved! Opening editor...</>
                  ) : !user ? (
                    <>Sign in to Save to Workspace</>
                  ) : (
                    <>Save to My Workspace</>
                  )}
                </button>

                {!user && (
                  <p className="text-center text-xs text-muted">
                    You need to be signed in to save this project.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-accent" />
      </div>
    }>
      <JoinPageContent />
    </Suspense>
  );
}
