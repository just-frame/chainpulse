'use client';

import UserMenu from './UserMenu';

interface HeaderProps {
  onAlertsClick?: () => void;
  alertsCount?: number;
}

export default function Header({ onAlertsClick, alertsCount = 0 }: HeaderProps) {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--bg-primary)] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-base sm:text-lg font-medium tracking-tight text-[var(--text-muted)]">
              placeholder
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
          </nav>

          {/* Right side - User Menu */}
          <div className="flex items-center">
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
