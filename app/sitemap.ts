import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// The site is a single page (decision 30); posts live on other sites.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE_URL }];
}
