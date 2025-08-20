import React from 'react';
import type {
  TableRowBase,
  TableSkeletonRow,
  ExpandedChildCounts,
  RowExpansions,
  RequestedRows
} from '../types/tableTypes';
import {
  getFirstLevelIndexAndOffset
} from '../utils/virtualizationUtils';
import { calculateVisibleRowRange } from '../utils/scrollCalculations';
import { prepareVirtualizedRows } from '../utils/rowPreparation';

export interface UseVirtualizationReturn<TableRow extends TableRowBase> {
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  firstRenderedIndex: number;
  preparedRows: Array<TableRow | TableSkeletonRow>;
}

/**
 * Hook for managing table virtualization
 */
export function useVirtualization<TableRow extends TableRowBase>(
  rows: Array<TableRow>,
  rowCount: number,
  flatRowCount: number,
  lineHeight: number,
  rowVirtualizationMargin: number,
  rowVirtualizationStep: number,
  expandedChildCounts: ExpandedChildCounts,
  rowExpansions: RowExpansions,
  onRowRangeChange?: (requestedRows: RequestedRows) => void
): UseVirtualizationReturn<TableRow> {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const [containerClientHeight, setContainerClientHeight] = React.useState<number | undefined>(undefined);
  const [containerScrollTop, setContainerScrollTop] = React.useState<number | undefined>(undefined);

  const [firstRenderedIndex, setFirstRenderedIndex] = React.useState(0);
  const [rowCountToRender, setRowCountToRender] = React.useState<number | undefined>(undefined);
  const [firstRealIndex, setFirstRealIndex] = React.useState<number | undefined>(undefined);
  const [lastRealIndex, setLastRealIndex] = React.useState<number | undefined>(undefined);
  const [offsetToFirstRealIndex, setOffsetToFirstRealIndex] = React.useState<number | undefined>(undefined);

  // Calculate initial values for virtualization and handle scroll events
  React.useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setContainerClientHeight(container.clientHeight);
    setContainerScrollTop(container.scrollTop);

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollStep = lineHeight * rowVirtualizationStep;
          setContainerScrollTop(Math.floor(container.scrollTop / scrollStep) * scrollStep);
          setContainerClientHeight(Math.ceil(container.clientHeight / scrollStep) * scrollStep);
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [lineHeight]);

  React.useEffect(() => {
    if (containerScrollTop === undefined || containerClientHeight === undefined) return;

    const { firstFlatIndex, rowCountToRender: newRowCountToRender } = calculateVisibleRowRange(
      containerScrollTop,
      containerClientHeight,
      lineHeight,
      rowVirtualizationMargin,
      flatRowCount
    );

    if (firstRenderedIndex === firstFlatIndex && rowCountToRender === newRowCountToRender) return;

    const [initialFirstRealIndex, initialOffset, initialLastRealIndex] = getFirstLevelIndexAndOffset(
      firstFlatIndex,
      expandedChildCounts,
      newRowCountToRender,
      rowCount
    );

    setFirstRenderedIndex(firstFlatIndex);
    setRowCountToRender(newRowCountToRender);
    setFirstRealIndex(initialFirstRealIndex);
    setLastRealIndex(initialLastRealIndex);
    setOffsetToFirstRealIndex(initialOffset);
  }, [lineHeight, rowVirtualizationMargin, flatRowCount, containerScrollTop, containerClientHeight]);

  // Notify parent about the range of rows to render
  React.useEffect(() => {
    if (firstRealIndex === undefined || lastRealIndex === undefined) return;

    onRowRangeChange?.({
      firstFirstLevelIndex: firstRealIndex,
      // TODO: check last real index calculation
      lastFirstLevelIndex: lastRealIndex + 1,
      firstLevelRowCount: lastRealIndex - firstRealIndex + 1,
      rowExpansions,
    });
  }, [firstRealIndex, lastRealIndex]);

  // Prepare rows to render
  const preparedRows: (TableRow | TableSkeletonRow)[] = React.useMemo(() => {
    if (offsetToFirstRealIndex === undefined || rowCountToRender === undefined || firstRealIndex === undefined) {
      return [];
    }
    return prepareVirtualizedRows(
      rows,
      firstRealIndex,
      offsetToFirstRealIndex,
      rowCountToRender,
      expandedChildCounts
    );
  }, [rows, firstRealIndex, rowCountToRender, offsetToFirstRealIndex, expandedChildCounts]);

  return {
    scrollContainerRef,
    firstRenderedIndex,
    preparedRows
  };
}
