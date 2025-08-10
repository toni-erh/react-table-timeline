/**
 * Calculates scroll-based indices for virtualization
 */
export function calculateVisibleRowRange(
  scrollTop: number,
  clientHeight: number,
  lineHeight: number,
  rowVirtualizationMargin: number,
  flatRowCount: number
): {
  firstFlatIndex: number;
  lastFlatIndex: number;
  rowCountToRender: number;
} {
  const virtualFirstFlatIndex = Math.floor(scrollTop / lineHeight) - rowVirtualizationMargin;
  const firstFlatIndex = Math.max(virtualFirstFlatIndex, 0);
  const lastFlatIndex = Math.min(
    virtualFirstFlatIndex + Math.ceil(clientHeight / lineHeight) + 2 * rowVirtualizationMargin,
    flatRowCount
  );
  const rowCountToRender = lastFlatIndex - firstFlatIndex;

  return {
    firstFlatIndex,
    lastFlatIndex,
    rowCountToRender
  };
}
