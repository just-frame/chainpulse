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
  const baseClasses = 'animate-pulse bg-[var(--bg-tertiary)]';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

// Pre-built skeleton components for common use cases
export function AssetRowSkeleton() {
  return (
    <tr>
      <td className="py-4 pr-4">
        <Skeleton width={20} height={20} variant="text" />
      </td>
      <td className="py-4 pr-4">
        <div className="flex items-center gap-3">
          <Skeleton width={32} height={32} variant="circular" />
          <div className="flex flex-col gap-1">
            <Skeleton width={60} height={16} variant="text" />
            <Skeleton width={40} height={12} variant="text" />
          </div>
        </div>
      </td>
      <td className="py-4 pr-4">
        <Skeleton width={70} height={16} variant="text" />
      </td>
      <td className="py-4 pr-4">
        <div className="flex flex-col gap-1">
          <Skeleton width={80} height={16} variant="text" />
          <Skeleton width={50} height={12} variant="text" />
        </div>
      </td>
      <td className="py-4 pr-4">
        <Skeleton width={50} height={16} variant="text" />
      </td>
      <td className="py-4">
        <Skeleton width={60} height={20} variant="rectangular" />
      </td>
    </tr>
  );
}

export function NFTCardSkeleton() {
  return (
    <div className="bg-[var(--bg-tertiary)] rounded-xl overflow-hidden">
      <Skeleton className="w-full aspect-square" />
      <div className="p-3 space-y-2">
        <Skeleton width="70%" height={16} variant="text" />
        <Skeleton width="50%" height={12} variant="text" />
      </div>
    </div>
  );
}

export function DomainCardSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-[var(--bg-tertiary)] rounded-xl">
      <Skeleton width={48} height={48} variant="circular" />
      <div className="flex-1 space-y-2">
        <Skeleton width="60%" height={18} variant="text" />
        <Skeleton width="40%" height={14} variant="text" />
      </div>
    </div>
  );
}
