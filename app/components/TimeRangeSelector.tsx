'use client';

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
  { value: 'ALL', label: 'All' },
];

export default function TimeRangeSelector({
  selected,
  onChange,
  disabled = false,
}: TimeRangeSelectorProps) {
  return (
    <div className="flex gap-1 p-1 bg-[var(--bg-tertiary)] rounded-lg">
      {TIME_RANGES.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          disabled={disabled}
          className={`
            px-3 py-1.5 text-xs font-medium rounded-md transition-all
            ${
              selected === value
                ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
