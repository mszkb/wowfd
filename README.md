# wowfd

WoW-Classic-Preise aus der TSM-CSV, mit Verlauf. Next.js (App Router) auf Vercel,
Persistenz ausschließlich in Vercel Blob.

## Endpunkte

| Route | Zweck |
| --- | --- |
| `GET /api/prices?region=eu` | Holt die CSV serverseitig (10 Min gecacht), filtert die Items, speichert bei neuem TSM-Datenstand einen Snapshot. Antwort: `items` (mit `category`, `rank`), `categories`, `tsmUpdatedAt`, `fetchedAt`, `stored`. Mit `&refresh=1` am Cache vorbei (max. 1x pro Minute je Region). |
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
vercel env pull .env.local                 # holt BLOB_READ_WRITE_TOKEN
npm run dev
```

Variablen siehe `.env.example`. `BLOB_ACCESS` muss zum Typ des Stores passen
(`private` ist Standard).

## Konfiguration

- Quelle: `https://public-data.tradeskillmaster.com/classic/{region}/region/items.csv`
  (öffentlich, ohne Key; Spalten `itemId,name,marketValue,historical,avgSalePrice,saleRate,soldPerDay,updatedAt`,
  Preise in Kupfer, regionsweite Statistik über alle Classic-Realms). Per `TSM_CSV_URL_EU` /
  `TSM_CSV_URL_US` überschreibbar, z. B. mit einer Realm-Datei
  `…/classic/{region}/realm/{realm}/items.csv`, die auch `minBuyout` enthält.
- Welche Items übernommen werden und in welcher Kategorie sie erscheinen:
  `CATEGORIES` in `src/lib/config.ts`. Icons liegen unter `public/icons/{itemId}.jpg`.
  `TSM_ITEM_IDS` (kommagetrennt) überschreibt die Liste.
- Der Datenstand kommt aus der Spalte `updatedAt`; fehlt sie, zählt der
  `Last-Modified`-Header, sonst die Abrufzeit.
