import React from 'react';
import type { 
  TableRowBase, 
  TableSceletonRow, 
  ExpandedChildCounts, 
  RowExpansions, 
  RequestedRows 
} from '../types/tableTypes';
import { 
  getFirstLevelIndexAndOffset, 
  getRowCountInRange 
} from '../utils/virtualizationUtils';

export interface UseVirtualizationReturn<TableRow extends TableRowBase> {
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  firstRenderedIndex: number;
  preparedRows: Array<TableRow | TableSceletonRow>;
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
  expandedChildCounts: ExpandedChildCounts,
  rowExpansions: RowExpansions,
  onRowRangeChange?: (requestedRows: RequestedRows) => void
): UseVirtualizationReturn<TableRow> {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const [firstRenderedIndex, setFirstRenderedIndex] = React.useState(0);
  const [rowCountToRender, setRowCountToRender] = React.useState(1);
  const [firstRealIndex, setFirstRealIndex] = React.useState(-1);
  const [lastRealIndex, setLastRealIndex] = React.useState(-1);
  const [offsetToFirstRealIndex, setOffsetToFirstRealIndex] = React.useState(0);

  // Calculate initial row count to render
  React.useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      setRowCountToRender(Math.min(Math.ceil(container.clientHeight / lineHeight) + rowVirtualizationMargin, flatRowCount));
    }
  }, [lineHeight, rowVirtualizationMargin, flatRowCount]);

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
            flatRowCount
          );
          const newRowCountToRender = lastFlatIndex - firstFlatIndex;

          setRowCountToRender((oldRowCountToRender) => {
            setFirstRenderedIndex((oldFirstRenderedIndex) => {
              if (oldFirstRenderedIndex !== firstFlatIndex || oldRowCountToRender !== newRowCountToRender) {
                setRowCountToRender(newRowCountToRender);

                const [firstRealIndex, offset, endIndex] = getFirstLevelIndexAndOffset(firstFlatIndex, expandedChildCounts, newRowCountToRender);

                setFirstRealIndex(firstRealIndex);
                setLastRealIndex(Math.min(endIndex, rowCount - 1));
                setOffsetToFirstRealIndex(offset);
              }
              return firstFlatIndex;
            });
            return newRowCountToRender;
          });
          ticking = false;
        });
        ticking = true;
      }
    };
    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [lineHeight, rowVirtualizationMargin, flatRowCount, expandedChildCounts, rowCount]);

  // Notify parent about the range of rows to render
  React.useEffect(() => {
    if (firstRealIndex === -1 || lastRealIndex === -1) return;
    onRowRangeChange?.({
      firstFirstLevelIndex: firstRealIndex,
      lastFirstLevelIndex: lastRealIndex,
      firstLevelRowCount: lastRealIndex - firstRealIndex,
      rowExpansions,
    });
  }, [firstRealIndex, lastRealIndex, rowExpansions, onRowRangeChange]);

  // Prepare rows to render
  const preparedRows: (TableRow | TableSceletonRow)[] = React.useMemo(() => {
    if (rows.length === 0) return [];

    const firstIndex = rows[0].index;
    if (firstIndex === undefined) throw Error(`All rows require an 'index'! It is missing for: ${JSON.stringify(rows[0])}`);

    if (firstRealIndex === firstIndex) {
      const rowSection: (TableRow | TableSceletonRow)[] = rows.slice(offsetToFirstRealIndex, offsetToFirstRealIndex + rowCountToRender);
      rowSection.push(...Array<TableSceletonRow>(rowCountToRender - rowSection.length).fill({ __sceleton_row: true }));
      return rowSection;
    }

    if (firstIndex < firstRealIndex) {
      const offset = getRowCountInRange(expandedChildCounts, firstIndex, firstRealIndex) + offsetToFirstRealIndex;
      const rowSection: (TableRow | TableSceletonRow)[] = rows.slice(offset, offset + rowCountToRender);
      rowSection.push(...Array<TableSceletonRow>(rowCountToRender - rowSection.length).fill({ __sceleton_row: true }));
      return rowSection;
    } else {
      const offset = getRowCountInRange(expandedChildCounts, firstRealIndex, firstIndex) - offsetToFirstRealIndex;
      if (offset > rowCountToRender) {
        return Array<TableSceletonRow>(rowCountToRender).fill({ __sceleton_row: true });
      } else {
        const rowSection = [...Array<TableSceletonRow>(offset).fill({ __sceleton_row: true }), ...rows.slice(0, rowCountToRender - offset)];
        if (rowSection.length < rowCountToRender)
          rowSection.push(...Array<TableSceletonRow>(rowCountToRender - rowSection.length).fill({ __sceleton_row: true }));
        return rowSection;
      }
    }
  }, [rows, firstRealIndex, rowCountToRender, offsetToFirstRealIndex, expandedChildCounts]);

  return {
    scrollContainerRef,
    firstRenderedIndex,
    preparedRows
  };
}
