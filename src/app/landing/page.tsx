'use client';

import { useRef } from 'react';
import Link from 'next/link';
import {
  motion,
  useScroll,
  useTransform,
  useInView,
} from 'framer-motion';
import {
  Brain,
  Zap,
  Shield,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Network,
  BarChart3,
  GitBranch,
  Check,
  X,
} from 'lucide-react';
import ArchieLogo from '@/components/Logo';
import { cn } from '@/lib/utils';

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

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut', delay },
  }),
};

/* ─────────────────────────────────────────────────
   Scroll-triggered section wrapper
───────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────
   Glowing grid background
───────────────────────────────────────────────── */
function GridBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #00F0FF 1px, transparent 1px), linear-gradient(to bottom, #00F0FF 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, #09090b 100%)',
        }}
      />
      <div className="absolute -top-60 -left-60 w-[700px] h-[700px] rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] rounded-full bg-indigo-600/5 blur-[80px]" />
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Floating circuit SVG decoration
───────────────────────────────────────────────── */
function CircuitLines() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="currentColor" fill="none" strokeWidth="1.5" className="text-cyan-400">
        <path d="M 200 120 L 400 120 L 400 250 L 600 250" strokeDasharray="6 4" />
        <path d="M 400 250 L 400 380 L 200 380" strokeDasharray="6 4" />
        <circle cx="200" cy="120" r="5" fill="currentColor" />
        <circle cx="400" cy="250" r="5" fill="currentColor" />
        <circle cx="600" cy="250" r="5" fill="currentColor" />
      </g>
      <g stroke="currentColor" fill="none" strokeWidth="1" className="text-purple-500">
        <path d="M 700 300 L 700 180 L 900 180" />
        <circle cx="700" cy="300" r="4" fill="currentColor" />
        <circle cx="900" cy="180" r="4" fill="currentColor" />
      </g>
      <g stroke="currentColor" fill="none" strokeWidth="1.5" className="text-cyan-400/60">
        <path d="M 1000 400 L 1200 400 L 1200 550 L 1100 550" strokeDasharray="5 5" />
        <circle cx="1000" cy="400" r="4" fill="currentColor" />
        <circle cx="1100" cy="550" r="4" fill="currentColor" />
      </g>
    </svg>
  );
}

/* ─────────────────────────────────────────────────
   Feature card
───────────────────────────────────────────────── */
interface FeatureCardProps {
  icon: React.ElementType;
  accent: string;
  title: string;
  description: string;
  detail: string;
  delay: number;
}

function FeatureCard({ icon: Icon, accent, title, description, detail, delay }: FeatureCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="group relative rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-sm p-7 overflow-hidden cursor-default"
    >
      <div
        className={cn(
          'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-xl',
          accent === 'cyan' && 'bg-cyan-500/5',
          accent === 'purple' && 'bg-purple-500/5',
          accent === 'indigo' && 'bg-indigo-500/5',
        )}
      />
      <div
        className={cn(
          'absolute top-0 left-6 right-6 h-px',
          accent === 'cyan' && 'bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent',
          accent === 'purple' && 'bg-gradient-to-r from-transparent via-purple-400/60 to-transparent',
          accent === 'indigo' && 'bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent',
        )}
      />
      <div
        className={cn(
          'mb-5 inline-flex items-center justify-center w-12 h-12 rounded-xl border',
          accent === 'cyan' && 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
          accent === 'purple' && 'bg-purple-500/10 border-purple-500/20 text-purple-400',
          accent === 'indigo' && 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-fg text-lg font-semibold mb-2 tracking-tight">{title}</h3>
      <p className="text-muted text-sm leading-relaxed mb-4">{description}</p>
      <p className="text-dim text-xs leading-relaxed border-t border-white/5 pt-4">{detail}</p>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────
   Demo image wrapper
───────────────────────────────────────────────── */
function DemoImageCard({
  src,
  alt,
  label,
  delay,
}: {
  src: string;
  alt: string;
  label: string;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
      className="flex flex-col gap-4"
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold tracking-widest uppercase text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          {label}
        </span>
      </div>
      <motion.div
        whileHover={{ scale: 1.02, transition: { duration: 0.3, ease: 'easeOut' } }}
        className="relative rounded-2xl overflow-hidden aspect-video border border-white/[0.08] shadow-[0_0_60px_-10px_rgba(0,240,255,0.15)] group"
      >
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/[0.06] z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-transparent to-purple-500/0 group-hover:from-cyan-500/5 group-hover:to-purple-500/5 transition-all duration-500 z-10 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent z-10" />
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt} className="w-full h-full object-cover object-top" />
        ) : (
          <div className="w-full h-full bg-surface flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-surface-2 border border-border-c flex items-center justify-center">
              <Network className="w-5 h-5 text-dim" />
            </div>
            <p className="text-dim text-xs font-mono">{alt}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────── */
export default function LandingPage() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const features = [
    {
      icon: Brain,
      accent: 'cyan',
      title: 'AI-Powered Architecture',
      description: 'Generate full system designs from a single plain-English prompt — no diagramming experience required.',
      detail: 'Powered by Google Gemini, Archie understands microservices, monoliths, event-driven systems, and everything in between.',
      delay: 0.05,
    },
    {
      icon: Zap,
      accent: 'purple',
      title: 'Real-Time Simulation',
      description: 'Simulate failures and blast radius instantly to harden your architecture before it hits production.',
      detail: 'Run what-if scenarios — take a node offline, throttle a service, or spike traffic — and watch cascading effects in real time.',
      delay: 0.15,
    },
    {
      icon: Shield,
      accent: 'indigo',
      title: 'Architecture Scoring',
      description: 'Get a 0–100 quality score with actionable insights across reliability, scalability, and security.',
      detail: 'Each score is broken down into weighted sub-categories so you know exactly where to focus your improvements.',
      delay: 0.25,
    },
  ] as const;

  const howItWorksSteps = [
    { icon: GitBranch, label: 'Describe', text: 'Type your idea in plain English' },
    { icon: Brain, label: 'Generate', text: 'Archie builds a live architecture diagram' },
    { icon: BarChart3, label: 'Analyse', text: 'Score, simulate failures, export' },
  ];

  return (
    <div className="relative min-h-screen bg-bg text-fg overflow-x-hidden">

      {/* NAV BAR */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-10 h-16"
      >
        <div className="absolute inset-0 bg-bg/70 backdrop-blur-xl border-b border-white/[0.06]" />
        <Link href="/landing" className="relative z-10">
          <ArchieLogo size="md" />
        </Link>
        <nav className="relative z-10 hidden md:flex items-center gap-7 text-sm text-muted">
          <a href="#features" className="hover:text-fg transition-colors duration-200">Features</a>
          <a href="#how-it-works" className="hover:text-fg transition-colors duration-200">How it works</a>
          <Link href="/pricing" className="hover:text-fg transition-colors duration-200">Pricing</Link>
        </nav>
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

      {/* HERO SECTION */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center pt-16"
      >
        <GridBackground />
        <CircuitLines />
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 flex flex-col items-center gap-6 max-w-4xl mx-auto"
        >
          <motion.div
            initial="hidden"
            animate="visible"
            custom={0.1}
            variants={fadeIn}
            className="inline-flex items-center gap-2 text-xs font-mono font-semibold tracking-widest uppercase text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-4 py-1.5 rounded-full"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Architecture Studio
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            custom={0.2}
            variants={fadeUp}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/60"
          >
            Design systems
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
              that scale.
            </span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            custom={0.35}
            variants={fadeUp}
            className="text-muted text-lg sm:text-xl leading-relaxed max-w-2xl"
          >
            Describe your product in plain English. Archie generates{' '}
            <span className="text-fg font-medium">production-ready architecture diagrams</span> with
            scoring and failure analysis.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            custom={0.5}
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center gap-4 mt-2"
          >
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold text-bg bg-fg hover:bg-fg/90 transition-all duration-200 shadow-sm hover:-translate-y-0.5"
            >
              Start Designing for Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-medium text-muted hover:text-fg border border-white/[0.08] hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-200"
            >
              See it in action
            </a>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            custom={0.65}
            variants={fadeIn}
            className="flex items-center gap-6 mt-6 text-dim text-xs"
          >
            {['No credit card required', 'Free to start', 'Export to PNG & SVG'].map((t, i) => (
              <span key={t} className="flex items-center gap-2">
                {i > 0 && <span className="w-1 h-1 rounded-full bg-border-c" />}
                <span>{t}</span>
              </span>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-dim text-xs tracking-widest uppercase font-mono">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            className="w-px h-8 bg-gradient-to-b from-cyan-400/40 to-transparent"
          />
        </motion.div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="relative py-28 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="max-w-6xl mx-auto">
          <RevealSection className="text-center mb-16">
            <span className="inline-block text-xs font-mono font-semibold tracking-widest uppercase text-purple-400 mb-4">
              What Archie does
            </span>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-fg mb-4">
              Every tool you need,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                nothing you don&apos;t.
              </span>
            </h2>
            <p className="text-muted text-lg max-w-xl mx-auto">
              Archie combines AI generation, real-time simulation, and quality scoring into one
              seamless workflow.
            </p>
          </RevealSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <RevealSection className="text-center mb-14">
            <span className="inline-block text-xs font-mono font-semibold tracking-widest uppercase text-cyan-400 mb-4">
              The workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tighter text-fg">
              From prompt to production diagram{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                in seconds.
              </span>
            </h2>
          </RevealSection>
          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="hidden sm:block absolute top-8 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-px bg-gradient-to-r from-cyan-400/30 via-indigo-400/30 to-purple-400/30" />
            {howItWorksSteps.map(({ icon: Icon, label, text }, i) => (
              <RevealSection key={label} delay={i * 0.12} className="flex flex-col items-center text-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-surface border border-white/[0.07] flex items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.08)]">
                    <Icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-black text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <div>
                  <p className="text-fg font-semibold text-sm mb-1">{label}</p>
                  <p className="text-dim text-xs leading-relaxed">{text}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* SEE ARCHIE IN ACTION */}
      <section id="how-it-works" className="relative py-28 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/20 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/5 blur-[100px] rounded-full" />
        </div>
        <div className="relative max-w-6xl mx-auto">
          <RevealSection className="text-center mb-16">
            <span className="inline-block text-xs font-mono font-semibold tracking-widest uppercase text-indigo-400 mb-4">
              See Archie in Action
            </span>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-fg mb-4">
              Real workflows,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                real results.
              </span>
            </h2>
            <p className="text-muted text-lg max-w-xl mx-auto">
              From your project dashboard to a fully detailed flow chart — here&apos;s what Archie looks
              like in the hands of real engineers.
            </p>
          </RevealSection>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DemoImageCard
              src="/demo-dashboard.png"
              alt="Archie project dashboard"
              label="Project Dashboard"
              delay={0.05}
            />
            <DemoImageCard
              src="/demo-editor.png"
              alt="Archie flow chart editor"
              label="Flow Chart Editor"
              delay={0.18}
            />
          </div>
          <RevealSection delay={0.3} className="flex justify-center mt-14">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-base font-semibold text-bg bg-fg hover:bg-fg/90 shadow-sm transition-all duration-200 hover:-translate-y-0.5"
            >
              Try Archie for free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </RevealSection>
        </div>
      </section>



      {/* FOOTER */}
      <footer className="relative border-t border-white/[0.06] py-12 px-6 bg-bg">
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
