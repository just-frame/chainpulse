'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from './AuthModal';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const { user, loading, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      <header className="border-b border-[var(--border)] bg-[var(--bg-primary)]">
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
              <a
                href="#"
                className="text-[var(--text-secondary)] text-sm font-medium hover:text-[var(--text-primary)] transition-colors"
              >
                Alerts
              </a>
              <a
                href="#"
                className="text-[var(--text-secondary)] text-sm font-medium hover:text-[var(--text-primary)] transition-colors"
              >
                Settings
              </a>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Auth button */}
              {!loading && (
                user ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[var(--text-secondary)] hidden sm:block">
                      {user.email?.split('@')[0]}
                    </span>
                    <button
                      onClick={handleSignOut}
                      className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
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
                className="md:hidden p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
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
              <div className="flex flex-col gap-4">
                <a
                  href="#"
                  className="text-[var(--text-primary)] text-sm font-medium"
                >
                  Dashboard
                </a>
                <a
                  href="#"
                  className="text-[var(--text-secondary)] text-sm font-medium hover:text-[var(--text-primary)]"
                >
                  Alerts
                </a>
                <a
                  href="#"
                  className="text-[var(--text-secondary)] text-sm font-medium hover:text-[var(--text-primary)]"
                >
                  Settings
                </a>
                {!user && (
                  <>
                    <button
                      onClick={() => { setAuthMode('signin'); setShowAuthModal(true); }}
                      className="text-left text-[var(--text-secondary)] text-sm font-medium hover:text-[var(--text-primary)]"
                    >
                      Sign in
                    </button>
                    <button
                      onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
                      className="text-left text-[var(--text-secondary)] text-sm font-medium hover:text-[var(--text-primary)]"
                    >
                      Sign up
                    </button>
                  </>
                )}
              </div>
            </nav>
          )}
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode={authMode} />
    </>
  );
}
