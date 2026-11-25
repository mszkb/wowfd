# wowfd

WoW-Preise aus der TSM-CSV, mit Verlauf. Next.js (App Router) auf Vercel,
Persistenz ausschließlich in Vercel Blob.

## Endpunkte

| Route | Zweck |
| --- | --- |
| `GET /api/prices?region=eu` | Holt die CSV serverseitig (10 Min gecacht), filtert die Items, speichert bei neuem TSM-Datenstand einen Snapshot. Antwort: `items`, `tsmUpdatedAt`, `fetchedAt`, `stored`. |
| `GET /api/history?itemId=…&region=…&days=30` | Verlauf eines Items für die Charts. |
| `GET /api/cron` | Speichert EU und US. Nur mit `Authorization: Bearer $CRON_SECRET`. |

## Blob-Layout

- `snapshots/{region}/{tsmUpdatedAt}.json` – ein Snapshot je Datenstand (wird nie überschrieben; `:` im Zeitstempel ist durch `-` ersetzt)
- `snapshots/{region}/latest.json` – letzter Snapshot
- `history-{region}.json` – aggregierte Historie (max. 1 Jahr); fehlt sie, wird sie per `list()` aus den Snapshots neu aufgebaut

## Geplanter Abruf

Vercel Cron Jobs (`crons`) gelten inzwischen als Legacy; `vercel.json` nutzt
deshalb den Nachfolger `schedules` mit `path`-Ziel. Der Aufruf ist identisch
(GET, `Authorization: Bearer <CRON_SECRET>`), läuft 1x täglich um 05:00 UTC.

## Einrichtung

```bash
vercel link
vercel blob create-store wowfd-snapshots --access private --yes   # legt den Store an und verbindet ihn
vercel env add CRON_SECRET
vercel env add TSM_CSV_URL_EU
vercel env add TSM_CSV_URL_US
vercel env pull .env.local                 # holt BLOB_READ_WRITE_TOKEN
npm run dev
```

Variablen siehe `.env.example`. `BLOB_ACCESS` muss zum Typ des Stores passen
(`private` ist Standard).

## Konfiguration

- Welche Items übernommen werden: `TRACKED_ITEM_IDS` in `src/lib/config.ts`
  (leer = alle Zeilen der CSV).
- Die CSV braucht eine Kopfzeile mit einer ID-Spalte (`itemId`, `id` oder `item`).
  Optional: `name` sowie eine Zeitstempel-Spalte (`updatedAt`, `lastUpdated`, …).
  Fehlt der Zeitstempel, zählt der `Last-Modified`-Header der CSV, sonst die Abrufzeit.
  Alle übrigen numerischen Spalten werden als Werte gespeichert.
