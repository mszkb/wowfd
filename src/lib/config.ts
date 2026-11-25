export const REGIONS = ["eu", "us"] as const;
export type Region = (typeof REGIONS)[number];

export function parseRegion(value: string | null): Region | null {
  const v = (value ?? "eu").toLowerCase();
  return (REGIONS as readonly string[]).includes(v) ? (v as Region) : null;
}

export interface TrackedItem {
  id: number;
  /** Qualitätsstufe bei Items, die es in mehreren Stufen gibt. */
  rank?: number;
}

export interface Category {
  key: string;
  label: string;
  items: TrackedItem[];
}

/** Verfolgte Items nach Kategorie. Icons liegen unter public/icons/{id}.jpg. */
export const CATEGORIES: Category[] = [
  {
    key: "herbs",
    label: "Kräuter",
    items: [
      { id: 236761, rank: 1 }, // Tranquility Bloom
      { id: 236767, rank: 2 }, // Tranquility Bloom
      { id: 236770, rank: 1 }, // Sanguithorn
      { id: 236771, rank: 2 }, // Sanguithorn
      { id: 236774, rank: 1 }, // Azeroot
      { id: 236775, rank: 2 }, // Azeroot
      { id: 236776, rank: 1 }, // Argentleaf
      { id: 236777, rank: 2 }, // Argentleaf
      { id: 236778, rank: 1 }, // Mana Lily
      { id: 236779, rank: 2 }, // Mana Lily
      { id: 236780 }, // Nocturnal Lotus
    ],
  },
  {
    key: "food",
    label: "Bufffood",
    items: [
      { id: 242272 }, // Quel'dorei Medley
      { id: 242273 }, // Blooming Feast
      { id: 242274 }, // Champion's Bento
      { id: 242275 }, // Royal Roast
      { id: 242276 }, // Braised Blood Hunter
      { id: 242277 }, // Crimson Calamari
      { id: 242278 }, // Tasty Smoked Tetra
      { id: 242280 }, // Buttered Root Crab
      { id: 242281 }, // Glitter Skewers
      { id: 242282 }, // Null and Void Plate
      { id: 242283 }, // Sun-Seared Lumifin
      { id: 242284 }, // Void-Kissed Fish Rolls
      { id: 242285 }, // Warped Wise Wings
      { id: 242286 }, // Fel-Kissed Filet
      { id: 242287 }, // Arcano Cutlets
      { id: 242288 }, // Twilight Angler's Medley
      { id: 242289 }, // Spellfire Filet
      { id: 242290 }, // Wise Tails
      { id: 242291 }, // Fried Bloomtail
      { id: 242292 }, // Eversong Pudding
      { id: 242293 }, // Sunwell Delight
      { id: 242294 }, // Felberry Figs
      { id: 242295 }, // Hearthflame Supper
      { id: 242296 }, // Bloodthistle-Wrapped Cutlets
      { id: 242297 }, // Mana Lily Tea
      { id: 242298 }, // Argentleaf Tea
      { id: 242299 }, // Sanguithorn Tea
      { id: 242300 }, // Tranquility Bloom Tea
      { id: 242301 }, // Azeroot Tea
      { id: 242302 }, // Bloom Skewers
      { id: 242303 }, // Mana-Infused Stew
      { id: 242304 }, // Spiced Biscuits
      { id: 242305 }, // Silvermoon Standard
      { id: 242306 }, // Forager's Medley
      { id: 242307 }, // Quick Sandwich
      { id: 242308 }, // Portable Snack
      { id: 242309 }, // Farstrider Rations
      { id: 255845 }, // Silvermoon Parade
      { id: 255846 }, // Harandar Celebration
      { id: 255847 }, // Impossibly Royal Roast
      { id: 255848 }, // Flora Frenzy
    ],
  },
  {
    key: "other",
    label: "Sonstiges",
    items: [
      { id: 12811 }, // Righteous Orb
    ],
  },
];

const DEFAULT_ITEM_IDS = CATEGORIES.flatMap((c) => c.items.map((i) => i.id));

const ITEM_META = new Map(
  CATEGORIES.flatMap((c) =>
    c.items.map((i, index) => [i.id, { category: c.key, rank: i.rank, index }] as const),
  ),
);

export function itemMeta(itemId: number) {
  return ITEM_META.get(itemId) ?? { category: "other", rank: undefined, index: Infinity };
}

/**
 * Item-IDs, die aus der TSM-CSV übernommen werden. TSM_ITEM_IDS
 * (kommagetrennt) überschreibt die Liste ohne Code-Änderung.
 */
export function trackedItemIds(): number[] {
  const fromEnv = (process.env.TSM_ITEM_IDS ?? "")
    .split(",")
    .map((v) => Number(v.trim()))
    .filter((n) => Number.isInteger(n) && n > 0);
  return fromEnv.length > 0 ? fromEnv : DEFAULT_ITEM_IDS;
}

export const CSV_REVALIDATE_SECONDS = 600;
/** Mindestabstand zwischen zwei erzwungenen Abrufen je Region. */
export const REFRESH_MIN_INTERVAL_SECONDS = 60;
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
