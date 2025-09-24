import type { TableColumn } from '../types/tableTypes';

export interface ColumnWidthConfig {
  /** Width of the drag handle column in pixels */
  dragHandleWidth: number;
  /** Default minimum width for columns without explicit width/minWidth */
  defaultMinColumnWidth: number;
}

/**
 * Calculates the minimum total width required for all columns
 * @param columns Array of table columns
 * @param showDragHandle Whether a drag handle column is shown
 * @param config Configuration for width calculations
 * @returns The minimum total width in pixels
 */
export const calculateMinimumRowWidth = (
  columns: TableColumn[],
  showDragHandle: boolean,
  config: ColumnWidthConfig,
): number => {
  let totalWidth = 0;

  if (showDragHandle) {
    totalWidth += config.dragHandleWidth;
  }

  for (const column of columns) {
    if (column.width) {
      totalWidth += column.width;
    } else if (column.minWidth) {
      totalWidth += column.minWidth;
    } else {
      totalWidth += config.defaultMinColumnWidth;
    }
  }

  return totalWidth;
};
