'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Music, Mic, BookOpen, Activity, User, LogOut, 
  Settings, History, Menu, X, Compass, Award, MessageSquare 
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
    { href: '/chat', label: 'Guru AI', icon: MessageSquare },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        
        {/* Brand Identity */}
        <Link href="/" className="flex items-center gap-2.5" id="nav-brand-logo">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white shadow-2xs ring-1 ring-pink-200/50">
            <Music className="w-4 h-4 text-pink-200" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900">
            Swara<span className="text-pink-600/90">GPT</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs transition-colors ${
                  isActive
                    ? 'text-pink-950 bg-pink-50/80 border border-pink-200/60 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-pink-50/40'
                }`}
                id={`nav-${link.label.toLowerCase().replace(' ', '-')}`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-pink-700' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User CTA & Profile Menu */}
        <div className="hidden sm:flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-1.5">
              <Link
                href="/profile"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-100 transition-colors"
                id="nav-user-profile"
              >
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span className="max-w-[100px] truncate">{user.name}</span>
              </Link>

              <Link
                href="/settings"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                title="Settings"
                id="nav-settings-btn"
              >
                <Settings className="w-4 h-4" />
              </Link>

              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-50 transition-colors"
                title="Sign Out"
                id="nav-logout-btn"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 text-xs font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-medium ${
                  isActive ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 text-slate-500" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
