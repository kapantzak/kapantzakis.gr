import type { MetadataRoute } from "next";
import { profile } from "@/content/profile";
import { sheetsOf } from "@/lib/sheets";
import { SITE_URL } from "@/lib/site";

// The home page and each sheet's own path (decision 168).
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL },
    ...sheetsOf(profile).map(({ path }) => ({ url: `${SITE_URL}${path}` })),
  ];
}
