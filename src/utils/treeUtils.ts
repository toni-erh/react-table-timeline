import type { TableRowBase, RowExpansions } from '../types/tableTypes';

/**
 * Generates initial expansion state based on default expansion depth
 */
export function generateInitialExpansions(
  rows: TableRowBase[], 
  defaultExpansionDepth: number | undefined
): RowExpansions {
  return rows.reduce((state, cur) => {
    if (defaultExpansionDepth === 0) return state;
    if (cur.children?.length) {
      state[cur.index] = generateInitialExpansions(
        cur.children, 
        defaultExpansionDepth && defaultExpansionDepth - 1
      );
    }
    return state;
  }, {} as RowExpansions);
}

/**
 * Calculates the total count of expanded child rows
 */
export function getExpandedChildCount(
  rows: TableRowBase[], 
  expansions: RowExpansions | undefined
): number {
  return expansions 
    ? rows.reduce((pre, cur) => 
        cur.children?.length 
          ? pre + getExpandedChildCount(cur.children, expansions[cur.index]) 
          : pre, 
        rows.length
      ) 
    : 0;
}

/**
 * Flattens a tree row with its expanded children into a flat array
 */
export function flattenExpanded(
  row: TableRowBase, 
  expansions: RowExpansions | undefined
): TableRowBase[] {
  return expansions 
    ? [
        row, 
        ...(row.children?.flatMap((child) => 
          flattenExpanded(child, expansions[child.index])
        ) || [])
      ] 
    : [row];
}
