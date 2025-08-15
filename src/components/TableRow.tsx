import React from 'react';
import type { TableRowBase, RenderExpanderParams } from '../types/tableTypes';
import { TableCell } from './TableCell';
import { useRowExpansion } from '../context/RowExpansionContext';

interface TableRowProps<T extends TableRowBase> {
  row: T;
  columns: string[];
  renderExpander?: (params: RenderExpanderParams<T>) => React.ReactNode;
}

export const TableRow = <T extends TableRowBase>({ row, columns, renderExpander }: TableRowProps<T>) => {
  const { isExpanded, toggle, getLevel } = useRowExpansion();
  const hasChildren = !!row.children?.length;
  const level = getLevel(row.id);

  return (
    <div className="table-row">
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

