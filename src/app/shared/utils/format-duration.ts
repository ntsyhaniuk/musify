/** Formats a duration in milliseconds as `m:ss`. Pure — no dependency on player state. */
export function formatTrackDuration(ms: number | null | undefined): string {
  const value = Math.max(0, Math.floor((ms ?? 0) / 1000));
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
