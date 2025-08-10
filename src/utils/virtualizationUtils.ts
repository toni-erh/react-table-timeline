import type { ExpandedChildCounts, TableRowBase, TableSceletonRow } from '../types/tableTypes';

/**
 * Type guard to check if a row is a data row (not a skeleton row)
 */
export function isDataRow<TableRow extends TableRowBase>(
  row: TableRow | TableSceletonRow
): row is TableRow {
  return !(row as TableSceletonRow).__sceleton_row;
}

/**
 * Calculates the first level index and offset for virtualization
 * Returns [firstLevelIndex, offset, lastRealIndex]
 */
export function getFirstLevelIndexAndOffset(
  flatIndex: number, 
  expandedChildCounts: ExpandedChildCounts, 
  rowRange: number,
  rowCount: number
): [number, number, number] {
  const result = expandedChildCounts.reduce((pre: { 
    index: number; 
    offset: number; 
    childCount: number; 
    endIndex: number; 
    coveredRange: number; 
    lastIndex: number; 
  }, cur) => {
    // If we have already found the end index, we can stop
    if (pre.endIndex >= 0) return pre;

    // If offset is 0 or higher, we found the start index and only need to find the end index
    if (pre.offset >= 0) {
      pre.coveredRange += cur.index + cur.rowCount - pre.lastIndex;
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
      pre.coveredRange = cur.rowCount - currentOffset;

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
    if (currentOffset <= cur.rowCount) {
      pre.index = cur.index;
      pre.offset = currentOffset;
      pre.childCount += cur.rowCount;
      if (cur.rowCount - currentOffset > rowRange) {
        pre.endIndex = cur.index;
      }
      pre.coveredRange = cur.rowCount - currentOffset;
      return pre;
    }

    pre.childCount += cur.rowCount;
    return pre;
  }, { index: -1, offset: -1, childCount: 0, endIndex: -1, coveredRange: -1, lastIndex: 0 });

  if (result.index === -1) {
    result.index = flatIndex - result.childCount;
    result.offset = 0;
  }
  if (result.endIndex === -1) {
    if (result.index <= result.lastIndex) {
      result.endIndex = result.lastIndex + rowRange - result.coveredRange;
    } else {
      result.endIndex = result.index + rowRange;
    }
  }

  // Calculate final lastRealIndex with rowCount boundary
  const lastRealIndex = Math.min(result.endIndex, rowCount - 1);
  
  return [result.index, result.offset, lastRealIndex];
}

/**
 * Calculates the row count within a specified range considering expanded children
 */
export function getRowCountInRange(
  expandedChildCounts: ExpandedChildCounts, 
  firstIndex: number, 
  lastIndex: number
): number {
  return expandedChildCounts.reduce((pre, cur) => {
    if (cur.index < firstIndex) return pre;
    if (cur.index >= lastIndex) {
      if (pre.index >= lastIndex) return pre;
      pre.rowCount += lastIndex - pre.index - 1;
      pre.index = cur.index;
      return pre;
    }

    if (pre.index === -1) {
      pre.rowCount += 1;
    } else {
      pre.rowCount += cur.index - pre.index;
    }
    pre.rowCount += cur.rowCount;
    pre.index = cur.index;
    return pre;
  }, { index: -1, rowCount: 0 }).rowCount;
}
