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
  name: string;
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
      { id: 765, name: "Silverleaf", farm: { zones: "Elwynn Forest (A), Tirisfal Glades (H)", routeUrl: ROUTE_EARLY } },
      { id: 785, name: "Mageroyal", farm: { zones: "The Barrens, Westfall", routeUrl: ROUTE_EARLY } },
      { id: 2447, name: "Peacebloom", farm: { zones: "Elwynn Forest (A), Tirisfal Glades (H)", routeUrl: ROUTE_EARLY } },
      { id: 2449, name: "Earthroot", farm: { zones: "Durotar, Loch Modan", routeUrl: ROUTE_EARLY } },
      { id: 2450, name: "Briarthorn", farm: { zones: "The Barrens, Darkshore", routeUrl: ROUTE_EARLY } },
      { id: 2452, name: "Swiftthistle", farm: { zones: "Beifang aus Briarthorn und Mageroyal", routeUrl: ROUTE_EARLY } },
      { id: 2453, name: "Bruiseweed", farm: { zones: "Hillsbrad Foothills, Ashenvale", routeUrl: ROUTE_EARLY } },
      { id: 3355, name: "Wild Steelbloom", farm: { zones: "Stranglethorn Vale, Arathi Highlands", routeUrl: ROUTE_EARLY } },
      { id: 3356, name: "Kingsblood", farm: { zones: "Wetlands, Stranglethorn Vale", routeUrl: ROUTE_EARLY } },
      { id: 3357, name: "Liferoot", farm: { zones: "Flussufer: Wetlands, The Hinterlands", routeUrl: ROUTE_HIGH } },
      { id: 3358, name: "Khadgar's Whisker", farm: { zones: "Stranglethorn Vale, The Hinterlands", routeUrl: ROUTE_HIGH } },
      { id: 3369, name: "Grave Moss", farm: { zones: "Friedhöfe: Raven Hill (Duskwood), Kodo Graveyard (Desolace)", routeUrl: ROUTE_EARLY } },
      { id: 3818, name: "Fadeleaf", farm: { zones: "Arathi Highlands, Swamp of Sorrows", routeUrl: ROUTE_HIGH } },
      { id: 3819, name: "Wintersbite", farm: { zones: "Alterac Mountains", routeUrl: ROUTE_HIGH } },
      { id: 3820, name: "Stranglekelp", farm: { zones: "Küsten: Stranglethorn Vale, Wetlands", routeUrl: ROUTE_EARLY } },
      { id: 3821, name: "Goldthorn", farm: { zones: "Arathi Highlands, Stranglethorn Vale", routeUrl: ROUTE_HIGH } },
      { id: 4625, name: "Firebloom", farm: { zones: "Tanaris, Searing Gorge", routeUrl: ROUTE_HIGH } },
      { id: 8153, name: "Wildvine", farm: { zones: "Beifang aus Purple Lotus; Trolle in The Hinterlands", routeUrl: ROUTE_HIGH } },
      { id: 8831, name: "Purple Lotus", farm: { zones: "Ruinen in Feralas, Tanaris, Azshara", routeUrl: ROUTE_HIGH } },
      { id: 8836, name: "Arthas' Tears", farm: { zones: "Western und Eastern Plaguelands, Felwood", routeUrl: ROUTE_HIGH } },
      { id: 8838, name: "Sungrass", farm: { zones: "The Hinterlands, Feralas, Azshara", routeUrl: ROUTE_HIGH } },
      { id: 8839, name: "Blindweed", farm: { zones: "Swamp of Sorrows, Un'Goro Crater", routeUrl: ROUTE_HIGH } },
      { id: 8845, name: "Ghost Mushroom", farm: { zones: "Höhlen: Fungal Rock (Un'Goro), The Hinterlands", routeUrl: ROUTE_HIGH } },
      { id: 8846, name: "Gromsblood", farm: { zones: "Felwood, Blasted Lands", routeUrl: ROUTE_HIGH } },
      { id: 13463, name: "Dreamfoil", farm: { zones: "Azshara, Un'Goro Crater, Burning Steppes", routeUrl: ROUTE_HIGH } },
      { id: 13464, name: "Golden Sansam", farm: { zones: "Azshara, Felwood", routeUrl: ROUTE_HIGH } },
      { id: 13465, name: "Mountain Silversage", farm: { zones: "Winterspring, Un'Goro Crater", routeUrl: ROUTE_HIGH } },
      { id: 13466, name: "Plaguebloom", farm: { zones: "Eastern und Western Plaguelands, Felwood", routeUrl: ROUTE_HIGH } },
      { id: 13467, name: "Icecap", farm: { zones: "Winterspring", routeUrl: ROUTE_HIGH } },
      { id: 13468, name: "Black Lotus", farm: { zones: "Winterspring, Eastern Plaguelands, Burning Steppes, Silithus", routeUrl: ROUTE_HIGH } },
      { id: 248821, name: "Demonsage", farm: { zones: "Fundorte noch nicht dokumentiert" } },
      { id: 248822, name: "Death Lotus", farm: { zones: "Fundorte noch nicht dokumentiert" } },
      { id: 248823, name: "Marefoil", farm: { zones: "Fundorte noch nicht dokumentiert" } },
      { id: 249274, name: "Stranglevine", farm: { zones: "Fundorte noch nicht dokumentiert" } },
      { id: 249399, name: "Frilled Lichen", farm: { zones: "Fundorte noch nicht dokumentiert" } },
      { id: 249424, name: "Rosecap", farm: { zones: "Fundorte noch nicht dokumentiert" } },
      { id: 268415, name: "Commonplace Herb Seeds" },
      { id: 268416, name: "Uncommon Herb Seeds" },
      { id: 268417, name: "Unusual Herb Seeds" },
      { id: 268418, name: "Scarce Herb Seeds" },
    ],
  },
  {
    key: "food",
    label: "Bufffood",
    items: [
      { id: 250065, name: "Savory Stag Sliders" },
      { id: 250067, name: "Bat Hachee" },
      { id: 250068, name: "Savory Turtle Stew" },
      { id: 250069, name: "Flank au Poivre" },
      { id: 250070, name: "Bear Bruscitti" },
      { id: 250071, name: "Steaming Stag Steak" },
      { id: 250072, name: "Swiftstrike Steak" },
      { id: 250073, name: "Raging Raptor Ribs" },
      { id: 250074, name: "Bear Brisket" },
      { id: 250075, name: "Prehistoric Pulled Raptor" },
      { id: 250076, name: "Raptor Rouladen" },
      { id: 250077, name: "Twice-Spiced Raptor Slice" },
      { id: 250078, name: "Giant Scrambled Eggs" },
      { id: 250079, name: "Tasty Raptor Bites" },
      { id: 250080, name: "Breakfast Omelette" },
      { id: 250081, name: "Clam Linguine" },
      { id: 274971, name: "Briny Seafood Stew" },
      { id: 274976, name: "Plain Ol' Paletusk" },
      { id: 286152, name: "Plated Armorfish" },
      { id: 263509, name: "Skywall Souffle" },
      { id: 263512, name: "Pincer Bites" },
      { id: 267341, name: "Sweetpaw Jam" },
      { id: 249865, name: "Peace Tea" },
      { id: 249866, name: "Royal Tea" },
      { id: 249867, name: "Root Tea" },
      { id: 249868, name: "Triage Tea" },
      { id: 249869, name: "Sunny Tea" },
      { id: 249870, name: "Sage's Tea" },
      { id: 249871, name: "Venomous Smoothie" },
      { id: 249872, name: "Slimy Smoothie" },
      { id: 249873, name: "Mrrggl Smrrthle" },
      { id: 249874, name: "Calcified Smoothie" },
      { id: 249875, name: "Spicy Smoothie" },
      { id: 249876, name: "Wicked Smoothie" },
      { id: 20452, name: "Smoked Desert Dumplings" },
      { id: 18254, name: "Runn Tum Tuber Surprise" },
      { id: 13928, name: "Grilled Squid" },
      { id: 13931, name: "Nightfin Soup" },
      { id: 21217, name: "Sagefish Delight" },
      { id: 21072, name: "Smoked Sagefish" },
      { id: 13932, name: "Poached Sunscale Salmon" },
      { id: 13927, name: "Cooked Glossy Mightfish" },
      { id: 13934, name: "Mightfish Steak" },
      { id: 13933, name: "Lobster Stew" },
      { id: 13935, name: "Baked Salmon" },
      { id: 18045, name: "Tender Wolf Steak" },
      { id: 12218, name: "Monster Omelet" },
      { id: 12216, name: "Spiced Chili Crab" },
      { id: 12215, name: "Heavy Kodo Stew" },
      { id: 12214, name: "Mystery Stew" },
      { id: 12213, name: "Carrion Surprise" },
      { id: 12212, name: "Jungle Stew" },
      { id: 12210, name: "Roast Raptor" },
      { id: 12217, name: "Dragonbreath Chili" },
      { id: 16971, name: "Clamlette Surprise" },
      { id: 17222, name: "Spider Sausage" },
      { id: 13851, name: "Hot Wolf Ribs" },
      { id: 20074, name: "Heavy Crocolisk Stew" },
      { id: 21151, name: "Rumsey Rum Black Label" },
    ],
  },
  {
    key: "enchanting",
    label: "Verzauberkunst",
    items: [
      { id: 10940, name: "Strange Dust" },
      { id: 10938, name: "Lesser Magic Essence" },
      { id: 10939, name: "Greater Magic Essence" },
      { id: 10978, name: "Small Glimmering Shard" },
      { id: 11084, name: "Large Glimmering Shard" },
      { id: 11083, name: "Soul Dust" },
      { id: 10998, name: "Lesser Astral Essence" },
      { id: 11082, name: "Greater Astral Essence" },
      { id: 11138, name: "Small Glowing Shard" },
      { id: 11139, name: "Large Glowing Shard" },
      { id: 11137, name: "Vision Dust" },
      { id: 11134, name: "Lesser Mystic Essence" },
      { id: 11135, name: "Greater Mystic Essence" },
      { id: 11177, name: "Small Radiant Shard" },
      { id: 11178, name: "Large Radiant Shard" },
      { id: 11176, name: "Dream Dust" },
      { id: 11174, name: "Lesser Nether Essence" },
      { id: 11175, name: "Greater Nether Essence" },
      { id: 14343, name: "Small Brilliant Shard" },
      { id: 14344, name: "Large Brilliant Shard" },
      { id: 16204, name: "Illusion Dust" },
      { id: 16202, name: "Lesser Eternal Essence" },
      { id: 16203, name: "Greater Eternal Essence" },
      { id: 20725, name: "Nexus Crystal" },
      { id: 247786, name: "Mote of Magic" },
      { id: 247884, name: "Luminous Residue" },
      { id: 247883, name: "Crude Wax Effigy" },
      { id: 6217, name: "Copper Rod" },
      { id: 6338, name: "Silver Rod" },
      { id: 11128, name: "Golden Rod" },
      { id: 11144, name: "Truesilver Rod" },
      { id: 16206, name: "Arcanite Rod" },
    ],
  },
  {
    key: "other",
    label: "Sonstiges",
    items: [
      { id: 12811, name: "Righteous Orb" },
    ],
  },
];

const DEFAULT_ITEM_IDS = CATEGORIES.flatMap((c) => c.items.map((i) => i.id));

const ITEM_META = new Map(
  CATEGORIES.flatMap((c) =>
    c.items.map((i) => [i.id, { category: c.key, rank: i.rank, farm: i.farm, name: i.name }] as const),
  ),
);

export function itemMeta(itemId: number) {
  const meta = ITEM_META.get(itemId);
  return { category: meta?.category ?? "other", rank: meta?.rank, farm: meta?.farm };
}

export function itemName(itemId: number): string | undefined {
  return ITEM_META.get(itemId)?.name;
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
