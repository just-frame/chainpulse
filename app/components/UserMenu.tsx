'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme, THEMES, type Theme, type ThemeConfig } from '@/hooks/useTheme';
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
          <div className="absolute right-0 top-full mt-2 w-72 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden animate-fadeInScale z-50">
            {/* Theme Section */}
            <div className="p-4">
              <span className="text-caption">Theme</span>

              {/* Theme Swatches */}
              <div className="flex items-center gap-2 mt-3">
                {mounted && THEMES.map((t) => (
                  <ThemeSwatch
                    key={t.id}
                    themeConfig={t}
                    isActive={theme === t.id}
                    onClick={() => setTheme(t.id)}
                  />
                ))}
              </div>

              {/* Active theme name */}
              <div className="mt-3 text-sm text-[var(--text-secondary)]">
                {THEMES.find(t => t.id === theme)?.name}
                <span className="text-[var(--text-muted)]"> — </span>
                <span className="text-[var(--text-muted)]">{THEMES.find(t => t.id === theme)?.description}</span>
              </div>
            </div>

            <div className="border-t border-[var(--border)]" />

            {/* Auth Section */}
            <div className="p-4">
              {!loading && (
                user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-[var(--bg-tertiary)] rounded-xl">
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
                      className="w-full py-2.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-xl transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-center py-1">
                      <p className="text-sm text-[var(--text-secondary)]">
                        Sign in to save your portfolio
                      </p>
                    </div>
                    <button
                      onClick={handleSignIn}
                      className="w-full py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] font-semibold rounded-xl hover:opacity-90 transition-all"
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

function ThemeSwatch({
  themeConfig,
  isActive,
  onClick
}: {
  themeConfig: ThemeConfig;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative group flex-1 aspect-square rounded-xl overflow-hidden transition-all duration-200
        ${isActive
          ? 'ring-2 ring-[var(--text-primary)] ring-offset-2 ring-offset-[var(--bg-secondary)]'
          : 'hover:scale-105 hover:shadow-lg'
        }
      `}
      style={{ backgroundColor: themeConfig.colors.bg }}
      title={themeConfig.name}
    >
      {/* Accent bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1.5"
        style={{ backgroundColor: themeConfig.colors.accent }}
      />

      {/* Accent glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-8 opacity-30"
        style={{
          background: `linear-gradient(to top, ${themeConfig.colors.accent}40, transparent)`
        }}
      />

      {/* Check mark for active */}
      {isActive && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: themeConfig.colors.accent }}
          >
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke={themeConfig.colors.bg}
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}

      {/* Hover overlay with name */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
        <span
          className="text-xs font-semibold"
          style={{ color: themeConfig.colors.text }}
        >
          {themeConfig.name}
        </span>
      </div>
    </button>
  );
}
