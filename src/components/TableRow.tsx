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
  onCanDrop?: (event: RowReorderEvent) => boolean;
}

// DnD session state (scoped to module)
let currentDragSourceId: string | null = null;

export const TableRow = <T extends TableRowBase>({ row, columns, renderExpander, showDragHandle, onRowReorder, onCanDrop }: TableRowProps<T>) => {
  const { isExpanded, toggle, getLevel, rowExpansions } = useRowExpansion();
  const hasChildren = !!row.children?.length;
  const level = getLevel(row.id);

  const [dragOverPlacement, setDragOverPlacement] = React.useState<RowReorderPlacement | null>(null);
  const [dragOverAllowed, setDragOverAllowed] = React.useState<boolean | null>(null);

  // helpers
  const getPath = React.useCallback((id: string): string[] => {
    const path: string[] = [];
    let current: string | undefined = id;
    while (current) {
      path.push(current);
      const parentId: string | undefined = rowExpansions.get(current)?.parentId;
      current = parentId;
    }
    return path.reverse();
  }, [rowExpansions]);

  const getIndexWithinParent = React.useCallback((id: string): number => {
    const parentId = rowExpansions.get(id)?.parentId;
    if (!parentId) return -1; // root sentinel
    const siblings = rowExpansions.get(parentId)?.childrenIds || [];
    return siblings.indexOf(id);
  }, [rowExpansions]);

  const getSiblingNeighbors = React.useCallback((id: string): { prevSiblingId?: string; nextSiblingId?: string } => {
    const parentId = rowExpansions.get(id)?.parentId;
    if (!parentId) return {};
    const siblings = rowExpansions.get(parentId)?.childrenIds || [];
    const idx = siblings.indexOf(id);
    return {
      prevSiblingId: idx > 0 ? siblings[idx - 1] : undefined,
      nextSiblingId: idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : undefined,
    };
  }, [rowExpansions]);

  const computePlacement = (e: React.DragEvent<HTMLDivElement>): RowReorderPlacement => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const threshold = rect.height * 0.25;
    if (offsetY < threshold) return 'before';
    if (offsetY > rect.height - threshold) return 'after';
    return 'inside';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!onRowReorder) return;
    e.preventDefault();
    const dtId = e.dataTransfer.getData('text/plain');
    const sourceId = dtId || currentDragSourceId || '';
    if (!sourceId || sourceId === row.id || !rowExpansions.get(sourceId)) return;
    const placement = computePlacement(e);

    const targetId = row.id;
    const sourceParentId = rowExpansions.get(sourceId)?.parentId;
    const targetParentId = rowExpansions.get(targetId)?.parentId;

    const sourcePath = getPath(sourceId);
    const targetPath = getPath(targetId);

    const event: RowReorderEvent = {
      sourceId,
      sourceParentId,
      sourceIndex: getIndexWithinParent(sourceId),
      sourcePath,
      targetId,
      targetParentId,
      targetIndex: getIndexWithinParent(targetId),
      targetPath,
      placement,
      newParentId: placement === 'inside' ? targetId : targetParentId,
      newParentPath:
        placement === 'inside'
          ? [...targetPath]
          : (targetParentId
              ? getPath(targetParentId)
              : targetPath.slice(0, Math.max(0, targetPath.length - 1))),
      siblingIndex: placement === 'inside' ? 0 : undefined,
      ...getSiblingNeighbors(targetId),
      isSameParentMove: (sourceParentId ?? null) === (placement === 'inside' ? targetId : targetParentId ?? null),
      isDescendantDrop: targetPath.includes(sourceId),
      timestamp: Date.now(),
    };

    // guard
    if (onCanDrop && !onCanDrop(event)) {
      setDragOverPlacement(null);
      setDragOverAllowed(null);
      return;
    }

    onRowReorder(event);
    currentDragSourceId = null;
    setDragOverPlacement(null);
    setDragOverAllowed(null);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!onRowReorder) return;
    e.preventDefault();
    const sourceId = currentDragSourceId;
    if (!sourceId || sourceId === row.id || !rowExpansions.get(sourceId)) {
      setDragOverPlacement(null);
      setDragOverAllowed(null);
      return;
    }
    const placement = computePlacement(e);

    const targetId = row.id;
    const sourceParentId = rowExpansions.get(sourceId)?.parentId;
    const targetParentId = rowExpansions.get(targetId)?.parentId;
    const sourcePath = getPath(sourceId);
    const targetPath = getPath(targetId);

    const preview: RowReorderEvent = {
      sourceId,
      sourceParentId,
      sourceIndex: getIndexWithinParent(sourceId),
      sourcePath,
      targetId,
      targetParentId,
      targetIndex: getIndexWithinParent(targetId),
      targetPath,
      placement,
      newParentId: placement === 'inside' ? targetId : targetParentId,
      newParentPath:
        placement === 'inside'
          ? [...targetPath]
          : (targetParentId
              ? getPath(targetParentId)
              : targetPath.slice(0, Math.max(0, targetPath.length - 1))),
      siblingIndex: placement === 'inside' ? 0 : undefined,
      ...getSiblingNeighbors(targetId),
      isSameParentMove: (sourceParentId ?? null) === (placement === 'inside' ? targetId : targetParentId ?? null),
      isDescendantDrop: targetPath.includes(sourceId),
      timestamp: Date.now(),
    };

    const allowed = onCanDrop ? onCanDrop(preview) : true;
    setDragOverPlacement(placement);
    setDragOverAllowed(allowed);
  };

  const onDragLeave = () => {
    setDragOverPlacement(null);
    setDragOverAllowed(null);
  };

  // visual indicators
  const indicatorStyle: React.CSSProperties = React.useMemo(() => {
    if (!dragOverPlacement) return {};
    if (dragOverAllowed === false) {
      return { backgroundColor: 'var(--table-drop-inside-bg, rgba(255, 30, 30, 0.1))' };
    }
    if (dragOverPlacement === 'before') {
      return { boxShadow: 'inset 0 2px 0 0 var(--table-accent-color, dodgerblue)' };
    }
    if (dragOverPlacement === 'after') {
      return { boxShadow: 'inset 0 -2px 0 0 var(--table-accent-color, dodgerblue)' };
    }
    // inside
    return { backgroundColor: 'var(--table-drop-inside-bg, rgba(30,144,255,0.1))' };
  }, [dragOverPlacement, dragOverAllowed]);

  return (
    <div className="table-row" onDrop={handleDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} style={indicatorStyle}>
      {showDragHandle && (
        <div
          className="table-row-drag-handle"
          style={{ width: 20, height: '100%', cursor: 'grab', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          aria-hidden
          title="Drag to reorder"
          draggable
          onDragStart={(e) => {
            currentDragSourceId = row.id;
            e.dataTransfer.setData('text/plain', row.id);
            e.dataTransfer.effectAllowed = 'move';
          }}
          onDragEnd={() => { currentDragSourceId = null; }}
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
