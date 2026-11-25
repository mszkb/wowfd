import { itemName, trackedItemIds, type Region } from "./config";
import type { PriceItem, Snapshot } from "./tsm";

interface CommodityAuction {
  item: { id: number };
  quantity: number;
  unit_price: number;
}

let token: { value: string; expiresAt: number } | null = null;

/** Zugriffstoken per Client-Credentials; bis kurz vor Ablauf im Speicher gehalten. */
async function accessToken(): Promise<string> {
  if (token && token.expiresAt > Date.now() + 60_000) return token.value;
  const id = process.env.BLIZZARD_CLIENT_ID;
  const secret = process.env.BLIZZARD_CLIENT_SECRET;
  if (!id || !secret) {
    throw new Error("BLIZZARD_CLIENT_ID / BLIZZARD_CLIENT_SECRET sind nicht gesetzt");
  }
  const res = await fetch("https://oauth.battle.net/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Blizzard-Token: HTTP ${res.status}`);
  const body = (await res.json()) as { access_token: string; expires_in: number };
  token = { value: body.access_token, expiresAt: Date.now() + body.expires_in * 1000 };
  return token.value;
}

/**
 * Liest die Commodity-Angebote eines Auktionshauses und verdichtet sie je Item zu
 * günstigstem Stückpreis, angebotener Menge und Anzahl der Angebote.
 */
export async function fetchBlizzardSnapshot(region: Region, house: number): Promise<Snapshot> {
  // Die API verlangt ein Regelwerk im Pfad, liefert aber unabhängig davon das Haus mit dieser ID.
  const url =
    `https://${region}.api.blizzard.com/data/wow/ruleset/1/auctions/${house}/commodities` +
    `?namespace=dynamic-forever-${region}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${await accessToken()}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Blizzard-API (${region}, Haus ${house}): HTTP ${res.status}`);
  const body = (await res.json()) as { auctions?: CommodityAuction[] };

  const tracked = new Set(trackedItemIds());
  const byItem = new Map<number, { minBuyout: number; quantity: number; auctions: number }>();
  for (const a of body.auctions ?? []) {
    if (!tracked.has(a.item.id)) continue;
    const entry = byItem.get(a.item.id) ?? { minBuyout: Infinity, quantity: 0, auctions: 0 };
    entry.minBuyout = Math.min(entry.minBuyout, a.unit_price);
    entry.quantity += a.quantity;
    entry.auctions += 1;
    byItem.set(a.item.id, entry);
  }
  const items: PriceItem[] = [...byItem].map(([itemId, values]) => ({
    itemId,
    name: itemName(itemId),
    values,
  }));

  const now = new Date();
  const modified = new Date(res.headers.get("last-modified") ?? NaN);
  const updated = Number.isNaN(modified.getTime()) ? now : modified;
  updated.setUTCMilliseconds(0);
  return {
    region,
    scope: `blizzard/${house}`,
    tsmUpdatedAt: updated.toISOString(),
    fetchedAt: now.toISOString(),
    items,
  };
}
