
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Wallet, Mail, Lock, Loader2, ArrowRight, AlertCircle, CheckCircle2, ShieldCheck, Zap, Globe } from 'lucide-react';

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
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-[32px] border border-slate-200 p-10 shadow-xl text-center animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Check your inbox</h2>
          <p className="text-slate-500 font-medium leading-relaxed mb-8">
            We've sent a magic link to <span className="text-slate-900 font-bold">{email}</span>. Click it to verify your account and start your freelance journey.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="text-xs font-black text-blue-600 uppercase   hover:text-blue-700 transition-colors"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7] flex flex-col lg:flex-row">
      {/* Brand Side (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 p-20 flex-col justify-between relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl -ml-48 -mb-48"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white mb-16">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
              <Wallet size={24} className="text-white" />
            </div>
            <span className="text-3xl font-black tracking-tighter">FreeFlow</span>
          </div>

          <h1 className="text-6xl font-black text-white leading-tight tracking-tighter mb-8">
            The Operating System <br />
            <span className="text-blue-200">For Your Freelance Career.</span>
          </h1>

          <div className="space-y-6">
            {[
              { icon: ShieldCheck, text: "Enterprise-grade data encryption" },
              { icon: Zap, text: "Automated billing & payment tracking" },
              { icon: Globe, text: "Client portals for global collaboration" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 text-white/80 font-bold">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <item.icon size={20} />
                </div>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-blue-100/60 font-bold text-xs uppercase  ">
          <span>&copy; 2025 FreeFlow Inc.</span>
          <div className="w-1.5 h-1.5 bg-blue-100/40 rounded-full"></div>
          <span>Terms of Service</span>
          <div className="w-1.5 h-1.5 bg-blue-100/40 rounded-full"></div>
          <span>Privacy Policy</span>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-20">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex flex-col items-center mb-12">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100 mb-6">
              <Wallet size={32} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">FreeFlow</h1>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
            <div className="p-10">
              <div className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                  {isSignUp ? 'Create your workspace' : 'Welcome back'}
                </h2>
                <p className="text-slate-500 font-medium">
                  {isSignUp ? 'Join thousands of elite freelancers.' : 'Log in to continue your journey.'}
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-6">
                <div className="space-y-2">
                  <label className="label-work-email font-black text-[13px]">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      className="w-full pl-14 pr-5 py-5 bg-slate-50 border border-slate-200 rounded-[24px] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 font-bold transition-all text-slate-900 placeholder:text-slate-300"
                      placeholder="alex@studio.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase  ">Secret Key</label>
                    {!isSignUp && (
                      <button type="button" className="text-[10px] font-black text-blue-600 uppercase   hover:underline">Forgot?</button>
                    )}
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input
                      type="password"
                      required
                      autoComplete={isSignUp ? "new-password" : "current-password"}
                      className="w-full pl-14 pr-5 py-5 bg-slate-50 border border-slate-200 rounded-[24px] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 font-bold transition-all text-slate-900 placeholder:text-slate-300"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-3 p-5 bg-rose-50 border border-rose-100 text-rose-600 rounded-[24px] text-xs font-bold animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={18} className="shrink-0" />
                    <p className="leading-relaxed">{error}</p>
                  </div>
                )}

                <button
                  disabled={loading}
                  className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase   shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : (
                    <>
                      {isSignUp ? 'Create Account' : 'Sign In Now'}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="bg-slate-50/80 p-8 border-t border-slate-100 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="group inline-flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase   transition-all"
              >
                {isSignUp ? (
                  <>Already registered? <span className="text-blue-600 group-hover:underline">Login here</span></>
                ) : (
                  <>Don't have an account? <span className="text-blue-600 group-hover:underline">Start for free</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
