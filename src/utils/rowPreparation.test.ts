import { describe, it, expect } from 'vitest';
import { prepareVirtualizedRows } from './rowPreparation';
import type { TableRowBase, ExpandedChildCounts } from '../types/tableTypes';

describe('rowPreparation', () => {
  // Mock test data
  const mockRows: TableRowBase[] = [
    { index: 0, id: '0' },
    { index: 1, id: '1' },
    { index: 0, id: '1-0' },
    { index: 1, id: '1-1' },
    { index: 2, id: '2' },
    { index: 3, id: '3' },
    { index: 0, id: '3-0' },
    { index: 4, id: '4' },
  ];

  const mockExpandedChildCounts: ExpandedChildCounts = [
    { index: 1, rowCount: 2 },
    { index: 3, rowCount: 1 },
  ];

  describe('prepareVirtualizedRows', () => {
    it('should return empty array for empty rows', () => {
      const result = prepareVirtualizedRows([], 0, 0, 3, []);
      expect(result).toEqual([]);
    });

    it('should throw error for rows without index', () => {
      const rowsWithoutIndex = [{ id: 'Invalid' }] as any;

      expect(() => {
        prepareVirtualizedRows(rowsWithoutIndex, 0, 0, 3, []);
      }).toThrow("All rows require an 'index'!");
    });

    describe('Case 1: Direct slice when indices match', () => {
      it('should return direct slice when firstRealIndex equals firstIndex', () => {
        const result = prepareVirtualizedRows(mockRows, 0, 0, 3, mockExpandedChildCounts);

        expect(result).toHaveLength(3);
        expect(result[0]).toBe(mockRows[0]); // Direct slice from offset 0
        expect(result[1]).toBe(mockRows[1]);
        expect(result[2]).toBe(mockRows[2]);
      });

      it('should add skeleton rows when not enough data rows', () => {
        const result = prepareVirtualizedRows(mockRows.slice(0, 2), 0, 0, 5, []);

        expect(result).toHaveLength(5);
        expect(result[0]).toBe(mockRows[0]);
        expect(result[1]).toBe(mockRows[1]);
        expect(result[2]).toEqual({ __skeleton_row: true });
        expect(result[3]).toEqual({ __skeleton_row: true });
        expect(result[4]).toEqual({ __skeleton_row: true });
      });

      it('should handle offset in direct slice', () => {
        const result = prepareVirtualizedRows(mockRows, 2, 1, 2, []);

        expect(result).toHaveLength(2);
        expect(result[0]).toBe(mockRows[3]); // Offset by 1
        expect(result[1]).toBe(mockRows[4]);
      });
    });

    describe('Case 2: First index before real index', () => {
      it('should calculate offset when firstIndex < firstRealIndex', () => {
        // Mock scenario where we have rows starting at index 0, but firstRealIndex is 2
        const result = prepareVirtualizedRows(mockRows, 2, 0, 3, mockExpandedChildCounts);

        expect(result).toHaveLength(3);
        expect(result[0]).toBe(mockRows[4]);
        expect(result[1]).toBe(mockRows[5]);
        expect(result[2]).toBe(mockRows[6]);
        // Should calculate offset based on expanded child counts and slice accordingly
      });

      it('should handle offset calculation with expanded children', () => {
        const result = prepareVirtualizedRows(mockRows, 3, 1, 2, mockExpandedChildCounts);

        expect(result).toHaveLength(2);
        expect(result[0]).toBe(mockRows[6]);
        expect(result[1]).toBe(mockRows[7]);
        // Should account for expanded children when calculating offset
      });
    });

    describe('Case 3: First index after real index with skeleton rows', () => {
      it('should return all skeleton rows when offset > rowCountToRender', () => {
        // Create scenario where calculated offset exceeds rowCountToRender
        const result = prepareVirtualizedRows(mockRows.slice(5), 0, 0, 2, []);

        expect(result).toHaveLength(2);
        expect(result.every((row) => '__skeleton_row' in row)).toBe(true);
      });

      it('should mix skeleton rows and data rows', () => {
        const rows = [
          { index: 0, id: '0' },
          { index: 1, id: '1' },
          { index: 2, id: '2' },
          { index: 3, id: '3' },
        ];
        // Test scenario where we need skeleton rows at the beginning
        const result = prepareVirtualizedRows(rows.slice(2), 0, 0, 4, []);

        expect(result).toHaveLength(4);
        expect(result).toEqual([{ __skeleton_row: true }, { __skeleton_row: true }, rows[2], rows[3]]);
        // Should have some skeleton rows followed by data rows
      });

      it('should pad with skeleton rows at the end', () => {
        const result = prepareVirtualizedRows(mockRows.slice(0, 2), 0, 0, 5, []);

        expect(result).toHaveLength(5);
        expect(result[0]).toBe(mockRows[0]);
        expect(result[1]).toBe(mockRows[1]);
        expect(result[2]).toEqual({ __skeleton_row: true });
        expect(result[3]).toEqual({ __skeleton_row: true });
        expect(result[4]).toEqual({ __skeleton_row: true });
      });
    });

    describe('Edge cases', () => {
      it('should handle zero rowCountToRender', () => {
        const result = prepareVirtualizedRows(mockRows, 0, 0, 0, []);
        expect(result).toEqual([]);
      });

      it('should handle single row request', () => {
        const result = prepareVirtualizedRows(mockRows, 2, 0, 1, []);

        expect(result).toHaveLength(1);
        expect(result[0]).toBe(mockRows[2]);
      });

      it('should handle large offset values', () => {
        const result = prepareVirtualizedRows(mockRows, 0, 10, 3, []);

        expect(result).toHaveLength(3);
        expect(result.every((row) => '__skeleton_row' in row)).toBe(true);
      });

      it('should handle negative firstRealIndex gracefully', () => {
        // This shouldn't happen in normal usage, but test defensive programming
        const result = prepareVirtualizedRows(mockRows, -1, 0, 3, []);

        expect(result).toHaveLength(3);
        // Should handle gracefully without crashing
      });

      it('should handle complex expanded child counts', () => {
        const complexExpandedCounts: ExpandedChildCounts = [
          { index: 0, rowCount: 5 },
          { index: 2, rowCount: 3 },
          { index: 4, rowCount: 2 },
        ];

        const result = prepareVirtualizedRows(mockRows, 1, 2, 4, complexExpandedCounts);

        expect(result).toHaveLength(4);
        // Should handle complex expansion scenarios correctly
      });
    });

    describe('Performance considerations', () => {
      it('should handle large row arrays efficiently', () => {
        const largeRowArray = Array.from({ length: 1000 }, (_, i) => ({
          index: i,
          id: i.toString(),
        }));

        const start = performance.now();
        const result = prepareVirtualizedRows(largeRowArray, 500, 0, 50, []);
        const end = performance.now();

        expect(result).toHaveLength(50);
        expect(end - start).toBeLessThan(10); // Should complete in < 10ms
      });
    });
  });
});
