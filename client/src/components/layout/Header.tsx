/**
 * StadiumPulse AI - Header Component
 */
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  Globe,
  LogOut,
  Shield,
  Users,
  LayoutDashboard,
  Home,
  Zap,
  Menu,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { LANGUAGE_LABELS, type SupportedLanguage } from '@/types';

export function Header() {
  const { user, isAuthenticated, logout, language, setLanguage } = useAuthStore();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navItems = [
    { to: '/fan', label: 'Fan Hub', icon: Home, roles: ['FAN', 'ADMIN'] },
    { to: '/organizer', label: 'Operations', icon: LayoutDashboard, roles: ['ORGANIZER', 'ADMIN'] },
    { to: '/volunteer', label: 'Volunteer', icon: Users, roles: ['VOLUNTEER', 'ADMIN'] },
    { to: '/security', label: 'Security', icon: Shield, roles: ['ADMIN'] },
  ];

  const filteredNav = navItems.filter(
    (item) => !isAuthenticated || !user || item.roles.includes(user.role),
  );

  return (
    <header className="sticky top-0 z-50 bg-[#050810]/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.1)]" role="banner">
      <div className="max-w-screen-2xl mx-auto px-4 h-[64px] flex items-center justify-between gap-4">
        
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 group"
          aria-label="StadiumPulse AI Home"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent blur-md opacity-40 rounded-lg group-hover:opacity-70 transition-opacity" />
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg border border-white/20 group-hover:scale-105 transition-transform duration-300">
              <Zap className="w-4 h-4 text-white" aria-hidden="true" strokeWidth={2.5} />
            </div>
          </div>
          <div className="hidden sm:block">
            <span className="text-lg font-bold tracking-tight text-white drop-shadow-sm">StadiumPulse</span>
            <span className="text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent ml-1 align-top uppercase tracking-wider">
              AI
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-2" aria-label="Main navigation">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'relative group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300',
                  isActive
                    ? 'text-white bg-white/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 blur-sm -z-10" />
                )}
                <Icon className={cn('w-[18px] h-[18px] transition-colors', isActive ? 'text-accent' : 'group-hover:text-slate-300')} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setMobileNavOpen((open) => !open)}
          className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 transition-colors"
          aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileNavOpen}
          aria-controls="mobile-navigation"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Right side: Language + Auth */}
        <div className="hidden sm:flex items-center gap-4">
          
          {/* Language Selector */}
          <div className="relative group">
            <label htmlFor="language-select" className="sr-only">
              Select language
            </label>
            <div className="flex items-center gap-1.5 bg-slate-900/50 hover:bg-slate-800/80 border border-white/5 hover:border-white/10 rounded-lg px-2.5 py-1.5 transition-all duration-300">
              <Globe className="w-4 h-4 text-slate-400 group-hover:text-accent transition-colors" aria-hidden="true" />
              <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="bg-transparent text-sm font-medium text-slate-200 border-none outline-none cursor-pointer appearance-none pr-5 focus:ring-0"
                aria-label="Language selection"
              >
                {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
                  <option key={code} value={code} className="bg-slate-900 text-slate-200">
                    {label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-slate-300 transition-colors">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Auth */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-white tracking-wide">{user.name}</p>
                <p className="text-[0.65rem] font-medium text-accent uppercase tracking-widest">{user.role}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all duration-300"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="w-[18px] h-[18px]" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="relative group overflow-hidden bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full transition-transform duration-500 ease-out skew-x-12" />
              <span className="relative z-10">Sign In</span>
            </Link>
          )}
        </div>
      </div>

      {mobileNavOpen && (
        <div id="mobile-navigation" className="md:hidden border-t border-white/5 bg-[#050810]/95 backdrop-blur-xl px-4 py-4 space-y-4">
          <nav className="grid gap-2" aria-label="Mobile navigation">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileNavOpen(false)}
                  className={cn(
                    'flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-white/10 border-white/10 text-white'
                      : 'bg-white/[0.03] border-white/5 text-slate-300 hover:bg-white/5 hover:text-white',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="flex items-center gap-3">
                    <Icon className={cn('w-4 h-4', isActive ? 'text-accent' : 'text-slate-400')} aria-hidden="true" />
                    {item.label}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-slate-500">{item.to.replace('/', '')}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/5">
            <div className="flex items-center gap-2 bg-slate-900/50 border border-white/5 rounded-xl px-3 py-2">
              <Globe className="w-4 h-4 text-slate-400" aria-hidden="true" />
              <select
                id="mobile-language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="bg-transparent text-sm font-medium text-slate-200 border-none outline-none cursor-pointer"
                aria-label="Language selection"
              >
                {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
                  <option key={code} value={code} className="bg-slate-900 text-slate-200">
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {isAuthenticated && user ? (
              <button
                onClick={() => {
                  logout();
                  setMobileNavOpen(false);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-300 border border-red-500/20 text-sm font-semibold"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileNavOpen(false)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
