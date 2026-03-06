import React, { useState, useEffect, useRef } from 'react';
import {
  Wallet,
  LayoutDashboard,
  Users,
  Briefcase,
  Receipt,
  TrendingUp,
  Shield,
  Zap,
  Clock,
  ArrowRight,
  Check,
  Star,
  ChevronDown,
  Menu,
  X,
  ExternalLink,
  Globe,
  Sparkles,
  BarChart3,
  FileText,
  Link2,
  HeadphonesIcon,
  Moon,
  Sun,
  Play,
  Quote
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

// Animated counter hook
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

const StatCard = ({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) => {
  const { count, ref } = useCounter(value);
  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-black text-white mb-2">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-blue-200 text-sm font-medium">{label}</div>
    </div>
  );
};

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSignIn, isDarkMode, toggleDarkMode }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Users,
      title: 'Client Management',
      description: 'Keep all your clients organized in one place. Add contacts, track history, and share a stunning client portal.',
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      icon: Briefcase,
      title: 'Project Tracking',
      description: 'Never miss a deadline. Track project status, milestones, and deliverables with a clean visual dashboard.',
      color: 'from-violet-500 to-violet-600',
      bg: 'bg-violet-50 dark:bg-violet-900/20'
    },
    {
      icon: FileText,
      title: 'Smart Invoicing',
      description: 'Create professional invoices in seconds. Send, track, and get paid faster with automated reminders.',
      color: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20'
    },
    {
      icon: BarChart3,
      title: 'Earnings Analytics',
      description: 'Understand your business at a glance. See revenue trends, top clients, and growth opportunities.',
      color: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50 dark:bg-amber-900/20'
    },
    {
      icon: Link2,
      title: 'Client Portal',
      description: 'Give clients a branded portal link to view invoices and project updates. Zero back-and-forth emails.',
      color: 'from-pink-500 to-rose-500',
      bg: 'bg-pink-50 dark:bg-pink-900/20'
    },
    {
      icon: Shield,
      title: 'Bank-Grade Security',
      description: 'Your data is encrypted at rest and in transit. SOC2 compliant infrastructure you can trust.',
      color: 'from-slate-600 to-slate-700',
      bg: 'bg-slate-100 dark:bg-slate-800'
    }
  ];

  const steps = [
    { num: '01', title: 'Add your clients', desc: 'Import or manually add your clients in under 2 minutes. We keep everything organized.' },
    { num: '02', title: 'Create a project', desc: 'Set up projects with budgets, deadlines, and deliverables. Stay on top of every detail.' },
    { num: '03', title: 'Send an invoice', desc: 'Generate beautiful, professional invoices with one click and get paid faster.' },
    { num: '04', title: 'Watch your business grow', desc: 'Track earnings, spot trends, and scale your freelance business with confidence.' }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'UI/UX Designer · Freelance',
      avatar: 'SC',
      color: 'from-pink-400 to-rose-500',
      quote: 'FreeFlow completely transformed how I run my freelance business. I went from spreadsheet chaos to having everything in one place. My clients love the portal too!',
      stars: 5
    },
    {
      name: 'Marcus Williams',
      role: 'Full-Stack Developer',
      avatar: 'MW',
      color: 'from-blue-400 to-violet-500',
      quote: 'I used to spend 3 hours a month doing invoices. Now it takes 10 minutes. The client portal alone has saved me so many awkward back-and-forth emails.',
      stars: 5
    },
    {
      name: 'Priya Patel',
      role: 'Brand Strategist',
      avatar: 'PP',
      color: 'from-emerald-400 to-teal-500',
      quote: 'The best investment I made this year. FreeFlow makes me look more professional and I actually understand my earnings now. Highly recommend!',
      stars: 5
    }
  ];

  const plans = [
    {
      name: 'Starter',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for new freelancers just getting started.',
      features: ['Up to 2 Active Projects', '3 Clients', 'Basic Invoice Templates', 'Standard Support'],
      buttonText: 'Get Started Free',
      popular: false,
      dark: false
    },
    {
      name: 'Pro',
      price: { monthly: 19, yearly: 15 },
      description: 'For full-time freelancers growing their business.',
      features: ['Unlimited Projects', 'Unlimited Clients', 'Remove Branding', 'Expense Tracking', 'Priority Support', 'Advanced Analytics'],
      buttonText: 'Start Free Trial',
      popular: true,
      dark: false
    },
    {
      name: 'Agency',
      price: { monthly: 49, yearly: 39 },
      description: 'Empower your team with advanced collaboration.',
      features: ['Everything in Pro', '5 Team Members', 'Team Collaboration', 'Advanced Reporting', 'Dedicated Manager', 'Custom Integrations'],
      buttonText: 'Contact Sales',
      popular: false,
      dark: true
    }
  ];

  const faqs = [
    { q: 'Can I cancel anytime?', a: 'Absolutely. You can cancel your subscription at any time with no questions asked. Your data remains accessible until the end of your billing period.' },
    { q: 'Is there a free trial for paid plans?', a: 'Yes! We offer a 14-day money-back guarantee on all paid plans. Try it completely risk-free, no credit card required to start.' },
    { q: 'How secure is my data?', a: 'Your data is encrypted at rest and in transit using AES-256 encryption. We use Supabase infrastructure which is SOC2 Type II compliant.' },
    { q: 'Can my clients view their invoices?', a: 'Yes! Every account comes with a shareable client portal link. Your clients can view invoices and project updates without needing a FreeFlow account.' },
    { q: 'Do you support multiple currencies?', a: 'Yes, FreeFlow supports invoicing in any currency. Simply set your preferred currency when creating an invoice.' }
  ];

  return (
    <div className={`min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 overflow-x-hidden`}>

      {/* ─── NAVBAR ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                <Wallet size={18} className="text-white" />
              </div>
              <span className="text-xl font-black tracking-tight">FreeFlow</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {['Features', 'How it Works', 'Pricing', 'FAQ'].map(item => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                  className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                onClick={onSignIn}
                className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                Sign In
              </button>
              <button
                onClick={onGetStarted}
                className="text-sm font-bold bg-slate-900 dark:bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-600 dark:hover:bg-blue-700 transition-all shadow-lg shadow-slate-900/10 hover:shadow-blue-600/25 hover:-translate-y-0.5 active:scale-95"
              >
                Get Started Free
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center gap-2">
              <button onClick={toggleDarkMode} className="p-2 rounded-xl text-slate-500 dark:text-slate-400">
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl mx-2 mb-4 p-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col gap-1">
                {['Features', 'How it Works', 'Pricing', 'FAQ'].map(item => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                  >
                    {item}
                  </a>
                ))}
                <div className="border-t border-slate-100 dark:border-slate-800 mt-2 pt-2 flex flex-col gap-2">
                  <button onClick={onSignIn} className="px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-left transition-all">Sign In</button>
                  <button onClick={onGetStarted} className="px-4 py-3 text-sm font-bold bg-slate-900 dark:bg-blue-600 text-white rounded-xl hover:bg-blue-600 dark:hover:bg-blue-700 transition-all">Get Started Free</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-28 pb-20 lg:pt-40 lg:pb-32 px-4 overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-500/8 dark:bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-violet-500/8 dark:bg-violet-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/3 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/60 text-blue-700 dark:text-blue-400 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-8 shadow-sm">
            <Sparkles size={12} />
            The #1 tool for freelancers
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.0] mb-6 text-slate-900 dark:text-white">
            Run your freelance<br />
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600">
                business smarter.
              </span>
            </span>
          </h1>

          {/* Sub */}
          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Manage clients, track projects, and send professional invoices — all from one beautiful, simple platform. Stop juggling spreadsheets.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={onGetStarted}
              className="group flex items-center gap-2 bg-slate-900 dark:bg-blue-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-blue-600 dark:hover:bg-blue-700 transition-all shadow-xl shadow-slate-900/15 dark:shadow-blue-600/30 hover:shadow-blue-600/30 hover:-translate-y-1 active:scale-95 text-sm"
            >
              Start for Free
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onSignIn}
              className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold px-8 py-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm hover:-translate-y-0.5"
            >
              Sign In to Dashboard
            </button>
          </div>

          {/* Social proof */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400 dark:text-slate-500">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'].map((color, i) => (
                  <div key={i} style={{ background: color }} className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-950" />
                ))}
              </div>
              <span className="font-semibold">5,000+ freelancers</span>
            </div>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="#F59E0B" className="text-amber-400" />)}
              <span className="font-semibold ml-1">4.9 / 5</span>
            </div>
            <span>No credit card required</span>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="max-w-5xl mx-auto mt-20 relative">
          <div className="relative rounded-[24px] overflow-hidden border border-slate-200/80 dark:border-slate-700/80 shadow-2xl shadow-slate-900/10 dark:shadow-black/40">
            {/* Browser bar */}
            <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 flex items-center gap-2 border-b border-slate-200/60 dark:border-slate-700/60">
              <div className="flex gap-1.5">
                {['#FF5F57','#FEBC2E','#28C840'].map((c,i) => <div key={i} style={{background:c}} className="w-3 h-3 rounded-full" />)}
              </div>
              <div className="flex-1 max-w-sm mx-auto bg-white dark:bg-slate-700 rounded-lg px-3 py-1.5 flex items-center gap-2">
                <Globe size={12} className="text-slate-400" />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">app.freeflow.io/dashboard</span>
              </div>
            </div>

            {/* Dashboard mockup */}
            <div className="bg-slate-50 dark:bg-slate-900 p-6">
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Total Earnings', value: '$12,840', trend: '+18%', color: 'text-emerald-500' },
                  { label: 'Active Projects', value: '7', trend: '+2', color: 'text-blue-500' },
                  { label: 'Clients', value: '23', trend: '+5', color: 'text-violet-500' },
                  { label: 'Invoices Sent', value: '41', trend: 'This month', color: 'text-amber-500' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                    <p className="text-xs text-slate-400 font-medium mb-1">{stat.label}</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                    <p className={`text-xs font-bold mt-0.5 ${stat.color}`}>{stat.trend}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                  <p className="text-xs font-bold text-slate-500 mb-3">Earnings Overview</p>
                  <div className="flex items-end gap-1.5 h-24">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-blue-500 to-blue-400 opacity-80" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
                  <p className="text-xs font-bold text-slate-500 mb-3">Recent Clients</p>
                  <div className="space-y-2">
                    {[
                      { name: 'Acme Corp', status: 'Active', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
                      { name: 'TechStart', status: 'Invoice Sent', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
                      { name: 'Creative Co.', status: 'Completed', color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400' }
                    ].map((c, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{c.name}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${c.color}`}>{c.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating badges */}
          <div className="absolute -left-8 top-16 hidden lg:block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 shadow-xl shadow-slate-200/50 dark:shadow-black/30 animate-bounce" style={{ animationDuration: '3s' }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center">
                <TrendingUp size={16} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Revenue</p>
                <p className="text-sm font-black text-slate-900 dark:text-white">+$2,400</p>
              </div>
            </div>
          </div>
          <div className="absolute -right-8 bottom-16 hidden lg:block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 shadow-xl shadow-slate-200/50 dark:shadow-black/30 animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center">
                <Receipt size={16} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Invoice Paid</p>
                <p className="text-sm font-black text-slate-900 dark:text-white">$1,200 ✓</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-violet-700 py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCard value={5000} label="Freelancers trust us" suffix="+" />
          <StatCard value={2400000} label="Invoices generated" suffix="+" />
          <StatCard value={99} label="Uptime SLA" suffix="%" />
          <StatCard value={14} label="Day money-back guarantee" />
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/40 text-violet-700 dark:text-violet-400 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-4">
              <Zap size={12} />
              Everything you need
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
              Built for freelancers<br />who mean business
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Stop juggling 10 different tools. FreeFlow is your all-in-one command center for running a profitable freelance business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-7 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-black/30 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-2xl ${f.bg} flex items-center justify-center mb-5`}>
                  <div className={`bg-gradient-to-br ${f.color} p-2 rounded-xl`}>
                    <f.icon size={18} className="text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-24 px-4 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-4">
              <Clock size={12} />
              Set up in minutes
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
              From chaos to clarity<br />in 4 steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-blue-200 to-transparent dark:from-blue-900 z-0" style={{ width: 'calc(100% - 2rem)' }} />
                )}
                <div className="relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                  <div className="text-5xl font-black text-slate-100 dark:text-slate-800 mb-4 leading-none">{step.num}</div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 text-amber-700 dark:text-amber-400 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-4">
              <Star size={12} fill="currentColor" />
              Loved by freelancers
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
              Don't take our word for it
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-7 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-black/30 transition-all duration-300">
                <div className="flex gap-1 mb-5">
                  {[...Array(t.stars)].map((_, i) => <Star key={i} size={14} fill="#F59E0B" className="text-amber-400" />)}
                </div>
                <Quote size={20} className="text-slate-200 dark:text-slate-700 mb-3" />
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6 font-medium">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xs font-black`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-24 px-4 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 text-blue-700 dark:text-blue-400 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-4">
              Simple pricing
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
              Pick your plan,<br />start today
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-8">
              No hidden fees. Cancel anytime. All plans include a free trial.
            </p>

            {/* Toggle */}
            <div className="inline-flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                Yearly
                <span className="text-emerald-500 text-xs font-black">-20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`relative rounded-3xl p-8 flex flex-col transition-all duration-300 hover:-translate-y-2 ${
                  plan.popular
                    ? 'bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-2xl shadow-blue-500/30 ring-4 ring-blue-500/20'
                    : plan.dark
                    ? 'bg-slate-900 dark:bg-black text-white border border-slate-800'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                    <Star size={12} fill="currentColor" /> Most Popular
                  </div>
                )}

                <div className="mb-8">
                  <h3 className={`text-lg font-bold mb-1 ${plan.popular ? 'text-white' : plan.dark ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className={`text-5xl font-black ${plan.popular ? 'text-white' : plan.dark ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                      ${plan.price[billingCycle]}
                    </span>
                    <span className={`text-sm ${plan.popular ? 'text-blue-100' : 'text-slate-400'}`}>/mo</span>
                  </div>
                  <p className={`text-sm leading-relaxed ${plan.popular ? 'text-blue-100' : plan.dark ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="flex-1 space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        plan.popular ? 'bg-blue-500 text-white' : plan.dark ? 'bg-slate-700 text-slate-300' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      }`}>
                        <Check size={11} strokeWidth={3} />
                      </div>
                      <span className={`text-sm font-medium ${plan.popular ? 'text-blue-50' : plan.dark ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={plan.name === 'Agency' ? undefined : onGetStarted}
                  className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all hover:-translate-y-0.5 active:scale-95 ${
                    plan.popular
                      ? 'bg-white text-blue-600 hover:bg-blue-50 shadow-lg'
                      : plan.dark
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-900 dark:bg-slate-700 text-white hover:bg-blue-600 dark:hover:bg-blue-600'
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
              Questions? Answered.
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400">Everything you need to know about FreeFlow.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span className="font-bold text-slate-900 dark:text-white text-sm pr-4">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 animate-in slide-in-from-top-1 duration-200">
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-[40px] p-12 md:p-20 text-center overflow-hidden">
            {/* Glow effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-blue-600/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-64 h-32 bg-violet-600/15 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-3xl mb-8 shadow-xl shadow-blue-600/40">
                <Wallet size={28} className="text-white" />
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight">
                Ready to grow<br />your business?
              </h2>
              <p className="text-lg text-blue-200/80 max-w-lg mx-auto mb-10 leading-relaxed">
                Join 5,000+ freelancers who use FreeFlow to manage their clients, projects, and money. Start for free today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={onGetStarted}
                  className="group flex items-center justify-center gap-2 bg-white text-slate-900 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-all shadow-xl hover:-translate-y-0.5 active:scale-95 text-sm"
                >
                  Get Started Free
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={onSignIn}
                  className="flex items-center justify-center gap-2 border border-white/20 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/10 transition-all text-sm hover:-translate-y-0.5"
                >
                  Sign In
                </button>
              </div>
              <p className="text-blue-300/50 text-xs mt-6 font-medium">No credit card required · Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <Wallet size={16} className="text-white" />
              </div>
              <span className="text-lg font-black tracking-tight">FreeFlow</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-semibold text-slate-400 dark:text-slate-500">
              {['Privacy', 'Terms', 'Help Center', 'Blog', 'Status'].map(link => (
                <a key={link} href="#" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">{link}</a>
              ))}
            </div>

            <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">
              © 2025 FreeFlow Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
