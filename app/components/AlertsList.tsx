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
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center">
          <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </div>
        <p className="text-base font-medium text-[var(--text-secondary)] mb-1">No alerts yet</p>
        <p className="text-sm text-[var(--text-muted)]">Create an alert to get notified of price changes</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <AlertItem
          key={alert.id}
          alert={alert}
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
  onToggle,
  onDelete,
  onEdit
}: {
  alert: Alert;
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
        group relative overflow-hidden rounded-xl transition-all duration-200
        ${alert.enabled
          ? 'bg-[var(--bg-secondary)]'
          : 'bg-[var(--bg-tertiary)]/50 opacity-60'
        }
      `}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-200"
        style={{
          backgroundColor: alert.enabled ? accentColor : 'var(--border)',
          boxShadow: alert.enabled ? `0 0 12px ${accentColor}40` : 'none'
        }}
      />

      <div className="flex items-center gap-4 py-4 px-5 pl-6">
        {/* Asset & Condition */}
        <div className="flex-1 min-w-0 flex items-center gap-3">
          {/* Direction indicator */}
          <div
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{
              backgroundColor: `${accentColor}15`,
              color: accentColor
            }}
          >
            {isAbove ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
              </svg>
            )}
          </div>

          {/* Asset name */}
          <span className="font-semibold text-[var(--text-primary)] truncate">
            {alert.asset_name || alert.asset}
          </span>

          {/* Condition text */}
          <span className="text-sm text-[var(--text-muted)] hidden sm:inline">
            {isAbove ? 'above' : 'below'}
          </span>

          {/* Threshold value */}
          <span
            className="font-mono font-bold text-base"
            style={{ color: accentColor }}
          >
            {formatThreshold(alert.threshold, alert.type)}
          </span>
        </div>

        {/* Right side: Toggle & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Action buttons (show on hover) */}
          <div className={`
            flex items-center gap-1 transition-all duration-200
            ${showActions ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'}
          `}>
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                title="Edit"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                </svg>
              </button>
            )}
            <button
              onClick={onDelete}
              className="p-2 rounded-lg hover:bg-[var(--accent-red)]/10 transition-colors text-[var(--text-muted)] hover:text-[var(--accent-red)]"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>

          {/* Toggle */}
          <button
            onClick={onToggle}
            className={`
              relative w-12 h-7 rounded-full transition-all duration-300 shrink-0
              ${alert.enabled
                ? 'bg-[var(--accent-green)]'
                : 'bg-[var(--bg-tertiary)] border border-[var(--border)]'
              }
            `}
            title={alert.enabled ? 'Disable alert' : 'Enable alert'}
          >
            <span
              className={`
                absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300
                ${alert.enabled ? 'left-6' : 'left-1'}
              `}
            />
            {/* Live indicator */}
            {alert.enabled && (
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-green)] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--accent-green)]" />
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
