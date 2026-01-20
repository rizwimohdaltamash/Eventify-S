import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Calendar, LogOut, User, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/events');
    window.location.reload();
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => navigate('/events')}
          >
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Eventify</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => navigate('/events')}
              className="text-white/90 hover:text-white font-medium transition-colors"
            >
              Events
            </button>
            {isAuthenticated && user?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="text-white/90 hover:text-white font-medium transition-colors flex items-center gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Admin Dashboard
              </button>
            )}
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-3">
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
                      <span className="text-xs text-white/70">Administrator</span>
                    )}
                  </div>
                </div>

                {/* Mobile Admin Dashboard Button */}
                {user?.role === 'admin' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/admin')}
                    className="md:hidden bg-white/10 hover:bg-white/20 text-white border-white/20"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                  </Button>
                )}

                {/* Logout Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  <LogOut className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate('/signup')}
                  className="bg-white hover:bg-white/90 text-blue-600 font-semibold"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
