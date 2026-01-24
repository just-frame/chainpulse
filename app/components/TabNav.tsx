'use client';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabNavProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export default function TabNav({ tabs, activeTab, onTabChange }: TabNavProps) {
  return (
    <div className="inline-flex items-center gap-1 p-1 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border)]">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative flex items-center justify-center gap-2
              px-4 py-2.5
              text-sm font-medium rounded-lg
              transition-all duration-200 ease-out
              ${isActive
                ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-glass)]'
              }
            `}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`
                  text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center font-mono font-semibold
                  transition-colors duration-200
                  ${isActive
                    ? 'bg-[var(--accent-green)]/20 text-[var(--accent-green)]'
                    : 'bg-[var(--bg-primary)]/60 text-[var(--text-muted)]'
                  }
                `}
              >
                {tab.count > 99 ? '99+' : tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
