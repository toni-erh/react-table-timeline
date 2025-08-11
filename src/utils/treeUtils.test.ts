import { describe, it, expect } from 'vitest';
import { 
  generateInitialExpansions, 
  getExpandedChildCount, 
  flattenExpanded 
} from './treeUtils';
import type { TableRowBase, RowExpansions } from '../types/tableTypes';

describe('treeUtils', () => {
  // Mock test data
  const mockRows: TableRowBase[] = [
    { index: 0, id: '0', children: [
      { index: 0, id: '0-0', children: [
        { index: 0, id: '0-0-0' },
        { index: 1, id: '0-0-1', children: [{ index: 0, id: '0-0-1-0' }] }
      ]},
      { index: 1, id: '0-1', children: [] }
    ]},
    { index: 1, id: '1', children: [] },
    { index: 2, id: '2', children: [
      { index: 0, id: '2-0' }
    ]}
  ];

  describe('generateInitialExpansions', () => {
    it('should generate fully expanded expansions when no defaultExpansionDepth', () => {
      const result = generateInitialExpansions(mockRows, undefined);
      expect(result).toEqual({
        0: {
          0: {
            1: {}
          }
        },
        2: {}
      });
    });

    it('should expand to depth 1', () => {
      const result = generateInitialExpansions(mockRows, 1);
      expect(result).toEqual({
        0: {},
        2: {}
      });
    });

    it('should expand to depth 2', () => {
      const result = generateInitialExpansions(mockRows, 2);
      expect(result).toEqual({
        0: {
          0: {}
        },
        2: {}
      });
    });

    it('should handle empty rows array', () => {
      const result = generateInitialExpansions([], 2);
      expect(result).toEqual({});
    });
  });

  describe('getExpandedChildCount', () => {
    it('should count only direct children when not expanded', () => {
      const expansions: RowExpansions = {};
      const result = getExpandedChildCount(mockRows, expansions);
      expect(result).toBe(3); // Only direct children
    });

    it('should count nested children when expanded', () => {
      const expansions: RowExpansions = { 0: { 0: { 1: {} } } };
      const result = getExpandedChildCount(mockRows, expansions);
      expect(result).toBe(8); // 3 direct + 5 nested
    });

    it('should handle empty children array', () => {
      const result = getExpandedChildCount([], {});
      expect(result).toBe(0);
    });
  });

  describe('flattenExpanded', () => {
    it('should return only parent when not expanded', () => {
      const result = flattenExpanded(mockRows[0], {});
      expect(result).toEqual([mockRows[0], ...mockRows[0]!.children!]);
    });

    it('should include direct children when expanded', () => {
      const result = flattenExpanded(mockRows[0], {});
      expect(result).toEqual([
        mockRows[0],
        mockRows[0]!.children![0],
        mockRows[0]!.children![1],
      ]);
    });

    it('should include nested children when deeply expanded', () => {
      const result = flattenExpanded(mockRows[0], { 0: { 1: {} } });
      expect(result).toEqual([
        mockRows[0],
        mockRows[0]!.children![0],
        mockRows[0]!.children![0]!.children![0],
        mockRows[0]!.children![0]!.children![1],
        mockRows[0]!.children![0]!.children![1]!.children![0],
        mockRows[0]!.children![1],
      ]);
    });
  });
});
