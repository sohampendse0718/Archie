'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Copy, Check, Link2, Hash, Eye, Pencil, Loader2, Share2,
} from 'lucide-react';

type Permission = 'view' | 'edit';

interface ShareModalProps {
  projectId: string;
  projectTitle: string;
  onClose: () => void;
}

export default function ShareModal({ projectId, projectTitle, onClose }: ShareModalProps) {
  const [code, setCode] = useState<string | null>(null);
  const [permission, setPermission] = useState<Permission>('view');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [updatingPermission, setUpdatingPermission] = useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const directLink = code ? `${origin}/join?code=${code}` : '';

  const fetchCode = useCallback(async (perm: Permission) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, permission: perm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate share code');
      setCode(data.code);
      setPermission(data.permission);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchCode('view');
  }, [fetchCode]);

  const handlePermissionChange = async (perm: Permission) => {
    if (perm === permission || updatingPermission) return;
    setUpdatingPermission(true);
    setPermission(perm);
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, permission: perm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCode(data.code);
    } catch {
      setPermission(permission); // revert
    } finally {
      setUpdatingPermission(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'code') {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
  };

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
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
                <Share2 size={17} className="text-indigo-400" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-fg">Share Project</h2>
                <p className="text-xs text-muted truncate max-w-[200px]">{projectTitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted hover:text-fg hover:bg-surface-2 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Permission toggle */}
            <div>
              <p className="text-xs font-medium text-muted mb-2 uppercase tracking-wider">Access Level</p>
              <div className="flex gap-2">
                {(['view', 'edit'] as Permission[]).map((perm) => (
                  <button
                    key={perm}
                    onClick={() => handlePermissionChange(perm)}
                    disabled={updatingPermission}
                    className={`flex items-center gap-2 flex-1 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                      permission === perm
                        ? perm === 'view'
                          ? 'bg-blue-500/10 border-blue-500/40 text-blue-400'
                          : 'bg-purple-500/10 border-purple-500/40 text-purple-400'
                        : 'bg-surface-2 border-border-c text-muted hover:text-fg hover:border-border-c/80'
                    }`}
                  >
                    {perm === 'view' ? <Eye size={14} /> : <Pencil size={14} />}
                    {perm === 'view' ? 'View Only' : 'Can Edit'}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin text-accent" />
              </div>
            ) : error ? (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
                {error}
              </div>
            ) : (
              <>
                {/* Code block */}
                <div>
                  <p className="text-xs font-medium text-muted mb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <Hash size={11} /> Share Code
                  </p>
                  <div className="flex items-center gap-2 bg-surface-2 border border-border-c rounded-xl px-4 py-3">
                    <span className="flex-1 font-mono text-2xl font-bold tracking-[0.2em] text-fg select-all">
                      {code}
                    </span>
                    <button
                      onClick={() => copyToClipboard(code!, 'code')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        copiedCode
                          ? 'bg-green-500/15 border border-green-500/30 text-green-400'
                          : 'bg-surface border border-border-c text-muted hover:text-fg hover:border-accent/40'
                      }`}
                    >
                      {copiedCode ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                    </button>
                  </div>
                </div>

                {/* Link block */}
                <div>
                  <p className="text-xs font-medium text-muted mb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <Link2 size={11} /> Direct Link
                  </p>
                  <div className="flex items-center gap-2 bg-surface-2 border border-border-c rounded-xl px-3 py-2.5">
                    <span className="flex-1 text-xs text-muted truncate font-mono">
                      {directLink}
                    </span>
                    <button
                      onClick={() => copyToClipboard(directLink, 'link')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all ${
                        copiedLink
                          ? 'bg-green-500/15 border border-green-500/30 text-green-400'
                          : 'bg-surface border border-border-c text-muted hover:text-fg hover:border-accent/40'
                      }`}
                    >
                      {copiedLink ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                    </button>
                  </div>
                </div>

                {/* Hint */}
                <p className="text-xs text-muted text-center">
                  Anyone with the code or link can{' '}
                  <span className="text-fg font-medium">
                    {permission === 'view' ? 'view and save a copy of' : 'view, edit, and save'}
                  </span>{' '}
                  this project.
                </p>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
