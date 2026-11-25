export const REGIONS = ["eu", "us"] as const;
export type Region = (typeof REGIONS)[number];

export function parseRegion(value: string | null): Region | null {
  const v = (value ?? "eu").toLowerCase();
  return (REGIONS as readonly string[]).includes(v) ? (v as Region) : null;
}

/**
 * Item-IDs, die aus der TSM-CSV übernommen werden.
 * Leere Liste = alle Zeilen der CSV übernehmen (nicht empfohlen: jeder
 * Snapshot ist dann ~1 MB und die Historie wächst entsprechend).
 * TSM_ITEM_IDS (kommagetrennt) überschreibt die Liste ohne Code-Änderung.
 */
const DEFAULT_ITEM_IDS: number[] = [];

export function trackedItemIds(): number[] {
  const fromEnv = (process.env.TSM_ITEM_IDS ?? "")
    .split(",")
    .map((v) => Number(v.trim()))
    .filter((n) => Number.isInteger(n) && n > 0);
  return fromEnv.length > 0 ? fromEnv : DEFAULT_ITEM_IDS;
}

export const CSV_REVALIDATE_SECONDS = 600;
export const HISTORY_MAX_AGE_DAYS = 365;

/**
 * Öffentliche TSM-CSV mit den regionsweiten Commodity-Preisen (Kupfer).
 * Per TSM_CSV_URL_EU / TSM_CSV_URL_US überschreibbar.
 */
export function csvUrl(region: Region): string {
  return (
    process.env[`TSM_CSV_URL_${region.toUpperCase()}`] ||
    `https://public-data.tradeskillmaster.com/retail/${region}/commodities.csv`
  );
}

export function blobAccess(): "private" | "public" {
  return process.env.BLOB_ACCESS === "public" ? "public" : "private";
}
