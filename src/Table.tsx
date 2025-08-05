import React from "react";
import { useVirtualRows, type RequestedRows } from "./virtualization";

export type TableRowBase = { index: number, id: string, children?: TableRowBase[] }
export type TableSceletonRow = { __sceleton_row: true }

export type RowExpansions = { [rowId: number]: RowExpansions }
export type ExpandedChildCounts = { index: number, childCount: number }[]

function isDataRow<TableRow extends TableRowBase>(row: TableRow | TableSceletonRow): row is TableRow {
  return !(row as TableSceletonRow).__sceleton_row;
}

function getInitialExpansions(rows: TableRowBase[], defaultExpansionDepth: number | undefined): RowExpansions {
 return rows.reduce((state, cur) => {
   if (defaultExpansionDepth === 0) return state;
   if (cur.children?.length) state[cur.index] = getInitialExpansions(cur.children, defaultExpansionDepth && defaultExpansionDepth - 1);
   return state;
 }, {} as RowExpansions)
}


function getExpandedChildCount(rows: TableRowBase[], expansions: RowExpansions | undefined): number {
  return expansions ? rows.reduce((pre, cur) => cur.children?.length ? pre + getExpandedChildCount(cur.children, expansions[cur.index]) : pre, rows.length) : 0
}

function flattenExpanded(row: TableRowBase, expansions: RowExpansions | undefined): TableRowBase[] {
  return expansions ? [row, ...(row.children?.flatMap((child) => flattenExpanded(child, expansions[child.index])) || [])] : [row]
}

export interface TableProps<TableRow extends TableRowBase> {
  columns: string[];
  rows: Array<TableRow>;
  rowCount: number;
  onRowRangeChange?: (requestedRows: RequestedRows) => void;
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
  // For tracking which rows are expanded
  const rowExpansions = React.useRef<RowExpansions>(getInitialExpansions(rows, defaultExpansionDepth));

  // For easy counting of rows before and after visible rows
  const expandedChildCounts = React.useRef<ExpandedChildCounts>(rows.reduce(
    (state, cur) => cur.children?.length ? state.concat({ 
      index: cur.index, 
      childCount: getExpandedChildCount(cur.children, rowExpansions.current[cur.index]) 
    }) : state,
    [] as ExpandedChildCounts
  ))
  const expandedRowCount = React.useMemo(() => {
    return rowCount + expandedChildCounts.current.reduce((pre, cur) => pre + cur.childCount, 0)
  }, [expandedChildCounts.current])

  // flattens the rows with expanded children
  const flatRows = React.useMemo(() => {
    return rows.flatMap((row) => flattenExpanded(row, rowExpansions.current[row.index]))
  }, [rows, rowExpansions.current])


  // - Expand & collapse handling
  // - Adjust requested range
  // - Update treeState when inconsistency detected
  console.log(expandedRowCount, rowExpansions.current, expandedChildCounts.current, flatRows)

  const { scrollContainerRef, firstRenderedIndex, preparedRows } = useVirtualRows(
    flatRows,
    expandedRowCount,
    lineHeight,
    rowVirtualizationMargin,
    expandedChildCounts.current,
    rowExpansions.current,
    onRowRangeChange
  );
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
      <div style={{ height: `${lineHeight}px`, width: leftWidth, display: 'flex', alignItems: 'center' }}>
        {columns.map((col) => (
          <div style={{ flex: 1, padding: '0 5px' }} key={col}>{col}</div>
        ))}
      </div>
      <div ref={scrollContainerRef} style={{ overflowY: 'auto', height: `calc(100% - ${lineHeight}px)`, display: 'flex' }}>
        <div style={{
          // TODO: make lazy loading process the tree information
          height: `${(expandedRowCount - firstRenderedIndex + expandedChildCounts.current.reduce((pre, cur) => cur.index >= firstRenderedIndex ? pre + cur.childCount : pre, 0)) * lineHeight}px`,
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
              <div key={`sceleton_${index}`} style={{ height: `${lineHeight - 6}px`, marginBlock: '6px', backgroundColor: 'lightgrey', borderRadius: 5 }} />
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
        onMouseDown={() => setIsResizing(true)}
      />
    </div>
  );
};
