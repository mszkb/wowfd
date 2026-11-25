import { NextResponse } from "next/server";
import { HISTORY_MAX_AGE_DAYS, parseRegion } from "@/lib/config";
import { loadHistory } from "@/lib/store";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const region = parseRegion(params.get("region"));
  const itemId = Number(params.get("itemId"));
  const days = Number(params.get("days") ?? 30);

  if (!region) {
    return NextResponse.json({ error: "Ungültige Region (eu | us)" }, { status: 400 });
  }
  if (!Number.isInteger(itemId) || itemId <= 0) {
    return NextResponse.json({ error: "itemId fehlt oder ist ungültig" }, { status: 400 });
  }
  if (!Number.isFinite(days) || days <= 0 || days > HISTORY_MAX_AGE_DAYS) {
    return NextResponse.json(
      { error: `days muss zwischen 1 und ${HISTORY_MAX_AGE_DAYS} liegen` },
      { status: 400 },
    );
  }

  const cutoff = new Date(Date.now() - days * 86_400_000).toISOString();
  let history;
  try {
    history = await loadHistory(region);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Historie konnte nicht geladen werden" }, { status: 502 });
  }
  const points = history
    .filter((e) => e.t >= cutoff && e.items[itemId])
    .map((e) => ({ t: e.t, values: e.items[itemId] }));

  return NextResponse.json({ region, itemId, days, points });
}
