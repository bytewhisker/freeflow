import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  Wallet,
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ShieldCheck as ShieldIcon,
  Sun,
  Moon,
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react';

type AuthMode = 'signin' | 'signup' | 'forgot' | 'reset';

const Auth: React.FC<{ isDarkMode: boolean; toggleDarkMode: () => void; onBack?: () => void }> = ({
  isDarkMode,
  toggleDarkMode,
  onBack
}) => {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isValidEmail, setIsValidEmail] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('reset');
        if (session?.user?.email) setEmail(session.user.email);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Email validation function
  const validateEmail = (email: string): { isValid: boolean; error: string | null } => {
    if (!email) return { isValid: false, error: null };
    
    const emailLower = email.toLowerCase().trim();
    
    // Allowed domains (legitimate email providers)
    const allowedDomains = [
      'gmail.com', 'googlemail.com',
      'yahoo.com', 'ymail.com', 'rocketmail.com',
      'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
      'icloud.com', 'me.com', 'mac.com',
      'aol.com',
      'protonmail.com', 'proton.me',
      'tutanota.com', 'tutanota.de',
      'zoho.com', 'yandex.com',
      'mail.com', 'gmx.com', 'gmx.net',
      'inbox.com', 'lycos.com',
      'company.com', 'business.com', 'work.com', 'corp.com'
    ];
    
    // Temporary email providers (TEMPORARILY ALLOWED FOR TESTING)
    const tempEmailDomains = [
      '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com',
      'yopmail.com', 'throwaway.email', 'temp-mail.org', 'fakeemail.com',
      'maildrop.cc', 'tempmail.plus', '20minutemail.com', 'getairmail.com',
      'mail2tor.com', 'cryptmail.com', 'tempmail.de', 'tempmail.io',
      'dispostable.com', 'mailnull.com', 'ephemail.com', 'tempmailaddress.com',
      'mytemp.email', 'tempmail.cn', 'tempmailbox.net', 'tempmail.ninja',
      'sharklasers.com', 'guerrillamail.de', 'guerrillamail.biz',
      'spam4.me', 'tempmail.co', 'tempmail.app', 'tempmail.dev',
      'tempmail.site', 'tempmail.space', 'tempmail.world', 'tempmail.life',
      'tempmail.store', 'tempmail.cloud', 'tempmail.tech', 'tempmail.online',
      'tempmail.email', 'tempmail.mail', 'tempmail.web', 'tempmail.link',
      'tempmail.click', 'tempmail.download', 'tempmail.upload', 'tempmail.stream',
      'tempmail.live', 'tempmail.today', 'tempmail.now', 'tempmail.instant',
      'tempmail.quick', 'tempmail.fast', 'tempmail.easy', 'tempmail.simple',
      'tempmail.secure', 'tempmail.safe', 'tempmail.private', 'tempmail.anonymous',
      'tempmail.free', 'tempmail.premium', 'tempmail.pro', 'tempmail.plus',
      'tempmail.max', 'tempmail.ultra', 'tempmail.super', 'tempmail.hyper',
      'tempmail.mega', 'tempmail.giga', 'tempmail.tera', 'tempmail.peta',
      'tempmail.exa', 'tempmail.zetta', 'tempmail.yotta', 'tempmail.bronto',
      'tempmail.geop', 'tempmail.sagan', 'tempmail.peta', 'tempmail.exa',
      'tempmail.zetta', 'tempmail.yotta'
    ];
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailLower)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }
    
    // Extract domain
    const domain = emailLower.split('@')[1];
    
    // TEMPORARILY ALLOW TEMPORARY EMAILS FOR TESTING
    // Check if it's a temporary email - NOW ALLOWED
    if (tempEmailDomains.some(tempDomain => domain.includes(tempDomain))) {
      return { 
        isValid: true, // TEMPORARILY ALLOW TEMP EMAILS
        error: null 
      };
    }
    
    // Check if it's an allowed domain
    if (!allowedDomains.some(allowedDomain => domain === allowedDomain || domain.endsWith('.' + allowedDomain))) {
      return { 
        isValid: true, // TEMPORARILY ALLOW ALL DOMAINS FOR TESTING
        error: null 
      };
    }
    
    return { isValid: true, error: null };
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    const validation = validateEmail(newEmail);
    setEmailError(validation.error);
    setIsValidEmail(validation.isValid);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate email before proceeding
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        setEmailError(emailValidation.error || 'Invalid email address');
        return;
      }
      
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { 
            emailRedirectTo: window.location.origin,
            data: {
              email_confirm: true, // Explicitly request email confirmation
              plan: 'free' // Auto-assign free plan
            }
          }
        });
        if (error) {
          console.error('Signup error:', error);
          throw error;
        }
        setSuccess(true);
      } else if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setSuccess(true);
      } else if (mode === 'reset') {
        if (password !== confirmPassword) throw new Error('Passwords do not match');
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email,
          token: otpToken,
          type: 'recovery'
        });
        if (verifyError) throw verifyError;
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) throw updateError;
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    setSuccess(false);
  };

  if (success) {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
        <AuthBackground />
        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200/80 dark:border-slate-800 shadow-2xl shadow-slate-200/60 dark:shadow-black/40 p-10 text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-800/20 rounded-3xl flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-50/60 dark:ring-emerald-900/20">
              <CheckCircle2 size={36} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
              {mode === 'reset' ? 'Password Updated!' : 'Check Your Email'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
              {mode === 'reset'
                ? 'Your password has been successfully updated. You can now sign in.'
                : 'We sent instructions to your email. Check your inbox and follow the link.'}
            </p>
            <button
              onClick={() => switchMode('signin')}
              className="w-full py-3.5 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-600 dark:hover:bg-blue-700 transition-all hover:-translate-y-0.5 active:scale-95"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      <AuthBackground />

      {/* Top bar controls */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
        {/* Back to landing */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-800 px-4 py-2 rounded-xl transition-all hover:-translate-x-0.5"
          >
            <ArrowLeft size={15} />
            Back
          </button>
        )}

        {/* Logo */}
        <div className={`flex items-center gap-2 ${onBack ? '' : 'mx-auto'}`}>
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Wallet size={16} className="text-white" />
          </div>
          <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">FreeFlow</span>
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200/80 dark:border-slate-800 shadow-2xl shadow-slate-200/60 dark:shadow-black/40 overflow-hidden">

          {/* Card Header */}
          <div className="px-8 pt-8 pb-6">
            {/* Tab Selector (Sign In / Sign Up) */}
            {(mode === 'signin' || mode === 'signup') && (
              <div className="bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl flex mb-6">
                {(['signin', 'signup'] as AuthMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => switchMode(m)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${mode === m
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-200/60 dark:border-slate-600'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                      }`}
                  >
                    {m === 'signin' ? 'Sign In' : 'Sign Up'}
                  </button>
                ))}
              </div>
            )}

            {/* Title */}
            <div className="mb-1">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {mode === 'signup' && 'Create your account'}
                {mode === 'signin' && 'Welcome back'}
                {mode === 'forgot' && 'Reset your password'}
                {mode === 'reset' && 'Set new password'}
              </h1>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1.5 font-medium">
                {mode === 'signup' && 'Start your freelance command center for free.'}
                {mode === 'signin' && 'Sign in to your FreeFlow workspace.'}
                {mode === 'forgot' && "Enter your email and we'll send a reset link."}
                {mode === 'reset' && 'Enter your reset code and new password.'}
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="px-8 pb-8">
            <form onSubmit={handleAuth} className="space-y-4">

              {/* Email with floating label */}
              <div className="space-y-3 mb-8">
                <label className="text-xs font-helvetica font-bold text-slate-500 dark:text-slate-400  tracking-wider">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Mail size={15} className="text-slate-300 dark:text-slate-600" />
                  </div>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    disabled={mode === 'reset'}
                    className={`peer w-full pl-10 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800/60 border rounded-2xl text-sm font-medium placeholder-transparent outline-none focus:ring-4 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800/70 ${
                      emailError 
                        ? 'border-red-500 text-red-600 focus:border-red-500 focus:ring-red-500/10' 
                        : isValidEmail 
                        ? 'border-green-500 text-green-600 focus:border-green-500 focus:ring-green-500/10'
                        : 'border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500/10'
                    }`}
                    placeholder="Email Address"
                    value={email}
                    onChange={handleEmailChange}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {email && (
                      <div className={`w-2.5 h-2.5 rounded-full animate-pulse shadow-lg ${
                        emailError 
                          ? 'bg-red-500 shadow-red-500/50' 
                          : isValidEmail 
                          ? 'bg-green-500 shadow-green-500/50' 
                          : 'bg-yellow-500 shadow-yellow-500/50'
                      }`} />
                    )}
                  </div>
                </div>
                
                {/* Email validation error message */}
                {emailError && (
                  <div className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle size={12} />
                    {emailError}
                  </div>
                )}
              </div>

              {/* OTP (reset mode) */}
              {mode === 'reset' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Reset Code <span className="text-[10px] normal-case font-medium opacity-50">(from email)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <KeyRound size={15} className="text-slate-300 dark:text-slate-600" />
                    </div>
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all tracking-widest"
                      placeholder="6-digit code"
                      value={otpToken}
                      onChange={(e) => setOtpToken(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Password with floating label */}
              {mode !== 'forgot' && (
                <div className="space-y-1.5 mb-8">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-helvetica font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                      {mode === 'reset' ? 'New Password' : 'Password'}
                    </label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => switchMode('forgot')}
                        className="text-[11px] font-helvetica font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Lock size={15} className="text-slate-300 dark:text-slate-600" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                      className="w-full pl-10 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 transition-colors"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm Password (reset mode) */}
              {mode === 'reset' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <ShieldIcon size={15} className="text-slate-300 dark:text-slate-600" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      className="w-full pl-10 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 rounded-2xl text-xs font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-slate-900 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 dark:shadow-blue-600/20 hover:shadow-blue-600/25 hover:-translate-y-0.5 active:scale-[0.98] transition-all group disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mt-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    {mode === 'signup' && 'Create Account'}
                    {mode === 'signin' && 'Sign In'}
                    {mode === 'forgot' && 'Send Reset Email'}
                    {mode === 'reset' && 'Update Password'}
                    <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>

              {/* Back to Sign In (for forgot/reset) */}
              {(mode === 'forgot' || mode === 'reset') && (
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="w-full py-2.5 text-xs font-black text-slate-400 dark:text-slate-500 uppercase hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft size={12} />
                  Back to Sign In
                </button>
              )}
            </form>
          </div>

          {/* Footer */}

        </div>

        {/* Terms */}
        <p className="text-center text-[11px] text-slate-400 dark:text-slate-600 mt-6 font-medium">
          By continuing, you agree to our{' '}
          <a href="#" className="hover:text-slate-600 dark:hover:text-slate-400 underline">Terms of Service</a>{' '}
          and{' '}
          <a href="#" className="hover:text-slate-600 dark:hover:text-slate-400 underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

// Animated background blobs
const AuthBackground: React.FC = () => (
  <div className="absolute inset-0 -z-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-500/6 dark:bg-blue-500/4 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
    <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-violet-500/6 dark:bg-violet-500/4 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '1s' }} />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-500/4 dark:bg-emerald-500/3 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
    {/* Grid pattern */}
    <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025]"
      style={{
        backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }}
    />
  </div>
);

export default Auth;
