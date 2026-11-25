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
const DEFAULT_ITEM_IDS: number[] = [
  // Kräuter (Midnight)
  236761, // Tranquility Bloom
  236767, // Tranquility Bloom
  236770, // Sanguithorn
  236771, // Sanguithorn
  236774, // Azeroot
  236775, // Azeroot
  236776, // Argentleaf
  236777, // Argentleaf
  236778, // Mana Lily
  236779, // Mana Lily
  236780, // Nocturnal Lotus
  // Bufffood (Midnight, Kochkunst)
  242272, // Quel'dorei Medley
  242273, // Blooming Feast
  242274, // Champion's Bento
  242275, // Royal Roast
  242276, // Braised Blood Hunter
  242277, // Crimson Calamari
  242278, // Tasty Smoked Tetra
  242280, // Buttered Root Crab
  242281, // Glitter Skewers
  242282, // Null and Void Plate
  242283, // Sun-Seared Lumifin
  242284, // Void-Kissed Fish Rolls
  242285, // Warped Wise Wings
  242286, // Fel-Kissed Filet
  242287, // Arcano Cutlets
  242288, // Twilight Angler's Medley
  242289, // Spellfire Filet
  242290, // Wise Tails
  242291, // Fried Bloomtail
  242292, // Eversong Pudding
  242293, // Sunwell Delight
  242294, // Felberry Figs
  242295, // Hearthflame Supper
  242296, // Bloodthistle-Wrapped Cutlets
  242297, // Mana Lily Tea
  242298, // Argentleaf Tea
  242299, // Sanguithorn Tea
  242300, // Tranquility Bloom Tea
  242301, // Azeroot Tea
  242302, // Bloom Skewers
  242303, // Mana-Infused Stew
  242304, // Spiced Biscuits
  242305, // Silvermoon Standard
  242306, // Forager's Medley
  242307, // Quick Sandwich
  242308, // Portable Snack
  242309, // Farstrider Rations
  255845, // Silvermoon Parade
  255846, // Harandar Celebration
  255847, // Impossibly Royal Roast
  255848, // Flora Frenzy
  // Sonstiges
  12811, // Righteous Orb
];

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
