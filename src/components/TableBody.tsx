
import { TableRow } from './TableRow';
import { SkeletonRow } from './SkeletonRow';
import { isDataRow } from '../utils/virtualizationUtils';
import type { PreparedRow, TableRowBase } from '../types/tableTypes';

interface TableBodyProps<T extends TableRowBase> {
  preparedRows: PreparedRow<T>[];
  columns: string[];
  lineHeight: number;
}

export const TableBody = <T extends TableRowBase>({ preparedRows, columns, lineHeight }: TableBodyProps<T>) => {
  return (
    <>
      {preparedRows.map((row, index) =>
        isDataRow(row) ? (
          <TableRow key={row.id} row={row} columns={columns} />
        ) : (
          <SkeletonRow key={`skeleton_${index}`} lineHeight={lineHeight} />
        )
      )}
    </>
  );
};
