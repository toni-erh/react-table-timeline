import React from "react";
import { useVirtualRows } from "./virtualization";

export type TableRowBase = { index: number, children?: TableRowBase[] }
export type TableSceletonRow = { __sceleton_row: true }

function isDataRow<TableRow extends TableRowBase>(row: TableRow | TableSceletonRow): row is TableRow {
  return !(row as TableSceletonRow).__sceleton_row;
}

function getExpandedChildCount(rows: TableRowBase[], defaultExpansionDepth?: number): number {
  if (defaultExpansionDepth === 0) return rows.length;
  return rows.reduce((pre, cur) => cur.children?.length ? pre + getExpandedChildCount(cur.children, defaultExpansionDepth && defaultExpansionDepth - 1) : pre, rows.length)
}

export interface TableProps<TableRow extends TableRowBase> {
  columns: string[];
  rows: Array<TableRow>;
  rowCount: number;
  onRowRangeChange?: (firstRow: number, lastRow: number, rowCount: number) => void;
  lineHeight?: number;
  rowVirtualizationMargin?: number;
  defaultExpansionDepth?: number;
}

export const Table = <TableRow extends TableRowBase = TableRowBase>({
  columns,
  rows,
  rowCount,
  onRowRangeChange,
  lineHeight = 20,
  rowVirtualizationMargin = 5,
  defaultExpansionDepth
}: TableProps<TableRow>) => {
  const treeState = React.useRef(rows.reduce(
    (state, cur) => cur.children?.length ? state.concat({ index: cur.index, childCount: getExpandedChildCount(cur.children, defaultExpansionDepth && defaultExpansionDepth - 1) }) : state,
    [] as { index: number, childCount: number }[]
  ))
  // - Flache Liste erzeugen
  // - Auf- & Zuklappen
  // - requested Range anpassen
  // - treeState updaten wenn Unstimmigkeit bemerkt
  console.log(treeState.current)

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
          height: `${(rowCount - firstRenderedIndex + treeState.current.reduce((pre, cur) => cur.index >= firstRenderedIndex ? pre + cur.childCount : pre, 0)) * lineHeight}px`,
          paddingTop: `${firstRenderedIndex * lineHeight}px`,
          width: leftWidth,
          minWidth: 50,
          maxWidth: 800,
          backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent ${(lineHeight - 1)}px, #ddd ${(lineHeight - 1)}px, #ddd ${lineHeight}px)`
        }}>
          {preparedRows.map((row, index) =>
            isDataRow(row) ? (
              <div key={row.index} style={{ height: `${lineHeight}px`, display: 'flex', alignItems: 'center' }}>
                {columns.map((col) => (
                  <div key={col} style={{ flex: 1, padding: '0 5px' }}>
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
            backgroundImage: `repeating-linear-gradient(to bottom, transparent, transparent ${(lineHeight - 1)}px, #ddd ${(lineHeight - 1)}px, #ddd ${lineHeight}px)`
          }}
        >
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
