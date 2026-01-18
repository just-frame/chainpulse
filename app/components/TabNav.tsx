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
    <div className="flex items-center gap-1 p-1.5 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border)]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            relative px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200
            ${activeTab === tab.id
              ? 'bg-white text-black shadow-md'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
            }
          `}
        >
          <span className="flex items-center gap-2">
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`
                  text-xs px-2 py-0.5 rounded-full min-w-[24px] text-center font-medium
                  ${activeTab === tab.id
                    ? 'bg-black/10 text-black/70'
                    : 'bg-[var(--bg-primary)] text-[var(--text-muted)]'
                  }
                `}
              >
                {tab.count > 99 ? '99+' : tab.count}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
