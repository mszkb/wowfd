import { NextResponse } from "next/server";
import { CATEGORIES, itemMeta, parseRegion } from "@/lib/config";
import { saveSnapshotIfNew } from "@/lib/store";
import { getCurrentSnapshot, refreshSnapshot } from "@/lib/tsm";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const region = parseRegion(params.get("region"));
  const refresh = params.get("refresh") === "1";
  if (!region) {
    return NextResponse.json({ error: "Ungültige Region (eu | us)" }, { status: 400 });
  }

  let snapshot;
  try {
    snapshot = await (refresh ? refreshSnapshot(region) : getCurrentSnapshot(region));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "TSM-CSV konnte nicht geladen werden" }, { status: 502 });
  }

  // Ein Fehler beim Speichern soll die Antwort mit den aktuellen Preisen nicht verhindern.
  let stored = false;
  try {
    stored = await saveSnapshotIfNew(snapshot);
  } catch (err) {
    console.error("Snapshot konnte nicht gespeichert werden", err);
  }

  return NextResponse.json({
    ...snapshot,
    // Reihenfolge wie in der Konfiguration statt wie in der CSV.
    items: snapshot.items
      .map((item) => ({ item, meta: itemMeta(item.itemId) }))
      .sort((a, b) => a.meta.index - b.meta.index)
      .map(({ item, meta }) => ({ ...item, category: meta.category, rank: meta.rank })),
    categories: CATEGORIES.map(({ key, label }) => ({ key, label })),
    stored,
  });
}
