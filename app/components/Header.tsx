'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from './AuthModal';

interface HeaderProps {
  onAlertsClick?: () => void;
  alertsCount?: number;
}

export default function Header({ onAlertsClick, alertsCount = 0 }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#00ffa3] to-[#00d4aa] rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">⚡</span>
              </div>
              <span className="text-lg font-semibold tracking-tight">
                Chainpulse
              </span>
            </div>

            {/* Desktop Nav */}
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

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Mobile Alerts Button - Always visible on mobile */}
              <button
                onClick={onAlertsClick}
                className="md:hidden relative p-2.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
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
                  className="text-[var(--text-primary)]"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {alertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 text-[10px] font-bold bg-[var(--accent-red)] text-white rounded-full flex items-center justify-center">
                    {alertsCount > 9 ? '9+' : alertsCount}
                  </span>
                )}
              </button>

              {/* Auth button */}
              {!loading && (
                user ? (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-sm text-[var(--text-secondary)] hidden sm:block">
                      {user.email?.split('@')[0]}
                    </span>
                    <button
                      onClick={handleSignOut}
                      className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors hidden sm:block"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="hidden sm:flex items-center gap-2">
                    <button
                      onClick={() => { setAuthMode('signin'); setShowAuthModal(true); }}
                      className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      Sign in
                    </button>
                    <button
                      onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
                      className="px-4 py-2 text-sm font-medium bg-white text-black rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Sign up
                    </button>
                  </div>
                )
              )}

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2.5 rounded-xl hover:bg-[var(--bg-hover)] transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
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
                  {isMenuOpen ? (
                    <path d="M18 6L6 18M6 6l12 12" />
                  ) : (
                    <path d="M3 12h18M3 6h18M3 18h18" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {isMenuOpen && (
            <nav className="md:hidden py-4 border-t border-[var(--border)]">
              <div className="flex flex-col gap-1">
                {/* User info on mobile */}
                {user && (
                  <div className="px-3 py-3 mb-2 bg-[var(--bg-secondary)] rounded-xl">
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {user.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {user.email}
                    </p>
                  </div>
                )}
                
                <a
                  href="#"
                  className="px-3 py-3 rounded-xl text-[var(--text-primary)] font-medium hover:bg-[var(--bg-hover)] transition-colors"
                >
                  Dashboard
                </a>
                <button
                  onClick={() => {
                    onAlertsClick?.();
                    setIsMenuOpen(false);
                  }}
                  className="px-3 py-3 rounded-xl text-left text-[var(--text-secondary)] font-medium hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-2"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  Alerts
                  {alertsCount > 0 && (
                    <span className="ml-auto w-6 h-6 text-xs font-bold bg-[var(--accent-blue)] text-white rounded-full flex items-center justify-center">
                      {alertsCount > 9 ? '9+' : alertsCount}
                    </span>
                  )}
                </button>
                <a
                  href="#"
                  className="px-3 py-3 rounded-xl text-[var(--text-secondary)] font-medium hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Settings
                </a>
                
                <div className="mt-2 pt-2 border-t border-[var(--border)]">
                  {user ? (
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-3 py-3 rounded-xl text-left text-[var(--accent-red)] font-medium hover:bg-[var(--accent-red)]/10 transition-colors"
                    >
                      Sign out
                    </button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => { setAuthMode('signin'); setShowAuthModal(true); setIsMenuOpen(false); }}
                        className="w-full px-4 py-3 rounded-xl text-center font-medium border border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors"
                      >
                        Sign in
                      </button>
                      <button
                        onClick={() => { setAuthMode('signup'); setShowAuthModal(true); setIsMenuOpen(false); }}
                        className="w-full px-4 py-3 rounded-xl text-center font-medium bg-white text-black hover:bg-gray-100 transition-colors"
                      >
                        Sign up
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </nav>
          )}
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode={authMode} />
    </>
  );
}
