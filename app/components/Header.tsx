'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from './AuthModal';

interface HeaderProps {
  onAlertsClick?: () => void;
  alertsCount?: number;
}

export default function Header({ onAlertsClick, alertsCount = 0 }: HeaderProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const { user, loading, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      <header className="border-b border-[var(--border)] bg-[var(--bg-primary)] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-[#00ffa3] to-[#00d4aa] rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-xs sm:text-sm">⚡</span>
              </div>
              <span className="text-base sm:text-lg font-semibold tracking-tight">
                Chainpulse
              </span>
            </div>

            {/* Desktop Nav - hidden on mobile */}
            <nav className="hidden md:flex items-center gap-8">
              <a
                href="#"
                className="text-[var(--text-primary)] text-sm font-medium hover:opacity-80 transition-opacity"
              >
                Dashboard
              </a>
              <button
                onClick={onAlertsClick}
                className="relative text-[var(--text-secondary)] text-sm font-medium hover:text-[var(--text-primary)] transition-colors flex items-center gap-1"
              >
                Alerts
                {alertsCount > 0 && (
                  <span className="absolute -top-1 -right-3 w-4 h-4 text-[10px] font-bold bg-[var(--accent-blue)] text-white rounded-full flex items-center justify-center">
                    {alertsCount > 9 ? '9+' : alertsCount}
                  </span>
                )}
              </button>
              <a
                href="#"
                className="text-[var(--text-secondary)] text-sm font-medium hover:text-[var(--text-primary)] transition-colors"
              >
                Settings
              </a>
            </nav>

            {/* Right side - All visible, no hamburger */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Alerts Bell - visible on all screens */}
              <button
                onClick={onAlertsClick}
                className="relative p-2 sm:p-2.5 rounded-xl hover:bg-[var(--bg-hover)] transition-colors md:hidden"
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

              {/* Settings Gear - visible on mobile only */}
              <button
                className="p-2 sm:p-2.5 rounded-xl hover:bg-[var(--bg-hover)] transition-colors md:hidden"
                aria-label="Settings"
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
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              </button>

              {/* Auth buttons */}
              {!loading && (
                user ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm text-[var(--text-muted)] hidden sm:block max-w-[100px] truncate">
                      {user.email?.split('@')[0]}
                    </span>
                    <button
                      onClick={handleSignOut}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setAuthMode('signin'); setShowAuthModal(true); }}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      Sign in
                    </button>
                    <button
                      onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium bg-[#00ffa3] text-black rounded-lg hover:bg-[#00e693] transition-colors"
                    >
                      Sign up
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode={authMode} />
    </>
  );
}
