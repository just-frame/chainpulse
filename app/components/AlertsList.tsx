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
  const formatThreshold = (value: number, type: string) => {
    if (type === 'percent_change') {
      return `${value}%`;
    }
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
  };

  const getConditionText = () => {
    if (alert.type === 'price') {
      return alert.condition === 'above' ? 'goes above' : 'drops below';
    }
    return alert.condition === 'above' ? 'rises by' : 'drops by';
  };

  return (
    <div 
      className={`
        flex items-center justify-between p-4 rounded-lg border transition-all
        ${alert.enabled 
          ? 'bg-[var(--bg-secondary)] border-[var(--border)]' 
          : 'bg-[var(--bg-tertiary)]/50 border-[var(--border)]/50 opacity-60'
        }
      `}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Icon based on condition */}
        <div className={`
          w-8 h-8 rounded-full flex items-center justify-center shrink-0
          ${alert.condition === 'above' 
            ? 'bg-[var(--accent-green)]/10 text-[var(--accent-green)]' 
            : 'bg-[var(--accent-red)]/10 text-[var(--accent-red)]'
          }
        `}>
          {alert.condition === 'above' ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          )}
        </div>

        {/* Alert details */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            <span className="text-[var(--text-primary)]">{alert.asset_name || alert.asset}</span>
            <span className="text-[var(--text-muted)]"> {getConditionText()} </span>
            <span className={alert.condition === 'above' ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]'}>
              {formatThreshold(alert.threshold, alert.type)}
            </span>
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            {alert.type === 'price' ? 'Price alert' : '% change alert'}
            {alert.last_triggered && (
              <span> • Last triggered {new Date(alert.last_triggered).toLocaleDateString()}</span>
            )}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-3">
        {/* Toggle switch */}
        <button
          onClick={onToggle}
          className={`
            relative w-10 h-5 rounded-full transition-colors
            ${alert.enabled ? 'bg-[var(--accent-green)]' : 'bg-[var(--bg-tertiary)]'}
          `}
          title={alert.enabled ? 'Disable alert' : 'Enable alert'}
        >
          <span 
            className={`
              absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform
              ${alert.enabled ? 'left-5' : 'left-0.5'}
            `}
          />
        </button>

        {/* Edit button */}
        {onEdit && (
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            title="Edit alert"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}

        {/* Delete button */}
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg hover:bg-[var(--accent-red)]/10 transition-colors text-[var(--text-muted)] hover:text-[var(--accent-red)]"
          title="Delete alert"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
