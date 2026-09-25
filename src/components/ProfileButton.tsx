'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

function getInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return 'ME';
}

export default function ProfileButton() {
  const { user, supabase } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const handleSignOut = async () => {
    setOpen(false);
    await supabase.auth.signOut();
    router.push('/landing');
    router.refresh();
  };

  if (!user) return null;

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.user_metadata?.user_name ||
    user.email ||
    'User';
  const firstName = displayName.split(' ')[0];
  const initials = getInitials(
    user.user_metadata?.full_name || user.user_metadata?.name,
    user.email
  );
  const avatarUrl: string | undefined = user.user_metadata?.avatar_url;
  const provider = user.app_metadata?.provider;
  const providerLabel = provider === 'google' ? 'Google' : provider === 'github' ? 'GitHub' : 'Email';

  return (
    <>
      <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger */}
      <button
        id="btn-profile"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-2 py-1 pl-1 pr-2.5 bg-transparent hover:bg-white/5 border border-white/10 rounded-xl cursor-pointer transition-colors"
      >
        {/* Avatar */}
        <div style={{
          width: 28, height: 28, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
          border: '1px solid var(--border-c)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(99,102,241,0.15)', fontSize: 11, fontWeight: 700, color: '#818cf8',
        }}>
          {avatarUrl
            ? <img src={avatarUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initials}
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>{firstName}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: 'var(--muted)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
          width: 240, background: 'var(--surface)',
          border: '1px solid var(--border-c)', borderRadius: 14,
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)', zIndex: 50,
          overflow: 'hidden',
        }}>
          {/* User info */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-c)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, overflow: 'hidden', flexShrink: 0,
              border: '1px solid var(--border-c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(99,102,241,0.15)', fontSize: 14, fontWeight: 700, color: '#818cf8',
            }}>
              {avatarUrl
                ? <img src={avatarUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</p>
              <p style={{ fontSize: 11, color: 'var(--muted)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
              <span style={{
                display: 'inline-block', marginTop: 4, padding: '1px 6px',
                borderRadius: 5, border: '1px solid var(--border-c)',
                background: 'var(--surface-2)', fontSize: 10, fontWeight: 500, color: 'var(--muted)',
              }}>via {providerLabel}</span>
            </div>
          </div>

          {/* Menu items */}
          <div style={{ padding: 6 }}>
            <button
              id="btn-profile-settings"
              onClick={() => { setOpen(false); router.push('/profile'); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', border: 'none', borderRadius: 8,
                background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 13, fontWeight: 500, color: 'var(--fg)', textAlign: 'left',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-2)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              <Settings size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
              Settings & Appearance
            </button>

            <div style={{ height: 1, background: 'var(--border-c)', margin: '4px 0' }} />

            <button
              id="btn-profile-signout"
              onClick={() => { setOpen(false); setShowConfirm(true); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', border: 'none', borderRadius: 8,
                background: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 13, fontWeight: 500, color: '#ef4444', textAlign: 'left',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239, 68, 68, 0.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              <LogOut size={14} style={{ color: '#ef4444', flexShrink: 0 }} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>

      {/* Sign-out confirmation portal — rendered on document.body to escape any ancestor stacking context */}
      {showConfirm && createPortal(
        <>
          <style>{`
            @keyframes _so_fade { from { opacity:0 } to { opacity:1 } }
            @keyframes _so_pop  { from { opacity:0; transform:scale(0.9) translateY(-10px) } to { opacity:1; transform:scale(1) translateY(0) } }
          `}</style>
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 99999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            animation: '_so_fade 0.18s ease forwards',
          }}>
            <div style={{
              background: '#18181b',
              border: '1px solid #3f3f46',
              borderRadius: 16,
              padding: '28px 28px 24px',
              width: '100%', maxWidth: 360,
              margin: '0 16px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.7)',
              display: 'flex', flexDirection: 'column', gap: 8,
              animation: '_so_pop 0.22s cubic-bezier(0.34,1.56,0.64,1) forwards',
            }}>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#ededed' }}>Sign Out</p>
              <p style={{ margin: '4px 0 20px', fontSize: 13, color: '#71717a', lineHeight: 1.5 }}>
                Are you sure you want to sign out?
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  onClick={() => setShowConfirm(false)}
                  style={{
                    padding: '8px 18px', borderRadius: 8,
                    border: '1px solid #3f3f46',
                    background: '#27272a', cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: 13, fontWeight: 500, color: '#ededed',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSignOut}
                  style={{
                    padding: '8px 18px', borderRadius: 8,
                    border: '1px solid rgba(239,68,68,0.3)',
                    background: 'rgba(239,68,68,0.1)', cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: 13, fontWeight: 500, color: '#ef4444',
                  }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
