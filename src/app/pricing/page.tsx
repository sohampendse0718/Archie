'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowLeft, Check, X, ChevronRight } from 'lucide-react';
import ArchieLogo from '@/components/Logo';

/* ─────────────────────────────────────────────────
   Shared animation variants
───────────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay },
  }),
};

function RevealSection({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      custom={delay}
      variants={fadeUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function PricingPage() {
  return (
    <div className="relative min-h-screen bg-bg text-fg overflow-x-hidden pt-20">
      
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* NAV BAR */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 bg-bg/70 backdrop-blur-xl border-b border-white/[0.06]"
      >
        <div className="flex items-center gap-4">
          <Link href="/landing" className="flex items-center justify-center w-9 h-9 rounded-full bg-surface-2 hover:bg-surface border border-border-c transition-colors group">
            <ArrowLeft className="w-4 h-4 text-muted group-hover:text-fg transition-colors" />
          </Link>
          <Link href="/landing" className="relative z-10 hidden sm:block">
            <ArchieLogo size="md" />
          </Link>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center px-4 py-1.5 rounded-xl text-sm font-medium text-muted hover:text-fg border border-white/[0.08] hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-200"
          >
            Log in
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-semibold text-bg bg-fg hover:bg-fg/90 transition-all duration-200 shadow-sm"
          >
            Sign up <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </motion.header>

      {/* PRICING SECTION */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <RevealSection className="text-center mb-16">
            <span className="inline-block text-xs font-mono font-semibold tracking-widest uppercase text-cyan-400 mb-4">
              Pricing
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-fg mb-4">
              Simple, transparent pricing.
            </h1>
            <p className="text-muted text-lg max-w-xl mx-auto">
              Choose the plan that fits your architectural needs.
            </p>
          </RevealSection>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {/* Free Plan */}
            <RevealSection delay={0.1} className="relative rounded-2xl border border-white/[0.07] bg-white/[0.03] p-8 flex flex-col">
              <h3 className="text-xl font-bold text-fg mb-2">Starter</h3>
              <p className="text-sm text-muted mb-6">For individuals exploring AI architecture.</p>
              <div className="mb-6">
                <span className="text-4xl font-black text-fg">₹0</span>
                <span className="text-muted">/mo</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['1 Project', 'Basic AI Generation', 'Community Support'].map(feature => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-dim">
                    <Check className="w-4 h-4 text-cyan-400" /> {feature}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="w-full py-3 rounded-xl text-sm font-semibold text-fg bg-surface-2 hover:bg-surface border border-border-c transition-all text-center">
                Get Started
              </Link>
            </RevealSection>

            {/* Pro Plan */}
            <RevealSection delay={0.2} className="relative rounded-2xl border border-cyan-500/30 bg-cyan-500/[0.02] p-8 flex flex-col shadow-[0_0_40px_rgba(0,240,255,0.05)]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-cyan-500 text-black text-xs font-bold rounded-full uppercase tracking-wider">
                Most Popular
              </div>
              <h3 className="text-xl font-bold text-fg mb-2">Pro</h3>
              <p className="text-sm text-muted mb-6">For professional architects & engineers.</p>
              <div className="mb-6">
                <span className="text-4xl font-black text-fg">₹999</span>
                <span className="text-muted">/mo</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Unlimited Projects', 'Advanced AI Generation', 'Real-Time Simulation', 'Architecture Scoring', 'Priority Support'].map(feature => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-fg">
                    <Check className="w-4 h-4 text-cyan-400" /> {feature}
                  </li>
                ))}
              </ul>
              <Link href="/login" className="w-full py-3 rounded-xl text-sm font-semibold text-bg bg-cyan-400 hover:bg-cyan-300 transition-all text-center shadow-[0_0_20px_rgba(0,240,255,0.3)]">
                Upgrade to Pro
              </Link>
            </RevealSection>

            {/* Enterprise Plan */}
            <RevealSection delay={0.3} className="relative rounded-2xl border border-white/[0.07] bg-white/[0.03] p-8 flex flex-col">
              <h3 className="text-xl font-bold text-fg mb-2">Enterprise</h3>
              <p className="text-sm text-muted mb-6">For large teams and organizations.</p>
              <div className="mb-6">
                <span className="text-4xl font-black text-fg">Custom</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Custom AI Training', 'Dedicated Support', 'SSO & Advanced Security', 'Custom Integrations'].map(feature => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-dim">
                    <Check className="w-4 h-4 text-cyan-400" /> {feature}
                  </li>
                ))}
              </ul>
              <a href="mailto:sohampendse10@gmail.com" className="w-full py-3 rounded-xl text-sm font-semibold text-fg bg-surface-2 hover:bg-surface border border-border-c transition-all text-center">
                Contact Sales
              </a>
            </RevealSection>
          </div>

          {/* Comparison Table */}
          <RevealSection delay={0.4} className="mt-20 overflow-x-auto">
            <h3 className="text-2xl font-bold text-fg mb-8 text-center">Compare Plans</h3>
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-border-c text-sm text-muted">
                  <th className="py-4 px-6 font-medium">Features</th>
                  <th className="py-4 px-6 font-medium text-center">Starter</th>
                  <th className="py-4 px-6 font-medium text-center text-cyan-400">Pro</th>
                  <th className="py-4 px-6 font-medium text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody className="text-sm text-dim">
                {[
                  { feature: 'Projects', starter: '1', pro: 'Unlimited', ent: 'Unlimited' },
                  { feature: 'AI Generation Quality', starter: 'Basic', pro: 'Advanced', ent: 'Custom Models' },
                  { feature: 'Real-Time Simulation', starter: false, pro: true, ent: true },
                  { feature: 'Architecture Scoring', starter: false, pro: true, ent: true },
                  { feature: 'Export Formats', starter: 'PNG', pro: 'PNG, SVG, JSON', ent: 'All + Custom' },
                  { feature: 'Support', starter: 'Community', pro: 'Priority Email', ent: '24/7 Dedicated' },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-border-c/50 hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-medium text-fg">{row.feature}</td>
                    <td className="py-4 px-6 text-center">
                      {typeof row.starter === 'boolean' ? (
                        row.starter ? <Check className="w-4 h-4 text-cyan-400 mx-auto" /> : <X className="w-4 h-4 text-muted mx-auto" />
                      ) : (
                        row.starter
                      )}
                    </td>
                    <td className="py-4 px-6 text-center text-fg font-medium">
                      {typeof row.pro === 'boolean' ? (
                        row.pro ? <Check className="w-4 h-4 text-cyan-400 mx-auto" /> : <X className="w-4 h-4 text-muted mx-auto" />
                      ) : (
                        row.pro
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {typeof row.ent === 'boolean' ? (
                        row.ent ? <Check className="w-4 h-4 text-cyan-400 mx-auto" /> : <X className="w-4 h-4 text-muted mx-auto" />
                      ) : (
                        row.ent
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </RevealSection>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative border-t border-white/[0.06] py-12 px-6 bg-bg mt-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <ArchieLogo size="sm" />
            <a href="mailto:sohampendse10@gmail.com" className="text-dim text-xs hover:text-cyan-400 transition-colors">
              sohampendse10@gmail.com
            </a>
          </div>
          <p className="text-dim text-xs text-center">
            &ldquo;Architecture is the art of how to waste space.&rdquo; — Philip Johnson
          </p>
          <div className="flex items-center gap-5 text-dim text-xs">
            <span className="hover:text-muted cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-muted cursor-pointer transition-colors">Terms</span>
            <span>© 2026 Archie</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
