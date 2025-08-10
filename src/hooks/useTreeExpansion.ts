import React from 'react';
import type { TableRowBase, RowExpansions, ExpandedChildCounts } from '../types/tableTypes';
import { generateInitialExpansions, getExpandedChildCount, flattenExpanded } from '../utils/treeUtils';
import { updateExpandedChildCounts, calculateExpandedRowCount } from '../utils/expansionUtils';

const showTiming = false;

interface UseTreeExpansionReturn {
  rowExpansions: RowExpansions;
  setRowExpansions: React.Dispatch<React.SetStateAction<RowExpansions>>;
  expandedChildCounts: ExpandedChildCounts;
  expandedRowCount: number;
  flatRows: TableRowBase[];
}

/**
 * Hook for managing table row expansion state and calculations
 */
export function useTreeExpansion(
  rows: TableRowBase[],
  rowCount: number,
  defaultExpansionDepth?: number
): UseTreeExpansionReturn {
  // For tracking which rows are expanded
  const [rowExpansions, setRowExpansions] = React.useState<RowExpansions>(() => {
    showTiming && console.time("getInitialExpansions");
    const initialExpansions = generateInitialExpansions(rows, defaultExpansionDepth);
    showTiming && console.timeEnd("getInitialExpansions");
    return initialExpansions;
  });

  // For easy counting of rows before and after visible rows
  const [expandedChildCounts, setExpandedChildCounts] = React.useState<ExpandedChildCounts>(() => {
    showTiming && console.time("getExpandedChildCounts");
    const childCounts = rows.reduce(
      (state, cur) => cur.children?.length ? state.concat({
        index: cur.index,
        rowCount: getExpandedChildCount(cur.children, rowExpansions[cur.index])
      }) : state,
      [] as ExpandedChildCounts
    );
    showTiming && console.timeEnd("getExpandedChildCounts");
    return childCounts;
  });

  React.useEffect(() => {
    showTiming && console.time("updateExpandedChildCounts");

    setExpandedChildCounts((prev) => 
      updateExpandedChildCounts(prev, rows, rowExpansions)
    );

    showTiming && console.timeEnd("updateExpandedChildCounts");
  }, [rows, rowExpansions]);

  const expandedRowCount = React.useMemo(() => {
    showTiming && console.time("getExpandedRowCount");
    const result = calculateExpandedRowCount(rowCount, expandedChildCounts);
    showTiming && console.timeEnd("getExpandedRowCount");
    return result;
  }, [rowCount, expandedChildCounts]);

  // flattens the rows with expanded children
  const flatRows = React.useMemo(() => {
    showTiming && console.time("flattenExpanded");
    const result = rows.flatMap((row) => flattenExpanded(row, rowExpansions[row.index]));
    showTiming && console.timeEnd("flattenExpanded");
    return result;
  }, [rows, rowExpansions]);

  return {
    rowExpansions,
    setRowExpansions,
    expandedChildCounts,
    expandedRowCount,
    flatRows
  };
}
