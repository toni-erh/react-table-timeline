import React from 'react';

interface SkeletonRowProps {
  lineHeight: number;
}

export const SkeletonRow: React.FC<SkeletonRowProps> = ({ lineHeight }) => {
  return (
    <div className="skeleton-row">
      <div className="skeleton-row-inner" style={{ height: `${lineHeight - 6}px` }} />
    </div>
  );
};
