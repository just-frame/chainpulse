'use client';

import { useRef, useEffect, useState } from 'react';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const activeButton = containerRef.current.querySelector(`[data-tab="${activeTab}"]`) as HTMLButtonElement;
    if (activeButton) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      setIndicatorStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      });
    }
  }, [activeTab]);

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center"
    >
      {/* Sliding underline indicator with glow */}
      <div
        className="absolute bottom-0 h-0.5 bg-[var(--text-primary)] transition-all duration-300 ease-out"
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
          opacity: indicatorStyle.width > 0 ? 1 : 0,
          boxShadow: '0 2px 8px var(--accent-primary), 0 0 12px rgba(90, 171, 184, 0.4)',
        }}
      />

      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            data-tab={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative flex items-center gap-2.5 px-5 py-3
              text-base font-medium transition-all duration-200
              ${isActive
                ? 'text-[var(--text-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              }
              ${index === 0 ? 'pl-0' : ''}
            `}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`
                  text-xs px-2 py-0.5 rounded-full font-mono font-semibold
                  transition-all duration-200
                  ${isActive
                    ? 'bg-[var(--accent-green)]/15 text-[var(--accent-green)]'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
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
