/**
 * StadiumPulse AI - Login Page
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/types';

const DEMO_ACCOUNTS = [
  { email: 'fan@demo.com', password: 'password123', role: 'FAN' as const, label: '🎉 Fan', redirect: '/fan' },
  { email: 'organizer@demo.com', password: 'password123', role: 'ORGANIZER' as const, label: '📊 Organizer', redirect: '/organizer' },
  { email: 'volunteer@demo.com', password: 'password123', role: 'VOLUNTEER' as const, label: '🤝 Volunteer', redirect: '/volunteer' },
  { email: 'admin@demo.com', password: 'password123', role: 'ADMIN' as const, label: '🛡️ Admin', redirect: '/security' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('FAN');
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegister) {
        await register(email, password, name, role);
      } else {
        await login(email, password);
      }
      const account = DEMO_ACCOUNTS.find((a) => a.email === email);
      navigate(account?.redirect || '/fan');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  const handleDemoLogin = async (account: (typeof DEMO_ACCOUNTS)[0]) => {
    setError('');
    try {
      await login(account.email, account.password);
      navigate(account.redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo login failed. Make sure the server is running.');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-72px)] flex items-center justify-center px-4 py-8 lg:py-12 overflow-hidden page-shell">
      {/* Dynamic Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 mix-blend-screen animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px] -z-10 mix-blend-screen" />
      
      <div className="w-full max-w-5xl grid lg:grid-cols-[1.1fr_0.9fr] gap-[2rem] lg:gap-[3rem] animate-fade-in relative z-10">
        
        {/* Left Side Info Card */}
        <section 
          className="glass-card hidden lg:flex flex-col justify-between rounded-2xl border border-white/10 min-h-[35rem]"
          style={{ padding: '2.25rem' }}
        >
          <div className="space-y-8">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent blur-md opacity-50 rounded-xl animate-pulse-glow" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25 border border-white/20">
                <Zap className="w-7 h-7 text-white drop-shadow-md" strokeWidth={2.5} />
              </div>
            </div>
            <div className="space-y-4 max-w-xl">
              <h1 className="text-4xl font-black tracking-tight text-white leading-none">
                StadiumPulse <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">AI</span>
              </h1>
              <p className="text-base text-slate-300 leading-relaxed max-w-lg">
                Live operations for fans, organizers, volunteers, and security teams with real-time crowd intelligence and route guidance.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-[1rem] max-w-lg">
              {[
                ['Live crowd density', 'Track congestion before it becomes a problem'],
                ['AI navigation', 'Find the fastest path to gates, food, and facilities'],
                ['Incident workflows', 'Acknowledge, route, and resolve in one place'],
                ['Multi-role access', 'Switch views by role without losing context'],
              ].map(([title, text]) => (
                <div key={title} className="rounded-xl border border-white/10 bg-white/[0.03]" style={{ padding: '1rem' }}>
                  <p className="text-[0.95rem] font-semibold text-white">{title}</p>
                  <p className="text-sm leading-relaxed text-slate-400 mt-1.5">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-8 border-t border-white/10">
            {['Fan Hub', 'Operations', 'Volunteer', 'Security'].map((label) => (
              <span key={label} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-semibold text-slate-200">
                {label}
              </span>
            ))}
          </div>
        </section>

        {/* Right Side Cards Wrapper */}
        <div className="flex flex-col justify-between gap-[1.5rem] min-h-[35rem]">
          <div className="text-center space-y-3 lg:hidden">
            <div className="relative inline-flex mb-3">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent blur-md opacity-50 rounded-xl animate-pulse-glow" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25 border border-white/20">
                <Zap className="w-7 h-7 text-white drop-shadow-md" strokeWidth={2.5} />
              </div>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
              StadiumPulse <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">AI</span>
            </h1>
            <p className="text-[0.95rem] font-medium text-slate-400">
              FIFA World Cup 2026 Operations
            </p>
          </div>

          {/* Top Card: Actual Sign In/Register Form */}
          <div 
            className="glass-card backdrop-blur-2xl bg-slate-900/40 border border-white/10 rounded-2xl shadow-xl shadow-black/40 flex-1 flex flex-col justify-center"
            style={{ padding: '2.5rem' }}
          >
            <h2 className="text-xl font-bold text-white mb-6">
              {isRegister ? 'Create Account' : 'Sign In'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-[1.5rem]">
              {error && (
                <div 
                  className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl animate-slide-in flex items-start gap-2" 
                  style={{ padding: '0.75rem 1rem' }}
                  role="alert"
                >
                  <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">!</div>
                  <p>{error}</p>
                </div>
              )}

              {isRegister && (
                <div className="space-y-[1.25rem] animate-fade-in">
                  <div className="space-y-[0.5rem]">
                    <label htmlFor="name" className="block text-sm font-medium text-slate-300 ml-1">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-900/50 border border-white/10 text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-slate-600"
                      style={{ padding: '0.875rem 1.25rem' }}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-[0.5rem]">
                    <label htmlFor="role-select" className="block text-sm font-medium text-slate-300 ml-1">Role</label>
                    <div className="relative">
                      <select
                        id="role-select"
                        value={role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        className="w-full bg-slate-900/50 border border-white/10 text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all appearance-none cursor-pointer"
                        style={{ padding: '0.875rem 1.25rem' }}
                      >
                        <option value="FAN">Fan</option>
                        <option value="VOLUNTEER">Volunteer</option>
                        <option value="ORGANIZER">Organizer</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        ▼
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-[0.5rem]">
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 ml-1">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 text-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-slate-600"
                  style={{ padding: '0.875rem 1.25rem' }}
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div className="space-y-[0.5rem]">
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 ml-1">Password</label>
                <div className="relative group">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900/50 border border-white/10 text-white rounded-xl pr-[3rem] text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-slate-600"
                    style={{ padding: '0.875rem 1.25rem' }}
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative group overflow-hidden bg-gradient-to-r from-primary to-accent text-white rounded-xl text-[1rem] font-bold tracking-wide shadow-md shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 disabled:opacity-50"
                style={{ padding: '0.875rem 1.25rem', marginTop: '1.75rem' }}
              >
                <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full transition-transform duration-500 ease-out skew-x-12" />
                <div className="flex items-center justify-center gap-2 relative z-10">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {isRegister ? 'Create Account' : 'Sign In'}
                </div>
              </button>

              <div className="text-center pt-2">
                <p className="text-sm text-slate-400">
                  {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    type="button"
                    onClick={() => setIsRegister(!isRegister)}
                    className="text-accent hover:text-primary transition-colors font-semibold"
                  >
                    {isRegister ? 'Sign in' : 'Register'}
                  </button>
                </p>
              </div>
            </form>
          </div>

          {/* Bottom Card: Demo Quick Access Buttons */}
          <div 
            className="glass-card backdrop-blur-2xl bg-slate-900/40 border border-white/10 rounded-2xl shadow-xl shadow-black/40"
            style={{ padding: '1.75rem' }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4 text-center">
              Quick Access Demo
            </p>
            <div className="grid grid-cols-2 gap-3">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  onClick={() => handleDemoLogin(account)}
                  disabled={isLoading}
                  className="group relative rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-white/5 hover:border-white/10 text-[0.95rem] font-semibold text-slate-200 transition-all duration-300 disabled:opacity-50 overflow-hidden shadow-sm shadow-black/20 hover:shadow-black/40 hover:-translate-y-0.5 text-center flex items-center justify-center"
                  style={{ padding: '0.75rem 1rem' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  {account.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
