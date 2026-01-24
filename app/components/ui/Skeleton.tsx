'use client';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export default function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`animate-shimmer ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

export function AssetRowSkeleton() {
  return (
    <tr>
      <td className="py-5 pr-4">
        <Skeleton width={20} height={20} variant="text" />
      </td>
      <td className="py-5 pr-6">
        <div className="flex items-center gap-4">
          <Skeleton width={40} height={40} variant="circular" />
          <div className="flex flex-col gap-2">
            <Skeleton width={80} height={16} variant="text" />
            <Skeleton width={50} height={12} variant="text" />
          </div>
        </div>
      </td>
      <td className="py-5 pr-6 hidden sm:table-cell">
        <Skeleton width={70} height={16} variant="text" />
      </td>
      <td className="py-5 pr-6">
        <div className="flex flex-col gap-2">
          <Skeleton width={90} height={18} variant="text" />
          <Skeleton width={60} height={12} variant="text" />
        </div>
      </td>
      <td className="py-5 pr-6 hidden md:table-cell">
        <Skeleton width={60} height={24} />
      </td>
      <td className="py-5 hidden lg:table-cell">
        <Skeleton width={70} height={26} />
      </td>
    </tr>
  );
}

export function NFTCardSkeleton() {
  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl overflow-hidden border border-[var(--border)]">
      <Skeleton className="w-full aspect-square" />
      <div className="p-3 space-y-2">
        <Skeleton width="75%" height={16} variant="text" />
        <Skeleton width="50%" height={12} variant="text" />
      </div>
    </div>
  );
}

export function DomainCardSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
      <Skeleton width={48} height={48} variant="circular" />
      <div className="flex-1 space-y-2">
        <Skeleton width="65%" height={18} variant="text" />
        <Skeleton width="45%" height={14} variant="text" />
      </div>
    </div>
  );
}
