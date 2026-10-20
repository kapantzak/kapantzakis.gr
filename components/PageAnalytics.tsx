"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useConsent } from "@/lib/consent";
import { loadGtag, sendPageView } from "@/lib/gtag";
import { isHomePath } from "@/lib/nav";

type Tracked = {
  path: string;
  onSheet: boolean;
  home: boolean;
  homeCounted: boolean;
  /** The path of the page view to report, or null for one that does not count. */
  view: string | null;
  granted: boolean;
};

function track(
  previous: Tracked | null,
  path: string,
  onSheet: boolean,
  granted: boolean,
): Tracked {
  const home = isHomePath(path);
  // `/` and the section paths are one page, so moving between them is not a view (decision 180), nor is closing a
  // sheet over the home page once it has counted (decision 172).
  const counts = !(
    home &&
    (previous?.home || (previous?.onSheet && previous.homeCounted))
  );
  return {
    path,
    onSheet,
    home,
    homeCounted: (previous?.homeCounted ?? false) || home,
    view: counts ? path : null,
    granted,
  };
}

// GA's own history-based page views are off, since the path follows the scroll (decision 174); this component
// sends each page view by the site's counting rules instead (decisions 172, 180, 217), and only with consent.
export function PageAnalytics({
  gaId,
  sheetPaths,
}: {
  gaId: string;
  /** Every sheet path, from lib/sheets.ts. */
  sheetPaths: string[];
}) {
  const path = usePathname();
  const granted = useConsent()?.choice === "granted";
  const onSheet = sheetPaths.includes(path);
  const [tracked, setTracked] = useState(() =>
    track(null, path, onSheet, granted),
  );
  // Adjusted while rendering, so each change is seen once, with the state before it. Accepting restarts the count
  // as a page load on the path in view, since nothing before it was sent (decision 224).
  if (tracked.granted !== granted) {
    setTracked(track(granted ? null : tracked, path, onSheet, granted));
  } else if (tracked.path !== path) {
    setTracked(track(tracked, path, onSheet, granted));
  }

  // Remembers what was sent, so React's development re-run of effects never sends a view twice.
  const sent = useRef<Tracked | null>(null);
  // An effect, so a sheet's tab title, set in SheetHost's earlier effect (decision 169), is already in place.
  useEffect(() => {
    if (!tracked.granted || sent.current === tracked) return;
    sent.current = tracked;
    loadGtag(gaId);
    if (tracked.view) sendPageView(tracked.view);
  }, [tracked, gaId]);

  return null;
}
