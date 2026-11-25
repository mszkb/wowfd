import { CATEGORIES, itemMeta, type FarmInfo, type Region } from "./config";
import type { PriceItem, Snapshot } from "./tsm";

export interface PriceViewItem extends PriceItem {
  category: string;
  rank?: number;
  farm?: FarmInfo;
}

/** Snapshot plus Kategorie- und Farm-Angaben – Antwort von /api/prices und Daten der Seite. */
export interface PricesView {
  region: Region;
  tsmUpdatedAt: string;
  fetchedAt: string;
  items: PriceViewItem[];
  categories: { key: string; label: string }[];
}

export function toPricesView(snapshot: Snapshot): PricesView {
  return {
    ...snapshot,
    items: snapshot.items.map((item) => ({ ...item, ...itemMeta(item.itemId) })),
    categories: CATEGORIES.map(({ key, label }) => ({ key, label })),
  };
}
