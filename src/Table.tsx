import React from "react";
import { useVirtualRows } from "./virtualization";

export type TableRowBase = { index: number }
export type TableSceletonRow = { __sceleton_row: true }

function isDataRow<TableRow extends TableRowBase>(row: TableRow | TableSceletonRow): row is TableRow {
  return !(row as TableSceletonRow).__sceleton_row;
}

export interface TableProps<TableRow extends TableRowBase> {
  columns: string[];
  rows: Array<TableRow>;
  rowCount: number;
  onRowRangeChange?: (firstRow: number, lastRow: number, rowCount: number) => void;
  lineHeight?: number;
  rowVirtualizationMargin?: number;
}


export const Table = <TableRow extends TableRowBase = TableRowBase>({ columns, rows, rowCount, onRowRangeChange, lineHeight = 20, rowVirtualizationMargin = 5 }: TableProps<TableRow>) => {
  const { scrollContainerRef, firstRenderedIndex, preparedRows } = useVirtualRows(rows, rowCount, lineHeight, rowVirtualizationMargin, onRowRangeChange);
  const [leftWidth, setLeftWidth] = React.useState(300);
  const [isResizing, setIsResizing] = React.useState(false);

  React.useEffect(() => {
    if (!isResizing) return;
    const bounds = scrollContainerRef.current!.getBoundingClientRect();
    const handleMouseMove = (e: MouseEvent) => {
      const min = 100;
      const max = bounds.right - bounds.left - 100;
      setLeftWidth(Math.max(min, Math.min(max, e.clientX - bounds.left)));
    };
    const handleMouseUp = () => setIsResizing(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <div style={{ height: `${lineHeight}px` }}>
        {columns.map((col) => (
          <div key={col}>{col}</div>
        ))}
      </div>
      <div ref={scrollContainerRef} style={{ overflowY: 'auto', height: `calc(100% - ${lineHeight}px)`, display: 'flex' }}>
        {/* Linke Seite */}
        <div style={{
          height: `${(rowCount - firstRenderedIndex) * lineHeight}px`,
          paddingTop: `${firstRenderedIndex * lineHeight}px`,
          width: leftWidth,
          minWidth: 50,
          maxWidth: 800,
        }}>
          {preparedRows.map((row, index) =>
            isDataRow(row) ? (
              <div key={row.index} style={{ height: `${lineHeight}px`, backgroundColor: index % 2 === 0 ? 'white' : '#f9f9f9', display: 'flex', alignItems: 'center', padding: '0 10px' }}>
                {columns.map((col) => (
                  <div key={col}>
                    {col in row ? (row[col as keyof typeof row] as React.ReactNode) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div key={`sceleton_${index}`} style={{ height: `${lineHeight - 6}px`, marginBlock: '6px', backgroundColor: 'lightgrey', borderRadius: 5 }} />
            )
          )}
        </div>
        {/* Rechte Seite */}
        <div
          style={{
            height: `${(rowCount - firstRenderedIndex) * lineHeight}px`,
            paddingTop: `${firstRenderedIndex * lineHeight}px`,
            width: `calc(100% - ${leftWidth}px)`,
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          {preparedRows.map((row, index) =>
            isDataRow(row) ? (
              <div key={row.index} style={{ height: `${lineHeight}px`, backgroundColor: index % 2 === 0 ? 'white' : '#f9f9f9', display: 'flex', alignItems: 'center', padding: '0 10px', width: 500 }}>
                {columns.map((col) => (
                  <div key={col}>
                    {col in row ? (row[col as keyof typeof row] as React.ReactNode) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div key={`sceleton_${index}`} style={{ height: `${lineHeight - 6}px`, marginBlock: '6px', backgroundColor: 'lightgrey', borderRadius: 5 }} />
            )
          )}
        </div>
      </div>
      {/* Resizer - jetzt außerhalb des scrollbaren Bereichs, immer sichtbar */}
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
        onMouseDown={() => setIsResizing(true)}
      />
    </div>
  );
};
