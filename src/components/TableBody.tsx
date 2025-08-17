
import { TableRow } from './TableRow';
import { SkeletonRow } from './SkeletonRow';
import { isDataRow } from '../utils/virtualizationUtils';
import type { PreparedRow, TableRowBase, RenderExpanderParams, RowReorderEvent } from '../types/tableTypes';

interface TableBodyProps<T extends TableRowBase> {
  preparedRows: PreparedRow<T>[];
  columns: string[];
  lineHeight: number;
  renderSkeletonRow?: () => React.ReactNode;
  renderExpander?: (params: RenderExpanderParams<T>) => React.ReactNode;
  showDragHandle?: boolean;
  onRowReorder?: (event: RowReorderEvent) => void;
  onCanDrop?: (event: RowReorderEvent) => boolean;
}

export const TableBody = <T extends TableRowBase>({ 
  preparedRows, 
  columns, 
  lineHeight, 
  renderSkeletonRow, 
  renderExpander, 
  showDragHandle, 
  onRowReorder, 
  onCanDrop 
}: TableBodyProps<T>) => {
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
            onCanDrop={onCanDrop} 
          />
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
