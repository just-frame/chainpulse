'use client';

import { useRef, useEffect, useState } from 'react';

export type TimeRange = '1D' | '1W' | '1M' | '3M' | 'YTD' | '1Y' | 'ALL';

interface TimeRangeSelectorProps {
  selected: TimeRange;
  onChange: (range: TimeRange) => void;
  disabled?: boolean;
}

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: '1D', label: '24H' },
  { value: '1W', label: '1W' },
  { value: '1M', label: '1M' },
  { value: '3M', label: '3M' },
  { value: 'YTD', label: 'YTD' },
  { value: '1Y', label: '1Y' },
];

export default function TimeRangeSelector({
  selected,
  onChange,
  disabled = false,
}: TimeRangeSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const selectedButton = containerRef.current.querySelector(`[data-value="${selected}"]`) as HTMLButtonElement;
    if (selectedButton) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const buttonRect = selectedButton.getBoundingClientRect();
      setIndicatorStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      });
    }
  }, [selected]);

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center gap-1 p-1.5 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border)]"
    >
      {/* Sliding indicator */}
      <div
        className="absolute top-1.5 h-[calc(100%-12px)] bg-[var(--text-primary)] rounded-lg shadow-lg transition-all duration-300 ease-out"
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
          opacity: indicatorStyle.width > 0 ? 1 : 0,
        }}
      />

      {TIME_RANGES.map(({ value, label }) => {
        const isSelected = selected === value;
        return (
          <button
            key={value}
            data-value={value}
            onClick={() => onChange(value)}
            disabled={disabled}
            className={`
              relative z-10 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200
              ${isSelected
                ? 'text-[var(--bg-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
