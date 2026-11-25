import { NextResponse } from "next/server";
import { REGIONS } from "@/lib/config";
import { saveSnapshotIfNew } from "@/lib/store";
import { getCurrentSnapshot } from "@/lib/tsm";

export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const results = await Promise.all(
    REGIONS.map(async (region) => {
      try {
        const snapshot = await getCurrentSnapshot(region);
        const stored = await saveSnapshotIfNew(snapshot);
        return { region, ok: true, tsmUpdatedAt: snapshot.tsmUpdatedAt, stored };
      } catch (err) {
        console.error(`Cron ${region}`, err);
        return { region, ok: false, error: err instanceof Error ? err.message : String(err) };
      }
    }),
  );

  return NextResponse.json({ results }, { status: results.every((r) => r.ok) ? 200 : 500 });
}
