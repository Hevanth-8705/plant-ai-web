import React, { useState } from 'react';
import { 
  Sprout, 
  Bell, 
  Bot, 
  Plus, 
  Menu, 
  User as UserIcon, 
  LogOut, 
  Settings, 
  Sparkles,
  ChevronDown,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { Button } from '../common/Button.tsx';

interface NavbarProps {
  onOpenMobileMenu: () => void;
  onOpenAddPlant: () => void;
  activePage: string;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMobileMenu,
  onOpenAddPlant,
  activePage,
  onNavigate,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleSignOut = () => {
    setProfileDropdownOpen(false);
    logout();
    onNavigate('login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto gap-4">
        {/* Left: Mobile hamburger + Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Sprout className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-emerald-950 font-serif">
                Plant<span className="text-emerald-700">Pal</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                AI Garden
              </span>
            </div>
          </button>
        </div>

        {/* Center / Right: Quick Actions & Authentication */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Ask AI quick button */}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onNavigate('chat')}
            icon={<Sparkles className="w-4 h-4 text-emerald-700" />}
            className="hidden sm:inline-flex"
          >
            Ask PlantPal AI
          </Button>

          {/* Add Plant Button */}
          <Button
            size="sm"
            variant="primary"
            onClick={onOpenAddPlant}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Plant
          </Button>

          {/* Notifications */}
          <button
            onClick={() => onNavigate('notifications')}
            className="relative p-2.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Auth Section */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-stone-100 transition-colors focus:outline-none cursor-pointer"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-emerald-300"
                />
                <span className="hidden md:inline-block text-xs font-semibold text-stone-800 max-w-[100px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="hidden md:inline-block w-3.5 h-3.5 text-stone-400" />
              </button>

              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in duration-150"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-stone-100">
                    <p className="text-xs font-bold text-stone-900">{user.name}</p>
                    <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => onNavigate('settings')}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" /> Garden Settings & Profile
                  </button>
                  <button
                    onClick={() => onNavigate('chat')}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center gap-2 cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5" /> AI Assistant Chat
                  </button>
                  <button
                    onClick={() => onNavigate('login')}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-emerald-800 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Switch / 3D Login
                  </button>
                  <div className="border-t border-stone-100 my-1" />
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onNavigate('login')}
                icon={<LogIn className="w-3.5 h-3.5 text-emerald-700" />}
                className="text-stone-700 hover:text-emerald-900"
              >
                Sign In
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() => onNavigate('register')}
                icon={<UserPlus className="w-3.5 h-3.5" />}
              >
                Register
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
