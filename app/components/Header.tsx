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
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Glitched vault icon */}
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 vault-icon-glow">
              <img
                src="/vault-icon.svg"
                alt=""
                className="w-full h-full"
              />
            </div>
            {/* Chromatic wordmark */}
            <div className="vault-wordmark relative">
              <span className="vault-wordmark-cyan absolute left-0">vault</span>
              <span className="vault-wordmark-magenta absolute left-0">vault</span>
              <span className="vault-wordmark-core">vault</span>
            </div>
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
