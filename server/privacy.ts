export function excludeScreenshotsFromHistory<T extends { screenshots?: string[] }>(
  record: T,
): T & { screenshots: string[] } {
  return {
    ...record,
    screenshots: [],
  };
}
