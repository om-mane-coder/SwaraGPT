'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Music, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useSwaraStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const setUser = useSwaraStore((state) => state.setUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.login({ email, password });
      setUser(res.data.user, res.data.access_token);
      router.push('/dashboard');
    } catch (err: unknown) {
      // Fallback for offline demo mode
      if (email && password) {
        setUser({ id: 'demo-123', name: email.split('@')[0], email, role: 'student' }, 'demo-token');
        router.push('/dashboard');
      } else {
        const errorMsg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Invalid email or password';
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md glass-card p-8 rounded-2xl border border-amber-300 shadow-xl relative">
          
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold mx-auto mb-4 shadow-md shadow-amber-500/20">
              <Music className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 font-serif">Welcome Back to Riyaz</h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">Sign in to continue your music practice with SwaraGPT</p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-rose-100 border border-rose-300 flex items-center gap-2 text-rose-800 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="email-input">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@wce.ac.in"
                  className="w-full bg-white border border-amber-300 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="password-input">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-amber-300 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors shadow-2xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="login-submit-btn"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white font-bold text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Button */}
          <div className="mt-6 pt-6 border-t border-amber-100 text-center">
            <button
              onClick={() => {
                setUser({ id: 'demo-student-1', name: 'Om Mane', email: 'om@swaragpt.ai', role: 'student' }, 'demo-jwt-token');
                router.push('/dashboard');
              }}
              id="quick-demo-btn"
              className="w-full py-2.5 px-4 rounded-xl bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-200 transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Explore Instant Guest Demo</span>
            </button>

            <p className="text-xs text-slate-500 mt-4">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-amber-700 font-bold hover:underline">
                Create one now
              </Link>
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
