import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  Wallet,
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Globe,
  Stars,
  Sparkles
} from 'lucide-react';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          }
        });
        if (error) throw error;
        setSuccess(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-200/30 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[32px] border border-white/50 p-10 shadow-2xl shadow-blue-900/5 text-center animate-in zoom-in-95 duration-500 relative z-10">
          <div className="w-24 h-24 bg-gradient-to-tr from-emerald-100 to-emerald-50 text-emerald-600 rounded-[28px] flex items-center justify-center mx-auto mb-8 shadow-inner ring-8 ring-emerald-50/50">
            <CheckCircle2 size={40} className="drop-shadow-sm" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Check your inbox</h2>
          <p className="text-slate-500 font-medium leading-relaxed mb-8 text-lg">
            We've sent a magic link to <br />
            <span className="text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded-lg">{email}</span>
          </p>
          <div className="space-y-4">
            <p className="text-sm text-slate-400 font-medium">
              Click the link to verify your account and start your freelance journey.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="text-xs font-black text-blue-600 uppercase   hover:text-blue-700 transition-colors py-2"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row relative">

      {/* Brand Side (Desktop Only) */}
      <div className="hidden lg:flex lg:w-[55%] bg-slate-900 relative overflow-hidden flex-col justify-between p-20">

        {/* Premium Background Effects */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-slate-900/95 to-slate-900"></div>

        {/* Animated Orbs */}
        <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-blue-500/30 rounded-full blur-[120px] animate-pulse duration-[10000ms]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[100px]"></div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg shadow-black/10">
              <Wallet size={24} className="text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter">FreeFlow</span>
          </div>

          <div className="space-y-12 max-w-2xl">
            <h1 className="text-7xl font-black text-white leading-[1.1] tracking-tighter">
              Master Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">Freelance Chaos.</span>
            </h1>

            <p className="text-lg text-blue-100/80 font-medium leading-relaxed max-w-lg">
              The all-in-one operating system designed for elite freelancers. Manage clients, projects, and invoices with military precision and premium aesthetics.
            </p>

            <div className="flex flex-wrap gap-4">
              {[
                { icon: ShieldCheck, text: "Bank-grade security" },
                { icon: Zap, text: "Instant invoicing" },
                { icon: Globe, text: "Client portals" },
                { icon: Sparkles, text: "AI-powered insights" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default">
                  <item.icon size={16} className="text-blue-300" />
                  <span className="text-sm font-bold text-white/90">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-blue-200/40 text-xs font-bold uppercase  ">
            <span>© 2025 FreeFlow Inc.</span>
            <div className="flex gap-8">
              <span className="hover:text-white transition-colors cursor-pointer">Privacy</span>
              <span className="hover:text-white transition-colors cursor-pointer">Terms</span>
              <span className="hover:text-white transition-colors cursor-pointer">Help</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-20 relative bg-[#F8FAFC]">
        {/* Mobile Background Elements */}
        <div className="lg:hidden absolute top-0 left-0 right-0 h-64 bg-slate-900 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-slate-900"></div>
        </div>

        <div className="w-full max-w-[440px] relative z-10">

          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                <Wallet size={20} className="text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter">FreeFlow</span>
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-xl shadow-slate-200/40 overflow-hidden">

            {/* Header with Toggle */}
            <div className="px-8 pt-8 pb-6">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {isSignUp ? 'Get Started' : 'Welcome Back'}
                  </h2>
                  <p className="text-slate-500 font-medium text-sm mt-1">
                    {isSignUp ? 'Create your professional workspace.' : 'Enter your details to access account.'}
                  </p>
                </div>
                {/* Icon decoration */}
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  {isSignUp ? <Stars size={24} /> : <Lock size={24} />}
                </div>
              </div>

              {/* Custom Tab Toggle */}
              <div className="bg-slate-100/80 p-1.5 rounded-xl flex relative">
                <div
                  className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-lg shadow-sm border border-slate-200/50 transition-all duration-300 ease-out ${isSignUp ? 'translate-x-[calc(100%+6px)]' : 'translate-x-0'}`}
                ></div>
                <button
                  onClick={() => setIsSignUp(false)}
                  className={`flex-1 relative z-10 text-xs font-black uppercase   py-2.5 text-center transition-colors ${!isSignUp ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsSignUp(true)}
                  className={`flex-1 relative z-10 text-xs font-black uppercase   py-2.5 text-center transition-colors ${isSignUp ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            <div className="px-8 pb-8">
              <form onSubmit={handleAuth} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="label-work-email text-xs font-black text-slate-500 ml-1 uppercase tracking-wider">Email Address</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-focus-within:text-blue-600 group-focus-within:bg-blue-50 transition-colors">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      className="w-full pl-14 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-[18px] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 font-bold transition-all text-slate-900 placeholder:text-slate-300 text-sm"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center px-1">
                    <label className="label-work-email text-xs font-black text-slate-500 uppercase tracking-wider">Password</label>
                    {!isSignUp && (
                      <button type="button" className="text-[10px] font-black text-blue-600 uppercase   hover:underline">Forgot?</button>
                    )}
                  </div>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-focus-within:text-blue-600 group-focus-within:bg-blue-50 transition-colors">
                      <Lock size={16} />
                    </div>
                    <input
                      type="password"
                      required
                      autoComplete={isSignUp ? "new-password" : "current-password"}
                      className="w-full pl-14 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-[18px] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 font-bold transition-all text-slate-900 placeholder:text-slate-300 text-sm"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-[18px] text-xs font-bold animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={18} className="shrink-0" />
                    <p className="leading-relaxed">{error}</p>
                  </div>
                )}

                <button
                  disabled={loading}
                  className="w-full py-4 bg-slate-900 hover:bg-blue-600 text-white rounded-[18px] font-black text-xs uppercase   shadow-xl shadow-slate-200 hover:shadow-blue-500/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 active:scale-[0.98] mt-2 group"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : (
                    <>
                      {isSignUp ? 'Create Account' : 'Sign In to Dashboard'}
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Footer Area */}
            <div className="bg-slate-50 border-t border-slate-100 p-6 text-center">
              <p className="text-slate-400 text-[10px] font-bold uppercase  ">
                Secured by Supabase Auth
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
