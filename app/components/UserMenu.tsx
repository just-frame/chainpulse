'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import AuthModal from './AuthModal';

interface UserMenuProps {
  onAlertsClick?: () => void;
  alertsCount?: number;
}

export default function UserMenu({ onAlertsClick, alertsCount = 0 }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const menuRef = useRef<HTMLDivElement>(null);

  const { user, loading, signOut, signInWithGoogle } = useAuth();
  const { mounted } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
    setIsOpen(false);
  };

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative flex items-center gap-1" ref={menuRef}>
        {/* User Icon */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2.5 border border-transparent hover:border-[var(--border)] hover:bg-[var(--bg-glass)] transition-all group"
          aria-label="User menu"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-colors"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          {user && (
            <span
              className="absolute top-2 right-2 w-1.5 h-1.5 bg-[var(--accent-green)]"
              style={{ boxShadow: '0 0 6px var(--accent-green)' }}
            />
          )}
        </button>

        {/* Alerts Bell - Mobile only */}
        <button
          onClick={onAlertsClick}
          className="relative p-2.5 border border-transparent hover:border-[var(--border)] hover:bg-[var(--bg-glass)] transition-all md:hidden"
          aria-label="Alerts"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[var(--text-secondary)]"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {alertsCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 text-[8px] font-bold bg-[var(--accent-green)] text-black flex items-center justify-center px-1"
              style={{ boxShadow: '0 0 6px var(--accent-green)' }}
            >
              {alertsCount > 9 ? '9+' : alertsCount}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-72 bg-[var(--bg-secondary)] border border-[var(--border)] shadow-2xl overflow-hidden animate-fadeInScale z-50">
            {/* Top border glow */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent opacity-50" />

            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-3 h-3 border-l border-t border-[var(--accent-primary)] opacity-40" />
            <div className="absolute top-0 right-0 w-3 h-3 border-r border-t border-[var(--accent-primary)] opacity-40" />

            {/* Content */}
            <div className="p-4">
              {!loading && (
                user ? (
                  // Signed in state
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-[var(--bg-tertiary)] border border-[var(--border)]">
                      <div
                        className="w-10 h-10 bg-[var(--bg-hover)] border border-[var(--accent-primary)] flex items-center justify-center"
                        style={{ boxShadow: 'inset 0 0 12px rgba(90,171,184,0.1)' }}
                      >
                        <span className="text-[var(--accent-primary)] font-mono font-bold text-sm">
                          {user.email?.[0]?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {user.email?.split('@')[0]}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] truncate font-mono">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full py-2.5 text-xs font-medium tracking-wide uppercase text-[var(--text-muted)] hover:text-[var(--accent-red)] hover:bg-[var(--accent-red-muted)] border border-transparent hover:border-[var(--accent-red)]/30 transition-all"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  // Signed out state - show auth options
                  <div className="space-y-3">
                    {/* Google OAuth */}
                    <button
                      onClick={handleGoogleSignIn}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] font-medium hover:opacity-90 transition-all"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </button>

                    {/* Divider */}
                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[var(--border)]"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="px-3 bg-[var(--bg-secondary)] text-[10px] text-[var(--text-muted)] uppercase tracking-wider">or</span>
                      </div>
                    </div>

                    {/* Email options */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => openAuthModal('signin')}
                        className="py-2.5 text-xs font-medium tracking-wide uppercase text-[var(--text-secondary)] hover:text-[var(--accent-primary)] border border-[var(--border)] hover:border-[var(--accent-primary)] hover:bg-[var(--bg-glass)] transition-all"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => openAuthModal('signup')}
                        className="py-2.5 text-xs font-medium tracking-wide uppercase text-[var(--text-secondary)] hover:text-[var(--accent-primary)] border border-[var(--border)] hover:border-[var(--accent-primary)] hover:bg-[var(--bg-glass)] transition-all"
                      >
                        Sign Up
                      </button>
                    </div>

                    {/* Info text */}
                    <p className="text-[10px] text-[var(--text-muted)] text-center pt-1">
                      Sync portfolio across devices
                    </p>
                  </div>
                )
              )}
            </div>

            {/* Bottom border */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent opacity-20" />
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
