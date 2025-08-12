import React from 'react';
import type { TableRowBase } from '../types/tableTypes';
import { TableCell } from './TableCell';

interface TableRowProps<T extends TableRowBase> {
  row: T;
  columns: string[];
}

export const TableRow = <T extends TableRowBase>({ row, columns }: TableRowProps<T>) => {
  return (
    <div className="table-row">
      {columns.map((col) => (
        <TableCell key={col}>
          {col in row ? (row[col as keyof typeof row] as React.ReactNode) : null}
        </TableCell>
      ))}
    </div>
  );
};
