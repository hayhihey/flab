import React, { useState } from 'react';
import { Mail, Lock, Loader2, User, Car, MapPin, ArrowLeft, Sparkles, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '@/services/api';
import { useAuthStore } from '@/context/store';

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [role, setRole] = useState<'rider' | 'driver'>('rider');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const response = await authAPI.signUp(email, password, role, name);
        const { token, profile, refreshToken, expiresIn } = response.data;
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }
        setAuth(token, profile, expiresIn);
        navigate(role === 'driver' ? '/driver' : '/ride');
      } else {
        const response = await authAPI.signIn(email, password);
        const { token, profile, refreshToken, expiresIn } = response.data;
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }
        setAuth(token, profile, expiresIn);
        const nextRole = (profile as any)?.role;
        navigate(nextRole === 'driver' ? '/driver' : '/ride');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const backToRole = () => {
    setStep('role');
    setError('');
  };

  const isSubmitDisabled =
    loading ||
    !email ||
    !password ||
    (mode === 'signup' && (!name || password.length < 6));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary-500/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob" />
        <div className="absolute top-1/3 -right-20 w-96 h-96 bg-secondary-500/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl rotate-6 opacity-50 animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl -rotate-6 opacity-50 animate-pulse animation-delay-500" />
            <div className="relative w-full h-full bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary-500/30">
              <MapPin className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent mb-2">
            RideHub
          </h1>
          <p className="text-slate-400 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-secondary-500" />
            The Future of Mobility
            <Sparkles className="w-4 h-4 text-primary-500" />
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-card rounded-3xl p-8 shadow-2xl">
          {/* Mode Toggle */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex bg-slate-900/60 rounded-xl p-1.5 border border-slate-700/50">
              <button
                onClick={() => {
                  setMode('signup');
                  setStep('role');
                  setError('');
                }}
                className={`relative px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  mode === 'signup' 
                    ? 'text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode === 'signup' && (
                  <span className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-lg shadow-primary-500/30" />
                )}
                <span className="relative">Create account</span>
              </button>
              <button
                onClick={() => {
                  setMode('signin');
                  setStep('role');
                  setError('');
                }}
                className={`relative px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  mode === 'signin' 
                    ? 'text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode === 'signin' && (
                  <span className="absolute inset-0 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-lg shadow-lg shadow-secondary-500/30" />
                )}
                <span className="relative">Sign in</span>
              </button>
            </div>
            <span className="text-xs text-slate-500 hidden sm:block">
              {mode === 'signup' ? 'New to RideHub' : 'Welcome back'}
            </span>
          </div>

          {/* Step: Role Selection */}
          {step === 'role' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Choose your experience</h2>
                <p className="text-slate-400 text-sm">Select how you want to use RideHub</p>
              </div>

              <div className="grid gap-4">
                {/* Rider Option */}
                <button
                  onClick={() => {
                    setRole('rider');
                    setStep('form');
                  }}
                  className="group relative p-5 rounded-2xl border-2 border-slate-700/50 hover:border-primary-500/50 bg-slate-800/30 hover:bg-primary-500/5 transition-all duration-300 text-left overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 to-primary-500/0 group-hover:from-primary-500/10 group-hover:to-transparent transition-all duration-500" />
                  <div className="relative flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 flex items-center justify-center border border-primary-500/30 group-hover:scale-110 transition-transform duration-300">
                      <MapPin className="w-7 h-7 text-primary-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-white group-hover:text-primary-500 transition-colors">
                        I want to ride
                      </h3>
                      <p className="text-sm text-slate-400 mt-1">Book rides on demand, track drivers in real-time</p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <Zap className="w-3 h-3" /> Fast booking
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <Shield className="w-3 h-3" /> Safe rides
                        </span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Driver Option */}
                <button
                  onClick={() => {
                    setRole('driver');
                    setStep('form');
                  }}
                  className="group relative p-5 rounded-2xl border-2 border-slate-700/50 hover:border-secondary-500/50 bg-slate-800/30 hover:bg-secondary-500/5 transition-all duration-300 text-left overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-secondary-500/0 to-secondary-500/0 group-hover:from-secondary-500/10 group-hover:to-transparent transition-all duration-500" />
                  <div className="relative flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-secondary-500/20 to-secondary-600/20 flex items-center justify-center border border-secondary-500/30 group-hover:scale-110 transition-transform duration-300">
                      <Car className="w-7 h-7 text-secondary-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-white group-hover:text-secondary-500 transition-colors">
                        I want to drive
                      </h3>
                      <p className="text-sm text-slate-400 mt-1">Earn money on your schedule, be your own boss</p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <Zap className="w-3 h-3" /> Flexible hours
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <Shield className="w-3 h-3" /> Weekly pay
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step: Form */}
          {step === 'form' && (
            <div className="space-y-6 animate-fade-in">
              <button 
                onClick={backToRole} 
                className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to selection
              </button>
              
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {mode === 'signup' 
                    ? (role === 'rider' ? "Let's get you riding" : 'Start earning today') 
                    : 'Welcome back'}
                </h2>
                <p className="text-slate-400 text-sm">
                  {mode === 'signup' 
                    ? 'Create your account to get started' 
                    : 'Sign in to continue your journey'}
                </p>
              </div>

              <div className="space-y-4">
                {mode === 'signup' && (
                  <div className="group">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                    <div className="relative">
                      <User className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary-500 transition-colors" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="input-modern pl-12"
                      />
                    </div>
                  </div>
                )}

                <div className="group">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary-500 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input-modern pl-12"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary-500 transition-colors" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="input-modern pl-12"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-400 animate-shake">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      {error}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitDisabled}
                  className={`
                    w-full py-4 rounded-xl font-semibold text-white
                    transition-all duration-300 transform
                    flex items-center justify-center gap-3
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                    ${mode === 'signup' 
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-[1.02] active:scale-[0.98]' 
                      : 'bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 shadow-lg shadow-secondary-500/30 hover:shadow-secondary-500/50 hover:scale-[1.02] active:scale-[0.98]'}
                  `}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {mode === 'signup' ? 'Creating account...' : 'Signing in...'}
                    </>
                  ) : (
                    <>
                      {mode === 'signup' ? 'Create account' : 'Sign in'}
                      <ArrowLeft className="w-5 h-5 rotate-180" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          By continuing, you agree to our{' '}
          <a href="#" className="text-primary-500 hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-primary-500 hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};
