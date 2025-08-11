import { describe, it, expect } from 'vitest';
import { calculateVisibleRowRange } from './scrollCalculations';

describe('scrollCalculations', () => {
  describe('calculateVisibleRowRange', () => {
    const lineHeight = 40;
    const rowVirtualizationMargin = 5;
    const flatRowCount = 1000;

    it('should calculate visible range at scroll top', () => {
      const result = calculateVisibleRowRange(0, 400, lineHeight, rowVirtualizationMargin, flatRowCount);
      
      expect(result.firstFlatIndex).toBe(0);
      expect(result.lastFlatIndex).toBe(14); // (400/40) + 5 - 1
      expect(result.rowCountToRender).toBe(15); // 10 visible + 5 margin
    });

    it('should calculate visible range when scrolled down', () => {
      const scrollTop = 800; // Scrolled down 20 rows (800/40)
      const result = calculateVisibleRowRange(scrollTop, 400, lineHeight, rowVirtualizationMargin, flatRowCount);
      
      expect(result.firstFlatIndex).toBe(15); // 800/40 - 5 margin
      expect(result.lastFlatIndex).toBe(34); // 20 + (400/40) + 5 - 1
      expect(result.rowCountToRender).toBe(20); // 10 visible + 2*5 margin
    });

    it('should handle small container height', () => {
      const result = calculateVisibleRowRange(0, 80, lineHeight, rowVirtualizationMargin, flatRowCount);
      
      expect(result.firstFlatIndex).toBe(0);
      expect(result.rowCountToRender).toBe(7); // (80/40) + 5 = 7
    });

    it('should respect flatRowCount limit', () => {
      const smallRowCount = 10;
      const result = calculateVisibleRowRange(0, 800, lineHeight, rowVirtualizationMargin, smallRowCount);
      
      expect(result.rowCountToRender).toBe(10); // Limited by flatRowCount
      expect(result.lastFlatIndex).toBe(9); // 0 + 10 - 1
    });

    it('should handle scrolling near the end', () => {
      const scrollTop = 39600; // Near end (990 * 40)
      const result = calculateVisibleRowRange(scrollTop, 400, lineHeight, rowVirtualizationMargin, flatRowCount);
      
      expect(result.firstFlatIndex).toBe(985);
      expect(result.rowCountToRender).toBe(15); // Limited by remaining rows
      expect(result.lastFlatIndex).toBe(999); // Last possible index
    });

    it('should handle exact scroll to last rows', () => {
      const scrollTop = 39800; // Exactly at last 5 rows
      const result = calculateVisibleRowRange(scrollTop, 200, lineHeight, rowVirtualizationMargin, flatRowCount);
      
      expect(result.firstFlatIndex).toBe(990);
      expect(result.rowCountToRender).toBe(10); // Only 5 rows left
      expect(result.lastFlatIndex).toBe(999);
    });

    it('should handle zero margin', () => {
      const result = calculateVisibleRowRange(0, 400, lineHeight, 0, flatRowCount);
      
      expect(result.rowCountToRender).toBe(10); // Just visible rows, no margin
      expect(result.lastFlatIndex).toBe(9);
    });

    it('should handle large margin', () => {
      const largeMargin = 50;
      const result = calculateVisibleRowRange(0, 400, lineHeight, largeMargin, flatRowCount);
      
      expect(result.rowCountToRender).toBe(60); // 10 visible + 50 margin
      expect(result.lastFlatIndex).toBe(59);
    });

    it('should handle fractional scroll positions', () => {
      const scrollTop = 123.7; // Fractional scroll
      const result = calculateVisibleRowRange(scrollTop, 400, lineHeight, 0, flatRowCount);
      
      expect(result.firstFlatIndex).toBe(3); // Math.floor(123.7/40) = 3
      expect(result.rowCountToRender).toBe(10);
    });

    it('should handle very small line height', () => {
      const smallLineHeight = 1;
      const result = calculateVisibleRowRange(0, 100, smallLineHeight, rowVirtualizationMargin, flatRowCount);
      
      expect(result.rowCountToRender).toBe(105); // 100 visible + 5 margin
      expect(result.lastFlatIndex).toBe(104);
    });

    it('should handle edge case with zero container height', () => {
      const result = calculateVisibleRowRange(0, 0, lineHeight, rowVirtualizationMargin, flatRowCount);
      
      expect(result.firstFlatIndex).toBe(0);
      expect(result.rowCountToRender).toBe(5); // Just the margin
      expect(result.lastFlatIndex).toBe(4);
    });

    it('should handle edge case with single row', () => {
      const result = calculateVisibleRowRange(0, 400, lineHeight, rowVirtualizationMargin, 1);
      
      expect(result.firstFlatIndex).toBe(0);
      expect(result.rowCountToRender).toBe(1); // Limited by flatRowCount
      expect(result.lastFlatIndex).toBe(0);
    });

    it('should maintain consistency between firstFlatIndex and lastFlatIndex', () => {
      const result = calculateVisibleRowRange(500, 300, lineHeight, rowVirtualizationMargin, flatRowCount);
      
      expect(result.lastFlatIndex).toBeGreaterThanOrEqual(result.firstFlatIndex);
      expect(result.lastFlatIndex - result.firstFlatIndex + 1).toBe(result.rowCountToRender);
    });
  });
});
