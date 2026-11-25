import RegionPage, { regionMetadata } from "@/components/RegionPage";

// Die Seite wird mit Daten vorgerendert und alle 10 Minuten erneuert.
export const revalidate = 600;

export const metadata = regionMetadata("eu");

export default function Page() {
  return <RegionPage region="eu" />;
}
