import { REGIONS, type RegionId, regionPath } from "./nav";

declare global {
  interface Window {
    /** Set by a section path's inline script: the document was placed while it loaded (decision 176). */
    __regionPlaced?: boolean;
  }
}

/** The script a section path's HTML runs while it is parsed, before the first paint (decision 176). */
export function regionEntryScript(id: RegionId): string {
  // Only a fresh navigation jumps; a reload, or a Back or Forward that reloads, leaves the browser to restore the exact position.
  return [
    "window.__regionPlaced=true;",
    'if(performance.getEntriesByType("navigation")[0]?.type==="navigate")',
    `document.getElementById(${JSON.stringify(id)})?.scrollIntoView({behavior:"instant"});`,
    // Placed, so the page can show (decision 186).
    'document.documentElement.removeAttribute("data-region-pending");',
  ].join("");
}

/** The `<head>` script that keeps a fresh load of a section path hidden until it is placed (decision 186). */
export function regionPendingScript(): string {
  // Only where the region's script will jump; DOMContentLoaded shows the page even if that script never runs.
  return [
    `if(${JSON.stringify(REGIONS.map(regionPath))}.includes(location.pathname)&&`,
    'performance.getEntriesByType("navigation")[0]?.type==="navigate"){',
    'document.documentElement.setAttribute("data-region-pending","");',
    'document.addEventListener("DOMContentLoaded",function(){document.documentElement.removeAttribute("data-region-pending")})',
    "}",
  ].join("");
}
