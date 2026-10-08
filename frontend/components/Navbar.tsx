'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Sparkles, Music, Mic, BookOpen, Activity, User, LogOut, 
  Settings, History, Menu, X, Compass, Award 
} from 'lucide-react';
import { useSwaraStore } from '@/lib/store';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useSwaraStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Activity },
    { href: '/practice', label: 'Practice', icon: Mic },
    { href: '/analyze', label: 'Analyze', icon: Award },
    { href: '/ragas', label: 'Ragas', icon: BookOpen },
    { href: '/progress', label: 'Progress', icon: Compass },
    { href: '/history', label: 'History', icon: History },
    { href: '/chat', label: 'Guru Chat', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-amber-900/10 bg-white/95 backdrop-blur-md shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Identity */}
        <Link href="/" className="flex items-center gap-3 group" id="nav-brand-logo">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform duration-300">
            <Music className="w-5 h-5 text-black" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight saffron-gradient-text">SwaraGPT</span>
            <span className="text-[10px] text-amber-700/80 tracking-widest uppercase font-mono font-medium">Virtual Guru AI</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-2 text-sm font-medium text-slate-600">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-amber-800 bg-amber-100/90 font-semibold border border-amber-300/80 shadow-2xs'
                    : 'text-slate-600 hover:text-amber-800 hover:bg-amber-50/70'
                }`}
                id={`nav-${link.label.toLowerCase().replace(' ', '-')}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-700' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User CTA & Profile Menu */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm font-medium hover:bg-amber-100 transition-all shadow-2xs"
                id="nav-user-profile"
              >
                <User className="w-4 h-4 text-amber-700" />
                <span className="max-w-[120px] truncate">{user.name}</span>
              </Link>

              <Link
                href="/settings"
                className="p-2 rounded-lg text-slate-500 hover:text-amber-800 hover:bg-amber-50 transition-all"
                title="Settings"
                id="nav-settings-btn"
              >
                <Settings className="w-4 h-4" />
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all"
                title="Sign Out"
                id="nav-logout-btn"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-amber-800 transition-colors"
                id="nav-login-btn"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold text-sm shadow-md shadow-amber-500/20 hover:scale-105 transition-all"
                id="nav-register-btn"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex lg:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-amber-50"
            id="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-3 pb-6 border-t border-amber-900/10 bg-white shadow-xl space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? 'text-amber-800 bg-amber-100' : 'text-slate-600 hover:bg-amber-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-4 border-t border-amber-100 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5"
                >
                  <User className="w-5 h-5 text-amber-400" />
                  <span>Profile ({user.name})</span>
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/5"
                >
                  <Settings className="w-5 h-5 text-gray-400" />
                  <span>Audio & App Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-500/10 text-left"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-1/2 text-center py-2 text-sm rounded-lg border border-gray-700 text-gray-300"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-1/2 text-center py-2 text-sm rounded-lg bg-amber-500 text-black font-semibold"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
