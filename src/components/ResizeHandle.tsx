import React from 'react';

interface ResizeHandleProps {
  isResizing: boolean;
  leftWidth: number;
  handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({ isResizing, leftWidth, handleMouseDown }) => {
  const className = `resize-handle ${isResizing ? 'is-resizing' : ''}`;

  return (
    <div
      className={className}
      style={{ left: leftWidth - 3, height: '100%' }}
      onMouseDown={handleMouseDown}
    />
  );
};
