import { NextResponse } from "next/server";
import { parseRegion } from "@/lib/config";
import { saveSnapshotIfNew } from "@/lib/store";
import { getCurrentSnapshot } from "@/lib/tsm";

export async function GET(request: Request) {
  const region = parseRegion(new URL(request.url).searchParams.get("region"));
  if (!region) {
    return NextResponse.json({ error: "Ungültige Region (eu | us)" }, { status: 400 });
  }

  let snapshot;
  try {
    snapshot = await getCurrentSnapshot(region);
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

  return NextResponse.json({ ...snapshot, stored });
}
