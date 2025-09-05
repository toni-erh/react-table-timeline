import type { TableRowBase, RowExpansions, RowExpansionData } from '../types/tableTypes';
import { areArraysEqual } from './arrayUtils';

/**
 * Generates initial expansion state based on default expansion depth
 */
export function generateInitialExpansions(
  rows: TableRowBase[],
  defaultExpansionDepth: number | undefined,
  parentId: string | undefined = undefined,
): RowExpansions {
  const expansions = new Map<string, RowExpansionData>();

  rows.forEach((row, i) => {
    const childrenIds = row.children?.map((child) => child.id) || [];
    const isExpanded = defaultExpansionDepth === undefined || defaultExpansionDepth > 0;

    // Add current row's expansion state
    expansions.set(row.id, {
      isExpanded,
      childrenIds,
      parentId,
      prevSiblingId: i > 0 ? rows[i - 1].id : undefined,
      nextSiblingId: i < rows.length - 1 ? rows[i + 1].id : undefined,
    });

    // Recursively add children's expansion states if expanded
    if (isExpanded && row.children?.length) {
      const childExpansions = generateInitialExpansions(
        row.children,
        defaultExpansionDepth && defaultExpansionDepth - 1,
        row.id,
      );

      // Merge child expansions into the main map
      for (const [key, value] of childExpansions.entries()) {
        expansions.set(key, value);
      }
    }
  });

  return expansions;
}

/**
 * Updates the expansion state for the given rows
 * @param expansions current expansion state
 * @param rows new row data
 * @returns updated expansion state
 */
export function updateExpansions(expansions: RowExpansions, rows: TableRowBase[]): RowExpansions {
  const newExpansions = new Map(expansions);
  let changed = false;

  const updateOrAdd = (
    row: TableRowBase,
    parentId: string | undefined,
    prevSiblingId: string | undefined,
    nextSiblingId: string | undefined,
  ) => {
    const expansion = newExpansions.get(row.id);
    const childrenIds = row.children?.map((child) => child.id) || [];
    if (expansion) {
      if (expansion.parentId !== parentId || !areArraysEqual(expansion.childrenIds, childrenIds)) {
        newExpansions.set(row.id, {
          ...expansion,
          parentId,
          childrenIds,
        });
        changed = true;
      }
    } else {
      newExpansions.set(row.id, {
        isExpanded: false,
        childrenIds,
        parentId,
        prevSiblingId,
        nextSiblingId,
      });
      changed = true;
    }
    row.children?.forEach((child, i) =>
      updateOrAdd(child, row.id, row.children?.[i - 1]?.id, row.children?.[i + 1]?.id),
    );
  };

  rows.forEach((row, i) => {
    updateOrAdd(row, undefined, rows[i - 1]?.id, rows[i + 1]?.id);
  });

  return changed ? newExpansions : expansions;
}

/**
 * Calculates the total count of expanded child rows (including the row itself)
 */
export function getExpandedChildCount(rows: TableRowBase[], expansions: RowExpansions | undefined): number {
  if (!expansions) return 0;

  return rows.reduce((count, row) => {
    const expansion = expansions.get(row.id);
    if (!expansion) return count + 1; // Count as 1 if not in expansions (shouldn't happen)

    if (!expansion.isExpanded || !row.children?.length) {
      return count + 1; // Count the row itself
    }

    // Count this row plus all expanded children
    return count + 1 + getExpandedChildCount(row.children, expansions);
  }, 0);
}

/**
 * Flattens a tree row followed by its expanded children into a flat array
 */
export function flattenExpanded(row: TableRowBase, expansions: RowExpansions | undefined): TableRowBase[] {
  if (!expansions) return [row];

  const expansion = expansions.get(row.id);
  if (!expansion || !expansion.isExpanded || !row.children?.length) {
    return [row];
  }

  return [row, ...row.children.flatMap((child) => flattenExpanded(child, expansions))];
}

export function toggleExpansion(expansions: RowExpansions, rowId: string): RowExpansions {
  const expansion = expansions.get(rowId);
  if (!expansion) return expansions;

  return new Map(expansions).set(rowId, {
    ...expansion,
    isExpanded: !expansion.isExpanded,
  });
}

export function computePath(expansions: RowExpansions, rowId: string): string[] {
  const path: string[] = [];
  let current: string | undefined = rowId;
  while (current) {
    path.push(current);
    const parentId: string | undefined = expansions.get(current)?.parentId;
    current = parentId;
  }
  return path.reverse();
}
