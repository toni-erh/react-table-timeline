import React from 'react';

export interface UseColumnResizeReturn {
  leftWidth: number;
  isResizing: boolean;
  handleMouseDown: () => void;
}

/**
 * Hook for managing column resize functionality
 */
export function useColumnResize(
  scrollContainerRef: React.RefObject<HTMLDivElement>,
  initialWidth: number = 300
): UseColumnResizeReturn {
  const [leftWidth, setLeftWidth] = React.useState(initialWidth);
  const [isResizing, setIsResizing] = React.useState(false);

  React.useEffect(() => {
    if (!isResizing) return;
    
    const bounds = scrollContainerRef.current!.getBoundingClientRect();
    
    const handleMouseMove = (e: MouseEvent) => {
      const min = 100;
      const max = bounds.right - bounds.left - 100;
      setLeftWidth(Math.max(min, Math.min(max, e.clientX - bounds.left)));
    };
    
    const handleMouseUp = () => setIsResizing(false);
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleMouseDown = React.useCallback(() => {
    setIsResizing(true);
  }, []);

  return {
    leftWidth,
    isResizing,
    handleMouseDown
  };
}
