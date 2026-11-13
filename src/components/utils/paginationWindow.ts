/** Pages are 1-based; the bar never exceeds `maxVisiblePages` items, ellipses excluded. */
export type PaginationWindow = {
  pages: number[];
  showFirst: boolean;
  showLast: boolean;
  /** An ellipsis between the first-page jump and the window. */
  gapBefore: boolean;
};

export function paginationWindow(
  currentPage: number,
  totalPages: number,
  maxVisiblePages = 5
): PaginationWindow {
  const lastIndex = totalPages - 1;
  const maxVisible = maxVisiblePages - 1;

  let startIndex = Math.max(0, currentPage - 2);
  let endIndex = Math.min(lastIndex, startIndex + maxVisible);

  if (endIndex === lastIndex && startIndex > 0) {
    startIndex = Math.max(0, lastIndex - maxVisible);
  }

  const showFirst = startIndex > 0;
  const totalVisible =
    endIndex - startIndex + 1 + (showFirst ? 1 : 0) + (endIndex < lastIndex ? 1 : 0);

  if (totalVisible > maxVisiblePages && (showFirst || endIndex < lastIndex)) {
    // Trim the tail first but never past the current page, or it renders without `aria-current`.
    const currentIndex = currentPage - 1;
    const excess = totalVisible - maxVisiblePages;
    const trimEnd = Math.min(excess, Math.max(0, endIndex - Math.max(startIndex, currentIndex)));

    endIndex -= trimEnd;
    startIndex = Math.min(currentIndex, startIndex + (excess - trimEnd));
  }

  const pages: number[] = [];

  for (let n = startIndex + 1; n <= endIndex + 1; n += 1) pages.push(n);

  return {
    pages,
    showFirst,
    showLast: endIndex < lastIndex,
    gapBefore: startIndex > 1,
  };
}
