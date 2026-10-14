import type { RegionId } from "@/lib/nav";
import { regionEntryScript } from "@/lib/region-entry";

// Rendered after the home page's markup, so a fresh load is at its region before the first paint; after a client
// navigation React renders it without running it, and RegionScroll lands there instead (decisions 176, 182).
export function RegionEntry({ id }: { id: RegionId }) {
  return <script dangerouslySetInnerHTML={{ __html: regionEntryScript(id) }} />;
}
