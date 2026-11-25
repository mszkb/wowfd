import { CATEGORIES, itemMeta, type FarmInfo, type Region } from "./config";
import type { SourceKey } from "./sources";
import type { PriceItem, Snapshot } from "./tsm";

export interface PriceViewItem extends PriceItem {
  category: string;
  rank?: number;
  farm?: FarmInfo;
}

/** Snapshot plus Kategorie- und Farm-Angaben – Antwort von /api/prices und Daten der Seite. */
export interface PricesView {
  region: Region;
  source?: SourceKey;
  house?: number;
  tsmUpdatedAt: string;
  fetchedAt: string;
  items: PriceViewItem[];
  categories: { key: string; label: string }[];
}

export function toPricesView(snapshot: Snapshot): PricesView {
  return {
    region: snapshot.region,
    tsmUpdatedAt: snapshot.tsmUpdatedAt,
    fetchedAt: snapshot.fetchedAt,
    items: snapshot.items.map((item) => ({ ...item, ...itemMeta(item.itemId) })),
    categories: CATEGORIES.map(({ key, label }) => ({ key, label })),
  };
}
