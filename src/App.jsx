import { Calendar, Sparkles, LogOut, User, LayoutDashboard } from 'lucide-react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import EventsPage from './pages/EventsPage'
import EventAttendeesPage from './pages/EventAttendeesPage'
import PublicEventsPage from './pages/PublicEventsPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './hooks/useAuth'

function NavbarContent() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/events');
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-gray-900 via-gray-800 to-black shadow-lg border-b border-gray-700">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/events" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                Eventify
                <Sparkles className="h-4 w-4 text-yellow-400" />
              </h1>
              <p className="text-gray-300 text-xs hidden sm:block">Manage events & attendees with ease</p>
            </div>
          </Link>

          {/* Navigation & Auth Section */}
          <div className="flex items-center gap-3">
            {/* Navigation Links */}
            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/admin"
                className="hidden md:flex items-center gap-2 text-white/90 hover:text-white font-medium transition-colors px-3 py-2 rounded-md hover:bg-white/10"
              >
                <LayoutDashboard className="h-4 w-4" />
                Admin Dashboard
              </Link>
            )}

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <>
                {/* User Info */}
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                  <div className="bg-white/20 p-1.5 rounded-full">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white leading-tight">
                      {user?.name || user?.email}
                    </span>
                    {user?.role === 'admin' && (
                      <span className="text-xs text-gray-300">Administrator</span>
                    )}
                  </div>
                </div>

                {/* Mobile Admin Button */}
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="md:hidden inline-flex items-center justify-center rounded-md bg-white/10 hover:bg-white/20 text-white border border-white/20 p-2"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                  </Link>
                )}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-md bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 text-sm font-medium transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/login')}
                  className="rounded-md bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 text-sm font-medium transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="rounded-md bg-white hover:bg-white/90 text-gray-900 px-4 py-2 text-sm font-semibold transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <NavbarContent />
        
        <main>
          <Routes>
            <Route path="/" element={<PublicEventsPage />} />
            <Route path="/events" element={<PublicEventsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <EventsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/events/:eventId/attendees" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <EventAttendeesPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
