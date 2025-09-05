import React from 'react';
import type { RowSelectionMode, RowSelectionState } from '../types/tableTypes';
import type { UseRowSelectionReturn } from '../hooks/useRowSelection';

export interface RowSelectionContextValue extends UseRowSelectionReturn {
  selectionMode: RowSelectionMode;
}

const defaultValue: RowSelectionContextValue = {
  selectionMode: 'none',
  selectedRows: new Set<string>(),
  selectRow: () => {},
  deselectRow: () => {},
  toggleRow: () => {},
  clearSelection: () => {},
  isSelected: () => false,
};

export const RowSelectionContext = React.createContext<RowSelectionContextValue>(defaultValue);

interface RowSelectionProviderProps {
  selectionMode: RowSelectionMode;
  selectedRows: RowSelectionState;
  selectRow: (rowId: string) => void;
  deselectRow: (rowId: string) => void;
  toggleRow: (rowId: string) => void;
  clearSelection: () => void;
  isSelected: (rowId: string) => boolean;
  children: React.ReactNode;
}

export function RowSelectionProvider({
  selectionMode,
  selectedRows,
  selectRow,
  deselectRow,
  toggleRow,
  clearSelection,
  isSelected,
  children,
}: RowSelectionProviderProps) {
  const contextValue = React.useMemo<RowSelectionContextValue>(
    () => ({
      selectionMode,
      selectedRows,
      selectRow,
      deselectRow,
      toggleRow,
      clearSelection,
      isSelected,
    }),
    [selectionMode, selectedRows, selectRow, deselectRow, toggleRow, clearSelection, isSelected],
  );

  return <RowSelectionContext.Provider value={contextValue}>{children}</RowSelectionContext.Provider>;
}

export function useRowSelectionContext(): RowSelectionContextValue {
  return React.useContext(RowSelectionContext);
}
