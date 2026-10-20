import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearGaCookies,
  cookieDomains,
  gaId,
  loadGtag,
  sendPageView,
} from "./gtag";

const TAG_SRC = "https://www.googletagmanager.com/gtag/js?id=G-TEST";

/** gtag queues Arguments objects; arrays compare more readably. */
function entries(): unknown[][] {
  return (window.dataLayer ?? []).map((entry) =>
    Array.from(entry as ArrayLike<unknown>),
  );
}

afterEach(() => {
  delete window.dataLayer;
  delete window.gtag;
  document.head.querySelectorAll("script").forEach((script) => script.remove());
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("gaId", () => {
  it("reads the ID from NEXT_PUBLIC_GA_ID", () => {
    vi.stubEnv("NEXT_PUBLIC_GA_ID", "G-TEST");
    expect(gaId()).toBe("G-TEST");
    vi.stubEnv("NEXT_PUBLIC_GA_ID", "");
    expect(gaId()).toBeUndefined();
  });
});

describe("loadGtag", () => {
  it("loads the tag once with consent defaults and no automatic page view", () => {
    loadGtag("G-TEST");
    loadGtag("G-TEST");
    expect(
      document.head.querySelectorAll(`script[src="${TAG_SRC}"]`),
    ).toHaveLength(1);
    expect(entries()).toEqual([
      [
        "consent",
        "default",
        {
          analytics_storage: "granted",
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
        },
      ],
      ["js", expect.any(Date)],
      ["config", "G-TEST", { send_page_view: false }],
    ]);
  });
});

describe("sendPageView", () => {
  it("sends a page view with the path and the tab title", () => {
    document.title = "Netdata — X";
    loadGtag("G-TEST");
    sendPageView("/experience/netdata");
    expect(entries().at(-1)).toEqual([
      "event",
      "page_view",
      {
        page_location: "http://localhost:3000/experience/netdata",
        page_title: "Netdata — X",
      },
    ]);
  });

  it("sends nothing before the tag is loaded", () => {
    sendPageView("/");
    expect(window.dataLayer).toBeUndefined();
  });
});

describe("clearGaCookies", () => {
  it("covers the host and every parent domain", () => {
    expect(cookieDomains("www.kapantzakis.gr")).toEqual([
      "www.kapantzakis.gr",
      "kapantzakis.gr",
    ]);
    expect(cookieDomains("kapantzakis.gr")).toEqual(["kapantzakis.gr"]);
    expect(cookieDomains("localhost")).toEqual([]);
  });

  it("expires both GA cookies on jsdom's localhost", () => {
    const set = vi.spyOn(document, "cookie", "set");
    clearGaCookies("G-TEST");
    const written = set.mock.calls.map(([value]) => value);
    expect(written).toHaveLength(2);
    expect(written[0]).toMatch(/^_ga=; path=\/; expires=Thu, 01 Jan 1970/);
    expect(written[1]).toMatch(/^_ga_TEST=; path=\/; expires=Thu, 01 Jan 1970/);
  });
});
