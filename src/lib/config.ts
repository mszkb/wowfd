export const REGIONS = ["eu", "us"] as const;
export type Region = (typeof REGIONS)[number];

export function parseRegion(value: string | null): Region | null {
  const v = (value ?? "eu").toLowerCase();
  return (REGIONS as readonly string[]).includes(v) ? (v as Region) : null;
}

/** Farm-Hinweis für Kräuter. Die Zonen stammen aus Classic. */
export interface FarmInfo {
  zones: string;
  routeUrl?: string;
}

// Wowhead-Guides mit Routenkarten je Kraut (Classic).
const ROUTE_EARLY =
  "https://www.wowhead.com/classic/guide/classic-herbalism-best-farming-basics-early-herbs";
const ROUTE_HIGH =
  "https://www.wowhead.com/classic/guide/classic-herbalism-best-farming-high-end-herbs";

export interface TrackedItem {
  id: number;
  farm?: FarmInfo;
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
      { id: 765, farm: { zones: "Elwynn Forest (A), Tirisfal Glades (H)", routeUrl: ROUTE_EARLY } }, // Silverleaf
      { id: 785, farm: { zones: "The Barrens, Westfall", routeUrl: ROUTE_EARLY } }, // Mageroyal
      { id: 2447, farm: { zones: "Elwynn Forest (A), Tirisfal Glades (H)", routeUrl: ROUTE_EARLY } }, // Peacebloom
      { id: 2449, farm: { zones: "Durotar, Loch Modan", routeUrl: ROUTE_EARLY } }, // Earthroot
      { id: 2450, farm: { zones: "The Barrens, Darkshore", routeUrl: ROUTE_EARLY } }, // Briarthorn
      { id: 2452, farm: { zones: "Beifang aus Briarthorn und Mageroyal", routeUrl: ROUTE_EARLY } }, // Swiftthistle
      { id: 2453, farm: { zones: "Hillsbrad Foothills, Ashenvale", routeUrl: ROUTE_EARLY } }, // Bruiseweed
      { id: 3355, farm: { zones: "Stranglethorn Vale, Arathi Highlands", routeUrl: ROUTE_EARLY } }, // Wild Steelbloom
      { id: 3356, farm: { zones: "Wetlands, Stranglethorn Vale", routeUrl: ROUTE_EARLY } }, // Kingsblood
      { id: 3357, farm: { zones: "Flussufer: Wetlands, The Hinterlands", routeUrl: ROUTE_HIGH } }, // Liferoot
      { id: 3358, farm: { zones: "Stranglethorn Vale, The Hinterlands", routeUrl: ROUTE_HIGH } }, // Khadgar's Whisker
      { id: 3369, farm: { zones: "Friedhöfe: Raven Hill (Duskwood), Kodo Graveyard (Desolace)", routeUrl: ROUTE_EARLY } }, // Grave Moss
      { id: 3818, farm: { zones: "Arathi Highlands, Swamp of Sorrows", routeUrl: ROUTE_HIGH } }, // Fadeleaf
      { id: 3819, farm: { zones: "Alterac Mountains", routeUrl: ROUTE_HIGH } }, // Wintersbite
      { id: 3820, farm: { zones: "Küsten: Stranglethorn Vale, Wetlands", routeUrl: ROUTE_EARLY } }, // Stranglekelp
      { id: 3821, farm: { zones: "Arathi Highlands, Stranglethorn Vale", routeUrl: ROUTE_HIGH } }, // Goldthorn
      { id: 4625, farm: { zones: "Tanaris, Searing Gorge", routeUrl: ROUTE_HIGH } }, // Firebloom
      { id: 8153, farm: { zones: "Beifang aus Purple Lotus; Trolle in The Hinterlands", routeUrl: ROUTE_HIGH } }, // Wildvine
      { id: 8831, farm: { zones: "Ruinen in Feralas, Tanaris, Azshara", routeUrl: ROUTE_HIGH } }, // Purple Lotus
      { id: 8836, farm: { zones: "Western und Eastern Plaguelands, Felwood", routeUrl: ROUTE_HIGH } }, // Arthas' Tears
      { id: 8838, farm: { zones: "The Hinterlands, Feralas, Azshara", routeUrl: ROUTE_HIGH } }, // Sungrass
      { id: 8839, farm: { zones: "Swamp of Sorrows, Un'Goro Crater", routeUrl: ROUTE_HIGH } }, // Blindweed
      { id: 8845, farm: { zones: "Höhlen: Fungal Rock (Un'Goro), The Hinterlands", routeUrl: ROUTE_HIGH } }, // Ghost Mushroom
      { id: 8846, farm: { zones: "Felwood, Blasted Lands", routeUrl: ROUTE_HIGH } }, // Gromsblood
      { id: 13463, farm: { zones: "Azshara, Un'Goro Crater, Burning Steppes", routeUrl: ROUTE_HIGH } }, // Dreamfoil
      { id: 13464, farm: { zones: "Azshara, Felwood", routeUrl: ROUTE_HIGH } }, // Golden Sansam
      { id: 13465, farm: { zones: "Winterspring, Un'Goro Crater", routeUrl: ROUTE_HIGH } }, // Mountain Silversage
      { id: 13466, farm: { zones: "Eastern und Western Plaguelands, Felwood", routeUrl: ROUTE_HIGH } }, // Plaguebloom
      { id: 13467, farm: { zones: "Winterspring", routeUrl: ROUTE_HIGH } }, // Icecap
      { id: 13468, farm: { zones: "Winterspring, Eastern Plaguelands, Burning Steppes, Silithus", routeUrl: ROUTE_HIGH } }, // Black Lotus
      { id: 248821, farm: { zones: "Fundorte noch nicht dokumentiert" } }, // Demonsage
      { id: 248822, farm: { zones: "Fundorte noch nicht dokumentiert" } }, // Death Lotus
      { id: 248823, farm: { zones: "Fundorte noch nicht dokumentiert" } }, // Marefoil
      { id: 249274, farm: { zones: "Fundorte noch nicht dokumentiert" } }, // Stranglevine
      { id: 249399, farm: { zones: "Fundorte noch nicht dokumentiert" } }, // Frilled Lichen
      { id: 249424, farm: { zones: "Fundorte noch nicht dokumentiert" } }, // Rosecap
      { id: 268415 }, // Commonplace Herb Seeds
      { id: 268416 }, // Uncommon Herb Seeds
      { id: 268417 }, // Unusual Herb Seeds
      { id: 268418 }, // Scarce Herb Seeds
    ],
  },
  {
    key: "food",
    label: "Bufffood",
    items: [
      { id: 250065 }, // Savory Stag Sliders
      { id: 250067 }, // Bat Hachee
      { id: 250068 }, // Savory Turtle Stew
      { id: 250069 }, // Flank au Poivre
      { id: 250070 }, // Bear Bruscitti
      { id: 250071 }, // Steaming Stag Steak
      { id: 250072 }, // Swiftstrike Steak
      { id: 250073 }, // Raging Raptor Ribs
      { id: 250074 }, // Bear Brisket
      { id: 250075 }, // Prehistoric Pulled Raptor
      { id: 250076 }, // Raptor Rouladen
      { id: 250077 }, // Twice-Spiced Raptor Slice
      { id: 250078 }, // Giant Scrambled Eggs
      { id: 250079 }, // Tasty Raptor Bites
      { id: 250080 }, // Breakfast Omelette
      { id: 250081 }, // Clam Linguine
      { id: 274971 }, // Briny Seafood Stew
      { id: 274976 }, // Plain Ol' Paletusk
      { id: 286152 }, // Plated Armorfish
      { id: 263509 }, // Skywall Souffle
      { id: 263512 }, // Pincer Bites
      { id: 267341 }, // Sweetpaw Jam
      { id: 249865 }, // Peace Tea
      { id: 249866 }, // Royal Tea
      { id: 249867 }, // Root Tea
      { id: 249868 }, // Triage Tea
      { id: 249869 }, // Sunny Tea
      { id: 249870 }, // Sage's Tea
      { id: 249871 }, // Venomous Smoothie
      { id: 249872 }, // Slimy Smoothie
      { id: 249873 }, // Mrrggl Smrrthle
      { id: 249874 }, // Calcified Smoothie
      { id: 249875 }, // Spicy Smoothie
      { id: 249876 }, // Wicked Smoothie
      { id: 20452 }, // Smoked Desert Dumplings
      { id: 18254 }, // Runn Tum Tuber Surprise
      { id: 13928 }, // Grilled Squid
      { id: 13931 }, // Nightfin Soup
      { id: 21217 }, // Sagefish Delight
      { id: 21072 }, // Smoked Sagefish
      { id: 13932 }, // Poached Sunscale Salmon
      { id: 13927 }, // Cooked Glossy Mightfish
      { id: 13934 }, // Mightfish Steak
      { id: 13933 }, // Lobster Stew
      { id: 13935 }, // Baked Salmon
      { id: 18045 }, // Tender Wolf Steak
      { id: 12218 }, // Monster Omelet
      { id: 12216 }, // Spiced Chili Crab
      { id: 12215 }, // Heavy Kodo Stew
      { id: 12214 }, // Mystery Stew
      { id: 12213 }, // Carrion Surprise
      { id: 12212 }, // Jungle Stew
      { id: 12210 }, // Roast Raptor
      { id: 12217 }, // Dragonbreath Chili
      { id: 16971 }, // Clamlette Surprise
      { id: 17222 }, // Spider Sausage
      { id: 13851 }, // Hot Wolf Ribs
      { id: 20074 }, // Heavy Crocolisk Stew
      { id: 21151 }, // Rumsey Rum Black Label
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
    c.items.map((i) => [i.id, { category: c.key, rank: i.rank, farm: i.farm }] as const),
  ),
);

export function itemMeta(itemId: number) {
  return ITEM_META.get(itemId) ?? { category: "other", rank: undefined, farm: undefined };
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
 * Öffentliche TSM-CSV mit den regionsweiten WoW-Forever-Preisen (Kupfer).
 * Per TSM_CSV_URL_EU / TSM_CSV_URL_US überschreibbar.
 */
export function csvUrl(region: Region): string {
  return (
    process.env[`TSM_CSV_URL_${region.toUpperCase()}`] ||
    `https://public-data.tradeskillmaster.com/forever/${region}/region/items.csv`
  );
}

export function blobAccess(): "private" | "public" {
  return process.env.BLOB_ACCESS === "public" ? "public" : "private";
}
