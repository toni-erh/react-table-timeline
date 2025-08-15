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
  const expanderWidth = 18; // keep text aligned even without children
  const expanderGap = 4;
  return (
    <div className="table-row">
      {columns.map((col, idx) => (
        <TableCell key={col}>
          {idx === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: `calc(var(--tree-indent-step) * ${level})` }} />
              {hasChildren ? (
                renderExpander ? (
                  <div style={{ display: 'flex', alignItems: 'center', marginRight: expanderGap }}
                       onClick={(e) => e.stopPropagation()}>
                    {renderExpander({
                      expanded: isExpanded(row.id),
                      hasChildren,
                      toggle: () => toggle(row.id),
                      level,
                      row,
                    })}
                  </div>
                ) : (
                  <button
                    type="button"
                    aria-label={isExpanded(row.id) ? 'Collapse row' : 'Expand row'}
                    onClick={(e) => { e.stopPropagation(); toggle(row.id); }}
                    style={{
                      color: 'var(--table-text-color)',
                      width: expanderWidth,
                      height: expanderWidth,
                      lineHeight: `${expanderWidth}px`,
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      userSelect: 'none',
                      marginRight: expanderGap,
                    }}
                  >
                    {isExpanded(row.id) ? '▾' : '▸'}
                  </button>
                )
              ) : (
                // keep alignment for leaf rows by reserving expander width
                <div style={{ width: expanderWidth + expanderGap }} />
              )}
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

