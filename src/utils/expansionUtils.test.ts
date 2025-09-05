import { describe, it, expect } from 'vitest';
import {
  calculateExpandedChildCounts,
  updateExpandedChildCounts,
  calculateExpandedRowCount,
} from './expansionUtils';
import type { TableRowBase, RowExpansions, ExpandedChildCounts } from '../types/tableTypes';

describe('expansionUtils', () => {
  // Mock test data
  const mockRows: TableRowBase[] = [
    {
      index: 0,
      id: '0',
      children: [
        {
          index: 0,
          id: '0-0',
          children: [
            { index: 0, id: '0-0-0' },
            { index: 1, id: '0-0-1', children: [{ index: 0, id: '0-0-1-0' }] },
          ],
        },
        { index: 1, id: '0-1', children: [] },
      ],
    },
    { index: 1, id: '1', children: [] },
    { index: 2, id: '2', children: [{ index: 0, id: '2-0' }] },
  ];

  describe('calculateExpandedChildCounts', () => {
    it('should calculate child counts for expanded rows', () => {
      const expansions: RowExpansions = new Map();
      expansions.set('0', {
        isExpanded: true,
        childrenIds: ['0-0', '0-1'],
        parentId: undefined,
        prevSiblingId: undefined,
        nextSiblingId: '1',
      });
      expansions.set('2', {
        isExpanded: true,
        childrenIds: ['2-0'],
        parentId: undefined,
        prevSiblingId: '1',
        nextSiblingId: undefined,
      });
      const result = calculateExpandedChildCounts(mockRows, expansions);

      expect(result).toEqual([
        { index: 0, rowCount: 2 }, // 2 direct children
        { index: 2, rowCount: 1 }, // 1 direct child
      ]);
    });

    it('should include nested children when deeply expanded', () => {
      const expansions: RowExpansions = new Map();
      expansions.set('0', {
        isExpanded: true,
        childrenIds: ['0-0', '0-1'],
        parentId: undefined,
        prevSiblingId: undefined,
        nextSiblingId: '1',
      });
      expansions.set('0-0', {
        isExpanded: true,
        childrenIds: ['0-0-0', '0-0-1'],
        parentId: '0',
        prevSiblingId: undefined,
        nextSiblingId: '0-1',
      });
      const result = calculateExpandedChildCounts(mockRows, expansions);

      expect(result).toEqual([
        { index: 0, rowCount: 4 }, // 2 direct + 2 nested children
      ]);
    });

    it('should return empty array when no expansions', () => {
      const result = calculateExpandedChildCounts(mockRows, new Map());
      expect(result).toEqual([]);
    });

    it('should handle empty rows array', () => {
      const result = calculateExpandedChildCounts([], new Map());
      expect(result).toEqual([]);
    });

    it('should return empty array when no rows have children', () => {
      const rowsWithoutChildren: TableRowBase[] = [
        { index: 0, id: '0' },
        { index: 1, id: '1' },
      ];
      const expansions: RowExpansions = new Map();
      expansions.set('0', {
        isExpanded: true,
        childrenIds: [],
        parentId: undefined,
        prevSiblingId: undefined,
        nextSiblingId: '1',
      });
      expansions.set('0-0', {
        isExpanded: true,
        childrenIds: [],
        parentId: '0',
        prevSiblingId: undefined,
        nextSiblingId: '0-1',
      });

      const result = calculateExpandedChildCounts(rowsWithoutChildren, expansions);
      expect(result).toEqual([]);
    });

    it('should handle rows with empty children arrays', () => {
      const rowsWithEmptyChildren: TableRowBase[] = [
        { index: 0, id: '0', children: [] },
        { index: 1, id: '1', children: [{ index: 2, id: '1-0' }] },
      ];
      const expansions: RowExpansions = new Map();
      expansions.set('1', {
        isExpanded: true,
        childrenIds: ['1-0'],
        parentId: undefined,
        prevSiblingId: '0',
        nextSiblingId: undefined,
      });
      expansions.set('1-0', {
        isExpanded: true,
        childrenIds: [],
        parentId: '1',
        prevSiblingId: undefined,
        nextSiblingId: undefined,
      });

      const result = calculateExpandedChildCounts(rowsWithEmptyChildren, expansions);
      expect(result).toEqual([{ index: 1, rowCount: 1 }]);
    });
  });

  describe('updateExpandedChildCounts', () => {
    it('should update existing child counts', () => {
      const prevCounts: ExpandedChildCounts = [
        { index: 0, rowCount: 2 },
        { index: 6, rowCount: 1 },
      ];
      const expansions: RowExpansions = new Map();
      expansions.set('0', {
        isExpanded: true,
        childrenIds: ['0-0', '0-1'],
        parentId: undefined,
        prevSiblingId: undefined,
        nextSiblingId: '1',
      });
      expansions.set('0-0', {
        isExpanded: true,
        childrenIds: ['0-0-0', '0-0-1'],
        parentId: '0',
        prevSiblingId: undefined,
        nextSiblingId: '0-1',
      });

      const result = updateExpandedChildCounts(prevCounts, mockRows, expansions);

      expect(result).toEqual([
        { index: 0, rowCount: 4 }, // Updated count with nested children
        { index: 6, rowCount: 1 },
      ]);
    });

    it('should return same reference when no changes', () => {
      const prevCounts: ExpandedChildCounts = [{ index: 0, rowCount: 4 }];
      const expansions: RowExpansions = new Map();
      expansions.set('0', {
        isExpanded: true,
        childrenIds: ['0-0', '0-1'],
        parentId: undefined,
        prevSiblingId: undefined,
        nextSiblingId: '1',
      });
      expansions.set('0-0', {
        isExpanded: true,
        childrenIds: ['0-0-0', '0-0-1'],
        parentId: '0',
        prevSiblingId: undefined,
        nextSiblingId: '0-1',
      });

      const result = updateExpandedChildCounts(prevCounts, mockRows, expansions);

      expect(result).toBe(prevCounts); // Same reference for performance
    });

    it('should add new expanded rows', () => {
      const prevCounts: ExpandedChildCounts = [{ index: 0, rowCount: 4 }];
      const expansions: RowExpansions = new Map();
      expansions.set('0', {
        isExpanded: true,
        childrenIds: ['0-0', '0-1'],
        parentId: undefined,
        prevSiblingId: undefined,
        nextSiblingId: '1',
      });
      expansions.set('0-0', {
        isExpanded: true,
        childrenIds: ['0-0-0', '0-0-1'],
        parentId: '0',
        prevSiblingId: undefined,
        nextSiblingId: '0-1',
      });
      expansions.set('2', {
        isExpanded: true,
        childrenIds: ['2-0'],
        parentId: undefined,
        prevSiblingId: '1',
        nextSiblingId: undefined,
      });

      const result = updateExpandedChildCounts(prevCounts, mockRows, expansions);

      expect(result).toEqual([
        { index: 0, rowCount: 4 },
        { index: 2, rowCount: 1 },
      ]);
    });

    it('should remove collapsed rows', () => {
      const prevCounts: ExpandedChildCounts = [
        { index: 0, rowCount: 4 },
        { index: 2, rowCount: 1 },
      ];
      const expansions: RowExpansions = new Map();
      expansions.set('0', {
        isExpanded: true,
        childrenIds: ['0-0', '0-1'],
        parentId: undefined,
        prevSiblingId: undefined,
        nextSiblingId: '1',
      });
      expansions.set('2', {
        isExpanded: false,
        childrenIds: ['2-0'],
        parentId: undefined,
        prevSiblingId: '1',
        nextSiblingId: undefined,
      });

      const result = updateExpandedChildCounts(prevCounts, mockRows, expansions);

      expect(result).toEqual([{ index: 0, rowCount: 2 }]);
    });
  });

  describe('calculateExpandedRowCount', () => {
    it('should calculate total row count including expanded children', () => {
      const baseRowCount = 3;
      const expandedChildCounts: ExpandedChildCounts = [
        { index: 0, rowCount: 2 },
        { index: 6, rowCount: 1 },
      ];

      const result = calculateExpandedRowCount(baseRowCount, expandedChildCounts);
      expect(result).toBe(6); // 3 base + 2 + 1 expanded
    });

    it('should return base count when no expanded children', () => {
      const result = calculateExpandedRowCount(5, []);
      expect(result).toBe(5);
    });

    it('should handle zero base count', () => {
      const expandedChildCounts: ExpandedChildCounts = [{ index: 0, rowCount: 3 }];

      const result = calculateExpandedRowCount(0, expandedChildCounts);
      expect(result).toBe(3);
    });
  });
});
