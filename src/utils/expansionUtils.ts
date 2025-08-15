import type { TableRowBase, RowExpansions, ExpandedChildCounts } from '../types/tableTypes';
import { getExpandedChildCount } from './treeUtils';

/**
 * Calculates expanded child counts for all rows with children
 */
export function calculateExpandedChildCounts(
  rows: TableRowBase[],
  rowExpansions: RowExpansions
): ExpandedChildCounts {
  const result: ExpandedChildCounts = [];
  
  rows.forEach((row) => {
    if (!row.children?.length) return;
    
    const expansion = rowExpansions.get(row.id);
    if (!expansion || !expansion.isExpanded) return;
    
    const childCount = getExpandedChildCount(row.children, rowExpansions);
    if (childCount > 0) {
      result.push({
        index: row.index,
        rowCount: childCount
      });
    }
  });
  
  return result;
}

/**
 * Updates expanded child counts efficiently by merging with previous state
 */
export function updateExpandedChildCounts(
  prevChildCounts: ExpandedChildCounts,
  rows: TableRowBase[],
  rowExpansions: RowExpansions
): ExpandedChildCounts {
  let hasChanged = false;
  const updatedChildCounts: ExpandedChildCounts = [];
  const iterator = prevChildCounts.values();
  
  let next = iterator.next();
  
  // Copy rows that are not in the new list
  while (!next.done && next.value.index < rows[0]?.index) {
    updatedChildCounts.push(next.value);
    next = iterator.next();
  }
  
  // Update rows that are in the new list
  rows.forEach((row) => {
    while (!next.done && next.value.index < row.index) {
      next = iterator.next();
    }
    
    if (row.children?.length) {
      const expansion = rowExpansions.get(row.id);
      const childCount = expansion?.isExpanded 
        ? getExpandedChildCount(row.children, rowExpansions)
        : 0;
      
      // Check if the child count has changed
      if (next.value?.index === row.index) {
        if (next.value.rowCount !== childCount) {
          hasChanged = true;
          if (childCount > 0) {
            updatedChildCounts.push({
              index: row.index,
              rowCount: childCount
            });
          }
        } else {
          updatedChildCounts.push(next.value);
        }
        next = iterator.next();
      } else if (childCount > 0) {
        // New row with children
        hasChanged = true;
        updatedChildCounts.push({
          index: row.index,
          rowCount: childCount
        });
      }
    } else if (next.value?.index === row.index) {
      // Row no longer has children
      hasChanged = true;
      next = iterator.next();
    }
  });
  
  // Copy remaining rows that are not in the new list
  while (!next.done) {
    updatedChildCounts.push(next.value);
    next = iterator.next();
  }
  
  return hasChanged ? updatedChildCounts : prevChildCounts;
}

/**
 * Calculates total expanded row count including children
 */
export function calculateExpandedRowCount(
  baseRowCount: number,
  expandedChildCounts: ExpandedChildCounts
): number {
  return baseRowCount + expandedChildCounts.reduce((pre, cur) => pre + cur.rowCount, 0);
}