import type { MetadataRoute } from "next";
import { profile } from "@/content/profile";
import { sheetsOf } from "@/lib/sheets";
import { SITE_URL } from "@/lib/site";

// The home page, the privacy page, the CV page and each sheet's own path (decisions 168, 221, 233).
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL },
    { url: `${SITE_URL}/privacy` },
    { url: `${SITE_URL}/cv` },
    ...sheetsOf(profile).map(({ path }) => ({ url: `${SITE_URL}${path}` })),
  ];
}
