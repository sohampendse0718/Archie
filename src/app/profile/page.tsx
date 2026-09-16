'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useTheme } from '@/components/ThemeProvider';
import { ArrowLeft, LogOut, Sun, Moon, Sparkles, Mail, Shield } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useState } from 'react';
import { motion } from 'framer-motion';

function getInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return 'ME';
}

export default function ProfilePage() {
  const { user, supabase } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const { isAutosaveEnabled, setIsAutosaveEnabled } = useSettingsStore();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.user_name ||
    user?.email ||
    'User';
  const email = user?.email || '';
  const avatarUrl: string | undefined = user?.user_metadata?.avatar_url;
  const provider = user?.app_metadata?.provider;
  const initials = getInitials(displayName !== email ? displayName : null, email);
  const providerLabel = provider === 'google' ? 'Google' : provider === 'github' ? 'GitHub' : 'Email';

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const sectionHeadClass = "px-5 py-3 border-b border-white/5 text-[11px] font-semibold tracking-[0.08em] uppercase text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5";
  const cardClass = "bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200/50 dark:border-white/5 hover:border-purple-400 dark:hover:border-purple-500/30 transition-all duration-300 shadow-lg shadow-zinc-200/50 dark:shadow-xl dark:shadow-none rounded-[14px] overflow-hidden relative z-10 flex flex-col";

  return (
    <div className="relative min-h-screen bg-bg text-fg flex flex-col font-sans overflow-y-auto overflow-x-hidden no-scrollbar">
      {/* ── Dynamic Background ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0d_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0d_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
        <div className="absolute top-0 -left-1/4 w-[800px] h-[800px] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-0 -right-1/4 w-[800px] h-[800px] rounded-full bg-blue-600/20 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="shrink-0 sticky top-0 z-50 h-[72px] px-6 bg-surface/80 backdrop-blur-xl border-b border-border-c shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex items-center justify-between">
        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-border-c rounded-lg text-[13px] font-medium text-muted hover:text-fg hover:bg-surface-2 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div className="w-px h-[18px] bg-border-c mx-1" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-indigo-500/12 border border-indigo-500/25 flex items-center justify-center">
              <Sparkles size={13} className="text-indigo-400" />
            </div>
            <span className="text-sm font-semibold text-fg">Settings</span>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 w-full max-w-[520px] mx-auto px-6 py-9 flex flex-col gap-4 relative z-10">

        {/* Account card */}
        <div className={cardClass}>
          <div className={sectionHeadClass}><Shield size={12} /> Account</div>
          <div className="p-5 flex items-center gap-4">
            <div className="w-[60px] h-[60px] rounded-[14px] overflow-hidden shrink-0 border border-white/10 flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-purple-500/20 shadow-[inset_0_2px_10px_rgba(255,255,255,0.1)] text-indigo-400 font-bold text-xl">
              {avatarUrl
                ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                : initials}
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">{displayName}</span>
              <span className="flex items-center gap-1.5 text-[13px] text-zinc-500 dark:text-zinc-400">
                <Mail size={12} /> {email}
              </span>
              <span className="inline-flex items-center w-fit px-2 py-0.5 rounded-md mt-0.5 bg-surface-2 border border-border-c text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                via {providerLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Appearance card */}
        <div className={cardClass}>
          <div className={sectionHeadClass}><Sun size={12} /> Appearance</div>
          <div className="px-5 py-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 m-0">Theme</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-[3px] mb-0">Changes all pages instantly</p>
            </div>
            {/* Toggle */}
            <div className="flex items-center gap-1 bg-surface-2 border border-border-c rounded-[10px] p-1">
              {(['dark', 'light'] as const).map(t => (
                <button
                  key={t}
                  id={`btn-theme-${t}`}
                  onClick={() => setTheme(t)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] border-none text-xs font-semibold cursor-pointer transition-all duration-200 ${
                    theme === t 
                      ? (t === 'dark' ? 'bg-[#27272a] text-[#e4e4e7] shadow-[0_1px_3px_rgba(0,0,0,0.15)]' : 'bg-white text-[#18181b] shadow-[0_1px_3px_rgba(0,0,0,0.15)]') 
                      : 'bg-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  {t === 'dark' ? <Moon size={13} /> : <Sun size={13} />}
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>


        {/* Preferences card */}
        <div className={cardClass}>
          <div className={sectionHeadClass}><Shield size={12} /> Preferences</div>
          <div className="px-5 py-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 m-0">Autosave</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-[3px] mb-0">Automatically save diagram changes</p>
            </div>
            {/* Custom Toggle Switch */}
            <div
              onClick={() => setIsAutosaveEnabled(!isAutosaveEnabled)}
              className={`w-11 h-6 rounded-full border border-border-c cursor-pointer relative transition-colors duration-200 ${isAutosaveEnabled ? 'bg-indigo-400' : 'bg-surface-2'}`}
            >
              <div className={`absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-all duration-200 ${isAutosaveEnabled ? 'left-[22px]' : 'left-[2px]'}`} />
            </div>
          </div>
        </div>

        {/* Sign out card */}
        <div className={cardClass}>
          <div className={sectionHeadClass}><LogOut size={12} className="text-red-600 dark:text-red-400" /><span className="text-red-600 dark:text-red-400">Session</span></div>
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 m-0">Sign out</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-[3px] mb-0">Redirects to login page</p>
            </div>
            <button
              id="btn-profile-signout"
              onClick={() => setShowSignOutModal(true)}
              disabled={signingOut}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-500/20 bg-transparent text-red-600 dark:text-red-400 text-[13px] font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-500/50 transition-colors"
            >
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </div>
      </main>

      {/* Sign Out Confirmation Modal */}
      {showSignOutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex flex-col gap-2"
          >
            <h2 className="text-lg font-bold text-zinc-100 m-0">Sign Out</h2>
            <p className="text-sm text-zinc-400 mb-4 mt-1">
              Are you sure you want to end your session? You will need to log back in to access your architectures.
            </p>
            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={() => setShowSignOutModal(false)}
                className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="px-4 py-2 text-sm font-medium text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 rounded-lg transition-all"
              >
                Sign Out
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
