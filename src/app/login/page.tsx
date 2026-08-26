'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Sparkles, Mail, Lock, Eye, EyeOff, Zap, Shield, Brain, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Read error from callback URL param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'auth_callback_failed') {
      setError('Authentication failed. Please try again.');
    }
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading('email');

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setMessage('Check your email for a confirmation link.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/');
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(null);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setError(null);
    setLoading(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'OAuth sign-in failed.');
      setLoading(null);
    }
  };

  const features = [
    { icon: Brain, label: 'AI-Powered Architecture', desc: 'Generate full system designs from a single prompt' },
    { icon: Zap, label: 'Real-Time Simulation', desc: 'Simulate failures and blast radius instantly' },
    { icon: Shield, label: 'Architecture Scoring', desc: 'Get a quality score with actionable insights' },
  ];

  return (
    <div className="min-h-screen w-full bg-bg bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] flex overflow-hidden animate-fade-in">
      {/* Schematic lines / nodes overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-15">
        <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <g stroke="currentColor" fill="none" strokeWidth="1.5" className="text-cyan-500/30">
            <path d="M 400 300 L 600 300 L 600 500 L 800 500" strokeDasharray="4 4" />
            <path d="M 600 500 L 600 700 L 400 700" strokeDasharray="4 4" />
            <circle cx="400" cy="300" r="5" fill="currentColor" />
            <circle cx="600" cy="500" r="5" fill="currentColor" />
            <circle cx="800" cy="500" r="5" fill="currentColor" />
            <circle cx="400" cy="700" r="5" fill="currentColor" />
          </g>
          <g stroke="currentColor" fill="none" strokeWidth="1" className="text-purple-500/30">
            <path d="M 700 800 L 700 600 L 900 600" />
            <circle cx="700" cy="800" r="4" fill="currentColor" />
            <circle cx="900" cy="600" r="4" fill="currentColor" />
          </g>
        </svg>
      </div>
      
      {/* ── Left Panel: Branding ── */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] p-14 relative overflow-hidden">
        {/* Subtle gradient orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-blue-600/8 blur-[100px]" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.2)] animate-pulse">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 space-y-2 mt-auto mb-10">
          {/* Massive ARCHIE Header */}
          <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <h1 className="text-[100px] lg:text-[140px] font-black tracking-tighter leading-none bg-gradient-to-b from-slate-300 via-cyan-700 to-slate-400 bg-clip-text text-transparent">
              ARCHIE
            </h1>
          </div>

          <div className="animate-fade-in-up space-y-3" style={{ animationDelay: '300ms' }}>
            <p className="text-xs font-mono font-semibold tracking-[0.2em] uppercase text-indigo-400">AI Architecture Studio</p>
            <h2 className="text-5xl font-bold text-fg leading-[1.1] tracking-tight">
              Design systems{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                that scale.
              </span>
            </h2>
            <p className="text-muted text-lg leading-relaxed max-w-sm mt-4">
              Describe your product in plain English. Archie generates production-ready architecture diagrams with scoring and failure analysis.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3 pt-6">
            {features.map(({ icon: Icon, label, desc }, i) => (
              <div 
                key={label} 
                className="flex items-start gap-4 group p-3.5 rounded-xl border border-border-c bg-surface/50 backdrop-blur-sm animate-fade-in-up hover:border-indigo-500/40 transition-colors"
                style={{ animationDelay: `${400 + i * 100}ms` }}
              >
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-surface-2 border border-border-c flex items-center justify-center group-hover:border-indigo-500/40 group-hover:bg-indigo-500/10 transition-colors">
                  <Icon className="w-4 h-4 text-muted group-hover:text-indigo-500 transition-colors" />
                </div>
                <div>
                  <p className="text-fg text-sm font-medium">{label}</p>
                  <p className="text-dim text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="relative z-10 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
          <p className="text-dim text-sm">
            &quot;Architecture is the art of how to waste space.&quot; — Philip Johnson
          </p>
        </div>
      </div>

      {/* ── Right Panel: Auth Card ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 relative">
        {/* Subtle right-side glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-indigo-600/20 to-purple-600/20 blur-[120px]" />
        </div>

        <div className="relative w-full max-w-[400px] animate-fade-scale-in" style={{ animationDelay: '500ms' }}>
          {/* Card */}
          <div className="relative bg-surface/80 border border-border-c rounded-2xl p-8 shadow-[0_0_50px_-12px_rgba(79,70,229,0.15)] backdrop-blur-xl">
            {/* Animated gradient border */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
              <div className="absolute inset-[-1px] rounded-2xl bg-gradient-to-br from-indigo-500/20 via-transparent to-blue-500/20 opacity-60" />
            </div>

            {/* Mobile logo */}
            <div className="flex items-center gap-3 mb-7 lg:hidden">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 animate-pulse">
                <Sparkles className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-lg font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">Archie</span>
            </div>

            {/* Heading */}
            <div className="mb-7">
              <h2 className="text-fg text-2xl font-bold tracking-tight">
                {mode === 'signin' ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-muted text-sm mt-1">
                {mode === 'signin'
                  ? 'Sign in to your architecture workspace'
                  : 'Start designing with AI-powered tools'}
              </p>
            </div>

            {/* Error / Success */}
            {error && (
              <div className="mb-5 flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3.5">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm leading-relaxed">{error}</p>
              </div>
            )}
            {message && (
              <div className="mb-5 bg-green-500/10 border border-green-500/20 rounded-xl p-3.5">
                <p className="text-green-400 text-sm">{message}</p>
              </div>
            )}

              <div className="space-y-3 mb-6">
              <button
                id="btn-google"
                onClick={() => handleOAuth('google')}
                disabled={loading !== null}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-surface-2 hover:bg-surface border border-border-c rounded-xl text-fg text-sm font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed group hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/10"
              >
                {loading === 'google' ? (
                  <span className="w-4 h-4 border-2 border-dim border-t-fg rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Continue with Google
              </button>

              <button
                id="btn-github"
                onClick={() => handleOAuth('github')}
                disabled={loading !== null}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-surface-2 hover:bg-surface border border-border-c rounded-xl text-fg text-sm font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed group hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/10"
              >
                {loading === 'github' ? (
                  <span className="w-4 h-4 border-2 border-dim border-t-fg rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 fill-current text-fg" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                )}
                Continue with GitHub
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-border-c" />
              <span className="text-dim text-xs font-medium">or continue with email</span>
              <div className="flex-1 h-px bg-border-c" />
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-muted text-xs font-medium mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-2 border border-border-c focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 rounded-xl text-fg text-sm placeholder:text-dim outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-muted text-xs font-medium mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-2.5 bg-surface-2 border border-border-c focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 rounded-xl text-fg text-sm placeholder:text-dim outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-fg transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {mode === 'signup' && (
                  <p className="text-dim text-xs mt-1.5">Minimum 6 characters</p>
                )}
              </div>

              <button
                id="btn-email-submit"
                type="submit"
                disabled={loading !== null}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white text-sm font-semibold tracking-wide transition-all duration-150 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:-translate-y-0.5"
              >
                {loading === 'email' ? (
                  <span className="w-4 h-4 border-2 border-indigo-300 border-t-white rounded-full animate-spin" />
                ) : (
                  mode === 'signin' ? 'Sign in' : 'Create account'
                )}
              </button>
            </form>

            {/* Toggle Mode */}
            <p className="text-center text-muted text-sm mt-6">
              {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setMessage(null); }}
                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Footer */}
          <p className="text-center text-dim text-xs mt-6">
            By continuing, you agree to our{' '}
            <span className="text-muted">Terms of Service</span> &amp;{' '}
            <span className="text-muted">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
