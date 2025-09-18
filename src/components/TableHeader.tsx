import React from 'react';
import type { TableColumn } from '../types/tableTypes';
import { TableCell } from './TableCell';

interface TableHeaderProps {
  columns: TableColumn[];
  leftWidth?: number;
  showDragColumn?: boolean;
  scrollRef?: React.RefObject<HTMLDivElement>;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  columns,
  leftWidth,
  showDragColumn,
  scrollRef,
}) => {
  return (
    <div
      ref={scrollRef}
      className="table-header"
      style={{
        width: leftWidth,
        overflowX: 'auto',
        overflowY: 'hidden',
      }}
    >
      {showDragColumn && <div style={{ width: 20, flex: '0 0 20px' }} aria-hidden />}
      {columns.map((col) => (
        <TableCell column={col} key={col.field}>
          {col.header || col.field}
        </TableCell>
      ))}
    </div>
  );
};
