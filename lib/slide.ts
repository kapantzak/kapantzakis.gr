/**
 * Progress of an element through the viewport's `cover` range: 0 as its top edge enters at the
 * bottom, 1 as its bottom edge leaves at the top. Mirrors `animation-range: cover 0% cover 100%`.
 */
export function coverProgress(
  top: number,
  height: number,
  viewportHeight: number,
): number {
  const progress = (viewportHeight - top) / (viewportHeight + height);
  return Math.min(1, Math.max(0, progress));
}
