import React from 'react';

interface TableHeaderProps {
  columns: string[];
  leftWidth: number;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ columns, leftWidth }) => {
  return (
    <div className="table-header" style={{ width: leftWidth }}>
      {columns.map((col) => (
        <div style={{ flex: 1, padding: '0 5px', overflow: 'hidden' }} key={col}>
          {col}
        </div>
      ))}
    </div>
  );
};
