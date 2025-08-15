import React from 'react';
import type { TableRowBase, RowExpansions, ExpandedChildCounts } from '../types/tableTypes';
import { generateInitialExpansions, flattenExpanded } from '../utils/treeUtils';
import { updateExpandedChildCounts, calculateExpandedRowCount, calculateExpandedChildCounts } from '../utils/expansionUtils';

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
  const [rowExpansions, setRowExpansions] = React.useState<RowExpansions>(() => 
    generateInitialExpansions(rows, defaultExpansionDepth)
  );

  // For easy counting of rows before and after visible rows
  const [expandedChildCounts, setExpandedChildCounts] = React.useState<ExpandedChildCounts>(() => 
    calculateExpandedChildCounts(rows, rowExpansions)
  );
  
  React.useEffect(() => {
    setExpandedChildCounts((prev) => updateExpandedChildCounts(prev, rows, rowExpansions));
  }, [rows, rowExpansions]);

  const expandedRowCount = React.useMemo(
    () => calculateExpandedRowCount(rowCount, expandedChildCounts), 
    [rowCount, expandedChildCounts]
  );

  // flattens the rows with expanded children
  const flatRows = React.useMemo(
    () => rows.flatMap((row) => flattenExpanded(row, rowExpansions)), 
    [rows, rowExpansions]
  );

  return {
    rowExpansions,
    setRowExpansions,
    expandedChildCounts,
    expandedRowCount,
    flatRows
  };
}
