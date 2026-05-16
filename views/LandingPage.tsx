import React, { useState, useEffect, useRef } from 'react';
import {
  Wallet,
  Users,
  Briefcase,
  Receipt,
  TrendingUp,
  Shield,
  Zap,
  Clock,
  ArrowRight,
  ArrowUpRight,
  Check,
  Star,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  BarChart3,
  FileText,
  Link2,
  Moon,
  Sun,
  Quote,
  CircleDot,
  Layers,
  Command
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

// ─── Animated counter hook ─────────────────────────────────────
const useCounter = (target: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { count, ref };
};

const StatCard = ({ value, label, suffix = '', prefix = '' }: { value: number; label: string; suffix?: string; prefix?: string }) => {
  const { count, ref } = useCounter(value);
  return (
    <div ref={ref} className="group">
      <div className="text-5xl md:text-6xl font-medium tracking-tight text-white mb-3" style={{ fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.04em' }}>
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-white/50 text-sm tracking-wide">{label}</div>
    </div>
  );
};

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSignIn, isDarkMode, toggleDarkMode }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [scrolled, setScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    const handleMouse = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouse);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  // Inject Outfit font + custom styles once
  useEffect(() => {
    if (document.getElementById('ff-fonts')) return;
    const link = document.createElement('link');
    link.id = 'ff-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap';
    document.head.appendChild(link);

    const style = document.createElement('style');
    style.id = 'ff-styles';
    style.textContent = `
      .font-display { font-family: 'Outfit', sans-serif; letter-spacing: -0.03em; }
      .font-mono { font-family: 'JetBrains Mono', monospace; }
      .grain {
        position: absolute; inset: 0; opacity: 0.4; pointer-events: none; z-index: 0;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
      }
      .gradient-text {
        background: linear-gradient(135deg, #0F172A 0%, #475569 50%, #0F172A 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
      .dark .gradient-text {
        background: linear-gradient(135deg, #FFFFFF 0%, #94A3B8 50%, #FFFFFF 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
      .accent-gradient {
        background: linear-gradient(135deg, #0EA5E9 0%, #06B6D4 50%, #0891B2 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
      @keyframes float-y { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
      @keyframes float-y-delayed { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      @keyframes pulse-ring { 0% { transform: scale(0.95); opacity: 1; } 100% { transform: scale(1.4); opacity: 0; } }
      @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
      .float-y { animation: float-y 6s ease-in-out infinite; }
      .float-y-delay { animation: float-y-delayed 7s ease-in-out infinite; animation-delay: 1s; }
      .pulse-ring { animation: pulse-ring 2s ease-out infinite; }
      .shimmer::after {
        content: ''; position: absolute; inset: 0;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        animation: shimmer 3s infinite;
      }
      .dot-grid {
        background-image: radial-gradient(circle at 1px 1px, rgba(15,23,42,0.08) 1px, transparent 0);
        background-size: 24px 24px;
      }
      .dark .dot-grid {
        background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0);
      }
      .ticker {
        animation: scroll-x 40s linear infinite;
      }
      @keyframes scroll-x {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .border-gradient {
        position: relative;
        background: linear-gradient(#fff, #fff) padding-box,
                    linear-gradient(135deg, #FF6B35, #F7931E) border-box;
        border: 1px solid transparent;
      }
      .dark .border-gradient {
        background: linear-gradient(#0c0a09, #0c0a09) padding-box,
                    linear-gradient(135deg, #FF6B35, #F7931E) border-box;
      }
      .glow-orange {
        box-shadow: 0 0 40px rgba(14, 165, 233, 0.3), 0 0 80px rgba(14, 165, 233, 0.15);
      }
    `;
    document.head.appendChild(style);
  }, []);

  // ─── Data ──────────────────────────────────────────────────────
  const features = [
    {
      icon: Users,
      title: 'Client CRM',
      description: 'Every contact, conversation, and contract — organized in one beautifully simple workspace.',
      tag: 'Core',
      visual: 'clients'
    },
    {
      icon: Briefcase,
      title: 'Project Pipeline',
      description: 'Visual kanban boards, milestone tracking, and time logging that never gets in your way.',
      tag: 'Workflow',
      visual: 'projects'
    },
    {
      icon: FileText,
      title: 'Instant Invoicing',
      description: 'Beautiful invoices in 30 seconds. Auto-reminders, Stripe-powered payments, recurring billing.',
      tag: 'Money',
      visual: 'invoice'
    },
    {
      icon: BarChart3,
      title: 'Revenue Intel',
      description: 'See exactly where your money comes from, who pays late, and which clients are worth more.',
      tag: 'Analytics',
      visual: 'analytics'
    },
    {
      icon: Link2,
      title: 'Client Portal',
      description: 'A branded space where clients see updates, approve work, and pay invoices. Zero confusion.',
      tag: 'Experience',
      visual: 'portal'
    },
    {
      icon: Shield,
      title: 'Built Like a Vault',
      description: 'AES-256 encryption, SOC2 infrastructure, daily backups. Your business, properly protected.',
      tag: 'Trust',
      visual: 'security'
    }
  ];

  const steps = [
    { num: '01', title: 'Bring your clients in', desc: 'CSV import or one-by-one — either way, two minutes flat.', icon: Users },
    { num: '02', title: 'Spin up a project', desc: 'Set scope, budget, and timeline. Assign tasks and milestones.', icon: Layers },
    { num: '03', title: 'Send your first invoice', desc: 'Pick a template, add line items, hit send. Get paid faster.', icon: Receipt },
    { num: '04', title: 'Watch the numbers climb', desc: 'Real revenue insights replace spreadsheet guesswork.', icon: TrendingUp }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Brand Designer',
      company: 'Independent',
      avatar: 'SC',
      color: 'from-sky-400 to-cyan-500',
      quote: 'I quit using 4 different apps the week I found FreeFlow. The client portal alone has stopped 90% of "what\'s the status?" emails. My life is genuinely better.',
      stars: 5,
      metric: '+42% revenue'
    },
    {
      name: 'Marcus Williams',
      role: 'Senior Engineer',
      company: 'Solo consultant',
      avatar: 'MW',
      color: 'from-blue-400 to-cyan-500',
      quote: 'Invoicing used to be the worst part of my month. Now it takes 8 minutes total. The analytics also caught a client who was costing me money — I dropped them.',
      stars: 5,
      metric: '8min / month on admin'
    },
    {
      name: 'Priya Patel',
      role: 'Brand Strategist',
      company: 'PXP Studio',
      avatar: 'PP',
      color: 'from-indigo-400 to-blue-500',
      quote: 'My clients keep complimenting how professional my invoices and updates look. The truth? I just use FreeFlow. It makes a one-person show feel like an agency.',
      stars: 5,
      metric: '23 clients managed'
    }
  ];

  const plans = [
    {
      name: 'Starter',
      price: { monthly: 0, yearly: 0 },
      description: 'For testing the waters.',
      features: ['2 active projects', '3 clients', 'Basic invoice templates', 'Standard support'],
      buttonText: 'Start free',
      popular: false
    },
    {
      name: 'Pro',
      price: { monthly: 19, yearly: 15 },
      description: 'For full-time freelancers.',
      features: ['Unlimited projects', 'Unlimited clients', 'Remove FreeFlow branding', 'Expense tracking', 'Advanced analytics', 'Priority support'],
      buttonText: 'Start 14-day trial',
      popular: true
    },
    {
      name: 'Studio',
      price: { monthly: 49, yearly: 39 },
      description: 'For small teams scaling up.',
      features: ['Everything in Pro', '5 team seats', 'Team collaboration', 'White-label portal', 'Dedicated manager', 'Custom integrations'],
      buttonText: 'Talk to sales',
      popular: false
    }
  ];

  const faqs = [
    { q: 'Can I cancel anytime?', a: 'Yes. No contracts, no questions. Cancel from your dashboard in two clicks. Your data stays accessible until the end of the billing period, then we export it for you.' },
    { q: 'Is there a free trial?', a: 'The Starter plan is free forever. Pro and Studio plans include a 14-day free trial with no credit card required. You can also request a full refund within 30 days of any paid plan.' },
    { q: 'How is my data protected?', a: 'AES-256 encryption at rest and TLS 1.3 in transit. Daily encrypted backups across multiple regions. SOC2 Type II compliant infrastructure via Supabase. We never sell, share, or train AI on your data.' },
    { q: 'Do clients need an account?', a: 'No. Every project gets a unique, secure portal link. Clients click, view invoices, approve work, and pay — no sign-up wall standing between you and getting paid.' },
    { q: 'Which currencies are supported?', a: 'All of them. Set a default currency, then override per-client or per-invoice. We auto-convert for your dashboard analytics and support tax configurations for 40+ countries.' },
    { q: 'Can I import from other tools?', a: 'Yes. One-click CSV import for clients and invoices. Direct integrations with Stripe, QuickBooks, FreshBooks, and Honeybook. Need something else? Email us — we usually ship it in a week.' }
  ];

  const integrations = ['Stripe', 'Slack', 'Gmail', 'Notion', 'Figma', 'Zapier', 'QuickBooks', 'Google Drive', 'Calendly', 'Linear'];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-500 overflow-x-hidden font-display">

      {/* ─── NAVBAR ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-2' : 'py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between transition-all duration-500 rounded-2xl ${scrolled ? 'bg-white/70 dark:bg-stone-900/70 backdrop-blur-2xl border border-stone-200/60 dark:border-stone-800/60 shadow-lg shadow-stone-900/5 px-5 py-3' : 'px-2 py-3'}`}>
            <div className="flex items-center gap-2">
              <div className="relative w-9 h-9 bg-gradient-to-br from-stone-900 to-stone-700 dark:from-white dark:to-stone-300 rounded-xl flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/30 to-transparent" />
                <Wallet size={16} className="text-white dark:text-stone-900 relative z-10" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-semibold tracking-tight">FreeFlow</span>
            </div>

            <div className="hidden md:flex items-center gap-1 text-sm font-medium absolute left-1/2 -translate-x-1/2">
              {['Features', 'How it works', 'Pricing', 'FAQ'].map(item => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                  className="px-3 py-1.5 rounded-lg text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-all"
                >
                  {item}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-colors"
              >
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button
                onClick={onSignIn}
                className="text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white px-3 py-1.5 transition-all"
              >
                Sign in
              </button>
              <button
                onClick={onGetStarted}
                className="group flex items-center gap-1.5 text-sm font-medium bg-stone-900 dark:bg-white text-white dark:text-stone-900 pl-4 pr-3 py-2 rounded-xl hover:scale-[0.98] transition-all shadow-lg shadow-stone-900/20 dark:shadow-white/20"
              >
                Start free
                <ArrowUpRight size={14} className="group-hover:rotate-45 transition-transform duration-300" />
              </button>
            </div>

            <div className="flex md:hidden items-center gap-1">
              <button onClick={toggleDarkMode} className="w-9 h-9 flex items-center justify-center rounded-lg text-stone-500">
                {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="w-9 h-9 flex items-center justify-center rounded-lg">
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl mt-2 p-3 shadow-xl">
              {['Features', 'How it works', 'Pricing', 'FAQ'].map(item => (
                <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800">{item}</a>
              ))}
              <div className="border-t border-stone-100 dark:border-stone-800 mt-2 pt-2 flex flex-col gap-2">
                <button onClick={onSignIn} className="px-4 py-2.5 text-sm font-medium text-left">Sign in</button>
                <button onClick={onGetStarted} className="px-4 py-3 text-sm font-medium bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-xl">Start free</button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-32 lg:pt-44 pb-20 lg:pb-24 px-4 overflow-hidden">
        {/* Atmospheric background */}
        <div className="absolute inset-0 -z-10 dot-grid opacity-60" />
        <div className="absolute inset-0 -z-10">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] rounded-full blur-3xl opacity-50 transition-transform duration-1000"
            style={{
              background: 'radial-gradient(circle, rgba(255,107,53,0.18) 0%, rgba(247,147,30,0.10) 30%, transparent 70%)',
              transform: `translate(calc(-50% + ${mousePos.x * 0.01}px), ${mousePos.y * 0.01}px)`
            }}
          />
          <div className="absolute top-40 -left-20 w-[500px] h-[500px] rounded-full blur-3xl opacity-30 bg-gradient-to-br from-amber-300 to-orange-400 dark:from-amber-500/40 dark:to-orange-500/40" />
          <div className="absolute -bottom-40 -right-20 w-[600px] h-[600px] rounded-full blur-3xl opacity-25 bg-gradient-to-br from-rose-300 to-purple-300 dark:from-rose-500/30 dark:to-purple-500/30" />
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Top badge */}
          <div className="flex justify-center mb-8">
            <a href="#" className="group inline-flex items-center gap-2 bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border border-stone-200 dark:border-stone-800 rounded-full pl-1.5 pr-4 py-1.5 text-xs font-medium shadow-sm hover:shadow-md transition-all">
              <span className="flex items-center gap-1 bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase">
                <Sparkles size={10} /> New
              </span>
              <span className="text-stone-700 dark:text-stone-300">FreeFlow 2.0 — Now with AI-assisted invoicing</span>
              <ArrowRight size={12} className="text-stone-400 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          {/* Headline */}
          <h1 className="text-center text-[3rem] sm:text-6xl md:text-7xl lg:text-[5.5rem] font-medium tracking-[-0.04em] leading-[0.95] mb-8">
            <span className="gradient-text">The operating</span>
            <br />
            <span className="gradient-text">system for </span>
            <span className="italic font-light" style={{ fontFamily: 'Outfit, serif' }}>
              <span className="accent-gradient">freelancers.</span>
            </span>
          </h1>

          <p className="text-center text-lg md:text-xl text-stone-500 dark:text-stone-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Clients, projects, invoices, and analytics in one place that actually feels good to use. Built for people who'd rather be doing the work.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <button
              onClick={onGetStarted}
              className="group relative flex items-center gap-2 bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-medium px-6 py-3.5 rounded-2xl text-sm shadow-xl shadow-stone-900/20 dark:shadow-white/20 hover:scale-[0.98] active:scale-95 transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-sky-500 via-cyan-500 to-sky-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative">Start for free</span>
              <ArrowRight size={14} className="relative group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onSignIn}
              className="group flex items-center gap-2 text-stone-700 dark:text-stone-300 font-medium px-6 py-3.5 rounded-2xl text-sm hover:bg-stone-100/60 dark:hover:bg-stone-900/60 transition-all"
            >
              <span>Watch the 90-sec tour</span>
              <div className="w-5 h-5 rounded-full bg-stone-900 dark:bg-white flex items-center justify-center">
                <div className="w-0 h-0 border-l-[5px] border-l-white dark:border-l-stone-900 border-y-[3px] border-y-transparent ml-0.5" />
              </div>
            </button>
          </div>

          {/* Trust line */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-stone-500 dark:text-stone-500 font-mono">
            <div className="flex items-center gap-1.5">
              <CircleDot size={10} className="text-emerald-500" />
              <span>5,000+ freelancers</span>
            </div>
            <div className="w-px h-3 bg-stone-300 dark:bg-stone-700 hidden sm:block" />
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={11} fill="#0EA5E9" className="text-sky-400" />)}
              <span className="ml-1">4.9 / 5 average</span>
            </div>
            <div className="w-px h-3 bg-stone-300 dark:bg-stone-700 hidden sm:block" />
            <span>No credit card · 14-day trial</span>
          </div>
        </div>

        {/* ─── HERO DASHBOARD MOCKUP ─── */}
        <div className="max-w-6xl mx-auto mt-16 lg:mt-24 relative">
          {/* Glow */}
          <div className="absolute -inset-20 bg-gradient-to-r from-sky-500/20 via-cyan-500/10 to-blue-500/20 blur-3xl -z-10 opacity-60" />

          <div className="relative rounded-[28px] overflow-hidden border border-stone-200/80 dark:border-stone-800/80 shadow-2xl shadow-stone-900/15 dark:shadow-black/50 bg-white dark:bg-stone-900">
            {/* Top toolbar */}
            <div className="bg-stone-50 dark:bg-stone-900 px-5 py-3 flex items-center gap-3 border-b border-stone-200/80 dark:border-stone-800/80">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 flex items-center justify-center gap-2 text-xs font-mono text-stone-400">
                <Command size={11} />
                <span>app.freeflow.io · Dashboard</span>
              </div>
              <div className="text-[10px] font-mono text-stone-400">v2.4.1</div>
            </div>

            {/* Dashboard body */}
            <div className="flex">
              {/* Sidebar */}
              <div className="hidden md:block w-44 bg-stone-50 dark:bg-stone-900/50 border-r border-stone-200/80 dark:border-stone-800/80 p-3">
                <div className="space-y-0.5">
                  {[
                    { label: 'Dashboard', active: true },
                    { label: 'Clients', count: 23 },
                    { label: 'Projects', count: 7 },
                    { label: 'Invoices', count: 12 },
                    { label: 'Reports' },
                    { label: 'Settings' }
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium ${item.active ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900' : 'text-stone-600 dark:text-stone-400'}`}>
                      <span>{item.label}</span>
                      {item.count && <span className="text-[10px] font-mono opacity-70">{item.count}</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Main */}
              <div className="flex-1 p-4 md:p-6 bg-white dark:bg-stone-950">
                {/* Header row */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">May 16 · 2026</div>
                    <h3 className="text-xl font-semibold">Good morning, Alex</h3>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium">+18% MoM</div>
                  </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  {[
                    { label: 'Revenue', value: '$12,840', trend: '+18%', positive: true },
                    { label: 'Active projects', value: '7', trend: '+2', positive: true },
                    { label: 'Outstanding', value: '$3,200', trend: '3 invoices', positive: false },
                    { label: 'Clients', value: '23', trend: '+5', positive: true }
                  ].map((s, i) => (
                    <div key={i} className="bg-stone-50 dark:bg-stone-900 rounded-2xl p-3 border border-stone-200/60 dark:border-stone-800/60">
                      <p className="text-[10px] text-stone-500 font-medium mb-1 uppercase tracking-wider">{s.label}</p>
                      <p className="text-xl font-semibold tracking-tight">{s.value}</p>
                      <p className={`text-[10px] font-mono mt-0.5 ${s.positive ? 'text-cyan-500' : 'text-sky-500'}`}>{s.trend}</p>
                    </div>
                  ))}
                </div>

                {/* Chart */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2 bg-stone-50 dark:bg-stone-900 rounded-2xl p-4 border border-stone-200/60 dark:border-stone-800/60">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">Revenue · last 12 months</p>
                      <p className="text-[10px] font-mono text-stone-400">+$2,400 this week</p>
                    </div>
                    <div className="flex items-end gap-1.5 h-28">
                      {[35, 55, 42, 70, 50, 80, 65, 75, 58, 88, 72, 95].map((h, i) => (
                        <div key={i} className="flex-1 relative group">
                          <div
                            className="w-full rounded-md bg-gradient-to-t from-sky-500 to-cyan-400 transition-all hover:from-sky-600 hover:to-cyan-500"
                            style={{ height: `${h}%` }}
                          />
                          {i === 11 && (
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-[9px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap">$2.4k</div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-[9px] font-mono text-stone-400">
                      <span>Jun</span><span>Aug</span><span>Oct</span><span>Dec</span><span>Feb</span><span>Apr</span>
                    </div>
                  </div>

                  <div className="bg-stone-50 dark:bg-stone-900 rounded-2xl p-4 border border-stone-200/60 dark:border-stone-800/60">
                    <p className="text-xs font-semibold text-stone-700 dark:text-stone-300 mb-3">Recent activity</p>
                    <div className="space-y-2.5">
                      {[
                        { name: 'Acme Corp', sub: 'Paid $1,200', dot: 'bg-emerald-500' },
                        { name: 'TechStart', sub: 'Invoice sent', dot: 'bg-blue-500' },
                        { name: 'Creative Co', sub: 'In review', dot: 'bg-amber-500' },
                        { name: 'Noble Labs', sub: 'New client', dot: 'bg-purple-500' }
                      ].map((c, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${c.dot} shrink-0`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-medium text-stone-900 dark:text-white truncate">{c.name}</p>
                            <p className="text-[10px] font-mono text-stone-400 truncate">{c.sub}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating side cards */}
          <div className="absolute -left-4 lg:-left-10 top-1/3 hidden lg:block float-y">
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-3 shadow-xl backdrop-blur-xl flex items-center gap-3 min-w-[180px]">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center">
                  <Check size={18} className="text-white" strokeWidth={3} />
                </div>
                <div className="absolute inset-0 rounded-xl border-2 border-cyan-400 pulse-ring" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-stone-400 uppercase">Payment</p>
                <p className="text-sm font-semibold">$1,200.00</p>
                <p className="text-[10px] text-cyan-500 font-medium">Acme Corp · 2m ago</p>
              </div>
            </div>
          </div>

          <div className="absolute -right-4 lg:-right-10 top-2/3 hidden lg:block float-y-delay">
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-3 shadow-xl backdrop-blur-xl flex items-center gap-3 min-w-[180px]">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center">
                <TrendingUp size={18} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] font-mono text-stone-400 uppercase">Q2 Revenue</p>
                <p className="text-sm font-semibold">+42% growth</p>
                <p className="text-[10px] text-stone-500 font-mono">vs Q1 2026</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── INTEGRATION TICKER ─── */}
      <section className="py-12 border-y border-stone-200/60 dark:border-stone-800/60 overflow-hidden bg-white dark:bg-stone-950">
        <p className="text-center text-xs font-mono text-stone-400 mb-6 tracking-widest uppercase">Plays nicely with your stack</p>
        <div className="relative">
          <div className="flex ticker gap-12 w-max">
            {[...integrations, ...integrations, ...integrations].map((tool, i) => (
              <div key={i} className="text-2xl font-medium text-stone-300 dark:text-stone-700 whitespace-nowrap tracking-tight">
                {tool}
              </div>
            ))}
          </div>
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white dark:from-stone-950 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white dark:from-stone-950 to-transparent" />
        </div>
      </section>

      {/* ─── STATS BAND ─── */}
      <section className="relative py-24 px-4 overflow-hidden bg-stone-950 text-white">
        <div className="absolute inset-0 grain" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-sky-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-mono text-sky-400 tracking-widest uppercase mb-4">By the numbers</p>
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight max-w-3xl mx-auto">
              <span className="text-white">A platform that</span>{' '}
              <span className="italic font-light text-stone-400">works as hard as you do.</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <StatCard value={5000} label="Active freelancers" suffix="+" />
            <StatCard value={47} label="Million in invoices" prefix="$" suffix="M" />
            <StatCard value={99} label="Uptime SLA" suffix="%" />
            <StatCard value={4} label="Day median pay time" />
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-24 lg:py-32 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 mb-16 items-end">
            <div>
              <p className="text-xs font-mono text-sky-500 tracking-widest uppercase mb-4">— Features</p>
              <h2 className="text-5xl md:text-6xl font-medium tracking-tighter leading-[0.95]">
                Everything you need.<br />
                <span className="italic font-light text-stone-400 dark:text-stone-500">Nothing you don't.</span>
              </h2>
            </div>
            <p className="text-lg text-stone-500 dark:text-stone-400 max-w-md lg:justify-self-end font-light leading-relaxed">
              FreeFlow replaces the spreadsheets, the Notion docs, the email chains, and the half-finished invoicing apps — with one calm, fast, focused workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {features.map((f, i) => (
              <div
                key={i}
                className={`group relative bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-7 hover:shadow-xl hover:shadow-stone-900/5 dark:hover:shadow-black/30 hover:-translate-y-1 transition-all duration-500 overflow-hidden ${i === 0 ? 'lg:col-span-2 lg:row-span-1' : ''}`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sky-500/0 to-sky-500/0 group-hover:from-sky-500/10 group-hover:to-cyan-500/5 rounded-full blur-2xl transition-all duration-500" />

                <div className="flex items-start justify-between mb-8 relative">
                  <div className="w-11 h-11 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-sky-500 group-hover:to-cyan-500 transition-all duration-500">
                    <f.icon size={18} className="text-stone-700 dark:text-stone-300 group-hover:text-white transition-colors" strokeWidth={2} />
                  </div>
                  <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">{f.tag}</span>
                </div>

                <h3 className="text-xl font-medium mb-2 tracking-tight">{f.title}</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed font-light">{f.description}</p>

                <div className="flex items-center gap-1 text-xs font-medium text-stone-700 dark:text-stone-300 mt-6 opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-y-2 group-hover:translate-y-0">
                  Learn more <ArrowUpRight size={12} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-24 lg:py-32 px-4 relative bg-stone-100/50 dark:bg-stone-900/30">
        <div className="absolute inset-0 dot-grid opacity-40" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-20">
            <p className="text-xs font-mono text-sky-500 tracking-widest uppercase mb-4">— Get started</p>
            <h2 className="text-5xl md:text-6xl font-medium tracking-tighter leading-[0.95] mb-6">
              From chaos to clarity<br />
              <span className="italic font-light text-stone-400 dark:text-stone-500">in under 10 minutes.</span>
            </h2>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px">
              <div className="h-full bg-gradient-to-r from-transparent via-stone-300 dark:via-stone-700 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, i) => (
                <div key={i} className="relative group">
                  <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-900/5 transition-all duration-500 h-full">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-stone-900 dark:bg-white flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-sky-500 group-hover:to-cyan-500 transition-all duration-500">
                        <step.icon size={18} className="text-white dark:text-stone-900 group-hover:text-white transition-colors" strokeWidth={2} />
                      </div>
                      <span className="text-3xl font-mono font-light text-stone-200 dark:text-stone-800">{step.num}</span>
                    </div>
                    <h3 className="text-base font-medium mb-2 tracking-tight">{step.title}</h3>
                    <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed font-light">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-24 lg:py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-mono text-sky-500 tracking-widest uppercase mb-4">— Loved by freelancers</p>
            <h2 className="text-5xl md:text-6xl font-medium tracking-tighter leading-[0.95]">
              People who used to hate<br />
              <span className="italic font-light text-stone-400">running their business.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className={`relative bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-7 hover:-translate-y-1 transition-all duration-500 ${i === 1 ? 'lg:scale-105 lg:shadow-2xl lg:shadow-orange-500/10 lg:border-orange-200/50 dark:lg:border-orange-900/30' : 'hover:shadow-xl hover:shadow-stone-900/5'}`}
              >
                {i === 1 && (
                  <div className="absolute -top-3 left-7 bg-gradient-to-r from-sky-500 to-cyan-500 text-white text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full">
                    Most quoted
                  </div>
                )}

                <Quote size={20} className="text-sky-500/30 mb-4" />

                <p className="text-base text-stone-700 dark:text-stone-300 leading-relaxed mb-6 font-light">
                  "{t.quote}"
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xs font-semibold`}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-stone-500 dark:text-stone-500">{t.role} · {t.company}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono text-sky-500 uppercase">{t.metric.split(' ')[0]}</p>
                    <p className="text-[10px] font-mono text-stone-400">{t.metric.split(' ').slice(1).join(' ')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-24 lg:py-32 px-4 relative bg-stone-100/50 dark:bg-stone-900/30">
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-12">
            <p className="text-xs font-mono text-sky-500 tracking-widest uppercase mb-4">— Pricing</p>
            <h2 className="text-5xl md:text-6xl font-medium tracking-tighter leading-[0.95] mb-6">
              Honest pricing.<br />
              <span className="italic font-light text-stone-400">No surprises.</span>
            </h2>
            <p className="text-lg text-stone-500 dark:text-stone-400 max-w-xl mx-auto font-light mb-10">
              Start free, upgrade when you outgrow it, cancel whenever. We grow when you grow.
            </p>

            {/* Toggle */}
            <div className="inline-flex items-center gap-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-full p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === 'monthly' ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900' : 'text-stone-500'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900' : 'text-stone-500'}`}
              >
                Yearly
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${billingCycle === 'yearly' ? 'bg-sky-500/20 text-sky-300 dark:text-sky-400' : 'bg-sky-100 dark:bg-sky-900/30 text-sky-600'}`}>−20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`relative rounded-3xl p-8 flex flex-col transition-all duration-500 hover:-translate-y-1 ${plan.popular
                    ? 'bg-stone-950 text-white border border-stone-800 shadow-2xl glow-orange'
                    : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800'
                  }`}
              >
                {plan.popular && (
                  <>
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-500 to-transparent" />
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-sky-500 to-cyan-500 text-white px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest">
                      Most Popular
                    </div>
                  </>
                )}

                <div className="mb-8">
                  <div className="flex items-baseline justify-between mb-4">
                    <h3 className="text-xl font-medium">{plan.name}</h3>
                    {plan.popular && <Sparkles size={14} className="text-sky-400" />}
                  </div>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-5xl font-medium tracking-tighter">
                      ${plan.price[billingCycle]}
                    </span>
                    <span className={`text-sm font-mono ${plan.popular ? 'text-stone-500' : 'text-stone-400'}`}>/mo</span>
                  </div>
                  <p className={`text-sm font-light ${plan.popular ? 'text-stone-400' : 'text-stone-500 dark:text-stone-400'}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="flex-1 space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <Check size={14} className={plan.popular ? 'text-sky-400' : 'text-stone-900 dark:text-white'} strokeWidth={2.5} />
                      <span className={`text-sm font-light ${plan.popular ? 'text-stone-300' : 'text-stone-700 dark:text-stone-300'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={plan.name === 'Studio' ? undefined : onGetStarted}
                  className={`w-full py-3 rounded-2xl font-medium text-sm transition-all hover:scale-[0.98] flex items-center justify-center gap-2 group ${plan.popular
                      ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white hover:shadow-xl hover:shadow-sky-500/30'
                      : 'bg-stone-900 dark:bg-white text-white dark:text-stone-900'
                    }`}
                >
                  {plan.buttonText}
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-stone-400 mt-8 font-mono">
            All plans include unlimited invoices · Stripe-powered payments · GDPR & SOC2 compliant
          </p>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-24 lg:py-32 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-mono text-sky-500 tracking-widest uppercase mb-4">— FAQ</p>
            <h2 className="text-5xl md:text-6xl font-medium tracking-tighter leading-[0.95]">
              Common questions,<br />
              <span className="italic font-light text-stone-400">honest answers.</span>
            </h2>
          </div>

          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`bg-white dark:bg-stone-900 border rounded-2xl overflow-hidden transition-all duration-300 ${openFaq === i ? 'border-sky-200 dark:border-sky-900/40 shadow-lg shadow-sky-500/5' : 'border-stone-200/80 dark:border-stone-800'}`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors"
                >
                  <span className="font-medium text-base pr-4">{faq.q}</span>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${openFaq === i ? 'bg-sky-500 text-white rotate-180' : 'bg-stone-100 dark:bg-stone-800 text-stone-500'}`}>
                    <ChevronDown size={14} />
                  </div>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed font-light">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center bg-stone-100/50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-2xl p-6">
            <p className="text-sm text-stone-600 dark:text-stone-400 mb-3 font-light">Still have questions?</p>
            <a href="mailto:hello@freeflow.io" className="inline-flex items-center gap-2 text-sm font-medium text-stone-900 dark:text-white hover:text-sky-500 transition-colors">
              Email a real human <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-stone-950 rounded-[40px] p-12 md:p-20 text-center overflow-hidden">
            <div className="absolute inset-0 grain opacity-50" />
            <div className="absolute inset-0">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-sky-500/40 to-transparent rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-1/4 w-96 h-48 bg-cyan-500/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-64 h-32 bg-blue-500/15 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-sky-400 mb-8">
                <CircleDot size={10} /> Limited spots in beta cohort
              </div>

              <h2 className="text-5xl md:text-7xl font-medium tracking-tighter leading-[0.95] mb-6 text-white">
                Stop being your own<br />
                <span className="italic font-light text-stone-400">unpaid admin.</span>
              </h2>

              <p className="text-lg text-stone-400 max-w-lg mx-auto mb-10 leading-relaxed font-light">
                Join 5,000+ freelancers who reclaimed their time, raised their rates, and never want to look at a spreadsheet again.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <button
                  onClick={onGetStarted}
                  className="group flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-medium px-6 py-3.5 rounded-2xl text-sm hover:scale-[0.98] active:scale-95 transition-all shadow-xl shadow-sky-500/30"
                >
                  Claim your free account
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={onSignIn}
                  className="flex items-center justify-center gap-2 text-white/80 font-medium px-6 py-3.5 rounded-2xl text-sm hover:text-white transition-colors"
                >
                  Or sign in →
                </button>
              </div>

              <div className="flex items-center justify-center gap-6 mt-10 text-xs font-mono text-stone-500">
                <span>14-day trial</span>
                <span>·</span>
                <span>No credit card</span>
                <span>·</span>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-stone-200 dark:border-stone-800 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-stone-900 to-stone-700 dark:from-white dark:to-stone-300 rounded-xl flex items-center justify-center">
                  <Wallet size={16} className="text-white dark:text-stone-900" strokeWidth={2.5} />
                </div>
                <span className="text-xl font-semibold tracking-tight">FreeFlow</span>
              </div>
              <p className="text-sm text-stone-500 dark:text-stone-400 font-light max-w-xs leading-relaxed">
                The operating system for freelancers who'd rather be doing the work.
              </p>
            </div>

            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'GDPR'] }
            ].map(col => (
              <div key={col.title}>
                <p className="text-xs font-mono uppercase tracking-widest text-stone-400 mb-3">{col.title}</p>
                <div className="flex flex-col gap-2">
                  {col.links.map(link => (
                    <a key={link} href="#" className="text-sm text-stone-700 dark:text-stone-300 hover:text-sky-500 transition-colors font-light">{link}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-stone-400 font-mono">© 2026 FreeFlow Inc. · Crafted for freelancers worldwide.</p>
            <div className="flex items-center gap-4 text-xs text-stone-400 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                All systems normal
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;