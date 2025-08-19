import React from 'react';
import type { TableRowBase, RenderExpanderParams, RowReorderEvent, RowReorderPlacement } from '../types/tableTypes';
import { TableCell } from './TableCell';
import { useRowExpansion } from '../context/RowExpansionContext';
import { computePlacement, prepareRowReorderEvent } from '../utils/dragAndDropUtils';

interface TableRowProps<T extends TableRowBase> {
  row: T;
  columns: string[];
  renderExpander?: (params: RenderExpanderParams<T>) => React.ReactNode;
  showDragHandle?: boolean;
  onRowReorder?: (event: RowReorderEvent) => void;
}

export const TableRow = <T extends TableRowBase>({ row, columns, renderExpander, showDragHandle, onRowReorder }: TableRowProps<T>) => {
  const { isExpanded, toggle, getLevel, rowExpansions } = useRowExpansion();
  const hasChildren = !!row.children?.length;
  const level = getLevel(row.id);

  const [dragOverPlacement, setDragOverPlacement] = React.useState<RowReorderPlacement | null>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!onRowReorder) return;
    e.preventDefault();

    const sourceId = e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === row.id || !rowExpansions.get(sourceId)) return;

    const placement = computePlacement(e);
    const targetId = row.id;

    const event = prepareRowReorderEvent(sourceId, targetId, placement, rowExpansions);
    onRowReorder(event);
    setDragOverPlacement(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const placement = computePlacement(e);
    setDragOverPlacement(placement);
  };

  const handleDragLeave = () => {
    setDragOverPlacement(null);
  };

  // visual indicators
  const indicatorStyle: React.CSSProperties = React.useMemo(() => {
    if (!dragOverPlacement) return {};
    if (dragOverPlacement === 'before') {
      return { boxShadow: 'inset 0 2px 0 0 var(--table-accent-color, dodgerblue)' };
    }
    if (dragOverPlacement === 'after') {
      return { boxShadow: 'inset 0 -2px 0 0 var(--table-accent-color, dodgerblue)' };
    }
    // inside
    return { backgroundColor: 'var(--table-drop-inside-bg, rgba(30,144,255,0.1))' };
  }, [dragOverPlacement]);

  return (
    <div className="table-row" onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} style={indicatorStyle}>
      {showDragHandle && (
        <div
          className="table-row-drag-handle"
          style={{ width: 20, height: '100%', cursor: 'grab', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          aria-hidden
          title="Drag to reorder"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('text/plain', row.id);
            e.dataTransfer.effectAllowed = 'move';
          }}
          onDragEnd={() => { }}
        >
          ⋮⋮
        </div>
      )}
      {columns.map((col, idx) => (
        <TableCell key={col}>
          {idx === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', ['--tree-indent-level' as string]: level }} >
              <div className='table-row-expander'>
                {hasChildren && (
                  renderExpander ? (
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
                      className='table-row-expander-button'
                      aria-label={isExpanded(row.id) ? 'Collapse row' : 'Expand row'}
                      onClick={(e) => { e.stopPropagation(); toggle(row.id); }}
                    >
                      {isExpanded(row.id) ? '▾' : '▸'}
                    </button>
                  )
                )}
              </div>
              {col in row ? (row[col as keyof typeof row] as React.ReactNode) : null}
            </div>
          ) : (
            col in row ? (row[col as keyof typeof row] as React.ReactNode) : null
          )}
        </TableCell>
      ))}
    </div>
  );
};
