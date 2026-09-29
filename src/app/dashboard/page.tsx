'use client';

import { useEffect, useState, useCallback, Suspense, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import ProfileButton from '@/components/ProfileButton';
import ArchieLogo from '@/components/Logo';
import JoinModal from '@/components/JoinModal';
import {
  Sparkles, Plus, Trash2, Loader2, LayoutGrid, Clock,
  Pin, PinOff, Link2, Folder, FolderPlus, FolderOpen,
  Search, X, MoveRight, Edit2, Check, FolderX, Home,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ───────────────────────────────────────────────────────────────────

type Architecture = {
  id: string;
  title: string;
  score: number | null;
  nodes: unknown[];
  edges: unknown[];
  updated_at: string;
  folder_id: string | null;
};

type FolderRow = {
  id: string;
  name: string;
  color: string;
  created_at: string;
};

type PinnedEntry = { id: string; pinnedAt: number };

// ─── Constants ───────────────────────────────────────────────────────────────

const PIN_STORAGE_KEY = 'archie-pinned-canvases';

const FOLDER_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#3b82f6', // blue
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadPins(): PinnedEntry[] {
  try { return JSON.parse(localStorage.getItem(PIN_STORAGE_KEY) ?? '[]'); } catch { return []; }
}
function savePins(pins: PinnedEntry[]) {
  localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(pins));
}

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
  if (score >= 90) return { label: `Score: ${score}`, color: 'text-green-400 bg-green-500/10 border-green-500/20', dot: 'bg-green-500' };
  if (score >= 70) return { label: `Score: ${score}`, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-500' };
  return { label: `Score: ${score}`, color: 'text-red-400 bg-red-500/10 border-red-500/20', dot: 'bg-red-500' };
}

// ─── Main Component ───────────────────────────────────────────────────────────

function DashboardPageInner() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);


  // Core data
  const [architectures, setArchitectures] = useState<Architecture[]>([]);
  const [folders, setFolders] = useState<FolderRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Project UI state
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [greeting, setGreeting] = useState('Hello');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinInitialCode, setJoinInitialCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Folder navigation
  // 'all' = show everything, 'none' = show unsorted, <uuid> = specific folder
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');

  // Create-folder modal
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState(FOLDER_COLORS[0]);
  const [creatingFolder, setCreatingFolder] = useState(false);

  // Delete folder
  const [folderToDelete, setFolderToDelete] = useState<FolderRow | null>(null);
  const [deletingFolderId, setDeletingFolderId] = useState<string | null>(null);

  // Rename folder (inline in sidebar)
  const [editingFolder, setEditingFolder] = useState<FolderRow | null>(null);
  const [editFolderName, setEditFolderName] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Move-to-folder modal
  const [moveTarget, setMoveTarget] = useState<Architecture | null>(null);
  const [moving, setMoving] = useState(false);

  // Pin state
  const [pins, setPins] = useState<PinnedEntry[]>([]);
  const [pinReplaceTarget, setPinReplaceTarget] = useState<{ oldPin: PinnedEntry; newId: string } | null>(null);

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  useEffect(() => { setPins(loadPins()); }, []);

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) { setJoinInitialCode(code); setShowJoinModal(true); }
  }, [searchParams]);

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Good morning');
    else if (h < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Focus rename input when editingFolder changes
  useEffect(() => {
    if (editingFolder) setTimeout(() => renameInputRef.current?.focus(), 50);
  }, [editingFolder]);

  // ─── Data fetching ────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    if (!user) return;
    const [{ data: archData }, { data: folderData }] = await Promise.all([
      supabase
        .from('architectures')
        .select('id, title, score, nodes, edges, updated_at, folder_id')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false }),
      supabase
        .from('folders')
        .select('id, name, color, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true }),
    ]);
    setArchitectures((archData ?? []) as Architecture[]);
    setFolders((folderData ?? []) as FolderRow[]);
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Project CRUD ─────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!user || creating) return;
    setCreating(true);
    const folder_id =
      selectedFolderId === 'all' || selectedFolderId === 'none'
        ? null
        : selectedFolderId;
    const { data } = await supabase
      .from('architectures')
      .insert({ user_id: user.id, title: 'Untitled Architecture', nodes: [], edges: [], folder_id })
      .select('id')
      .single();
    if (data) router.push(`/editor/${data.id}`);
    else setCreating(false);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    setDeletingId(projectToDelete);
    await supabase.from('architectures').delete().eq('id', projectToDelete);
    setArchitectures(prev => prev.filter(a => a.id !== projectToDelete));
    const newPins = pins.filter(p => p.id !== projectToDelete);
    setPins(newPins); savePins(newPins);
    setDeletingId(null); setProjectToDelete(null);
  };

  // ─── Folder CRUD ──────────────────────────────────────────────────────────

  const handleCreateFolder = async () => {
    if (!user || !newFolderName.trim() || creatingFolder) return;
    setCreatingFolder(true);
    const { data, error } = await supabase
      .from('folders')
      .insert({ user_id: user.id, name: newFolderName.trim(), color: newFolderColor })
      .select('id, name, color, created_at')
      .single();
    if (data && !error) {
      setFolders(prev => [...prev, data as FolderRow]);
      setSelectedFolderId(data.id);
    }
    setNewFolderName(''); setNewFolderColor(FOLDER_COLORS[0]);
    setCreatingFolder(false); setShowCreateFolderModal(false);
  };

  const handleRenameFolder = async () => {
    if (!editingFolder || !editFolderName.trim()) return;
    const trimmed = editFolderName.trim();
    await supabase.from('folders').update({ name: trimmed }).eq('id', editingFolder.id);
    setFolders(prev => prev.map(f => f.id === editingFolder.id ? { ...f, name: trimmed } : f));
    setEditingFolder(null); setEditFolderName('');
  };

  const confirmDeleteFolder = async () => {
    if (!folderToDelete) return;
    setDeletingFolderId(folderToDelete.id);
    // ON DELETE SET NULL handles DB side; mirror locally
    await supabase.from('folders').delete().eq('id', folderToDelete.id);
    setFolders(prev => prev.filter(f => f.id !== folderToDelete.id));
    setArchitectures(prev =>
      prev.map(a => a.folder_id === folderToDelete.id ? { ...a, folder_id: null } : a)
    );
    if (selectedFolderId === folderToDelete.id) setSelectedFolderId('all');
    setDeletingFolderId(null); setFolderToDelete(null);
  };

  // ─── Move project ─────────────────────────────────────────────────────────

  const handleMoveProject = async (archId: string, targetFolderId: string | null) => {
    setMoving(true);
    await supabase.from('architectures').update({ folder_id: targetFolderId }).eq('id', archId);
    setArchitectures(prev =>
      prev.map(a => a.id === archId ? { ...a, folder_id: targetFolderId } : a)
    );
    setMoving(false); setMoveTarget(null);
  };

  // ─── Pin helpers ──────────────────────────────────────────────────────────

  const isPinned = (id: string) => pins.some(p => p.id === id);
  const oldestPin = pins.length > 0 ? pins.reduce((a, b) => a.pinnedAt < b.pinnedAt ? a : b) : null;

  const handlePinClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (isPinned(id)) {
      const next = pins.filter(p => p.id !== id);
      setPins(next); savePins(next); return;
    }
    if (pins.length < 2) {
      const next = [...pins, { id, pinnedAt: Date.now() }];
      setPins(next); savePins(next);
    } else {
      setPinReplaceTarget({ oldPin: oldestPin!, newId: id });
    }
  };

  const confirmPinReplace = () => {
    if (!pinReplaceTarget) return;
    const next = [
      ...pins.filter(p => p.id !== pinReplaceTarget.oldPin.id),
      { id: pinReplaceTarget.newId, pinnedAt: Date.now() },
    ];
    setPins(next); savePins(next); setPinReplaceTarget(null);
  };

  // ─── Derived data ─────────────────────────────────────────────────────────

  const filteredArchitectures = architectures
    .filter(a => {
      if (searchQuery.trim()) return a.title.toLowerCase().includes(searchQuery.toLowerCase().trim());
      if (selectedFolderId === 'all') return true;
      if (selectedFolderId === 'none') return !a.folder_id;
      return a.folder_id === selectedFolderId;
    })
    .sort((a, b) => {
      const ap = pins.find(p => p.id === a.id);
      const bp = pins.find(p => p.id === b.id);
      if (ap && !bp) return -1;
      if (!ap && bp) return 1;
      if (ap && bp) return bp.pinnedAt - ap.pinnedAt;
      return 0;
    });

  const firstName = (
    user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'there'
  ).split(' ')[0];

  const currentFolderLabel =
    selectedFolderId === 'all' ? 'All Projects'
    : selectedFolderId === 'none' ? 'Unsorted'
    : folders.find(f => f.id === selectedFolderId)?.name ?? 'Folder';

  const oldestPinnedArch = oldestPin ? architectures.find(a => a.id === oldestPin.id) : null;
  const newPinArch = pinReplaceTarget ? architectures.find(a => a.id === pinReplaceTarget.newId) : null;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="relative min-h-screen bg-bg text-fg flex flex-col font-sans overflow-hidden">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0d_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0d_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
        <div className="absolute top-0 -left-1/4 w-[800px] h-[800px] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-0 -right-1/4 w-[800px] h-[800px] rounded-full bg-blue-600/20 blur-[120px]" />
      </div>

      {/* ── Header ── */}
      <header className="shrink-0 sticky top-0 z-50 h-[68px] px-6 bg-surface/80 backdrop-blur-xl border-b border-border-c shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ArchieLogo size="md" />
          <div className="h-4 w-px bg-border-c mx-2" />
          <span className="font-mono text-sm text-muted tracking-wider uppercase">Workspace</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Search bar (hidden on very small screens, see mobile version below) */}
          <div className="relative hidden sm:block">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              id="dashboard-search"
              type="text"
              placeholder="Search projects…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 py-[7px] bg-surface-2/80 border border-border-c rounded-xl text-sm text-fg placeholder:text-muted focus:outline-none focus:border-purple-500/50 focus:bg-surface-2 transition-all w-52"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-fg transition-colors">
                <X size={12} />
              </button>
            )}
          </div>

          <button
            id="btn-join-project"
            onClick={() => { setJoinInitialCode(''); setShowJoinModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-surface-2/80 border border-border-c text-muted hover:text-fg hover:border-purple-500/40 hover:bg-purple-500/5 transition-all rounded-xl text-sm font-semibold"
          >
            <Link2 size={15} />
            <span className="hidden sm:inline">Join Project</span>
          </button>

          <button
            id="btn-new-architecture"
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center gap-2 px-4 py-2 bg-surface-2/80 border border-purple-500/30 text-fg hover:bg-purple-500/10 hover:border-purple-500/60 transition-all shadow-[0_0_15px_-3px_rgba(168,85,247,0.15)] rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            <span className="hidden sm:inline">New Project</span>
          </button>

          <ProfileButton />
        </div>
      </header>

      {/* ── Body: sidebar + main ── */}
      <div className="relative z-10 flex flex-1" style={{ height: 'calc(100vh - 68px)' }}>

        {/* ── Sidebar ── */}
        <aside className="w-60 shrink-0 border-r border-border-c bg-surface/40 backdrop-blur-sm flex flex-col overflow-y-auto no-scrollbar">
          <div className="p-4 space-y-1">

            {/* Section label */}
            <p className="px-2 mb-2 text-[10px] font-bold tracking-[0.14em] uppercase text-dim">Views</p>

            {/* All Projects */}
            <SidebarItem
              icon={<Home size={14} />}
              label="All Projects"
              count={architectures.length}
              active={selectedFolderId === 'all' && !searchQuery}
              onClick={() => { setSelectedFolderId('all'); setSearchQuery(''); }}
            />

            {/* Unsorted */}
            <SidebarItem
              icon={<FolderX size={14} />}
              label="Unsorted"
              count={architectures.filter(a => !a.folder_id).length}
              active={selectedFolderId === 'none' && !searchQuery}
              onClick={() => { setSelectedFolderId('none'); setSearchQuery(''); }}
            />

            <div className="h-px bg-border-c/40 my-3" />

            {/* Folders header */}
            <div className="flex items-center justify-between px-2 mb-1.5">
              <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-dim">Folders</p>
              <button
                onClick={() => setShowCreateFolderModal(true)}
                className="p-1 rounded-lg text-dim hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
                title="New Folder"
              >
                <FolderPlus size={13} />
              </button>
            </div>

            {/* Folder list */}
            {folders.length === 0 ? (
              <button
                onClick={() => setShowCreateFolderModal(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-dim border border-dashed border-border-c hover:border-purple-500/30 hover:text-muted transition-all"
              >
                <FolderPlus size={12} />
                Create a folder
              </button>
            ) : (
              <div className="space-y-0.5">
                {folders.map(folder => {
                  const count = architectures.filter(a => a.folder_id === folder.id).length;
                  const isActive = selectedFolderId === folder.id && !searchQuery;

                  if (editingFolder?.id === folder.id) {
                    return (
                      <div key={folder.id} className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-surface-2/60 border border-purple-500/20">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: folder.color }} />
                        <input
                          ref={renameInputRef}
                          value={editFolderName}
                          onChange={e => setEditFolderName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleRenameFolder();
                            if (e.key === 'Escape') { setEditingFolder(null); setEditFolderName(''); }
                          }}
                          className="flex-1 bg-transparent text-xs text-fg focus:outline-none min-w-0"
                        />
                        <button onClick={handleRenameFolder} className="p-0.5 text-purple-400 hover:text-purple-300 transition-colors shrink-0">
                          <Check size={12} />
                        </button>
                        <button onClick={() => { setEditingFolder(null); setEditFolderName(''); }} className="p-0.5 text-dim hover:text-fg transition-colors shrink-0">
                          <X size={12} />
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div key={folder.id} className="group relative">
                      <button
                        onClick={() => { setSelectedFolderId(folder.id); setSearchQuery(''); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all text-left ${
                          isActive
                            ? 'bg-purple-500/15 text-purple-300 border border-purple-500/20'
                            : 'text-muted hover:text-fg hover:bg-surface-2/70'
                        }`}
                      >
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: folder.color }} />
                        <span className="truncate flex-1 pr-6">{folder.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md shrink-0 ${isActive ? 'bg-purple-500/20 text-purple-300' : 'bg-surface-2 text-dim'}`}>
                          {count}
                        </span>
                      </button>

                      {/* Hover actions */}
                      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5 bg-surface/90 backdrop-blur-sm rounded-lg p-0.5 border border-border-c/50 shadow-md">
                        <button
                          onClick={e => { e.stopPropagation(); setEditingFolder(folder); setEditFolderName(folder.name); }}
                          className="p-1 rounded-md text-dim hover:text-fg hover:bg-surface-2 transition-colors"
                          title="Rename"
                        >
                          <Edit2 size={11} />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setFolderToDelete(folder); }}
                          className="p-1 rounded-md text-dim hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete folder"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto no-scrollbar">
          <div className="max-w-[1100px] mx-auto px-8 pt-8 pb-24">

            {/* Page title row */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight mb-1">
                  {searchQuery ? (
                    <>Results for <span className="text-purple-400">"{searchQuery}"</span></>
                  ) : selectedFolderId === 'all' ? (
                    <>{greeting}, {firstName}</>
                  ) : (
                    currentFolderLabel
                  )}
                </h1>
                <p className="text-muted text-sm">
                  {loading ? 'Loading…' : searchQuery
                    ? `${filteredArchitectures.length} result${filteredArchitectures.length !== 1 ? 's' : ''} found`
                    : `${filteredArchitectures.length} project${filteredArchitectures.length !== 1 ? 's' : ''}`
                  }
                </p>
              </div>

              {/* Mobile search */}
              <div className="relative sm:hidden">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search projects…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 pr-8 py-2 bg-surface-2 border border-border-c rounded-xl text-sm text-fg placeholder:text-muted focus:outline-none focus:border-purple-500/50 transition-all w-full"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-fg">
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* ── Card grid ── */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-44 rounded-2xl bg-surface border border-border-c animate-pulse" />
                ))}
              </div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
              >
                {/* ── New project card ── */}
                <motion.button
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  onClick={handleCreate}
                  disabled={creating}
                  className="group h-44 rounded-2xl border-2 border-dashed border-border-c hover:bg-purple-500/5 flex flex-col items-center justify-center gap-3 disabled:opacity-50 transition-all duration-300 hover:-translate-y-0.5 hover:border-purple-500/30"
                >
                  {creating
                    ? <Loader2 size={22} className="animate-spin text-accent" />
                    : (
                      <div className="w-11 h-11 rounded-full bg-surface-2 group-hover:bg-purple-500/10 flex items-center justify-center text-muted group-hover:text-purple-400 transition-colors">
                        <Plus size={20} />
                      </div>
                    )
                  }
                  <span className="text-sm font-medium text-muted group-hover:text-purple-400 transition-colors">
                    {selectedFolderId !== 'all' && selectedFolderId !== 'none'
                      ? `Add to ${currentFolderLabel}`
                      : 'New project'}
                  </span>
                </motion.button>

                {/* ── Project cards ── */}
                {filteredArchitectures.map(arch => {
                  const nodeCount = Array.isArray(arch.nodes) ? arch.nodes.length : 0;
                  const badge = getScoreBadge(arch.score);
                  const pinned = isPinned(arch.id);
                  const archFolder = arch.folder_id ? folders.find(f => f.id === arch.folder_id) : null;

                  return (
                    <motion.div
                      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                      key={arch.id}
                      onClick={() => router.push(`/editor/${arch.id}`)}
                      className={`group relative h-44 bg-surface border rounded-2xl p-5 flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_28px_-5px_rgba(124,58,237,0.12)] ${
                        pinned
                          ? 'border-indigo-500/35 ring-1 ring-indigo-500/15'
                          : 'border-border-c hover:border-purple-500/25'
                      }`}
                    >
                      {/* Pinned badge */}
                      {pinned && (
                        <div className="absolute top-3 left-3 flex items-center gap-1 px-1.5 py-0.5 bg-indigo-500/15 border border-indigo-500/25 rounded-full text-[10px] font-semibold text-indigo-400">
                          <Pin size={8} /> Pinned
                        </div>
                      )}

                      {/* Top row */}
                      <div className={`flex items-start justify-between ${pinned ? 'pt-5' : ''}`}>
                        <h3 className="font-semibold text-base line-clamp-1 group-hover:text-accent transition-colors flex-1 pr-2">
                          {arch.title}
                        </h3>

                        {/* Action buttons — visible on hover */}
                        <div className="flex items-center gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={e => handlePinClick(e, arch.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              pinned
                                ? 'text-indigo-400 hover:bg-indigo-500/10'
                                : 'text-muted hover:text-indigo-400 hover:bg-indigo-500/10 opacity-0 group-hover:opacity-100'
                            }`}
                            title={pinned ? 'Unpin' : 'Pin to top'}
                          >
                            {pinned ? <PinOff size={14} /> : <Pin size={14} />}
                          </button>

                          <button
                            onClick={() => setMoveTarget(arch)}
                            className="p-1.5 rounded-lg text-muted hover:text-purple-400 hover:bg-purple-500/10 transition-colors opacity-0 group-hover:opacity-100"
                            title="Move to folder"
                          >
                            <MoveRight size={14} />
                          </button>

                          <button
                            onClick={() => setProjectToDelete(arch.id)}
                            className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete project"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Folder tag (shown in "All Projects" view) */}
                      {archFolder && selectedFolderId === 'all' && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: archFolder.color }} />
                          <span className="text-[10px] text-dim font-medium tracking-wide">{archFolder.name}</span>
                        </div>
                      )}

                      {/* Bottom meta */}
                      <div className="mt-auto space-y-3">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${badge.color}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted">
                          <span className="flex items-center gap-1.5">
                            <LayoutGrid size={12} /> {nodeCount} nodes
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock size={12} /> {timeAgo(arch.updated_at)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* ── Empty states ── */}
            {!loading && filteredArchitectures.length === 0 && (
              <div className="mt-4 text-center py-20 flex flex-col items-center">
                {searchQuery ? (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-border-c flex items-center justify-center mb-4">
                      <Search size={22} className="text-muted" />
                    </div>
                    <h3 className="text-base font-semibold mb-1.5">No results</h3>
                    <p className="text-sm text-muted">No projects match <span className="text-fg">"{searchQuery}"</span></p>
                    <button onClick={() => setSearchQuery('')} className="mt-4 text-xs text-purple-400 hover:text-purple-300 transition-colors">Clear search</button>
                  </>
                ) : selectedFolderId !== 'all' ? (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-border-c flex items-center justify-center mb-4">
                      <FolderOpen size={22} className="text-muted" />
                    </div>
                    <h3 className="text-base font-semibold mb-1.5">This folder is empty</h3>
                    <p className="text-sm text-muted mb-6">Create a new project or move existing ones here</p>
                    <button
                      onClick={handleCreate}
                      className="flex items-center gap-2 px-5 py-2.5 bg-purple-500/15 text-purple-300 border border-purple-500/25 rounded-xl text-sm font-semibold hover:bg-purple-500/20 transition-all"
                    >
                      <Plus size={15} /> Add Project
                    </button>
                  </>
                ) : (
                  <>
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                      className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center mb-4"
                    >
                      <div className="absolute inset-0 bg-indigo-500/10 blur-xl rounded-full" />
                      <Sparkles size={22} className="text-accent relative z-10" />
                    </motion.div>
                    <h3 className="text-base font-semibold mb-1.5">Ready to architect?</h3>
                    <p className="text-sm text-muted max-w-xs text-center mb-6">Create your first architecture diagram and start building.</p>
                    <button
                      onClick={handleCreate}
                      className="flex items-center gap-2 px-5 py-2.5 bg-fg text-bg rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
                    >
                      <Plus size={15} /> Create Architecture
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ════════════════ MODALS ════════════════ */}

      {/* Create Folder */}
      <AnimatePresence>
        {showCreateFolderModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={e => { if (e.target === e.currentTarget) { setShowCreateFolderModal(false); setNewFolderName(''); } }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 8 }}
              className="bg-surface border border-border-c rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center">
                  <FolderPlus size={16} className="text-purple-400" />
                </div>
                <h2 className="text-base font-semibold">New Folder</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-dim mb-1.5">Name</label>
                  <input
                    autoFocus
                    value={newFolderName}
                    onChange={e => setNewFolderName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleCreateFolder();
                      if (e.key === 'Escape') { setShowCreateFolderModal(false); setNewFolderName(''); }
                    }}
                    placeholder="e.g. Microservices"
                    className="w-full bg-surface-2 border border-border-c rounded-xl px-3.5 py-2.5 text-sm text-fg placeholder:text-muted focus:outline-none focus:border-purple-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-dim mb-2">Color</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {FOLDER_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setNewFolderColor(color)}
                        className={`w-7 h-7 rounded-full transition-all duration-200 ${
                          newFolderColor === color
                            ? 'ring-2 ring-white/50 ring-offset-2 ring-offset-surface scale-110'
                            : 'opacity-60 hover:opacity-100 hover:scale-105'
                        }`}
                        style={{ background: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => { setShowCreateFolderModal(false); setNewFolderName(''); }}
                  className="px-4 py-2 text-sm text-muted hover:text-fg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim() || creatingFolder}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-500/15 text-purple-300 border border-purple-500/25 rounded-xl font-semibold hover:bg-purple-500/20 disabled:opacity-40 transition-all"
                >
                  {creatingFolder ? <Loader2 size={13} className="animate-spin" /> : <FolderPlus size={13} />}
                  Create Folder
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Move to Folder */}
      <AnimatePresence>
        {moveTarget && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={e => { if (e.target === e.currentTarget && !moving) setMoveTarget(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 8 }}
              className="bg-surface border border-border-c rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center shrink-0">
                  <MoveRight size={16} className="text-purple-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-base font-semibold">Move Project</p>
                  <p className="text-xs text-muted truncate">"{moveTarget.title}"</p>
                </div>
              </div>

              <p className="text-xs text-dim mt-3 mb-3">Select destination:</p>

              <div className="space-y-1 max-h-56 overflow-y-auto no-scrollbar pr-0.5">
                {/* No folder */}
                <MoveOption
                  icon={<FolderX size={14} className="text-dim" />}
                  label="No Folder (Unsorted)"
                  active={!moveTarget.folder_id}
                  loading={moving}
                  onClick={() => !moveTarget.folder_id || handleMoveProject(moveTarget.id, null)}
                />

                {folders.map(folder => (
                  <MoveOption
                    key={folder.id}
                    icon={<div className="w-3 h-3 rounded-full" style={{ background: folder.color }} />}
                    label={folder.name}
                    active={moveTarget.folder_id === folder.id}
                    loading={moving}
                    onClick={() => moveTarget.folder_id !== folder.id && handleMoveProject(moveTarget.id, folder.id)}
                  />
                ))}

                {folders.length === 0 && (
                  <p className="text-xs text-dim text-center py-4">
                    No folders yet —{' '}
                    <button
                      onClick={() => { setMoveTarget(null); setShowCreateFolderModal(true); }}
                      className="text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      create one
                    </button>
                  </p>
                )}
              </div>

              <div className="flex justify-end mt-5">
                <button
                  onClick={() => setMoveTarget(null)}
                  disabled={moving}
                  className="px-4 py-2 text-sm text-muted hover:text-fg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Project */}
      <AnimatePresence>
        {projectToDelete && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface border border-border-c rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h2 className="text-base font-semibold mb-1">Delete Project</h2>
              <p className="text-sm text-muted mb-5">This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setProjectToDelete(null)} disabled={!!deletingId} className="px-4 py-2 text-sm text-muted hover:text-fg transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={!!deletingId}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/15 transition-all disabled:opacity-50"
                >
                  {deletingId ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Folder */}
      <AnimatePresence>
        {folderToDelete && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={e => { if (e.target === e.currentTarget && !deletingFolderId) setFolderToDelete(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface border border-border-c rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <Folder size={16} className="text-red-400" />
                </div>
                <h2 className="text-base font-semibold">Delete Folder</h2>
              </div>
              <p className="text-sm text-muted leading-relaxed mb-5">
                Delete <span className="text-fg font-medium">"{folderToDelete.name}"</span>?{' '}
                Projects inside will move to <span className="text-fg font-medium">Unsorted</span>.
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setFolderToDelete(null)} disabled={!!deletingFolderId} className="px-4 py-2 text-sm text-muted hover:text-fg transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteFolder}
                  disabled={!!deletingFolderId}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/15 transition-all disabled:opacity-50"
                >
                  {deletingFolderId ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  Delete Folder
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pin Replace */}
      <AnimatePresence>
        {pinReplaceTarget && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface border border-border-c rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Pin size={16} className="text-indigo-400" />
                </div>
                <h2 className="text-base font-semibold">Replace Pin?</h2>
              </div>
              <p className="text-sm text-muted leading-relaxed mb-5">
                Pin <span className="text-fg font-medium">"{newPinArch?.title}"</span> by replacing{' '}
                <span className="text-fg font-medium">"{oldestPinnedArch?.title}"</span>?
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setPinReplaceTarget(null)} className="px-4 py-2 text-sm text-muted hover:text-fg transition-colors">Cancel</button>
                <button
                  onClick={confirmPinReplace}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl hover:bg-indigo-500/15 transition-all font-medium"
                >
                  <Pin size={13} /> Replace & Pin
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join Modal */}
      {showJoinModal && (
        <JoinModal initialCode={joinInitialCode} onClose={() => setShowJoinModal(false)} />
      )}
    </div>
  );
}

// ─── Small reusable atoms ─────────────────────────────────────────────────────

function SidebarItem({
  icon, label, count, active, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
        active
          ? 'bg-purple-500/15 text-purple-300 border border-purple-500/20'
          : 'text-muted hover:text-fg hover:bg-surface-2/70'
      }`}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${active ? 'bg-purple-500/20 text-purple-300' : 'bg-surface-2 text-dim'}`}>
        {count}
      </span>
    </button>
  );
}

function MoveOption({
  icon, label, active, loading, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading || active}
      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
        active
          ? 'bg-surface-2 border border-border-c text-muted cursor-default'
          : 'hover:bg-surface-2 text-muted hover:text-fg'
      }`}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {active && <Check size={13} className="text-purple-400 shrink-0" />}
      {loading && !active && <Loader2 size={13} className="animate-spin shrink-0 text-muted" />}
    </button>
  );
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg flex items-center justify-center">
          <Loader2 size={28} className="animate-spin text-accent" />
        </div>
      }
    >
      <DashboardPageInner />
    </Suspense>
  );
}
