"use client";

import { useEffect, useState } from "react";

interface PriceItem {
  itemId: number;
  name?: string;
  values: Record<string, number>;
  category: string;
  rank?: number;
  farm?: { zones: string; routeUrl?: string };
}
interface Prices {
  tsmUpdatedAt: string;
  fetchedAt: string;
  items: PriceItem[];
  categories: { key: string; label: string }[];
}
interface Point {
  t: string;
  values: Record<string, number>;
}

const fmtDate = (iso: string) => new Date(iso).toLocaleString("de-DE");
/** Preisspalten liefert TSM in Kupfer; angezeigt wird Gold/Silber/Kupfer. */
const HIDDEN_COLUMNS = new Set(["avgSalePrice", "saleRate"]);
const PRICE_COLUMNS = new Set(["marketValue", "minBuyout", "recent", "historical", "avgSalePrice"]);

function fmtValue(column: string, n: number | undefined) {
  if (n === undefined) return "–";
  if (!PRICE_COLUMNS.has(column)) {
    return n.toLocaleString("de-DE", { maximumFractionDigits: n < 10 ? 1 : 0 });
  }
  const copper = Math.round(n);
  if (copper === 0) return "–";
  const g = Math.floor(copper / 10_000);
  const s = Math.floor((copper % 10_000) / 100);
  const c = copper % 100;
  const parts = [];
  if (g > 0) parts.push(`${g.toLocaleString("de-DE")}g`);
  if (g > 0 || s > 0) parts.push(`${s}s`);
  parts.push(`${c}c`);
  return parts.join(" ");
}

function ItemLabel({ item }: { item: PriceItem }) {
  return (
    <span className="item">
      {/* eslint-disable-next-line @next/next/no-img-element -- kleine lokale Icons, keine Optimierung nötig */}
      <img src={`/icons/${item.itemId}.jpg`} alt="" width={28} height={28} loading="lazy" />
      {item.name ?? `Item ${item.itemId}`}
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
        <span>Min {fmtValue(column, y0)}</span>
        <span>Max {fmtValue(column, y1)}</span>
        <span>{data.length} Datenpunkte</span>
      </p>
    </>
  );
}

type SortKey = "name" | string;

function CategoryTable({
  label,
  items,
  columns,
  selected,
  onSelect,
}: {
  label: string;
  items: PriceItem[];
  columns: string[];
  selected: number | null;
  onSelect: (itemId: number) => void;
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
      <th key={key} aria-sort={active ? (sort.desc ? "descending" : "ascending") : "none"}>
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
          <thead>
            <tr>
              {header("name", "Item")}
              {columns.map((c) => header(c, c))}
              {showFarm && <th className="left">Farmen</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.itemId} aria-selected={item.itemId === selected}
                onClick={() => onSelect(item.itemId)}>
                <td><ItemLabel item={item} /></td>
                {columns.map((c) => <td key={c}>{fmtValue(c, item.values[c])}</td>)}
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

export default function Home() {
  const [region, setRegion] = useState("eu");
  const [prices, setPrices] = useState<Prices | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [column, setColumn] = useState<string | null>(null);
  const [days, setDays] = useState(30);
  const [points, setPoints] = useState<Point[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let stale = false;
    getJson<Prices>(`/api/prices?region=${region}`)
      .then((p) => {
        if (stale) return;
        setPrices(p);
        setError(null);
      })
      .catch((e: Error) => !stale && setError(e.message));
    return () => {
      stale = true;
    };
  }, [region]);

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

  const switchRegion = (r: string) => {
    setRegion(r);
    setPrices(null);
    setPoints(null);
  };

  return (
    <main>
      <h1>WoW-Forever-Preise (TSM)</h1>
      <div className="bar">
        {["eu", "us"].map((r) => (
          <button key={r} onClick={() => switchRegion(r)} aria-pressed={r === region}
            disabled={r === region}>
            {r.toUpperCase()}
          </button>
        ))}
        <button onClick={refresh} disabled={!prices || refreshing}>
          {refreshing ? "Aktualisiere …" : "Jetzt aktualisieren"}
        </button>
        {prices && (
          <span className="muted">
            TSM-Stand: {fmtDate(prices.tsmUpdatedAt)} · abgerufen: {fmtDate(prices.fetchedAt)}
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
              <CategoryTable key={cat.key} label={cat.label} items={items} columns={columns}
                selected={selected}
                onSelect={(itemId) => {
                  setPoints(null);
                  setSelected(itemId);
                }} />
            );
          })}
        </div>
      )}
    </main>
  );
}
