'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import ProfileButton from '@/components/ProfileButton';
import { Sparkles, Plus, Activity, Trash2, ArrowRight, Loader2, LayoutGrid, Clock, MoreVertical } from 'lucide-react';

type Architecture = {
  id: string;
  title: string;
  score: number | null;
  nodes: unknown[];
  edges: unknown[];
  updated_at: string;
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getScoreBadge(score: number | null) {
  if (score === null) return { label: 'Unscored', color: 'text-muted bg-surface-2 border-border-c', dot: 'bg-muted' };
  if (score >= 90) return { label: `Score: ${score}`, color: 'text-green-600 bg-green-50 border-green-100 dark:text-green-400 dark:bg-green-500/10 dark:border-green-500/20', dot: 'bg-green-500' };
  if (score >= 70) return { label: `Score: ${score}`, color: 'text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20', dot: 'bg-amber-500' };
  return { label: `Score: ${score}`, color: 'text-red-600 bg-red-50 border-red-100 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20', dot: 'bg-red-500' };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [architectures, setArchitectures] = useState<Architecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchArchitectures = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('architectures')
      .select('id, title, score, nodes, edges, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    setArchitectures((data ?? []) as Architecture[]);
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => { fetchArchitectures(); }, [fetchArchitectures]);

  const handleCreate = async () => {
    if (!user || creating) return;
    setCreating(true);
    const { data } = await supabase
      .from('architectures')
      .insert({ user_id: user.id, title: 'Untitled Architecture', nodes: [], edges: [] })
      .select('id').single();
    if (data) router.push(`/editor/${data.id}`);
    else setCreating(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
    await supabase.from('architectures').delete().eq('id', id);
    setArchitectures(prev => prev.filter(a => a.id !== id));
    setDeletingId(null);
  };

  const firstName = (
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'there'
  ).split(' ')[0];

  return (
    <div className="min-h-screen bg-bg text-fg flex flex-col font-sans">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 h-16 bg-surface/80 backdrop-blur-xl border-b border-border-c flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="font-semibold text-lg tracking-tight">Archie</span>
          <div className="h-4 w-px bg-border-c mx-2" />
          <span className="text-sm font-medium text-muted">Workspace</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            id="btn-new-architecture"
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center gap-2 px-4 py-2 bg-fg text-bg hover:opacity-90 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            New Project
          </button>
          <ProfileButton />
        </div>
      </header>

      {/* ── Body ── */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12">
        {/* Page heading */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Good morning, {firstName}</h1>
            <p className="text-muted">
              {loading ? 'Loading your projects...' : architectures.length === 0 ? "You don't have any projects yet." : `You have ${architectures.length} project${architectures.length !== 1 ? 's' : ''} in your workspace.`}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 rounded-2xl bg-surface border border-border-c animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* New card */}
            <button
              onClick={handleCreate}
              disabled={creating}
              className="group h-48 rounded-2xl border-2 border-dashed border-border-c hover:border-accent hover:bg-accent/5 flex flex-col items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? (
                <Loader2 size={24} className="animate-spin text-accent" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-surface-2 group-hover:bg-accent/10 flex items-center justify-center text-muted group-hover:text-accent transition-colors">
                  <Plus size={24} />
                </div>
              )}
              <span className="text-sm font-medium text-muted group-hover:text-accent transition-colors">Create new project</span>
            </button>

            {/* Architecture cards */}
            {architectures.map(arch => {
              const nodeCount = Array.isArray(arch.nodes) ? arch.nodes.length : 0;
              const badge = getScoreBadge(arch.score);

              return (
                <div
                  key={arch.id}
                  onClick={() => router.push(`/editor/${arch.id}`)}
                  className="group relative h-48 bg-surface border border-border-c hover:border-accent/50 rounded-2xl p-5 flex flex-col transition-all cursor-pointer hover:shadow-xl hover:shadow-accent/5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 pr-4">
                      <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-accent transition-colors">{arch.title}</h3>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, arch.id)}
                      disabled={deletingId === arch.id}
                      className="p-1.5 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      {deletingId === arch.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>

                  <div className="mt-auto space-y-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      {badge.label}
                    </div>

                    <div className="flex items-center gap-4 text-xs font-medium text-muted">
                      <div className="flex items-center gap-1.5">
                        <LayoutGrid size={14} />
                        {nodeCount} nodes
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {timeAgo(arch.updated_at)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!loading && architectures.length === 0 && (
          <div className="text-center py-24 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center mb-6">
              <Sparkles size={28} className="text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-2">Ready to architect?</h3>
            <p className="text-muted max-w-md mx-auto mb-8">
              Start by creating your first architecture diagram. Use AI to generate complex systems or build them manually.
            </p>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-6 py-3 bg-fg text-bg hover:opacity-90 rounded-xl text-sm font-semibold transition-all shadow-lg"
            >
              <Plus size={18} /> Create Architecture
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
