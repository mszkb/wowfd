"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { PricesView, PriceViewItem } from "@/lib/prices";

type PriceItem = PriceViewItem;
type Prices = PricesView;

interface Point {
  t: string;
  values: Record<string, number>;
}

// Feste Zeitzone, damit Server- und Browser-Rendering denselben Text liefern.
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("de-DE", { timeZone: "Europe/Berlin" });
/** Preisspalten liefert TSM in Kupfer; angezeigt wird Gold/Silber/Kupfer. */
const HIDDEN_COLUMNS = new Set(["avgSalePrice", "saleRate"]);
const PRICE_COLUMNS = new Set(["marketValue", "minBuyout", "recent", "historical", "avgSalePrice"]);

const COINS = [
  { key: "gold", label: "Gold", unit: "g" },
  { key: "silver", label: "Silber", unit: "s" },
  { key: "copper", label: "Kupfer", unit: "c" },
] as const;

/** Wert einer Spalte: Preise als Gold/Silber/Kupfer mit Münz-Icons, sonst als Zahl. */
function Value({ column, n }: { column: string; n: number | undefined }) {
  if (n === undefined) return <>–</>;
  if (!PRICE_COLUMNS.has(column)) {
    return <>{n.toLocaleString("de-DE", { maximumFractionDigits: n < 10 ? 1 : 0 })}</>;
  }
  const copper = Math.round(n);
  if (copper === 0) return <>–</>;
  const amounts = [Math.floor(copper / 10_000), Math.floor((copper % 10_000) / 100), copper % 100];
  const first = amounts.findIndex((a) => a > 0);
  return (
    <span className="money">
      {COINS.map((coin, i) =>
        i < first ? null : (
          <span key={coin.key} className="coin">
            {amounts[i].toLocaleString("de-DE")}
            {/* Der Alt-Text hält die Einheit für Screenreader, Crawler und Agents lesbar. */}
            {/* eslint-disable-next-line @next/next/no-img-element -- 16-px-Icon */}
            <img src={`/coins/${coin.key}.png`} alt={coin.unit} title={coin.label} width={14} height={14} />
          </span>
        ),
      )}
    </span>
  );
}

function ItemLabel({ item, onCopy }: { item: PriceItem; onCopy?: (name: string) => void }) {
  const name = item.name ?? `Item ${item.itemId}`;
  return (
    <span className="item">
      {/* eslint-disable-next-line @next/next/no-img-element -- kleine lokale Icons, keine Optimierung nötig */}
      <img src={`/icons/${item.itemId}.jpg`} alt="" width={28} height={28} loading="lazy" />
      {onCopy ? (
        <button
          className="copy"
          title="Namen kopieren"
          onClick={(e) => {
            // Nur kopieren; der Klick auf die übrige Zeile öffnet weiterhin den Verlauf.
            e.stopPropagation();
            onCopy(name);
          }}>
          {name}
        </button>
      ) : (
        name
      )}
      {item.rank && <span className="rank" title={`Qualität ${item.rank}`}>{"★".repeat(item.rank)}</span>}
    </span>
  );
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
  return body as T;
}

function Chart({ points, column }: { points: Point[]; column: string }) {
  const data = points
    .map((p) => ({ x: Date.parse(p.t), y: p.values[column] }))
    .filter((d) => d.y !== undefined);
  if (data.length < 2) {
    return <p className="muted">Noch zu wenige Datenpunkte für einen Verlauf.</p>;
  }
  const xs = data.map((d) => d.x);
  const ys = data.map((d) => d.y);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const line = data
    .map((d) => {
      const x = ((d.x - x0) / (x1 - x0 || 1)) * 580 + 10;
      const y = 190 - ((d.y - y0) / (y1 - y0 || 1)) * 180;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <>
      <svg className="chart" viewBox="0 0 600 200" preserveAspectRatio="none" role="img"
        aria-label={`Verlauf ${column}`}>
        <polyline points={line} fill="none" stroke="currentColor" strokeWidth="2"
          vectorEffect="non-scaling-stroke" />
      </svg>
      <p className="muted bar">
        <span>Min <Value column={column} n={y0} /></span>
        <span>Max <Value column={column} n={y1} /></span>
        <span>{data.length} Datenpunkte</span>
      </p>
    </>
  );
}

type SortKey = "name" | string;

function CategoryTable({
  label,
  caption,
  items,
  columns,
  selected,
  onSelect,
  onCopy,
}: {
  label: string;
  caption: string;
  items: PriceItem[];
  columns: string[];
  selected: number | null;
  onSelect: (itemId: number) => void;
  onCopy: (name: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({
    key: "marketValue",
    desc: true,
  });
  const showFarm = items.some((i) => i.farm);

  const needle = query.trim().toLowerCase();
  const rows = items
    .filter((i) => (i.name ?? String(i.itemId)).toLowerCase().includes(needle))
    .sort((a, b) => {
      const cmp =
        sort.key === "name"
          ? (a.name ?? "").localeCompare(b.name ?? "")
          : (a.values[sort.key] ?? -Infinity) - (b.values[sort.key] ?? -Infinity);
      return sort.desc ? -cmp : cmp;
    });

  const header = (key: SortKey, text: string) => {
    const active = sort.key === key;
    return (
      <th key={key} scope="col" aria-sort={active ? (sort.desc ? "descending" : "ascending") : "none"}>
        <button
          className="sort"
          onClick={() =>
            setSort({ key, desc: active ? !sort.desc : key !== "name" })
          }>
          {text}
          <span aria-hidden="true">{active ? (sort.desc ? " ▼" : " ▲") : ""}</span>
        </button>
      </th>
    );
  };

  return (
    <section className={showFarm ? "category wide" : "category"}>
      <div className="bar">
        <h2>{label}</h2>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`${label} durchsuchen`}
          aria-label={`${label} durchsuchen`}
        />
      </div>
      <div className="scroll">
        <table>
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              {header("name", "Item")}
              {columns.map((c) => header(c, c))}
              {showFarm && <th scope="col" className="left">Farmen</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.itemId} aria-selected={item.itemId === selected}
                onClick={() => onSelect(item.itemId)}>
                <th scope="row"><ItemLabel item={item} onCopy={onCopy} /></th>
                {columns.map((c) => <td key={c}><Value column={c} n={item.values[c]} /></td>)}
                {showFarm && (
                  <td className="left farm">
                    {item.farm ? (
                      <>
                        {item.farm.zones}
                        {item.farm.routeUrl && (
                          <>
                            {" · "}
                            <a href={item.farm.routeUrl} target="_blank" rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}>
                              Route
                            </a>
                          </>
                        )}
                      </>
                    ) : "–"}
                  </td>
                )}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr className="empty">
                <td colSpan={columns.length + (showFarm ? 2 : 1)}>Keine Treffer</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function PriceBoard({
  region,
  initial,
}: {
  region: "eu" | "us";
  /** Serverseitig geladene Preise, damit die Tabellen schon im HTML stehen. */
  initial: Prices | null;
}) {
  const [prices, setPrices] = useState<Prices | null>(initial);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [column, setColumn] = useState<string | null>(null);
  const [days, setDays] = useState(30);
  const [points, setPoints] = useState<Point[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Der Abruf über die API hält die Anzeige aktuell und speichert neue Datenstände.
  useEffect(() => {
    let stale = false;
    getJson<Prices>(`/api/prices?region=${region}`)
      .then((p) => {
        if (stale) return;
        setPrices(p);
        setError(null);
      })
      .catch((e: Error) => !stale && !initial && setError(e.message));
    return () => {
      stale = true;
    };
  }, [region, initial]);

  const showToast = (text: string) => {
    setToast(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  };

  const copyName = async (name: string) => {
    try {
      await navigator.clipboard.writeText(name);
      showToast(`„${name}“ kopiert`);
    } catch {
      showToast("Kopieren nicht möglich");
    }
  };

  useEffect(() => {
    if (selected === null) return;
    let stale = false;
    getJson<{ points: Point[] }>(
      `/api/history?itemId=${selected}&region=${region}&days=${days}`,
    )
      .then((h) => !stale && setPoints(h.points))
      .catch((e: Error) => !stale && setError(e.message));
    return () => {
      stale = true;
    };
  }, [selected, region, days]);

  const columns = [
    ...new Set(prices?.items.flatMap((i) => Object.keys(i.values)) ?? []),
  ].filter((c) => !HIDDEN_COLUMNS.has(c));
  const chartColumn = column && columns.includes(column) ? column : columns[0];
  const selectedItem = prices?.items.find((i) => i.itemId === selected);

  const refresh = async () => {
    setRefreshing(true);
    try {
      setPrices(await getJson<Prices>(`/api/prices?region=${region}&refresh=1`));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <>
      <div className="bar">
        <nav aria-label="Region" className="bar">
          {(["eu", "us"] as const).map((r) => (
            <Link key={r} href={r === "eu" ? "/" : "/us"} className="tab"
              aria-current={r === region ? "page" : undefined}>
              {r.toUpperCase()}
            </Link>
          ))}
        </nav>
        <button onClick={refresh} disabled={!prices || refreshing}>
          {refreshing ? "Aktualisiere …" : "Jetzt aktualisieren"}
        </button>
        {prices && (
          <span className="muted">
            TSM-Stand: <time dateTime={prices.tsmUpdatedAt}>{fmtDate(prices.tsmUpdatedAt)}</time>
            {" · abgerufen: "}
            <time dateTime={prices.fetchedAt}>{fmtDate(prices.fetchedAt)}</time>
          </span>
        )}
      </div>

      {error && <p role="alert">Fehler: {error}</p>}
      {!prices && !error && <p className="muted">Lade …</p>}

      {selectedItem && chartColumn && (
        <section>
          <div className="bar">
            <strong><ItemLabel item={selectedItem} /></strong>
            <select value={chartColumn} onChange={(e) => setColumn(e.target.value)}
              aria-label="Wert">
              {columns.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select value={days} onChange={(e) => setDays(Number(e.target.value))}
              aria-label="Zeitraum">
              {[7, 30, 90, 365].map((d) => <option key={d} value={d}>{d} Tage</option>)}
            </select>
          </div>
          {points ? <Chart points={points} column={chartColumn} /> : <p className="muted">Lade …</p>}
        </section>
      )}

      {prices && (
        <div className="categories">
          {prices.categories.map((cat) => {
            const items = prices.items.filter((i) => i.category === cat.key);
            if (items.length === 0) return null;
            return (
              <CategoryTable key={cat.key} label={cat.label}
                caption={`${cat.label}: Preise in WoW Forever, Region ${region.toUpperCase()}`}
                items={items} columns={columns} selected={selected} onCopy={copyName}
                onSelect={(itemId) => {
                  setPoints(null);
                  setSelected(itemId);
                }} />
            );
          })}
        </div>
      )}

      <div className="toast" role="status" aria-live="polite">
        {toast && <span>{toast}</span>}
      </div>
    </>
  );
}
