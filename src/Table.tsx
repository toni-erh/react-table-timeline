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

  return (
    <div style={{ height: '100%' }}>
      <div style={{ height: `${lineHeight}px` }}>
        {columns.map((col) => (
          <div key={col}>{col}</div>
        ))}
      </div>
      <div ref={scrollContainerRef} style={{ overflow: 'scroll', height: `calc(100% - ${lineHeight}px)` }}>

        <div style={{ height: `${(rowCount - firstRenderedIndex) * lineHeight}px`, paddingTop: `${firstRenderedIndex * lineHeight}px` }}>
          {preparedRows.map((row, index) =>
            isDataRow(row) ? (
              <div key={row.index} style={{ height: `${lineHeight}px` }}>
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
    </div>
  );
};
