import React from "react";
import type { TableRowBase, TableSceletonRow } from "./Table";

export function useVirtualRows<TableRow extends TableRowBase>(
  rows: Array<TableRow>,
  rowCount: number,
  lineHeight: number,
  rowVirtualizationMargin: number,
  onRowRangeChange?: (firstRow: number, lastRow: number, rowCount: number) => void,
) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)

  const [firstRenderedIndex, setFirstRenderedIndex] = React.useState(0);
  const [rowCountToRender, setRowCountToRender] = React.useState(1);
  React.useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      setRowCountToRender(Math.min(Math.ceil(container.clientHeight / lineHeight) + rowVirtualizationMargin, rowCount));
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

  return {
    scrollContainerRef,
    firstRenderedIndex,
    preparedRows
  }
}