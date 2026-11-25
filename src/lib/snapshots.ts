import { revalidateTag, unstable_cache } from "next/cache";
import { fetchBlizzardSnapshot } from "./blizzard";
import {
  CSV_REVALIDATE_SECONDS,
  REFRESH_MIN_INTERVAL_SECONDS,
  trackedItemIds,
  type Region,
} from "./config";
import { DEFAULT_SELECTION, type SourceSelection } from "./sources";
import { fetchTsmSnapshot, type Snapshot } from "./tsm";

function fetchSnapshot(sel: SourceSelection, region: Region): Promise<Snapshot> {
  return sel.source === "blizzard"
    ? fetchBlizzardSnapshot(region, sel.house)
    : fetchTsmSnapshot(region);
}

const cacheTag = (sel: SourceSelection, region: Region) =>
  sel.source === "blizzard" ? `blizzard-${sel.house}-${region}` : `tsm-${region}`;

/**
 * Holt und filtert die Daten der gewählten Quelle; das Ergebnis wird 10 Minuten gecacht.
 * Gecacht wird das gefilterte Ergebnis statt der rohen Antwort, weil der
 * Next.js-Data-Cache Einträge über 2 MB nicht speichert.
 */
export function getCurrentSnapshot(
  region: Region,
  sel: SourceSelection = DEFAULT_SELECTION,
): Promise<Snapshot> {
  // Item-Liste gehört zum Cache-Key, damit eine geänderte Liste sofort greift.
  const key = [
    "snapshot",
    sel.source,
    sel.source === "blizzard" ? String(sel.house) : "",
    trackedItemIds().join(","),
  ];
  return unstable_cache(() => fetchSnapshot(sel, region), [...key, region], {
    revalidate: CSV_REVALIDATE_SECONDS,
    tags: [cacheTag(sel, region)],
  })();
}

/**
 * Holt die Daten am Cache vorbei, höchstens einmal pro Minute je Quelle und Region –
 * sonst könnte jeder Aufrufer beliebig viele Abrufe bei der Quelle auslösen.
 */
export async function refreshSnapshot(
  region: Region,
  sel: SourceSelection = DEFAULT_SELECTION,
): Promise<Snapshot> {
  const cached = await getCurrentSnapshot(region, sel);
  const ageSeconds = (Date.now() - Date.parse(cached.fetchedAt)) / 1000;
  if (ageSeconds < REFRESH_MIN_INTERVAL_SECONDS) return cached;
  const fresh = await fetchSnapshot(sel, region);
  revalidateTag(cacheTag(sel, region), { expire: 0 });
  return fresh;
}
