import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WoW-Forever-Preise (TSM)",
  description: "Aktuelle TSM-Preise für WoW Forever und Verlauf für EU und US",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
