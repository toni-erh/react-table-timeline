import React from 'react';
import type { TableRowBase, RowExpansions, ExpandedChildCounts } from '../types/tableTypes';
import { generateInitialExpansions, flattenExpanded, updateExpansions } from '../utils/treeUtils';
import {
  updateExpandedChildCounts,
  calculateExpandedRowCount,
  calculateExpandedChildCounts,
} from '../utils/expansionUtils';

interface UseTreeExpansionReturn<TableRow extends TableRowBase> {
  rowExpansions: RowExpansions;
  setRowExpansions: React.Dispatch<React.SetStateAction<RowExpansions>>;
  expandedChildCounts: ExpandedChildCounts;
  expandedRowCount: number;
  flatRows: TableRow[];
}

/**
 * Hook for managing table row expansion state and calculations
 */
export function useTreeExpansion<TableRow extends TableRowBase>(
  rows: TableRow[],
  rowCount: number,
  defaultExpansionDepth?: number,
): UseTreeExpansionReturn<TableRow> {
  // For tracking which rows are expanded
  const [rowExpansions, setRowExpansions] = React.useState<RowExpansions>(() =>
    generateInitialExpansions(rows, defaultExpansionDepth),
  );

  // For easy counting of rows before and after visible rows
  const [expandedChildCounts, setExpandedChildCounts] = React.useState<ExpandedChildCounts>(() =>
    calculateExpandedChildCounts(rows, rowExpansions),
  );

  React.useEffect(() => {
    setRowExpansions((prev) => updateExpansions(prev, rows));
  }, [rows]);

  React.useEffect(() => {
    setExpandedChildCounts((prev) => updateExpandedChildCounts(prev, rows, rowExpansions));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowExpansions]);

  const expandedRowCount = React.useMemo(
    () => calculateExpandedRowCount(rowCount, expandedChildCounts),
    [rowCount, expandedChildCounts],
  );

  // flattens the rows with expanded children
  const flatRows = React.useMemo(
    () => rows.flatMap((row) => flattenExpanded(row, rowExpansions)),
    [rows, rowExpansions],
  );

  return {
    rowExpansions,
    setRowExpansions,
    expandedChildCounts,
    expandedRowCount,
    flatRows: flatRows as TableRow[],
  };
}
