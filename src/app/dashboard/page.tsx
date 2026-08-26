'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import ProfileButton from '@/components/ProfileButton';
import { Sparkles, Plus, Activity, Trash2, ArrowRight, Loader2, LayoutGrid, Clock, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

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

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    setDeletingId(projectToDelete);
    await supabase.from('architectures').delete().eq('id', projectToDelete);
    setArchitectures(prev => prev.filter(a => a.id !== projectToDelete));
    setDeletingId(null);
    setProjectToDelete(null);
  };

  const firstName = (
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'there'
  ).split(' ')[0];

  return (
    <div className="relative min-h-screen bg-[#09090b] text-fg flex flex-col font-sans overflow-hidden">
      {/* ── Dynamic Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0d_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0d_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
        <div className="absolute top-0 -left-1/4 w-[800px] h-[800px] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-0 -right-1/4 w-[800px] h-[800px] rounded-full bg-blue-600/20 blur-[120px]" />
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 h-[72px] px-6 bg-[#0c0c10]/80 backdrop-blur-xl border-b border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex items-center justify-between">
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-zinc-100">Archie</span>
          <div className="h-4 w-px bg-border-c mx-2" />
          <span className="font-mono text-sm text-zinc-500 tracking-wider uppercase">Workspace</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            id="btn-new-architecture"
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900/80 backdrop-blur-md border border-purple-500/30 text-zinc-100 hover:bg-purple-500/10 hover:border-purple-500/60 transition-all duration-300 shadow-[0_0_15px_-3px_rgba(168,85,247,0.15)] rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            New Project
          </button>
          <ProfileButton />
        </div>
      </header>

      {/* ── Body ── */}
      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-6 py-12">
        {/* Page heading */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">{greeting}, {firstName}</h1>
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
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* New card */}
            <motion.button
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              onClick={handleCreate}
              disabled={creating}
              className="group h-48 rounded-2xl border-2 border-dashed border-border-c hover:bg-accent/5 flex flex-col items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_-5px_rgba(124,58,237,0.2)] hover:border-purple-500/30"
            >
              {creating ? (
                <Loader2 size={24} className="animate-spin text-accent" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-surface-2 group-hover:bg-accent/10 flex items-center justify-center text-muted group-hover:text-accent transition-colors">
                  <Plus size={24} />
                </div>
              )}
              <span className="text-sm font-medium text-muted group-hover:text-accent transition-colors">Create new project</span>
            </motion.button>

            {/* Architecture cards */}
            {architectures.map(arch => {
              const nodeCount = Array.isArray(arch.nodes) ? arch.nodes.length : 0;
              const badge = getScoreBadge(arch.score);

              return (
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  key={arch.id}
                  onClick={() => router.push(`/editor/${arch.id}`)}
                  className="group relative h-48 bg-surface border border-border-c rounded-2xl p-5 flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_-5px_rgba(124,58,237,0.2)] hover:border-purple-500/30"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 pr-4">
                      <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-accent transition-colors">{arch.title}</h3>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setProjectToDelete(arch.id); }}
                      disabled={deletingId === arch.id}
                      className="p-1.5 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors relative z-20"
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
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && architectures.length === 0 && (
          <div className="text-center py-24 flex flex-col items-center relative z-10">
            <motion.div 
              animate={{ y: [0, -10, 0] }} 
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center mb-6"
            >
              <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
              <Sparkles size={28} className="text-accent relative z-10" />
            </motion.div>
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

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl max-w-sm w-full mx-4 flex flex-col gap-4 animate-fade-scale-in">
            <div>
              <h2 className="text-lg font-semibold text-white">Delete Project</h2>
              <p className="text-sm text-zinc-400 mt-1">Are you sure you want to delete this project? This action cannot be undone.</p>
            </div>
            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 text-sm text-zinc-300 hover:text-white transition-colors"
                disabled={deletingId !== null}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deletingId !== null}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 hover:border-red-500/40 transition-all disabled:opacity-50"
              >
                {deletingId !== null ? <Loader2 size={16} className="animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
