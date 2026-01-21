'use client';

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
      <div className="text-center py-8 text-[var(--text-muted)]">
        <svg className="w-10 h-10 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <p className="text-sm">No alerts yet</p>
        <p className="text-xs mt-1">Create an alert to get notified of price changes</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
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
  const formatThreshold = (value: number, type: string) => {
    if (type === 'percent_change') {
      return `${value}%`;
    }
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div 
      className={`
        p-4 rounded-xl border transition-all
        ${alert.enabled 
          ? 'bg-[var(--bg-secondary)] border-[var(--border)]' 
          : 'bg-[var(--bg-tertiary)]/50 border-[var(--border)]/50 opacity-60'
        }
      `}
    >
      {/* Top row: Asset name + Toggle */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`
            w-7 h-7 rounded-full flex items-center justify-center
            ${alert.condition === 'above' 
              ? 'bg-[var(--accent-green)]/15 text-[var(--accent-green)]' 
              : 'bg-[var(--accent-red)]/15 text-[var(--accent-red)]'
            }
          `}>
            {alert.condition === 'above' ? (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
          </div>
          <span className="font-semibold text-[var(--text-primary)]">
            {alert.asset_name || alert.asset}
          </span>
        </div>
        
        {/* Toggle switch */}
        <button
          onClick={onToggle}
          className={`
            relative w-11 h-6 rounded-full transition-colors
            ${alert.enabled ? 'bg-[var(--accent-green)]' : 'bg-[var(--bg-tertiary)]'}
          `}
          title={alert.enabled ? 'Disable alert' : 'Enable alert'}
        >
          <span 
            className={`
              absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform
              ${alert.enabled ? 'left-6' : 'left-1'}
            `}
          />
        </button>
      </div>

      {/* Middle: Alert condition */}
      <p className="text-sm text-[var(--text-secondary)] mb-3">
        {alert.type === 'price' ? 'Alert when price' : 'Alert when change'}{' '}
        <span className={`font-medium ${alert.condition === 'above' ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]'}`}>
          {alert.condition === 'above' ? '↑ goes above' : '↓ drops below'}
        </span>{' '}
        <span className="font-mono font-semibold text-[var(--text-primary)]">
          {formatThreshold(alert.threshold, alert.type)}
        </span>
      </p>

      {/* Bottom row: Type badge + Actions */}
      <div className="flex items-center justify-between">
        <span className="text-xs px-2 py-1 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
          {alert.type === 'price' ? '💰 Price' : '📊 % Change'}
        </span>
        
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              title="Edit alert"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-2 rounded-lg hover:bg-[var(--accent-red)]/10 transition-colors text-[var(--text-muted)] hover:text-[var(--accent-red)]"
            title="Delete alert"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
