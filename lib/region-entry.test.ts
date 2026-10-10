import { afterEach, describe, expect, it, vi } from "vitest";
import { regionEntryScript, regionPendingScript } from "./region-entry";

/** Runs the script as the browser would, for a navigation of `type`. */
function run(type: string | undefined) {
  vi.stubGlobal("performance", {
    getEntriesByType: () => (type ? [{ type }] : []),
  });
  const region = document.createElement("section");
  region.id = "writing";
  region.scrollIntoView = vi.fn();
  document.body.append(region);
  new Function(regionEntryScript("writing"))();
  return region.scrollIntoView;
}

/** Runs the `<head>` script as the browser would, on `path`, for a navigation of `type`. */
function runPending(path: string, type: string | undefined): boolean {
  history.replaceState(null, "", path);
  vi.stubGlobal("performance", {
    getEntriesByType: () => (type ? [{ type }] : []),
  });
  new Function(regionPendingScript())();
  return pending();
}

const pending = () =>
  document.documentElement.hasAttribute("data-region-pending");

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.replaceChildren();
  document.documentElement.removeAttribute("data-region-pending");
  history.replaceState(null, "", "/");
  delete window.__regionPlaced;
});

describe("regionEntryScript", () => {
  it("jumps to its region on a fresh navigation and marks the document placed (decision 176)", () => {
    expect(run("navigate")).toHaveBeenCalledWith({ behavior: "instant" });
    expect(window.__regionPlaced).toBe(true);
  });

  it.each(["reload", "back_forward", undefined])(
    "leaves the position to the browser on %s",
    (type) => {
      expect(run(type)).not.toHaveBeenCalled();
      expect(window.__regionPlaced).toBe(true);
    },
  );
});

describe("regionPendingScript", () => {
  it("keeps a fresh load of a section path hidden until its region's script has jumped (decision 186)", () => {
    expect(runPending("/writing", "navigate")).toBe(true);
    run("navigate");
    expect(pending()).toBe(false);
  });

  it.each(["/", "/experience/netdata", "/no-such-page"])(
    "never hides %s",
    (path) => {
      expect(runPending(path, "navigate")).toBe(false);
    },
  );

  it.each(["reload", "back_forward", undefined])(
    "never hides a section path on %s",
    (type) => {
      expect(runPending("/writing", type)).toBe(false);
    },
  );

  it("reveals the page once it is parsed, even if the region's script never ran", () => {
    expect(runPending("/contact", "navigate")).toBe(true);
    document.dispatchEvent(new Event("DOMContentLoaded"));
    expect(pending()).toBe(false);
  });
});
