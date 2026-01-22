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
  const [homepage, setHomepage] = useState('Portfolio');
  const menuRef = useRef<HTMLDivElement>(null);

  const { user, loading, signOut } = useAuth();
  const { theme, setTheme, mounted } = useTheme();

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
            className="text-white group-hover:text-[var(--accent-primary)] transition-colors"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>

          {/* Notification dot when signed in */}
          {user && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--accent-primary)] rounded-full" />
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
          <div className="absolute right-0 mt-2 w-72 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden animate-fadeIn z-50">
            {/* Settings Section */}
            <div className="p-4 space-y-4">
              {/* Theme Selector */}
              <div>
                <span className="text-[var(--text-primary)] font-medium text-sm block mb-2">Theme</span>
                <div className="grid grid-cols-2 gap-2">
                  {mounted && THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`
                        px-3 py-2 rounded-lg text-sm font-medium transition-all text-left
                        ${theme === t.id
                          ? 'bg-[var(--accent-primary)] text-black'
                          : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                        }
                      `}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Homepage Selector */}
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-primary)] font-medium text-sm">Homepage</span>
                <div className="relative">
                  <select
                    value={homepage}
                    onChange={(e) => setHomepage(e.target.value)}
                    className="appearance-none bg-[var(--bg-tertiary)] text-[var(--text-primary)] px-4 py-2 pr-8 rounded-lg text-sm font-medium cursor-pointer hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    <option value="Portfolio">Portfolio</option>
                    <option value="Alerts">Alerts</option>
                    <option value="NFTs">NFTs</option>
                    <option value="Domains">Domains</option>
                  </select>
                  <svg
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none"
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
            <div className="border-t border-[var(--border)]" />

            {/* Auth Section */}
            <div className="p-4">
              {!loading && (
                user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-[var(--accent-primary)]/10 rounded-lg border border-[var(--accent-primary)]/20">
                      <div className="w-8 h-8 bg-[var(--accent-primary)] rounded-full flex items-center justify-center">
                        <span className="text-black font-bold text-sm">
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
                      className="w-full py-2.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-[var(--text-muted)] text-sm text-center">
                      Sign in to save your portfolio
                    </p>
                    <button
                      onClick={handleSignIn}
                      className="w-full py-3.5 bg-[var(--accent-primary)] text-black font-semibold rounded-xl hover:opacity-90 transition-colors"
                    >
                      Sign In
                    </button>
                    <p className="text-[var(--text-muted)] text-xs text-center">
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
