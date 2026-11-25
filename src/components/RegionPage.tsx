import type { Metadata } from "next";
import type { Region } from "@/lib/config";
import { toPricesView, type PricesView } from "@/lib/prices";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { getCurrentSnapshot } from "@/lib/tsm";
import PriceBoard from "./PriceBoard";

const path = (region: Region) => (region === "eu" ? "/" : "/us");
const title = (region: Region) =>
  `WoW Forever Auktionshauspreise ${region.toUpperCase()}: Kräuter, Bufffood, Righteous Orb`;
const description = (region: Region) =>
  `Aktuelle Auktionshauspreise für WoW Forever (${region.toUpperCase()}) aus TradeSkillMaster: ` +
  "alle Kräuter mit Farm-Zonen und Routen, Bufffood und Righteous Orb – mit Marktwert, " +
  "historischem Preis, Verkäufen pro Tag und Preisverlauf.";

export function regionMetadata(region: Region): Metadata {
  return {
    title: title(region),
    description: description(region),
    alternates: { canonical: path(region) },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: title(region),
      description: description(region),
      url: path(region),
      locale: "de_DE",
    },
  };
}

/** schema.org-Dataset, damit Suchmaschinen und Agents Inhalt, Stand und API finden. */
function jsonLd(region: Region, prices: PricesView | null) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: title(region),
    description: description(region),
    url: `${SITE_URL}${path(region)}`,
    inLanguage: "de",
    isAccessibleForFree: true,
    keywords: ["World of Warcraft Forever", "Auktionshaus", "Preise", "Kräuter", "Bufffood", "TSM"],
    spatialCoverage: region.toUpperCase(),
    ...(prices ? { dateModified: prices.tsmUpdatedAt } : {}),
    isBasedOn: "https://tradeskillmaster.com/public-data",
    variableMeasured: ["marketValue", "historical", "soldPerDay"],
    distribution: [
      {
        "@type": "DataDownload",
        encodingFormat: "application/json",
        contentUrl: `${SITE_URL}/api/prices?region=${region}`,
      },
    ],
  };
}

export default async function RegionPage({ region }: { region: Region }) {
  let prices: PricesView | null = null;
  try {
    prices = toPricesView(await getCurrentSnapshot(region));
  } catch (err) {
    // Ohne Serverdaten lädt die Seite die Preise im Browser nach.
    console.error(err);
  }

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd(region, prices)).replace(/</g, "\\u003c"),
        }}
      />
      <header>
        <h1>WoW-Forever-Preise {region.toUpperCase()}</h1>
        <p className="muted intro">
          Auktionshauspreise für World of Warcraft: Forever in der Region {region.toUpperCase()},
          täglich aus den öffentlichen Daten von TradeSkillMaster (TSM). Alle Preise in Gold (g),
          Silber (s) und Kupfer (c). <strong>marketValue</strong> ist der aktuelle Marktwert,{" "}
          <strong>historical</strong> der langfristige Durchschnitt, <strong>soldPerDay</strong>{" "}
          die verkaufte Menge pro Tag. Ein Klick auf eine Zeile zeigt den Preisverlauf, ein Klick
          auf den Namen kopiert ihn.
        </p>
      </header>
      {!prices && <noscript>Die Preise konnten nicht geladen werden.</noscript>}
      <PriceBoard region={region} initial={prices} />
      <footer className="muted">
        Daten: <a href="https://tradeskillmaster.com/public-data">TradeSkillMaster Public Data</a>
        {" · "}Maschinenlesbar: <a href={`/api/prices?region=${region}`}>/api/prices?region={region}</a>
        {" · "}<a href="/llms.txt">llms.txt</a>
      </footer>
    </main>
  );
}
