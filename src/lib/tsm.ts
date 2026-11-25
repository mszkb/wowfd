import {
  trackedItemIds,
  csvUrl,
  type Region,
} from "./config";
import { parseCsv } from "./csv";

export interface PriceItem {
  itemId: number;
  name?: string;
  /** Alle numerischen Spalten der CSV, Schlüssel = Spaltenname. */
  values: Record<string, number>;
}

export interface Snapshot {
  region: Region;
  /** Trennt gespeicherte Daten je Quelle; leer oder fehlend = TSM. */
  scope?: string;
  /** Datenstand der Quelle (ISO 8601, UTC). Der Name stammt aus der Zeit, als TSM die einzige Quelle war. */
  tsmUpdatedAt: string;
  /** Zeitpunkt des CSV-Abrufs (ISO 8601, UTC). */
  fetchedAt: string;
  items: PriceItem[];
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const ID_COLUMNS = ["itemid", "id", "item"];
const NAME_COLUMNS = ["name", "itemname"];
const UPDATED_COLUMNS = ["updatedat", "lastupdated", "lastmodified", "updated", "timestamp"];

function findColumn(columns: string[], candidates: string[]) {
  return candidates
    .map((c) => columns.find((col) => norm(col) === c))
    .find((c) => c !== undefined);
}

/** Akzeptiert ISO-Strings sowie Unix-Zeit in Sekunden oder Millisekunden. */
function toDate(raw: string | null | undefined): Date | null {
  if (!raw) return null;
  const n = Number(raw);
  const d = Number.isFinite(n) ? new Date(n < 1e11 ? n * 1000 : n) : new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function buildSnapshot(
  region: Region,
  csv: string,
  lastModified: string | null,
  now = new Date(),
): Snapshot {
  const rows = parseCsv(csv);
  if (rows.length === 0) throw new Error("TSM-CSV ist leer");
  const columns = Object.keys(rows[0]);
  const idCol = findColumn(columns, ID_COLUMNS);
  if (!idCol) {
    throw new Error(`Keine Item-ID-Spalte in der TSM-CSV gefunden (${columns.join(", ")})`);
  }
  const nameCol = findColumn(columns, NAME_COLUMNS);
  const updatedCol = findColumn(columns, UPDATED_COLUMNS);
  const tracked = new Set(trackedItemIds());

  let updated: Date | null = null;
  const items: PriceItem[] = [];
  for (const row of rows) {
    if (updatedCol) {
      const d = toDate(row[updatedCol]);
      if (d && (!updated || d > updated)) updated = d;
    }
    const itemId = Number(row[idCol]);
    if (!Number.isInteger(itemId)) continue;
    if (tracked.size > 0 && !tracked.has(itemId)) continue;
    const values: Record<string, number> = {};
    for (const col of columns) {
      if (col === idCol || col === nameCol || col === updatedCol) continue;
      if (row[col] === "") continue;
      const n = Number(row[col]);
      if (Number.isFinite(n)) values[col] = n;
    }
    items.push({ itemId, ...(nameCol ? { name: row[nameCol] } : {}), values });
  }

  // Fallback-Kette für den Datenstand: CSV-Spalte → Last-Modified → Abrufzeit.
  updated ??= toDate(lastModified) ?? now;
  updated.setUTCMilliseconds(0);

  return {
    region,
    tsmUpdatedAt: updated.toISOString(),
    fetchedAt: now.toISOString(),
    items,
  };
}

export async function fetchTsmSnapshot(region: Region): Promise<Snapshot> {
  const res = await fetch(csvUrl(region), { cache: "no-store" });
  if (!res.ok) throw new Error(`TSM-CSV (${region}): HTTP ${res.status}`);
  return buildSnapshot(region, await res.text(), res.headers.get("last-modified"));
}
