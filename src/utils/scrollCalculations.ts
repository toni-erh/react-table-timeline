/**
 * Calculates scroll-based indices for virtualization
 */
export function calculateVisibleRowRange(
  scrollTop: number,
  clientHeight: number,
  lineHeight: number,
  rowVirtualizationMargin: number,
  flatRowCount: number,
): {
  firstFlatIndex: number;
  lastFlatIndex: number;
  rowCountToRender: number;
} {
  const virtualFirstFlatIndex = Math.floor(scrollTop / lineHeight) - rowVirtualizationMargin;
  const firstFlatIndex = Math.max(virtualFirstFlatIndex, 0);
  const lastFlatIndex = Math.min(
    virtualFirstFlatIndex + Math.ceil(clientHeight / lineHeight) + 2 * rowVirtualizationMargin - 1,
    flatRowCount - 1,
  );
  const rowCountToRender = lastFlatIndex - firstFlatIndex + 1;

  return {
    firstFlatIndex,
    lastFlatIndex,
    rowCountToRender,
  };
}
