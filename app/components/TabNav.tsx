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
    <div className="inline-flex items-center gap-0.5 sm:gap-1 p-1 sm:p-1.5 bg-[var(--bg-tertiary)] rounded-xl">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            relative flex items-center justify-center gap-1.5 sm:gap-2
            px-3 sm:px-4 py-2 sm:py-2.5 
            text-xs sm:text-sm font-medium rounded-lg 
            transition-all duration-200 ease-out
            ${activeTab === tab.id
              ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }
          `}
        >
          {tab.label}
          {tab.count !== undefined && tab.count > 0 && (
            <span
              className={`
                text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full min-w-[18px] sm:min-w-[22px] text-center font-medium
                ${activeTab === tab.id
                  ? 'bg-[var(--accent-green)]/20 text-[var(--accent-green)]'
                  : 'bg-[var(--bg-primary)]/50 text-[var(--text-muted)]'
                }
              `}
            >
              {tab.count > 99 ? '99+' : tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
