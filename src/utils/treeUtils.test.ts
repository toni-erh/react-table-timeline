import { describe, it, expect } from 'vitest';
import {
  generateInitialExpansions,
  getExpandedChildCount,
  flattenExpanded,
  toggleExpansion,
} from './treeUtils';
import type { TableRowBase } from '../types/tableTypes';

describe('treeUtils', () => {
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

  describe('generateInitialExpansions', () => {
    it('should generate fully expanded expansions when no defaultExpansionDepth', () => {
      const result = generateInitialExpansions(mockRows, undefined);
      expect(result.size).toBe(9); // All nodes should be included

      expect(result.get('0')).toEqual({
        isExpanded: true,
        childrenIds: ['0-0', '0-1'],
        parentId: undefined,
        prevSiblingId: undefined,
        nextSiblingId: '1',
      });
      expect(result.get('0-0')).toEqual({
        isExpanded: true,
        childrenIds: ['0-0-0', '0-0-1'],
        parentId: '0',
        prevSiblingId: undefined,
        nextSiblingId: '0-1',
      });
      expect(result.get('0-0-1')).toEqual({
        isExpanded: true,
        childrenIds: ['0-0-1-0'],
        parentId: '0-0',
        prevSiblingId: '0-0-0',
        nextSiblingId: undefined,
      });
      expect(result.get('1')).toEqual({
        isExpanded: true,
        childrenIds: [],
        parentId: undefined,
        prevSiblingId: '0',
        nextSiblingId: '2',
      });
      expect(result.get('2')).toEqual({
        isExpanded: true,
        childrenIds: ['2-0'],
        parentId: undefined,
        prevSiblingId: '1',
        nextSiblingId: undefined,
      });
    });

    it('should expand to depth 1', () => {
      const result = generateInitialExpansions(mockRows, 1);

      // Only root nodes and direct children should be expanded
      expect(result.get('0')?.isExpanded).toBe(true);
      expect(result.get('2')?.isExpanded).toBe(true);

      // Nested children should not be expanded
      if (result.has('0-0')) {
        expect(result.get('0-0')?.isExpanded).toBe(false);
      }
    });

    it('should expand to depth 2', () => {
      const result = generateInitialExpansions(mockRows, 2);

      // Root and first level should be expanded
      expect(result.get('0')?.isExpanded).toBe(true);
      expect(result.get('0-0')?.isExpanded).toBe(true);

      // Second level should not be expanded
      if (result.has('0-0-1')) {
        expect(result.get('0-0-1')?.isExpanded).toBe(false);
      }
    });

    it('should handle empty rows array', () => {
      const result = generateInitialExpansions([], 2);
      expect(result.size).toBe(0);
    });
  });

  describe('getExpandedChildCount', () => {
    it('should return 0 for non-expanded rows', () => {
      const expansions = new Map();
      expansions.set('0', { isExpanded: false, childrenIds: ['0-0', '0-1'], parentId: undefined });
      expect(getExpandedChildCount([mockRows[0]], expansions)).toBe(1);
    });

    it('should count direct children for expanded rows', () => {
      const expansions = new Map();
      expansions.set('0', { isExpanded: true, childrenIds: ['0-0', '0-1'], parentId: undefined });
      expansions.set('0-0', { isExpanded: false, childrenIds: [], parentId: '0' });
      expansions.set('0-1', { isExpanded: false, childrenIds: [], parentId: '0' });
      expect(getExpandedChildCount([mockRows[0]], expansions)).toBe(3);
    });

    it('should count nested children recursively', () => {
      const expansions = new Map();
      expansions.set('0', { isExpanded: true, childrenIds: ['0-0', '0-1'], parentId: undefined });
      expansions.set('0-0', { isExpanded: true, childrenIds: ['0-0-0', '0-0-1'], parentId: '0' });
      expansions.set('0-0-0', { isExpanded: false, childrenIds: [], parentId: '0-0' });
      expansions.set('0-0-1', { isExpanded: false, childrenIds: ['0-0-1-0'], parentId: '0-0' });
      expansions.set('0-1', { isExpanded: false, childrenIds: [], parentId: '0' });

      // Should count all children and grandchildren (2 children + 2 grandchildren = 4)
      expect(getExpandedChildCount([mockRows[0]], expansions)).toBe(5);
    });
  });

  describe('flattenExpanded', () => {
    it('should return array with just the row for non-expanded rows', () => {
      const expansions = new Map();
      expansions.set('0', { isExpanded: true, childrenIds: ['0-0', '0-1'], parentId: undefined });
      expansions.set('0-0', { isExpanded: true, childrenIds: ['0-0-0', '0-0-1'], parentId: '0' });
      expansions.set('0-0-0', { isExpanded: false, childrenIds: [], parentId: '0-0' });
      expansions.set('0-0-1', { isExpanded: false, childrenIds: ['0-0-1-0'], parentId: '0-0' });
      expansions.set('0-1', { isExpanded: true, childrenIds: [], parentId: '0' });

      const result = flattenExpanded(mockRows[0], expansions);
      expect(result).toEqual([
        mockRows[0],
        mockRows[0].children?.[0],
        mockRows[0].children?.[0]?.children?.[0],
        mockRows[0].children?.[0]?.children?.[1],
        mockRows[0].children?.[1],
      ]);
    });

    it('should include direct children for expanded rows', () => {
      const expansions = new Map();
      expansions.set('0', { isExpanded: true, childrenIds: ['0-0', '0-1'], parentId: undefined });
      expansions.set('0-0', { isExpanded: false, childrenIds: [], parentId: '0' });
      expansions.set('0-1', { isExpanded: false, childrenIds: [], parentId: '0' });

      const result = flattenExpanded(mockRows[0], expansions);
      expect(result).toEqual(
        [mockRows[0], mockRows[0].children?.[0], mockRows[0].children?.[1]].filter(Boolean),
      ); // Filter out undefined values
    });

    it('should include nested children for expanded rows', () => {
      const expansions = new Map();
      expansions.set('0', { isExpanded: true, childrenIds: ['0-0', '0-1'], parentId: undefined });
      expansions.set('0-0', { isExpanded: true, childrenIds: ['0-0-0', '0-0-1'], parentId: '0' });
      expansions.set('0-0-0', { isExpanded: false, childrenIds: [], parentId: '0-0' });
      expansions.set('0-0-1', { isExpanded: true, childrenIds: ['0-0-1-0'], parentId: '0-0' });
      expansions.set('0-1', { isExpanded: false, childrenIds: [], parentId: '0' });

      const result = flattenExpanded(mockRows[0], expansions);
      expect(result).toEqual([
        mockRows[0],
        mockRows[0]!.children![0],
        mockRows[0]!.children![0]!.children![0],
        mockRows[0]!.children![0]!.children![1],
        mockRows[0]!.children![0]!.children![1]!.children![0],
        mockRows[0]!.children![1],
      ]);
    });

    describe('toggleExpansion', () => {
      it('should toggle expansion state', () => {
        const expansions = new Map();
        expansions.set('0', { isExpanded: true, childrenIds: ['0-0', '0-1'], parentId: undefined });
        expansions.set('0-0', { isExpanded: true, childrenIds: ['0-0-0', '0-0-1'], parentId: '0' });
        expansions.set('0-0-0', { isExpanded: false, childrenIds: [], parentId: '0-0' });
        expansions.set('0-0-1', { isExpanded: true, childrenIds: ['0-0-1-0'], parentId: '0-0' });
        expansions.set('0-1', { isExpanded: false, childrenIds: [], parentId: '0' });

        const result = toggleExpansion(expansions, '0-0');
        expect(result.get('0-0')?.isExpanded).toBe(false);
      });
    });
  });
});
