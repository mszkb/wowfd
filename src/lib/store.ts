import { BlobNotFoundError, get, head, list, put } from "@vercel/blob";
import { HISTORY_MAX_AGE_DAYS, blobAccess, type Region } from "./config";
import type { Snapshot } from "./tsm";

/** Aggregierte Historie: ein Eintrag pro TSM-Datenstand, aufsteigend sortiert. */
export interface HistoryEntry {
  t: string;
  items: Record<string, Record<string, number>>;
}

const prefix = (region: Region) => `snapshots/${region}/`;
const snapshotPath = (region: Region, tsmUpdatedAt: string) =>
  `${prefix(region)}${tsmUpdatedAt.replace(/:/g, "-")}.json`;
const latestPath = (region: Region) => `${prefix(region)}latest.json`;
const historyPath = (region: Region) => `history-${region}.json`;

async function readJson<T>(pathname: string): Promise<T | null> {
  try {
    // useCache: false, weil latest/history überschrieben werden.
    const res = await get(pathname, { access: blobAccess(), useCache: false });
    if (!res || res.statusCode !== 200) return null;
    return (await new Response(res.stream).json()) as T;
  } catch (err) {
    if (err instanceof BlobNotFoundError) return null;
    throw err;
  }
}

function writeJson(pathname: string, data: unknown, overwrite: boolean) {
  return put(pathname, JSON.stringify(data), {
    access: blobAccess(),
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: overwrite,
    cacheControlMaxAge: 60,
  });
}

async function exists(pathname: string): Promise<boolean> {
  try {
    await head(pathname);
    return true;
  } catch (err) {
    if (err instanceof BlobNotFoundError) return false;
    throw err;
  }
}

const toEntry = (s: Snapshot): HistoryEntry => ({
  t: s.tsmUpdatedAt,
  items: Object.fromEntries(s.items.map((i) => [i.itemId, i.values])),
});

function prune(entries: HistoryEntry[]): HistoryEntry[] {
  const cutoff = new Date(Date.now() - HISTORY_MAX_AGE_DAYS * 86_400_000).toISOString();
  const byTime = new Map(entries.filter((e) => e.t >= cutoff).map((e) => [e.t, e]));
  return [...byTime.values()].sort((a, b) => a.t.localeCompare(b.t));
}

/** Baut die Historie einmalig aus den Einzel-Snapshots auf (list() über den Prefix). */
async function rebuildHistory(region: Region): Promise<HistoryEntry[]> {
  const paths: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: prefix(region), cursor, limit: 1000 });
    for (const b of page.blobs) {
      if (b.pathname !== latestPath(region)) paths.push(b.pathname);
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  const entries: HistoryEntry[] = [];
  for (let i = 0; i < paths.length; i += 20) {
    const batch = await Promise.all(
      paths.slice(i, i + 20).map((p) => readJson<Snapshot>(p)),
    );
    for (const s of batch) if (s) entries.push(toEntry(s));
  }
  return prune(entries);
}

export async function loadHistory(region: Region): Promise<HistoryEntry[]> {
  const stored = await readJson<HistoryEntry[]>(historyPath(region));
  if (stored) return stored;
  const rebuilt = await rebuildHistory(region);
  if (rebuilt.length > 0) await writeJson(historyPath(region), rebuilt, true);
  return rebuilt;
}

// Pro Function-Instanz merken, was schon gespeichert ist – spart Blob-Aufrufe.
const known = new Map<Region, string>();

/**
 * Speichert den Snapshot, falls es für diesen TSM-Datenstand noch keinen gibt.
 * Gibt true zurück, wenn neu geschrieben wurde.
 */
export async function saveSnapshotIfNew(snapshot: Snapshot): Promise<boolean> {
  const { region, tsmUpdatedAt } = snapshot;
  if (known.get(region) === tsmUpdatedAt) return false;

  const path = snapshotPath(region, tsmUpdatedAt);
  if (await exists(path)) {
    known.set(region, tsmUpdatedAt);
    return false;
  }

  // Historie vor dem Schreiben laden, damit ein evtl. Rebuild den neuen
  // Snapshot nicht doppelt sieht.
  const history = await loadHistory(region);
  await writeJson(path, snapshot, false);
  await Promise.all([
    writeJson(latestPath(region), snapshot, true),
    writeJson(historyPath(region), prune([...history, toEntry(snapshot)]), true),
  ]);
  known.set(region, tsmUpdatedAt);
  return true;
}
