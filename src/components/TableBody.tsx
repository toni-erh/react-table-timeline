import React from 'react';
import { TableRow } from './TableRow';
import { SkeletonRow } from './SkeletonRow';
import { isDataRow } from '../utils/virtualizationUtils';
import { calculateMinimumRowWidth } from '../utils/columnUtils';
import type {
  PreparedRow,
  TableRowBase,
  RenderExpanderParams,
  RowReorderEvent,
  TableColumn,
} from '../types/tableTypes';

interface TableBodyProps<T extends TableRowBase> {
  preparedRows: PreparedRow<T>[];
  columns: TableColumn<T>[];
  lineHeight: number;
  renderSkeletonRow?: () => React.ReactNode;
  renderExpander?: (params: RenderExpanderParams<T>) => React.ReactNode;
  showDragHandle?: boolean;
  onRowReorder?: (event: RowReorderEvent) => void;
  dragHandleWidth: number;
  defaultMinColumnWidth: number;
}

export const TableBody = <T extends TableRowBase>({
  preparedRows,
  columns,
  lineHeight,
  renderSkeletonRow,
  renderExpander,
  showDragHandle,
  onRowReorder,
  dragHandleWidth,
  defaultMinColumnWidth,
}: TableBodyProps<T>) => {
  const minRowWidth = React.useMemo(() => {
    return calculateMinimumRowWidth(columns, !!showDragHandle, {
      dragHandleWidth,
      defaultMinColumnWidth,
    });
  }, [columns, showDragHandle, dragHandleWidth, defaultMinColumnWidth]);

  return (
    <>
      {preparedRows.map((row, index) =>
        isDataRow(row) ? (
          <TableRow
            key={row.id}
            row={row}
            columns={columns}
            renderExpander={renderExpander}
            showDragHandle={!!showDragHandle}
            onRowReorder={onRowReorder}
            minRowWidth={minRowWidth}
          />
        ) : renderSkeletonRow ? (
          <div key={`skeleton_${index}`} style={{ height: `${lineHeight}px`, minWidth: `${minRowWidth}px` }}>
            {renderSkeletonRow()}
          </div>
        ) : (
          <SkeletonRow key={`skeleton_${index}`} lineHeight={lineHeight} minWidth={minRowWidth} />
        ),
      )}
    </>
  );
};
