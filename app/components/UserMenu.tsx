'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from './AuthModal';

interface UserMenuProps {
  onAlertsClick?: () => void;
  alertsCount?: number;
}

export default function UserMenu({ onAlertsClick, alertsCount = 0 }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [theme, setTheme] = useState('Dark');
  const [homepage, setHomepage] = useState('Portfolio');
  const menuRef = useRef<HTMLDivElement>(null);
  
  const { user, loading, signOut } = useAuth();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const handleSignIn = () => {
    setAuthMode('signin');
    setShowAuthModal(true);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        {/* Person Icon Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2.5 rounded-xl hover:bg-[var(--bg-hover)] transition-colors group"
          aria-label="User menu"
        >
          {/* Person Icon */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white group-hover:text-[#22c55e] transition-colors"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          
          {/* Notification dot when signed in */}
          {user && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#22c55e] rounded-full" />
          )}
        </button>

        {/* Alerts Bell - next to user icon */}
        <button
          onClick={onAlertsClick}
          className="relative p-2.5 rounded-xl hover:bg-[var(--bg-hover)] transition-colors ml-1"
          aria-label="Alerts"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[var(--text-secondary)]"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {alertsCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[9px] font-bold bg-[var(--accent-green)] text-black rounded-full flex items-center justify-center">
              {alertsCount > 9 ? '9+' : alertsCount}
            </span>
          )}
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-72 bg-[#111] border border-[#222] rounded-xl shadow-2xl overflow-hidden animate-fadeIn z-50">
            {/* Settings Section */}
            <div className="p-4 space-y-4">
              {/* Theme Selector */}
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Theme</span>
                <div className="relative">
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="appearance-none bg-[#222] text-white px-4 py-2 pr-8 rounded-lg text-sm font-medium cursor-pointer hover:bg-[#2a2a2a] transition-colors"
                  >
                    <option value="Dark">Dark</option>
                    <option value="Light">Light</option>
                    <option value="Sakura">Sakura</option>
                    <option value="Ocean">Ocean</option>
                    <option value="Forest">Forest</option>
                  </select>
                  <svg
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666] pointer-events-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Default Homepage Selector */}
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Default<br/>Homepage</span>
                <div className="relative">
                  <select
                    value={homepage}
                    onChange={(e) => setHomepage(e.target.value)}
                    className="appearance-none bg-[#222] text-white px-4 py-2 pr-8 rounded-lg text-sm font-medium cursor-pointer hover:bg-[#2a2a2a] transition-colors"
                  >
                    <option value="Portfolio">Portfolio</option>
                    <option value="Alerts">Alerts</option>
                    <option value="NFTs">NFTs</option>
                    <option value="Domains">Domains</option>
                  </select>
                  <svg
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666] pointer-events-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#222]" />

            {/* Auth Section */}
            <div className="p-4">
              {!loading && (
                user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-[#0a1a0f] rounded-lg border border-[#1a3a25]">
                      <div className="w-8 h-8 bg-[#22c55e] rounded-full flex items-center justify-center">
                        <span className="text-black font-bold text-sm">
                          {user.email?.[0]?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {user.email?.split('@')[0]}
                        </p>
                        <p className="text-xs text-[#666] truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full py-2.5 text-sm font-medium text-[#888] hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-[#888] text-sm text-center">
                      Sign in to save your portfolio
                    </p>
                    <button
                      onClick={handleSignIn}
                      className="w-full py-3.5 bg-[#22c55e] text-black font-semibold rounded-xl hover:bg-[#1ea54e] transition-colors"
                    >
                      Sign In
                    </button>
                    <p className="text-[#666] text-xs text-center">
                      Email · Google
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        initialMode={authMode} 
      />
    </>
  );
}
