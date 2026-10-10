import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PageAnalytics } from "./PageAnalytics";

const location = vi.hoisted(() => ({
  pathname: "/",
  params: {} as Record<string, string>,
}));
vi.mock("next/navigation", () => ({
  usePathname: () => location.pathname,
  useParams: () => location.params,
}));

const ROUTES = {
  "/experience/netdata": "/experience/[slug]",
  "/education/msc-applied-informatics": "/education/[slug]",
};

const HOME = { route: "/", path: "/" };
const NETDATA = { route: "/experience/[slug]", path: "/experience/netdata" };
const MSC = {
  route: "/education/[slug]",
  path: "/education/msc-applied-informatics",
};

/** Renders at `pathname`, then moves through `then`, as the URL would change. */
function visit(
  pathname: string,
  params: Record<string, string>,
  ...then: string[]
) {
  location.pathname = pathname;
  location.params = params;
  const { rerender } = render(<PageAnalytics sheetRoutes={ROUTES} />);
  for (const next of then) {
    location.pathname = next;
    // After pushState, Next.js still has the params of the page it loaded.
    rerender(<PageAnalytics sheetRoutes={ROUTES} />);
  }
}

/** The page views the package queued; its script never loads under jsdom. */
function pageviews() {
  return (window.vaq ?? [])
    .filter(([event]) => event === "pageview")
    .map(([, view]) => view);
}

afterEach(() => {
  delete window.va;
  delete window.vaq;
  document.head.querySelectorAll("script").forEach((script) => script.remove());
  vi.unstubAllEnvs();
});

describe("PageAnalytics", () => {
  it("reports a sheet opened in the page under its route, and not the return to / (decisions 171–172)", () => {
    visit("/", {}, NETDATA.path, "/", NETDATA.path, "/");
    expect(pageviews()).toEqual([HOME, NETDATA, NETDATA]);
  });

  it("counts / once after closing a sheet the page load opened (decision 172)", () => {
    visit(MSC.path, { slug: "msc-applied-informatics" }, "/", MSC.path, "/");
    expect(pageviews()).toEqual([MSC, HOME, MSC]);
  });

  it("takes any other path's route from its params, and counts / after it", () => {
    visit("/blog/hello", { slug: "hello" }, "/");
    expect(pageviews()).toEqual([
      { route: "/blog/[slug]", path: "/blog/hello" },
      HOME,
    ]);
  });

  it("sends nothing for moves between / and the section paths (decision 180)", () => {
    visit(
      "/",
      {},
      "/experience",
      "/education",
      "/",
      NETDATA.path,
      "/experience",
      "/writing",
    );
    expect(pageviews()).toEqual([HOME, NETDATA]);
  });

  it("counts a section path a page load or the 404 page arrives on, under its own path (decision 180)", () => {
    visit("/nope", {}, "/writing", "/contact");
    expect(pageviews()).toEqual([
      { route: "/nope", path: "/nope" },
      { route: "/writing", path: "/writing" },
    ]);
  });

  it("counts the home page once after closing a sheet the page load opened, whichever path it shows (decision 180)", () => {
    visit(
      MSC.path,
      { slug: "msc-applied-informatics" },
      "/",
      "/education",
      MSC.path,
      "/education",
    );
    expect(pageviews()).toEqual([MSC, HOME, MSC]);
  });

  it("passes the script the settings the Next.js component did", () => {
    vi.stubEnv("NEXT_PUBLIC_VERCEL_OBSERVABILITY_BASEPATH", "/_custom");
    vi.stubEnv(
      "NEXT_PUBLIC_VERCEL_OBSERVABILITY_CLIENT_CONFIG",
      JSON.stringify({ analytics: { viewEndpoint: "/views" } }),
    );
    visit("/", {});
    const script = document.head.querySelector("script");
    expect(script?.dataset).toMatchObject({
      sdkn: "@vercel/analytics/next",
      endpoint: "/_custom/insights",
      viewEndpoint: "/views",
      disableAutoTrack: "1",
    });
  });
});
