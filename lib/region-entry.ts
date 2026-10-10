import type { RegionId } from "./nav";

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
  ].join("");
}
