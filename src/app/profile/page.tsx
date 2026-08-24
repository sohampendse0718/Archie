'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useTheme } from '@/components/ThemeProvider';
import { ArrowLeft, LogOut, Sun, Moon, Sparkles, Mail, Shield } from 'lucide-react';
import { useState } from 'react';

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

  const card: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border-c)',
    borderRadius: 14,
    overflow: 'hidden',
  };
  const sectionHead: React.CSSProperties = {
    padding: '12px 20px',
    borderBottom: '1px solid var(--border-c)',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--muted)',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)', fontFamily: 'inherit', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30, height: 56,
        background: 'var(--surface)', borderBottom: '1px solid var(--border-c)',
        display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px',
      }}>
        <button
          onClick={() => router.back()}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', background: 'none',
            border: '1px solid var(--border-c)', borderRadius: 8,
            fontSize: 13, fontWeight: 500, color: 'var(--muted)',
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ width: 1, height: 18, background: 'var(--border-c)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={13} color="#818cf8" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>Settings</span>
        </div>
      </header>

      {/* Body */}
      <main style={{ flex: 1, maxWidth: 520, width: '100%', margin: '0 auto', padding: '36px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Account card */}
        <div style={card}>
          <div style={sectionHead}><Shield size={12} /> Account</div>
          <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 60, height: 60, borderRadius: 14, overflow: 'hidden', flexShrink: 0,
              border: '1px solid var(--border-c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(99,102,241,0.12)', fontSize: 20, fontWeight: 700, color: '#818cf8',
            }}>
              {avatarUrl
                ? <img src={avatarUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg)' }}>{displayName}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)' }}>
                <Mail size={12} /> {email}
              </span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', width: 'fit-content',
                padding: '2px 8px', borderRadius: 6, marginTop: 2,
                background: 'var(--surface-2)', border: '1px solid var(--border-c)',
                fontSize: 11, fontWeight: 500, color: 'var(--muted)',
              }}>
                via {providerLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Appearance card */}
        <div style={card}>
          <div style={sectionHead}><Sun size={12} /> Appearance</div>
          <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', margin: 0 }}>Theme</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: '3px 0 0' }}>Changes all pages instantly</p>
            </div>
            {/* Toggle */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'var(--surface-2)', border: '1px solid var(--border-c)',
              borderRadius: 10, padding: 4,
            }}>
              {(['dark', 'light'] as const).map(t => (
                <button
                  key={t}
                  id={`btn-theme-${t}`}
                  onClick={() => setTheme(t)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 7, border: 'none',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                    background: theme === t ? (t === 'dark' ? '#27272a' : '#fff') : 'transparent',
                    color: theme === t ? (t === 'dark' ? '#e4e4e7' : '#18181b') : 'var(--muted)',
                    boxShadow: theme === t ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
                  }}
                >
                  {t === 'dark' ? <Moon size={13} /> : <Sun size={13} />}
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sign out card */}
        <div style={card}>
          <div style={sectionHead} ><LogOut size={12} style={{ color: '#f87171' }} /><span style={{ color: '#f87171' }}>Session</span></div>
          <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', margin: 0 }}>Sign out</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: '3px 0 0' }}>Redirects to login page</p>
            </div>
            <button
              id="btn-profile-signout"
              onClick={handleSignOut}
              disabled={signingOut}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 16px', borderRadius: 9, border: '1px solid rgba(248,113,113,0.3)',
                background: 'rgba(248,113,113,0.08)', color: '#f87171',
                fontSize: 13, fontWeight: 600, cursor: signingOut ? 'not-allowed' : 'pointer',
                opacity: signingOut ? 0.6 : 1, fontFamily: 'inherit',
              }}
            >
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
