import React from 'react';
import type { RowSelectionMode, RowSelectionState, RowSelectionChangeEvent } from '../types/tableTypes';

export interface UseRowSelectionReturn {
  selectedRows: RowSelectionState;
  selectRow: (rowId: string) => void;
  deselectRow: (rowId: string) => void;
  toggleRow: (rowId: string) => void;
  clearSelection: () => void;
  isSelected: (rowId: string) => boolean;
}

/**
 * Hook for managing row selection state in both controlled and uncontrolled modes
 */
export function useRowSelection(
  selectionMode: RowSelectionMode,
  controlledSelectedRows?: RowSelectionState,
  defaultSelectedRows?: RowSelectionState,
  onSelectionChange?: (event: RowSelectionChangeEvent) => void,
): UseRowSelectionReturn {
  // Internal state for uncontrolled mode
  const [internalSelectedRows, setInternalSelectedRows] = React.useState<RowSelectionState>(
    () => defaultSelectedRows || new Set<string>(),
  );

  // Determine if we're in controlled mode
  const isControlled = controlledSelectedRows !== undefined;
  const selectedRows = isControlled ? controlledSelectedRows : internalSelectedRows;

  // Helper function to create selection change event
  const createSelectionEvent = React.useCallback(
    (
      newSelectedRows: RowSelectionState,
      changedRow: string,
      action: 'select' | 'deselect',
    ): RowSelectionChangeEvent => ({
      selectedRows: newSelectedRows,
      changedRow,
      action,
    }),
    [],
  );

  // Selection action handlers
  const selectRow = React.useCallback(
    (rowId: string) => {
      if (selectionMode === 'none') return;

      const newSelectedRows = new Set(selectedRows);

      if (selectionMode === 'single') {
        // In single mode, replace any existing selection
        newSelectedRows.clear();
      }

      newSelectedRows.add(rowId);

      if (!isControlled) {
        setInternalSelectedRows(newSelectedRows);
      }

      onSelectionChange?.(createSelectionEvent(newSelectedRows, rowId, 'select'));
    },
    [selectedRows, selectionMode, isControlled, onSelectionChange, createSelectionEvent],
  );

  const deselectRow = React.useCallback(
    (rowId: string) => {
      if (selectionMode === 'none') return;

      const newSelectedRows = new Set(selectedRows);
      newSelectedRows.delete(rowId);

      if (!isControlled) {
        setInternalSelectedRows(newSelectedRows);
      }

      onSelectionChange?.(createSelectionEvent(newSelectedRows, rowId, 'deselect'));
    },
    [selectedRows, selectionMode, isControlled, onSelectionChange, createSelectionEvent],
  );

  const toggleRow = React.useCallback(
    (rowId: string) => {
      if (selectedRows.has(rowId)) {
        deselectRow(rowId);
      } else {
        selectRow(rowId);
      }
    },
    [selectedRows, deselectRow, selectRow],
  );

  const clearSelection = React.useCallback(() => {
    if (selectionMode === 'none') return;

    const newSelectedRows = new Set<string>();

    if (!isControlled) {
      setInternalSelectedRows(newSelectedRows);
    }

    // For clear action, we use the first selected row as changedRow for the event
    // If no rows were selected, we pass an empty string
    const changedRow = selectedRows.size > 0 ? Array.from(selectedRows)[0] : '';

    onSelectionChange?.(createSelectionEvent(newSelectedRows, changedRow, 'deselect'));
  }, [selectionMode, isControlled, onSelectionChange, createSelectionEvent, selectedRows]);

  const isSelected = React.useCallback((rowId: string) => selectedRows.has(rowId), [selectedRows]);

  return {
    selectedRows,
    selectRow,
    deselectRow,
    toggleRow,
    clearSelection,
    isSelected,
  };
}
