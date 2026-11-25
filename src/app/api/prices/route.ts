import { NextResponse } from "next/server";
import { parseRegion } from "@/lib/config";
import { toPricesView } from "@/lib/prices";
import { saveSnapshotIfNew } from "@/lib/store";
import { getCurrentSnapshot, refreshSnapshot } from "@/lib/snapshots";
import { parseSelection } from "@/lib/sources";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const region = parseRegion(params.get("region"));
  const refresh = params.get("refresh") === "1";
  if (!region) {
    return NextResponse.json({ error: "Ungültige Region (eu | us)" }, { status: 400 });
  }

  const selection = parseSelection(params.get("source"), params.get("house"));
  if (!selection) {
    return NextResponse.json({ error: "Ungültige Quelle oder ungültiges Auktionshaus" }, { status: 400 });
  }

  let snapshot;
  try {
    snapshot = await (refresh
      ? refreshSnapshot(region, selection)
      : getCurrentSnapshot(region, selection));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Preisdaten konnten nicht geladen werden" }, { status: 502 });
  }

  // Ein Fehler beim Speichern soll die Antwort mit den aktuellen Preisen nicht verhindern.
  let stored = false;
  try {
    stored = await saveSnapshotIfNew(snapshot);
  } catch (err) {
    console.error("Snapshot konnte nicht gespeichert werden", err);
  }

  return NextResponse.json({
    ...toPricesView(snapshot),
    source: selection.source,
    ...(selection.source === "blizzard" ? { house: selection.house } : {}),
    stored,
  });
}
