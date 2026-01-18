'use client';

import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
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
            {/* Theme toggle placeholder */}
            <button
              className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
              aria-label="Toggle theme"
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
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </button>

            {/* User menu */}
            <button
              className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
              aria-label="User menu"
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
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>

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
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
