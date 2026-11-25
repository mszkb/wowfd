import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // /api/cron ist ohnehin per Secret geschützt; die Daten-API darf gelesen werden.
    rules: [{ userAgent: "*", allow: "/", disallow: "/api/cron" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
