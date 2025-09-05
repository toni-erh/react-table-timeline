import React from 'react';
import type { RowExpansionData, RowExpansions } from '../types/tableTypes';
import { toggleExpansion as toggleExpansionUtil } from '../utils/treeUtils';

export interface RowExpansionContextValue {
  rowExpansions: RowExpansions;
  setRowExpansions: React.Dispatch<React.SetStateAction<RowExpansions>>;
  isExpanded: (id: string) => boolean;
  toggle: (id: string) => void;
  expand: (id: string) => void;
  collapse: (id: string) => void;
  getLevel: (id: string) => number;
}

const defaultValue: RowExpansionContextValue = {
  rowExpansions: new Map<string, RowExpansionData>(),
  setRowExpansions: () => {},
  isExpanded: () => false,
  toggle: () => {},
  expand: () => {},
  collapse: () => {},
  getLevel: () => 0,
};

export const RowExpansionContext = React.createContext<RowExpansionContextValue>(defaultValue);

interface RowExpansionProviderProps {
  rowExpansions: RowExpansions;
  setRowExpansions: React.Dispatch<React.SetStateAction<RowExpansions>>;
  children: React.ReactNode;
}

export function RowExpansionProvider({
  rowExpansions,
  setRowExpansions,
  children,
}: RowExpansionProviderProps) {
  const isExpanded = React.useCallback((id: string) => !!rowExpansions.get(id)?.isExpanded, [rowExpansions]);

  const toggle = React.useCallback(
    (id: string) => {
      setRowExpansions((prev) => toggleExpansionUtil(prev, id));
    },
    [setRowExpansions],
  );

  const expand = React.useCallback(
    (id: string) => {
      setRowExpansions((prev) => {
        const exp = prev.get(id);
        if (!exp || exp.isExpanded) return prev;
        const next = new Map(prev);
        next.set(id, { ...exp, isExpanded: true });
        return next;
      });
    },
    [setRowExpansions],
  );

  const collapse = React.useCallback(
    (id: string) => {
      setRowExpansions((prev) => {
        const exp = prev.get(id);
        if (!exp || !exp.isExpanded) return prev;
        const next = new Map(prev);
        next.set(id, { ...exp, isExpanded: false });
        return next;
      });
    },
    [setRowExpansions],
  );

  // Compute indentation level on demand using parentId; memoized per rowExpansions reference
  const getLevel = React.useMemo(() => {
    const cache = new Map<string, number>();
    const compute = (id: string): number => {
      const cached = cache.get(id);
      if (cached !== undefined) return cached;
      const exp = rowExpansions.get(id);
      if (!exp || !exp.parentId) {
        cache.set(id, 0);
        return 0;
      }
      const lvl = 1 + compute(exp.parentId);
      cache.set(id, lvl);
      return lvl;
    };
    return compute;
  }, [rowExpansions]);

  const value = React.useMemo<RowExpansionContextValue>(
    () => ({
      rowExpansions,
      setRowExpansions,
      isExpanded,
      toggle,
      expand,
      collapse,
      getLevel,
    }),
    [rowExpansions, setRowExpansions, isExpanded, toggle, expand, collapse, getLevel],
  );

  return <RowExpansionContext.Provider value={value}>{children}</RowExpansionContext.Provider>;
}

export function useRowExpansion() {
  return React.useContext(RowExpansionContext);
}
