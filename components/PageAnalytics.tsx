"use client";

import { computeRoute } from "@vercel/analytics";
import { Analytics } from "@vercel/analytics/react";
import { useParams, usePathname } from "next/navigation";
import { useState } from "react";

type View = { route: string; path: string };

type Tracked = {
  path: string;
  onSheet: boolean;
  homeCounted: boolean;
  /** The page view to report, or null for one that does not count. */
  view: View | null;
};

function track(
  previous: Tracked | null,
  path: string,
  route: string,
  onSheet: boolean,
): Tracked {
  const home = path === "/";
  // Closing a sheet over a home page already counted is not a new view of it (decision 172).
  const counts = !(home && previous?.onSheet && previous.homeCounted);
  return {
    path,
    onSheet,
    homeCounted: (previous?.homeCounted ?? false) || home,
    view: counts ? { route, path } : null,
  };
}

// Replaces @vercel/analytics/next's component, which reads the route from useParams(): after the sheet host's
// pushState those are still the loaded page's, so a sheet opened in the page was reported by its literal path
// (decision 171).
export function PageAnalytics({
  sheetRoutes,
}: {
  /** Each sheet path's route, from lib/sheets.ts. */
  sheetRoutes: Record<string, string>;
}) {
  const path = usePathname();
  const params = useParams<Record<string, string | string[]>>();
  const sheetRoute = sheetRoutes[path];
  const route = sheetRoute ?? computeRoute(path, params) ?? path;
  const onSheet = sheetRoute !== undefined;
  const [tracked, setTracked] = useState(() =>
    track(null, path, route, onSheet),
  );
  // Adjusted while rendering, so each path change is seen once, with the path before it.
  if (tracked.path !== path) setTracked(track(tracked, path, route, onSheet));

  // The React component sends a page view when route or path changes and both are set; null skips one.
  return (
    <Analytics
      route={tracked.view?.route ?? null}
      path={tracked.view?.path ?? null}
      framework="next"
      basePath={process.env.NEXT_PUBLIC_VERCEL_OBSERVABILITY_BASEPATH}
      configString={process.env.NEXT_PUBLIC_VERCEL_OBSERVABILITY_CLIENT_CONFIG}
    />
  );
}
