import React from "react";
import type { TableRowBase, TableSceletonRow, ExpandedChildCounts, RowExpansions } from "./Table";

export type RequestedRows = {
  firstFirstLevelIndex: number;
  lastFirstLevelIndex: number;
  firstLevelRowCount: number;
  rowExpansions: RowExpansions;
}

export function useVirtualRows<TableRow extends TableRowBase>(
  rows: Array<TableRow>,
  rowCount: number,
  lineHeight: number,
  rowVirtualizationMargin: number,
  expandedChildCounts: ExpandedChildCounts,
  rowExpansions: RowExpansions,
  onRowRangeChange?: (requestedRows: RequestedRows) => void,
) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)

  const [firstRenderedIndex, setFirstRenderedIndex] = React.useState(0);
  const [rowCountToRender, setRowCountToRender] = React.useState(1);
  const [firstRealIndex, setFirstRealIndex] = React.useState(0);
  const [lastRealIndex, setLastRealIndex] = React.useState(0);
  const [offsetToFirstRealIndex, setOffsetToFirstRealIndex] = React.useState(0);

  // Calculate initial row count to render
  React.useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      setRowCountToRender(Math.min(Math.ceil(container.clientHeight / lineHeight) + rowVirtualizationMargin, rowCount));
    }
  }, []);

  // Handle scroll events
  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const virtualFirstFlatIndex = Math.floor(container.scrollTop / lineHeight) - rowVirtualizationMargin;
          const firstFlatIndex = Math.max(virtualFirstFlatIndex, 0);
          const lastFlatIndex = Math.min(
            virtualFirstFlatIndex + Math.ceil(container.clientHeight / lineHeight) + 2 * rowVirtualizationMargin,
            rowCount
          );

          const [firstRealIndex, offset, endIndex] = getFirstLevelIndexAndOffset(firstFlatIndex, expandedChildCounts, lastFlatIndex - firstFlatIndex);

          setFirstRenderedIndex(firstFlatIndex);
          setRowCountToRender(lastFlatIndex - firstFlatIndex);
          setFirstRealIndex(firstRealIndex);
          setLastRealIndex(endIndex);
          setOffsetToFirstRealIndex(offset);
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

  // Notify parent about the range of rows to render
  React.useEffect(() => {
    onRowRangeChange?.({
      firstFirstLevelIndex: firstRealIndex,
      lastFirstLevelIndex: lastRealIndex,
      firstLevelRowCount: rowCountToRender,
      rowExpansions,
    })
  }, [firstRenderedIndex, rowCountToRender])

  // Prepare rows to render
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

function getFirstLevelIndexAndOffset(flatIndex: number, expandedChildCounts: ExpandedChildCounts, rowRange: number): [number, number, number] {
  const result = expandedChildCounts.reduce((pre: {index: number, offset: number, childCount: number, endIndex: number, coveredRange: number, lastIndex: number}, cur) => {
    // If we have already found the end index, we can stop
    if (pre.endIndex >= 0) return pre;

    // If offset is 0 or higher, we found the start index and only need to find the end index
    if (pre.offset >= 0) {
      pre.coveredRange += cur.index + cur.childCount - pre.lastIndex;
      if (pre.coveredRange >= rowRange) {
        pre.endIndex = cur.index;
        return pre;
      }
      pre.lastIndex = cur.index;
      return pre;
    }

    pre.lastIndex = cur.index;

    // Calculate the offset to the current first level index
    const currentOffset = flatIndex - (cur.index + pre.childCount);

    // If the offset is 0 or lower, we can calculate the start index by going back from the current index
    // If the offset is negative, we know that there are as many rows without children before the current index
    if (currentOffset <= 0) {
      pre.index = cur.index + currentOffset;
      pre.offset = 0;
      pre.coveredRange = cur.childCount - currentOffset;

      // If the negative offset is higher than the needed row range, the end index is within the current range as well
      if (-currentOffset > rowRange) {
        pre.endIndex = pre.index + rowRange;
      // And if the current children are enough to cover the needed row range, the end index is the current index
      } else if (pre.coveredRange >= rowRange) {
        pre.endIndex = cur.index;
      }
      return pre;
    }
    // If the offset is positive, we can check if it is covered by the current children
    if (currentOffset <= cur.childCount) {
      pre.index = cur.index;
      pre.offset = currentOffset;
      pre.childCount += cur.childCount;
      if (cur.childCount - currentOffset > rowRange) {
        pre.endIndex = cur.index;
      }
      pre.coveredRange = cur.childCount - currentOffset;
      return pre;
    }

    pre.childCount += cur.childCount;
    return pre;
  }, {index: -1, offset: -1, childCount: 0, endIndex: -1, coveredRange: -1, lastIndex: 0})

  return [result.index, result.offset, result.endIndex]
}
