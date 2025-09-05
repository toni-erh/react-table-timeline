import React from 'react';
import type { TableColumn } from '../types/tableTypes';

const generateCellStyle = (col: TableColumn) => {
  return {
    flex: col.width === undefined ? col.flex || 1 : undefined,
    width: col.width || 'auto',
    minWidth: col.minWidth || 'auto',
    maxWidth: col.maxWidth || 'auto',
    padding: '0px',
    overflow: 'hidden',
    textAlign: col.align || 'left',
  };
};

interface TableCellProps {
  column: TableColumn;
  children: React.ReactNode;
}

export const TableCell: React.FC<TableCellProps> = ({ column, children }) => {
  return (
    <div className="table-cell" style={generateCellStyle(column)}>
      {children}
    </div>
  );
};
