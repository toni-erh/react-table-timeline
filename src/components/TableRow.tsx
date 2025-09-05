import React from 'react';
import type {
  TableRowBase,
  RenderExpanderParams,
  RowReorderEvent,
  RowReorderPlacement,
  TableColumn,
} from '../types/tableTypes';
import { TableCell } from './TableCell';
import { useRowExpansion } from '../context/RowExpansionContext';
import { computePlacement, prepareRowReorderEvent } from '../utils/dragAndDropUtils';

interface TableRowProps<T extends TableRowBase> {
  row: T;
  columns: TableColumn<T>[];
  renderExpander?: (params: RenderExpanderParams<T>) => React.ReactNode;
  showDragHandle?: boolean;
  onRowReorder?: (event: RowReorderEvent) => void;
}

export const TableRow = <T extends TableRowBase>({
  row,
  columns,
  renderExpander,
  showDragHandle,
  onRowReorder,
}: TableRowProps<T>) => {
  const { isExpanded, toggle, getLevel, rowExpansions } = useRowExpansion();
  const hasChildren = !!row.children?.length;
  const level = getLevel(row.id);

  const [dragOverPlacement, setDragOverPlacement] = React.useState<RowReorderPlacement | null>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    setDragOverPlacement(null);
    if (!onRowReorder) return;
    e.preventDefault();

    const sourceId = e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === row.id || !rowExpansions.get(sourceId)) return;

    const placement = computePlacement(e);
    const targetId = row.id;

    const event = prepareRowReorderEvent(sourceId, targetId, placement, rowExpansions);
    onRowReorder(event);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const placement = computePlacement(e);
    setDragOverPlacement(placement);
  };

  const handleDragLeave = () => {
    setDragOverPlacement(null);
  };

  const indicatorDataAttrs = React.useMemo(() => {
    if (!dragOverPlacement) {
      return {
        'data-drop-placement': undefined,
      };
    }
    return {
      'data-drop-placement': dragOverPlacement,
    };
  }, [dragOverPlacement]);

  return (
    <div
      className="table-row"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      {...indicatorDataAttrs}
    >
      {showDragHandle && (
        <div
          className="table-row-drag-handle"
          aria-hidden
          title="Drag to reorder"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('text/plain', row.id);
            e.dataTransfer.effectAllowed = 'move';
          }}
        >
          ⋮⋮
        </div>
      )}
      {columns.map((col, idx) => (
        <TableCell column={col} key={col.field}>
          {idx === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', ['--tree-indent-level' as string]: level }}>
              <div className="table-row-expander">
                {hasChildren &&
                  (renderExpander ? (
                    renderExpander({
                      expanded: isExpanded(row.id),
                      hasChildren,
                      toggle: () => toggle(row.id),
                      level,
                      row,
                    })
                  ) : (
                    <button
                      type="button"
                      className="table-row-expander-button"
                      aria-label={isExpanded(row.id) ? 'Collapse row' : 'Expand row'}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggle(row.id);
                      }}
                    >
                      {isExpanded(row.id) ? '▾' : '▸'}
                    </button>
                  ))}
              </div>
              {col.renderCell
                ? col.renderCell(row[col.field as keyof typeof row], row)
                : col.field in row
                  ? (row[col.field as keyof typeof row] as React.ReactNode)
                  : null}
            </div>
          ) : col.renderCell ? (
            col.renderCell(row[col.field as keyof typeof row], row)
          ) : col.field in row ? (
            (row[col.field as keyof typeof row] as React.ReactNode)
          ) : null}
        </TableCell>
      ))}
    </div>
  );
};
