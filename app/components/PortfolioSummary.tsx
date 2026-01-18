'use client';

interface PortfolioSummaryProps {
  totalValue: number;
  change24h: number;
  change24hPercent: number;
}

export default function PortfolioSummary({
  totalValue,
  change24h,
  change24hPercent,
}: PortfolioSummaryProps) {
  const isPositive = change24h >= 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const prefix = value >= 0 ? '+' : '';
    return `${prefix}${value.toFixed(2)}%`;
  };

  return (
    <div className="card">
      <div className="flex flex-col items-center gap-2 py-4">
        <span className="text-[var(--text-muted)] text-sm uppercase tracking-wider">
          Total Portfolio Value
        </span>
        <span className="text-5xl font-semibold font-mono tracking-tight">
          {formatCurrency(totalValue)}
        </span>
        <div className="flex items-center gap-3">
          <span
            className={`text-lg font-mono ${
              isPositive ? 'price-up' : 'price-down'
            }`}
          >
            {formatPercent(change24hPercent)}
          </span>
          <span className="text-[var(--text-muted)] text-sm">
            ({isPositive ? '+' : ''}{formatCurrency(change24h)}) 24h
          </span>
        </div>
      </div>
    </div>
  );
}
