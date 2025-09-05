import React from 'react';
import type { TableColumn } from '../types/tableTypes';
import { TableCell } from './TableCell';

interface TableHeaderProps {
  columns: TableColumn[];
  leftWidth?: number;
  showDragColumn?: boolean;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ columns, leftWidth, showDragColumn }) => {
  return (
    <div className="table-header" style={{ width: leftWidth }}>
      {showDragColumn && <div style={{ width: 20, flex: '0 0 20px' }} aria-hidden />}
      {columns.map((col) => (
        <TableCell column={col} key={col.field}>
          {col.header || col.field}
        </TableCell>
      ))}
    </div>
  );
};
