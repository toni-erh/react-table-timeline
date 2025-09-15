import React from 'react';

interface TableHeaderProps {
  columns: string[];
  leftWidth?: number;
  showDragColumn?: boolean;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ columns, leftWidth, showDragColumn }) => {
  return (
    <div className="table-header" style={{ width: leftWidth }}>
      {showDragColumn && (
        <div style={{ width: 20, flex: '0 0 20px' }} aria-hidden />
      )}
      {columns.map((col) => (
        <div style={{ flex: 1, padding: '0 5px', overflow: 'hidden' }} key={col}>
          {col}
        </div>
      ))}
    </div>
  );
};
