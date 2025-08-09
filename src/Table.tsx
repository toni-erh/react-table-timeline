import React from "react";
import { useVirtualRows, type RequestedRows } from "./virtualization";

export type TableRowBase = { index: number, id: string, children?: TableRowBase[] }
export type TableSceletonRow = { __sceleton_row: true }

export type RowExpansions = { [rowId: number]: RowExpansions }
export type ExpandedChildCounts = { index: number, rowCount: number }[]

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
  const [rowExpansions, setRowExpansions] = React.useState<RowExpansions>(() => {
    console.time("getInitialExpansions");
    const initialExpansions = getInitialExpansions(rows, defaultExpansionDepth);
    console.timeEnd("getInitialExpansions");
    return initialExpansions;
  });

  // For easy counting of rows before and after visible rows
  const [expandedChildCounts, setExpandedChildCounts] = React.useState<ExpandedChildCounts>(() => {
    // TODO: Don't recompute, only update if rows or rowExpansions change
    console.time("getExpandedChildCounts");
    const childCounts = rows.reduce(
      (state, cur) => cur.children?.length ? state.concat({ 
        index: cur.index, 
        rowCount: getExpandedChildCount(cur.children, rowExpansions[cur.index]) 
      }) : state,
      [] as ExpandedChildCounts
    );
    console.timeEnd("getExpandedChildCounts");
    return childCounts;
  });

  React.useEffect(() => {
    console.time("updateExpandedChildCounts");

    setExpandedChildCounts((prev) => {
      const updatedChildCounts = [];
      const iterator = prev.values();

      let next = iterator.next();

      // Copy rows that are not in the new list
      while (!next.done && next.value.index < rows[0]?.index) {
        updatedChildCounts.push(next.value);
        next = iterator.next();
      }

      // Update rows that are in the new list
      rows.forEach((row) => {
        if (row.children?.length) {
          const childCount = getExpandedChildCount(row.children, rowExpansions[row.index]);
          if (childCount !== expandedChildCounts[row.index].rowCount) {
            expandedChildCounts[row.index].rowCount = childCount;
          }
        }
      });

      // Copy rows that are not in the new list
      while (!next.done) {
        updatedChildCounts.push(next.value);
        next = iterator.next();
      }

      return updatedChildCounts;
    });

    console.timeEnd("updateExpandedChildCounts");
  }, [rows, rowExpansions]);

  const expandedRowCount = React.useMemo(() => {
    console.time("getExpandedRowCount");
    const result = rowCount + expandedChildCounts.reduce((pre, cur) => pre + cur.rowCount, 0)
    console.timeEnd("getExpandedRowCount");
    return result;
  }, [expandedChildCounts])

  // flattens the rows with expanded children
  const flatRows = React.useMemo(() => {
    console.time("flattenExpanded");
    const result = rows.flatMap((row) => flattenExpanded(row, rowExpansions[row.index]))
    console.timeEnd("flattenExpanded");
    return result;
  }, [rows, rowExpansions])


  // - Expand & collapse handling
  // - Adjust requested range
  // - Update treeState when inconsistency detected
  const { scrollContainerRef, firstRenderedIndex, preparedRows } = useVirtualRows(
    flatRows,
    rowCount,
    expandedRowCount,
    lineHeight,
    rowVirtualizationMargin,
    expandedChildCounts,
    rowExpansions,
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
        onMouseDown={() => setIsResizing(true)}
      />
    </div>
  );
};
