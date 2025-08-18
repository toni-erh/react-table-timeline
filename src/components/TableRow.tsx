import React from 'react';
import type { TableRowBase, RenderExpanderParams, RowReorderEvent, RowReorderPlacement } from '../types/tableTypes';
import { TableCell } from './TableCell';
import { useRowExpansion } from '../context/RowExpansionContext';

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

  // helpers
  const computePlacement = (e: React.DragEvent<HTMLDivElement>): RowReorderPlacement => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const threshold = rect.height * 0.25;
    if (offsetY < threshold) return 'before';
    if (offsetY > rect.height - threshold) return 'after';
    return 'inside';
  };

  const computePath = (id: string): string[] => {
    const path: string[] = [];
    let currentId = id;
    while (rowExpansions.has(currentId)) {
      const expansion = rowExpansions.get(currentId);
      if (!expansion) break;
      path.unshift(currentId);
      currentId = expansion.parentId || '';
    }
    return path;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!onRowReorder) return;
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === row.id || !rowExpansions.get(sourceId)) return;
    const placement = computePlacement(e);

    const targetId = row.id;
    const source = rowExpansions.get(sourceId);
    const target = rowExpansions.get(targetId);
    const sourceParentId = source?.parentId;
    const targetParentId = target?.parentId;

    const prevSiblingId = (() => {
      switch (placement) {
        case 'before':
          return target?.prevSiblingId;
        case 'after':
          return targetId;
        case 'inside':
          return undefined;
      }
    })();

    const nextSiblingId = (() => {
      switch (placement) {
        case 'before':
          return targetId;
        case 'after':
          return target?.nextSiblingId;
        case 'inside':
          return target?.childrenIds[0];
      }
    })();

    const event: RowReorderEvent = {
      sourceId,
      sourceParentId,
      sourcePath: computePath(sourceId),
      targetId,
      targetParentId,
      targetPath: computePath(targetId),
      placement,
      newParentId: placement === 'inside' ? targetId : targetParentId,
      prevSiblingId,
      nextSiblingId,
      isSameParentMove: (sourceParentId ?? null) === (placement === 'inside' ? targetId : targetParentId ?? null),
    };

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
