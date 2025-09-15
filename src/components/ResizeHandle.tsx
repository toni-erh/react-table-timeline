import React from 'react';

interface ResizeHandleProps {
  isResizing: boolean;
  leftWidth: number;
  startResize: (e: React.MouseEvent | React.TouchEvent) => void;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({ isResizing, leftWidth, startResize }) => {
  const className = `resize-handle ${isResizing ? 'is-resizing' : ''}`;

  return (
    <div
      className={className}
      style={{ left: leftWidth - 3, height: '100%' }}
      onMouseDown={startResize}
      onTouchStart={startResize}
    />
  );
};
