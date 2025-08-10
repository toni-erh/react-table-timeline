import React from "react";
import type { TableRowBase, TableProps } from "./types/tableTypes";
import { isDataRow } from "./utils/virtualizationUtils";
import { useColumnResize } from "./hooks/useColumnResize";
import { useTreeExpansion } from "./hooks/useTreeExpansion";
import { useVirtualization } from "./hooks/useVirtualization";

export const Table = <TableRow extends TableRowBase = TableRowBase>({
  columns,
  rows,
  rowCount,
  onRowRangeChange,
  lineHeight = 20,
  rowVirtualizationMargin = 5,
  defaultExpansionDepth
}: TableProps<TableRow>) => {
  // Use table expansion hook for tree functionality
  const {
    rowExpansions,
    expandedChildCounts,
    expandedRowCount,
    flatRows
  } = useTreeExpansion(rows, rowCount, defaultExpansionDepth);


  // Use virtualization hook
  const { scrollContainerRef, firstRenderedIndex, preparedRows } = useVirtualization(
    flatRows,
    rowCount,
    expandedRowCount,
    lineHeight,
    rowVirtualizationMargin,
    expandedChildCounts,
    rowExpansions,
    onRowRangeChange
  );
  
  // Use column resize hook
  const { leftWidth, isResizing, handleMouseDown } = useColumnResize(scrollContainerRef, 300);

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <div style={{ height: `${lineHeight}px`, width: leftWidth, display: 'flex', alignItems: 'center' }}>
        {columns.map((col) => (
          <div style={{ flex: 1, padding: '0 5px' }} key={col}>{col}</div>
        ))}
      </div>
      <div ref={scrollContainerRef} style={{ overflowY: 'auto', height: `calc(100% - ${lineHeight}px)`, display: 'flex' }}>
        <div style={{
          height: `${(expandedRowCount - firstRenderedIndex) * lineHeight}px`,
          paddingTop: `${firstRenderedIndex * lineHeight}px`,
          width: leftWidth,
          minWidth: 50,
          maxWidth: 800,
          backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent ${(lineHeight - 1)}px, #ddd ${(lineHeight - 1)}px, #ddd ${lineHeight}px)`
        }}>
          {preparedRows.map((row, index) =>
            isDataRow(row) ? (
              <div key={row.id} style={{ height: `${lineHeight}px`, display: 'flex', alignItems: 'center' }}>
                {columns.map((col) => (
                  <div key={col} style={{ flex: 1, padding: '0 5px' }}>
                    {col in row ? (row[col as keyof typeof row] as React.ReactNode) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div key={`sceleton_${index}`} style={{ padding: '3px' }}>
                <div style={{ height: `${lineHeight - 6}px`, backgroundColor: 'lightgrey', borderRadius: 5 }} />
              </div>
            )
          )}
        </div>
        <div
          style={{
            height: `${(expandedRowCount - firstRenderedIndex) * lineHeight}px`,
            paddingTop: `${firstRenderedIndex * lineHeight}px`,
            width: `calc(100% - ${leftWidth}px)`,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent ${(lineHeight - 1)}px, #ddd ${(lineHeight - 1)}px, #ddd ${lineHeight}px)`
          }}
        >
        </div>
      </div>
      <div
        style={{
          width: 6,
          cursor: 'col-resize',
          background: isResizing ? '#aaa' : '#ddd',
          zIndex: 10,
          position: 'absolute',
          left: leftWidth - 3,
          top: 0,
          bottom: 0,
          height: '100%',
          userSelect: 'none',
        }}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};
