'use client';

import { useState } from 'react';
import { Alert } from '@/hooks/useAlerts';

interface AlertsListProps {
  alerts: Alert[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (alert: Alert) => void;
}

export default function AlertsList({ alerts, onToggle, onDelete, onEdit }: AlertsListProps) {
  if (alerts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 mx-auto mb-4 bg-[var(--bg-tertiary)] border border-[var(--border)] flex items-center justify-center">
          <svg className="w-6 h-6 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="square" strokeLinejoin="miter" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </div>
        <p className="text-xs font-semibold tracking-[0.1em] uppercase text-[var(--text-secondary)] mb-1">No Active Alerts</p>
        <p className="text-[10px] text-[var(--text-muted)] tracking-wide">Deploy an alert to monitor price movements</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert, index) => (
        <AlertItem
          key={alert.id}
          alert={alert}
          index={index}
          onToggle={() => onToggle(alert.id)}
          onDelete={() => onDelete(alert.id)}
          onEdit={onEdit ? () => onEdit(alert) : undefined}
        />
      ))}
    </div>
  );
}

function AlertItem({
  alert,
  index,
  onToggle,
  onDelete,
  onEdit
}: {
  alert: Alert;
  index: number;
  onToggle: () => void;
  onDelete: () => void;
  onEdit?: () => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const isAbove = alert.condition === 'above';

  const formatThreshold = (value: number, type: string) => {
    if (type === 'percent_change') {
      return `${value}%`;
    }
    if (value >= 1000) {
      return `$${value.toLocaleString()}`;
    }
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const accentColor = isAbove ? 'var(--accent-green)' : 'var(--accent-red)';

  return (
    <div
      className={`
        group relative overflow-hidden transition-all duration-150
        border border-[var(--border)]
        ${alert.enabled
          ? 'bg-[var(--bg-secondary)]'
          : 'bg-[var(--bg-tertiary)]/50 opacity-50'
        }
      `}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      style={{
        animationDelay: `${index * 50}ms`
      }}
    >
      {/* Corner accents */}
      <div
        className="absolute top-0 left-0 w-2 h-2 border-l border-t transition-colors"
        style={{ borderColor: alert.enabled ? accentColor : 'var(--border)' }}
      />
      <div
        className="absolute bottom-0 right-0 w-2 h-2 border-r border-b transition-colors"
        style={{ borderColor: alert.enabled ? accentColor : 'var(--border)' }}
      />

      <div className="flex items-center gap-3 py-3 px-4">
        {/* Status indicator */}
        <div
          className="w-1.5 h-1.5 shrink-0 transition-all"
          style={{
            backgroundColor: alert.enabled ? accentColor : 'var(--text-muted)',
            boxShadow: alert.enabled ? `0 0 6px ${accentColor}` : 'none'
          }}
        />

        {/* Direction icon */}
        <div
          className="shrink-0 w-6 h-6 flex items-center justify-center transition-colors"
          style={{ color: alert.enabled ? accentColor : 'var(--text-muted)' }}
        >
          {isAbove ? (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="square" strokeLinejoin="miter" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="square" strokeLinejoin="miter" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          )}
        </div>

        {/* Asset & Condition */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-[var(--text-primary)] truncate">
            {alert.asset}
          </span>
          <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider hidden sm:inline">
            {isAbove ? '>' : '<'}
          </span>
          <span
            className="font-mono text-xs font-bold"
            style={{ color: alert.enabled ? accentColor : 'var(--text-secondary)' }}
          >
            {formatThreshold(alert.threshold, alert.type)}
          </span>
        </div>

        {/* Right side: Actions & Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Action buttons (show on hover/touch) */}
          <div className={`
            flex items-center gap-0.5 transition-all duration-150
            ${showActions ? 'opacity-100' : 'sm:opacity-0 sm:pointer-events-none'}
          `}>
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-muted)] hover:text-[var(--accent-primary)]"
                title="Edit"
                aria-label="Edit alert"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                </svg>
              </button>
            )}
            <button
              onClick={onDelete}
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-[var(--accent-red-muted)] transition-colors text-[var(--text-muted)] hover:text-[var(--accent-red)]"
              title="Delete"
              aria-label="Delete alert"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Toggle */}
          <button
            onClick={onToggle}
            className={`
              cypher-toggle shrink-0
              ${alert.enabled ? 'active' : ''}
            `}
            title={alert.enabled ? 'Disable alert' : 'Enable alert'}
          />
        </div>
      </div>
    </div>
  );
}
