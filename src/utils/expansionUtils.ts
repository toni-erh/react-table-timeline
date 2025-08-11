import type { TableRowBase, RowExpansions, ExpandedChildCounts } from '../types/tableTypes';
import { getExpandedChildCount } from './treeUtils';

/**
 * Calculates expanded child counts for all rows with children
 */
export function calculateExpandedChildCounts(
  rows: TableRowBase[],
  rowExpansions: RowExpansions
): ExpandedChildCounts {
  return rows.reduce(
    (state, cur) => cur.children?.length 
      ? state.concat({
          index: cur.index,
          rowCount: getExpandedChildCount(cur.children, rowExpansions[cur.index])
        }) 
      : state,
    [] as ExpandedChildCounts
  );
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
      const childCount = getExpandedChildCount(row.children, rowExpansions[row.index]);
      if (!hasChanged && next.value?.index === row.index && next.value.rowCount !== childCount) {
        hasChanged = true;
      }
      if (childCount) {
        updatedChildCounts.push({
          index: row.index,
          rowCount: childCount
        });
        if (!hasChanged && next.value?.index !== row.index) {
          hasChanged = true;
        }
      }
    } else {
      if (!hasChanged && next.value?.index === row.index && next.value.rowCount !== 0) {
        hasChanged = true;
      }
    }
    if (!next.done && next.value.index <= row.index) {
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

/**
 * Calculates initial expanded child counts for all rows with children
 */
export function calculateInitialExpandedChildCounts(
  rows: TableRowBase[],
  rowExpansions: RowExpansions
): ExpandedChildCounts {
  return rows.reduce(
    (state, cur) => cur.children?.length ? state.concat({
      index: cur.index,
      rowCount: getExpandedChildCount(cur.children, rowExpansions[cur.index])
    }) : state,
    [] as ExpandedChildCounts
  );
}