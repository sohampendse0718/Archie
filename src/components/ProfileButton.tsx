'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Settings } from 'lucide-react';
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
  const [signingOut, setSigningOut] = useState(false);
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
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push('/login');
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
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger */}
      <button
        id="btn-profile"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '5px 10px 5px 5px',
          background: 'var(--surface-2)', border: '1px solid var(--border-c)',
          borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
        }}
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
          </div>

          {/* Sign out */}
          <div style={{ padding: '0 6px 6px', borderTop: '1px solid var(--border-c)', paddingTop: 6 }}>
            <button
              id="btn-signout"
              onClick={handleSignOut}
              disabled={signingOut}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', border: 'none', borderRadius: 8,
                background: 'transparent', cursor: signingOut ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', fontSize: 13, fontWeight: 500, color: '#f87171', textAlign: 'left',
                opacity: signingOut ? 0.6 : 1,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.08)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              <LogOut size={14} style={{ flexShrink: 0 }} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
