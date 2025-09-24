import React from 'react';

interface SkeletonRowProps {
  lineHeight: number;
  minWidth?: number;
}

export const SkeletonRow: React.FC<SkeletonRowProps> = ({ lineHeight, minWidth }) => {
  return (
    <div className="skeleton-row" style={{ minWidth }}>
      <div className="skeleton-row-inner" style={{ height: `${lineHeight - 6}px` }} />
    </div>
  );
};
