'use client';

import UserMenu from './UserMenu';

interface HeaderProps {
  onAlertsClick?: () => void;
  alertsCount?: number;
}

export default function Header({ onAlertsClick, alertsCount = 0 }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border)]">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-16 sm:h-[72px]">
          {/* Logo */}
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div className="relative w-8 h-8 sm:w-9 sm:h-9">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--text-primary)] to-[var(--text-secondary)] rounded-lg opacity-90" />
              <div className="absolute inset-[3px] bg-[var(--bg-primary)] rounded-[5px]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" className="text-[var(--text-primary)]" />
                </svg>
              </div>
            </div>
            <span className="text-lg sm:text-xl font-semibold tracking-tight text-[var(--text-primary)]">
              Chainpulse
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <a
              href="#"
              className="px-4 py-2 text-sm font-medium text-[var(--text-primary)] rounded-lg bg-[var(--bg-glass)] border border-[var(--border)] transition-all hover:border-[var(--border-hover)]"
            >
              Dashboard
            </a>
            <button
              onClick={onAlertsClick}
              className="relative px-4 py-2 text-sm font-medium text-[var(--text-secondary)] rounded-lg transition-all hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass)]"
            >
              Alerts
              {alertsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-[10px] font-bold bg-[var(--accent-green)] text-black rounded-full flex items-center justify-center px-1">
                  {alertsCount > 9 ? '9+' : alertsCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1">
            <UserMenu
              onAlertsClick={onAlertsClick}
              alertsCount={alertsCount}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
