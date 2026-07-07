import React, { useState } from 'react';
import { Logo } from '../components/Logo';
import { Lock, Mail, Eye, EyeOff, AlertCircle, ShieldAlert, Key } from 'lucide-react';
import { useToast } from '../components/Notification';

interface AdminLoginProps {
  onLoginSuccess: (token: string, adminInfo: { email: string; name: string }) => void;
  onNavigate: (page: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both your email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        toast('Welcome back to your Hyrnex Admin Console!', 'success');
        onLoginSuccess(data.token, data.admin);
      } else {
        setErrorMsg(data.error || 'Invalid credentials or connection error. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg('A network error occurred. Please verify your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24 font-sans space-y-8" id="admin-login-page">
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <Logo className="justify-center" iconSize={42} textSize="text-2xl" />
        <h1 className="text-xl font-extrabold text-neutral-900 tracking-tight">Admin Console Sign In</h1>
        <p className="text-xs text-neutral-400 font-medium">Authorised platform administrator credentials required.</p>
      </div>

      {/* Form Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-100 shadow-lg space-y-6">
        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-xl flex items-start gap-2.5 animate-slide-down">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4" id="admin-login-form">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-600">Email Address</label>
            <div className="relative flex items-center border border-neutral-200 rounded-xl px-3 py-2.5 bg-neutral-50 focus-within:bg-white focus-within:border-blue-500 transition-all">
              <Mail className="w-4 h-4 text-neutral-400 mr-2 flex-shrink-0" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@hyrnex.com"
                className="w-full text-xs bg-transparent outline-none text-neutral-800"
                id="login-email"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-neutral-600">Security Password</label>
            </div>
            <div className="relative flex items-center border border-neutral-200 rounded-xl px-3 py-2.5 bg-neutral-50 focus-within:bg-white focus-within:border-blue-500 transition-all">
              <Lock className="w-4 h-4 text-neutral-400 mr-2 flex-shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs bg-transparent outline-none text-neutral-800"
                id="login-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 hover:bg-neutral-200 rounded text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
                aria-label="Toggle password visibility"
                id="toggle-password-view"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            id="login-submit-btn"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Validating Security...
              </>
            ) : (
              <>
                <Key className="w-3.5 h-3.5" />
                Sign In to Console
              </>
            )}
          </button>
        </form>
      </div>

      {/* Convenience Seeding / Fallback Box */}
      <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-2 text-xs">
        <h4 className="font-bold text-blue-800 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4" />
          Default Seeding Credentials
        </h4>
        <p className="text-neutral-500 leading-relaxed font-medium">
          For initial setup and assessment in AI Studio, you can authenticate using the pre-seeded admin profile:
        </p>
        <div className="pt-1.5 font-mono text-[10px] space-y-1 text-neutral-600">
          <p><span className="font-semibold text-blue-700">Email:</span> admin@hyrnex.com</p>
          <p><span className="font-semibold text-blue-700">Password:</span> admin123</p>
        </div>
      </div>
    </div>
  );
};
