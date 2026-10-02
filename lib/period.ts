/** Display-ready month/year strings, e.g. "Feb 2022". An absent `end` means ongoing. */
export type Period = { start: string; end?: string };

export function formatPeriod({ start, end }: Period): string {
  return `${start} – ${end ?? "Present"}`;
}
