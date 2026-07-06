/**
 * StadiumPulse AI - App Root
 *
 * Sets up routing with lazy-loaded pages and Socket.io connection.
 */
import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { useAuthStore } from '@/stores/authStore';
import { useSocket } from '@/hooks/useSocket';
import { Loader2 } from 'lucide-react';

// Lazy-loaded routes for code splitting
const Login = lazy(() => import('@/pages/Login'));
const FanHome = lazy(() => import('@/pages/FanHome'));
const OrganizerDashboard = lazy(() => import('@/pages/OrganizerDashboard'));
const VolunteerPortal = lazy(() => import('@/pages/VolunteerPortal'));
const SecurityPanel = lazy(() => import('@/pages/SecurityPanel'));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]" role="status">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Route guard component — redirects to login if not authenticated.
 */
function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role) && user.role !== 'ADMIN') {
    return <Navigate to="/fan" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const { checkAuth } = useAuthStore();

  // Restore auth state from localStorage on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Connect to WebSocket for real-time crowd data
  useSocket();

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.10),transparent_28%),radial-gradient(circle_at_top_right,rgba(6,182,212,0.08),transparent_24%),linear-gradient(180deg,#050810_0%,#060b16_48%,#04070d_100%)]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-slate-950 focus:text-white focus:border focus:border-white/10"
        >
          Skip to content
        </a>
        <Header />
        <main className="flex-1 relative" id="main-content">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/fan" replace />} />

              {/* Fan route (accessible to all authenticated users) */}
              <Route
                path="/fan"
                element={
                  <ProtectedRoute>
                    <FanHome />
                  </ProtectedRoute>
                }
              />

              {/* Organizer route */}
              <Route
                path="/organizer"
                element={
                  <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']}>
                    <OrganizerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Volunteer route */}
              <Route
                path="/volunteer"
                element={
                  <ProtectedRoute allowedRoles={['VOLUNTEER', 'ADMIN']}>
                    <VolunteerPortal />
                  </ProtectedRoute>
                }
              />

              {/* Security/Admin route */}
              <Route
                path="/security"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <SecurityPanel />
                  </ProtectedRoute>
                }
              />

              {/* 404 */}
              <Route
                path="*"
                element={
                  <div className="flex items-center justify-center min-h-[60vh] px-4">
                    <div className="glass-card max-w-md w-full text-center p-10 space-y-3">
                      <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Lost route</p>
                      <h2 className="text-3xl font-black text-foreground">Page not found</h2>
                      <p className="text-muted-foreground leading-relaxed">
                        The route you requested does not exist. Use the navigation above to return to the live dashboards.
                      </p>
                    </div>
                  </div>
                }
              />
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  );
}
