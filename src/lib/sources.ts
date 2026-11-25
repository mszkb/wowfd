/** Preisquellen und Blizzard-Auktionshäuser. Ohne Server-Abhängigkeiten, auch im Browser nutzbar. */

export const SOURCES = [
  { key: "tsm", label: "TSM (Region, täglich)" },
  { key: "blizzard", label: "Blizzard-API (Auktionshaus, stündlich)" },
] as const;
export type SourceKey = (typeof SOURCES)[number]["key"];

/**
 * Auktionshäuser von WoW Forever in der Blizzard-API: eines je Regelwerk und Fraktion.
 * Die API nennt nur die Fraktion; die Zuordnung zum Regelwerk ist aus dem Abgleich
 * mit den TSM-Dateien abgeleitet.
 */
export const HOUSES = [
  { id: 111, label: "Normal – Allianz" },
  { id: 114, label: "Normal – Horde" },
  { id: 117, label: "Normal – Blackwater" },
  { id: 110, label: "PvP – Allianz" },
  { id: 113, label: "PvP – Horde" },
  { id: 116, label: "PvP – Blackwater" },
  { id: 119, label: "Roleplay – Allianz" },
  { id: 120, label: "Roleplay – Horde" },
  { id: 121, label: "Roleplay – Blackwater" },
  { id: 123, label: "Roleplay PvP – Allianz" },
  { id: 124, label: "Roleplay PvP – Horde" },
  { id: 125, label: "Roleplay PvP – Blackwater" },
] as const;
export const DEFAULT_HOUSE = 111;

export interface SourceSelection {
  source: SourceKey;
  /** Nur für die Blizzard-API. */
  house: number;
}

export const DEFAULT_SELECTION: SourceSelection = { source: "tsm", house: DEFAULT_HOUSE };

/** Liest Quelle und Auktionshaus aus beliebigen Eingaben; null bei ungültigen Werten. */
export function parseSelection(
  source: string | null | undefined,
  house: string | number | null | undefined,
): SourceSelection | null {
  const s = source ?? "tsm";
  if (!SOURCES.some((x) => x.key === s)) return null;
  const h = house === null || house === undefined || house === "" ? DEFAULT_HOUSE : Number(house);
  if (!HOUSES.some((x) => x.id === h)) return null;
  return { source: s as SourceKey, house: h };
}

/** Query-Parameter für /api/prices und /api/history. */
export function selectionQuery(sel: SourceSelection): string {
  return sel.source === "tsm" ? "" : `&source=${sel.source}&house=${sel.house}`;
}

/** Trennt die gespeicherten Daten je Quelle; TSM bleibt auf den ursprünglichen Pfaden. */
export function storageScope(sel: SourceSelection): string {
  return sel.source === "tsm" ? "" : `blizzard/${sel.house}`;
}
