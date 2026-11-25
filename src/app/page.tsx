"use client";

import { useEffect, useState } from "react";

interface PriceItem {
  itemId: number;
  name?: string;
  values: Record<string, number>;
}
interface Prices {
  tsmUpdatedAt: string;
  fetchedAt: string;
  items: PriceItem[];
}
interface Point {
  t: string;
  values: Record<string, number>;
}

const fmtDate = (iso: string) => new Date(iso).toLocaleString("de-DE");
const fmtNum = (n: number | undefined) => (n === undefined ? "–" : n.toLocaleString("de-DE"));

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
        <span>Min {fmtNum(y0)}</span>
        <span>Max {fmtNum(y1)}</span>
        <span>{data.length} Datenpunkte</span>
      </p>
    </>
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

  const columns = [...new Set(prices?.items.flatMap((i) => Object.keys(i.values)) ?? [])];
  const chartColumn = column && columns.includes(column) ? column : columns[0];
  const selectedItem = prices?.items.find((i) => i.itemId === selected);

  const switchRegion = (r: string) => {
    setRegion(r);
    setPrices(null);
    setPoints(null);
  };

  return (
    <main>
      <h1>WoW-Preise (TSM)</h1>
      <div className="bar">
        {["eu", "us"].map((r) => (
          <button key={r} onClick={() => switchRegion(r)} aria-pressed={r === region}
            disabled={r === region}>
            {r.toUpperCase()}
          </button>
        ))}
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
            <strong>{selectedItem.name ?? `Item ${selectedItem.itemId}`}</strong>
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
        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                {columns.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {prices.items.map((item) => (
                <tr key={item.itemId} aria-selected={item.itemId === selected}
                  onClick={() => {
                    setPoints(null);
                    setSelected(item.itemId);
                  }}>
                  <td>{item.name ?? item.itemId}</td>
                  {columns.map((c) => <td key={c}>{fmtNum(item.values[c])}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
