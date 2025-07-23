import React from "react";

type TableRowBase = { index: number }
type TableSceletonRow = { __sceleton_row: true }

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
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const scrollBodyRef = React.useRef<HTMLDivElement>(null)

  const [firstRenderedIndex, setFirstRenderedIndex] = React.useState(0);
  const [rowCountToRender, setRowCountToRender] = React.useState(1);
  React.useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      setRowCountToRender(Math.ceil(container.clientHeight / lineHeight) + rowVirtualizationMargin);
    }
  }, []);
  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const virtualFirstIndex = Math.floor(container.scrollTop / lineHeight) - rowVirtualizationMargin;
          const firstIndex = Math.max(virtualFirstIndex, 0);
          const lastIndex = Math.min(
            virtualFirstIndex + Math.ceil(container.clientHeight / lineHeight) + 2 * rowVirtualizationMargin,
            rowCount
          );
          setFirstRenderedIndex(firstIndex);
          setRowCountToRender(lastIndex - firstIndex);
          ticking = false;
        });
        ticking = true;
      }
    };
    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [lineHeight, rowVirtualizationMargin, rowCount]);

  React.useEffect(() => {
    onRowRangeChange?.(firstRenderedIndex, firstRenderedIndex + rowCountToRender - 1, rowCountToRender)
  }, [firstRenderedIndex, rowCountToRender])

  const preparedRows: (TableRow | TableSceletonRow)[] = React.useMemo(() => {
    if (rows.length === 0) return [];

    const firstIndex = rows[0].index
    if (firstIndex === undefined) throw Error(`All rows require an 'index'! It is missing for: ${JSON.stringify(rows[0])}`);

    const relativeIndex = firstRenderedIndex - firstIndex

    if (relativeIndex >= 0) {
      const rowSection: (TableRow | TableSceletonRow)[] = rows.slice(relativeIndex, relativeIndex + rowCountToRender);
      rowSection.push(...Array<TableSceletonRow>(rowCountToRender - rowSection.length).fill({ __sceleton_row: true }))
      return rowSection
    } else {
      const sceletonCount = relativeIndex * -1
      if (sceletonCount > rowCountToRender) {
        return Array<TableSceletonRow>(rowCountToRender).fill({ __sceleton_row: true })
      } else {
        const rowSection = [...Array<TableSceletonRow>(sceletonCount).fill({ __sceleton_row: true }), ...rows.slice(0, rowCountToRender - sceletonCount)]
        if (rowSection.length < rowCountToRender)
          rowSection.push(...Array<TableSceletonRow>(rowCountToRender - rowSection.length).fill({ __sceleton_row: true }))
        return rowSection
      }
    }
  }, [rows, firstRenderedIndex, rowCountToRender])

  return (
    <div style={{ height: '100%' }}>
      <div style={{ height: `${lineHeight}px` }}>
        {columns.map((col) => (
          <div key={col}>{col}</div>
        ))}
      </div>
      <div ref={scrollContainerRef} style={{ overflow: 'scroll', height: `calc(100% - ${lineHeight}px)` }}>

        <div ref={scrollBodyRef} style={{ height: `${(rowCount - firstRenderedIndex) * lineHeight}px`, paddingTop: `${firstRenderedIndex * lineHeight}px` }}>
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
