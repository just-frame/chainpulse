'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme, THEMES, type Theme } from '@/hooks/useTheme';
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

  const { user, loading, signOut } = useAuth();
  const { theme, setTheme, mounted } = useTheme();

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

  const handleSignIn = () => {
    setAuthMode('signin');
    setShowAuthModal(true);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative flex items-center gap-1" ref={menuRef}>
        {/* User Icon */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2.5 rounded-xl hover:bg-[var(--bg-glass)] border border-transparent hover:border-[var(--border)] transition-all group"
          aria-label="User menu"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          {user && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--accent-green)] rounded-full" />
          )}
        </button>

        {/* Alerts Bell */}
        <button
          onClick={onAlertsClick}
          className="relative p-2.5 rounded-xl hover:bg-[var(--bg-glass)] border border-transparent hover:border-[var(--border)] transition-all md:hidden"
          aria-label="Alerts"
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
            className="text-[var(--text-secondary)]"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {alertsCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 text-[9px] font-bold bg-[var(--accent-green)] text-black rounded-full flex items-center justify-center px-1">
              {alertsCount > 9 ? '9+' : alertsCount}
            </span>
          )}
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden animate-fadeInScale z-50">
            {/* Theme Section */}
            <div className="p-5 space-y-4">
              <div>
                <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Appearance</span>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {mounted && THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`
                        relative px-4 py-3 rounded-xl text-sm font-medium transition-all text-left
                        ${theme === t.id
                          ? 'bg-[var(--accent-primary)] text-[var(--bg-primary)]'
                          : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] border border-[var(--border)]'
                        }
                      `}
                    >
                      {t.name}
                      {theme === t.id && (
                        <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[var(--bg-primary)] rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--border)]" />

            {/* Auth Section */}
            <div className="p-5">
              {!loading && (
                user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border)]">
                      <div className="w-10 h-10 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--text-secondary)] rounded-full flex items-center justify-center">
                        <span className="text-[var(--bg-primary)] font-bold">
                          {user.email?.[0]?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {user.email?.split('@')[0]}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full py-3 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-xl transition-colors border border-transparent hover:border-[var(--border)]"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-[var(--text-secondary)]">
                        Sign in to save your portfolio
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        Track history, create alerts, sync across devices
                      </p>
                    </div>
                    <button
                      onClick={handleSignIn}
                      className="w-full py-3.5 bg-[var(--text-primary)] text-[var(--bg-primary)] font-semibold rounded-xl hover:opacity-90 transition-all hover:shadow-lg"
                    >
                      Sign In
                    </button>
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
