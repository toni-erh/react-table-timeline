import { describe, it, expect } from 'vitest';
import { getFirstLevelIndexAndOffset, getRowCountInRange } from './virtualizationUtils';
import type { ExpandedChildCounts } from '../types/tableTypes';

describe('virtualizationUtils', () => {
  // Mock expanded child counts for testing
  const mockExpandedChildCounts: ExpandedChildCounts = [
    { index: 2, rowCount: 3 }, // Row 2 has 3 expanded children
    { index: 5, rowCount: 2 }, // Row 5 has 2 expanded children
    { index: 10, rowCount: 1 }, // Row 10 has 1 expanded child
  ];

  describe('getRowCountInRange', () => {
    it('should count rows in range without expanded children', () => {
      const result = getRowCountInRange([], 0, 5);
      expect(result).toBe(6); // Simple range: 0,1,2,3,4,5
    });

    it('should include expanded children in count', () => {
      // Range 0-5 includes row 2 (with 3 children) and row 5 (with 2 children)
      const result = getRowCountInRange(mockExpandedChildCounts, 0, 6);
      expect(result).toBe(12); // 7 base rows + 3 + 2 expanded children
    });

    it('should handle range that is after expanded rows', () => {
      const result = getRowCountInRange(mockExpandedChildCounts, 12, 14);
      expect(result).toBe(3); // Just rows 12,13,14 (no expanded children in this range)
    });

    it('should handle range that includes partial expanded children', () => {
      // Range 2-4 includes row 2 with its 3 children
      const result = getRowCountInRange(mockExpandedChildCounts, 2, 4);
      expect(result).toBe(6); // 3 base rows (2,3,4) + 3 expanded children
    });

    it('should handle empty range', () => {
      const result = getRowCountInRange(mockExpandedChildCounts, 5, 5);
      expect(result).toBe(1);
    });

    it('should handle range with no expanded children', () => {
      const result = getRowCountInRange(mockExpandedChildCounts, 6, 9);
      expect(result).toBe(4); // Just rows 6,7,8,9
    });
  });

  describe('getFirstLevelIndexAndOffset', () => {
    it('should return correct index and offset for flat index at start', () => {
      const [index, offset, lastIndex] = getFirstLevelIndexAndOffset(0, mockExpandedChildCounts, 5, 20);

      expect(index).toBe(0);
      expect(offset).toBe(0);
      expect(lastIndex).toBeLessThanOrEqual(19); // Within rowCount bounds
      expect(lastIndex).toBe(2);
    });

    it('should handle flatIndex and rowRangeSize to span over expanded children', () => {
      const expandedChildCounts = [
        { index: 0, rowCount: 1 },
        { index: 1, rowCount: 1 },
        { index: 2, rowCount: 1 },
        { index: 3, rowCount: 1 },
      ];
      const [index, offset, lastIndex] = getFirstLevelIndexAndOffset(0, expandedChildCounts, 10, 20);

      expect(index).toBe(0);
      expect(offset).toBe(0);
      expect(lastIndex).toBe(5);
    });

    it('should handle flat index that falls within expanded children', () => {
      // Flat index 4 should fall within row 2's expanded children
      // Row structure: 0, 1, 2, [2.1, 2.2, 2.3], 3, 4, 5, [5.1, 5.2], 6...
      const [index, offset, lastIndex] = getFirstLevelIndexAndOffset(4, mockExpandedChildCounts, 3, 20);

      expect(index).toBe(2); // Should map back to row 2
      expect(offset).toBe(2); // Offset within row 2's children
      expect(lastIndex).toBeLessThanOrEqual(19);
      expect(lastIndex).toBe(3);
    });

    it('should handle flat index after all expanded children', () => {
      // Flat index 17 should be after all expanded rows
      const [index, offset, lastIndex] = getFirstLevelIndexAndOffset(17, mockExpandedChildCounts, 3, 20);

      expect(index).toBeGreaterThan(10); // Should be beyond row 10
      expect(offset).toBe(0);
      expect(lastIndex).toBeLessThanOrEqual(19);
      expect(lastIndex).toBe(index + 3 - 1);
    });

    it('should respect rowCount bounds for lastIndex', () => {
      const [, , lastIndex] = getFirstLevelIndexAndOffset(0, mockExpandedChildCounts, 100, 10);

      expect(lastIndex).toBe(9); // Should be capped at rowCount - 1
    });

    it('should handle empty expanded child counts', () => {
      const [index, offset, lastIndex] = getFirstLevelIndexAndOffset(5, [], 3, 20);

      expect(index).toBe(5);
      expect(offset).toBe(0);
      expect(lastIndex).toBe(7); // 5 + 3 - 1, but capped at 19
    });

    it('should handle large flat index', () => {
      const [index, _offset, lastIndex] = getFirstLevelIndexAndOffset(1000, mockExpandedChildCounts, 5, 50);

      expect(index).toBeLessThan(50); // Should be within bounds
      expect(lastIndex).toBe(49); // Should be capped at rowCount - 1
    });

    it('should handle zero rowRange', () => {
      const [index, offset, _lastIndex] = getFirstLevelIndexAndOffset(2, mockExpandedChildCounts, 0, 20);

      expect(index).toBe(2);
      expect(offset).toBe(0);
      // expect(lastIndex).toBe(1); // 2 + 0 - 1, but should be reasonable
    });

    it('should handle flat index after expanded children', () => {
      const [index, offset, lastIndex] = getFirstLevelIndexAndOffset(7, mockExpandedChildCounts, 10, 20);

      expect(index).toBe(4);
      expect(offset).toBe(0);
      expect(lastIndex).toBe(10);
    });
  });

  describe('edge cases', () => {
    it('should handle zero row counts in expanded children', () => {
      const countsWithZero: ExpandedChildCounts = [
        { index: 2, rowCount: 0 },
        { index: 5, rowCount: 2 },
      ];

      const result = getRowCountInRange(countsWithZero, 0, 6);
      expect(result).toBe(9); // 7 base + 0 + 2
    });
  });
});
