export const REGIONS = ["eu", "us"] as const;
export type Region = (typeof REGIONS)[number];

export function parseRegion(value: string | null): Region | null {
  const v = (value ?? "eu").toLowerCase();
  return (REGIONS as readonly string[]).includes(v) ? (v as Region) : null;
}

/**
 * Item-IDs, die aus der TSM-CSV übernommen werden.
 * Leere Liste = alle Zeilen der CSV übernehmen.
 */
export const TRACKED_ITEM_IDS: number[] = [];

export const CSV_REVALIDATE_SECONDS = 600;
export const HISTORY_MAX_AGE_DAYS = 365;

export function csvUrl(region: Region): string {
  const url = process.env[`TSM_CSV_URL_${region.toUpperCase()}`];
  if (!url) throw new Error(`TSM_CSV_URL_${region.toUpperCase()} ist nicht gesetzt`);
  return url;
}

export function blobAccess(): "private" | "public" {
  return process.env.BLOB_ACCESS === "public" ? "public" : "private";
}
