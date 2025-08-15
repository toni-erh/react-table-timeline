
import { TableRow } from './TableRow';
import { SkeletonRow } from './SkeletonRow';
import { isDataRow } from '../utils/virtualizationUtils';
import type { PreparedRow, TableRowBase, RenderExpanderParams } from '../types/tableTypes';

interface TableBodyProps<T extends TableRowBase> {
  preparedRows: PreparedRow<T>[];
  columns: string[];
  lineHeight: number;
  renderSkeletonRow?: () => React.ReactNode;
  renderExpander?: (params: RenderExpanderParams<T>) => React.ReactNode;
}

export const TableBody = <T extends TableRowBase>({ preparedRows, columns, lineHeight, renderSkeletonRow, renderExpander }: TableBodyProps<T>) => {
  return (
    <>
      {preparedRows.map((row, index) =>
        isDataRow(row) ? (
          <TableRow key={row.id} row={row} columns={columns} renderExpander={renderExpander} />
        ) : (
          renderSkeletonRow ? (
            <div key={`skeleton_${index}`} style={{ height: `${lineHeight}px` }}>
              {renderSkeletonRow()}
            </div>
          ) : (
            <SkeletonRow key={`skeleton_${index}`} lineHeight={lineHeight} />
          )
        )
      )}
    </>
  );
};
