import type { TableRowBase, TableSceletonRow, ExpandedChildCounts } from '../types/tableTypes';
import { getRowCountInRange } from './virtualizationUtils';

/**
 * Prepares rows for virtualized rendering based on current scroll position and indices
 */
export function prepareVirtualizedRows<TableRow extends TableRowBase>(
  rows: Array<TableRow>,
  firstRealIndex: number,
  offsetToFirstRealIndex: number,
  rowCountToRender: number,
  expandedChildCounts: ExpandedChildCounts
): Array<TableRow | TableSceletonRow> {
  if (rows.length === 0) return [];

  const firstIndex = rows[0].index;
  if (firstIndex === undefined) {
    throw Error(`All rows require an 'index'! It is missing for: ${JSON.stringify(rows[0])}`);
  }

  // Case 1: Direct slice when indices match
  if (firstRealIndex === firstIndex) {
    const rowSection: (TableRow | TableSceletonRow)[] = rows.slice(
      offsetToFirstRealIndex,
      offsetToFirstRealIndex + rowCountToRender
    );
    rowSection.push(...Array<TableSceletonRow>(rowCountToRender - rowSection.length).fill({ __sceleton_row: true }));
    return rowSection;
  }

  // Case 2: First index is before real index - calculate offset
  if (firstIndex < firstRealIndex) {
    const offset = getRowCountInRange(expandedChildCounts, firstIndex, firstRealIndex - 1) + offsetToFirstRealIndex;
    const rowSection: (TableRow | TableSceletonRow)[] = rows.slice(offset, offset + rowCountToRender);
    rowSection.push(...Array<TableSceletonRow>(rowCountToRender - rowSection.length).fill({ __sceleton_row: true }));
    return rowSection;
  }

  // Case 3: First index is after real index - handle with skeleton rows
  const offset = getRowCountInRange(expandedChildCounts, firstRealIndex, firstIndex) - 1 - offsetToFirstRealIndex;

  if (offset > rowCountToRender) {
    return Array<TableSceletonRow>(rowCountToRender).fill({ __sceleton_row: true });
  }

  const rowSection = [
    ...Array<TableSceletonRow>(offset).fill({ __sceleton_row: true }),
    ...rows.slice(0, rowCountToRender - offset)
  ];

  if (rowSection.length < rowCountToRender) {
    rowSection.push(...Array<TableSceletonRow>(rowCountToRender - rowSection.length).fill({ __sceleton_row: true }));
  }

  return rowSection;
}
