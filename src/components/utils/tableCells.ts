type TableRow = { cells?: unknown[] | null } | null | undefined;

/** Normalize editor-authored table data to a rectangle — missing cells become
 *  "" so a short row renders empty `<td>`s instead of collapsing the grid. */
export function columnCount(headerCells: unknown[] = [], rows: TableRow[] = []): number {
  return Math.max(
    headerCells?.length ?? 0,
    ...(rows ?? []).map((row) => row?.cells?.length ?? 0),
    0
  );
}

export function normalizeRow(cells: unknown[] | null | undefined, width: number): string[] {
  return Array.from({ length: width }, (_, i) => {
    const cell = cells?.[i];

    return cell == null ? "" : String(cell);
  });
}
