import React from 'react';

export interface UseColumnResizeReturn {
  leftWidth: number;
  isResizing: boolean;
  startResize: () => void;
}

/**
 * Hook for managing column resize functionality
 */
export function useColumnResize(
  scrollContainerRef: React.RefObject<HTMLDivElement>,
  initialWidth: number = 300,
): UseColumnResizeReturn {
  const [leftWidth, setLeftWidth] = React.useState(initialWidth);
  const [isResizing, setIsResizing] = React.useState(false);

  React.useEffect(() => {
    if (!isResizing) return;

    const bounds = scrollContainerRef.current!.getBoundingClientRect();

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const min = 100;
      const max = bounds.right - bounds.left - 100;
      setLeftWidth(Math.max(min, Math.min(max, clientX - bounds.left)));
    };

    const handleResizeEnd = () => {
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleResizeEnd);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleResizeEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleResizeEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleResizeEnd);
    };
  }, [isResizing, scrollContainerRef]);

  const startResize = React.useCallback(() => {
    setIsResizing(true);
  }, []);

  return {
    leftWidth,
    isResizing,
    startResize
  };
}
